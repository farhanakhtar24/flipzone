import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import React from "react";

type Props = {
  message: string;
};

const FormError = ({ message }: Props) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      {message}
    </div>
  );
};

export default FormError;
