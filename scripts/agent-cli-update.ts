import { $ } from "bun";

type CliName = "claude" | "codex" | "copilot" | "opencode";
type Command = readonly string[];

type CliConfig = {
  name: CliName;
  help: Command;
  version: Command;
  latest?: Command;
  update: (latest?: string) => Command;
};

type CommandResult = {
  ok: boolean;
  command: string;
  stdout: string;
  stderr: string;
};

type CliInfo = {
  name: CliName;
  installedVersion: string | null;
  latestVersion: string | null;
  shouldUpdate: boolean;
  note?: string;
  error?: string;
};

type UpdateResult = {
  name: CliName;
  ok: boolean;
  message: string;
};

const CLIS: Record<CliName, CliConfig> = {
  claude: {
    name: "claude",
    help: ["claude", "--help"],
    version: ["claude", "--version"],
    update: () => ["claude", "update"],
  },
  codex: {
    name: "codex",
    help: ["codex", "--help"],
    version: ["codex", "--version"],
    latest: ["bun", "pm", "view", "@openai/codex", "version"],
    update: (latest) => ["bun", "add", "-g", `@openai/codex@${latest}`],
  },
  copilot: {
    name: "copilot",
    help: ["copilot", "help"],
    version: ["copilot", "version"],
    latest: ["bun", "pm", "view", "@github/copilot", "version"],
    update: (latest) => ["bun", "add", "-g", `@github/copilot@${latest}`],
  },
  opencode: {
    name: "opencode",
    help: ["opencode", "--help"],
    version: ["opencode", "--version"],
    latest: ["bun", "pm", "view", "opencode-ai", "version"],
    update: (latest) => ["bun", "add", "-g", `opencode-ai@${latest}`],
  },
};

const textOf = ({ stdout, stderr }: CommandResult) => [stdout, stderr].filter(Boolean).join("\n").trim();
const versionOf = (text: string) => text.match(/\bv?\d+(?:\.\d+)+(?:[-+][0-9A-Za-z.-]+)?\b/)?.[0]?.replace(/^v/, "") ?? null;
const compareVersion = (left: string, right: string) =>
  left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });

async function run(command: Command): Promise<CommandResult> {
  const text = command.map((part) => $.escape(part)).join(" ");
  const result = await $`${{ raw: text }}`.nothrow().quiet();

  return {
    ok: result.exitCode === 0,
    command: text,
    stdout: result.stdout.toString().trim(),
    stderr: result.stderr.toString().trim(),
  };
}

function fail(cli: CliConfig, error: string, installedVersion: string | null = null): CliInfo {
  return {
    name: cli.name,
    installedVersion,
    latestVersion: null,
    shouldUpdate: false,
    error,
  };
}

async function inspectCli(cli: CliConfig): Promise<CliInfo> {
  try {
    const [help, current, latest] = await Promise.all([
      run(cli.help),
      run(cli.version),
      cli.latest ? run(cli.latest) : Promise.resolve(null),
    ]);

    if (!help.ok) return fail(cli, textOf(help) || help.command);

    const installedVersion = current.ok ? versionOf(textOf(current)) : null;
    if (!installedVersion) return fail(cli, textOf(current) || current.command);

    if (!latest) {
      return {
        name: cli.name,
        installedVersion,
        latestVersion: null,
        shouldUpdate: true,
        note: "latest version resolved by update command",
      };
    }

    const latestVersion = latest.ok ? versionOf(textOf(latest)) : null;
    if (!latestVersion) return fail(cli, textOf(latest) || latest.command, installedVersion);

    return {
      name: cli.name,
      installedVersion,
      latestVersion,
      shouldUpdate: compareVersion(installedVersion, latestVersion) < 0,
    };
  } catch (error) {
    return fail(cli, error instanceof Error ? error.message : String(error));
  }
}

async function updateCli(cli: CliConfig, info: CliInfo): Promise<UpdateResult> {
  try {
    const result = await run(cli.update(info.latestVersion ?? undefined));
    return {
      name: cli.name,
      ok: result.ok,
      message: result.ok
        ? info.latestVersion
          ? `updated to ${info.latestVersion}`
          : "update command finished"
        : textOf(result) || result.command,
    };
  } catch (error) {
    return {
      name: cli.name,
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function statusOf(info: CliInfo): string {
  if (info.error) return "error";
  if (info.shouldUpdate && !info.latestVersion) return "update-check-required";
  if (info.shouldUpdate) return "needs-update";
  return "up-to-date";
}

async function main() {
  console.log("Checking Agent CLIs...\n");
  const clis = Object.values(CLIS);
  const infos = await Promise.all(clis.map(inspectCli));

  console.log("Agent CLI status:");
  infos.forEach((info) => {
    console.log(
      `[${info.name}] ${statusOf(info)} | installed=${info.installedVersion ?? "unknown"} | latest=${info.latestVersion ?? "n/a"}${info.note ? ` | ${info.note}` : ""}${info.error ? ` | ${info.error}` : ""}`,
    );
  });

  const targets = infos.filter((info) => info.shouldUpdate && !info.error);
  if (!targets.length) {
    process.exitCode = infos.some((info) => info.error) ? 1 : 0;
    return;
  }

  console.log("\nApplying updates:");
  const updates = await Promise.all(targets.map((info) => updateCli(CLIS[info.name], info)));
  updates.forEach((item) => console.log(`[${item.name}] ${item.ok ? "OK" : "ERROR"} | ${item.message}`));

  if (infos.some((info) => info.error) || updates.some((item) => !item.ok)) {
    process.exitCode = 1;
  }
}

if (import.meta.main) await main();
