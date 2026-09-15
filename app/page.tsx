import { getAllCategories } from "@/actions/category.action";
import HomePageLoader from "./_components/HomePageLoader";

export const dynamic = "force-dynamic";

const page = async () => {
  const { data: categories } = await getAllCategories();
  return <HomePageLoader categories={categories ?? []} />;
};

export default page;
