"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getPathList } from "@/util/helper";
import Link from "next/link";
import React from "react";

type Props = {
  pathname: string;
};

const BreadCrumbLinks = ({ pathname }: Props) => {
  const pathList = getPathList(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathList.map((path, index) => {
          return (
            <React.Fragment key={path.value}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={path.value}>{path.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              {index < pathList.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumbLinks;
