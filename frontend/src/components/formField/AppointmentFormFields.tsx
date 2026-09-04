import type { AppointmentFormData } from "@/types/appointmentFormData";
import { Input } from "../input/Input";
import { formValidation } from "@/features/auth/model/form.validation";
import { useFormContext } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { Select } from "../select/Select";
import {
  setDoctor,
  setTime,
  setTreatment,
} from "@/features/appointments/appointmentsSlice";

import { TextArea } from "../textArea/TextArea";
import Calendar from "@/pages/Appointments/components/Calendar";

type Props = {
  type: "create" | "update";
};

export const AppointmentFormFields: React.FC<Props> = ({ type }) => {
  const { doctors } = useAppSelector((state) => state.doctor);
  const { treatments } = useAppSelector((state) => state.appointment);
  const { availableDays, availableTime, fullyBookedDays,selectedDate } = useAppSelector(
    (state) => state.appointment.calendar,
  );
  const dispatch = useAppDispatch();

  const {
    control,
    setValue,
    register,
    formState: { errors },
  } = useFormContext<AppointmentFormData>();
  return (
    <>
      <p className="mb-[24px] text-xs text-[#6B7280]">PERSONAL INFO</p>
      <div className="flex gap-4 mb-[16px]">
        <Input
          inputClassName="h-[44px]"
          className="flex-1"
          name="firstName"
          label="First name *"
          type="text"
          placeholder="First, select a patient."
          register={register}
          rules={formValidation.name}
          readOnly={type === "create"}
        />

        <Input
          inputClassName="h-[44px]"
          className="flex-1"
          name="lastName"
          label="Last name *"
          type="text"
          placeholder="First, select a patient."
          register={register}
          rules={formValidation.name}
          readOnly={type === "create"}
        />
      </div>

      <Input
        inputClassName="h-[44px] mb-[32px]"
        name="phoneNumber"
        label="Phone *"
        type="tel"
        placeholder="+38 (0XX) XXX-XXXX"
        register={register}
        rules={formValidation.phoneNumber}
      />
      <p className="mb-[24px] text-xs text-[#6B7280]">APPOINTMENT</p>

      <div className="flex gap-4 mb-[16px]">
        <Select
          className="flex-1"
          name="doctorId"
          label="Doctor *"
          placeholder="select a doctor"
          options={doctors.map((doctor) => ({
            value: String(doctor.id),
            label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          }))}
          onChange={(id) => {
            const doctor = doctors.find((d) => String(d.id) === id);

            if (doctor) {
              dispatch(setDoctor(doctor));
            }
          }}
          control={control}
          rules={formValidation.doctor}
          error={errors.doctorId?.message}
        />

        <Select
          className="flex-1"
          name="treatmentId"
          label="Treatments *"
          placeholder="Choose Treatments"
          options={treatments.map((treatment) => ({
            value: String(treatment.id),
            label: `${treatment.treatment} - ${treatment.price.toString().slice(0, -3)}$ `,
          }))}
          onChange={(value) => {
            dispatch(setTreatment(value));
          }}
          control={control}
          rules={formValidation.treatments}
          error={errors.treatmentId?.message}
        />
      </div>
      <div className="flex  gap-4 mb-[16px]">
      <Calendar
  variant="picker"
  availableDays={availableDays}
  bookedDays={fullyBookedDays}
  selectedDate={selectedDate}
  onDateChange={(date) => {
    setValue(
      "appointmentDate",
      date ?? "",
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  }}
/>
        <Select
          className="flex-1"
          name="appointmentTime"
          label="Time *"
          placeholder="Choose Time"
          options={availableTime.map((time) => ({
            disabled: time.status === "expired",
            value: String(time.time),
            label: `${time.time.slice(0, -3)}  `,
          }))}
          onChange={(value) => {
            dispatch(setTime(value));
          }}
          control={control}
          rules={formValidation.date}
          error={errors.appointmentTime?.message}
        />
      </div>
      <TextArea
        name="notes"
        label="Notes"
        placeholder="Any additional notes for this appointment"
        register={register}
        rules={formValidation.notes}
        error={errors.notes?.message}
      />
    </>
  );
};
