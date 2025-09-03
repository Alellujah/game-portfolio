import type { PropsWithChildren } from "react";
import DecorativeCorners from "./DecorativeCorners";

interface Props extends PropsWithChildren {
  fixedWidth?: boolean;
  className?: string;
}

function Container({ children, fixedWidth, className }: Props) {
  const width = fixedWidth ? "flex" : "inline-block";
  return (
    <>
      <div
        className={`${className} relative border-4 border-black p-4 ${width}`}
      >
        <DecorativeCorners />
        {children}
      </div>
    </>
  );
}

export default Container;
