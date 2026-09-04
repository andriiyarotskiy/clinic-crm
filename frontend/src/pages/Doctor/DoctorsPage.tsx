import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { AsideMenu } from "@/components/asideMenu/AsideMenu";
import { ButtonPage } from "@/components/button/ButtonsPage";
import { EmptyState } from "@/components/emptyState/EmptyState";
import { Filter } from "@/components/filter/Filter";
import { Loader } from "@/components/loader/Loader";
import { PageTitle } from "@/components/pageTitle/PageTitle";
import { Pagination } from "@/components/pagination/Pagination";
import { Sort } from "@/components/sorter/Sort";

import { Table } from "@/components/table/Table";
import { Td } from "@/components/table/Td";
import { Th } from "@/components/table/Th";
import { UserContacts } from "@/components/userContacts/UserContacts";
import { DoctorCreteForm } from "@/features/doctors/DoctorCreateForm";
import { resetQuery, setQuery } from "@/features/doctors/doctorsSlice";
import { employmentTypes } from "@/features/doctors/model/employmentTypes";
import { doctorSortButtons } from "@/features/doctors/model/sortDoctorTypes";


import { specializations } from "@/features/doctors/model/specialties";
import { getAllDoctorsThunk } from "@/features/doctors/thunk/getAllDoctorsThunk";
import { capitalizeFirstLetter } from "@/shared/functions/capitalizwFirstLetter";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

export const DoctorsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [aside, setOpenAside] = useState(false);  
  const { doctors, total, loading, query } = useAppSelector(
    (state) => state.doctor
  );
  


  useEffect(() => {
  return () => {
    dispatch(resetQuery());
  };
}, [dispatch]);
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        await dispatch(getAllDoctorsThunk(query)).unwrap();
      } catch (error) {
        console.error(error);
      }
    };

    fetchDoctors();
  }, [dispatch, query]);
  

  const handleAside = () => setOpenAside((prev) => !prev);
  return (
    <>
      {aside && (
        <AsideMenu
          handleAside={handleAside}
          content={<DoctorCreteForm handleAside={handleAside} />}
          footer={   <>
                <ButtonPage className={buttonStyles.formCancel} onClick={handleAside}>
                    <span className="text-[#172554]">Cancel</span>
                </ButtonPage>

                <ButtonPage type="submit" form="doctor-create" className={buttonStyles.formSubmit}>
                  Send an invitation
                </ButtonPage>
              </>}
          title={"ADD NEW DOCTOR"}
          description={"Fill in the details below"}
        />
      )}

      <div className="flex justify-between items-center  mb-[16px] h-[57px]">
        <PageTitle
          text={`All doctors`}
          description={`showing ${total} doctors`}
        />
        <div className="flex  gap-4  ">
          <ButtonPage
            className={buttonStyles.createButton}
            onClick={handleAside}
            icon={<BiPlus className="mr-[8px]" />}
          >
            Add doctor
          </ButtonPage>
        </div>
      </div>

      <div className="flex items-center justify-between mb-[16px]">
        <Filter
          
           search={query.search}
  firstSelect={query.specialization}
  secondSelect={query.employmentType}

  firstPlaceholder="Specialty"
  secondPlaceholder="Type"

  firstSelectOptions={specializations}
  secondSelectOptions={employmentTypes}
          onSearchChange={(value) =>
            dispatch(setQuery({ search: value, page: 1 }))
          }
          onFirstSelectChange={(value) =>
            dispatch(setQuery({ specialization: value, page: 1 }))
          }
          onSecondSelectChange={(value) =>
            dispatch(setQuery({ employmentType: value, page: 1 }))
          }
        />
      <Sort
  userCount={doctors.length}
  sortBy={query.sortBy ?? null}
  sortOrder={query.sortOrder ?? null}
  buttons={doctorSortButtons}
  onChange={(sortBy, sortOrder) =>
    dispatch(
      setQuery({
        sortBy: sortBy ?? undefined,
        sortOrder: sortOrder ?? undefined,
        page: 1,
      }),
    )
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
                <Th>DOCTOR/CONTACT</Th>
                <Th>WORKLOAD</Th>
                <Th>SPECIALITY</Th>
                <Th>SCHEDULE</Th>
                <Th>TYPE</Th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr
                  key={doctor.id}
                  onClick={() => {
                    navigate(`/doctors/${doctor.id}`);
                  }}
                  className=" h-[40px] cursor-pointer hover:bg-[#DCFCE7] transition-colors"
                >
                  <Td className="text-[#4B5563] text-[14px]">{`#${doctor.doctorCode}`}</Td>

                  <Td>
                    <UserContacts
                      avatar = {`doctor.jpg`}
                      firstName={`Dr.${doctor.firstName}`}
                      lastName={doctor.lastName}
                      phone={doctor.phoneNumber}
                    />
                  </Td>

                <Td>
  <div className="flex items-center gap-2">
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
      <div
        className={`h-full rounded-full ${
          doctor.workload < 65
            ? "bg-[#FB923C]"
            : doctor.workload < 85
              ? "bg-[#22C55E]"
              : "bg-[#EF4444]"
        }`}
        style={{ width: `${doctor.workload}%` }}
      />
    </div>

    <span className="w-10  text-xs text-gray-600">
      {doctor.workload}%
    </span>
  </div>
</Td>

                  <Td className="text-[14px]">{capitalizeFirstLetter(doctor.specialization)}</Td>

                  <Td>{"09:00-18:00"}</Td>

                     <Td>{employmentTypes.map((status) =>
                        
                                          status.value === doctor.employmentType && (
                                            <span  key={`${status.value}${status.color}`} className={`text-[12px]  rounded-[8px] px-[15px] py-[6px] ${status.color} ${status.textColor}`}>{status.label}</span>
                                          ))}
                                          </Td>
                </tr>
              ))}
             
              </tbody>
              
            </Table>
             {doctors.length === 0 && (
                <EmptyState description=" No doctors match your current filters. Try adjusting or clearing them."/>
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
  );
};
