"use client";
import { addProductsToDb } from "@/actions/post/addProductsToDb.action";
import { Button } from "@/components/ui/button";
import React from "react";

const page = async () => {
  return (
    <div className="flex h-full w-full flex-col">
      <Button
        onClick={() => {
          addProductsToDb();
        }}
      >
        Add Products to DB
      </Button>
    </div>
  );
};

export default page;
