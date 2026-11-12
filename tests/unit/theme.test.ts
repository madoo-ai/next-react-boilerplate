import { describe, expect, it } from "vitest";

import opencodeThemes from "@/lib/theme/opencode-themes.json";
import { isColorTheme } from "@/lib/theme/color-theme";
import { COLOR_THEME_OPTIONS } from "@/lib/theme/theme-options";

describe("color themes", () => {
  it("includes the default and every OpenCode theme", () => {
    const ids = COLOR_THEME_OPTIONS.map((theme) => theme.id);

    expect(ids[0]).toBe("default");
    expect(ids).toHaveLength(opencodeThemes.themes.length + 1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("validates theme cookies", () => {
    expect(isColorTheme("default")).toBe(true);
    expect(isColorTheme("dracula")).toBe(true);
    expect(isColorTheme("not-a-theme")).toBe(false);
    expect(isColorTheme(undefined)).toBe(false);
  });
});
