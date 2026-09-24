import { useEffect, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { AppointmentFormData } from "@/types/appointmentFormData";
import type { Appointment } from "@/types/appointment"; // добавьте цей тип

import { Input } from "../input/Input";
import { Select } from "../select/Select";
import { TextArea } from "../textArea/TextArea";

import { formValidation } from "@/features/auth/model/form.validation";
import { useFormContext } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "@/app/store/hook";

import { getFormAppointmentsDashboardThunk } from "@/features/appointments/thunk/getFormAppointmentsDashboardThunk";
import { getFormAvailableTimeSlotsThunk } from "@/features/appointments/thunk/getFormAvailableTimeSlotsThunk";

import Calendar from "@/pages/Appointments/components/Calendar";
import { getAllDoctorsThunk } from "@/features/doctors/thunk/getAllDoctorsThunk";

type Props = {
  appointment: Appointment; 
};

export const AppointmentEditFormFields: React.FC<Props> = ({ appointment }) => {
  const dispatch = useAppDispatch();

  const { doctors } = useAppSelector((state) => state.doctor);

  const { treatments } = useAppSelector((state) => state.appointment);


  

  const {
    availableDays,
    fullyBookedDays,
    availableTime,
    calendarLoading,
  } = useAppSelector((state) => state.appointment.formCalendar);

 const { control, reset, setValue, register, watch, formState: { errors } } =
    useFormContext<AppointmentFormData>();
  
  const doctorId = watch("doctorId");
  const appointmentDate = watch("appointmentDate");

  
  const appointmentDayjs = dayjs(appointment.dateTime);
 

  const [formDisplayedMonth, setFormDisplayedMonth] = useState<Dayjs>(() =>
    appointmentDayjs.startOf("month"),
  );



  const justSelectedDateRef = useRef(false);

 

useEffect(() => {
  const appointmentDayjs = dayjs(appointment.dateTime);

  reset({
    firstName: appointment.patientFirstName,
    lastName: appointment.patientLastName,
    phoneNumber: appointment.patientPhoneNumber,
    doctorId: String(appointment.doctorId),
    treatmentId: String(appointment.treatmentId),
    appointmentDate: appointmentDayjs.format("YYYY-MM-DD"),
    appointmentTime: appointmentDayjs.format("HH:mm"),
    notes: appointment.notes || "",
  });
}, [appointment, reset]);

 
  useEffect(() => {
    dispatch(
      getFormAppointmentsDashboardThunk({
        month: formDisplayedMonth.month() + 1,
        year: formDisplayedMonth.year(),
      }),
    );
  }, [dispatch, formDisplayedMonth]);

  
  useEffect(() => {
    if (!doctorId || !appointmentDate) {
      return;
    }
dispatch(getAllDoctorsThunk({page: 1,
      pageSize: 100,}))
    dispatch(
      getFormAvailableTimeSlotsThunk({
        doctorId: Number(doctorId),
        date: appointmentDate,
      }),
    );
  }, [dispatch, doctorId, appointmentDate]);

  const handleDoctorChange = (id: string) => {
    setValue("doctorId", id, {
      shouldValidate: true,
      shouldDirty: true,
    });

    
    setValue("appointmentTime", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleTreatmentChange = (value: string) => {
    setValue("treatmentId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleDateChange = (date: string | null) => {
    justSelectedDateRef.current = date !== null;

    setValue("appointmentDate", date ?? "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    
    setValue("appointmentTime", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCalendarClose = () => {
    if (justSelectedDateRef.current) {
      justSelectedDateRef.current = false;
      return;
    }

    const resetMonth = appointmentDate
      ? dayjs(appointmentDate).startOf("month")
      : appointmentDayjs.startOf("month");

    setFormDisplayedMonth(resetMonth);
  };

  return (
    <>
      <p className="mb-[24px] text-xs text-[#6B7280]">
        PERSONAL INFO
      </p>

      <div className="mb-[16px] flex gap-4">
        <Input
          inputClassName="h-[44px]"
          className="flex-1"
          name="firstName"
          label="First name *"
          type="text"
          placeholder="Patient first name"
          register={register}
          rules={formValidation.name}
          readOnly={true} 
        />

        <Input
          inputClassName="h-[44px]"
          className="flex-1"
          name="lastName"
          label="Last name *"
          type="text"
          placeholder="Patient last name"
          register={register}
          rules={formValidation.name}
          readOnly={true} 
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
        readOnly={true} 
      />

      <p className="mb-[24px] text-xs text-[#6B7280]">
        APPOINTMENT
      </p>

      <div className="mb-[16px] flex gap-4">
        <Select
          className="flex-1"
          name="doctorId"
          label="Doctor *"
          placeholder="select a doctor"
          options={doctors.map((doctor) => ({
            value: String(doctor.id),
            label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          }))}
          onChange={handleDoctorChange}
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
            label: `${treatment.treatment} - ${treatment.price
              .toString()
              .slice(0, -3)}$`,
          }))}
          onChange={handleTreatmentChange}
          control={control}
          rules={formValidation.treatments}
          error={errors.treatmentId?.message}
        />
      </div>

      <div className="mb-[16px] flex gap-4">
        <Calendar
          variant="picker"
          availableDays={availableDays}
          bookedDays={fullyBookedDays}
          selectedDate={appointmentDate || null}
          displayedMonth={formDisplayedMonth}
          onMonthChange={(date) => {
            setFormDisplayedMonth(date.startOf("month"));
          }}
          onDateChange={handleDateChange}
          onClose={handleCalendarClose}
          error={errors.appointmentDate?.message}
          minDate={dayjs()} 
        />

        <Select
          className="flex-1"
          name="appointmentTime"
          label="Time *"
          placeholder={
            !doctorId
              ? "Choose a doctor first"
              : !appointmentDate
                ? "Choose a date first"
                : calendarLoading
                  ? "Loading..."
                  : "Choose Time"
          }
          options={availableTime.map((time) => ({
            disabled: time.status !== "free",
            value: time.time,
            label: time.time.slice(0, -3),
          }))}
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
