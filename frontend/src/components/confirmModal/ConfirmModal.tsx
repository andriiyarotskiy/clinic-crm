import { useEffect } from "react";
import { ButtonPage } from "../button/ButtonsPage";
import { Loader } from "../loader/Loader";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import { GoAlert } from "react-icons/go";
type Props = {
  isOpen: boolean;

  title: React.ReactNode;
  description?: React.ReactNode;

  confirmText?: string;
  cancelText?: string;

  loading?: boolean;
  closeOnBackdrop?: boolean;

  children?: React.ReactNode;

  // Custom styles
  modalClassName?: string;
  cancelButtonClassName?: string;
  confirmButtonClassName?: string;
  buttonsClassName?: string;

  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export const ConfirmModal: React.FC<Props> = ({
  isOpen,
  loading,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  closeOnBackdrop = true,
  children,

  modalClassName = "",
  cancelButtonClassName = buttonStyles.notConfirmButton,
  confirmButtonClassName = buttonStyles.confirmButton,
  buttonsClassName = "mt-6 flex w-full gap-3",

  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => {
        if (closeOnBackdrop) {
          onCancel();
        }
      }}
    >
      <div
        className={` flex flex-col items-center justify-center rounded-xl bg-white p-[40px] shadow-xl ${modalClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-[32px] flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-[7px] border-[#FEF9C3] bg-[#FEF08A]">
  <GoAlert className="h-[20px] w-[20px] text-[#F59E0B]" />
</div>
      <div className="flex flex-col items-center justify-center text-center">
  <h2 className="mb-[8px] text-[Inter] text-[30px] font-semibold">
    {title}
  </h2>

  {description && (
    <span className="mb-[32px] block text-center text-gray-600">
      {description}
    </span>
  )}
</div>

        {children}

        <div className={buttonsClassName}>
          <ButtonPage
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cancelButtonClassName}
          >
            <span className="text-[#172554]">
              {cancelText}
            </span>
          </ButtonPage>

          <ButtonPage
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={confirmButtonClassName}
          >
            {loading ? <Loader /> : confirmText}
          </ButtonPage>
        </div>
      </div>
    </div>
  );
};