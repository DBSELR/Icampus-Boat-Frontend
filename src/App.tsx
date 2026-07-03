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
import AdmissionsEntry from "./pages/Admissions/AdmissionsEntry";
import SectionRollNumber from "./pages/Admissions/SectionRollNumber";
import AdmissionsDashboard from "./pages/Admissions/AdmissionsDashboard";
import AccountMaster from "./pages/Fees/AccountMaster";

/* New Modules Pages */
import AccountingDashboard from "./pages/Accounting/AccountingDashboard";
import PaymentHeads from "./pages/Accounting/PaymentHeads";
import AttendanceDashboard from "./pages/Attendance/AttendanceDashboard";
import TimeTable from "./pages/Attendance/TimeTable/TimeTable";
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

                {/* Submenu placeholders */}
                <Route exact path="/admissions/dashboard" component={AdmissionsDashboard} />
                <Route exact path="/admissions/group-change" render={() => <ModulePlaceholder moduleName="Admissions Group Change" />} />
                <Route exact path="/admissions/tc-issuing" render={() => <ModulePlaceholder moduleName="Admissions TC Issuing" />} />
                <Route exact path="/admissions/study-cert" render={() => <ModulePlaceholder moduleName="Admissions Study Certificate" />} />
                <Route exact path="/admissions/course-completed" render={() => <ModulePlaceholder moduleName="Admissions Course Completed" />} />
                <Route exact path="/admissions/noc" render={() => <ModulePlaceholder moduleName="Admissions No Objection Certificate" />} />
                <Route exact path="/admissions/bonafide" render={() => <ModulePlaceholder moduleName="Admissions Bonafide Certificate" />} />
                <Route exact path="/admissions/promotion" render={() => <ModulePlaceholder moduleName="Admissions Student Promotion" />} />
                <Route exact path="/admissions/excel-export" render={() => <ModulePlaceholder moduleName="Admissions Excel Export" />} />
                <Route exact path="/admissions/section-change" render={() => <ModulePlaceholder moduleName="Admissions Section Change" />} />
                <Route exact path="/admissions/inactive-delete" render={() => <ModulePlaceholder moduleName="Admissions InActive Student Delete" />} />
                
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

                <Redirect from="*" to="/home" />
              </Switch>
          </MainLayout>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
