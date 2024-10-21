"use client";
import React from "react";
import {
  FloatingPanelCloseButton,
  FloatingPanelContent,
  FloatingPanelFooter,
  FloatingPanelForm,
  FloatingPanelLabel,
  FloatingPanelRoot,
  FloatingPanelSubmitButton,
  FloatingPanelTextarea,
  FloatingPanelTrigger,
} from "@/components/ui/floating-panel";

const ComparisonPanel = () => {
  const handleSubmit = (note: string) => {
    console.log("Submitted note:", note);
  };

  const products = 0;
  return (
    <div
      className={`fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:left-0 sm:top-20 sm:flex-col md:max-w-fit ${
        products === 0 ? "hidden" : "block"
      }`}
    >
      <FloatingPanelRoot>
        <FloatingPanelTrigger title="Add Note">Add Note</FloatingPanelTrigger>
        <FloatingPanelContent>
          <FloatingPanelForm onSubmit={handleSubmit}>
            <FloatingPanelLabel htmlFor="note-input">
              Add Note
            </FloatingPanelLabel>
            <FloatingPanelTextarea id="note-input" />
            <FloatingPanelFooter>
              <FloatingPanelCloseButton />
              <FloatingPanelSubmitButton />
            </FloatingPanelFooter>
          </FloatingPanelForm>
        </FloatingPanelContent>
      </FloatingPanelRoot>
    </div>
  );
};

export default ComparisonPanel;
