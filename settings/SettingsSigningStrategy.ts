import { SettingsFormValues } from "@/components/settings/settings-form";

export abstract class SettingsSigningStrategy {
  constructor(
    protected address: string,
    protected chainId: number,
  ) {}

  abstract sign(user: SettingsFormValues): Promise<void>;
}
