import React from "react";
import PaperStyles from "./styles";

interface PaperProps {
  elevation?: number;
  className?: string;
  children?: JSX.Element | JSX.Element[] | string | number;
  style?: React.CSSProperties;
}

const Paper = ({ elevation = 2, className, children, style }: PaperProps) => {
  return (
    <PaperStyles
      className={`elevation-${elevation} ${className}`}
      style={style}
    >
      {children}
    </PaperStyles>
  );
};

export default Paper;
