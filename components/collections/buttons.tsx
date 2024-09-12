"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react";

export const CreateCollectionButton = () => {
  return (
    <Button
      className="hover:text-white rounded-sm bg-white text-black border border-gray-300"
      asChild
    >
      <Link href="/collections/create">Create Collection</Link>
    </Button>
  );
};

export const EditCollectionButton = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  return (
    <Button
      className="hover:text-white rounded-sm bg-white text-black border border-gray-300"
      asChild
    >
      <Link href={`/collections/edit/${collectionId}`}>Edit</Link>
    </Button>
  );
};

export const DeleteCollectionButton = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          className="hover:text-white rounded-sm bg-white text-black border border-gray-300"
          variant="destructive"
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete collection</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this collection? This action is
            irreversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white"
            onClick={() => console.log("Deleting collection", collectionId)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
