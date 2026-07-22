import { useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
<<<<<<< Updated upstream
import DynamicRoute from "./DynamicRoutes";
=======
import ProtectedRoute from "./components/ProtectedRoute";
import { RouteConfig } from "./Routes/RouteConfig";
>>>>>>> Stashed changes

/* Core CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";


/* Global Themes */
import "./theme/global.css";

/* Component Shells & Pages */
import MainLayout from "./components/MainLayout";
import ModulePlaceholder from "./components/ModulePlaceholder";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdmissionsEntry from "./pages/Admissions/Forms/Admissions";
import SectionRollNumber from "./pages/Admissions/Forms/SectionandRollNum";
import AdmissionsDashboard from "./pages/Admissions/Forms/AdmissionsDashboard";
import AccountMaster from "./pages/Fees/Forms/AccountMaster";
import HeadsMaster from "./pages/Fees/Forms/HeadsMaster";

/* New Modules Pages */
import AccountingDashboard from "./pages/Accounting/AccountingDashboard";
import PaymentHeads from "./pages/Accounting/PaymentHeads";
import AttendanceDashboard from "./pages/Attendance/Forms/AttendanceDashboard";
import TimeTable from "./pages/Attendance/Forms/TimeTable";
import DisciplineDashboard from "./pages/Discipline/DisciplineDashboard";
import StudentHistory from "./pages/Discipline/StudentHistory";
import EstablishmentDashboard from "./pages/Establishment/EstablishmentDashboard";
import RoomManagementMaster from "./pages/Establishment/RoomManagementMaster";
import ExaminationsDashboard from "./pages/Examinations/ExaminationsDashboard";
import MarksEntry from "./pages/Examinations/MarksEntry";
import FeesDashboard from "./pages/Fees/Forms/FeesDashboard";
import FrontOfficeDashboard from "./pages/Front Office/FrontOfficeDashboard";
import Notification from "./pages/Front Office/Notification";
import GroupsDashboard from "./pages/Groups/GroupsDashboard";
import GroupAllocation from "./pages/Groups/GroupAllocation";
import HostelsDashboard from "./pages/Hostels/HostelsDashboard";
import FeeDueList from "./pages/Hostels/FeeDueList";
import LibraryDashboard from "./pages/Library/LibraryDashboard";
import LibraryMaster from "./pages/Library/LibraryMaster";
import MedicareDashboard from "./pages/Medicare/MedicareDashboard";
import Medicare from "./pages/Medicare/Medicare";
import PayrollDashboard from "./pages/Payroll/PayrollDashboard";
import EmpDetails from "./pages/Payroll/EmpDetails";
import PerformanceDashboard from "./pages/Performance/PerformanceDashboard";
import ReportCard from "./pages/Performance/ReportCard";
import SettingsDashboard from "./pages/Settings/Forms/SettingsDashboard";
import FinancialAcadamicYear from "./pages/Settings/Forms/FinancialAcadamicYear";
import StoresDashboard from "./pages/Stores/StoresDashboard";
import ProductMaster from "./pages/Stores/ProductMaster";
import TappalDashboard from "./pages/Tappal/TappalDashboard";
import InwardPosts from "./pages/Tappal/InwardPosts";
import TransportDashboard from "./pages/Transport/TransportDashboard";
import RouteMaster from "./pages/Transport/RouteMaster";

import GroupChange from "./pages/Admissions/Forms/Group_change";
import TcIssue from "./pages/Admissions/Forms/Tcissues";
import StudyCertificate from "./pages/Admissions/Forms/StudyCertificate";
import CourseCompleted from "./pages/Admissions/Forms/CourseCompleted";
import NoObjectionCertificate from "./pages/Admissions/Forms/NoObjectionCertificate";
import BonafideCertificate from "./pages/Admissions/Forms/Bonafide";
import StudentPromotion from "./pages/Admissions/Forms/StudentPromotion";
import StudentDataExcelExport from "./pages/Admissions/Forms/StudentData";
import SectionChange from "./pages/Admissions/Forms/SectionChange";
import DeleteInActiveStudents from "./pages/Admissions/Forms/Del_InActive_Student";
import TimeAdjustment from "./pages/Attendance/Forms/TimeAdjustment";
import AttendanceByStaff from "./pages/Attendance/Forms/AttendanceByStaff";
import AttendanceByAdmin from "./pages/Attendance/Forms/AttendanceByAdmin";
import TimetableExtraHours from "./pages/Attendance/Forms/TimetableExtraHours";
import Batches from "./pages/Attendance/Forms/Batches";
import AdminPermissions from "./pages/Attendance/Forms/AdminPermissions";
import CheckAttendance from "./pages/Attendance/Forms/CheckAttendance";
import BatchDelete from "./pages/Attendance/Forms/BatchDelete";
import EditEFRMDate from "./pages/Attendance/Forms/EditEFRMDate";
import ModifyAttendance from "./pages/Attendance/Forms/ModifyAttendance";
import DayWiseAttendance from "./pages/Attendance/Forms/DayWiseAttendance";
import AttendanceDeletion from "./pages/Attendance/Forms/AttendanceDeletion";
import AttendanceLateralEntry from "./pages/Attendance/Forms/AttendanceLateralEntry";
import ConsolidatedAttendanceAnalysis from "./pages/Attendance/Forms/ConsolidatedAttendanceAnalysis";
import BatchesMH from "./pages/Attendance/Forms/BatchesMH";
import AttendanceBystaffMH from "./pages/Attendance/Forms/AttendanceBystaffMH";
import AttendanceByAdminMH from "./pages/Attendance/Forms/AttendanceByAdminMH";
import MidAttendanceBlock from "./pages/Attendance/Forms/MidAttendanceBlock";
import StopAttendancePostingDates from "./pages/Attendance/Forms/StopAttendancePostingDates";
import AddAttendance from "./pages/Attendance/Forms/AddAttendance";
import AdmissionView from "./pages/Admissions/Forms/Admissions_VIew";

import ProgrammeMaster from "./pages/Settings/Forms/ProgrammeMaster";
import ReguMaster from "./pages/Settings/Forms/ReguMaster";
import BranchMaster from "./pages/Settings/Forms/BranchMaster";
import SubjectMaster from "./pages/Settings/Forms/SubjectMaster";
import FacultyMaster from "./pages/Settings/Forms/FacultyMaster";
import SectionMaster from "./pages/Settings/Forms/SectionMaster";
import DepartmentMaster from "./pages/Settings/Forms/DepartmentMaster";


setupIonicReact();

const App: React.FC = () => {
  // Track auth session dynamically
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  const storedUser = localStorage.getItem("user");

  const authUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  useEffect(() => {
    const checkUserSession = () => {
      setUser(localStorage.getItem("user"));
    };
    
    // Check local storage updates
    window.addEventListener("storage", checkUserSession);
    const authInterval = setInterval(checkUserSession, 800);
    
    return () => {
      window.removeEventListener("storage", checkUserSession);
      clearInterval(authInterval);
    };
  }, []);




  return (
    <IonApp>
      <IonReactRouter>
<<<<<<< Updated upstream
        {!user ? (
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Redirect from="*" to="/login" />
            </Switch>
          </IonRouterOutlet>
        ) : (
          <MainLayout>

            {/* <Switch>
                <Route exact path="/home" component={Home} />

              
                <Route exact path="/stores/forms/PurchaseVoucher" render={() => <ModulePlaceholder moduleName="PurchaseVoucher" />} />
                <Route exact path="/performance/forms/StudentHistory" render={() => <ModulePlaceholder moduleName="StudentHistory" />} />
                <Route exact path="/settings/forms/FinancialAcadamicYear" component={FinancialAcadamicYear} />
                <Route exact path="/admissions/forms/AdmissionsEntry" component={AdmissionsEntry} />
                <Route exact path="/front-office/reports/VisitorPass" render={() => <ModulePlaceholder moduleName="VisitorPass" />} />
                <Route exact path="/examinations/forms/MarksEntry" component={MarksEntry} />
                <Route exact path="/fee/forms/FeeFineMaster" render={() => <ModulePlaceholder moduleName="FeeFineMaster" />} />
                <Route exact path="/hostel/forms/HostelFeeHeadMaster" render={() => <ModulePlaceholder moduleName="HostelFeeHeadMaster" />} />
                <Route exact path="/transport/forms/BusTermFeeMaster" render={() => <ModulePlaceholder moduleName="BusTermFeeMaster" />} />
                <Route exact path="/fee/forms/AccountMaster" component={AccountMaster} />
                <Route exact path="/payroll/forms/EmpDetails" component={EmpDetails} />
                <Route exact path="/stores/forms/ProductMaster" component={ProductMaster} />
                <Route exact path="/attendance/forms/TimeTable" component={TimeTable} />
                <Route exact path="/medicare/forms/Medicare" component={Medicare} />
                <Route exact path="/discipline/forms/StudentHistory" component={StudentHistory} />
                <Route exact path="/accounting/forms/PaymentHeads" component={PaymentHeads} />
                <Route exact path="/performance/forms/FacultyFeedbackPermissions" render={() => <ModulePlaceholder moduleName="FacultyFeedbackPermissions" />} />
                <Route exact path="/groups/forms/AlumniRegistration" render={() => <ModulePlaceholder moduleName="AlumniRegistration" />} />
                <Route exact path="/establishment/forms/RoomManagementMaster" component={RoomManagementMaster} />
                <Route exact path="/settings/forms/CasteMaster" render={() => <ModulePlaceholder moduleName="CasteMaster" />} />
                <Route exact path="/admissions/forms/SectionRollNumber" component={SectionRollNumber} />
                <Route exact path="/front-office/reports/Enquiries" render={() => <ModulePlaceholder moduleName="Enquiries" />} />
                <Route exact path="/examinations/forms/AdminMarksEntry" render={() => <ModulePlaceholder moduleName="AdminMarksEntry" />} />
                <Route exact path="/attendance/forms/AddAttendance" component={AddAttendance} />
                <Route exact path="/hostel/forms/HostelFeeTermMaster" render={() => <ModulePlaceholder moduleName="HostelFeeTermMaster" />} />
                <Route exact path="/transport/forms/BusFeeMaster" render={() => <ModulePlaceholder moduleName="BusFeeMaster" />} />
                <Route exact path="/fee/forms/FeeMaster" render={() => <ModulePlaceholder moduleName="FeeMaster" />} />
                <Route exact path="/payroll/forms/SalaryScale" render={() => <ModulePlaceholder moduleName="SalaryScale" />} />
                <Route exact path="/stores/forms/VendorMaster" render={() => <ModulePlaceholder moduleName="VendorMaster" />} />
                <Route exact path="/attendance/forms/TimeTableAdjustments" render={() => <ModulePlaceholder moduleName="TimeTableAdjustments" />} />
                <Route exact path="/accounting/forms/Payments" render={() => <ModulePlaceholder moduleName="Payments" />} />
                <Route exact path="/groups/forms/Blog" render={() => <ModulePlaceholder moduleName="Blog" />} />
                <Route exact path="/establishment/forms/HallBookingRequest" render={() => <ModulePlaceholder moduleName="HallBookingRequest" />} />
                <Route exact path="/settings/forms/DepartmentMaster" component={DepartmentMaster} />
                <Route exact path="/admissions/forms/StudentData" render={() => <ModulePlaceholder moduleName="StudentData" />} />
                <Route exact path="/library/forms/BookEntry" render={() => <ModulePlaceholder moduleName="BookEntry" />} />
                <Route exact path="/hostel/forms/HostelFeeMaster" render={() => <ModulePlaceholder moduleName="HostelFeeMaster" />} />
                <Route exact path="/transport/forms/TermBusFeePay" render={() => <ModulePlaceholder moduleName="TermBusFeePay" />} />
                <Route exact path="/fee/forms/HeadMaster" render={() => <ModulePlaceholder moduleName="HeadMaster" />} />
                <Route exact path="/payroll/forms/EmpSalPaySlipGen" render={() => <ModulePlaceholder moduleName="EmpSalPaySlipGen" />} />
                <Route exact path="/stores/forms/StockInward" render={() => <ModulePlaceholder moduleName="StockInward" />} />
                <Route exact path="/attendance/forms/AttendanceByStaff" component={AttendanceByStaff} />
                <Route exact path="/accounting/forms/EditPayments" render={() => <ModulePlaceholder moduleName="EditPayments" />} />
                <Route exact path="/establishment/forms/AssetManagement" render={() => <ModulePlaceholder moduleName="AssetManagement" />} />
                <Route exact path="/settings/forms/ProgrammeMaster" component={ProgrammeMaster} />
                <Route exact path="/admissions/forms/GroupChange" component={GroupChange} />
                <Route exact path="/library/forms/FrequencyMaster" render={() => <ModulePlaceholder moduleName="FrequencyMaster" />} />
                <Route exact path="/hostel/forms/FeePayment" render={() => <ModulePlaceholder moduleName="FeePayment" />} />
                <Route exact path="/transport/forms/RouteMaster" component={RouteMaster} />
                <Route exact path="/fee/forms/MiscHeadsMaster" render={() => <ModulePlaceholder moduleName="MiscHeadsMaster" />} />
                <Route exact path="/payroll/forms/EmpOnlineEpf" render={() => <ModulePlaceholder moduleName="EmpOnlineEpf" />} />
                <Route exact path="/stores/forms/PurchaseReturns" render={() => <ModulePlaceholder moduleName="PurchaseReturns" />} />
                <Route exact path="/attendance/forms/AttendanceByAdmin" component={AttendanceByAdmin} />
                <Route exact path="/settings/forms/BranchMaster" component={BranchMaster} />
                <Route exact path="/admissions/forms/TcIssue" component={TcIssue} />
                <Route exact path="/fee/reports/Certificates" render={() => <ModulePlaceholder moduleName="Certificates" />} />
                <Route exact path="/hostel/forms/FeeDueList" component={FeeDueList} />
                <Route exact path="/transport/forms/VehicleMaster" render={() => <ModulePlaceholder moduleName="VehicleMaster" />} />
                <Route exact path="/fee/forms/MiscFeeChallana" render={() => <ModulePlaceholder moduleName="MiscFeeChallana" />} />
                <Route exact path="/stores/forms/SalesInvoice" render={() => <ModulePlaceholder moduleName="SalesInvoice" />} />
                <Route exact path="/settings/forms/Subjects" render={() => <ModulePlaceholder moduleName="Subjects" />} />
                <Route exact path="/admissions/forms/StudyCertificate" component={StudyCertificate} />
                <Route exact path="/examinations/reports/SubjectWiseCIEPG" render={() => <ModulePlaceholder moduleName="SubjectWiseCIEPG" />} />
                <Route exact path="/hostel/forms/RoomMaster" render={() => <ModulePlaceholder moduleName="RoomMaster" />} />
                <Route exact path="/transport/forms/DriverMaster" render={() => <ModulePlaceholder moduleName="DriverMaster" />} />
                <Route exact path="/fee/forms/FeeChallana" render={() => <ModulePlaceholder moduleName="FeeChallana" />} />
                <Route exact path="/stores/forms/SalesReturn" render={() => <ModulePlaceholder moduleName="SalesReturn" />} />
                <Route exact path="/settings/forms/FacultyMaster" component={FacultyMaster} />
                <Route exact path="/admissions/forms/CourseCompleted" component={CourseCompleted} />
                <Route exact path="/library/forms/LibPurchaseRequest" render={() => <ModulePlaceholder moduleName="LibPurchaseRequest" />} />
                <Route exact path="/hostel/forms/RoomAllotment" render={() => <ModulePlaceholder moduleName="RoomAllotment" />} />
                <Route exact path="/transport/forms/StudentVehicleAllotment" render={() => <ModulePlaceholder moduleName="StudentVehicleAllotment" />} />
                <Route exact path="/fee/forms/FeebankChallana" render={() => <ModulePlaceholder moduleName="FeebankChallana" />} />
                <Route exact path="/stores/forms/StockIssuing" render={() => <ModulePlaceholder moduleName="StockIssuing" />} />
                <Route exact path="/settings/forms/SectionMaster" component={SectionMaster} />
                <Route exact path="/admissions/forms/NoObjectionCertificate" component={NoObjectionCertificate} />
                <Route exact path="/hostel/forms/RoomTransfer" render={() => <ModulePlaceholder moduleName="RoomTransfer" />} />
                <Route exact path="/transport/forms/MeterReading" render={() => <ModulePlaceholder moduleName="MeterReading" />} />
                <Route exact path="/fee/forms/EditFeeChallana" render={() => <ModulePlaceholder moduleName="EditFeeChallana" />} />
                <Route exact path="/stores/forms/PurchaseRequest" render={() => <ModulePlaceholder moduleName="PurchaseRequest" />} />
                <Route exact path="/settings/forms/ReAdmission" render={() => <ModulePlaceholder moduleName="ReAdmission" />} />
                <Route exact path="/admissions/forms/BonafideCertificate" component={BonafideCertificate} />
                <Route exact path="/hostel/forms/Attendence" render={() => <ModulePlaceholder moduleName="Attendence" />} />
                <Route exact path="/fee/forms/ManagementFeeCollection" render={() => <ModulePlaceholder moduleName="ManagementFeeCollection" />} />
                <Route exact path="/stores/forms/ClassBooks" render={() => <ModulePlaceholder moduleName="ClassBooks" />} />
                <Route exact path="/settings/forms/UserAccess" render={() => <ModulePlaceholder moduleName="UserAccess" />} />
                <Route exact path="/admissions/forms/Expendituremaster" render={() => <ModulePlaceholder moduleName="Expendituremaster" />} />
                <Route exact path="/hostel/forms/StudentGatePass" render={() => <ModulePlaceholder moduleName="StudentGatePass" />} />
                <Route exact path="/admissions/forms/Expenditure" render={() => <ModulePlaceholder moduleName="Expenditure" />} />
                <Route exact path="/hostel/forms/GatePassIn" render={() => <ModulePlaceholder moduleName="GatePassIn" />} />
                <Route exact path="/hostel/forms/DeAllocation" render={() => <ModulePlaceholder moduleName="DeAllocation" />} />
                <Route exact path="/admissions/reports/AdmissionList" render={() => <ModulePlaceholder moduleName="AdmissionList" />} />
                <Route exact path="/examinations/reports/InternalMarks" render={() => <ModulePlaceholder moduleName="InternalMarks" />} />
                <Route exact path="/payroll/reports/SalaryBill" render={() => <ModulePlaceholder moduleName="SalaryBill" />} />
                <Route exact path="/attendance/reports/AttendanceReport" render={() => <ModulePlaceholder moduleName="AttendanceReport" />} />
                <Route exact path="/admissions/reports/BonafideCertificate" render={() => <ModulePlaceholder moduleName="BonafideCertificate" />} />
                <Route exact path="/examinations/reports/InternalMarksNotice" render={() => <ModulePlaceholder moduleName="InternalMarksNotice" />} />
                <Route exact path="/payroll/reports/EpfStatement" render={() => <ModulePlaceholder moduleName="EpfStatement" />} />
                <Route exact path="/admissions/reports/CourseComplete" render={() => <ModulePlaceholder moduleName="CourseComplete" />} />
                <Route exact path="/payroll/reports/IncomeTaxStatement" render={() => <ModulePlaceholder moduleName="IncomeTaxStatement" />} />
                <Route exact path="/admissions/reports/NoObjection" render={() => <ModulePlaceholder moduleName="NoObjection" />} />
                <Route exact path="/payroll/reports/PaySlips" render={() => <ModulePlaceholder moduleName="PaySlips" />} />
                <Route exact path="/admissions/reports/NoticeBoard" render={() => <ModulePlaceholder moduleName="NoticeBoard" />} />
                <Route exact path="/payroll/reports/GlisStatement" render={() => <ModulePlaceholder moduleName="GlisStatement" />} />
                <Route exact path="/admissions/reports/ReAdmited" render={() => <ModulePlaceholder moduleName="ReAdmited" />} />
                <Route exact path="/admissions/reports/Study" render={() => <ModulePlaceholder moduleName="Study" />} />
                <Route exact path="/admissions/reports/Transfer" render={() => <ModulePlaceholder moduleName="Transfer" />} />
                <Route exact path="/stores/forms/IndentRequest" render={() => <ModulePlaceholder moduleName="IndentRequest" />} />
                <Route exact path="/tappal/forms/InwardPosts" component={InwardPosts} />
                <Route exact path="/tappal/forms/OutwardPosts" render={() => <ModulePlaceholder moduleName="OutwardPosts" />} />
                <Route exact path="/tappal/forms/TappalTransactions" render={() => <ModulePlaceholder moduleName="TappalTransactions" />} />
                <Route exact path="/fee/forms/CertificateFeePayment" render={() => <ModulePlaceholder moduleName="CertificateFeePayment" />} />
                <Route exact path="/attendance/reports/TimeTableReport" render={() => <ModulePlaceholder moduleName="TimeTableReport" />} />
                <Route exact path="/attendance/reports/FacultyTimeTable" render={() => <ModulePlaceholder moduleName="FacultyTimeTable" />} />
                <Route exact path="/settings/forms/LeaveType" render={() => <ModulePlaceholder moduleName="LeaveType" />} />
                <Route exact path="/payroll/reports/LeavesReport" render={() => <ModulePlaceholder moduleName="LeavesReport" />} />
                <Route exact path="/payroll/reports/NetStatement" render={() => <ModulePlaceholder moduleName="NetStatement" />} />
                <Route exact path="/settings/forms/RequestSettings" render={() => <ModulePlaceholder moduleName="RequestSettings" />} />
                <Route exact path="/payroll/forms/LeaveRequest" render={() => <ModulePlaceholder moduleName="LeaveRequest" />} />
                <Route exact path="/payroll/forms/ReceivedRequests" render={() => <ModulePlaceholder moduleName="ReceivedRequests" />} />
                <Route exact path="/stores/forms/HallBookingRequest" render={() => <ModulePlaceholder moduleName="HallBookingRequest" />} />
                <Route exact path="/admissions/reports/AddressSlips" render={() => <ModulePlaceholder moduleName="AddressSlips" />} />
                <Route exact path="/settings/forms/FormRegistration" render={() => <ModulePlaceholder moduleName="FormRegistration" />} />
                <Route exact path="/front-office/forms/VisitorPass" render={() => <ModulePlaceholder moduleName="VisitorPassForm" />} />
                <Route exact path="/settings/forms/SmsSettings" render={() => <ModulePlaceholder moduleName="SmsSettings" />} />
                <Route exact path="/fee/reports/DFCR" render={() => <ModulePlaceholder moduleName="DFCR" />} />
                <Route exact path="/fee/forms/FeeChallanaonline" render={() => <ModulePlaceholder moduleName="FeeChallanaonline" />} />
                <Route exact path="/settings/forms/Authorizations" render={() => <ModulePlaceholder moduleName="Authorizations" />} />
                <Route exact path="/attendance/forms/TimetableExtraHours" component={TimetableExtraHours} />
                <Route exact path="/payroll/reports/LicStatement" render={() => <ModulePlaceholder moduleName="LicStatement" />} />
                <Route exact path="/payroll/reports/ConsolidateStatement" render={() => <ModulePlaceholder moduleName="ConsolidateStatement" />} />
                <Route exact path="/payroll/reports/NetPayCertificate" render={() => <ModulePlaceholder moduleName="NetPayCertificate" />} />
                <Route exact path="/payroll/reports/LicCertificate" render={() => <ModulePlaceholder moduleName="LicCertificate" />} />
                <Route exact path="/payroll/reports/GlisCertificate" render={() => <ModulePlaceholder moduleName="GlisCertificate" />} />
                <Route exact path="/attendance/reports/PeriodAdjustment" render={() => <ModulePlaceholder moduleName="PeriodAdjustment" />} />
                <Route exact path="/payroll/reports/EmployeeList" render={() => <ModulePlaceholder moduleName="EmployeeList" />} />
                <Route exact path="/payroll/reports/PtaxCertificate" render={() => <ModulePlaceholder moduleName="PtaxCertificate" />} />
                <Route exact path="/admissions/reports/AdmissionRegister" render={() => <ModulePlaceholder moduleName="AdmissionRegister" />} />
                <Route exact path="/settings/forms/RegnoGeneration" render={() => <ModulePlaceholder moduleName="RegnoGeneration" />} />
                <Route exact path="/admissions/reports/AdmissionReport" render={() => <ModulePlaceholder moduleName="AdmissionReport" />} />
                <Route exact path="/admissions/reports/StudentInfo" render={() => <ModulePlaceholder moduleName="StudentInfo" />} />
                <Route exact path="/admissions/reports/TcIssuedList" render={() => <ModulePlaceholder moduleName="TcIssuedList" />} />
                <Route exact path="/library/forms/BlockStudent" render={() => <ModulePlaceholder moduleName="BlockStudent" />} />
                <Route exact path="/settings/forms/Accessibility" render={() => <ModulePlaceholder moduleName="Accessibility" />} />
                <Route exact path="/settings/forms/SpecialAccess" render={() => <ModulePlaceholder moduleName="SpecialAccess" />} />
                <Route exact path="/accounting/forms/BudgetHeads" render={() => <ModulePlaceholder moduleName="BudgetHeads" />} />
                <Route exact path="/payroll/forms/EmployeeProfile" render={() => <ModulePlaceholder moduleName="EmployeeProfile" />} />
                <Route exact path="/payroll/forms/EmpFacultyMaster" render={() => <ModulePlaceholder moduleName="EmpFacultyMaster" />} />
                <Route exact path="/payroll/forms/EmployeeAuthentication" render={() => <ModulePlaceholder moduleName="EmployeeAuthentication" />} />
                <Route exact path="/payroll/forms/EmployeeRequests" render={() => <ModulePlaceholder moduleName="EmployeeRequests" />} />
                <Route exact path="/settings/forms/ChangePassword" render={() => <ModulePlaceholder moduleName="ChangePassword" />} />
                <Route exact path="/settings/forms/PeriodSettings" render={() => <ModulePlaceholder moduleName="PeriodSettings" />} />
                <Route exact path="/attendance/reports/PeriodCancel" render={() => <ModulePlaceholder moduleName="PeriodCancel" />} />
                <Route exact path="/payroll/reports/EmpAttendanceReport" render={() => <ModulePlaceholder moduleName="EmpAttendanceReport" />} />
                <Route exact path="/payroll/reports/EmpTimeTable" render={() => <ModulePlaceholder moduleName="EmpTimeTable" />} />
                <Route exact path="/payroll/reports/EmpPeriodAdjustment" render={() => <ModulePlaceholder moduleName="EmpPeriodAdjustment" />} />
                <Route exact path="/attendance/reports/ExtraPeriod" render={() => <ModulePlaceholder moduleName="ExtraPeriod" />} />
                <Route exact path="/payroll/reports/EmpWorkReport" render={() => <ModulePlaceholder moduleName="EmpWorkReport" />} />
                <Route exact path="/accounting/forms/Budget" render={() => <ModulePlaceholder moduleName="Budget" />} />
                <Route exact path="/accounting/reports/PaymentsReport" render={() => <ModulePlaceholder moduleName="PaymentsReport" />} />
                <Route exact path="/payroll/reports/EmpExtraPeriod" render={() => <ModulePlaceholder moduleName="EmpExtraPeriod" />} />
                <Route exact path="/payroll/reports/EmpPaySlip" render={() => <ModulePlaceholder moduleName="EmpPaySlip" />} />
                <Route exact path="/payroll/reports/EmpLeavesReport" render={() => <ModulePlaceholder moduleName="EmpLeavesReport" />} />
                <Route exact path="/payroll/reports/EmpWorkReportPersonal" render={() => <ModulePlaceholder moduleName="EmpWorkReportPersonal" />} />
                <Route exact path="/payroll/forms/HodEmpDetails" render={() => <ModulePlaceholder moduleName="HodEmpDetails" />} />
                <Route exact path="/payroll/forms/HodFacultyMaster" render={() => <ModulePlaceholder moduleName="HodFacultyMaster" />} />
                <Route exact path="/payroll/forms/HodAuthentication" render={() => <ModulePlaceholder moduleName="HodAuthentication" />} />
                <Route exact path="/library/reports/UserWiseBookHistory" render={() => <ModulePlaceholder moduleName="UserWiseBookHistory" />} />
                <Route exact path="/library/reports/DeptWiseBookHistory" render={() => <ModulePlaceholder moduleName="DeptWiseBookHistory" />} />
                <Route exact path="/payroll/reports/HodAttendanceReport" render={() => <ModulePlaceholder moduleName="HodAttendanceReport" />} />
                <Route exact path="/payroll/reports/HodFacultyTimeTable" render={() => <ModulePlaceholder moduleName="HodFacultyTimeTable" />} />
                <Route exact path="/payroll/reports/HodPeriodAdjustment" render={() => <ModulePlaceholder moduleName="HodPeriodAdjustment" />} />
                <Route exact path="/payroll/reports/HodExtraPeriod" render={() => <ModulePlaceholder moduleName="HodExtraPeriod" />} />
                <Route exact path="/admissions/reports/AdmissionStatement" render={() => <ModulePlaceholder moduleName="AdmissionStatement" />} />
                <Route exact path="/payroll/reports/HodLeavesReport" render={() => <ModulePlaceholder moduleName="HodLeavesReport" />} />
                <Route exact path="/payroll/reports/HodWorkReport" render={() => <ModulePlaceholder moduleName="HodWorkReport" />} />
                <Route exact path="/payroll/reports/HodMarksReport" render={() => <ModulePlaceholder moduleName="HodMarksReport" />} />
                <Route exact path="/payroll/reports/EmpMarksReport" render={() => <ModulePlaceholder moduleName="EmpMarksReport" />} />
                <Route exact path="/accounting/reports/BudgetBalanceSheet" render={() => <ModulePlaceholder moduleName="BudgetBalanceSheet" />} />
                <Route exact path="/attendance/reports/WorkReport" render={() => <ModulePlaceholder moduleName="WorkReport" />} />
                <Route exact path="/settings/forms/UserGroup" render={() => <ModulePlaceholder moduleName="UserGroup" />} />
                <Route exact path="/examinations/forms/ResultEntry" render={() => <ModulePlaceholder moduleName="ResultEntry" />} />
                <Route exact path="/fee/reports/FeeDuesList" render={() => <ModulePlaceholder moduleName="FeeDuesList" />} />
                <Route exact path="/transport/reports/VehicleDetails" render={() => <ModulePlaceholder moduleName="VehicleDetails" />} />
                <Route exact path="/fee/reports/FeeStructure" render={() => <ModulePlaceholder moduleName="FeeStructure" />} />
                <Route exact path="/stores/reports/StockOutward" render={() => <ModulePlaceholder moduleName="StockOutward" />} />
                <Route exact path="/hostel/reports/HostelFeeDues" render={() => <ModulePlaceholder moduleName="HostelFeeDues" />} />
                <Route exact path="/tappal/reports/TappalTransactions" render={() => <ModulePlaceholder moduleName="TappalTransactions" />} />
                <Route exact path="/tappal/reports/TappalOutward" render={() => <ModulePlaceholder moduleName="TappalOutward" />} />
                <Route exact path="/hostel/reports/HostelAllotedList" render={() => <ModulePlaceholder moduleName="HostelAllotedList" />} />
                <Route exact path="/hostel/reports/HostelDeAllocationList" render={() => <ModulePlaceholder moduleName="HostelDeAllocationList" />} />
                <Route exact path="/hostel/reports/HostelBedDetails" render={() => <ModulePlaceholder moduleName="HostelBedDetails" />} />
                <Route exact path="/hostel/reports/HostelStdGatePassList" render={() => <ModulePlaceholder moduleName="HostelStdGatePassList" />} />
                <Route exact path="/library/reports/BookIssued" render={() => <ModulePlaceholder moduleName="BookIssued" />} />
                <Route exact path="/stores/forms/GoodsOutIn" render={() => <ModulePlaceholder moduleName="GoodsOutIn" />} />
                <Route exact path="/library/forms/BookRecord" render={() => <ModulePlaceholder moduleName="BookRecord" />} />
                <Route exact path="/accounting/reports/AbstractDFCR" render={() => <ModulePlaceholder moduleName="AbstractDFCR" />} />
                <Route exact path="/transport/reports/MeterReadings" render={() => <ModulePlaceholder moduleName="MeterReadings" />} />
                <Route exact path="/transport/reports/RouteMaster" render={() => <ModulePlaceholder moduleName="RouteMaster" />} />
                <Route exact path="/library/reports/BooksReport" render={() => <ModulePlaceholder moduleName="BooksReport" />} />
                <Route exact path="/payroll/forms/MyAccessibility" render={() => <ModulePlaceholder moduleName="MyAccessibility" />} />
                <Route exact path="/settings/forms/ResetPassword" render={() => <ModulePlaceholder moduleName="ResetPassword" />} />
                <Route exact path="/library/reports/StaffDueList" render={() => <ModulePlaceholder moduleName="StaffDueList" />} />
                <Route exact path="/fee/forms/Admfeetypemaster" render={() => <ModulePlaceholder moduleName="Admfeetypemaster" />} />
                <Route exact path="/admissions/forms/AdmissionView" component={AdmissionView} />
                <Route exact path="/payroll/reports/HodClassTimeTable" render={() => <ModulePlaceholder moduleName="HodClassTimeTable" />} />
                <Route exact path="/payroll/reports/HodFacultyPeriodAdjustment" render={() => <ModulePlaceholder moduleName="HodFacultyPeriodAdjustment" />} />
                <Route exact path="/transport/reports/StdVehicleAllot" render={() => <ModulePlaceholder moduleName="StdVehicleAllot" />} />
                <Route exact path="/transport/reports/DriverMaster" render={() => <ModulePlaceholder moduleName="DriverMaster" />} />
                <Route exact path="/payroll/reports/HodPeriodCancel" render={() => <ModulePlaceholder moduleName="HodPeriodCancel" />} />
                <Route exact path="/library/reports/LibMasters" render={() => <ModulePlaceholder moduleName="LibMasters" />} />
                <Route exact path="/stores/reports/VendorDetails" render={() => <ModulePlaceholder moduleName="VendorDetails" />} />
                <Route exact path="/stores/reports/StockInward" render={() => <ModulePlaceholder moduleName="StockInward" />} />
                <Route exact path="/stores/reports/StockReturns" render={() => <ModulePlaceholder moduleName="StockReturns" />} />
                <Route exact path="/stores/reports/RoomManagement" render={() => <ModulePlaceholder moduleName="RoomManagement" />} />
                <Route exact path="/transport/reports/TransportDues" render={() => <ModulePlaceholder moduleName="TransportDues" />} />
                <Route exact path="/tappal/reports/TappalInwardPosts" render={() => <ModulePlaceholder moduleName="TappalInwardPosts" />} />
                <Route exact path="/stores/reports/GoodsInOut" render={() => <ModulePlaceholder moduleName="GoodsInOut" />} />
                <Route exact path="/establishment/reports/AssetManagement" render={() => <ModulePlaceholder moduleName="AssetManagement" />} />
                <Route exact path="/library/reports/BookRenewed" render={() => <ModulePlaceholder moduleName="BookRenewed" />} />
                <Route exact path="/library/reports/BookDamage" render={() => <ModulePlaceholder moduleName="BookDamage" />} />
                <Route exact path="/library/reports/BookLost" render={() => <ModulePlaceholder moduleName="BookLost" />} />
                <Route exact path="/library/reports/BookReturn" render={() => <ModulePlaceholder moduleName="BookReturn" />} />
                <Route exact path="/settings/reports/CasteMaster" render={() => <ModulePlaceholder moduleName="CasteMaster" />} />
                <Route exact path="/settings/reports/DepartmentMaster" render={() => <ModulePlaceholder moduleName="DepartmentMaster" />} />
                <Route exact path="/settings/reports/ProgWiseBranches" render={() => <ModulePlaceholder moduleName="ProgWiseBranches" />} />
                <Route exact path="/settings/reports/SectionMaster" render={() => <ModulePlaceholder moduleName="SectionMaster" />} />
                <Route exact path="/payroll/forms/EmpProfessionalTax" render={() => <ModulePlaceholder moduleName="EmpProfessionalTax" />} />
                <Route exact path="/admissions/reports/SectionRollNumber" render={() => <ModulePlaceholder moduleName="SectionRollNumber" />} />
                <Route exact path="/front-office/forms/Notifications" render={() => <ModulePlaceholder moduleName="Notifications" />} />
                <Route exact path="/front-office/forms/DeptNotifications" render={() => <ModulePlaceholder moduleName="DeptNotifications" />} />
                <Route exact path="/medicare/reports/MedicareStatus" render={() => <ModulePlaceholder moduleName="MedicareStatus" />} />
                <Route exact path="/library/reports/StudentDueList" render={() => <ModulePlaceholder moduleName="StudentDueList" />} />
                <Route exact path="/library/reports/JournalsHistory" render={() => <ModulePlaceholder moduleName="JournalsHistory" />} />
                <Route exact path="/settings/reports/SubjectMaster" render={() => <ModulePlaceholder moduleName="SubjectMaster" />} />
                <Route exact path="/library/reports/JournalsRecord" render={() => <ModulePlaceholder moduleName="JournalsRecord" />} />
                <Route exact path="/settings/reports/UserGroups" render={() => <ModulePlaceholder moduleName="UserGroups" />} />
                <Route exact path="/settings/forms/DBBackup" render={() => <ModulePlaceholder moduleName="DBBackup" />} />
                <Route exact path="/admissions/reports/StudentInformationA4" render={() => <ModulePlaceholder moduleName="StudentInformationA4" />} />
                <Route exact path="/settings/reports/SectionwiseStudentCount" render={() => <ModulePlaceholder moduleName="SectionwiseStudentCount" />} />
                <Route exact path="/settings/reports/SendSmsDetails" render={() => <ModulePlaceholder moduleName="SendSmsDetails" />} />
                <Route exact path="/attendance/forms/Batches" component={Batches} />
                <Route exact path="/fee/forms/AdmissionModes" render={() => <ModulePlaceholder moduleName="AdmissionModes" />} />
                <Route exact path="/admissions/reports/SectionwiseStudentCount" render={() => <ModulePlaceholder moduleName="SectionwiseStudentCount" />} />
                <Route exact path="/admissions/reports/SectionwiseStudentDetails" render={() => <ModulePlaceholder moduleName="SectionwiseStudentDetails" />} />
                <Route exact path="/attendance/reports/AbsentList" render={() => <ModulePlaceholder moduleName="AbsentList" />} />
                <Route exact path="/settings/reports/ExternalLink1" render={() => <ModulePlaceholder moduleName="ExternalLink1" />} />
                <Route exact path="/admissions/reports/RollsList" render={() => <ModulePlaceholder moduleName="RollsList" />} />
                <Route exact path="/payroll/forms/LicMaster" render={() => <ModulePlaceholder moduleName="LicMaster" />} />
                <Route exact path="/admissions/forms/StudentPromotion" component={StudentPromotion} />
                <Route exact path="/payroll/reports/PtaxStatement" render={() => <ModulePlaceholder moduleName="PtaxStatement" />} />
                <Route exact path="/payroll/reports/EsiStatement" render={() => <ModulePlaceholder moduleName="EsiStatement" />} />
                <Route exact path="/payroll/reports/BudgetSalaryStatement" render={() => <ModulePlaceholder moduleName="BudgetSalaryStatement" />} />
                <Route exact path="/settings/reports/ExternalLink2" render={() => <ModulePlaceholder moduleName="ExternalLink2" />} />
                <Route exact path="/library/forms/BookReservation" render={() => <ModulePlaceholder moduleName="BookReservation" />} />
                <Route exact path="/settings/forms/Holidays" render={() => <ModulePlaceholder moduleName="Holidays" />} />
                <Route exact path="/attendance/forms/AttendanceLateralEntry" component={AttendanceLateralEntry} />
                <Route exact path="/payroll/reports/EmployeeDetails" render={() => <ModulePlaceholder moduleName="EmployeeDetails" />} />
                <Route exact path="/admissions/reports/StudentDetails" render={() => <ModulePlaceholder moduleName="StudentDetails" />} />
                <Route exact path="/fee/forms/FeeConcession" render={() => <ModulePlaceholder moduleName="FeeConcession" />} />
                <Route exact path="/settings/forms/SendSmsOnline" render={() => <ModulePlaceholder moduleName="SendSmsOnline" />} />
                <Route exact path="/settings/forms/Feedback" render={() => <ModulePlaceholder moduleName="Feedback" />} />
                <Route exact path="/settings/forms/ExamMidMaster" render={() => <ModulePlaceholder moduleName="ExamMidMaster" />} />
                <Route exact path="/admissions/reports/CastwiseBranchwiseStrength" render={() => <ModulePlaceholder moduleName="CastwiseBranchwiseStrength" />} />
                <Route exact path="/admissions/reports/CategorywiseStudentStrength" render={() => <ModulePlaceholder moduleName="CategorywiseStudentStrength" />} />
                <Route exact path="/admissions/reports/CategorywiseBranchStrength" render={() => <ModulePlaceholder moduleName="CategorywiseBranchStrength" />} />
                <Route exact path="/admissions/reports/GenderwiseStudentStrength" render={() => <ModulePlaceholder moduleName="GenderwiseStudentStrength" />} />
                <Route exact path="/admissions/reports/TotalStudentsStrengthasonRolls" render={() => <ModulePlaceholder moduleName="TotalStudentsStrengthasonRolls" />} />
                <Route exact path="/admissions/reports/CategorywiseStudentsLists" render={() => <ModulePlaceholder moduleName="CategorywiseStudentsLists" />} />
                <Route exact path="/attendance/reports/AttendancePercentage" render={() => <ModulePlaceholder moduleName="AttendancePercentage" />} />
                <Route exact path="/settings/forms/LearningMethodsMaster" render={() => <ModulePlaceholder moduleName="LearningMethodsMaster" />} />
                <Route exact path="/attendance/forms/AdminPermissions" component={AdminPermissions} />
                <Route exact path="/attendance/reports/AttendanceNotPostedByFaculty" render={() => <ModulePlaceholder moduleName="AttendanceNotPostedByFaculty" />} />
                <Route exact path="/discipline/forms/GrievanceMaster" render={() => <ModulePlaceholder moduleName="GrievanceMaster" />} />
                <Route exact path="/discipline/forms/GrievanceSettings" render={() => <ModulePlaceholder moduleName="GrievanceSettings" />} />
                <Route exact path="/discipline/forms/GrievanceRegistration" render={() => <ModulePlaceholder moduleName="GrievanceRegistration" />} />
                <Route exact path="/attendance/forms/CheckAttendance" component={CheckAttendance} />
                <Route exact path="/attendance/reports/AbsentListSms" render={() => <ModulePlaceholder moduleName="AbsentListSms" />} />
                <Route exact path="/payroll/forms/PersonalLoanMaster" render={() => <ModulePlaceholder moduleName="PersonalLoanMaster" />} />
                <Route exact path="/payroll/forms/BasicIncrements" render={() => <ModulePlaceholder moduleName="BasicIncrements" />} />
                <Route exact path="/fee/reports/ReceiptNoWiseDFCR" render={() => <ModulePlaceholder moduleName="ReceiptNoWiseDFCR" />} />
                <Route exact path="/payroll/reports/ConsolidateAnnualStatement" render={() => <ModulePlaceholder moduleName="ConsolidateAnnualStatement" />} />
                <Route exact path="/payroll/forms/EmployeeDetailsExport" render={() => <ModulePlaceholder moduleName="EmployeeDetailsExport" />} />
                <Route exact path="/payroll/forms/EmployeeDeductions" render={() => <ModulePlaceholder moduleName="EmployeeDeductions" />} />
                <Route exact path="/library/forms/BookMasters" render={() => <ModulePlaceholder moduleName="BookMasters" />} />
                <Route exact path="/fee/reports/StudentFee" render={() => <ModulePlaceholder moduleName="StudentFee" />} />
                <Route exact path="/library/forms/GoodsReceipt" render={() => <ModulePlaceholder moduleName="GoodsReceipt" />} />
                <Route exact path="/library/forms/SubscriptionItems" render={() => <ModulePlaceholder moduleName="SubscriptionItems" />} />
                <Route exact path="/library/forms/InvoicePayment" render={() => <ModulePlaceholder moduleName="InvoicePayment" />} />
                <Route exact path="/library/reports/IssuesAndReturns" render={() => <ModulePlaceholder moduleName="IssuesAndReturns" />} />
                <Route exact path="/examinations/forms/AttendanceMarks" render={() => <ModulePlaceholder moduleName="AttendanceMarks" />} />
                <Route exact path="/library/forms/JournalsBinding" render={() => <ModulePlaceholder moduleName="JournalsBinding" />} />
                <Route exact path="/library/forms/SubscriptionPayments" render={() => <ModulePlaceholder moduleName="SubscriptionPayments" />} />
                <Route exact path="/payroll/reports/EmpIndividualPaySlip" render={() => <ModulePlaceholder moduleName="EmpIndividualPaySlip" />} />
                <Route exact path="/library/reports/Acquision" render={() => <ModulePlaceholder moduleName="Acquision" />} />
                <Route exact path="/library/reports/Accessions" render={() => <ModulePlaceholder moduleName="Accessions" />} />
                <Route exact path="/library/forms/JrnlsPenaltySlab" render={() => <ModulePlaceholder moduleName="JrnlsPenaltySlab" />} />
                <Route exact path="/transport/reports/RoutewiseTransportFeeDue" render={() => <ModulePlaceholder moduleName="RoutewiseTransportFeeDue" />} />
                <Route exact path="/payroll/forms/PayrollGroupingMaster" render={() => <ModulePlaceholder moduleName="PayrollGroupingMaster" />} />
                <Route exact path="/payroll/reports/AnnualSalaryAbstract" render={() => <ModulePlaceholder moduleName="AnnualSalaryAbstract" />} />
                <Route exact path="/payroll/reports/PayrollGroupSummary" render={() => <ModulePlaceholder moduleName="PayrollGroupSummary" />} />
                <Route exact path="/payroll/reports/SalariesAquittance" render={() => <ModulePlaceholder moduleName="SalariesAquittance" />} />
                <Route exact path="/payroll/reports/ChequesList" render={() => <ModulePlaceholder moduleName="ChequesList" />} />
                <Route exact path="/library/forms/ReferenceIssueCopy" render={() => <ModulePlaceholder moduleName="ReferenceIssueCopy" />} />
                <Route exact path="/library/forms/BindingTransactions" render={() => <ModulePlaceholder moduleName="BindingTransactions" />} />
                <Route exact path="/library/reports/StockVerification" render={() => <ModulePlaceholder moduleName="StockVerification" />} />
                <Route exact path="/library/reports/MemberHistory" render={() => <ModulePlaceholder moduleName="MemberHistory" />} />
                <Route exact path="/admissions/forms/DeleteInActiveStudents" component={DeleteInActiveStudents} />
                <Route exact path="/attendance/forms/EditAttendance" render={() => <ModulePlaceholder moduleName="EditAttendance" />} />
                <Route exact path="/examinations/reports/ConsolidatedInternalMarks" render={() => <ModulePlaceholder moduleName="ConsolidatedInternalMarks" />} />
                <Route exact path="/library/reports/BookEditionCount" render={() => <ModulePlaceholder moduleName="BookEditionCount" />} />
                <Route exact path="/attendance/forms/EditEfromDate" component={EditEFRMDate} />
                <Route exact path="/settings/forms/AttendanceDatesMaster" render={() => <ModulePlaceholder moduleName="AttendanceDatesMaster" />} />
                <Route exact path="/settings/forms/InternalDatesMaster" render={() => <ModulePlaceholder moduleName="InternalDatesMaster" />} />
                <Route exact path="/examinations/reports/AccyrPerformanceUG" render={() => <ModulePlaceholder moduleName="AccyrPerformanceUG" />} />
                <Route exact path="/examinations/reports/AccyrPerformancePG" render={() => <ModulePlaceholder moduleName="AccyrPerformancePG" />} />
                <Route exact path="/examinations/reports/AccyrPerformanceR14UG" render={() => <ModulePlaceholder moduleName="AccyrPerformanceR14UG" />} />
                <Route exact path="/settings/forms/CategoryMaster" render={() => <ModulePlaceholder moduleName="CategoryMaster" />} />
                <Route exact path="/library/reports/DailyFineCollection" render={() => <ModulePlaceholder moduleName="DailyFineCollection" />} />
                <Route exact path="/discipline/forms/StudentsLoginControl" render={() => <ModulePlaceholder moduleName="StudentsLoginControl" />} />
                <Route exact path="/attendance/forms/AttendanceDeletion" component={AttendanceDeletion} />
                <Route exact path="/settings/forms/LoginStatus" render={() => <ModulePlaceholder moduleName="LoginStatus" />} />
                <Route exact path="/library/forms/MemberInformation" render={() => <ModulePlaceholder moduleName="MemberInformation" />} />
                <Route exact path="/admissions/reports/NominalRolls" render={() => <ModulePlaceholder moduleName="NominalRolls" />} />
                <Route exact path="/examinations/reports/InternalMarksR14UG" render={() => <ModulePlaceholder moduleName="InternalMarksR14UG" />} />
                <Route exact path="/examinations/reports/SubjectWiseCIEUG" render={() => <ModulePlaceholder moduleName="SubjectWiseCIEUG" />} />
                <Route exact path="/examinations/reports/SessionalMarks" render={() => <ModulePlaceholder moduleName="SessionalMarks" />} />
                <Route exact path="/examinations/reports/AssignmentMarks" render={() => <ModulePlaceholder moduleName="AssignmentMarks" />} />
                <Route exact path="/examinations/reports/OnlineQuizMarks" render={() => <ModulePlaceholder moduleName="OnlineQuizMarks" />} />
                <Route exact path="/admissions/forms/StudentDataExcelExport" component={StudentDataExcelExport} />
                <Route exact path="/library/reports/IssuesAndReturnsReferenceOnly" render={() => <ModulePlaceholder moduleName="IssuesAndReturnsReferenceOnly" />} />
                <Route exact path="/library/reports/Journals" render={() => <ModulePlaceholder moduleName="Journals" />} />
                <Route exact path="/library/reports/Queries" render={() => <ModulePlaceholder moduleName="Queries" />} />
                <Route exact path="/admissions/forms/SectionChange" component={SectionChange} />
                <Route exact path="/attendance/forms/BatchDelete" component={BatchDelete} />
                <Route exact path="/fee/forms/ReceiptConcellation" render={() => <ModulePlaceholder moduleName="ReceiptConcellation" />} />
                <Route exact path="/library/forms/DamagedList" render={() => <ModulePlaceholder moduleName="DamagedList" />} />
                <Route exact path="/settings/forms/ReguMaster" component={ReguMaster} />
                <Route exact path="/fee/forms/Feeverification" render={() => <ModulePlaceholder moduleName="Feeverification" />} />
                <Route exact path="/fee/reports/RefundAmount" render={() => <ModulePlaceholder moduleName="RefundAmount" />} />
                <Route exact path="/payroll/reports/LoanEmiDetails" render={() => <ModulePlaceholder moduleName="LoanEmiDetails" />} />
                <Route exact path="/hostel/forms/HFeeMaster" render={() => <ModulePlaceholder moduleName="HFeeMaster" />} />
                <Route exact path="/hostel/forms/BlockWiseDeAllocation" render={() => <ModulePlaceholder moduleName="BlockWiseDeAllocation" />} />
                <Route exact path="/hostel/reports/HostelConcessionFee" render={() => <ModulePlaceholder moduleName="HostelConcessionFee" />} />
                <Route exact path="/hostel/reports/HostelFeeRefund" render={() => <ModulePlaceholder moduleName="HostelFeeRefund" />} />
                <Route exact path="/hostel/reports/HostelDailyFee" render={() => <ModulePlaceholder moduleName="HostelDailyFee" />} />
                <Route exact path="/transport/forms/TransportDueDetails" render={() => <ModulePlaceholder moduleName="TransportDueDetails" />} />
                <Route exact path="/hostel/reports/HostelYearwisePendingFee" render={() => <ModulePlaceholder moduleName="HostelYearwisePendingFee" />} />
                <Route exact path="/fee/forms/UploadbrankTransactions" render={() => <ModulePlaceholder moduleName="UploadbrankTransactions" />} />
                <Route exact path="/payroll/reports/GenderWiseSalaryDetails" render={() => <ModulePlaceholder moduleName="GenderWiseSalaryDetails" />} />
                <Route exact path="/library/reports/Test1" render={() => <ModulePlaceholder moduleName="Test1" />} />
                <Route exact path="/hostel/reports/Test" render={() => <ModulePlaceholder moduleName="Test" />} />
                <Route exact path="/hostel/forms/ModifyHostelFeeReceipt" render={() => <ModulePlaceholder moduleName="ModifyHostelFeeReceipt" />} />
                <Route exact path="/hostel/forms/HostelReceiptCancellation" render={() => <ModulePlaceholder moduleName="HostelReceiptCancellation" />} />
                <Route exact path="/settings/forms/FeedBackMaster" render={() => <ModulePlaceholder moduleName="FeedBackMaster" />} />
                <Route exact path="/settings/forms/FacultyFeedbackPermissions" render={() => <ModulePlaceholder moduleName="FacultyFeedbackPermissions" />} />
                <Route exact path="/performance/forms/FeedBackMaster" render={() => <ModulePlaceholder moduleName="FeedBackMaster" />} />
                <Route exact path="/performance/forms/AddFeedback" render={() => <ModulePlaceholder moduleName="AddFeedback" />} />
                <Route exact path="/performance/forms/FeedbackUpdation" render={() => <ModulePlaceholder moduleName="FeedbackUpdation" />} />
                <Route exact path="/accounting/reports/ConsolidatedFeedback" render={() => <ModulePlaceholder moduleName="ConsolidatedFeedback" />} />
                <Route exact path="/performance/reports/IndividualFeedbackAnalysis" render={() => <ModulePlaceholder moduleName="IndividualFeedbackAnalysis" />} />
                <Route exact path="/performance/reports/FeedbackAnalysis" render={() => <ModulePlaceholder moduleName="FeedbackAnalysis" />} />
                <Route exact path="/examinations/reports/ConsolidatedReport" render={() => <ModulePlaceholder moduleName="ConsolidatedReport" />} />
                <Route exact path="/fee/reports/CurrentPrevReceiptNoWiseDFCR" render={() => <ModulePlaceholder moduleName="CurrentPrevReceiptNoWiseDFCR" />} />
                <Route exact path="/settings/forms/StudentDataUpload" render={() => <ModulePlaceholder moduleName="StudentDataUpload" />} />
                <Route exact path="/library/forms/NoDuesEntry" render={() => <ModulePlaceholder moduleName="NoDuesEntry" />} />
                <Route exact path="/library/forms/LibraryMainEntrance" render={() => <ModulePlaceholder moduleName="LibraryMainEntrance" />} />
                <Route exact path="/library/forms/DigitalBlock" render={() => <ModulePlaceholder moduleName="DigitalBlock" />} />
                <Route exact path="/library/forms/LibraryLogStatus" render={() => <ModulePlaceholder moduleName="LibraryLogStatus" />} />
                <Route exact path="/settings/forms/ExternalLink3" render={() => <ModulePlaceholder moduleName="ExternalLink3" />} />
                <Route exact path="/settings/forms/SmsTemplateRegistration" render={() => <ModulePlaceholder moduleName="SmsTemplateRegistration" />} />
                <Route exact path="/settings/forms/SubCasteMaster" render={() => <ModulePlaceholder moduleName="SubCasteMaster" />} />
                <Route exact path="/attendance/forms/ConsolidatedAttendanceAnalysis" component={ConsolidatedAttendanceAnalysis} />
                <Route exact path="/library/forms/DamageFineCollectionReport" render={() => <ModulePlaceholder moduleName="DamageFineCollectionReport" />} />
                <Route exact path="/library/reports/DamageFineCollectionReport" render={() => <ModulePlaceholder moduleName="DamageFineCollectionReport" />} />
                <Route exact path="/examinations/reports/RegnoWiseElectives" render={() => <ModulePlaceholder moduleName="RegnoWiseElectives" />} />
                <Route exact path="/fee/reports/FeeDuplicates" render={() => <ModulePlaceholder moduleName="FeeDuplicates" />} />
                <Route exact path="/settings/forms/SubjectsMinHon" render={() => <ModulePlaceholder moduleName="SubjectsMinHon" />} />
                <Route exact path="/examinations/forms/MarksEntryMH" render={() => <ModulePlaceholder moduleName="MarksEntryMH" />} />
                <Route exact path="/settings/forms/DesignationMaster" render={() => <ModulePlaceholder moduleName="DesignationMaster" />} />
                <Route exact path="/fee/reports/FeeBalanceSheet" render={() => <ModulePlaceholder moduleName="FeeBalanceSheet" />} />
                <Route exact path="/examinations/forms/PracticalMarksEntry" render={() => <ModulePlaceholder moduleName="PracticalMarksEntry" />} />
                <Route exact path="/examinations/forms/Marksheads" render={() => <ModulePlaceholder moduleName="Marksheads" />} />
                <Route exact path="/attendance/forms/BatchesMH" component={BatchesMH} />
                <Route exact path="/attendance/forms/AttendanceMH" render={() => <ModulePlaceholder moduleName="AttendanceMH" />} />
                <Route exact path="/attendance/reports/SubwiseStudentList" render={() => <ModulePlaceholder moduleName="SubwiseStudentList" />} />
                <Route exact path="/attendance/forms/AdminAttendanceMH" render={() => <ModulePlaceholder moduleName="AdminAttendanceMH" />} />
                <Route exact path="/examinations/forms/AdminMarksEntryMH" render={() => <ModulePlaceholder moduleName="AdminMarksEntryMH" />} />
                <Route exact path="/examinations/forms/ExternalMarksEntry" render={() => <ModulePlaceholder moduleName="ExternalMarksEntry" />} />
                <Route exact path="/examinations/forms/AdminExternalMarksEntry" render={() => <ModulePlaceholder moduleName="AdminExternalMarksEntry" />} />
                <Route exact path="/library/forms/BookReservation" render={() => <ModulePlaceholder moduleName="BookReservation" />} />
                <Route exact path="/library/forms/LibraryInOut" render={() => <ModulePlaceholder moduleName="LibraryInOut" />} />
                <Route exact path="/payroll/reports/EmpBasicIncrements" render={() => <ModulePlaceholder moduleName="EmpBasicIncrements" />} />
                <Route exact path="/fee/reports/TransportDues" render={() => <ModulePlaceholder moduleName="TransportDues" />} />
                <Route exact path="/fee/reports/CumulativeFeeDue" render={() => <ModulePlaceholder moduleName="CumulativeFeeDue" />} />
                <Route exact path="/attendance/forms/DayToDayAttendance" render={() => <ModulePlaceholder moduleName="DayToDayAttendance" />} />
                <Route exact path="/hostel/reports/HostelOccupancy" render={() => <ModulePlaceholder moduleName="HostelOccupancy" />} />
                <Route exact path="/hostel/reports/HostelRoomMaster" render={() => <ModulePlaceholder moduleName="HostelRoomMaster" />} />
                <Route exact path="/hostel/reports/HostelRoomTransfer" render={() => <ModulePlaceholder moduleName="HostelRoomTransfer" />} />
                <Route exact path="/settings/forms/SubjectsMH" render={() => <ModulePlaceholder moduleName="SubjectsMH" />} />
                <Route exact path="/payroll/reports/Certificates" render={() => <ModulePlaceholder moduleName="Certificates" />} />
                <Route exact path="/performance/reports/ConsolidatedFeedbackBelowEightyPercent" render={() => <ModulePlaceholder moduleName="ConsolidatedFeedbackBelowEightyPercent" />} />
                <Route exact path="/examinations/reports/ConsolidatedAttendanceAnalysis" render={() => <ModulePlaceholder moduleName="ConsolidatedAttendanceAnalysis" />} />
                <Route exact path="/attendance/reports/ConsolidatedAttendanceAnalysis" render={() => <ModulePlaceholder moduleName="ConsolidatedAttendanceAnalysis" />} />
                <Route exact path="/examinations/reports/InternalMarksAnalysis" render={() => <ModulePlaceholder moduleName="InternalMarksAnalysis" />} />
                <Route exact path="/examinations/reports/InternalMarksAnalysisSubjectSectionWise" render={() => <ModulePlaceholder moduleName="InternalMarksAnalysisSubjectSectionWise" />} />
                <Route exact path="/performance/reports/FeedbackNotPosted" render={() => <ModulePlaceholder moduleName="FeedbackNotPosted" />} />
                <Route exact path="/settings/forms/CategoryOfAdmission" render={() => <ModulePlaceholder moduleName="CategoryOfAdmission" />} />
                <Route exact path="/settings/forms/FeedbackUpdation" render={() => <ModulePlaceholder moduleName="FeedbackUpdation" />} />
                <Route exact path="/examinations/forms/TechRequest" render={() => <ModulePlaceholder moduleName="TechRequest" />} />
                <Route exact path="/fee/reports/FinancialYearwiseDueList" render={() => <ModulePlaceholder moduleName="FinancialYearwiseDueList" />} />
                <Route exact path="/fee/reports/FeeDemand" render={() => <ModulePlaceholder moduleName="FeeDemand" />} />
                <Route exact path="/payroll/forms/PromotionRatifiedDetails" render={() => <ModulePlaceholder moduleName="PromotionRatifiedDetails" />} />
                <Route exact path="/fee/reports/FeeAuditReports" render={() => <ModulePlaceholder moduleName="FeeAuditReports" />} />
                <Route exact path="/attendance/reports/DayWiseAttendance" component={DayWiseAttendance} />
                <Route exact path="/library/forms/BookStatusChange" render={() => <ModulePlaceholder moduleName="BookStatusChange" />} />
                <Route exact path="/stores/forms/RoomManagement" render={() => <ModulePlaceholder moduleName="RoomManagement" />} />
                <Route exact path="/attendance/reports/SectionwiseSubjectAttendanceReport" render={() => <ModulePlaceholder moduleName="SectionwiseSubjectAttendanceReport" />} />
                <Route exact path="/hostel/reports/HostelMonthWiseAttendance" render={() => <ModulePlaceholder moduleName="HostelMonthWiseAttendance" />} />
                <Route exact path="/attendance/reports/ConsolidateAttendance" render={() => <ModulePlaceholder moduleName="ConsolidateAttendance" />} />
                <Route exact path="/attendance/reports/AttendanceShortlistAnalysis" render={() => <ModulePlaceholder moduleName="AttendanceShortlistAnalysis" />} />
                <Route exact path="/examinations/reports/InternalMarksAnalysisBelow50Perc" render={() => <ModulePlaceholder moduleName="InternalMarksAnalysisBelow50Perc" />} />
                <Route exact path="/hostel/reports/HostelFeeDuesList" render={() => <ModulePlaceholder moduleName="HostelFeeDuesList" />} />
                <Route exact path="/attendance/forms/StopAttendancePostingDates" component={StopAttendancePostingDates} />
                <Route exact path="/hostel/reports/HostelAttendanceReport" render={() => <ModulePlaceholder moduleName="HostelAttendanceReport" />} />
                <Route exact path="/fee/forms/Reimbursementfeebulkupload" render={() => <ModulePlaceholder moduleName="Reimbursementfeebulkupload" />} />
                <Route exact path="/settings/forms/ConcessionCategorytypes" render={() => <ModulePlaceholder moduleName="ConcessionCategorytypes" />} />
                <Route exact path="/transport/forms/RouteMasterIncrement" render={() => <ModulePlaceholder moduleName="RouteMasterIncrement" />} />
                <Route exact path="/admissions/reports/CategoryWiseStudentsEnrolledList" render={() => <ModulePlaceholder moduleName="CategoryWiseStudentsEnrolledList" />} />
                <Route exact path="/admissions/reports/AcyrwiseStdCount" render={() => <ModulePlaceholder moduleName="AcyrwiseStdCount" />} />
                <Route exact path="/attendance/reports/PeriodWiseConsolidate" render={() => <ModulePlaceholder moduleName="PeriodWiseConsolidate" />} />
                <Route exact path="/fee/forms/Examfeeuploadbanktransaction-details" render={() => <ModulePlaceholder moduleName="Examfeeuploadbanktransaction-details" />} />
                <Route exact path="/fee/forms/OnlineExamFeeCollection" render={() => <ModulePlaceholder moduleName="OnlineExamFeeCollection" />} />
                <Route exact path="/hostel/forms/AddHostelAttendance" render={() => <ModulePlaceholder moduleName="AddHostelAttendance" />} />
                <Route exact path="/hostel/forms/HostelFeeChallanOnline" render={() => <ModulePlaceholder moduleName="HostelFeeChallanOnline" />} />
                <Route exact path="/attendance/forms/MHSubjectsMapping" render={() => <ModulePlaceholder moduleName="MHSubjectsMapping" />} />
                <Route exact path="/hostel/forms/HostelUploadBankTransaction" render={() => <ModulePlaceholder moduleName="HostelUploadBankTransaction" />} />
                <Route exact path="/transport/reports/StudentBusIdentityCard" render={() => <ModulePlaceholder moduleName="StudentBusIdentityCard" />} />
                <Route exact path="/attendance/reports/SubjectWiseAttendanceReport" render={() => <ModulePlaceholder moduleName="SubjectWiseAttendanceReport" />} />
                <Route exact path="/hostel/reports/HostelDFCR" render={() => <ModulePlaceholder moduleName="HostelDFCR" />} />
                <Route exact path="/examinations/reports/ConsolidateReportMH" render={() => <ModulePlaceholder moduleName="ConsolidateReportMH" />} />
                <Route exact path="/admissions/reports/YearWiseStudentCount" render={() => <ModulePlaceholder moduleName="YearWiseStudentCount" />} />
                <Route exact path="/library/forms/Subscriptions" render={() => <ModulePlaceholder moduleName="Subscriptions" />} />
                <Route exact path="/library/forms/Acquisitions" render={() => <ModulePlaceholder moduleName="Acquisitions" />} />
                <Route exact path="/library/forms/Misc" render={() => <ModulePlaceholder moduleName="Misc" />} />
                <Route exact path="/attendance/reports/AddAttendanceReport" render={() => <ModulePlaceholder moduleName="AddAttendanceReport" />} />
                <Route exact path="/fee/forms/FeeRefundAmount" render={() => <ModulePlaceholder moduleName="FeeRefundAmount" />} />
                <Route exact path="/hostel/forms/HostelFeeChallana" render={() => <ModulePlaceholder moduleName="HostelFeeChallana" />} />
                <Route exact path="/hostel/forms/HostelFeeRefundAmount" render={() => <ModulePlaceholder moduleName="HostelFeeRefundAmount" />} />
                <Route exact path="/hostel/forms/HostelFeeConcession" render={() => <ModulePlaceholder moduleName="HostelFeeConcession" />} />
                <Route exact path="/performance/reports/ConsolidatedFeedback" render={() => <ModulePlaceholder moduleName="ConsolidatedFeedback" />} />
                <Route exact path="/examinations/forms/ExamFeeCollection" render={() => <ModulePlaceholder moduleName="ExamFeeCollection" />} />
                <Route exact path="/library/forms/IssuesAndReturns" render={() => <ModulePlaceholder moduleName="IssuesAndReturns" />} />
                <Route exact path="/library/forms/IssueAndReturnJournals" render={() => <ModulePlaceholder moduleName="IssueAndReturnJournals" />} />
                <Route exact path="/examinations/reports/FinalConsolidateReportMH" render={() => <ModulePlaceholder moduleName="FinalConsolidateReportMH" />} />
                <Route exact path="/attendance/forms/MidAttendanceBlock" component={MidAttendanceBlock} />
                <Route exact path="/hostel/forms/AttendanceByAdmin" render={() => <ModulePlaceholder moduleName="AttendanceByAdmin" />} />
                <Route exact path="/fee/forms/OnlineExamFeeCollection" render={() => <ModulePlaceholder moduleName="OnlineExamFeeCollection" />} />
                <Route exact path="/library/reports/IssuesAndReturnsJournals" render={() => <ModulePlaceholder moduleName="IssuesAndReturnsJournals" />} />
                <Route exact path="/library/forms/GlobalSearch" render={() => <ModulePlaceholder moduleName="GlobalSearch" />} />
                <Route exact path="/library/reports/Masters" render={() => <ModulePlaceholder moduleName="Masters" />} />
                <Route exact path="/library/reports/DayWiseInAndOutLog" render={() => <ModulePlaceholder moduleName="DayWiseInAndOutLog" />} />
                <Route exact path="/library/reports/Misc" render={() => <ModulePlaceholder moduleName="Misc" />} />
                <Route exact path="/library/reports/Titles" render={() => <ModulePlaceholder moduleName="Titles" />} />
                <Route exact path="/fee/forms/Moneyrefund" render={() => <ModulePlaceholder moduleName="Moneyrefund" />} />
                <Route exact path="/attendance/reports/FacultyTaughtSubjects" render={() => <ModulePlaceholder moduleName="FacultyTaughtSubjects" />} />
                <Route exact path="/fee/reports/FeeConcessionList" render={() => <ModulePlaceholder moduleName="FeeConcessionList" />} />
                <Route exact path="/examinations/forms/MarksEntryMH" render={() => <ModulePlaceholder moduleName="MarksEntryMH" />} />
                <Route exact path="/examinations/forms/OnlineExamFeeCollection" render={() => <ModulePlaceholder moduleName="OnlineExamFeeCollection" />} />
                <Route exact path="/examinations/forms/ExamFeeUploadBankTransaction" render={() => <ModulePlaceholder moduleName="ExamFeeUploadBankTransaction" />} />
                <Redirect from="*" to="/home" />
              </Switch> */}
              <Switch>

    <Route exact path="/home" component={Home} />

    <Route
        path="/:module/:type/:page"
        render={({ location }) => (
            <DynamicRoute path={location.pathname} />
        )}
    />

    <Redirect to="/home" />

</Switch>
          </MainLayout>
        )}
=======
        
           {!user ? (

      // NOT LOGGED IN
      <IonRouterOutlet>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Redirect to="/login" />
        </Switch>
      </IonRouterOutlet>

    ) : (

      // LOGGED IN
      <MainLayout>
        <Switch>

          {/* Dashboard */}
          <Route exact path="/home" component={Home} />

          {/* Dynamic Protected Routes */}
          {RouteConfig.map((route) => (
            <ProtectedRoute
              key={route.path}
              exact
              path={route.path}
              component={route.component}
            />
          ))}

          {/* Default */}
          <Redirect to="/home" />

        </Switch>
      </MainLayout>

    )}
>>>>>>> Stashed changes
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
