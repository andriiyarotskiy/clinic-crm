import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Search } from "@/components/search/Search";

import type { AppointmentFormData } from "@/types/appointmentFormData";
import { getAllPatientThunk } from "@/features/patients/thunk/getAllPacientThunk";
import { AppointmentFormFields } from "@/components/formField/AppointmentFormFields";
import { createAppointmentThunk } from "./thunk/createAppointmentThunk";
import { getAppointmentsThunk } from "./thunk/getAppointmentsThunk";
import { getAvailableTimeSlotsThunk } from "./thunk/getAvailableSlots";
import { Loader } from "@/components/loader/Loader";
import type { Patient } from "@/types/patient";
import { UserContacts } from "@/components/userContacts/UserContacts";

export const AppointmentCreateForm: React.FC = () => {
  const methods = useForm<AppointmentFormData>();
  const { reset, setValue, handleSubmit } = methods;
  const [selectedUser, setSelectedUser] = useState<Patient | null>(null);
  const dispatch = useAppDispatch();
  const { patients, loading } = useAppSelector((state) => state.patient);
  const {appointmentsQuery,appointmentsLoading} = useAppSelector((state)=>state.appointment)
const {selectedDoctor,selectedDate,selectedSlotsTime,selectedTreatment} = useAppSelector(
    (state) => state.appointment.calendar
  );
 

  useEffect(() => {
    if (selectedDoctor && selectedSlotsTime && selectedDate) {
      setValue("doctorId", String(selectedDoctor.id))
      setValue("appointmentDate", selectedDate)
      setValue("appointmentTime",selectedSlotsTime)
  }
    if (!selectedUser) return;
    
    setValue("firstName", selectedUser.firstName);
    setValue("lastName", selectedUser.lastName);
    setValue("phoneNumber", selectedUser.phoneNumber);
    
    
}, [selectedUser, selectedDoctor, setValue]);

   const onSubmit = async () => {
     if (!selectedUser ||
       !selectedDoctor ||
       !selectedTreatment ||
       !selectedDate ||
    !selectedSlotsTime) {
      return;
    }

    try {
      await dispatch(createAppointmentThunk({
        patientId: selectedUser.id,
        doctorId: selectedDoctor.id,
        treatmentId: Number(selectedTreatment),
        appointmentDate: selectedDate,
        appointmentTime: selectedSlotsTime,
        notes:'',
        duration: 30,
        
        
        
      
      })).unwrap();

      await dispatch(getAppointmentsThunk(appointmentsQuery)).unwrap()
      await dispatch(getAvailableTimeSlotsThunk({
        doctorId: selectedDoctor.id,
        date: selectedDate,
      }))

      reset();

      successToast(
        <>
          Appointments created successfully
          <br />
         {` For ${selectedUser.firstName} For${selectedUser.lastName}`}
        </>,
      );
    } catch (e) {
      errorToast(e as string);
    }
  };

  return (
    <>
      
      {appointmentsLoading ? (
        <Loader />
      ) : (
        <div className="w-full">
          <section></section>
          <section className="mb-[24px]">
           
              <Search
              searchLabel="Search patients"
              items={patients}
              placeholder="Find an pacient"
              loading={loading}
              onSearch={(value) =>
                dispatch(getAllPatientThunk({ search: value }))
              }
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
                                            phone={user.phoneNumber}
                                          />
                </>
              )}
            />
          </section>

          <FormProvider {...methods}>
            <form
              id="appointment-create"
              className="flex flex-col "
              onSubmit={handleSubmit(onSubmit)}
            >
              {<AppointmentFormFields type={"create"} />}
            </form>
          </FormProvider>
        </div>
      
      )}</>
  );
};
