import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";

import {
  applyUpdates,
  collectUpdateTargets,
  run,
  type CliConfig,
  type CliInfo,
  type UpdateTarget,
} from "../agent-cli-update.ts";

const tempDir = join(process.cwd(), ".tmp", "agent-cli-update-tests");
const tempPaths = new Set<string>();

async function waitForStartedNames(path: string, expectedNames: string[]) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const text = await readFile(path, "utf8");
      const names = text
        .trim()
        .split("\n")
        .filter(Boolean)
        .sort();

      if (names.length === expectedNames.length && names.every((name, index) => name === expectedNames[index])) {
        return;
      }
    } catch {}

    await Bun.sleep(20);
  }

  throw new Error(`Timed out waiting for ${path} to contain ${expectedNames.join(", ")}`);
}

function createSleepingUpdate(name: CliInfo["name"], markerPath: string): UpdateTarget {
  const cli: CliConfig = {
    name,
    help: ["bun", "--version"],
    version: ["bun", "--version"],
    update: () => [
      "bun",
      "-e",
      `import { appendFile } from "node:fs/promises";
await appendFile(${JSON.stringify(markerPath)}, ${JSON.stringify(`${name}\n`)});
await new Promise((resolve) => setTimeout(resolve, 10_000));`,
    ],
  };

  const info: CliInfo = {
    name,
    installedVersion: "1.0.0",
    latestVersion: "2.0.0",
    shouldUpdate: true,
  };

  return { cli, info };
}

afterEach(async () => {
  await Promise.all(
    [...tempPaths].map(async (path) => {
      await rm(path, { force: true });
      tempPaths.delete(path);
    }),
  );
});

describe("agent-cli-update", () => {
  test("collectUpdateTargets keeps config-driven extension mapping", () => {
    const infos: CliInfo[] = [
      {
        name: "claude",
        installedVersion: "1.0.0",
        latestVersion: null,
        shouldUpdate: true,
      },
      {
        name: "codex",
        installedVersion: "1.0.0",
        latestVersion: "2.0.0",
        shouldUpdate: true,
      },
      {
        name: "copilot",
        installedVersion: "1.0.0",
        latestVersion: "1.0.0",
        shouldUpdate: false,
      },
      {
        name: "opencode",
        installedVersion: "1.0.0",
        latestVersion: "2.0.0",
        shouldUpdate: true,
        error: "failed to inspect",
      },
    ];

    const targets = collectUpdateTargets(infos);

    expect(targets.map((target) => target.info.name)).toEqual(["claude", "codex"]);
    expect(targets.map((target) => target.cli.name)).toEqual(["claude", "codex"]);
  });

  test("run aborts a long-running subprocess with SIGINT", async () => {
    const controller = new AbortController();
    const pending = run(
      ["bun", "-e", `await new Promise((resolve) => setTimeout(resolve, 10_000));`],
      { signal: controller.signal },
    );

    setTimeout(() => controller.abort(), 50);

    const result = await pending;
    expect(result.ok).toBe(false);
    expect(result.signalCode).toBe("SIGINT");
  });

  test("applyUpdates cancels all in-flight updates", async () => {
    await mkdir(tempDir, { recursive: true });
    const markerPath = join(tempDir, `starts-${Date.now()}.log`);
    tempPaths.add(markerPath);

    const targets = [
      createSleepingUpdate("claude", markerPath),
      createSleepingUpdate("codex", markerPath),
    ];

    const controller = new AbortController();
    const pending = applyUpdates(targets, { signal: controller.signal });

    await waitForStartedNames(markerPath, ["claude", "codex"]);
    controller.abort();

    const results = await pending;
    const starts = (await readFile(markerPath, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .sort();

    expect(starts).toEqual(["claude", "codex"]);
    expect(results).toHaveLength(2);
    expect(results.every((result) => result.cancelled)).toBe(true);
  });
});
