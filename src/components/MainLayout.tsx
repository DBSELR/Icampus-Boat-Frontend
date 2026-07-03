import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { 
  School, CreditCard, Wallet, BookOpen, Users, Settings, Search, Bell, Moon, Sun, 
  Palette, Calendar, ChevronDown, ChevronRight, ChevronLeft, Menu, X, LogOut, Pin, Star, CheckSquare,
  AlertTriangle, LayoutDashboard, UserCheck, ShieldAlert, Award, FileText, Settings2, Trash2, Edit2,
  UserPlus, Hash, Shuffle, CheckCircle2, FileCheck, ArrowUpCircle, FileDown, RefreshCw, UserX,
  Layers, Sliders, Receipt, Heart, Globe, HelpCircle, Percent, Upload, UploadCloud
} from "lucide-react";
import { Toaster, toast } from "sonner";
import "./MainLayout.css";

// Available Themes
const THEMES = [
  { id: "dbs-theme-blue", name: "Blue (Default)", color: "#2563eb" },
  { id: "dbs-theme-orange", name: "DBASE Orange", color: "#f97316" },
  { id: "dbs-theme-emerald", name: "Emerald", color: "#10b981" },
  { id: "dbs-theme-purple", name: "Purple", color: "#8b5cf6" },
  { id: "dbs-theme-slate", name: "Slate", color: "#475569" },
  { id: "dbs-theme-dark", name: "Dark Mode", color: "#1e293b" },
  { id: "dbs-theme-highcontrast", name: "High Contrast", color: "#000000" }
];

// Module definitions
const MODULES = [
  { id: "admissions", name: "Admissions", icon: School, path: "/admissions/entry" },
  { id: "fees", name: "Fees", icon: CreditCard, path: "/fees/account-master" },
  { id: "payroll", name: "Payroll", icon: Wallet, path: "/payroll" },
  { id: "accounting", name: "Accounting", icon: Wallet, path: "/accounting" },
  { id: "attendance", name: "Attendance", icon: UserCheck, path: "/attendance" },
  { id: "examinations", name: "Examinations", icon: Award, path: "/examinations" },
  { id: "stores", name: "Stores", icon: Settings, path: "/stores" },
  { id: "library", name: "Library", icon: BookOpen, path: "/library" },
  { id: "transport", name: "Transport", icon: Settings, path: "/transport" },
  { id: "discipline", name: "Discipline", icon: ShieldAlert, path: "/discipline" },
  { id: "performance", name: "Performance", icon: Award, path: "/performance" },
  { id: "hostels", name: "Hostels", icon: School, path: "/hostels" },
  { id: "medicare", name: "Medicare", icon: Settings, path: "/medicare" },
  { id: "front-office", name: "Front Office", icon: Users, path: "/front-office" },
  { id: "groups", name: "Groups", icon: Users, path: "/groups" },
  { id: "tappal", name: "Tappal", icon: FileText, path: "/tappal" },
  { id: "establishment", name: "Establishment", icon: School, path: "/establishment" },
  { id: "settings", name: "Settings", icon: Settings2, path: "/settings" }
];

