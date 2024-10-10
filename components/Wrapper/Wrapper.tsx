import React from "react";

type Props = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: Props) => {
  return <div className="w-full max-w-screen-xl">{children}</div>;
};

export default Wrapper;
