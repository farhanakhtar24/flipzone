import bcrypt from "bcryptjs";

export type PathSegment = {
  label: string;
  value: string;
};

export function saltAndHashPassword(password: string) {
  const saltRounds = 10; // Adjust the cost factor according to your security requirements
  const salt = bcrypt.genSaltSync(saltRounds); // Synchronously generate a salt
  const hash = bcrypt.hashSync(password, salt); // Synchronously hash the password
  return hash; // Return the hash directly as a string
}

export function priceFormatter(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getPathList(pathname: string): PathSegment[] {
  const pathList = pathname
    .split("/")
    .filter(Boolean) // Removes any empty strings resulting from leading slashes
    .reduce<PathSegment[]>((acc: PathSegment[], curr: string) => {
      // Truncate the current word if it exceeds 10 characters
      const truncatedLabel =
        curr.length > 10 ? `${curr.slice(0, 10)}...` : curr;
      const previousPath = acc.length > 0 ? acc[acc.length - 1].value : "";
      const value = `${previousPath}/${curr}`;

      acc.push({
        label: truncatedLabel,
        value,
      });

      return acc;
    }, []);

  // Add the "home" route at the beginning
  pathList.unshift({
    label: "home",
    value: "/",
  });

  return pathList;
}

export const originalPriceGetter = (
  price: number,
  discountPercentage: number,
) => {
  return price / (1 - discountPercentage / 100);
};
