import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components";
import { formValidation } from "@/features/auth/model/form.validation";
import type { PatientFormData } from "@/types/patientFormData";
import { RadioGroup } from "../radioButtonGroup/RadioButtonGroup";
import { GenderTypes } from "@/features/patients/model/gender";
import Calendar from "@/pages/Appointments/components/Calendar";

type Props = {
  type?: "create";
};

export const PatientsFormFields: React.FC<Props> = ({ type }) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<PatientFormData>();

  return (
    <>
      <section>
        <p className="mb-6 text-xs text-[#6B7280]">PERSONAL INFO</p>

        <div className="flex gap-4 ">
          <Input
            className="flex-1"
            inputClassName=" h-[44px]"
            name="firstName"
            label="First name *"
            type="text"
            placeholder="First, select a user."
            register={register}
            rules={formValidation.name}
            error={errors.firstName?.message}
            readOnly={type === "create"}
          />

          <Input
            className="flex-1"
            inputClassName=" h-[44px]"
            name="lastName"
            label="Last name *"
            type="text"
            placeholder="First, select a user."
            register={register}
            rules={formValidation.name}
            error={errors.lastName?.message}
            readOnly={type === "create"}
          />
        </div>
      </section>
      <section>
        <RadioGroup
          name="gender"
          label="Gender *"
          options={GenderTypes}
          register={register}
          rules={formValidation.gender}
          error={errors.gender?.message}
        />
      </section>
      <section>
        <div className="flex gap-4 ">
        <Controller
  name="dateOfBirth"
  control={control}
            rules={formValidation.birthDate}
           
  render={({ field }) => (
    <Calendar
      variant="picker"
      selectedDate={field.value}
      onDateChange={field.onChange}
      error={errors.dateOfBirth?.message}
    />
  )}
/>
          <Input
            className="flex-1"
            inputClassName=" h-[44px]"
            name="address"
            label="Address *"
            type="string"
            placeholder="choose a address."
            register={register}
            rules={formValidation.address}
            error={errors.address?.message}
          />
        </div>
      </section>

      <section>
        <p className="mb-6 text-xs text-[#6B7280]">CONTACT</p>

        <div className="flex gap-4 ">
          <Input
            className="flex-1"
            inputClassName=" h-[44px]"
            disabled
            name="email"
            label="Email *"
            type="email"
            placeholder="example@gmail.com"
            register={register}
            rules={formValidation.email}
            error={errors.email?.message}
          />

          <Input
            className="flex-1"
            inputClassName=" h-[44px]"
            name="phoneNumber"
            label="Phone *"
            type="tel"
            placeholder="+38 (0XX) XXX-XXXX"
            register={register}
            rules={formValidation.phoneNumber}
            error={errors.phoneNumber?.message}
          />
        </div>
      </section>
    </>
  );
};
