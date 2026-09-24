import { VisitsFormFields } from "@/components/formField/VisitsFormField";
import type { VisitsFormData } from "@/types/visitsFormData";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { updatePatientNoteThunk } from "./thunks/updateVisit";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import type { Visit } from "@/types/visit";
import { getPatientNotesThunk } from "../patients/thunk/getPatientNotesVisits";
import { useParams } from "react-router-dom";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";


type Props = {
  visit: Visit | null ;
}

export const VisitEditForm: React.FC<Props> = ({ visit }) => {
   const treatments = useAppSelector(
      (state) => state.visit.treatment2
  );
  const{patientNotesQuery}=useAppSelector(state=>state.patient)
  const methods = useForm<VisitsFormData>({
    defaultValues: {
      mainTreatment: "",
      treatmentAdd1: "",
      treatmentAdd2: "",
      diagnosis: "",
      description: "",
      recommendation: "",
    },
  });

  const { reset, handleSubmit } = methods;

  const dispatch = useAppDispatch();
  const {patientId} = useParams()

  useEffect(() => {
  if (!visit) return;

  const treatment1 = treatments.find(
    (treatment) => treatment.treatment === visit.additionalTreatment1
  );

  const treatment2 = treatments.find(
    (treatment) => treatment.treatment === visit.additionalTreatment2
  );

  reset({
    mainTreatment: visit.mainTreatment ?? "",

    treatmentAdd1: treatment1 ? String(treatment1.id) : "",
    treatmentAdd2: treatment2 ? String(treatment2.id) : "",

    diagnosis: visit.diagnosis ?? "",
    description: visit.description ?? "",
    recommendation: visit.recommendation ?? "",
  });
}, [visit, treatments, reset]);

  const onSubmit = async (data: VisitsFormData) => {
    if (!visit) return;
    try {
      await dispatch(
        updatePatientNoteThunk({
          visitId: visit.visitId,
          data,
        })
      ).unwrap();
      await dispatch(getPatientNotesThunk({
      patientId: Number(patientId),
      page: patientNotesQuery.page,
      pageSize: patientNotesQuery.pageSize,
    }))
      

      successToast('Note added successfully')
    } catch (e) {
      errorToast(e as string);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        id="visit-edit"
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <VisitsFormFields />
      </form>
    </FormProvider>
  );
};