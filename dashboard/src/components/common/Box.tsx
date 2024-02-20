import { ReactNode } from "react";

interface Props {
  className?: string;
  children?: ReactNode;
}

const Box = ({ className = "p-2", children }: Props) => {
  return (
    <div
      className={"box " + className}
      style={{
        backgroundColor: "#FFFFFF11",
        borderRadius: "0.5rem",
      }}
    >
      {children}
    </div>
  );
};

export default Box;
