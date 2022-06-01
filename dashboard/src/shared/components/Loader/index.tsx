import StyledLoader from "./style";

interface LoaderProps {
  width?: number;
  height?: number;
  children?: any;
}

const Loader = ({ width = 400, height = 160, children }: LoaderProps) => {
  return (
    <StyledLoader
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      backgroundColor="transparent"
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
