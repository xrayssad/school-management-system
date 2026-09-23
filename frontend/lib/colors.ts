export const colors = {
  primary: "#18453B",
  deep:    "#0F2F28",
  sage:    "#8FD9BA",
  paper:   "#F0F5F2",
  soft:    "#E4EFE9",
  ink:     "#1A231F",
  stone:   "#4A554F",
  line:    "#C5D4CC",
  white:   "#FFFFFF",
} as const;

export type ColorKey = keyof typeof colors;
