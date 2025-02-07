"use server";

import { revalidatePath } from "next/cache";

type RevalidateInput = string | { path: string; type: "page" | "layout" };

export async function revalidatePathServerAction(
  paths: RevalidateInput | RevalidateInput[],
) {
  const pathArray = Array.isArray(paths) ? paths : [paths];
  console.log("revalidating paths", pathArray);

  for (const p of pathArray) {
    console.log("revalidating path", p);
    if (typeof p === "string") {
      revalidatePath(p);
    } else {
      revalidatePath(p.path, p.type);
    }
  }

  pathArray.forEach((p) => {
    if (typeof p === "string") {
      revalidatePath(p);
    } else {
      revalidatePath(p.path, p.type);
    }
  });
}
