import Wrapper from "@/components/Wrapper/Wrapper";
import Sidebar from "./_components/Sidebar/Sidebar";
import { Card } from "@/components/ui/card";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex h-full w-full gap-5 px-5">
      <Sidebar />
      <Wrapper>
        <Card className="flex h-[77vh] w-full flex-col overflow-y-auto">
          {children}
        </Card>
      </Wrapper>
    </section>
  );
}
