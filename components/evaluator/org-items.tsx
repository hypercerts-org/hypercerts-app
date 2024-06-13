import OrgItem from "./org-item";

export default function OrgItems({ orgs }: { orgs: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {orgs.map((org) => (
        <OrgItem key={org} org={org} />
      ))}
    </div>
  );
}
