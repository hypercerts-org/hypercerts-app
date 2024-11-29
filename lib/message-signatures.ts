import { z } from "zod";

export const UserUpdateRequestSchema = z.object({
  user: z.object({ displayName: z.string(), avatar: z.string() }),
});

export const MESSAGE_SCHEMAS = {
  UserUpdateRequest: UserUpdateRequestSchema,
} as const;

export type MessageSchemas = typeof MESSAGE_SCHEMAS;

export type SafeSignature<T extends keyof MessageSchemas> = {
  message: z.infer<MessageSchemas[T]>;
  confirmations: number;
};
