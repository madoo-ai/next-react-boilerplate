export const themeModes = ["light", "dark", "system"] as const;

export type Theme = (typeof themeModes)[number];

export const themeCookieName = "theme";

export const defaultTheme: Theme = "system";

export function isTheme(value: string | undefined | null): value is Theme {
  return !!value && themeModes.includes(value as Theme);
}
