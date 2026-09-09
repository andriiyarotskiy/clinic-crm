import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export const Th = ({ children, className = "" }: Props) => {
  return (
    <th
      className={` text-left text-[12px] pl-[16px] font-bold text-[#4B5563] ${className}`}
    >
      {children}
    </th>
  );
};