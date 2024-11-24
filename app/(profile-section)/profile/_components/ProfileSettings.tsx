"use client";
import { User } from "@prisma/client";
import React, { useState } from "react";
import GenderRadio from "./GenderRadio";
import { updateUser } from "@/actions/user.action";
import { useToast } from "@/hooks/use-toast";
import EditableField from "./EditbaleField";

type Props = {
  user: User;
};

const ProfileSettings = ({ user }: Props) => {
  const { toast } = useToast();
  const { name, email, phone, gender, id } = user;
  const [nameInput, setNameInput] = useState(name);
  const [emailInput, setEmailInput] = useState(email);
  const [phoneInput, setPhoneInput] = useState(phone);
  const [genderInput, setGenderInput] = useState<"MALE" | "FEMALE" | null>(
    gender,
  );

  const [isLoading, setIsLoading] = useState(false);

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
    gender: false,
  });

  const handleSave = async (field: string) => {
    console.log(`${field} input:`, {
      name: nameInput,
      email: emailInput,
      phone: phoneInput ?? undefined,
      gender: genderInput,
    });

    setIsLoading(true);

    const { message, error } = await updateUser({
      name: nameInput ?? undefined,
      email: emailInput ?? undefined,
      phone: phoneInput ?? undefined,
      gender: genderInput ?? undefined,
      userId: id,
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

    setIsLoading(false);

    setIsEditing({
      name: false,
      email: false,
      phone: false,
      gender: false,
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-10">
      <EditableField
        label="Name"
        value={nameInput || ""}
        isEditing={isEditing.name}
        onEditToggle={() =>
          setIsEditing((prev) => ({ ...prev, name: !prev.name }))
        }
        onSave={() => handleSave("name")}
        onChange={setNameInput}
        isLoading={isLoading}
      />
      <EditableField
        label="Email"
        value={emailInput}
        isEditing={isEditing.email}
        onEditToggle={() =>
          setIsEditing((prev) => ({ ...prev, email: !prev.email }))
        }
        onSave={() => handleSave("email")}
        onChange={setEmailInput}
        isLoading={isLoading}
      />
      <EditableField
        label="Phone"
        value={phoneInput || ""}
        isEditing={isEditing.phone}
        onEditToggle={() =>
          setIsEditing((prev) => ({ ...prev, phone: !prev.phone }))
        }
        onSave={() => handleSave("phone")}
        onChange={setPhoneInput}
        isLoading={isLoading}
      />
      <GenderRadio
        selectedGender={genderInput}
        onChange={(newGender) => setGenderInput(newGender)}
        disabled={!isEditing.gender}
        isEditing={isEditing.gender}
        onEditToggle={() =>
          setIsEditing((prev) => ({ ...prev, gender: !prev.gender }))
        }
        onSave={() => handleSave("gender")}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProfileSettings;
