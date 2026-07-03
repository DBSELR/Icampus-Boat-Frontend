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
                
                <Route exact path="/fees/dashboard" render={() => <ModulePlaceholder moduleName="Fees Dashboard" />} />
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

                {/* Primary navigation placeholders */}
                <Route exact path="/payroll" render={() => <ModulePlaceholder moduleName="Payroll" />} />
                <Route exact path="/accounting" render={() => <ModulePlaceholder moduleName="Accounting" />} />
                <Route exact path="/attendance" render={() => <ModulePlaceholder moduleName="Attendance" />} />
                <Route exact path="/examinations" render={() => <ModulePlaceholder moduleName="Examinations" />} />
                <Route exact path="/stores" render={() => <ModulePlaceholder moduleName="Stores" />} />
                <Route exact path="/library" render={() => <ModulePlaceholder moduleName="Library" />} />
                <Route exact path="/transport" render={() => <ModulePlaceholder moduleName="Transport" />} />
                <Route exact path="/discipline" render={() => <ModulePlaceholder moduleName="Discipline" />} />
                <Route exact path="/performance" render={() => <ModulePlaceholder moduleName="Performance" />} />
                <Route exact path="/hostels" render={() => <ModulePlaceholder moduleName="Hostels" />} />
                <Route exact path="/medicare" render={() => <ModulePlaceholder moduleName="Medicare" />} />
                <Route exact path="/front-office" render={() => <ModulePlaceholder moduleName="Front Office" />} />
                <Route exact path="/groups" render={() => <ModulePlaceholder moduleName="Groups" />} />
                <Route exact path="/tappal" render={() => <ModulePlaceholder moduleName="Tappal" />} />
                <Route exact path="/establishment" render={() => <ModulePlaceholder moduleName="Establishment" />} />
                <Route exact path="/settings" render={() => <ModulePlaceholder moduleName="Settings" />} />

                <Redirect from="*" to="/home" />
              </Switch>
          </MainLayout>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
