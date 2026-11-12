export function translateFieldError(
  message: string | undefined,
  t: (key: string) => string,
): string | undefined {
  if (!message) return undefined;

  if (message.startsWith("validation.")) {
    return t(message.replace("validation.", ""));
  }

  return message;
}
