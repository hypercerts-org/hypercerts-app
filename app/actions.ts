"use server";

import { revalidatePath } from "next/cache";

export default async function revalidatePathServerAction(
  path: string | string[],
) {
  if (typeof path === "string") {
    console.log("revalidating path", path);
    revalidatePath(path, "page");
    return;
  }

  for (const p of path) {
    console.log("revalidating path", p);
    revalidatePath(p, "page");
  }
}
