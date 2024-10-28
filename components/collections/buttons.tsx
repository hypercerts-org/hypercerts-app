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
import { useDeleteCollection } from "@/collections/hooks";

export const CreateCollectionButton = () => {
  return (
    <Link
      href="/collections/create"
      className="hover:text-white rounded-sm bg-white text-black border border-slate-300 px-4 py-2 inline-block"
    >
      Create collection
    </Link>
  );
};

export const EditCollectionButton = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  return (
    <Link
      href={`/collections/edit/${collectionId}`}
      className="hover:text-white rounded-sm bg-white text-black border border-slate-300 px-4 py-2 inline-block"
    >
      Edit
    </Link>
  );
};

export const DeleteCollectionButton = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const { mutateAsync: deleteCollection } = useDeleteCollection();
  return (
    <AlertDialog>
      <AlertDialogTrigger className="hover:text-white rounded-sm bg-white text-black border border-slate-300 px-4 py-2">
        Delete
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
            onClick={() => deleteCollection(collectionId)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
