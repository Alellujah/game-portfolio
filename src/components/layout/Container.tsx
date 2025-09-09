import type { PropsWithChildren } from "react";
import DecorativeCorners from "./DecorativeCorners";

interface Props extends PropsWithChildren {
  fixedWidth?: boolean;
  className?: string;
  childrenClasses?: string;
  style?: React.CSSProperties;
}

function Container({
  children,
  fixedWidth,
  className,
  childrenClasses,
  style,
}: Props) {
  const display = fixedWidth ? "flex" : "inline-block";
  return (
    <>
      <div
        className={`${className} bg-white relative border-4 border-black p-4 ${display}`}
        style={style}
      >
        <DecorativeCorners />
        <div className={childrenClasses}>{children}</div>
      </div>
    </>
  );
}

export default Container;
