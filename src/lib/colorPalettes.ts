export interface ColorPalette {
  id: string;
  name: string;
  light: string; // Hex or CSS color string for Light Mode
  dark: string; // Hex or CSS color string for Dark Mode
}

export const PRESET_COLOR_PALETTES: ColorPalette[] = [
  {
    id: "cream-midnight",
    name: "Warm Cream & Midnight",
    light: "#fbf9f4",
    dark: "#141416",
  },
  {
    id: "parchment-espresso",
    name: "Parchment & Espresso",
    light: "#f7f3ec",
    dark: "#181412",
  },
  {
    id: "sage-forest",
    name: "Soft Sage & Forest Shadow",
    light: "#f2f6f3",
    dark: "#0e1814",
  },
  {
    id: "lavender-twilight",
    name: "Lavender & Twilight",
    light: "#f7f5fa",
    dark: "#16131b",
  },
  {
    id: "ocean-abyss",
    name: "Ocean Mist & Deep Abyss",
    light: "#f1f6f9",
    dark: "#0e161f",
  },
  {
    id: "rose-ruby",
    name: "Blush Rose & Dark Ruby",
    light: "#fbf4f5",
    dark: "#1b1214",
  },
  {
    id: "slate-pitch",
    name: "Slate Fog & Charcoal",
    light: "#f2f4f7",
    dark: "#111215",
  },
  {
    id: "amber-obsidian",
    name: "Golden Amber & Obsidian",
    light: "#fdf8f2",
    dark: "#1a1510",
  },
];
