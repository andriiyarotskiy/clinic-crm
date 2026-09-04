import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { AsideMenu } from "@/components/asideMenu/AsideMenu";
import { ButtonPage } from "@/components/button/ButtonsPage";
import { PageTitle } from "@/components/pageTitle/PageTitle";
import { UserForm } from "@/features/users/UserForm";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { BiShield } from "react-icons/bi";
import { CardStatistics } from "../../components/cardStatistics/CardStatistics";
import { dashboardStatisticsThunk } from "@/features/statistics/thunk/dashboardStatisticsThunk";
import { dashboardCards } from "@/features/statistics/model/dashboardCardStatistics";
import { RoundedDiagram } from "./components/RoundedDiagram";
import { WeeklyRevenue } from "../../components/weeklyRevenue/WeeklyRevenue";
import { getAppointmentsThunk } from "@/features/appointments/thunk/getAppointmentsThunk";
import { Table } from "@/components/table/Table";
import { Th } from "@/components/table/Th";
import { UserContacts } from "@/components/userContacts/UserContacts";
import { Td } from "@/components/table/Td";
import dayjs from "dayjs";
import { statusOptions } from "@/features/appointments/model/statusAppointments";
import { useNavigate } from "react-router-dom";
import { getAccess } from "@/premissoons/getAccessPremissions";
import { EmptyState } from "@/components/emptyState/EmptyState";
import { ConfirmModal } from "@/components/confirmModal/ConfirmModal";

import { setSelectedAppointment } from "@/features/appointments/appointmentsSlice";
import { createVisitThunk } from "@/features/visits/thunks/createVisitThunk";
import { errorToast, successToast } from "@/components/pushAppMessage/PushApp";
import { getVisitByAppointmentIdThunk } from "@/features/visits/thunks/getVisitsByAppointmentsId";


