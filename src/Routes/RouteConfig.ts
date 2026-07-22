import AdmissionsEntry from "../pages/Admissions/Forms/Admissions";
import AdmissionsDashboard from "../pages/Admissions/Forms/AdmissionsDashboard";
import SectionRollNumber from "../pages/Admissions/Forms/SectionandRollNum";
import GroupChange from "../pages/Admissions/Forms/Group_change";
import TcIssue from "../pages/Admissions/Forms/Tcissues";
import StudyCertificate from "../pages/Admissions/Forms/StudyCertificate";
import CourseCompleted from "../pages/Admissions/Forms/CourseCompleted";
import NoObjectionCertificate from "../pages/Admissions/Forms/NoObjectionCertificate";
import BonafideCertificate from "../pages/Admissions/Forms/Bonafide";
import StudentPromotion from "../pages/Admissions/Forms/StudentPromotion";
import StudentDataExcelExport from "../pages/Admissions/Forms/StudentData";
import SectionChange from "../pages/Admissions/Forms/SectionChange";
import DeleteInActiveStudents from "../pages/Admissions/Forms/Del_InActive_Student";
import AdmissionView from "../pages/Admissions/Forms/Admissions_VIew";
import AccountMaster from "../pages/Fees/Forms/AccountMaster";
import HeadMaster from "../pages/Fees/Forms/HeadsMaster";

export const RouteConfig = [
  { path: "/Admissions/Forms/AdmissionsDashboard", component: AdmissionsDashboard },
  { path: "/Admissions/Forms/AdmissionsEntry", component: AdmissionsEntry },
  { path: "/Admissions/Forms/SectionRollNumber", component: SectionRollNumber },
  { path: "/Admissions/Forms/GroupChange", component: GroupChange },
  { path: "/Admissions/Forms/TcIssue", component: TcIssue },
  { path: "/Admissions/Forms/StudyCertificate", component: StudyCertificate },
  { path: "/Admissions/Forms/CourseCompleted", component: CourseCompleted },
  { path: "/Admissions/Forms/NoObjectionCertificate", component: NoObjectionCertificate },
  { path: "/Admissions/Forms/BonafideCertificate", component: BonafideCertificate },
  { path: "/Admissions/Forms/StudentPromotion", component: StudentPromotion },
  { path: "/Admissions/Forms/StudentDataExcelExport", component: StudentDataExcelExport },
  { path: "/Admissions/Forms/SectionChange", component: SectionChange },
  { path: "/Admissions/Forms/DeleteInActiveStudents", component: DeleteInActiveStudents },
  { path: "/Admissions/Forms/AdmissionView", component: AdmissionView },
  { path: "/Fee/Forms/AccountMaster", component: AccountMaster },
  { path: "/Fee/Forms/HeadsMaster", component: HeadMaster },
];