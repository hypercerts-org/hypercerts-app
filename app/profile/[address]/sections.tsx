import { ReactNode } from "react";

const InfoSection = ({ children }: { children: ReactNode }) => {
  return (
    <section className="h-40 container mx-auto bg-slate-50 border-slate-300 border-2 p-3 rounded-lg flex flex-col items-center justify-center gap-3">
      {children}
    </section>
  );
};

const EmptySection = ({ children }: { children?: ReactNode }) => {
  return (
    <InfoSection>
      <p>{children || "Nothing here yet..."}</p>
    </InfoSection>
  );
};

export { EmptySection, InfoSection };
