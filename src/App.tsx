import { useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

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
import AdmissionsEntry from "./pages/Admissions/Forms/AdmissionsEntry";
import SectionRollNumber from "./pages/Admissions/Forms/SectionRollNumber";
import AdmissionsDashboard from "./pages/Admissions/Forms/AdmissionsDashboard";
import AccountMaster from "./pages/Fees/AccountMaster";
import HeadsMaster from "./pages/Fees/HeadsMaster";

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
import FeesDashboard from "./pages/Fees/FeesDashboard";
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
import SettingsDashboard from "./pages/Settings/SettingsDashboard";
import FinancialAcadamicYear from "./pages/Settings/FinancialAcadamicYear";
import StoresDashboard from "./pages/Stores/StoresDashboard";
import ProductMaster from "./pages/Stores/ProductMaster";
import TappalDashboard from "./pages/Tappal/TappalDashboard";
import InwardPosts from "./pages/Tappal/InwardPosts";
import TransportDashboard from "./pages/Transport/TransportDashboard";
import RouteMaster from "./pages/Transport/RouteMaster";

import GroupChange from "./pages/Admissions/Forms/GroupChange";
import TcIssue from "./pages/Admissions/Forms/TcIssue";
import StudyCertificate from "./pages/Admissions/Forms/StudyCertificate";
import CourseCompleted from "./pages/Admissions/Forms/CourseCompleted";
import NoObjectionCertificate from "./pages/Admissions/Forms/NoObjectionCertificate";
import BonafideCertificate from "./pages/Admissions/Forms/BonafideCertificate";
import StudentPromotion from "./pages/Admissions/Forms/StudentPromotion";
import StudentDataExcelExport from "./pages/Admissions/Forms/StudentDataExcelExport";
import SectionChange from "./pages/Admissions/Forms/SectionChange";
import DeleteInActiveStudents from "./pages/Admissions/Forms/DeleteInActiveStudents";
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
import AdmissionView from "./pages/Admissions/Forms/AdmissionView";

import DepartmentMaster from "./pages/Settings/DepartmentMaster/DepartmentMaster";
import ProgrammeMaster from "./pages/Settings/ProgrammeMaster/ProgrammeMaster";
import ReguMaster from "./pages/Settings/ReguMaster/ReguMaster";
import BranchMaster from "./pages/Settings/BranchMaster/BranchMaster";
import SubjectMaster from "./pages/Settings/SubjectMaster/SubjectMaster";
import FacultyMaster from "./pages/Settings/FacultyMaster/FacultyMaster";
import SectionMaster from "./pages/Settings/SectionMaster/SectionMaster";


setupIonicReact();

const App: React.FC = () => {
  // Track auth session dynamically
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

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
        {!user ? (
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Redirect from="*" to="/login" />
            </Switch>
          </IonRouterOutlet>
        ) : (
          <MainLayout>
            <Switch>
                <Route exact path="/home" component={Home} />
                
                {/* Admissions Module */}
                <Route exact path="/admissions/entry" component={AdmissionsEntry} />
                <Route exact path="/admissions/section-roll" component={SectionRollNumber} />
                
                {/* Fees Module */}
                <Route exact path="/fees/account-master" component={AccountMaster} />
               <Route exact path="/fees/Heads-Master" component={HeadsMaster} />
               
                {/* Submenu placeholders */}
                <Route exact path="/admissions/dashboard" component={AdmissionsDashboard} />
                <Route exact path="/admissions/group-change" render={() => <GroupChange />} />
                <Route exact path="/admissions/tc-issuing" render={() => <TcIssue />} />
                <Route exact path="/admissions/study-cert" render={() => <StudyCertificate />} />
                <Route exact path="/admissions/course-completed" render={() => <CourseCompleted />} />
                <Route exact path="/admissions/noc" render={() => <NoObjectionCertificate />} />
                <Route exact path="/admissions/bonafide" render={() => <BonafideCertificate />} />
                <Route exact path="/admissions/promotion" render={() => <StudentPromotion />} />
                <Route exact path="/admissions/excel-export" render={() => <StudentDataExcelExport />} />
                <Route exact path="/admissions/AdmissionView" render={() => <AdmissionView />} />
                <Route exact path="/admissions/section-change" render={() => <SectionChange />} />
                <Route exact path="/admissions/inactive-delete" render={() => <DeleteInActiveStudents />} />
                
                <Route exact path="/fees/dashboard" component={FeesDashboard} />
                <Route exact path="/fees/heads-master" render={() => <ModulePlaceholder moduleName="Fees Heads Master" />} />
                <Route exact path="/fees/misc-heads" render={() => <ModulePlaceholder moduleName="Fees Miscellaneous Heads" />} />
                <Route exact path="/fees/fee-master" render={() => <ModulePlaceholder moduleName="Fees Fee Master" />} />
                <Route exact path="/fees/misc-challan" render={() => <ModulePlaceholder moduleName="Fees Miscellaneous Fee Challan" />} />
                <Route exact path="/fees/collection" render={() => <ModulePlaceholder moduleName="Fees Fee Collection" />} />
                <Route exact path="/fees/modify-receipt" render={() => <ModulePlaceholder moduleName="Fees Modify Fee Receipt" />} />
                <Route exact path="/fees/donation" render={() => <ModulePlaceholder moduleName="Fees Donation Collection" />} />
                <Route exact path="/fees/fee-payment-cert" render={() => <ModulePlaceholder moduleName="Fees Certificate of Fee Payment" />} />
                <Route exact path="/fees/online-fee" render={() => <ModulePlaceholder moduleName="Fees Online Fee Collection" />} />
                <Route exact path="/fees/admission-modes" render={() => <ModulePlaceholder moduleName="Fees Admission Modes" />} />
                <Route exact path="/fees/concession" render={() => <ModulePlaceholder moduleName="Fees Fee Concession" />} />
                <Route exact path="/fees/fine" render={() => <ModulePlaceholder moduleName="Fees Fee Fine" />} />
                <Route exact path="/fees/cancellation" render={() => <ModulePlaceholder moduleName="Fees Receipt Cancellation" />} />
                <Route exact path="/fees/verification" render={() => <ModulePlaceholder moduleName="Fees Fee Verification" />} />
                <Route exact path="/fees/refund" render={() => <ModulePlaceholder moduleName="Fees Fee Refund" />} />
                <Route exact path="/fees/upload-bank" render={() => <ModulePlaceholder moduleName="Fees Upload Bank Transaction" />} />
                <Route exact path="/fees/upload-exam-bank" render={() => <ModulePlaceholder moduleName="Fees Exam Fee Upload Bank Transaction" />} />
                <Route exact path="/fees/online-exam-fee" render={() => <ModulePlaceholder moduleName="Fees Online Exam Fee Collection" />} />

                {/* Primary navigation routes */}
                <Route exact path="/payroll" component={PayrollDashboard} />
                <Route exact path="/payroll/emp-details" component={EmpDetails} />

          
                
                <Route exact path="/accounting" component={AccountingDashboard} />
                <Route exact path="/accounting/payment-heads" component={PaymentHeads} />
                
                <Route exact path="/attendance" component={AttendanceDashboard} />
                <Route exact path="/attendance/timetable" component={TimeTable} />
                <Route exact path="/attendance/timeAdjustment" component={TimeAdjustment} />
                <Route exact path="/attendance/AttendanceByStaff" component={AttendanceByStaff} />
                <Route exact path="/attendance/AttendanceByAdmin" component={AttendanceByAdmin} />
                <Route exact path="/attendance/TimetableExtraHours" component={TimetableExtraHours} />
                <Route exact path="/attendance/Batches" component={Batches} />
                <Route exact path="/attendance/AdminPermissions" component={AdminPermissions} />
                <Route exact path="/attendance/CheckAttendance" component={CheckAttendance} />
                <Route exact path="/attendance/AddAttendance" component={AddAttendance} />
                <Route exact path="/attendance/BatchDelete" component={BatchDelete} />
                <Route exact path="/attendance/EditEFRMDate" component={EditEFRMDate} />
                <Route exact path="/attendance/ModifyAttendance" component={ModifyAttendance} />
                <Route exact path="/attendance/DayWiseAttendance" component={DayWiseAttendance} />
                <Route exact path="/attendance/AttendanceDeletion" component={AttendanceDeletion} />
                <Route exact path="/attendance/AttendanceLateralEntry" component={AttendanceLateralEntry} />
                <Route exact path="/attendance/ConsolidatedAttendanceAnalysis" component={ConsolidatedAttendanceAnalysis} />
                <Route exact path="/attendance/BatchesMH" component={BatchesMH} />
                <Route exact path="/attendance/AttendanceBystaffMH" component={AttendanceBystaffMH} />
                <Route exact path="/attendance/AttendanceByAdminMH" component={AttendanceByAdminMH} />
                <Route exact path="/attendance/MidAttendanceBlock" component={MidAttendanceBlock} />
                <Route exact path="/attendance/StopAttendancePostingDates" component={StopAttendancePostingDates} />
                
                <Route exact path="/examinations" component={ExaminationsDashboard} />
                <Route exact path="/examinations/marks-entry" component={MarksEntry} />
                
                <Route exact path="/stores" component={StoresDashboard} />
                <Route exact path="/stores/product-master" component={ProductMaster} />
                
                <Route exact path="/library" component={LibraryDashboard} />
                <Route exact path="/library/library-master" component={LibraryMaster} />
                
                <Route exact path="/transport" component={TransportDashboard} />
                <Route exact path="/transport/route-master" component={RouteMaster} />
                
                <Route exact path="/discipline" component={DisciplineDashboard} />
                <Route exact path="/discipline/student-history" component={StudentHistory} />
                
                <Route exact path="/performance" component={PerformanceDashboard} />
                <Route exact path="/performance/report-card" component={ReportCard} />
                
                <Route exact path="/hostels" component={HostelsDashboard} />
                <Route exact path="/hostels/due-list" component={FeeDueList} />
                
                <Route exact path="/medicare" component={MedicareDashboard} />
                <Route exact path="/medicare/register" component={Medicare} />
                
                <Route exact path="/front-office" component={FrontOfficeDashboard} />
                <Route exact path="/front-office/notification" component={Notification} />
                
                <Route exact path="/groups" component={GroupsDashboard} />
                <Route exact path="/groups/allocation" component={GroupAllocation} />
                
                <Route exact path="/tappal" component={TappalDashboard} />
                <Route exact path="/tappal/inward-posts" component={InwardPosts} />
                
                <Route exact path="/establishment" component={EstablishmentDashboard} />
                <Route exact path="/establishment/room-management" component={RoomManagementMaster} />
                
                <Route exact path="/settings" component={SettingsDashboard} />
                <Route exact path="/settings/financial-academic-year" component={FinancialAcadamicYear} />
                <Route exact path="/settings/department-master" component={DepartmentMaster} />
                <Route exact path="/settings/programme-master" component={ProgrammeMaster} />
                <Route exact path="/settings/regu-master" component={ReguMaster} />
                <Route exact path="/settings/branch-master" component={BranchMaster} />
                <Route exact path="/settings/subject-master" component={SubjectMaster} />
                <Route exact path="/settings/faculty-master" component={FacultyMaster} />
                <Route exact path="/settings/section-master" component={SectionMaster} />

                <Redirect from="*" to="/home" />
              </Switch>
          </MainLayout>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
