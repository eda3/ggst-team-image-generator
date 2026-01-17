export interface ParsedArgs {
  command: string;
  teamName?: string;
  members?: string;
  output?: string;
  layout?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  backgroundImage?: string;
  tournamentName?: string;
  help?: boolean;
  version?: boolean;
  list?: boolean;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

function getNextArg(args: string[], index: number, optionName: string): string {
  if (index + 1 >= args.length) {
    throw new ParseError(`${optionName} オプションには値が必要です`);
  }
  const value = args[index + 1];
  if (value.startsWith("-")) {
    throw new ParseError(`${optionName} オプションには値が必要です`);
  }
  return value;
}

function parsePositiveInt(value: string, optionName: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new ParseError(`${optionName} には数値を指定してください: "${value}"`);
  }
  if (parsed <= 0) {
    throw new ParseError(`${optionName} には正の数値を指定してください: ${parsed}`);
  }
  return parsed;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const result: ParsedArgs = {
    command: "",
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === "generate" || arg === "list") {
      result.command = arg;
      i++;
      continue;
    }

    if (arg === "-h" || arg === "--help") {
      result.help = true;
      i++;
      continue;
    }

    if (arg === "-v" || arg === "--version") {
      result.version = true;
      i++;
      continue;
    }

    if (arg === "-t" || arg === "--team") {
      result.teamName = getNextArg(args, i, "--team");
      i += 2;
      continue;
    }

    if (arg === "-m" || arg === "--members") {
      result.members = getNextArg(args, i, "--members");
      i += 2;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      result.output = getNextArg(args, i, "--output");
      i += 2;
      continue;
    }

    if (arg === "-l" || arg === "--layout") {
      const layout = getNextArg(args, i, "--layout");
      if (layout !== "horizontal" && layout !== "vertical") {
        throw new ParseError(
          `--layout には "horizontal" または "vertical" を指定してください: "${layout}"`
        );
      }
      result.layout = layout;
      i += 2;
      continue;
    }

    if (arg === "--width") {
      const value = getNextArg(args, i, "--width");
      result.width = parsePositiveInt(value, "--width");
      i += 2;
      continue;
    }

    if (arg === "--height") {
      const value = getNextArg(args, i, "--height");
      result.height = parsePositiveInt(value, "--height");
      i += 2;
      continue;
    }

    if (arg === "-b" || arg === "--background") {
      result.backgroundImage = getNextArg(args, i, "--background");
      i += 2;
      continue;
    }

    if (arg === "-e" || arg === "--event") {
      result.tournamentName = getNextArg(args, i, "--event");
      i += 2;
      continue;
    }

    i++;
  }

  return result;
}
