"use client";

import { Address } from "@prisma/client";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  addresses: Address[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

const AddressSelector = ({ addresses, selectedId, onSelect }: Props) => {
  if (addresses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No saved addresses yet — add one below to check out.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Delivery address">
      {addresses.map((address) => {
        const selected = address.id === selectedId;
        return (
          <button
            key={address.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(address.id)}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
              selected
                ? "border-primary bg-primary/5"
                : "hover:border-muted-foreground/40",
            )}
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">
              <span className="block font-medium">
                {address.fullName}
                {address.isDefault && (
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">
                    Default
                  </span>
                )}
              </span>
              <span className="block text-muted-foreground">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                {address.state} {address.postalCode}
              </span>
              {address.phone && (
                <span className="block text-muted-foreground">
                  {address.phone}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AddressSelector;
