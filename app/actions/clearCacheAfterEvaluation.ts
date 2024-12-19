"use server";

import { revalidatePath } from "next/cache";
import { revalidatePathServerAction } from "./revalidatePathServerAction";

export async function clearCacheAfterEvaluation(hypercertId: string | null) {
  if (!hypercertId) {
    return;
  }

  revalidatePathServerAction(["/explore", `/hypercerts/${hypercertId}`]);
}
