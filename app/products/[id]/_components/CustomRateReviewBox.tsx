"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IoIosStar } from "react-icons/io";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ReviewSchema } from "@/schemas/product"; // Import your Zod schema
import { useSession } from "next-auth/react";
import FormError from "@/components/ui/form-error";
import { useToast } from "@/hooks/use-toast";
import { addReview } from "@/actions/reviews.action";
import Spinner from "@/components/ui/spinner";

type Props = {
  productId: string;
};

const CustomRateReviewBox = ({ productId }: Props) => {
  const { data: session } = useSession();
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Set up react-hook-form with Zod schema validation
  const form = useForm<z.infer<typeof ReviewSchema>>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      reviewerEmail: session?.user?.email || "",
      reviewerName: session?.user?.name || "",
      productId: productId,
    },
  });

  const handleSubmit = async (values: z.infer<typeof ReviewSchema>) => {
    setLoading(true);

    const { message, error } = await addReview(values);

    if (error) {
      setError(message);

      toast({
        title: message,
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: message,
        variant: "success",
      });
    }

    setLoading(false);

    form.reset(); // Clear form after submission
  };

  return (
    <div className="flex flex-col gap-3 p-5">
      <span className="text-lg font-medium">Review this product</span>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Review"
                    className="w-full"
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IoIosStar
                      key={star}
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`h-7 w-7 cursor-pointer ${
                        (hoverRating || field.value) >= star
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  size={"lg"}
                  style={{
                    margin: "0",
                  }}
                  type="submit"
                  disabled={!form.formState.isValid}
                >
                  {loading ? (
                    <div className="h-5 w-5">
                      <Spinner className="text-white" />
                    </div>
                  ) : (
                    <>Submit</>
                  )}
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
        </form>
      </Form>
    </div>
  );
};

export default CustomRateReviewBox;
