import baseStyled, { ThemedStyledInterface } from "styled-components";

// New Dark Theme
const dataEditorBaseTheme = {
  accentColor: "#4F5DFF",
  accentMedium: "rgba(79,118,255,0.5)",
  accentLight: "rgba(79, 93, 255, 0.1)",

  textDark: "#313139",
  textMedium: "#737383",
  textLight: "#B2B2C0",
  textHeader: "#737383",
  textHeaderSelected: "#FFFFFF",
  textBubble: "#313139",

  bgCell: "#fff",
  bgCellMedium: "#fafafa",
  bgHeader: "#b2b2c0",
  bgHeaderHasFocus: "#BFC2C8",

  bgBubble: "#EDEDF3",
  bgBubbleSelected: "#FFFFFF",

  bgSearchResult: "#fff9e3",

  borderColor: "rgba(45,45,45,0.16)",
  borderDark: "rgba(0, 0, 0, 0)",

  linkColor: "#4F5DFF",

  headerFontStyle: "bold 14px",
  baseFontStyle: "13px",
  fontFamily:
    "Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif",
};

const dataEditorDarkTheme = {
    accentColor: "#4F5DFF",
    accentMedium: "rgba(79,118,255,0.5)",
    accentLight: "rgba(79, 93, 255, 0.1)",
  
    textDark: "#fff",
    textMedium: "#fafafa",
    textLight: "#BFC2C8",
    textHeader: "#f4f4f4",
    textHeaderSelected: "#FFFFFF",
    textBubble: "#313139",
  
    bgCell: "#0D0D0F",
    bgCellMedium: "#14141A",
    bgHeader: "#27282B",
    bgHeaderHasFocus: "#1F2023",
  
    bgBubble: "#EDEDF3",
    bgBubbleSelected: "#FFFFFF",
  
    bgSearchResult: "#fff9e3",
  
    borderColor: "rgba(45,45,45,0.75)",
    borderDark: "rgba(255, 255, 255, 0.00)",
  
    linkColor: "#4F5DFF",
  
    headerFontStyle: "bold 12px",
    baseFontStyle: "13px",
    fontFamily:
      "Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif",
  };

export const styled = baseStyled;
export function getBuilderTheme() {
  return dataEditorDarkTheme;
}
