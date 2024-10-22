"use client";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { addProductToComparison } from "@/actions/comparison.action";
import { useToast } from "@/hooks/use-toast";

type Props = {
  productId: string;
  isCompared: boolean | undefined;
};

const ComparisonBox = ({ productId, isCompared }: Props) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const userId = session?.user.id;

  const handleCheckBox = async (e: boolean) => {
    if (userId && productId) {
      const { error, message } = await addProductToComparison({
        productId,
        userId,
        isCompared: e,
      });

      if (error) {
        toast({
          title: message,
          description: error,
          variant: "destructive",
        });
      } else if (message) {
        toast({
          title: message,
          variant: "success",
        });
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="Compare"
        checked={isCompared}
        onCheckedChange={handleCheckBox}
      />
      <label
        htmlFor="Compare"
        className="text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Compare
      </label>
    </div>
  );
};

export default ComparisonBox;
