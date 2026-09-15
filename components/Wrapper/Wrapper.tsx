import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Wrapper = ({ children, className }: Props) => {
  return (
    <div
      className={twMerge(
        "mx-auto w-full max-w-screen-2xl px-4 md:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Wrapper;
