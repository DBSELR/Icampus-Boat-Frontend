import React from "react";
import { useHistory } from "react-router-dom";
import { 
  School, CreditCard, Wallet, BookOpen, Users, Settings, UserCheck, Award, 
  ShieldAlert, FileText, Settings2, ShieldQuestion, HelpCircle, Heart, Bell
} from "lucide-react";
import { toast } from "sonner";
import "./Home.css";

// 18 Modules Grid matching original DBS Campus ERP
const LANDING_MODULES = [
  { id: "admissions", name: "Admissions", icon: School, path: "/admissions/dashboard", color: "blue" },
  { id: "fees", name: "Fees", icon: CreditCard, path: "/fees/account-master", color: "orange" },
  { id: "payroll", name: "Payroll", icon: Wallet, path: "/payroll", color: "emerald" },
  { id: "accounting", name: "Accounting", icon: CalculatorIcon, path: "/accounting", color: "purple" },
  { id: "attendance", name: "Attendance", icon: UserCheck, path: "/attendance", color: "teal" },
  { id: "examinations", name: "Examinations", icon: Award, path: "/examinations", color: "pink" },
  { id: "stores", name: "Stores", icon: Settings, path: "/stores", color: "slate" },
  { id: "library", name: "Library", icon: BookOpen, path: "/library", color: "blue" },
  { id: "transport", name: "Transport", icon: BusIcon, path: "/transport", color: "orange" },
  { id: "discipline", name: "Discipline", icon: ShieldAlert, path: "/discipline", color: "purple" },
  { id: "performance", name: "Performance", icon: PerformanceIcon, path: "/performance", color: "emerald" },
  { id: "hostels", name: "Hostels", icon: School, path: "/hostels", color: "pink" },
  { id: "medicare", name: "Medicare", icon: Heart, path: "/medicare", color: "teal" },
  { id: "front-office", name: "Front Office", icon: Users, path: "/front-office", color: "slate" },
  { id: "groups", name: "Groups", icon: Users, path: "/groups", color: "blue" },
  { id: "tappal", name: "Tappal", icon: FileText, path: "/tappal", color: "orange" },
  { id: "establishment", name: "Establishment", icon: School, path: "/establishment", color: "purple" },
  { id: "settings", name: "Settings", icon: Settings2, path: "/settings", color: "slate" }
];

// Helper icons that aren't native to Lucide
function BusIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M17 18h2a2 2 0 0 0 2-2v-3" />
      <path d="M7 18h8" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M6 6h12" />
    </svg>
  );
}

function CalculatorIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="16" x2="16" y2="22" />
      <circle cx="9" cy="11" r="1" />
      <circle cx="15" cy="11" r="1" />
    </svg>
  );
}

function PerformanceIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

export const Home: React.FC = () => {
  const history = useHistory();

  const handleModuleClick = (path: string, name: string) => {
    toast.info(`Entering ${name} Module...`);
    history.push(path);
  };

  return (
    <div className="dbs-landing-page-container">
      {/* Central Branding Logo Diagram Area */}
      <div className="dbs-landing-central-brand">
        <div className="dbs-landing-brand-header">
          <h2>DBASE SOLUTIONS PVT LTD</h2>
          <h1>DBS CAMPUS</h1>
          <p>Boundless Office Automation Tool</p>
        </div>

        {/* Dynamic orbital diagram animation */}
        <div className="dbs-orbit-diagram-wrapper">
          <div className="dbs-orbit-core">DBS</div>
          <div className="dbs-orbit-ring dbs-orbit-ring-1" />
          <div className="dbs-orbit-ring dbs-orbit-ring-2" />
          <div className="dbs-orbit-node dbs-node-1"><School size={12} /></div>
          <div className="dbs-orbit-node dbs-node-2"><CreditCard size={12} /></div>
          <div className="dbs-orbit-node dbs-node-3"><UserCheck size={12} /></div>
        </div>
      </div>

      {/* Grid of 18 Modules cards */}
      <div className="dbs-landing-modules-grid">
        {LANDING_MODULES.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              className={`dbs-landing-module-card dbs-color-${m.color}`}
              onClick={() => handleModuleClick(m.path, m.name)}
            >
              <div className="dbs-landing-card-icon-box">
                <Icon size={24} />
              </div>
              <span className="dbs-landing-card-label">{m.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
