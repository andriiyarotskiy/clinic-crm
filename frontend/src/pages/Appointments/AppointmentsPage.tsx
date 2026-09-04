import { PageTitle } from "@/components/pageTitle/PageTitle";
import Calendar from "./components/Calendar";
import { AvalibleTime } from "./components/AvalibleTime/AvalibleTime";
import { useCallback, useEffect, useState } from "react";
import { getAppointmentsDashboardThunk } from "@/features/appointments/thunk/getAppointmentsDashboardThunk";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { getAvailableTimeSlotsThunk } from "@/features/appointments/thunk/getAvailableSlots";
import { AsideMenu } from "@/components/asideMenu/AsideMenu";
import { ButtonPage } from "@/components/button/ButtonsPage";
import { getTreatmentsThunk } from "@/features/appointments/thunk/getTreatments";
import { AppointmentCreateForm } from "@/features/appointments/AppointmentCreateForm";
import { getAppointmentsThunk } from "@/features/appointments/thunk/getAppointmentsThunk";
import { Table } from "@/components/table/Table";
import { Th } from "@/components/table/Th";
import { Td } from "@/components/table/Td";
import { UserContacts } from "@/components/userContacts/UserContacts";
import { LuPencilLine } from "react-icons/lu";
import dayjs from "dayjs";

import { ActionModal } from "./components/ActionModal/ActionModal";
import {
  resetAppointmentsQuery,
  resetCalendarQuery,
  setAppointmentsQuery,
  setSelectedAppointment,
} from "@/features/appointments/appointmentsSlice";
import { ChangeStatusModal } from "./components/ChangeStatusModal/ChangeStatusModal";
import { statusOptions } from "@/features/appointments/model/statusAppointments";
import { Pagination } from "@/components/pagination/Pagination";
import { Filter } from "@/components/filter/Filter";
import { AppointmentsViewToggle } from "./components/AppointmentsViewToogle/AppointmentsViewToogle";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import { EmptyState } from "@/components/emptyState/EmptyState";
import { dateOptions } from "@/features/doctors/model/dataRange";
import { useNavigate } from "react-router-dom";


type ViewMode = "list" | "calendar";

