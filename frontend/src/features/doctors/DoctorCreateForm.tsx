import { FormProvider, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";

import { useEffect, useState } from "react";
import { searchUsersThunk } from "../users/searchUserThunk";
import { Search } from "@/components/search/Search";
import type { User } from "@/types/user";
import { Loader } from "@/components/loader/Loader";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";
import type { DoctorFormData } from "@/types/dotorFormData";
import { DoctorFormFields } from "@/components/formField/DoctorFormFields";
import { createDoctorThunk } from "./thunk/createDoctorThunk";
import { getAllDoctorsThunk } from "./thunk/getAllDoctorsThunk";
import { UserContacts } from "@/components/userContacts/UserContacts";

type Props = {
  handleAside: () => void;
};

export const DoctorCreteForm: React.FC<Props> = () => {
 
  const methods = useForm<DoctorFormData>();
  const { reset, setValue, handleSubmit } = methods;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.user);
  const { loading: doctorsLoading , query} = useAppSelector((state) => state.doctor);

  useEffect(() => {
    if (!selectedUser) return;

    setValue("firstName", selectedUser.firstName);
    setValue("lastName", selectedUser.lastName);
    setValue("email", selectedUser.email);
     
  }, [selectedUser, setValue]);

 const onSubmit = async (data: DoctorFormData) => {
  if (!selectedUser) {
    return;
  }

  const formData = new FormData();

  formData.append("user_id", String(selectedUser.id));
  formData.append("specialization", data.specialization);

  if (data.yearsExperience !== undefined) {
    formData.append(
      "years_experience",
      String(data.yearsExperience),
    );
  }

  if (data.employmentType) {
    formData.append(
      "employment_type",
      data.employmentType,
    );
  }
if (data.phoneNumber) {
    formData.append(
      "phone_number",
      String(data.phoneNumber),
  )
  data.workingDays.forEach((day) => {
  formData.append("working_days", day);
})
  }
  if (data.avatar?.length) {
    formData.append("avatar", data.avatar[0]);
   }
   for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

  try {
    await dispatch(createDoctorThunk(formData)).unwrap();

    await dispatch(getAllDoctorsThunk(query)).unwrap();

    reset();

    successToast(
      <>
        Doctor created successfully
        <br />
        Dr. {selectedUser.firstName} {selectedUser.lastName}
      </>,
    );
  } catch (e) {
    errorToast(e as string);
  }
};

  return (
    <>
      {" "}
      {doctorsLoading ? (
        <Loader />
      ) : (
          <div className="w-full">
            <section>

            </section>
          <section className="mb-[24px]">
              <Search
                searchLabel="Search users"
              items={users}
              placeholder="Find an activated user"
              loading={loading}
              onSearch={(value) => dispatch(searchUsersThunk(value))}
              selectedUser={selectedUser}
              onSelect={setSelectedUser}
              getKey={(user) => user.id}
              getValue={(user) => `${user.firstName} ${user.lastName}`}
              renderItem={(user) => (
                <>
                    <UserContacts
                                     
                                                             avatar={"patient.jpg"}
                                                             firstName={user.firstName}
                                                             lastName={user.lastName}
                                                             phone={user.email}
                                                           />
                </>
              )}
            />
          </section>
         
            <FormProvider {...methods}>
            <form id="doctor-create"
              className="flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <DoctorFormFields type={'create'}/>

           
            </form>
          </FormProvider>
        </div>
      )}{" "}
    </>
  );
};
