import React from "react";
import { FaStar } from "react-icons/fa6";

type Props = {
  rating: number;
};

const RatingBox = ({ rating }: Props) => {
  return (
    <div className="flex w-fit items-center gap-1 rounded bg-green-600 p-1 text-xs font-medium text-white">
      <span>{rating}</span>
      <FaStar className="-mt-0.5" />
    </div>
  );
};

export default RatingBox;
