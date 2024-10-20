"use server";

import { revalidatePath } from "next/cache";

const defaultType = "page";

type Single = string | { path: string; type: "page" | "layout" };
const handleSingle = (p: Single) => {
  const path = typeof p === "string" ? p : p.path;
  const type = typeof p === "string" ? defaultType : p.type;
  console.log("revalidating path", path, type);
  revalidatePath(path, type);
};

export default async function revalidatePathServerAction(
  path: Single | Single[],
) {
  if (Array.isArray(path)) {
    path.forEach((p) => handleSingle(p));
  } else {
    handleSingle(path);
  }
}
