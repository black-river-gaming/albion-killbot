import ContentLoader from "react-content-loader";

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
  foregroundColor,
  backgroundColor = "transparent",
}: LoaderProps) => {
  return (
    <ContentLoader
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
      className={className}
      style={{
        width: "100%",
        height: "100%",
      }}
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
    </ContentLoader>
  );
};

export default Loader;
