import theme from "helpers/theme";
import StyledLoader from "./style";

interface LoaderProps {
  className?: string;
  children?: any;
  height?: number;
  width?: number;
  foregroundColor?: string;
  backgroundColor?: string;
}

const Loader = ({
  children,
  className,
  height = 160,
  width = 400,
  foregroundColor = theme.secondary,
  backgroundColor = "transparent",
}: LoaderProps) => {
  return (
    <StyledLoader
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
      className={className}
    >
      {children ? (
        children
      ) : (
        <>
          <circle cx="150" cy="86" r="8" />
          <circle cx="194" cy="86" r="8" />
          <circle cx="238" cy="86" r="8" />
        </>
      )}
    </StyledLoader>
  );
};

export default Loader;
