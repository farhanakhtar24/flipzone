"use client";

import { useQueryParam } from "@/hooks/use-query-params";
import { Checkbox } from "@/components/ui/checkbox";
import useFetchCategories from "@/hooks/use-fetch-categories";

const CategoryFilter = () => {
  const [selectedCategories, setSelectedCategories] = useQueryParam<string[]>({
    key: "category",
    defaultValue: [],
    parser: (params) =>
      params.get("category")?.split(",").filter(Boolean) ?? [],
    serializer: (value) => (value.length ? value.join(",") : null),
  });

  const { categories, loading, error } = useFetchCategories();

  const toggleCategory = (name: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, name]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== name));
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading categories...</p>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="max-h-[200px] space-y-2 overflow-y-auto">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center space-x-2">
          <Checkbox
            id={`category-${category.id}`}
            checked={selectedCategories.includes(category.name)}
            onCheckedChange={(checked) =>
              toggleCategory(category.name, checked as boolean)
            }
          />
          <label
            htmlFor={`category-${category.id}`}
            className="cursor-pointer text-sm capitalize leading-none"
          >
            {category.name}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;
