import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Table = ({ children }: Props) => {
  return (
    <div className="  bg-white">
      <table className="w-full ">
        {children}
      </table>
    </div>
  );
};