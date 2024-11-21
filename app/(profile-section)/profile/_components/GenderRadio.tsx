import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import React from "react";

type GenderRadioProps = {
  selectedGender: "MALE" | "FEMALE" | null;
  onChange: (gender: "MALE" | "FEMALE" | null) => void;
  disabled?: boolean;
  onEditToggle: () => void;
  isEditing: boolean;
  onSave: () => void;
  isLoading: boolean;
};

const GenderRadio = ({
  selectedGender,
  onChange,
  disabled,
  onEditToggle,
  isEditing,
  onSave,
  isLoading,
}: GenderRadioProps) => {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full items-center gap-7 py-2">
          <span className="text-xl font-semibold">Gender</span>
          <div
            className="cursor-pointer text-sm font-semibold text-blue-500"
            onClick={onEditToggle}
          >
            {isEditing ? "Cancel" : "Edit"}
          </div>
        </div>
        {isEditing && (
          <Button
            className="w-fit bg-blue-500 hover:bg-blue-600"
            onClick={onSave}
          >
            {isLoading ? (
              <div className="h-5 w-5">
                <Spinner className="text-white" />
              </div>
            ) : (
              "Save"
            )}
          </Button>
        )}
      </div>

      <div className="flex gap-5">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="male"
            name="gender"
            value="MALE"
            checked={selectedGender === "MALE"}
            onChange={() => onChange("MALE")}
            disabled={disabled}
          />
          <label
            htmlFor="male"
            className={cn(`text-sm font-medium`, disabled && "text-gray-500")}
          >
            Male
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="female"
            name="gender"
            value="FEMALE"
            checked={selectedGender === "FEMALE"}
            onChange={() => onChange("FEMALE")}
            disabled={disabled}
          />
          <label
            htmlFor="female"
            className={cn(`text-sm font-medium`, disabled && "text-gray-500")}
          >
            Female
          </label>
        </div>
      </div>
    </div>
  );
};

export default GenderRadio;
