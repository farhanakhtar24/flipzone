import React from "react";
import { ImSpinner2 } from "react-icons/im";
import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
};

const Spinner = ({ className }: Props) => {
  return (
    <ImSpinner2
      className={twMerge(`h-full w-full animate-spin text-white`, className)}
    />
  );
};

export default Spinner;
