
import { TfiClose } from "react-icons/tfi";

type Props = {
  title: string;
  description: string;
  handleAside: () => void;
  content: React.ReactNode;
  footer: React.ReactNode;
}

export const AsideMenu: React.FC<Props> = ({  title,
  description,
  handleAside,
  content,
  footer, }) => {
  
  return (
    <>
      
       <div className="fixed inset-0 z-[100] bg-black/50" />

     
     
      <aside
        className="
        flex flex-col
          fixed
          top-0 right-0
          w-[633px]
          h-screen
          bg-[#ffff]
          px-[40px] 
           z-[101]
        "
      >
        <div className="flex justify-between mb-[40px]">
          <div className="flex flex-col">
            <h1 className="font-[Inter] font-semibold text-[18px] text-[#000000]">{title}</h1>
            <p className="font-medium text-[16px] text-[#6B7280]">{description}</p>
          </div>
          <button className="w-[32px] h-[32px] flex justify-center items-center cursor-pointer " onClick={handleAside}>{<TfiClose />}</button>
        </div>
         <div className="flex-1 overflow-y-auto">
          {content}
        </div>

        <div className="sticky bottom-0 flex w-full pt-[24px] gap-4  border-t border-[#D1D5DB] bg-[#ffff]">
               {footer}
              </div>
        
       
        
        
      </aside>
    </>
  );
};