import { CheckCircledIcon } from "@radix-ui/react-icons";
import React from "react";

type Props = {
  message: string;
};

const FormSuccess = ({ message }: Props) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CheckCircledIcon className="h-4 w-4" />
      {message}
    </div>
  );
};

export default FormSuccess;
