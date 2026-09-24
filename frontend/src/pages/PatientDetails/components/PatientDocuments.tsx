import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { AsideMenu } from "@/components/asideMenu/AsideMenu";
import { ButtonPage } from "@/components/button/ButtonsPage";
import { Pagination } from "@/components/pagination/Pagination";

import { getTreatmentsThunk } from "@/features/appointments/thunk/getTreatments";
import { setPatientNotesQuery } from "@/features/patients/patientsSlice";
import { getPatientNotesThunk } from "@/features/patients/thunk/getPatientNotesVisits";
import { VisitEditForm } from "@/features/visits/visitsEditForm";
import {
  
  setCurrentVisit,
} from "@/features/visits/visitsSlice";
import { buttonStyles } from "@/shared/styles/formButtonStyles";
import dayjs from "dayjs";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import {
  
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiEdit2,
  FiPlus,
  FiPrinter,
  FiSearch,
} from "react-icons/fi";
import { useParams } from "react-router-dom";

export const PatientDocuments = () => {
  const [aside, setActiveAside] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState<number[]>([]);
  
  const user = useAppSelector(state=>state.auth.user)
  const { currentVisit, isActiveVisit } = useAppSelector(
    (state) => state.visit,
  );
  const { patientNotes ,patientNotesQuery,patientNotesTotal,loading} = useAppSelector((state) => state.patient);
  const { patientId } = useParams();
  const dispatch = useAppDispatch();

  
useEffect(() => {
  if (!patientId) return;

  dispatch(
    getPatientNotesThunk({
      patientId: Number(patientId),
      page: patientNotesQuery.page,
      pageSize: patientNotesQuery.pageSize,
    }),
  );
}, [
  dispatch,
  patientId,
  patientNotesQuery.page,
  patientNotesQuery.pageSize,
]);
  useEffect(() => {
  dispatch(getTreatmentsThunk(false));
  }, [dispatch]);
  
  useEffect(() => {
    if (!currentVisit || !isActiveVisit || !patientNotes?.length) return;

    const createdVisitNote = patientNotes.find(
      (note) => note.visitId === currentVisit.visitId,
    );

    if (!createdVisitNote) return;
  }, [currentVisit, patientNotes]);
  const files = [
    {
      name: "Panoramic teeth",
      type: "X-ray",
      date: "10.01.2026",
      size: "2.4 MB",
    },
    {
      name: "Molar roots",
      type: "CT Scan",
      date: "15.01.2024",
      size: "2.4 MB",
    },
    {
      name: "Incisor alignment",
      type: "PDF",
      date: "20.01.2024",
      size: "2.4 MB",
    },
    {
      name: "Tooth extraction",
      type: "MRI",
      date: "25.01.2024",
      size: "2.9 MB",
    },
    {
      name: "Gum assessment",
      type: "X-ray",
      date: "30.01.2024",
      size: "2.2 MB",
    },
    {
      name: "Panoramic tooth 34",
      type: "CT Scan",
      date: "30.01.2024",
      size: "2.2 MB",
    },
  ];

  const toogleNotesForm = () => {

    setActiveAside((prev) => !prev)
  }
 
  const handleEditNote = (visitId: number) => {
    const visit = patientNotes?.find((visit) => visit.visitId === visitId);

    if (!visit) return;
    
    dispatch(setCurrentVisit(visit));

   
  
    setActiveAside(true)
  };

  const toggleDetails = (visitId: number) => {
    
    setExpandedNotes((prev) =>
      prev.includes(visitId)
        ? prev.filter((id) => id !== visitId)
        : [...prev, visitId],
    );

   
  };
  return (
  <div className={`flex flex-col gap-2 ${user?.role==='doctor'?"lg:flex-row-reverse":"lg:flex-row"} `}>
        {aside && (
             <AsideMenu
               handleAside={toogleNotesForm}
               content={<VisitEditForm visit={currentVisit}/>}
               footer={
                 <>
                   <ButtonPage
                     className={buttonStyles.formCancel}
                     onClick={toogleNotesForm}
                   >
                     <span className=" text-[#172554]">Cancel</span>
                   </ButtonPage>
     
                   <ButtonPage
                     disabled={loading}
                     type="submit"
                     form="visit-edit"
                     className={buttonStyles.formSubmit}
                   >
                    Save note
                   </ButtonPage>
                 </>
               }
               title={"ADD NOTE"}
               description={"Add clinical note for this visit"}
             />
           )}
      {/* ===================== CLINICAL NOTES ===================== */}

    
      <section className={`rounded-lg border border-gray-200 bg-white p-5 ${
      user?.role === "admin"
        ?  "lg:order-1 lg:flex-[1.45]"
        : "lg:order-2 lg:flex-[1.45]"
    }`}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase text-gray-700">
            Clinical Notes ({patientNotes?.length ?? 0})
          </h2>

          <ButtonPage
            type="button"
            disabled={!isActiveVisit }
            className={buttonStyles.addNote}
             onClick={() => {
    if (!currentVisit) return;

    handleEditNote(currentVisit.visitId);
  }}
          >
            <FiPlus size={14} />
            Add note
          </ButtonPage>
        </div>

        {/* Search */}
        <div className="mb-5 flex h-10 items-center gap-3 rounded-lg border border-gray-200 px-3">
          <FiSearch size={15} className="shrink-0 text-gray-400" />

          <input
            type="text"
            placeholder="Search notes"
            className="w-full bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Notes */}
        {<div className="mb-[24px] relative">
           {loading && (
                      <div className="absolute inset-0 z-10">
                        <Loader />
                      </div>)}
          {patientNotes?.map((note) => {
            const isExpanded = expandedNotes.includes(note.visitId);

            return (
              <article
                key={note.visitId}
                className="border-b border-gray-100 py-3.5 last:border-b-0 mb-[16px]"
              >
                {/* Date + edit */}
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-[9px] font-medium text-gray-400">
                      {dayjs(note.visitDate).format("DD.MM.YYYY")}
                    </p>

                    <h3 className="text-[16px] font-semibold text-[#030712]">
                      {note.mainTreatment}
                    </h3>
                  </div>

                  {/* Edit */}
                  <ButtonPage
                    disabled={isActiveVisit}
                    type="button"
                    onClick={() => handleEditNote(note.visitId)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                    aria-label="Edit note"
                  >
                   
                    
                      <FiEdit2 size={13} />
                   
                  </ButtonPage>
                </div>

                {/* Expanded content */}

               {isExpanded && (
  <div className="mt-4 space-y-4">

    {note.diagnosis && (
      <div className="mb-[30px] rounded-[8px] border border-[#DDE1E6] bg-[#F3F4F6] px-[9px] py-[9px]">
        <p className="mb-[4px] text-[12px] font-semibold uppercase leading-[16px] text-[#1F2937]">
          Diagnosis
        </p>

        <p className="text-[14px] font-normal leading-[24px] text-[#6B7280]">
          {note.diagnosis}
        </p>
      </div>
    )}

    {note.description && (
      <div className="mb-[30px] px-[9px]">
        <p className="mb-[9px] text-[10px] font-medium uppercase leading-[16px] text-[#6B7280]">
          Clinical observation
        </p>

        <p className="text-[14px] font-normal leading-[24px] text-[#1F2937]">
          {note.description}
        </p>
      </div>
    )}

    {note.recommendation && (
      <div className="px-[9px]">
        <p className="mb-[9px] text-[10px] font-medium uppercase leading-[16px] text-[#6B7280]">
          Recommendation
        </p>

        <p className="whitespace-pre-line text-[12px] font-normal leading-[24px] text-[#1F2937]">
          {note.recommendation}
        </p>
      </div>
    )}

  </div>
)}

                {/* Doctor + More details */}
                <div className="mt-3 flex items-center justify-between">
                  {/* Doctor */}
                  <div className="flex items-center gap-2">
                    <img
                      src="/doctor.jpg"
                      alt=""
                      className="h-[24px] w-[24px] rounded-full object-cover"
                    />

                    <span className="text-[12px] text-gray-500">
                      Dr.{note.doctorFirstName} {note.doctorLastName}
                    </span>
                  </div>

                  {/* More / Less details */}

                  <ButtonPage
                    type="button"
                    onClick={() => toggleDetails(note.visitId)}
                    className="flex items-center gap-1 text-[14px] border-0 font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    {isExpanded ? "Less details" : "More details"}

                    {isExpanded ? (
                      <FiChevronUp size={12} />
                    ) : (
                      <FiChevronDown size={12} />
                    )}
                  </ButtonPage>
                </div>
              </article>
              
            );
          })}

         
               
        
        </div>}
        <Pagination
  page={patientNotesQuery.page}
  pageSize={patientNotesQuery.pageSize}
  total={patientNotesTotal}
  onPageChange={(page) => {
    dispatch(setPatientNotesQuery({ page }));
  }}
/>
      </section>

      {/* ===================== FILES ===================== */}

      <section className={`rounded-lg border border-gray-200 bg-white p-5 ${
      user?.role === "admin"
        ?"lg:order-2 lg:flex-1"
        :   "lg:order-1 lg:flex-1"
    }`}>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-[12px] font-semibold uppercase text-gray-700">
            Files \ Documents (12)
          </h2>
        </div>

        {/* Upload */}
        <div className="mb-5 flex h-[120px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700">
            Drop your files here or{" "}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              browse
            </button>
          </p>

          <p className="mt-1 text-xs text-gray-400">Maximum size: 50MB</p>
        </div>

        {/* Table */}
        <div className="overflow-hidden mb-[24px]">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_55px] items-center bg-gray-100 px-2 py-2.5">
            <span className="text-[10px] font-medium uppercase text-gray-500">
              Name
            </span>

            <span className="text-[10px] font-medium uppercase text-gray-500">
              Type
            </span>

            <span className="text-[10px] font-medium uppercase text-gray-500">
              Date
            </span>

            <span className="text-[10px] font-medium uppercase text-gray-500">
              Size
            </span>

            <span className="text-[10px] font-medium uppercase text-gray-500">
              Action
            </span>
          </div>

          {/* Files */}
          {files.map((file) => (
            <div
              key={file.name}
              className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_55px] items-center border-b border-gray-100 px-2 py-2.5"
            >
              <span className="truncate text-[12px] font-medium text-gray-800">
                {file.name}
              </span>

              <span className="text-[12px] text-gray-500">{file.type}</span>

              <span className="text-[12px] text-gray-500">{file.date}</span>

              <span className="text-[12px] text-gray-500">{file.size}</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-gray-700 transition hover:text-blue-600"
                >
                  <FiDownload size={15} />
                </button>

                <button
                  type="button"
                  className="text-gray-700 transition hover:text-blue-600"
                >
                  <FiPrinter size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

       <Pagination
  page={1}
  pageSize={5}
  total={10}
  onPageChange={() => {}}
/>
      </section>
      </div>
    
  );
};
