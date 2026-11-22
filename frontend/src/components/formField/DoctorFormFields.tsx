import { useFormContext } from "react-hook-form";

import { Input } from "@/components";
import { Select } from "@/components/select/Select";
import { CheckboxGroup } from "@/components/checkBoxGroup/CheskBoxGroup";
import { RadioGroup } from "@/components/radioButtonGroup/RadioButtonGroup";

import type { DoctorFormData } from "@/types/dotorFormData";
import { formValidation } from "@/features/auth/model/form.validation";
import { specializations } from "@/features/doctors/model/specialties";
import { employmentTypes } from "@/features/doctors/model/employmentTypes";
import { workingDays } from "@/features/doctors/model/workingDays";
import { UploadAvatar } from "../uploadAvatar/UploadAvatar";
type Props = {
  type?: "create";
};

export const DoctorFormFields: React.FC<Props> = ({ type }) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DoctorFormData>();

  return (
    <>
      <section>
        <UploadAvatar />

        <p className="mb-6 text-xs text-[#6B7280]">PERSONAL INFO</p>

        <div className="flex gap-4 mb-6">
          <Input
            className="flex-1"
            inputClassName=" h-[44px]"
            name="firstName"
            label="First name *"
            type="text"
            placeholder="First, select a user."
            register={register}
            
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
            
            readOnly={type === "create"}
          />
        </div>

        <div className="flex gap-4">
          <Select
            className="flex-1"
            name="specialization"
            label="Speciality *"
            placeholder="Enter speciality"
            options={specializations}
            control={control}
            rules={formValidation.specialization}
            error={errors.specialization?.message}
          />

          <Input
            className="flex-1"
            inputClassName=" h-[44px]"
            name="yearsExperience"
            label="Experience *"
            type="number"
            placeholder="E.g. 10"
            register={register}
            rules={formValidation.yearsExperience}
            error={errors.yearsExperience?.message}
          />
        </div>
      </section>

      <RadioGroup
        name="employmentType"
        label="Type *"
        options={employmentTypes}
        register={register}
        rules={formValidation.employmentType}
        error={errors.employmentType?.message}
      />

      <section>
        <p className="mb-6 text-xs text-[#6B7280]">CONTACT</p>

        <Input
          className="flex-1"
          inputClassName=" h-[44px]"
          disabled
          name="email"
          label="Email *"
          type="email"
          placeholder="example@gmail.com"
          register={register}
          
        />
      </section>

      <section>
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
      </section>

      <section>
        <CheckboxGroup
          name="workingDays"
          label="Working days *"
          options={workingDays}
          disabledOptions={["Sun"]}
          register={register}
          rules={formValidation.workingDays}
          error={errors.workingDays?.message}
        />

        <p className="mt-4 mb-6 text-xs text-[#6B7280]">
          Standard hours: 09:00 - 18:00
        </p>
      </section>
    </>
  );
};