// Submenus for active modules with specific icons
const SUBMENUS: Record<string, { name: string; path: string; icon: React.ComponentType<any> }[]> = {
  admissions: [
    { name: "Dashboard", path: "/admissions/dashboard", icon: LayoutDashboard },
    { name: "Students List", path: "/admissions/entry#list", icon: Users },
    { name: "Admissions Entry", path: "/admissions/entry", icon: UserPlus },
    { name: "Section and Roll No.", path: "/admissions/section-roll", icon: Hash },
    { name: "Group Change", path: "/admissions/group-change", icon: Shuffle },
    { name: "TC Issuing", path: "/admissions/tc-issuing", icon: LogOut },
    { name: "Study Certificate", path: "/admissions/study-cert", icon: FileText },
    { name: "Course Completed", path: "/admissions/course-completed", icon: CheckCircle2 },
    { name: "No Objection Certificate", path: "/admissions/noc", icon: FileCheck },
    { name: "Bonafide Certificate", path: "/admissions/bonafide", icon: FileText },
    { name: "Student Promotion", path: "/admissions/promotion", icon: ArrowUpCircle },
    { name: "Student Data Excel Export", path: "/admissions/excel-export", icon: FileDown },
    { name: "Section Change", path: "/admissions/section-change", icon: RefreshCw },
    { name: "InActive Student Delete", path: "/admissions/inactive-delete", icon: UserX }
  ],
  fees: [
    { name: "Dashboard", path: "/fees/dashboard", icon: LayoutDashboard },
    { name: "Account Master", path: "/fees/account-master", icon: BookOpen },
    { name: "Fee Heads Master", path: "/fees/heads-master", icon: Layers },
    { name: "Miscellaneous Heads", path: "/fees/misc-heads", icon: Settings },
    { name: "Fee Master", path: "/fees/fee-master", icon: Sliders },
    { name: "Miscellaneous Fee Challan", path: "/fees/misc-challan", icon: Receipt },
    { name: "Fee Collection", path: "/fees/collection", icon: CreditCard },
    { name: "Modify Fee Receipt", path: "/fees/modify-receipt", icon: Edit2 },
    { name: "Donation Collection", path: "/fees/donation", icon: Heart },
    { name: "Certificate of Fee Payment", path: "/fees/fee-payment-cert", icon: FileCheck },
    { name: "Online Fee Collection", path: "/fees/online-fee", icon: Globe },
    { name: "Admission Modes", path: "/fees/admission-modes", icon: HelpCircle },
    { name: "Fee Concession", path: "/fees/concession", icon: Percent },
    { name: "Fee Fine", path: "/fees/fine", icon: AlertTriangle },
    { name: "Receipt Cancellation", path: "/fees/cancellation", icon: Trash2 },
    { name: "Fee Verification", path: "/fees/verification", icon: CheckSquare },
    { name: "Fee Refund", path: "/fees/refund", icon: RefreshCw },
    { name: "Upload Bank Transaction Details", path: "/fees/upload-bank", icon: Upload },
    { name: "Exam Fee Upload Bank Transaction Details", path: "/fees/upload-exam-bank", icon: UploadCloud },
    { name: "Online Exam Fee Collection", path: "/fees/online-exam-fee", icon: CreditCard }
  ]
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  
  // Navigation & UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState<string>("home");
  const [academicYear, setAcademicYear] = useState<string>(() => localStorage.getItem("academicYear") || "");
  const [themeMode, setThemeMode] = useState<string>(() => localStorage.getItem("themeColor") || "dbs-theme-blue");
  
  // Dropdown & Panel States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  
  // Global Ctrl+K Search Command Palette
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  
  // Ref pointers to capture clicks outside dropdowns
  const notificationRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mock Notifications list
  const [notifications, setNotifications] = useState([
    { id: 1, type: "admission", text: "Admission Completed: SHAIK MOHAMMED GHOUSE JANI (M.Tech)", time: "10m ago", read: false },
    { id: 2, type: "fee", text: "Fee Received: ₹52,000 spot admission fee paid by GUDIMELLI MONIKA", time: "1h ago", read: false },
    { id: 3, type: "certificate", text: "Approval Pending: Study Certificate request for DARAPUNENI BHAVYA", time: "3h ago", read: false },
    { id: 4, type: "system", text: "System Alert: Current academic year configuration requires verification", time: "1d ago", read: true }
  ]);

  // Mock Data for Ctrl+K Search results
  const searchItems = [
    { title: "Student Admission (Stepper Entry)", subtitle: "Admissions > Admissions Entry", type: "module", path: "/admissions/entry" },
    { title: "Section Allocation Mapping", subtitle: "Admissions > Section and Roll No.", type: "module", path: "/admissions/section-roll" },
    { title: "Account Master Setup", subtitle: "Fees > Account Master", type: "module", path: "/fees/account-master" },
    { title: "SHAIK MOHAMMED GHOUSE JANI (M.Tech CSE)", subtitle: "Student Serial: 9808/25-26 | Roll No: 25MDS06", type: "student", path: "/admissions/entry?student=9808" },
    { title: "GUDIMELLI MONIKA (M.Tech CSE)", subtitle: "Student Serial: 9807/25-26 | Roll No: 25MDS05", type: "student", path: "/admissions/entry?student=9807" },
    { title: "DARAPUNENI BHAVYA (M.Tech CSE)", subtitle: "Student Serial: 9806/25-26 | Roll No: 25MDS04", type: "student", path: "/admissions/entry?student=9806" },
    { title: "General Capital Fund A/C", subtitle: "Fee Account Master - Opening: ₹10,00,000", type: "account", path: "/fees/account-master" }
  ];

  const filteredSearchItems = searchItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sync theme selection on body tag
  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(themeMode);
    localStorage.setItem("themeColor", themeMode);
  }, [themeMode]);

  // Sync active module category based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/admissions")) {
      setActiveModule("admissions");
    } else if (path.startsWith("/fees")) {
      setActiveModule("fees");
    } else if (path === "/home" || path === "/") {
      setActiveModule("home");
    } else {
      // Find matching module id from path
      const matched = MODULES.find(m => path.startsWith(m.path));
      setActiveModule(matched ? matched.id : "home");
    }
  }, [location.pathname]);

  // Click outside listener for dropdown panels
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeSelector(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Shortcuts (Ctrl+K, Esc, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K -> Open Global Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        setSearchQuery("");
        setSelectedSearchIndex(0);
      }
      // Esc -> Close Search Modals / Dialogs
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
      
      // Up / Down keys in search command bar
      if (searchOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedSearchIndex(prev => (prev + 1) % Math.max(1, filteredSearchItems.length));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedSearchIndex(prev => (prev - 1 + filteredSearchItems.length) % Math.max(1, filteredSearchItems.length));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredSearchItems[selectedSearchIndex]) {
            handleSearchSelect(filteredSearchItems[selectedSearchIndex].path);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, filteredSearchItems, selectedSearchIndex]);

  const handleSearchSelect = (path: string) => {
    setSearchOpen(false);
    history.push(path);
    toast.success("Navigated to destination");
  };

  const handleAcademicYearChange = (year: string) => {
    setAcademicYear(year);
    if (year) {
      localStorage.setItem("academicYear", year);
      toast.success(`Academic Year updated to ${year}`);
    } else {
      localStorage.removeItem("academicYear");
      toast.warning("Academic Year selection cleared!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    history.push("/login");
    toast.success("Logged out successfully");
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  // Breadcrumb mapping
  const getBreadcrumbs = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    const crumbs = [{ name: "Home", path: "/home" }];
    
    let currentPath = "";
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      let name = part.charAt(0).toUpperCase() + part.slice(1);
      if (part === "entry") name = "Admissions Entry";
      if (part === "section-roll") name = "Section and Roll Number";
      if (part === "account-master") name = "Account Master";
      crumbs.push({ name, path: currentPath });
    });
    return crumbs;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isLandingPage = location.pathname === "/home" || location.pathname === "/";

  return (
    <div className="dbs-layout-container">
      {/* --- LEFT SIDEBAR --- */}
      {!isLandingPage && (
        <aside className={`dbs-left-sidebar ${sidebarOpen ? "dbs-sidebar-open" : "dbs-sidebar-closed"}`}>
          <div className="dbs-sidebar-brand-area">
            <div 
              className="dbs-sidebar-logo-circle" 
              onClick={() => history.push("/home")} 
              style={{ cursor: "pointer" }}
            >
              <span>DBS</span>
            </div>
            {sidebarOpen && (
              <span 
                className="dbs-sidebar-brand-name" 
                onClick={() => history.push("/home")} 
                style={{ cursor: "pointer" }}
              >
                DBS ERP
              </span>
            )}
            <button className="dbs-sidebar-collapse-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ChevronLeft size={16} className={`dbs-chevron-icon ${!sidebarOpen ? "dbs-rotate-180" : ""}`} />
            </button>
          </div>


          {/* Submenu Area for selected module (like Admissions or Fees) */}
          {sidebarOpen && activeModule && SUBMENUS[activeModule] && (
            <div className="dbs-sidebar-submenu-area">
              <div className="dbs-submenu-title">{activeModule.toUpperCase()} SERVICES</div>
              <nav className="dbs-submenu-nav">
                {SUBMENUS[activeModule].map((sub, i) => {
                  const isActiveSub = location.pathname + location.hash === sub.path || location.pathname === sub.path;
                  const Icon = sub.icon;
                  return (
                    <button
                      key={i}
                      className={`dbs-submenu-link ${isActiveSub ? "dbs-submenu-active" : ""}`}
                      onClick={() => history.push(sub.path)}
                    >
                      <Icon size={16} className="dbs-submenu-icon" />
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </aside>
      )}

      {/* --- MAIN CORE PANEL --- */}
      <div className="dbs-main-core-panel">
        
        {/* --- TOP HEADER --- */}
        <header className="dbs-top-header">
          <div className="dbs-header-left">
            {!isLandingPage && (
              <button className="dbs-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu size={20} />
              </button>
            )}
            
            {/* Breadcrumbs or Logo on landing page */}
            {isLandingPage ? (
              <div 
                className="dbs-landing-header-brand" 
                onClick={() => history.push("/home")} 
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div className="dbs-sidebar-logo-circle">
                  <span>DBS</span>
                </div>
                <span className="dbs-sidebar-brand-name" style={{ color: "var(--dbs-text)", fontWeight: 800 }}>DBS ERP</span>
              </div>
            ) : (
              <div className="dbs-breadcrumbs-nav">
                {getBreadcrumbs().map((crumb, idx, arr) => (
                  <React.Fragment key={idx}>
                    <button 
                      className={`dbs-breadcrumb-btn ${idx === arr.length - 1 ? "dbs-breadcrumb-active" : ""}`}
                      onClick={() => history.push(crumb.path)}
                      disabled={idx === arr.length - 1}
                    >
                      {crumb.name}
                    </button>
                    {idx < arr.length - 1 && <span className="dbs-breadcrumb-separator">/</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="dbs-header-right">
            
            {/* Ctrl+K Global Search Trigger */}
            {!isLandingPage && (
              <button className="dbs-header-search-trigger" onClick={() => setSearchOpen(true)}>
                <Search size={16} />
                <span>Search everything...</span>
                <kbd className="dbs-search-kbd">Ctrl+K</kbd>
              </button>
            )}

            {/* Academic Year Selection */}
            <div className="dbs-header-year-selector">
              <Calendar size={15} className="dbs-year-icon" />
              <select
                value={academicYear}
                onChange={(e) => handleAcademicYearChange(e.target.value)}
                className={`dbs-year-dropdown ${!academicYear ? "dbs-year-warning-border" : ""}`}
              >
                <option value="">-- Select Year --</option>
                <option value="2025-2026">2025 - 2026</option>
                <option value="2026-2027">2026 - 2027</option>
                <option value="2027-2028">2027 - 2028</option>
              </select>
            </div>

            {/* Theme Selector */}
            <div className="dbs-header-dropdown-wrapper" ref={themeRef}>
              <button 
                className="dbs-header-icon-btn" 
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                title="Theme Colors"
              >
                <Palette size={18} />
              </button>
              {showThemeSelector && (
                <div className="dbs-dropdown-panel dbs-theme-panel">
                  <div className="dbs-dropdown-header">Brand Theme Selection</div>
                  <div className="dbs-theme-grid">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        className={`dbs-theme-btn-option ${themeMode === theme.id ? "dbs-theme-active-opt" : ""}`}
                        onClick={() => {
                          setThemeMode(theme.id);
                          setShowThemeSelector(false);
                          toast.success(`Theme switched to ${theme.name}`);
                        }}
                      >
                        <span className="dbs-theme-color-dot" style={{ backgroundColor: theme.color }} />
                        <span>{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="dbs-header-dropdown-wrapper" ref={notificationRef}>
              <button 
                className="dbs-header-icon-btn" 
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && <span className="dbs-notification-badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="dbs-dropdown-panel dbs-notification-panel">
                  <div className="dbs-dropdown-header">
                    <span>Notifications Feed</span>
                    {unreadCount > 0 && (
                      <button className="dbs-mark-read-btn" onClick={markAllNotificationsAsRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="dbs-notification-list">
                    {notifications.length === 0 ? (
                      <div className="dbs-dropdown-empty">No active notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`dbs-notification-item ${!n.read ? "dbs-notif-unread" : ""}`}>
                          <div className="dbs-notif-body">{n.text}</div>
                          <div className="dbs-notif-footer">
                            <span className="dbs-notif-time">{n.time}</span>
                            {!n.read && <span className="dbs-unread-dot" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Panel Toggle */}
            <button 
              className={`dbs-header-icon-btn ${rightPanelOpen ? "dbs-header-icon-btn-active" : ""}`} 
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              title="Quick Notes & Panel"
            >
              <CheckSquare size={18} />
            </button>

            <span className="dbs-header-divider" />

            {/* Profile Avatar Widget */}
            <div className="dbs-header-dropdown-wrapper" ref={profileRef}>
              <button className="dbs-header-profile-btn" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <div className="dbs-avatar-circle">DBS</div>
                <div className="dbs-profile-info-mini">
                  <span className="dbs-profile-name">DBS Admin</span>
                  <span className="dbs-profile-role">Super User</span>
                </div>
                <ChevronDown size={14} className="dbs-profile-arrow" />
              </button>
              {showProfileDropdown && (
                <div className="dbs-dropdown-panel dbs-profile-panel">
                  <div className="dbs-profile-header-expanded">
                    <div className="dbs-avatar-circle-lg">DBS</div>
                    <div>
                      <div className="dbs-profile-name-lg">D Base Solutions</div>
                      <div className="dbs-profile-email">admin@dbasesolutions.in</div>
                    </div>
                  </div>
                  <div className="dbs-profile-links">
                    <button className="dbs-profile-link-btn" onClick={() => { setShowProfileDropdown(false); history.push("/settings"); }}>
                      <Settings size={14} /> Profile Settings
                    </button>
                    <button className="dbs-profile-link-btn dbs-text-danger" onClick={handleLogout}>
                      <LogOut size={14} /> System Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Academic Year Warning Alert */}
        {!academicYear && (
          <div className="dbs-global-alert-warning">
            <AlertTriangle size={18} className="dbs-warning-alert-icon" />
            <div className="dbs-warning-alert-text">
              <strong>Warning!</strong> Please Select Current Academic Year from the dropdown in the header to initialize operations.
            </div>
          </div>
        )}

        {/* --- MAIN PAGE CONTENT WRAPPER --- */}
        <main className="dbs-page-content-wrapper">
          {children}
        </main>

        {/* --- FOOTER --- */}
        <footer className="dbs-layout-footer">
          <span>2026 © ERP Suite by D Base Solutions Pvt. Ltd. All rights reserved.</span>
          <span className="dbs-footer-meta">Version 4.1.0 (Stable)</span>
        </footer>

      </div>

      {/* --- RIGHT SIDE QUICK PANEL --- */}
      <aside className={`dbs-right-quick-panel ${rightPanelOpen ? "dbs-right-panel-open" : "dbs-right-panel-closed"}`}>
        <div className="dbs-right-panel-header">
          <h3>Quick Utilities</h3>
          <button className="dbs-panel-close-btn" onClick={() => setRightPanelOpen(false)}>
            <X size={18} />
          </button>
        </div>
        
        <div className="dbs-right-panel-body">
          {/* Mini Calendar simulation */}
          <div className="dbs-utility-card">
            <div className="dbs-utility-card-header">
              <Calendar size={14} />
              <span>Operations Calendar</span>
            </div>
            <div className="dbs-mini-calendar">
              <div className="dbs-calendar-header">July 2026</div>
              <div className="dbs-calendar-grid-days">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="dbs-calendar-grid-dates">
                <span className="dbs-cal-empty"></span>
                <span className="dbs-cal-empty"></span>
                <span className="dbs-cal-date">1</span>
                <span className="dbs-cal-date dbs-cal-today">2</span>
                <span className="dbs-cal-date">3</span>
                <span className="dbs-cal-date">4</span>
                <span className="dbs-cal-date">5</span>
                <span className="dbs-cal-date">6</span>
                <span className="dbs-cal-date">7</span>
                <span className="dbs-cal-date">8</span>
                <span className="dbs-cal-date">9</span>
                <span className="dbs-cal-date">10</span>
                <span className="dbs-cal-date">11</span>
                <span className="dbs-cal-date">12</span>
                <span className="dbs-cal-date">13</span>
                <span className="dbs-cal-date">14</span>
                {/* truncated for UI demo spacing */}
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="dbs-utility-card">
            <div className="dbs-utility-card-header">
              <Star size={14} />
              <span>Favorites / Shortcuts</span>
            </div>
            <div className="dbs-favorites-list">
              <button className="dbs-fav-item" onClick={() => history.push("/admissions/entry")}>
                <Pin size={12} className="dbs-pin-rotated" />
                <span>Student Admission Form</span>
              </button>
              <button className="dbs-fav-item" onClick={() => history.push("/admissions/section-roll")}>
                <Pin size={12} className="dbs-pin-rotated" />
                <span>Section Allocations</span>
              </button>
              <button className="dbs-fav-item" onClick={() => history.push("/fees/account-master")}>
                <Pin size={12} className="dbs-pin-rotated" />
                <span>Account Master Ledger</span>
              </button>
            </div>
          </div>

          {/* Quick Notes */}
          <div className="dbs-utility-card">
            <div className="dbs-utility-card-header">
              <FileText size={14} />
              <span>Scratch Notes</span>
            </div>
            <textarea
              className="dbs-quick-notes-textarea"
              placeholder="Type notes here... Saves automatically to workspace."
              defaultValue="Remember to verify the M.Tech Data Science admissions list by Friday."
            />
          </div>
        </div>
      </aside>

      {/* --- CTRL+K GLOBAL SEARCH MODAL --- */}
      {searchOpen && (
        <div className="dbs-search-overlay-modal">
          <div className="dbs-search-modal-box">
            <div className="dbs-search-input-wrapper">
              <Search size={20} className="dbs-search-input-icon" />
              <input
                type="text"
                placeholder="Type name, roll number, fee account, or module... (Esc to close)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedSearchIndex(0);
                }}
                autoFocus
                className="dbs-search-core-input"
              />
              <button className="dbs-search-close-button" onClick={() => setSearchOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="dbs-search-results-area">
              <div className="dbs-results-title">
                {searchQuery ? `Matching Results (${filteredSearchItems.length})` : "Recent Pages & Quick Links"}
              </div>
              <div className="dbs-results-list">
                {filteredSearchItems.length === 0 ? (
                  <div className="dbs-search-no-results">
                    No results match "{searchQuery}"
                  </div>
                ) : (
                  filteredSearchItems.map((item, idx) => (
                    <button
                      key={idx}
                      className={`dbs-search-result-item ${idx === selectedSearchIndex ? "dbs-search-item-selected" : ""}`}
                      onClick={() => handleSearchSelect(item.path)}
                      onMouseEnter={() => setSelectedSearchIndex(idx)}
                    >
                      <div className="dbs-result-item-left">
                        <span className={`dbs-result-badge dbs-badge-${item.type}`}>
                          {item.type.toUpperCase()}
                        </span>
                        <div className="dbs-result-details">
                          <span className="dbs-result-title-text">{item.title}</span>
                          <span className="dbs-result-subtitle-text">{item.subtitle}</span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="dbs-result-arrow" />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="dbs-search-footer-hint">
              <span>Navigate: <kbd>↑</kbd> <kbd>↓</kbd></span>
              <span>Select: <kbd>Enter</kbd></span>
              <span>Close: <kbd>Esc</kbd></span>
            </div>
          </div>
        </div>
      )}

      {/* --- TOASTER POPUPS SYSTEM --- */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default MainLayout;
