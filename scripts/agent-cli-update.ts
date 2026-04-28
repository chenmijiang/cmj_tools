import { $ } from "bun";

export type CliName = "claude" | "codex" | "opencode";
type Command = readonly string[];

export type CliConfig = {
  name: CliName;
  help: Command;
  version: Command;
  latest?: Command;
  update: (latest?: string) => Command;
};

type CommandResult = {
  ok: boolean;
  command: string;
  output: string;
  signalCode: NodeJS.Signals | null;
};

export type CliInfo = {
  name: CliName;
  installedVersion: string | null;
  latestVersion: string | null;
  shouldUpdate: boolean;
  note?: string;
  error?: string;
};

export type UpdateTarget = {
  cli: CliConfig;
  info: CliInfo;
};

type RunOptions = { signal?: AbortSignal };

type UpdateResult = {
  name: CliName;
  ok: boolean;
  message: string;
  durationMs: number;
  cancelled?: boolean;
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
  opencode: {
    name: "opencode",
    help: ["opencode", "--help"],
    version: ["opencode", "--version"],
    latest: ["bun", "pm", "view", "opencode-ai", "version"],
    update: (latest) => ["bun", "add", "-g", `opencode-ai@${latest}`],
  },
};

const versionOf = (text: string) =>
  text
    .match(/\bv?\d+(?:\.\d+)+(?:[-+][0-9A-Za-z.-]+)?\b/)?.[0]
    ?.replace(/^v/, "") ?? null;
const compareVersion = (left: string, right: string) =>
  left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
const CANCELLED_MESSAGE = "cancelled by SIGINT";
const now = () => performance.now();
const elapsedMs = (startedAt: number) =>
  Math.max(0, Math.round(now() - startedAt));

function formatDuration(durationMs: number): string {
  if (durationMs >= 10_000) return `${(durationMs / 1000).toFixed(1)}s`;
  if (durationMs >= 1_000) return `${(durationMs / 1000).toFixed(2)}s`;
  return `${durationMs}ms`;
}

async function streamText(stream: unknown): Promise<string> {
  if (!(stream instanceof ReadableStream)) return "";
  return (await new Response(stream).text()).trim();
}

function commandTextOf(command: Command): string {
  return command.map((part) => $.escape(part)).join(" ");
}

export async function run(
  command: Command,
  options: RunOptions = {},
): Promise<CommandResult> {
  const proc = Bun.spawn({
    cmd: [...command],
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    signal: options.signal,
    killSignal: "SIGINT",
  });

  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    streamText(proc.stdout),
    streamText(proc.stderr),
  ]);

  return {
    ok: exitCode === 0,
    command: commandTextOf(command),
    output: [stdout, stderr].filter(Boolean).join("\n").trim(),
    signalCode: proc.signalCode,
  };
}

function fail(
  cli: CliConfig,
  error: string,
  installedVersion: string | null = null,
): CliInfo {
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

    if (!help.ok) return fail(cli, help.output || help.command);

    const installedVersion = current.ok ? versionOf(current.output) : null;
    if (!installedVersion) return fail(cli, current.output || current.command);

    if (!latest) {
      return {
        name: cli.name,
        installedVersion,
        latestVersion: null,
        shouldUpdate: true,
        note: "latest version resolved by update command",
      };
    }

    const latestVersion = latest.ok ? versionOf(latest.output) : null;
    if (!latestVersion)
      return fail(cli, latest.output || latest.command, installedVersion);

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

function cancelledResult(name: CliName, durationMs: number): UpdateResult {
  return {
    name,
    ok: false,
    cancelled: true,
    message: CANCELLED_MESSAGE,
    durationMs,
  };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isCancelled(error?: unknown, result?: CommandResult): boolean {
  return (
    result?.signalCode === "SIGINT" ||
    (error instanceof Error && error.name === "AbortError")
  );
}

async function updateCli(
  cli: CliConfig,
  info: CliInfo,
  signal?: AbortSignal,
): Promise<UpdateResult> {
  const startedAt = now();
  let result: CommandResult | undefined;

  try {
    result = await run(cli.update(info.latestVersion ?? undefined), { signal });
  } catch (error) {
    return isCancelled(error)
      ? cancelledResult(cli.name, elapsedMs(startedAt))
      : {
          name: cli.name,
          ok: false,
          message: messageOf(error),
          durationMs: elapsedMs(startedAt),
        };
  }

  if (isCancelled(undefined, result)) {
    return cancelledResult(cli.name, elapsedMs(startedAt));
  }

  return {
    name: cli.name,
    ok: result.ok,
    durationMs: elapsedMs(startedAt),
    message: result.ok
      ? info.latestVersion
        ? `updated to ${info.latestVersion}`
        : "update command finished"
      : result.output || result.command,
  };
}

export function collectUpdateTargets(
  infos: readonly CliInfo[],
): UpdateTarget[] {
  return infos
    .filter((info) => info.shouldUpdate && !info.error)
    .map((info) => ({ cli: CLIS[info.name], info }));
}

export async function applyUpdates(
  targets: readonly UpdateTarget[],
  options: { signal?: AbortSignal } = {},
): Promise<UpdateResult[]> {
  return Promise.all(
    targets.map(({ cli, info }) => updateCli(cli, info, options.signal)),
  );
}

function statusOf(info: CliInfo): string {
  if (info.error) return "error";
  if (info.shouldUpdate && !info.latestVersion) return "update-check-required";
  if (info.shouldUpdate) return "needs-update";
  return "up-to-date";
}

function updateStatusOf(result: UpdateResult): string {
  if (result.cancelled) return "CANCELLED";
  return result.ok ? "OK" : "ERROR";
}

function createCancellation() {
  const controller = new AbortController();
  let cancelled = false;

  const onSigint = () => {
    if (cancelled) {
      process.exit(130);
    }

    cancelled = true;
    process.exitCode = 130;
    console.log("\nCancellation requested. Stopping active updates...");
    controller.abort();
  };

  process.on("SIGINT", onSigint);

  return {
    signal: controller.signal,
    cancelled: () => cancelled,
    dispose: () => process.off("SIGINT", onSigint),
  };
}

export async function main() {
  const startedAt = now();
  try {
    console.log("Checking Agent CLIs...\n");
    const clis = Object.values(CLIS);
    const infos = await Promise.all(clis.map(inspectCli));

    console.log("Agent CLI status:");
    infos.forEach((info) => {
      console.log(
        `[${info.name}] ${statusOf(info)} | installed=${info.installedVersion ?? "unknown"} | latest=${info.latestVersion ?? "n/a"}${info.note ? ` | ${info.note}` : ""}${info.error ? ` | ${info.error}` : ""}`,
      );
    });

    const targets = collectUpdateTargets(infos);

    if (!targets.length) {
      process.exitCode = infos.some((info) => info.error) ? 1 : 0;
      return;
    }

    console.log("\nApplying updates:");
    const cancellation = createCancellation();

    try {
      const updates = await applyUpdates(targets, {
        signal: cancellation.signal,
      });
      updates.forEach((item) =>
        console.log(
          `[${item.name}] ${updateStatusOf(item)} | ${item.message} | ${formatDuration(item.durationMs)}`,
        ),
      );

      if (cancellation.cancelled()) {
        return;
      }

      if (
        infos.some((info) => info.error) ||
        updates.some((item) => !item.ok)
      ) {
        process.exitCode = 1;
      }
    } finally {
      cancellation.dispose();
    }
  } finally {
    console.log(`\nTotal duration: ${formatDuration(elapsedMs(startedAt))}`);
  }
}

if (import.meta.main) await main();
