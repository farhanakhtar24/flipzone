import Sidebar from "./_components/Sidebar/Sidebar";
import { Card } from "@/components/ui/card";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex h-full w-full flex-col gap-5 px-5 md:flex-row">
      <Sidebar />
      <Card className="flex h-auto min-h-[60vh] w-full flex-col overflow-y-auto md:h-[77vh]">
        {children}
      </Card>
    </section>
  );
}
