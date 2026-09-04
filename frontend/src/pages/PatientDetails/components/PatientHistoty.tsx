import { useAppDispatch, useAppSelector } from "@/app/store/hook"
import { EmptyState } from "@/components/emptyState/EmptyState"
import { Loader } from "@/components/loader/Loader"
import { Pagination } from "@/components/pagination/Pagination"
import { Table } from "@/components/table/Table"
import { Td } from "@/components/table/Td"
import { Th } from "@/components/table/Th"
import { UserContacts } from "@/components/userContacts/UserContacts"
import { setAppointmentsQuery } from "@/features/appointments/appointmentsSlice"
import { statusOptions } from "@/features/appointments/model/statusAppointments"
import { getAppointmentsThunk } from "@/features/appointments/thunk/getAppointmentsThunk"
import dayjs from "dayjs"
import { useEffect } from "react"
import { useParams } from "react-router-dom"

export const PatientHistory = () => {
  const { patientId } = useParams();
  const dispatch = useAppDispatch();
  const {
     appointmentsLoading,
      appointmentsQuery,
      total,
    } = useAppSelector((state) => state.appointment);
 
  useEffect(() => {
      if (!patientId) {
        return
      }
      dispatch(getAppointmentsThunk({
        ...appointmentsQuery,
        patientId: Number(patientId),
        appointmentStatus:'completed',
        pageSize: 5,
        
      }))
  }, [patientId, appointmentsQuery, dispatch])
    const patientAppointments = useAppSelector(state=>state.appointment.appointments)
  return (<>   {appointmentsLoading ? (
            <Loader />
          ) : (
            <div className="w-full min-h-[380px] p-[16px] rounded-[8px] bg-[#FFFFFF] "> <Table>
                        <thead>
                          <tr className="h-[40px] bg-[#F3F4F6]">
                            <Th>ID</Th>
                            <Th>DOCTOR/CONTACT</Th>
                            <Th>DATE</Th>
                            <Th>TREATMENT</Th>
                            <Th>FEE</Th>
                             <Th>STATUS</Th>
                             
        
                          </tr>
                        </thead>
                        <tbody>
                          {patientAppointments.map((appointment) => (
                            <tr
                              key={appointment.id}
                              
                              className=" h-[40px]  hover:bg-[#DCFCE7] transition-colors"
                            >
                              <Td>{`#${appointment.id}`}</Td>
        
                              <Td>
                                <UserContacts
                                  avatar={"doctor.jpg"}
                                  firstName={`Dr.${appointment.doctorFirstName}`}
                                  lastName={appointment.doctorLastName}
                                  phone={`${appointment.patientPhoneNumber}`}
                                />
                              </Td>
        
                              <Td>  {
                                       <>
                                         <div>
                                            {dayjs(appointment.dateTime).format("YYYY-MM-DD")}
                                         </div>
                                          <div>
                                           {dayjs(appointment.dateTime).format("HH:mm")}
                                          </div>
                                       </>
                                      }</Td>
                              <Td>
                                {
                  appointment.treatment
                                }
                              </Td>
        
                              <Td className="font-[Inter]  text-[#1F2937] font-semibold">{`$${appointment.treatmentPrice}`}</Td>
        
                           
        
                              <Td>{statusOptions.map((status) =>
              
                                status.value === appointment.status && (
                                  <span  key={`${status.value}${status.color}`} className={`text-[12px] ${status.textColor} rounded-[8px] px-[15px] py-[6px] text-[#1F2937] bg-[#E5E7EB]`}>{status.label}</span>
                                ))}
                                </Td>
                            
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      {patientAppointments.length === 0 && (
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
       )}
   </>)
}