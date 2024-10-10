import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Wrapper = ({ children, className }: Props) => {
  return (
    <div className={twMerge("w-full max-w-screen-xl", className)}>
      {children}
    </div>
  );
};

export default Wrapper;
