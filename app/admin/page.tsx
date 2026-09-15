import { getAdminStats } from "@/actions/admin.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import AdminDashboard from "./_components/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

const AdminPage = async () => {
  const { data, statusCode } = await getAdminStats();

  if (statusCode === 403 || statusCode === 401 || !data) {
    notFound(); // don't reveal that an admin surface exists
  }

  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDashboard stats={data} />
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default AdminPage;
