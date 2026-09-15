import Wrapper from "@/components/Wrapper/Wrapper";
import Sidebar from "./_components/Sidebar/Sidebar";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Wrapper>
      <section className="flex w-full flex-col gap-6 py-8 md:flex-row">
        <Sidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </section>
    </Wrapper>
  );
}
