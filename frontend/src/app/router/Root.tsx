import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { App } from "../App";
import { LoginPage } from "../../pages/LoginPage/LoginPage";

import { ProtectedRoute } from "@/components/protectRoutes/ProtectedRoutes";
import { DoctorsPage } from "@/pages/Doctor/DoctorsPage";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { ReminderPage } from "@/pages/Reminder/ReminderPage";
import { PatientsPage } from "@/pages/Patient/PatientsPage";
import { AppointmentsPage } from "@/pages/Appointments/AppointmentsPage";
import { CalendarPage } from "@/pages/Calendar/CalendarPage";
import { ROUTES } from "@/shared/config/routes";
import { ActivatePage } from "@/pages/Activation/ActivatePage";
import { DoctorDetailsPage } from "@/pages/DoctorDetails/DoctorDetailsPage";
import { PatientDetailsPage } from "@/pages/PatientDetails/PatientDetailsPage";
import { DoctorVisits } from "@/pages/DoctorDetails/components/DoctorVisits";
import { DoctorOverview } from "@/pages/DoctorDetails/components/DoctorOwerview";
import { PatientInformation } from "@/pages/PatientDetails/components/PatientInformation";
import { PatientDocuments } from "@/pages/PatientDetails/components/PatientDocuments";
import { PatientHistory } from "@/pages/PatientDetails/components/PatientHistoty";
import { ErrorPage } from "@/pages/ErrorPages/ErrorPages";
import { errorPageConfig } from "@/pages/ErrorPages/errorConfig";



export const Root: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
       <Route path={ROUTES.ACTIVATE} element={<ActivatePage/>}/>
        <Route path="/" element={<App />}>
          
  

          {/* AUTHENTICATED USERS       */}

<Route element={<ProtectedRoute />}>
  <Route
    path={ROUTES.DASHBOARD}
    element={<DashboardPage />}
  />

  <Route
    path={ROUTES.REMINDER}
    element={<ReminderPage />}
  />

  {/* Patients */}
  <Route
    path={ROUTES.PATIENT}
    element={<PatientsPage />}
  />

  <Route
    path={ROUTES.PATDETAILS}
    element={<PatientDetailsPage />}
  >
    <Route
      index
      element={<PatientInformation />}
    />

    <Route
      path="history"
      element={<PatientHistory />}
    />

    <Route
      path="records"
      element={<PatientDocuments />}
    />
  </Route>

  

  <Route
    path={ROUTES.CALENDAR}
    element={<CalendarPage />}
  />
</Route>



{/* SUPERADMIN / ADMIN ONLY*/}


          <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
            {/* Appointments */}
  <Route
    path={ROUTES.APPOINTMENTS}
    element={<AppointmentsPage />}
            />
         
            
  {/* Doctors list */}
  <Route
    path={ROUTES.DOCTORS}
    element={<DoctorsPage />}
  />

  {/* Doctor details of any doctor */}
  <Route
    path={ROUTES.DETAILS}
    element={<DoctorDetailsPage />}
  >
    <Route
      index
      element={<DoctorOverview />}
    />

    <Route
      path="visits"
      element={<DoctorVisits />}
    />
  </Route>
</Route>



{/* DOCTOR ONLY               */}


<Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
            {/* Current logged-in doctor */}
            
  <Route
    path={ROUTES.MYDOCTOR}
    element={<DoctorDetailsPage />}
            >
              
    <Route
      index
      element={<DoctorOverview />}
    />

    <Route
      path="visits"
      element={<DoctorVisits />}
    />
  </Route>
</Route>
        </Route>
        <Route
  path="/401"
  element={
    <ErrorPage
      code={401}
      {...errorPageConfig[401]}
    />
  }
/>

<Route
  path="/403"
  element={
    <ErrorPage
      code={403}
      {...errorPageConfig[403]}
    />
  }
/>

<Route
  path='/*'
  element={
    <ErrorPage
      code={404}
      {...errorPageConfig[404]}
    />
  }
/>
      </Routes>
    </HashRouter>
  );
};
