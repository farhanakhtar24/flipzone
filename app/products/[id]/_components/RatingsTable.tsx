import React from "react";
import { IoIosStar } from "react-icons/io";
import RatingBox from "@/components/RatingBox/RatingBox";
import dayjs from "dayjs";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";

type Props = {
  product: IproductWithCartStatus;
};

const RatingsTable = ({ product }: Props) => {
  let { rating, reviews } = product;

  rating = rating ?? 0;
  reviews = reviews ?? [];

  return (
    <div className="mt-5 flex h-full w-full flex-col divide-y border">
      <div className="flex flex-col gap-5 p-5">
        <p className="text-xl font-medium">Ratings & Reviews</p>
        <div className="flex w-full justify-center">
          <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-full border-2 border-green-600 p-10">
            <div className="flex items-center gap-1 text-2xl font-medium">
              {rating}
              <IoIosStar className="-mt-1 h-6 w-6" />
            </div>
            <p className="text-sm font-light">{reviews.length} reviews</p>
          </div>
        </div>
      </div>
      {reviews &&
        reviews.map((review, index) => {
          const { comment, rating, reviewerName, date } = review;

          const newdate = dayjs(date).format("MMM, YYYY");

          return (
            <div className="flex w-full flex-col gap-3 p-5" key={index}>
              <RatingBox rating={rating} />
              <p className="text-sm">{comment}</p>
              <p className="text-xs font-medium text-gray-400">
                {reviewerName} - {newdate}
              </p>
            </div>
          );
        })}
    </div>
  );
};

export default RatingsTable;
