import React from "react";
import { useHistory } from "react-router-dom";
import { Settings, ArrowLeft, Construction } from "lucide-react";
import "./ModulePlaceholder.css";

interface ModulePlaceholderProps {
  moduleName: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ moduleName }) => {
  const history = useHistory();

  return (
    <div className="dbs-placeholder-container">
      <div className="dbs-dashboard-card dbs-placeholder-card">
        <div className="dbs-placeholder-icon-circle">
          <Construction size={40} className="dbs-construction-icon" />
        </div>
        
        <h2>{moduleName} Module</h2>
        <span className="dbs-placeholder-status-badge">Under Construction</span>
        
        <p className="dbs-placeholder-desc">
          D Base Solutions is currently engineering the <strong>{moduleName}</strong> interface.
          This service is being built with high-performance databases and will be deployed in the next scheduled release.
        </p>

        <div className="dbs-placeholder-actions">
          <button className="dbs-placeholder-back-btn" onClick={() => history.push("/home")}>
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
