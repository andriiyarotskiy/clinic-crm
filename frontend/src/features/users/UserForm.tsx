import { Input } from "@/components";
import { formValidation } from "../auth/model/form.validation";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { createUserThunk } from "./createUserThunk";
import { Loader } from "@/components/loader/Loader";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";
import type { UserData } from "@/types/userFormData";


export const UserForm: React.FC = () => {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserData>();

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.user);

  const onSubmit = async (data: UserData) => {
    
    try {
      await dispatch(createUserThunk(data)).unwrap();
      reset();
      successToast("User created successfully");
    } catch (e) {
      errorToast(e as string);
    }
  };
  return (
    <>
      {" "}
      
      <div className="relative w-full h-full">
          {loading && (
      <div className="absolute inset-0 z-10">
        <Loader />
      </div>
    )}
          <form
            id="user-create"
            className="flex flex-col gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <section>
              <p className="mb-[24px] font-[Inter] text-[12px] text-[#6B7280]">
                PERSONAL INFO
              </p>

              <div className="flex gap-4">
                  <Input
                     inputClassName="h-[44px]"
                  className="flex-1"
                  name="firstName"
                  label="First name *"
                  type="text"
                  placeholder="Enter first name"
                  register={register}
                  rules={formValidation.name}
                  error={errors.firstName?.message}
                />

                  <Input
                     inputClassName="h-[44px]"
                  className="flex-1"
                  name="lastName"
                  label="Last name *"
                  type="text"
                  placeholder="Enter last name"
                  register={register}
                  rules={formValidation.name}
                  error={errors.lastName?.message}
                />
              </div>
            </section>

            <section>
              <p className="mb-6 font-[Inter] text-[12px] text-[#6B7280]">
                CONTACT
              </p>

                <Input
                   inputClassName="h-[44px]"
                name="email"
                label="Email *"
                type="email"
                placeholder="example@gmail.com"
                register={register}
                rules={formValidation.email}
                error={errors.email?.message}
              />
            </section>

            <section>
              <p className="mb-6 font-[Inter] text-[12px] text-[#6B7280]">
                PASSWORD
              </p>

                <Input
                   inputClassName="h-[44px]"
                name="password"
                label="Password *"
                type="password"
                placeholder="At least 8 characters"
                register={register}
                rules={formValidation.password}
                error={errors.password?.message}
              />
            </section>
          
          </form>
        </div>
      
    </>
  );
};
