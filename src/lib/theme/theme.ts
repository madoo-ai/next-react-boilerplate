export const themes = ["light", "dark", "system"] as const;

export type Theme = (typeof themes)[number];

export const themeCookieName = "theme";

export const defaultTheme: Theme = "system";

export function isTheme(value: string | undefined | null): value is Theme {
  return !!value && themes.includes(value as Theme);
}
