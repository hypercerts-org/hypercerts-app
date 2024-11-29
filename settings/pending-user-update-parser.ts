import { z } from "zod";

export const PENDING_USER_UPDATE_SCHEMA = z.object({
  metadata: z.object({
    timestamp: z.number(),
  }),
  user: z.object({
    displayName: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export type PendingUserUpdate = z.infer<typeof PENDING_USER_UPDATE_SCHEMA>;

export const parsePendingUserUpdate = (
  message: string,
): PendingUserUpdate | undefined => {
  const pendingSignature = PENDING_USER_UPDATE_SCHEMA.safeParse(
    JSON.parse(message),
  );
  if (pendingSignature.success) {
    return pendingSignature.data;
  }
  console.error("Invalid pending signature", pendingSignature.error);
  return undefined;
};
