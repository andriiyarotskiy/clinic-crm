import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";
import type { PatientFormData } from "@/types/patientFormData";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { searchUsersThunk } from "../users/searchUserThunk";
import { Search } from "@/components/search/Search";

import { createPatientThunk } from "./thunk/createPatientThunk";
import { PatientsFormFields } from "@/components/formField/PatientFormField";
import { getAllPatientThunk } from "./thunk/getAllPacientThunk";
import type { User } from "@/types/user";
import { UserContacts } from "@/components/userContacts/UserContacts";


export const PatientCreateForm:React.FC = () => {
  
  const methods = useForm<PatientFormData>();
    const { reset, setValue, handleSubmit } = methods;
  
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const dispatch = useAppDispatch();
  const { users, loading, } = useAppSelector((state) => state.user);
  const {query} = useAppSelector(state =>state.patient)
   
  
    useEffect(() => {
      if (!selectedUser) return;
      setValue("firstName", selectedUser.firstName);
      setValue("lastName", selectedUser.lastName);
      setValue("email", selectedUser.email);
    }, [selectedUser, setValue]);
  
   const onSubmit = async (data: PatientFormData) => {
    if (!selectedUser) {
      return;
    }
  
    try {
      await dispatch(createPatientThunk({
        ...data,
        userId:selectedUser.id
      })).unwrap();

       await dispatch(getAllPatientThunk(query)).unwrap();
  
      reset();
  
      successToast(
        <>
          Patient created successfully
          <br />
          Mr. {selectedUser.firstName} {selectedUser.lastName}
        </>,
      );
    } catch (e) {
      errorToast(e as string);
    }
  };
  
    return (
      <>
        {" "}
        {/* {loading? (
          <Loader />
        ) : ( */}
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
                                       
                                                               avatar={"user.png"}
                                                               firstName={user.firstName}
                                                               lastName={user.lastName}
                                                               phone={user.email}
                                                             />
                  </>
                )}
              />
            </section>
           
              <FormProvider {...methods}>
            <form
              id="patient-create"
                className="flex flex-col gap-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                {<PatientsFormFields type={'create'}/>}
   
             
             
            </form>
             
              
            </FormProvider>
          </div>
        {/* )}{" "} */}
      </>
    );
  };
  
