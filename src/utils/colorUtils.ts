/**
 * Converts a hex or rgb color string to an HSL string suitable for Tailwind CSS variables.
 * Output format: "H S% L%"
 */
export function colorToHsl(color: string): string | null {
  if (!color) return null;
  color = color.trim().toLowerCase();

  let r = 0, g = 0, b = 0;

  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      r = parseInt(match[1], 10) / 255;
      g = parseInt(match[2], 10) / 255;
      b = parseInt(match[3], 10) / 255;
    } else {
      return null;
    }
  } else if (color.startsWith('#') || /^[0-9a-f]{3,6}$/i.test(color)) {
    let hex = color.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map((char) => char + char).join('');
    }
    if (hex.length !== 6) return null;
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else {
    return null;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const roundedH = Math.round(h * 360);
  const roundedS = Math.round(s * 100);
  const roundedL = Math.round(l * 100);

  return `${roundedH} ${roundedS}% ${roundedL}%`;
}
