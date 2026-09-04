import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { AsideMenu } from "@/components/asideMenu/AsideMenu";
import { ButtonPage } from "@/components/button/ButtonsPage";
import { Loader } from "@/components/loader/Loader";
import { PageTitle } from "@/components/pageTitle/PageTitle";
import { Table } from "@/components/table/Table";
import { PatientCreateForm } from "@/features/patients/PatientCreateForm";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { Td } from "@/components/table/Td";
import { Th } from "@/components/table/Th";
import { useNavigate } from "react-router-dom";
import { UserContacts } from "@/components/userContacts/UserContacts";
import { getAllPatientThunk } from "@/features/patients/thunk/getAllPacientThunk";
import { Filter } from "@/components/filter/Filter";
import { setQuery } from "@/features/patients/patientsSlice";

import { Pagination } from "@/components/pagination/Pagination";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import dayjs from "dayjs";

import { patientManagementThunk } from "@/features/statistics/thunk/patientManagementThunk";
import { patientManagmentCard } from "@/features/statistics/model/patientManagmentCardStatistics";
import { CardStatistics } from "@/components/cardStatistics/CardStatistics";
import { EmptyState } from "@/components/emptyState/EmptyState";
import { getAccess } from "@/premissoons/getAccessPremissions";
import { hygieneStatus } from "@/features/appointments/model/statusPatientHygiene";



export const PatientsPage = () => {
  const [aside, setOpenAside] = useState(false)
  const user = useAppSelector(state => state.auth.user)
  const access = getAccess(user);
  const { loading, patients, query, total } = useAppSelector(state => state.patient)
  const cards = useAppSelector(state=>state.statistic.statistics.patientsManagmentCard)
  const dispatch = useAppDispatch();
  const navigate = useNavigate()
    const handleAside = () =>
    setOpenAside(prev => !prev)
  
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        
        await dispatch(getAllPatientThunk(query)).unwrap()
        await dispatch(patientManagementThunk()).unwrap()
      } 
      catch (e) {
        console.log(e)
      }
    }
    fetchPatient()
  },[dispatch, query])

  return <>
    {aside && (<AsideMenu
      handleAside={handleAside}
      content={<PatientCreateForm />}
      footer = { <>
               <ButtonPage className={buttonStyles.formCancel} onClick={handleAside}>
                      <span className="text-[#172554]">Cancel</span>
                  </ButtonPage>
  
                  <ButtonPage type="submit" form="patient-create" className={buttonStyles.formSubmit}>
                    Send an invitation
                  </ButtonPage>
             </> }
      title={"ADD NEW PATIENT"}
       description={"Fill in the details below"}
    />)}
    <div className="flex justify-between   mb-[25px] h-[57px]" >
     
        <PageTitle
          text={`Patient Managment`}
        description={`${total} die`} />
      
       
      
      
          <div className="flex  gap-4  ">
         
           {access?.canCreatePatient && <ButtonPage className={buttonStyles.createButton}
               onClick={handleAside}
              
              icon={<BiPlus className="mr-[8px]" />} >Add patients</ButtonPage>}
          </div>
           
    </div>
   
    <div className=" grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4 mb-[24px]">
       {cards &&
              patientManagmentCard.map((card) => (
                <CardStatistics         
                  key={card.key}
                  title={card.title}
                  icon={card.icon}
                  iconClass={card.iconClass}
                  value={cards[card.key].total}
                  change={card.change !== null ? Number(card.change) : null}
                />
              ))} 
    </div>
    
     <div className="flex  justify-between">
            <Filter
        className="mb-[16px] w-full"
        search={query.search}
       
        
     
      onSearchChange={(value) =>
      dispatch(setQuery({ search: value, page: 1 }))
                     }
                  
                     
                   />
    
          </div>
   {loading ? (
          <Loader />
        ) : (
          <div className="w-full min-h-[380px] p-[16px] rounded-[8px] bg-[#FFFFFF] ">
            <Table>
              <thead>
                <tr className="h-[40px] bg-[#F3F4F6]">
                  <Th>ID</Th>
                  <Th>PATIENT/CONTACT</Th>
                  <Th>LAST VISIT</Th>
                  <Th>TYPE OF TREATMENT</Th>
                  <Th>TOTAL VISITS</Th>
                  <Th>STATUS</Th>
                 
                
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={`${patient.userId}${patient.id}`}
                    onClick={() => {
                      navigate(`/patients/${patient.id}`);
                    }}
                    className=" h-[40px] cursor-pointer hover:bg-[#DCFCE7] transition-colors"
                  >
                    <Td>{`#${patient.id}`}</Td>
  
                    <Td>
                      <UserContacts
                        avatar="patient.jpg"
                        firstName={patient.firstName}
                        lastName={patient.lastName}
                        phone={patient.phoneNumber}
                      />
                    </Td>
  
                    <Td>  {
                                 patient.lastVisitDate? (<> <div>
                                                  {dayjs(patient.lastVisitDate).format("YYYY-MM-DD")}
                                                </div>
                                                <div className="font-medium text-[#1F2937]">
                                                  {dayjs(patient.lastVisitDate).format("HH:mm")}
                                                </div></>) : "New Patient"
                                              
                                            }</Td>
  
                    <Td>{patient.treatment? patient.treatment : 'Advice'}</Td>
  
                    <Td className="font-medium text-[#1F2937]">{`${patient.totalVisits} visits`}</Td>
  
          
                     <Td>{hygieneStatus.map((status) =>
                          
                                            status.value ===patient.status && (
                                              <span  key={`${status.value}${status.textColor}`} className={`text-[12px] ${status.textColor} rounded-[8px] px-[15px] py-[6px] ${status.color}`}>{status.label}</span>
                                            ))}
                    </Td>
                    
                  </tr>
                ))}
               
                </tbody>
                
              </Table>
               {patients.length === 0 && (
                  <EmptyState description=" No patients match your current filters. Try adjusting or clearing them."/>
          )}
           <Pagination
          page={query.page ?? 1}
          pageSize={query.pageSize ?? 5}
          total={total}
          onPageChange={(page) =>
            dispatch(
              setQuery({
                page,
              }),
            )
          }
        />
        </div>
        
    )}
  </>
};
