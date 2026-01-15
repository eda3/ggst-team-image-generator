export interface ParsedArgs {
  command: string;
  teamName?: string;
  members?: string;
  output?: string;
  layout?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  help?: boolean;
  version?: boolean;
  list?: boolean;
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
      result.teamName = args[++i];
      i++;
      continue;
    }

    if (arg === "-m" || arg === "--members") {
      result.members = args[++i];
      i++;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      result.output = args[++i];
      i++;
      continue;
    }

    if (arg === "-l" || arg === "--layout") {
      const layout = args[++i];
      if (layout === "horizontal" || layout === "vertical") {
        result.layout = layout;
      }
      i++;
      continue;
    }

    if (arg === "--width") {
      result.width = parseInt(args[++i], 10);
      i++;
      continue;
    }

    if (arg === "--height") {
      result.height = parseInt(args[++i], 10);
      i++;
      continue;
    }

    i++;
  }

  return result;
}
