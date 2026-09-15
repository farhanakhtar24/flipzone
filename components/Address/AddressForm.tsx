"use client";

import { addAddress, updateAddress } from "@/actions/address.action";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { AddressSchema } from "@/schemas/address";
import { zodResolver } from "@hookform/resolvers/zod";
import { Address } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  address?: Address;
  onDone?: () => void;
};

const AddressForm = ({ address, onDone }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      fullName: address?.fullName ?? "",
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postalCode: address?.postalCode ?? "",
      country: address?.country ?? "US",
      phone: address?.phone ?? "",
      isDefault: address?.isDefault ?? false,
    },
  });

  const onSubmit = async (values: z.infer<typeof AddressSchema>) => {
    setLoading(true);
    const { message, error } = address
      ? await updateAddress(address.id, values)
      : await addAddress(values);
    setLoading(false);

    if (error) {
      toast({ title: message, description: error, variant: "destructive" });
      return;
    }

    toast({ title: message, variant: "success" });
    if (!address) form.reset();
    onDone?.();
  };

  const field = (
    name: keyof z.infer<typeof AddressSchema>,
    label: string,
    props: Record<string, string> = {},
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field: f }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...props}
              {...f}
              value={typeof f.value === "boolean" ? undefined : f.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {field("fullName", "Full name", { autoComplete: "name" })}
        {field("phone", "Phone", { autoComplete: "tel", type: "tel" })}
        <div className="sm:col-span-2">
          {field("line1", "Address line 1", { autoComplete: "address-line1" })}
        </div>
        <div className="sm:col-span-2">
          {field("line2", "Address line 2 (optional)", {
            autoComplete: "address-line2",
          })}
        </div>
        {field("city", "City", { autoComplete: "address-level2" })}
        {field("state", "State", { autoComplete: "address-level1" })}
        {field("postalCode", "Postal code", { autoComplete: "postal-code" })}
        {field("country", "Country", { autoComplete: "country" })}
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field: f }) => (
            <FormItem className="flex items-center gap-2 sm:col-span-2">
              <FormControl>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={f.value}
                  onChange={f.onChange}
                  className="h-4 w-4"
                />
              </FormControl>
              <FormLabel htmlFor="isDefault" className="!mt-0">
                Set as default address
              </FormLabel>
            </FormItem>
          )}
        />
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="inline-flex h-4 w-4">
                <Spinner className="text-primary-foreground" />
              </span>
            ) : address ? (
              "Save changes"
            ) : (
              "Add address"
            )}
          </Button>
          {onDone && (
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AddressForm;
