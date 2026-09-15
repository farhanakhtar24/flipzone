"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import React from "react";

// Reusable editable field component
type EditableFieldProps = {
  label: string;
  value: string;
  isEditing: boolean;
  isLoading: boolean;
  onEditToggle: () => void;
  onSave: (newValue: string) => void;
  onChange: (newValue: string) => void;
};

const EditableField = ({
  label,
  value,
  isEditing,
  isLoading,
  onEditToggle,
  onSave,
  onChange,
}: EditableFieldProps) => {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full items-center gap-7 py-2">
          <span className="text-xl font-semibold">{label}</span>
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
            onClick={() => onSave(value)}
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
      <Input
        placeholder={label}
        value={value}
        disabled={!isEditing}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default EditableField;
