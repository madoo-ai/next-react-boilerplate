import { COLOR_THEME_OPTIONS, type ColorThemeId } from "./theme-options";

export const colorThemeCookieName = "color-theme";

export const defaultColorTheme: ColorThemeId = "default";

export function isColorTheme(
  value: string | undefined | null,
): value is ColorThemeId {
  return !!value && COLOR_THEME_OPTIONS.some((theme) => theme.id === value);
}
