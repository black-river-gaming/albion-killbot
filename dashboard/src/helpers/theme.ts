export interface ThemeProps {
  name: string;

  background: string;
  primary: string;
  secondary: string;

  text: string;
  contrastText: string;
  dangerText: string;
  mutedText: string;
}

const theme: ThemeProps = {
  name: "dark",

  background: "#1c1c1c",
  primary: "#ffbd59",
  secondary: "#69657c",

  text: "#ffffff",
  contrastText: "#333333",
  dangerText: "#c42936",
  mutedText: "#6c757d",
};

export default theme;
