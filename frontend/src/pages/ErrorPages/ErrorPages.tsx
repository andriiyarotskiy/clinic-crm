import { useNavigate } from "react-router-dom";

type ErrorPageProps = {
  code: 401 | 403 | 404;
  title: string;
  description: string;
};

export const ErrorPage = ({
  code,
  title,
  description,
}: ErrorPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="relative flex w-full max-w-[660px] flex-col items-center justify-center text-center">
      
        <div className="absolute top-1/2 -translate-y-[70%] select-none text-[300px] font-bold leading-none text-blue-100">
          {code}
        </div>

        
        <div className="relative z-10">
          <h1 className="mb-3 text-[34px] font-bold leading-tight text-slate-950">
            {title}
          </h1>

          <p className="mx-auto max-w-[430px] text-[18px] leading-6 text-slate-500">
            {description}
          </p>

         
          <div className="mt-7 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-[44px] w-[204px] rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            >
              ←&nbsp; Go back
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="h-[44px] w-[204px] rounded-md bg-[#172554] text-sm font-medium text-white transition hover:bg-[#1e3a8a]"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};