import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import {
  errorToast,
  successToast,
} from "@/components/pushAppMessage/PushApp";

import { useEffect, useState } from "react";
import {
  FormProvider,
  useForm,
} from "react-hook-form";

import { Search } from "@/components/search/Search";

import type { AppointmentFormData } from "@/types/appointmentFormData";

import { getAllPatientThunk } from "@/features/patients/thunk/getAllPacientThunk";

import { AppointmentFormFields } from "@/components/formField/AppointmentFormFields";

import { createAppointmentThunk } from "./thunk/createAppointmentThunk";
import { getAppointmentsThunk } from "./thunk/getAppointmentsThunk";

import { Loader } from "@/components/loader/Loader";

import type { Patient } from "@/types/patient";

import { UserContacts } from "@/components/userContacts/UserContacts";


import { getAvailableTimeSlotsThunk } from "./thunk/getAvailableSlots";

type Props = {
  handleAside: (arg: boolean) => void;
};

export const AppointmentCreateForm: React.FC<Props> = ({
  handleAside,
}) => {
  const {
    selectedDoctor,
    selectedDate,
    selectedSlotsTime,
    selectedTreatment,
  } = useAppSelector((state) => state.appointment.calendar);

  const methods = useForm<AppointmentFormData>({
  mode: "onChange",
  defaultValues: {
    doctorId: selectedDoctor ? String(selectedDoctor.id) : "",
    treatmentId: selectedTreatment ?? "",
    appointmentDate: selectedDate ?? "",
    appointmentTime: selectedSlotsTime ?? "",
  },
});

  const {
    reset,
    setValue,
    handleSubmit,
  } = methods;


  const [selectedUser, setSelectedUser] =
    useState<Patient | null>(null);

  const dispatch = useAppDispatch();

  const {
    patients,
    loading,
  } = useAppSelector(
    (state) => state.patient,
  );

  const {
    appointmentsQuery,
    appointmentsLoading,
  } = useAppSelector(
    (state) => state.appointment,
  );

 

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setValue(
      "firstName",
      selectedUser.firstName,
    );

    setValue(
      "lastName",
      selectedUser.lastName,
    );

    setValue(
      "phoneNumber",
      selectedUser.phoneNumber,
    );
  }, [
    selectedUser,
    setValue,
  ]);

 

  const onSubmit = async (
    data: AppointmentFormData,
  ) => {
    if (!selectedUser) {
      return;
    }

    try {
      await dispatch(
        createAppointmentThunk({
          patientId: selectedUser.id,

          doctorId: Number(
            data.doctorId,
          ),

          treatmentId: Number(
            data.treatmentId,
          ),

          appointmentDate:
            data.appointmentDate,

          appointmentTime:
            data.appointmentTime,

          notes: data.notes ?? "",

          duration: 30,
        }),
      ).unwrap();
      
  await dispatch(
  getAvailableTimeSlotsThunk({
    doctorId: Number(data.doctorId),
    date: data.appointmentDate,
  }),
).unwrap();

      
      await dispatch(
        getAppointmentsThunk(
          appointmentsQuery,
        ),
      ).unwrap();

    
      reset();

      setSelectedUser(null);

      handleAside(false);

      successToast(
        <>
          Appointments created successfully
          <br />
          For {selectedUser.firstName}{" "}
          {selectedUser.lastName}
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
          <section />

          <section className="mb-[24px]">
            <Search
              searchLabel="Search patients"
              items={patients}
              placeholder="Find an pacient"
              loading={loading}
              onSearch={(value) =>
                dispatch(
                  getAllPatientThunk({
                    search: value,
                  }),
                )
              }
              selectedUser={selectedUser}
              onSelect={setSelectedUser}
              getKey={(user) => user.id}
              renderItem={(user) => (
                <UserContacts
                  avatar="patient.jpg"
                  firstName={user.firstName}
                  lastName={user.lastName}
                  phone={user.phoneNumber}
                />
              )}
            />
          </section>

          <FormProvider {...methods}>
            <form
              id="appointment-create"
              className="flex flex-col"
              onSubmit={handleSubmit(
                onSubmit,
              )}
            >
              <AppointmentFormFields
                type="create"
              />
            </form>
          </FormProvider>
        </div>
      )}
    </>
  );
};