import { useEffect, useState } from "react";
import { getAllCategories } from "@/actions/category.action";
import { Category } from "@prisma/client";

const useFetchCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      const response = await getAllCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      }
      if (response.error) {
        setError(response.error);
      }

      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export default useFetchCategories;