export const AppointmentsPage = () => {
  const [aside, setOpenAside] = useState(false);
  const [status, setOpenChangeStatus] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
const  navigate = useNavigate()
  const dispatch = useAppDispatch();
  const { appointments, selectedAppointment } = useAppSelector(
    (state) => state.appointment,
  );
  const {
    query,
    selectedSpecialization,
    selectedDoctor,
    selectedDate,
    availableDays,
    fullyBookedDays,
    availableTime,
    availableTimeCount,
    fullyBookedTimeCount,
    calendarLoading,
  } = useAppSelector((state) => state.appointment.calendar);
  const {
    
    appointmentsQuery,
    total,
  } = useAppSelector((state) => state.appointment);
  const { doctors } = useAppSelector((state) => state.doctor);

  useEffect(() => {
    return () => {
      dispatch(resetCalendarQuery());
      dispatch(resetAppointmentsQuery());
    
  };
}, [dispatch]);
  
  useEffect(() => {
    dispatch(
      getAppointmentsDashboardThunk({
        month: query.month,
        year: query.year,
      }),
    );
  }, [dispatch, query]);

  useEffect(() => {
    dispatch(getAppointmentsThunk(appointmentsQuery));
  }, [dispatch, appointmentsQuery]);

  useEffect(() => {
    dispatch(getTreatmentsThunk(true));
  }, [dispatch]);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate || !selectedSpecialization) return;

    dispatch(
      getAvailableTimeSlotsThunk({
        doctorId: selectedDoctor.id,
        date: selectedDate,
      }),
    );
  }, [selectedDoctor, selectedDate, selectedSpecialization, dispatch]);
  

 
  const handleAside = () => setOpenAside((prev) => !prev);
  const handleSearchChange = useCallback(
    (value: string) => {
      dispatch(
        setAppointmentsQuery({
          search: value,
          page: 1,
        }),
      );
    },
    [dispatch],
  );
  
  return (
     <> <div className="flex justify-between">
        <PageTitle
          text="Reception Desk"
          description={`Todays appointments ${total}`}
        />
        <AppointmentsViewToggle value={viewMode} onChange={setViewMode} />
      </div>
      
    
        <div>
          {" "}
          <section className="flex gap-[16px] mb-[24px]">
            
              {availableDays && (
                <Calendar
                  availableDays={availableDays}
                bookedDays={fullyBookedDays}
                selectedDate = {selectedDate}
                />
              )}
            
            {
              <AvalibleTime
                bookedCount={fullyBookedTimeCount}
                availableCount={availableTimeCount}
                loading={calendarLoading}
                handleAside={handleAside}
                doctors={doctors}
                selectedDoctorId={selectedDoctor}
                selectedSpecialization={selectedSpecialization}
                availableTime={availableTime}
                selectedDate={selectedDate}
              />
            }{" "}
          </section>
          <Filter
            className="mb-[16px]"
            search={appointmentsQuery.search}
            firstPlaceholder="Date"
            firstSelectOptions={dateOptions}
           firstSelect={
              appointmentsQuery.dateFrom && appointmentsQuery.dateTo
                ? `${appointmentsQuery.dateFrom}_${appointmentsQuery.dateTo}`
                : ""
            }
            onFirstSelectChange={(value) => {
              const [dateFrom, dateTo] = value.split("_");
          
              dispatch(
                setAppointmentsQuery({
                  dateFrom,
                  dateTo,
                  appointmentDate: null,
                  page: 1,
                }),
              );
            }} 
          
            secondSelect={appointmentsQuery.appointmentStatus ?? ""}
           
            secondPlaceholder="All statuses"
          
            secondSelectOptions={statusOptions}
            onSearchChange={handleSearchChange}
          
            onSecondSelectChange={(value) =>
              dispatch(
                setAppointmentsQuery({
                  appointmentStatus: value || null,
                  page: 1,
                }),
              )
            }
          />
          
 

            <div className="w-full min-h-[380px] p-[16px] rounded-[8px] bg-[#FFFFFF] ">
              <Table>
                <thead>
                  <tr className="h-[40px] bg-[#F3F4F6]">
                    <Th>ID</Th>
                    <Th>PACIENT/DOCTOR</Th>
                    <Th>TIME</Th>
                    <Th>PRICE</Th>
                    <Th>TREATMENT</Th>
                    <Th>STATUS</Th>
                    <Th>ACTION</Th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      
                      className=" h-[40px]  hover:bg-[#DCFCE7] transition-colors"
                   >
                      <Td className="text-[#4B5563]">{`#${appointment.id}`}</Td>

                      <Td>
                        <UserContacts
                          avatar={"patient.jpg"}
                          firstName={appointment.patientFirstName}
                          lastName={appointment.patientLastName}
                          phone={`Dr.${appointment.doctorFirstName} ${appointment.doctorLastName}`}
                        />
                      </Td>

                      <Td>
                        {
                          <>
                            <div className="text-[#4B5563]">
                              {dayjs(appointment.dateTime).format("YYYY-MM-DD")}
                            </div>
                            <div>
                              {dayjs(appointment.dateTime).format("HH:mm")}
                             </div>
                          </>
                        }
                      </Td>

                      <Td className="font-[Inter]  text-[#1F2937] font-semibold">{`$${appointment.treatmentPrice}`}</Td>

                      <Td>{appointment.treatment}</Td>

                      <Td>{statusOptions.map((status) =>
      
                        status.value === appointment.status && (
                          <span className={`text-[12px] ${status.textColor} rounded-[8px] px-[15px] py-[6px] ${status.color}`}>{status.label}</span>
                        ))}
                        </Td>
                      <Td className="relative  ">
                        {
                          <>
                            <LuPencilLine 
                              className="cursor-pointer h-[16px] w-[16px]"
                              onClick={() => {
                                dispatch(setSelectedAppointment(appointment));
                              }}
                            />
                            {selectedAppointment &&
                              !status &&
                              selectedAppointment.id === appointment.id && (
                              <ActionModal
                               detailsAppointment={() => {
  navigate(`/patients/${selectedAppointment.patientId}/records`);
}}
                                  onClose={() => {
                                    dispatch(setSelectedAppointment(null));
                                  }}
                                  onEditStatus={() => setOpenChangeStatus(true)}
                                  onReschedule={() => { }}
                                />
                              )}{" "}
                          </>
                        }
                      </Td>
                    </tr>
                  ))}
            </tbody>
            
          </Table>
          
              {appointments.length === 0 && (
                <EmptyState description=" No Appointments match your current filters. Try adjusting or clearing them."/>
          )}
             <Pagination
                page={appointmentsQuery.page}
                pageSize={appointmentsQuery.pageSize}
                total={total}
                onPageChange={(page) =>
                  dispatch(
                    setAppointmentsQuery({
                      page,
                    }),
                  )
                }
              />
</div>
           
            
          
          </div>
          

      {selectedAppointment && status && (
        <ChangeStatusModal
          status={statusOptions}
          appointment={selectedAppointment}
          title={"UpdateStatus"}
          onCancel={() => {
            setOpenChangeStatus(false);
            dispatch(setSelectedAppointment(null));
          }}
          isOpen={status}
        />
      )}
      {aside && (
        <AsideMenu
          handleAside={handleAside}
          content={<AppointmentCreateForm />}
          footer={
            <>
              <ButtonPage
                className={buttonStyles.formCancel}
                onClick={handleAside}
              >
                <span className="text-[#172554]">Cancel</span>
              </ButtonPage>

              <ButtonPage
                type="submit"
                form="appointment-create"
                className={buttonStyles.formSubmit}
              >
                Creaate appointment
              </ButtonPage>
            </>
          }
          title={"ADD APPOINTMENT"}
          description={"Fill in the details below"}
        />
      )}
      </>)
      
    
  
}

