import type { PropsWithChildren } from "react";
import DecorativeCorners from "./DecorativeCorners";

interface Props extends PropsWithChildren {
  fixedWidth?: boolean;
}

function Container({ children, fixedWidth }: Props) {
  const className = fixedWidth ? "flex" : "inline-block";
  return (
    <>
      <div className={`relative border-4 border-black p-4 ${className}`}>
        <DecorativeCorners />
        {children}
      </div>
    </>
  );
}

export default Container;