export const DashboardPage = () => {
  
  const {selectedAppointment}=useAppSelector(state=>state.appointment)
  const userData = useAppSelector((state) => state.auth.user);
   const access = getAccess(userData);
  const cards = useAppSelector((state) => state.statistic.statistics?.cards);
  console.log("CardStatistics",cards)
  const revenue = useAppSelector(
    (state) => state.statistic.statistics?.weeklyRevenue,
  );
  const roundedDiagram = useAppSelector(
    (state) => state.statistic.statistics?.appointmentOutcomes,
  );
  const appointmentsToday = useAppSelector(
    (state) => state.appointment.appointments,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [aside, setOpenAside] = useState(false);
  
  const now = new Date();
  const nowTime = now.toLocaleDateString("uk-UA");
  useEffect(() => {
    const getStatistic = async () => {
      dispatch(setSelectedAppointment(null))
      dispatch(dashboardStatisticsThunk());
      dispatch(
        getAppointmentsThunk({
          appointmentDate: now.toISOString().split("T")[0],
          appointmentStatus: "scheduled",
          pageSize: 10,
          page: 1,
          ...(access?.isDoctor && access.doctorId) ? {
            doctorId:access.doctorId,
          }:{}
        }),
      );
    };
    getStatistic();
  }, []);



  const currentDay = now.toLocaleDateString("en-US", {
    weekday: "short",
  });
  const currentMonth = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleAside = () => setOpenAside((prev) => !prev);

const handleCreateVisit = async () => {
  if (!selectedAppointment) return;

  try {
    await dispatch(
      createVisitThunk(selectedAppointment.id)
    ).unwrap();
   await dispatch(getVisitByAppointmentIdThunk(selectedAppointment.id)).unwrap()

    successToast(
      <>
        Visit from
        <br />
        Mr. {selectedAppointment.patientFirstName}{" "}
        {selectedAppointment.patientLastName} opened!
      </>
    );

    navigate(`/patients/${selectedAppointment.patientId}/records`);
  } catch (e) {
    errorToast(e as string);
  }
}


   
  
  return (
    <>
      <div className="flex justify-between items-center  mb-[16px] h-[57px]">
        <PageTitle
      text={
  userData?.role === "doctor"
    ? `Hello, Dr. ${userData.firstName}!`
    : `Hello, ${userData?.firstName}!`
}
          description={nowTime}
        />
      { access?.canCreateUser && <div className="flex  gap-4  ">
          <ButtonPage
            className={buttonStyles.editButton}
            icon={<BiShield className="mr-[8px]" />}
          >
            Change role
          </ButtonPage>
          <ButtonPage
            className={buttonStyles.createButton}
            onClick={handleAside}
            icon={<BiPlus className="mr-[8px]" />}
          >
            Invite a member
          </ButtonPage>
        </div>}
      </div>
      
      {aside && (
        <AsideMenu
          title={"ADD NEW USER"}
          description={"An invitation will be sent to the specified email"}
          handleAside={handleAside}
          content={<UserForm />}
          footer={
            <>
              <ButtonPage
                className={buttonStyles.formCancel}
                onClick={handleAside}
              >
                Cancel
              </ButtonPage>
              <ButtonPage
                form="user-create"
                type="submit"
                className={buttonStyles.formSubmit}
              >
                Send an invitation
              </ButtonPage>
            </>
          }
        />
      )}

       <>{access.canViewStatistics && <div className=" grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {cards &&
          dashboardCards.map((card) => (
            <CardStatistics
              prefix={card.prefix}
              key={card.key}
              title={card.title}
              icon={card.icon}
              iconClass={card.iconClass}
              value={cards[card.key].total}
              change={card.change !== null ? Number(card.change) : null}
            />
          ))}
      </div>}
        
      {access?.canViewStatistics && <div className=" h-[352px] mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[0.8fr_1.25fr]">
        {roundedDiagram && (
          <RoundedDiagram info={roundedDiagram} currentMonth={currentMonth} />
        )}

        {revenue && (
          <WeeklyRevenue
            currentDay={currentDay}
            total={revenue.total}
            change={revenue.change}
            data={revenue.data}
          />
        )}
      </div>}</>
      <div className="w-full min-h-[380px] mt-[8px] p-[16px] rounded-[8px] bg-[#FFFFFF] ">
        <div className="flex justify-between mb-[16px]">
          <span className="text-[14px] font-medium text-[#374151]">
            APPOINTMENTS TODAY
          </span>
        {access?.canViewAllAppointments &&  <span
            className="text-[14px] text-[#2563EB] cursor-pointer"
            onClick={() => navigate("/appointments")}
          >
            View all &gt;
          </span>}
        </div>
      
        {selectedAppointment && <ConfirmModal
          isOpen={selectedAppointment !== null}
          title={'Start this patient’s visit?'}
          onCancel={() => (dispatch(setSelectedAppointment(null)))}
          onConfirm={() => {handleCreateVisit()}}
          description={'Starting the visit begins the timer and logs the encounter.'}
          modalClassName="w-[439px] h-[356px]" />
        }
        <Table>
          <thead>
            <tr className="h-[40px] bg-[#F3F4F6]">
              <Th>ID</Th>
              <Th>PACIENT/CONTACT</Th>
              <Th>TIME</Th>

              <Th>TREATMENT</Th>
              <Th>DOCTOR</Th>
              <Th>STATUS</Th>
            </tr>
          </thead>
          <tbody>
            {appointmentsToday.map((appointment) => (
              <tr
                key={appointment.id}
                className=" h-[40px]  hover:bg-[#DCFCE7] transition-colors"
                onClick={() => {
                  dispatch(setSelectedAppointment(appointment))
                  
                  
                }}
              >
                <Td className="text-[#4B5563]">{`#${appointment.id}`}</Td>

                <Td>
                  <UserContacts
                    avatar={"patient.jpg"}
                    firstName={appointment.patientFirstName}
                    lastName={appointment.patientLastName}
                    phone={`${appointment.patientPhoneNumber}`}
                  />
                </Td>

                <Td className="font-medium">
                  {
                    <>
                      <div>{dayjs(appointment.dateTime).format("HH:mm")}</div>
                    </>
                  }
                </Td>

                <Td className="font-[Inter]  text-[#1F2937] font-semibold">{`${appointment.treatment}`}</Td>

                <Td>{`Dr. ${appointment.doctorFirstName} ${appointment.doctorLastName}`}</Td>

                <Td>
                  {statusOptions.map(
                    (status) =>
                      status.value === appointment.status && (
                        <span  key={`${status.value}${status.color}`}
                          className={`text-[12px] ${status.textColor} rounded-[8px] px-[15px] py-[6px] ${status.color}`}
                        >
                          {status.label}
                        </span>
                      ),
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {appointmentsToday.length === 0 && (
        <EmptyState description="No appointments for today."/>
        )}
      </div>
    </>
  );
};
