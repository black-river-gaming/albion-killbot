import PaperStyles from "./styles";

interface PaperProps {
  elevation?: number;
  className?: string;
  children?: JSX.Element | JSX.Element[] | string | number;
}

const Paper = ({ elevation = 2, className, children }: PaperProps) => {
  return (
    <PaperStyles className={`elevation-${elevation} ${className}`}>
      {children}
    </PaperStyles>
  );
};

export default Paper;
