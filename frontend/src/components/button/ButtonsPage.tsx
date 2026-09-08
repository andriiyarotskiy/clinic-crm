
 type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
   children: React.ReactNode;
   icon?: React.ReactNode;
   onClick?: () => void;
   className?: string;
   
   
  }
export const ButtonPage: React.FC<Props> = ({
  children,
  icon,
  className,
  ...props
}) => {
  return (
    <button
      className={`
        
       
        flex
        justify-center
        items-center
        rounded-[8px]
         border border-[#9CA3AF]
        cursor-pointer
          disabled:bg-[#FFFFFF]
    disabled:border-gray-300
    disabled:text-gray-500
    disabled:cursor-not-allowed
    disabled:opacity-70
   text-[14px]
        ${className ?? ""}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};