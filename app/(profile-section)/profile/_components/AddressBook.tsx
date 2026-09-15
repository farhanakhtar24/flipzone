"use client";

import { deleteAddress } from "@/actions/address.action";
import AddressForm from "@/components/Address/AddressForm";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Address } from "@prisma/client";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  addresses: Address[];
};

const AddressBook = ({ addresses }: Props) => {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (addressId: string) => {
    setDeletingId(addressId);
    const { message, error } = await deleteAddress({ addressId });
    setDeletingId(null);

    toast({
      title: message,
      description: error,
      variant: error ? "destructive" : "success",
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved addresses</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewForm((v) => !v)}
        >
          {showNewForm ? "Close" : "+ Add address"}
        </Button>
      </div>

      {showNewForm && (
        <div className="rounded-lg border p-4">
          <AddressForm onDone={() => setShowNewForm(false)} />
        </div>
      )}

      {addresses.length === 0 && !showNewForm && (
        <p className="text-sm text-muted-foreground">
          No addresses yet. Add one to speed up checkout.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-lg border p-4">
            {editingId === address.id ? (
              <AddressForm
                address={address}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {address.fullName}
                      {address.isDefault && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode},{" "}
                      {address.country}
                    </p>
                    {address.phone && (
                      <p className="text-muted-foreground">{address.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Edit address"
                    onClick={() => setEditingId(address.id)}
                    className="rounded p-1.5 hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete address"
                    disabled={deletingId === address.id}
                    onClick={() => handleDelete(address.id)}
                    className="rounded p-1.5 text-destructive hover:bg-muted"
                  >
                    {deletingId === address.id ? (
                      <span className="inline-flex h-4 w-4">
                        <Spinner />
                      </span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AddressBook;
