import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

const FillterAccordianItem = ({ children: content, title }: Props) => {
  return (
    <AccordionItem value={title} className="space-y-4 border-0 p-6">
      <AccordionTrigger className="p-0 hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent className="p-0">{content}</AccordionContent>
    </AccordionItem>
  );
};

export default FillterAccordianItem;
