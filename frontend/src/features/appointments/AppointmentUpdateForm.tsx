import {  useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { AppointmentFormData } from "@/types/appointmentFormData";



import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { updateAppointmentThunk, type UpdateAppointmentPayload } from "@/features/appointments/thunk/updateAppointmentThunk";

import { AppointmentEditFormFields } from "@/components/formField/AppointmentsUpdateFormField";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";

import { getErrorMessage } from "../errors/getError";
import { Search } from "@/components/search/Search";
import { getAllPatientThunk } from "../patients/thunk/getAllPacientThunk";
import type { Patient } from "@/types/patient";
import { UserContacts } from "@/components/userContacts/UserContacts";
import { getAppointmentsDashboardThunk } from "./thunk/getAppointmentsDashboardThunk";
import { getAvailableTimeSlotsThunk } from "./thunk/getAvailableSlots";
import dayjs from "dayjs";
import { getAppointmentsThunk } from "./thunk/getAppointmentsThunk";


type Props = {
  handleEditAside:()=>void
}

export const AppointmentEditForm: React.FC<Props> = ({ handleEditAside}) => {
  const dispatch = useAppDispatch();
  const { selectedAppointment ,appointmentsQuery} = useAppSelector(
    (state) => state.appointment,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<AppointmentFormData>({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      doctorId: "",
      treatmentId: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
    },
  });

  const { handleSubmit, setValue } = methods;

  const [selectedUser, setSelectedUser] =
    useState<Patient | null>(null);

  

  const {
    patients,
    loading,
  } = useAppSelector(
    (state) => state.patient,
  );

  const onSubmit = async (data: AppointmentFormData) => {
  if (!selectedAppointment) return;

  setSubmitError(null);

  try {
  const payload: UpdateAppointmentPayload = {
  id: selectedAppointment.id,
  patientId: Number(selectedUser?.id ?? selectedAppointment.patientId),
  doctorId: Number(data.doctorId),
  treatmentId: Number(data.treatmentId),
  appointmentDate: data.appointmentDate,
  appointmentTime: data.appointmentTime,
  duration: 30,
  status: selectedAppointment.status,
  notes: data.notes || "",
};

    await dispatch(updateAppointmentThunk(payload)).unwrap();
await dispatch(
  getAppointmentsDashboardThunk({
    month: dayjs(data.appointmentDate).month() + 1,
    year: dayjs(data.appointmentDate).year(),
  })
).unwrap();

await dispatch(
  getAvailableTimeSlotsThunk({
    doctorId: Number(data.doctorId),
    date: data.appointmentDate,
  })
    ).unwrap();
    await dispatch(
            getAppointmentsThunk(
              appointmentsQuery,
            ),
          ).unwrap();

    handleEditAside();

    successToast(
      <>
        Appointment updated successfully!!!
        <br />
      
      </>,
    );
  } catch (e) {
    errorToast(typeof e === "string" ? e : getErrorMessage(e));
  }
  };

  const handlePatientSelect = (user: Patient | null) => {
  setSelectedUser(user);

  if (!user) {
    setValue("firstName", "");
    setValue("lastName", "");
    setValue("phoneNumber", "");
    return;
  }

  setValue("firstName", user.firstName, {
    shouldValidate: true,
    shouldDirty: true,
  });

  setValue("lastName", user.lastName, {
    shouldValidate: true,
    shouldDirty: true,
  });

  setValue("phoneNumber", user.phoneNumber, {
    shouldValidate: true,
    shouldDirty: true,
  });
};
  return (<>
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
                  onSelect={handlePatientSelect}
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
      <form id="appointment-edit" onSubmit={handleSubmit(onSubmit)}>
        {submitError && (
          <div className="mb-[16px] p-[12px] bg-[#FEE2E2] border border-[#FECACA] rounded-[4px] text-[#DC2626] text-sm">
            {submitError}
          </div>
        )}
        {selectedAppointment && (
  <AppointmentEditFormFields appointment={selectedAppointment} />
)}
      </form>
    </FormProvider></>
  );
};
