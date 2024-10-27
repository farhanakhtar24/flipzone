"use client";
import RatingBox from "@/components/RatingBox/RatingBox";
import { Review } from "@prisma/client";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { FaEdit } from "react-icons/fa";
import CustomRateReviewBox from "./CustomRateReviewBox";
import { MdDelete } from "react-icons/md";
import { deleteReview } from "@/actions/reviews.action";
import Spinner from "@/components/ui/spinner";

type Props = {
  review: Review;
  productId: string;
};

const ReviewItem = ({ productId, review }: Props) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { comment, rating, reviewerName, date, reviewerEmail, id } = review;

  const newdate = dayjs(date).format("MMM, YYYY");

  return (
    <>
      {isEditing && (
        <CustomRateReviewBox
          productId={productId}
          comment={comment}
          rating={rating}
          isEditing={isEditing}
          reviewId={id}
          setIsEditing={setIsEditing}
        />
      )}
      {!isEditing && (
        <div className="flex w-full flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <RatingBox rating={rating} />
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 cursor-pointer rounded border bg-white p-2 transition-all hover:bg-slate-100 active:scale-75 ${!(reviewerEmail === session?.user.email) ? "hidden" : "block"}`}
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className={`h-full w-full text-gray-500`} />
              </div>
              <div
                className={`h-8 w-8 cursor-pointer rounded border bg-white p-2 transition-all hover:bg-slate-100 active:scale-75 ${!(reviewerEmail === session?.user.email) ? "hidden" : "block"}`}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteReview({
                    reviewId: id,
                    reviewerEmail,
                    productId,
                  });
                  setIsDeleting(false);
                }}
              >
                {isDeleting ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-full w-full text-gray-800" />
                  </div>
                ) : (
                  <MdDelete className={`h-full w-full text-gray-500`} />
                )}
              </div>
            </div>
          </div>
          <p className="text-sm">{comment}</p>
          <p className="text-xs font-medium text-gray-400">
            {reviewerName} - {newdate}
          </p>
        </div>
      )}
    </>
  );
};

export default ReviewItem;
