import StyledLoader from "./style";

interface LoaderProps {
  children?: any;
  className?: string;
  height?: number;
  width?: number;
}

const Loader = ({
  children,
  className,
  height = 160,
  width = 400,
}: LoaderProps) => {
  return (
    <StyledLoader
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      backgroundColor="transparent"
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
