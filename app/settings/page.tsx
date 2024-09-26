"use client";

import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <main className="flex flex-col p-8 md:px-24 pt-8 pb-24 space-y-4 flex-1 container max-w-screen-md">
      <section className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl lg:text-5xl tracking-tight">
          Settings
        </h1>
        <h4 className="mb-3 opacity-50">
          Your display name and image will appear on hyperboards that include
          hypercerts that you own.
        </h4>
      </section>
      <section className="flex flex-col gap-2">
        <SettingsForm />
      </section>
    </main>
  );
}
