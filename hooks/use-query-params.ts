// hooks/useQueryParams.ts
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useCallback } from "react";

type ParamParser<T> = (searchParams: URLSearchParams) => T;
type ParamSerializer<T> = (value: T) => string | null;

interface UseQueryParamOptions<T> {
  key: string;
  defaultValue: T;
  parser: ParamParser<T>;
  serializer: ParamSerializer<T>;
}

export const useQueryParam = <T>({
  key,
  defaultValue,
  parser,
  serializer,
}: UseQueryParamOptions<T>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get the current value directly from URL params
  const params = new URLSearchParams(searchParams.toString());
  const currentValue = params.has(key) ? parser(params) : defaultValue;

  // Update URL and state
  const updateValue = useCallback(
    (newValue: T) => {
      const current = new URLSearchParams(searchParams.toString());
      const serializedValue = serializer(newValue);

      // If the value is null, empty string, or default value, remove the parameter
      if (
        serializedValue === null ||
        serializedValue === "" ||
        (Array.isArray(newValue) &&
          Array.isArray(defaultValue) &&
          JSON.stringify(newValue) === JSON.stringify(defaultValue))
      ) {
        current.delete(key);
      } else {
        current.set(key, serializedValue);
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
    },
    [key, pathname, router, searchParams, serializer, defaultValue],
  );

  return [currentValue, updateValue] as const;
};

// Common parsers and serializers
export const parsers = {
  string: (params: URLSearchParams, key: string) => params.get(key) || "",

  number: (params: URLSearchParams, key: string) =>
    Number(params.get(key)) || 0,

  boolean: (params: URLSearchParams, key: string) => params.get(key) === "true",

  range: (params: URLSearchParams, key: string): [number, number] => {
    const value = params.get(key);
    if (value) {
      try {
        const numbers = value
          .toString()
          .replace(/[\[\]]/g, "")
          .split(",")
          .map(Number)
          .filter((num) => !isNaN(num));
        if (numbers.length === 2) {
          return [numbers[0], numbers[1]];
        }
      } catch (error) {
        console.error("Error parsing range:", error);
      }
    }
    return [0, 1000]; // default range
  },

  array: (params: URLSearchParams, key: string) =>
    params.get(key)?.split(",") || [],
};

export const serializers = {
  string: (value: string) => value || null,

  number: (value: number) => (value ? value.toString() : null),

  boolean: (value: boolean) => value.toString(),

  range: (value: [number, number]) => `[${value[0]},${value[1]}]`,

  array: (value: string[]) => (value.length ? value.join(",") : null),
};
