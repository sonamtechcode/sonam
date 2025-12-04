import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientAdd from './pages/PatientAdd'
import PatientDetail from './pages/PatientDetail'
import PatientProfile from './pages/PatientProfile'
import Doctors from './pages/Doctors'
import DoctorAdd from './pages/DoctorAdd'
import Appointments from './pages/Appointments'
import AppointmentAdd from './pages/AppointmentAdd'
import Departments from './pages/Departments'
import DepartmentAdd from './pages/DepartmentAdd'
import Beds from './pages/Beds'
import Billing from './pages/Billing'
import BillingAdd from './pages/BillingAdd'
import Pharmacy from './pages/Pharmacy'
import PharmacyAdd from './pages/PharmacyAdd'
import Laboratory from './pages/Laboratory'
import LaboratoryAdd from './pages/LaboratoryAdd'
import Staff from './pages/Staff'
import Inventory from './pages/Inventory'
import InventoryAdd from './pages/InventoryAdd'
import Emergency from './pages/Emergency'
import EmergencyAdd from './pages/EmergencyAdd'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Users from './pages/Users'
import UserAdd from './pages/UserAdd'
import Permissions from './pages/Permissions'
import Clinics from './pages/Clinics'
import ClinicAdd from './pages/ClinicAdd'
import ClinicView from './pages/ClinicView'
import Analytics from './pages/Analytics'
import PatientVitals from './pages/PatientVitals'
import Prescriptions from './pages/Prescriptions'
import MedicalHistory from './pages/MedicalHistory'
import DoctorSchedule from './pages/DoctorSchedule'
import DoctorLeaves from './pages/DoctorLeaves'
import LabReports from './pages/LabReports'
import MedicineAlerts from './pages/MedicineAlerts'
import Ambulance from './pages/Ambulance'
import Revenue from './pages/Revenue'
import PatientFeedback from './pages/PatientFeedback'
import Ratings from './pages/Ratings'
import AuditLogs from './pages/AuditLogs'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/add" element={<PatientAdd />} />
        <Route path="patients/view/:id" element={<PatientDetail />} />
        <Route path="patients/profile/:patientId" element={<PatientProfile />} />
        <Route path="patients/edit/:id" element={<PatientAdd />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/add" element={<DoctorAdd />} />
        <Route path="doctors/edit/:id" element={<DoctorAdd />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/add" element={<AppointmentAdd />} />
        <Route path="departments" element={<Departments />} />
        <Route path="departments/add" element={<DepartmentAdd />} />
        <Route path="beds" element={<Beds />} />
        <Route path="billing" element={<Billing />} />
        <Route path="billing/add" element={<BillingAdd />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="pharmacy/add" element={<PharmacyAdd />} />
        <Route path="laboratory" element={<Laboratory />} />
        <Route path="laboratory/add" element={<LaboratoryAdd />} />
        <Route path="staff" element={<Staff />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/add" element={<InventoryAdd />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="emergency/add" element={<EmergencyAdd />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="users/add" element={<UserAdd />} />
        <Route path="users/edit/:id" element={<UserAdd />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="clinics" element={<Clinics />} />
        <Route path="clinics/add" element={<ClinicAdd />} />
        <Route path="clinics/edit/:id" element={<ClinicAdd />} />
        <Route path="clinics/view/:id" element={<ClinicView />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="patient-vitals" element={<PatientVitals />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="doctor-schedule" element={<DoctorSchedule />} />
        <Route path="doctor-leaves" element={<DoctorLeaves />} />
        <Route path="lab-reports" element={<LabReports />} />
        <Route path="medicine-alerts" element={<MedicineAlerts />} />
        <Route path="ambulance" element={<Ambulance />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="feedback" element={<PatientFeedback />} />
        <Route path="ratings" element={<Ratings />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>
    </Routes>
  )
}

export default App
