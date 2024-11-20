import React from "react";

const page = () => {
  return (
    <div className="flex h-fit flex-col">
      {Array.from({ length: 100 }).map((_, index) => (
        <div key={index} className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-blue-500"></div>
            <div className="font-medium">Order #{index}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default page;
