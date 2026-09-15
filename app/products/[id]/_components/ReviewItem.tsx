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

  const { comment, rating, reviewerName, date, reviewerId, id } = review;

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
              <button
                type="button"
                aria-label="Edit review"
                className={`h-8 w-8 cursor-pointer rounded border bg-background p-2 transition-all hover:bg-muted active:scale-75 ${!(reviewerId && reviewerId === session?.user?.id) ? "hidden" : "block"}`}
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="h-full w-full text-muted-foreground" />
              </button>
              <button
                type="button"
                aria-label="Delete review"
                className={`h-8 w-8 cursor-pointer rounded border bg-background p-2 transition-all hover:bg-muted active:scale-75 ${!(reviewerId && reviewerId === session?.user?.id) ? "hidden" : "block"}`}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteReview({
                    reviewId: id,
                    productId,
                  });
                  setIsDeleting(false);
                }}
              >
                {isDeleting ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <Spinner className="h-full w-full text-foreground" />
                  </div>
                ) : (
                  <MdDelete className="h-full w-full text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <p className="text-sm">{comment}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {reviewerName} - {newdate}
          </p>
        </div>
      )}
    </>
  );
};

export default ReviewItem;
