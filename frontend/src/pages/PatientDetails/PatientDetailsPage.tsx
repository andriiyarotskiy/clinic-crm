import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { AsideMenu } from "@/components/asideMenu/AsideMenu";
import { ButtonPage } from "@/components/button/ButtonsPage";
import { Loader } from "@/components/loader/Loader";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";
import { getPatientByIdThunk } from "@/features/patients/thunk/getPatientByIdThunk";
import { removePatientThunk } from "@/features/patients/thunk/removePatientThunk";
import { useEffect, useState } from "react";
import { IoTrash } from "react-icons/io5";

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { UserProfile } from "../../components/userProfile/UserProfile";
import { PatientEditForm } from "@/features/patients/PatientEditForm";
import { ConfirmModal } from "@/components/confirmModal/ConfirmModal";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import { patientDetailsStatisticThunk } from "@/features/statistics/thunk/patientDetailsStatisticsThunk";
import { getPatientDetailsNavigation } from "@/features/patients/model/patientDetailsNavigation";
import { SmallNavbar } from "../DoctorDetails/components/SmallNavbar";
import { SiTicktick } from "react-icons/si";
import { resetActiveVisits } from "@/features/visits/visitsSlice";
import { getAccess } from "@/premissoons/getAccessPremissions";
import { LuPencilLine } from "react-icons/lu";
import { changeStatusAppointmentThunk } from "@/features/appointments/thunk/changeStatusAppointmentThunk";


export const PatientDetailsPage = () => {
  const [aside, setOpenAside] = useState(false);
  const [modal, setOpenModal] = useState(false);
   const user = useAppSelector(state => state.auth.user)
  const dispatch = useAppDispatch();
  const access = getAccess(user);
  const { loading, selectedPatient } = useAppSelector((state) => state.patient);
  const {  isActiveVisit ,currentVisit} =
    useAppSelector((state) => state.visit);
  const { patientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!patientId) return;
    dispatch(getPatientByIdThunk(Number(patientId)));

    dispatch(patientDetailsStatisticThunk(Number(patientId)));
  }, [dispatch, patientId]);

  const handleAside = () => setOpenAside((prev) => !prev);
  
 const handleCompleteVisit = async () => {
  if (!isActiveVisit || !currentVisit) return;

  try {await dispatch(
    changeStatusAppointmentThunk({
      id: Number(currentVisit.appointmentId),
      status: "completed",
    }),
   ).unwrap();
    dispatch(resetActiveVisits())
    successToast("visit will be close")
   }
  catch (e) {
    errorToast(e as string)
    
   }
  };
  
  const handleRemove = async () => {
    try {
      await dispatch(removePatientThunk(Number(patientId))).unwrap();
      successToast("Patient remove");
      navigate("/patients");
    } catch (e) {
      errorToast(e as string);
    }
  };

  return (
    <>
      <ConfirmModal
        modalClassName="w-[439px] h-[356px]"
        confirmButtonClassName={buttonStyles.deleteButton}
        loading={loading}
        isOpen={modal}
        title="Delete patient?"
        description={`Are you sure you want to delete ${(selectedPatient?.firstName)} ${selectedPatient?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        onCancel={() => setOpenModal(false)}
        onConfirm={handleRemove}
      />
      {aside && (
        <AsideMenu
          handleAside={handleAside}
          content={<PatientEditForm />}
          footer={
            <>
              <ButtonPage
                className={buttonStyles.formCancel}
                onClick={handleAside}
              >
                <span className=" text-[#172554]">Cancel</span>
              </ButtonPage>

              <ButtonPage
                type="submit"
                form="patient-edit"
                className={buttonStyles.formSubmit}
              >
                Update patient
              </ButtonPage>
            </>
          }
          title={"EDIT PATIENT"}
          description={"Fill in the details below"}
        />
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="rounded-xl bg-white p-[16px] shadow-sm mb-[16px]">
          <section className="mb-[16px] flex items-center justify-between">
            <div className="text-sm text-gray-500">
               <span
  className={`${
    isActiveVisit
      ? "cursor-not-allowed text-gray-400"
      : "cursor-pointer hover:text-blue-600"
  }`}
  onClick={() => {
    if (!isActiveVisit) {
      navigate("/patients");
    }
  }}
>
  &lt; Patient list
</span>

<span className="mx-2">/</span>

<span className="font-medium text-gray-900">
  {selectedPatient?.firstName} {selectedPatient?.lastName}
</span>
            </div>

              {access.canCreatePatient && !isActiveVisit && (
                <div className="w-[250px] flex gap-4">
                  <ButtonPage
                    className={buttonStyles.removeButton}
                    icon={<IoTrash className="mr-2 text-[#DC2626]" />}
                    onClick={() => setOpenModal(true)}
                  >
                    Remove
                  </ButtonPage>

                  <ButtonPage
                    className={buttonStyles.editButton}
                    icon={<LuPencilLine className="mr-2" />}
                    onClick={handleAside}
                  >
                    Edit Patient
                  </ButtonPage>
                </div>
              )}
                
             {isActiveVisit && <ButtonPage
                className={buttonStyles.confirmVisits}
                icon={<SiTicktick className="mr-2" />}
                    onClick={() => {
                  
                     
                      handleCompleteVisit()
                    }}
              >
                Complete visit
              </ButtonPage>}
            
          </section>

          <section className="flex items-center justify-between ">
            {!loading && selectedPatient && (
              <UserProfile
                type="patient"
                avatar="patient.jpg"
                selectedUser={selectedPatient}
              />
            )}
          </section>
        </div>
      )}
    { selectedPatient &&  <SmallNavbar   arrayNavigation={getPatientDetailsNavigation(
    selectedPatient.completedAppointmentsCount,
    selectedPatient.visitsCount
  )}
       
      />}

      <Outlet />
    </>
  );
};
