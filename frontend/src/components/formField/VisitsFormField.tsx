import { useFormContext } from "react-hook-form";

import { TextArea } from "../textArea/TextArea";
import type { VisitsFormData } from "@/types/visitsFormData";

import { Input } from "../input/Input";
import { formValidation } from "@/features/auth/model/form.validation";
import { Select } from "../select/Select";
import { useAppSelector } from "@/app/store/hook";

export const VisitsFormFields: React.FC = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<VisitsFormData>();

  const treatments = useAppSelector(
    (state) => state.visit.treatment2
  );

  return (
    <section>
      {/* Main treatment */}
      <Input
        className="flex-1"
        inputClassName="h-[44px] mb-[16px]"
        name="mainTreatment"
        label="Title *"
        type="text"
        placeholder="Enter the title"
        register={register}
        readOnly
      />

      <div className="flex gap-4 mb-[16px]">
        {/* Additional treatment 1 */}
        <Select
          className="flex-1"
          name="treatmentAdd1"
          label="Treatment *"
          placeholder="Choose Treatment"
          options={treatments.map((treatment) => ({
            value: String(treatment.id),
            label: `${treatment.treatment} - ${
              treatment.price.toString().slice(0, -3)
            }$`,
          }))}
          control={control}
          rules={formValidation.treatments}
          error={errors.treatmentAdd1?.message}
        />

        <Input
          className="flex-1"
          inputClassName="h-[44px]"
          name="tooth"
          label="Tooth *"
          type="number"
          placeholder="E.g. 36"
          register={register}
          rules={formValidation.tooth}
          error={errors.tooth?.message}
        />
      </div>

      {/* Additional treatment 2 */}
      <div className="mb-[24px]">
        <Select
          className="flex-1"
          name="treatmentAdd2"
          label="Additional Treatment *"
          placeholder="Choose Treatment"
          options={treatments.map((treatment) => ({
            value: String(treatment.id),
            label: `${treatment.treatment} - ${
              treatment.price.toString().slice(0, -3)
            }$`,
          }))}
          control={control}
         rules={formValidation.treatments}
          error={errors.treatmentAdd2?.message}
        />
      </div>

      <div className="flex flex-col gap-6">
        {/* Diagnosis */}
        <TextArea
          name="diagnosis"
          label="Diagnosis"
          placeholder="Describe the diagnosis..."
          register={register}
          error={errors.diagnosis?.message}
          textareaClassName="
            h-[90px]
            rounded-md
            px-3
            py-2.5
            text-[14px]
            leading-[15px]
            text-[#6B7280]
            focus:border-2
          "
        />

        {/* Clinical observation */}
        <TextArea
          name="description"
          label="Clinical observation"
          placeholder="Enter clinical observation"
          register={register}
          error={errors.description?.message}
          textareaClassName="
            h-[90px]
            rounded-md
            px-3
            py-2.5
            text-[14px]
            leading-[15px]
            text-[#6B7280]
            focus:border-2
          "
        />

        {/* Recommendation */}
        <TextArea
          name="recommendation"
          label="Recommendation"
          placeholder="Enter recommendation"
          register={register}
          error={errors.recommendation?.message}
          textareaClassName="
            h-[90px]
            rounded-md
            px-3
            py-2.5
            text-[14px]
            leading-[15px]
            text-[#6B7280]
            focus:border-2
          "
        />
      </div>
    </section>
  );
};