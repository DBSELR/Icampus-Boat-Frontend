import React, { useEffect, useState } from "react";
import "./SMSSettings.css";
import { toast } from "sonner";
import {
  getSMSSettingsList,
  saveSMSSettings,
} from "../../../apis/SettingsApis";

const SMSSettings = () => {
  const [smsList, setSmsList] = useState<any[]>([]);
  const [loading, setLoading] = useState("");

  const fetchSMSSettings = async () => {
    try {
      const response = await getSMSSettingsList();

      console.log("SMS Settings List:", response);

      setSmsList(response || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load SMS settings");
    }
  };

  useEffect(() => {
    fetchSMSSettings();
  }, []);

  const handleStatusChange = async (item: any) => {
    try {
      setLoading(item.mODULE);

      const payload = {
        module: item.mODULE,
        isActive: item.iSACTIVE === "Y" ? "N" : "Y",
      };

      const response = await saveSMSSettings(payload);

      if (response?.message === "Success") {
        toast.success(`${item.mODULE} status updated`);

        // reload latest data
        fetchSMSSettings();
      } else {
        toast.error(response?.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading("");
    }
  };

  const activeCount = smsList.filter((item) => item.iSACTIVE === "Y").length;

  return (
    <div className="dbs-sms-container">
      {/* Header */}
      <div className="dbs-sms-header">
        <div>
          <h2>SMS Settings</h2>
          <p>Configure SMS notification services and availability status</p>
        </div>
      </div>

      {/* Summary */}
      <div className="dbs-sms-summary">
        <div className="dbs-sms-summary-card">
          <span>Total Services</span>
          <strong>{smsList.length}</strong>
        </div>

        <div className="dbs-sms-summary-card active">
          <span>Active Services</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="dbs-sms-summary-card inactive">
          <span>Inactive Services</span>
          <strong>{smsList.length - activeCount}</strong>
        </div>
      </div>

      {/* Table */}

      <div className="dbs-sms-table-card">
        <div className="dbs-sms-table-title">
          <h3>SMS Service List</h3>
        </div>

        <div className="dbs-sms-table-scroll">
          <table className="dbs-sms-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {smsList.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="dbs-sms-service">
                      <span className="dbs-sms-dot"></span>

                      {item.mODULE}
                    </div>
                  </td>

                  <td>
                    <button
                      disabled={loading === item.mODULE}
                      onClick={() => handleStatusChange(item)}
                      className={
                        item.iSACTIVE === "Y"
                          ? "dbs-sms-active"
                          : "dbs-sms-inactive"
                      }
                    >
                      {loading === item.mODULE ? "Updating..." : item.text}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SMSSettings;
