import { useAppDispatch, useAppSelector } from "@/app/store/hook"
import { EmptyState } from "@/components/emptyState/EmptyState"
import { Filter } from "@/components/filter/Filter"
import { Pagination } from "@/components/pagination/Pagination"
import { Td } from "@/components/table/Td"
import { Th } from "@/components/table/Th"
import { UserContacts } from "@/components/userContacts/UserContacts"
import { setAppointmentsQuery } from "@/features/appointments/appointmentsSlice"
import { statusOptions } from "@/features/appointments/model/statusAppointments"
import { getAppointmentsThunk } from "@/features/appointments/thunk/getAppointmentsThunk"
import { dateOptions } from "@/features/doctors/model/dataRange"
import { getAccess } from "@/premissoons/getAccessPremissions"

import Table from "@mui/material/Table"
import dayjs from "dayjs"
import { useEffect } from "react"
import { useParams } from "react-router-dom"


export const DoctorVisits = () => {
    const {
    appointmentsQuery,
    total,
  } = useAppSelector((state) => state.appointment);
  const user = useAppSelector(state=>state.auth.user)
  const access = getAccess(user)
  const dispatch = useAppDispatch();
   const { doctorId:paramsDoctorId } = useParams();
 const doctorId = paramsDoctorId ?? access.doctorId?.toString();

  useEffect(() => {
    if (!doctorId) {
      return
    }
    dispatch(getAppointmentsThunk({
      ...appointmentsQuery,
      doctorId: Number(doctorId),
      pageSize: 5,
      
    }))
  }, [doctorId,appointmentsQuery, dispatch])

  const doctorAppointments = useAppSelector(state=>state.appointment.appointments)
  return(<> <div className="w-full min-h-[380px] mt-[8px] p-[16px] rounded-[8px] bg-[#FFFFFF] ">
    <div className="flex justify-between mb-[16px]">
       
      <span className="text-[14px] font-medium text-[#374151]" >PATIENTS VISITS</span>
   <div className="flex ">
   
       <Filter
          className="ml-[16px]" 
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
                  onSecondSelectChange={(value) =>
                    dispatch(
                      setAppointmentsQuery({
                        appointmentStatus: value || null,
                        page: 1,
                      }),
                    )
                  }
        />
        </div>
          </div> 
                      <Table>
                        <thead>
                          <tr className="h-[40px] bg-[#F3F4F6]">
                            <Th>ID</Th>
                            <Th>PACIENT/CONTACT</Th>
                            <Th>DATE</Th>

                            <Th>TIME</Th>
                            <Th>FEE</Th>
                            <Th>TREATMENT</Th>
                            <Th>STATUS</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {doctorAppointments.map((appointment) => (
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
                                  phone={`${appointment.patientPhoneNumber}`}
                                />
                              </Td>
        
                              <Td>
                                {
                                  <>
                                   
                                    <div>
                                      {dayjs(appointment.dateTime).format("DD.MM.YY")}
                                    </div>
                                  </>
                                }
                              </Td>
                              <Td className="text-[#4B5563]">
                                {
                                  <>
                                   
                                    <div>
                                      {dayjs(appointment.dateTime).format("HH:mm")}
                                    </div>
                                  </>
                                }
                              </Td>
        
                              <Td className="font-[Inter]  text-[#1F2937] font-semibold">{`$ ${appointment.treatmentPrice}`}</Td>
        
                              <Td>{`${appointment.treatment}`}</Td>
        
                              <Td>{statusOptions.map((status) =>
              
                                status.value === appointment.status && (
                                  <span className={`text-[12px] ${status.textColor} rounded-[8px] px-[15px] py-[6px] ${status.color}`}>{status.label}</span>
                                ))}
                                </Td>
                            
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {doctorAppointments.length === 0 && (
                       <EmptyState description=" No Visits match your current filters. Try adjusting or clearing them."/>
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
   
  </>)
}