import React from "react";
import { useHistory } from "react-router-dom";
import { 
  Users, UserPlus, CreditCard, Clock, FileText, ArrowRight, 
  CheckSquare, Calendar, ChevronRight, School, Award
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./AdmissionsDashboard.css";

const enrollmentData = [
  { name: "Jan", admissions: 120 },
  { name: "Feb", admissions: 140 },
  { name: "Mar", admissions: 180 },
  { name: "Apr", admissions: 220 },
  { name: "May", admissions: 280 },
  { name: "Jun", admissions: 340 }
];

export const AdmissionsDashboard: React.FC = () => {
  const history = useHistory();

  // Mock Recent Admissions
  const recentAdmissions = [
    { sNo: "9808/25-26", admNo: "25MDS06", date: "23-10-2025", name: "SHAIK MOHAMMED GHOUSE JANI", course: "M.Tech", branch: "Data Science" },
    { sNo: "9807/25-26", admNo: "25MDS05", date: "23-10-2025", name: "GUDIMELLI MONIKA", course: "M.Tech", branch: "Data Science" },
    { sNo: "9806/25-26", admNo: "25MDS04", date: "23-10-2025", name: "DARAPUNENI BHAVYA", course: "M.Tech", branch: "Data Science" },
    { sNo: "9805/25-26", admNo: "25MBA167", date: "22-10-2025", name: "TALAM BHARGAVI", course: "MBA", branch: "Business Admin" }
  ];

  return (
    <div className="dbs-home-container">
      {/* Dashboard Greeting Header */}
      <div className="dbs-home-greeting-area">
        <div>
          <h1>Admissions Analytics Dashboard</h1>
          <p>Here is what's happening across DBS Student Admissions today.</p>
        </div>
        <div className="dbs-home-date-stamp">
          <Calendar size={16} />
          <span>July 2, 2026</span>
        </div>
      </div>

      {/* --- EXECUTIVE KPI METRIC CARDS --- */}
      <section className="dbs-home-kpi-grid">
        <div className="dbs-home-kpi-card">
          <div className="dbs-kpi-header">
            <span className="dbs-kpi-title">Total Active Students</span>
            <div className="dbs-kpi-icon-box dbs-kpi-icon-blue">
              <Users size={20} />
            </div>
          </div>
          <div className="dbs-kpi-value">12,480</div>
          <div className="dbs-kpi-footer">
            <span className="dbs-text-success">↑ 4.2%</span> since last month
          </div>
        </div>

        <div className="dbs-home-kpi-card">
          <div className="dbs-kpi-header">
            <span className="dbs-kpi-title">Admissions Today</span>
            <div className="dbs-kpi-icon-box dbs-kpi-icon-orange">
              <UserPlus size={20} />
            </div>
          </div>
          <div className="dbs-kpi-value">42</div>
          <div className="dbs-kpi-footer">
            <span className="dbs-text-success">↑ 12%</span> vs yesterday
          </div>
        </div>

        <div className="dbs-home-kpi-card">
          <div className="dbs-kpi-header">
            <span className="dbs-kpi-title">Fee Collection Today</span>
            <div className="dbs-kpi-icon-box dbs-kpi-icon-emerald">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="dbs-kpi-value">₹5.2L</div>
          <div className="dbs-kpi-footer">
            <span className="dbs-text-success">98%</span> of target achieved
          </div>
        </div>

        <div className="dbs-home-kpi-card">
          <div className="dbs-kpi-header">
            <span className="dbs-kpi-title">Attendance Rate</span>
            <div className="dbs-kpi-icon-box dbs-kpi-icon-purple">
              <Clock size={20} />
            </div>
          </div>
          <div className="dbs-kpi-value">95%</div>
          <div className="dbs-kpi-footer">
            <span className="dbs-text-danger">↓ 0.5%</span> drop from weekly avg
          </div>
        </div>

        <div className="dbs-home-kpi-card">
          <div className="dbs-kpi-header">
            <span className="dbs-kpi-title">Pending Certificates</span>
            <div className="dbs-kpi-icon-box dbs-kpi-icon-danger">
              <FileText size={20} />
            </div>
          </div>
          <div className="dbs-kpi-value">12</div>
          <div className="dbs-kpi-footer">
            <span className="dbs-badge-urgent">Action Required</span>
          </div>
        </div>
      </section>

      {/* --- DASHBOARD WIDGETS SECTION --- */}
      <section className="dbs-home-widgets-grid">
        {/* Left Column: Recent Data & Charts */}
        <div className="dbs-home-widgets-column-main">
          
          {/* Chart Widget */}
          <div className="dbs-dashboard-card dbs-chart-card">
            <div className="dbs-card-header">
              <h3>Monthly Admissions Trends</h3>
              <p>Comparison of student registrations per month</p>
            </div>
            <div className="dbs-chart-container" style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--dbs-border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--dbs-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--dbs-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--dbs-surface)", 
                      borderColor: "var(--dbs-border)", 
                      color: "var(--dbs-text)", 
                      borderRadius: "8px" 
                    }} 
                  />
                  <Bar dataKey="admissions" fill="var(--dbs-primary)" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Admissions List */}
          <div className="dbs-dashboard-card">
            <div className="dbs-card-header dbs-header-with-action">
              <div>
                <h3>Recent Admissions</h3>
                <p>Newest additions to academic registers</p>
              </div>
              <button 
                className="dbs-card-action-btn"
                onClick={() => history.push("/admissions/entry#list")}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="dbs-table-container">
              <table className="dbs-dashboard-mini-table">
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>ADM.No.</th>
                    <th>Student Name</th>
                    <th>Course/Branch</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAdmissions.map((adm, index) => (
                    <tr key={index}>
                      <td>{adm.sNo}</td>
                      <td>{adm.admNo}</td>
                      <td className="dbs-student-name-td">{adm.name}</td>
                      <td>
                        <span className="dbs-pill-category">{adm.course}</span>
                        <span className="dbs-sub-branch">{adm.branch}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Quick Panel, Tasks & Activities */}
        <div className="dbs-home-widgets-column-side">
          
          {/* Quick Actions Navigation */}
          <div className="dbs-dashboard-card">
            <div className="dbs-card-header">
              <h3>Quick Actions</h3>
              <p>Jump to operational services</p>
            </div>
            <div className="dbs-quick-actions-box">
              <button className="dbs-quick-action-row" onClick={() => history.push("/admissions/entry")}>
                <div className="dbs-action-icon-wrapper dbs-kpi-icon-blue">
                  <School size={16} />
                </div>
                <div className="dbs-action-details">
                  <span>Student Admission Form</span>
                  <p>Register new student enrollment</p>
                </div>
                <ChevronRight size={14} className="dbs-arrow-icon" />
              </button>

              <button className="dbs-quick-action-row" onClick={() => history.push("/admissions/section-roll")}>
                <div className="dbs-action-icon-wrapper dbs-kpi-icon-orange">
                  <Users size={16} />
                </div>
                <div className="dbs-action-details">
                  <span>Section & Roll Number Mapping</span>
                  <p>Allocate students to stream sections</p>
                </div>
                <ChevronRight size={14} className="dbs-arrow-icon" />
              </button>

              <button className="dbs-quick-action-row" onClick={() => history.push("/fees/account-master")}>
                <div className="dbs-action-icon-wrapper dbs-kpi-icon-emerald">
                  <CreditCard size={16} />
                </div>
                <div className="dbs-action-details">
                  <span>Account Master Ledgers</span>
                  <p>Define fee collections chart heads</p>
                </div>
                <ChevronRight size={14} className="dbs-arrow-icon" />
              </button>
            </div>
          </div>

          {/* Pending Tasks list */}
          <div className="dbs-dashboard-card">
            <div className="dbs-card-header">
              <h3>System Worklist</h3>
              <p>Pending approval queue & operations tasks</p>
            </div>
            <div className="dbs-task-list">
              <div className="dbs-task-item dbs-task-priority-high">
                <div className="dbs-task-checkbox">
                  <CheckSquare size={16} className="dbs-task-checked-icon" />
                </div>
                <div className="dbs-task-body">
                  <span>Approve Student Bonafide Requests</span>
                  <p>Requested by Student 25MBA167</p>
                </div>
                <span className="dbs-task-priority-badge dbs-badge-danger">High</span>
              </div>

              <div className="dbs-task-item dbs-task-priority-medium">
                <div className="dbs-task-checkbox">
                  <CheckSquare size={16} className="dbs-task-checked-icon" />
                </div>
                <div className="dbs-task-body">
                  <span>Map B.Tech Section Allocations</span>
                  <p>Requires current academic year selected</p>
                </div>
                <span className="dbs-task-priority-badge dbs-badge-warning">Medium</span>
              </div>

              <div className="dbs-task-item dbs-task-priority-low">
                <div className="dbs-task-checkbox">
                  <CheckSquare size={16} className="dbs-task-checked-icon" />
                </div>
                <div className="dbs-task-body">
                  <span>Update Fee Master Heads List</span>
                  <p>Check audit reports for differences</p>
                </div>
                <span className="dbs-task-priority-badge dbs-badge-info">Low</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AdmissionsDashboard;
