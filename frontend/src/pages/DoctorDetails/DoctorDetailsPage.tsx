import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { ButtonPage } from "@/components/button/ButtonsPage";
import { TfiPencil } from "react-icons/tfi";
import { IoTrash } from "react-icons/io5";
import { useEffect, useState } from "react";
import { AsideMenu } from "@/components/asideMenu/AsideMenu";
import { DoctorEditForm } from "@/features/doctors/DoctorEditForm";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import { UserProfile } from "../../components/userProfile/UserProfile";
import { getDoctorByIdThunk } from "@/features/doctors/thunk/getDoctorByIdThunk";
import { removeDoctorThunk } from "@/features/doctors/thunk/removeDoctorThunk";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";
import { Loader } from "@/components/loader/Loader";
import { ConfirmModal } from "@/components/confirmModal/ConfirmModal";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import { doctorDetailsStatisticThunk } from "@/features/statistics/thunk/doctorDetailsStatisticsThunk";
import { doctorDetailsNavigation } from "@/features/doctors/model/doctorDetailsNavigation";
import { SmallNavbar } from "./components/SmallNavbar";
import { getAccess } from "@/premissoons/getAccessPremissions";
import { LuPencilLine } from "react-icons/lu";
export const DoctorDetailsPage = () => {
  const dispatch = useAppDispatch();
  const [aside, setOpenAside] = useState(false);
  const [modal, setOpenModal] = useState(false);
  const user = useAppSelector(state => state.auth.user)
  const access = getAccess(user);
  const { doctorId: paramsDoctorId } = useParams();
  const navigate = useNavigate();
  const { selectedDoctor, loading } = useAppSelector((state) => state.doctor);
  const cards = useAppSelector(state => state.statistic.statistics.doctorDetailsCard)
  
const doctorId = paramsDoctorId ?? access.doctorId?.toString();
  
  useEffect(() => {
    if (!doctorId) return;

    dispatch(getDoctorByIdThunk(doctorId));
    dispatch(doctorDetailsStatisticThunk(+doctorId))
  }, [dispatch, doctorId]);

  const handleAside = () => setOpenAside((prev) => !prev);

  const handleRemove = async () => {
    try {
      await dispatch(removeDoctorThunk(Number(doctorId))).unwrap();
      successToast("Doctor remove");
      setOpenModal(false);
      navigate("/doctors");
    } catch (e) {
      errorToast(e as string);
      setOpenModal(false);
    }
  };
  
  
  return (
    <>
      {aside && (
        <AsideMenu
          handleAside={handleAside}
          content={<DoctorEditForm />}
          footer={<>
             <ButtonPage className={buttonStyles.formCancel} onClick={handleAside}>
                 <span className=" text-[#172554]">Cancel</span>
                </ButtonPage>

            <ButtonPage type="submit"
              form="doctor-edit"
              className={buttonStyles.formSubmit}>
                  Send an invitation
                </ButtonPage></>}
          title={"EDIT DOCTOR"}
          description={"Fill in the details below"}
        />
      )}

      <ConfirmModal
        loading={loading}
        isOpen={modal}
        title="Delete doctor?"
        description="This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setOpenModal(false)}
        onConfirm={handleRemove}
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="rounded-xl bg-white p-[16px] mb-[16px] shadow-sm">
         {access.canViewAllDoctors && <section className="mb-[16px] flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() => navigate("/doctors")}
              >
                &lt; Doctors
              </span>

              <span className="mx-2">/</span>

              <span className="font-medium text-gray-900">
                Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
              </span>
            </div>

          {access?.canCreateDoctor && < div className="w-[250px] flex gap-3">
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
                Edit doctor
              </ButtonPage>
            </div>}
          </section>}

          <section className="flex items-center justify-between  rounded-[8px] ">
            {!loading && selectedDoctor && (
                <UserProfile
                  patients = {cards?.patients?.total != null ? Number(cards.patients.total) : null}
                  type='doctor'
                  avatar={'doctor.jpg'}
                  selectedUser={selectedDoctor} />
            )}
          </section>
        </div>
      )}
      <SmallNavbar
      arrayNavigation={doctorDetailsNavigation}/>
      
     
        <Outlet />

    </>
  );
};
