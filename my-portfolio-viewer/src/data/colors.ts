export const hexToRgb = (hex: string) => [1, 3, 5].map((start: number) => Number(`0x${hex.slice(start, start + 2)}`));

export const rgbToHsl = (rgb: number[]) => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const d = max - min;
  const l = (min + max) / 2;
  let h = 0;
  let s = 0;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    s = l > 0.5 ? d / (2 - d) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d; break;
      case g: h = 2.0 + (b - r) / d; break;
      case b: h = 4.0 + (r - g) / d; break;
      default: h = 0; break;
    }
  }

  h *= 60;

  return [(h + 360) % 360, s, l];
};

export const hslToRgb = (hsl: number[]) => {
  const h = hsl[0];
  const s = hsl[1];
  const l = hsl[2];

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
};

export const rgbToHex = (rgb: number[]) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return rgb.map((v) => componentToHex(v)).reduce((p, cu) => `${p}${cu}`, '#');
};

export const hexToHsl = (hex: string): number[] => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: number[]): string => rgbToHex(hslToRgb(hsl));

export const COLOR_SET1 = [
  '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff',
  '#ff00ff', '#ff0080',
];
export const COLOR_SET2 = [
  '#b30000', '#7c1158', '#4421af', '#1a53ff', '#0d88e6', '#00b7c7', '#5ad45a', '#8be04e', '#ebdc78',
];
export const COLOR_SET3 = [
  '#e60049', '#0bb4ff', '#50e991', '#e6d800', '#9b19f5', '#ffa300', '#dc0ab4', '#b3d4ff', '#00bfa0',
];
