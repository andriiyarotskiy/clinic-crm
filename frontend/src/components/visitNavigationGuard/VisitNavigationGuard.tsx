import { useEffect } from "react";
import { useAppSelector } from "@/app/store/hook";
import { errorToast } from "../pushAppMessage/PushApp";

export const ActiveVisitGuard = () => {
  const isActiveVisit = useAppSelector(
    (state) => state.visit.isActiveVisit
  );

  useEffect(() => {
    if (!isActiveVisit) return;

   
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      
      window.history.pushState(null, "", window.location.href);

      errorToast("Please complete the visit before leaving.");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isActiveVisit]);

  return null;
};