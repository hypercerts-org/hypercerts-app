import React from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import isURL from "validator/lib/isURL";

export const isValidImageData = (value: string) => {
  return value.startsWith("data:image/") || isURL(value);
};

export const base64ToBlob = (base64String: string) => {
  // remove header
  const base64Data = base64String.split(",")[1];
  // decode base64
  const binaryData = atob(base64Data);

  // translate binary data to Uint8Array
  const bytes = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }
  // create blob
  return new Blob([bytes], { type: "image/jpeg" });
};

export const readAsBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
  });
};

interface Props {
  handleImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputId: string;
  disabled?: boolean;
}
export function ImageUploader({ handleImage, inputId, disabled }: Props) {
  return (
    <div className="flex items-center">
      <Input
        disabled={disabled}
        id={inputId}
        name={inputId}
        type="file"
        onChange={handleImage}
        className="hidden"
        accept="image/png, image/jpg, image/jpeg"
      />
      <Button
        disabled={disabled}
        type="button"
        variant="outline"
        onClick={() => document.getElementById(inputId)!.click()}
      >
        <Upload className="mr-2 h-4 w-4" /> Upload Image
      </Button>
    </div>
  );
}
