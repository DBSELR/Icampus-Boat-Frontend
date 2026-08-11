import React, { useEffect, useRef, useState } from 'react'
import "./SmsTemplateRegistration.css"
import { AlertCircle, Save, SquarePen, Trash2 } from 'lucide-react'
import { deleteSmsTemplate, loadSmsTemplates, saveSmsTemplate } from '../../../apis/SettingsApis';
import { toast } from 'sonner';
import DeleteModal from '../../../common/DeleteModal';

const SmsTemplateRegistration = () => {


    interface SmsTemplate {
        id: string;
        sENDER_ID: string;
        tEMPLATE_NAME: string;
        tEMPLATE_CONTENT: string;
        tEMPLATE_ID: string;
        isActive: string;
    }

    const [dataInput, setDataInput] = useState<SmsTemplate>({
        id: "",
        sENDER_ID: "",
        tEMPLATE_NAME: "",
        tEMPLATE_CONTENT: "",
        tEMPLATE_ID: "",
        isActive: ""
    })

    const [templateDataLoad, setTemplateDataLoad] = useState<SmsTemplate[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState<SmsTemplate | null>(null);
    const [deleting, setDeleting] = useState(false);

    const senderIdRef = useRef<HTMLSelectElement>(null);
    const templateNameRef = useRef<HTMLInputElement>(null);
    const templateIdRef = useRef<HTMLInputElement>(null);
    const smsContentRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setDataInput((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        setDataInput({
            id: "",
            sENDER_ID: "",
            tEMPLATE_NAME: "",
            tEMPLATE_CONTENT: "",
            tEMPLATE_ID: "",
            isActive: "",
        });
    };

    const onValidation = () => {
        if (dataInput.sENDER_ID === "") {
            toast.warning("Please Select Sender Id");
            senderIdRef.current?.focus();
            return;
        }

        if (dataInput.tEMPLATE_NAME.trim() === "") {
            toast.warning("Please Enter Template Name");
            templateNameRef.current?.focus();
            return;
        }

        if (dataInput.tEMPLATE_ID.trim() === "") {
            toast.warning("Please Enter Template Id");
            templateIdRef.current?.focus();
            return;
        }

        if (dataInput.tEMPLATE_CONTENT.trim() === "") {
            toast.warning("Please Enter SMS Content");
            smsContentRef.current?.focus();
            return;
        }
        return true
    }

    const fetchTemplates = async () => {
        try {
            const data = await loadSmsTemplates();
            setTemplateDataLoad(data);
        } catch (error) {
            toast.error("Data Not Found..!")
        }
    };

    const handleSave = async () => {

        try {
            if (!onValidation()) return;


            const payload = {
                SenderId: dataInput.sENDER_ID,
                TemplateName: dataInput.tEMPLATE_NAME,
                SmsContent: dataInput.tEMPLATE_CONTENT,
                TemplateId: dataInput.tEMPLATE_ID,
                Ident: dataInput.id === "" ? "" : Number(dataInput.id)
            };

            const response = await saveSmsTemplate(payload);

            if (response.message == "Success" && response.rowsAffected > 0) {
                toast.success("Data Saved Successfully");

                fetchTemplates();   // Reload table
                handleCancel();     // Clear form
            }
            else {
                toast.error("Data Not Saved Successfully");
            }

        } catch (error) {
            toast.error("Failed to Save");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSmsTemplate(id);
            toast.success("Deleted Successfully");
            fetchTemplates();
            setShowDeleteModal(false);
            setDeleteItem(null);
        } catch (error) {
            toast.error("Delete Failed");
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div className="dbs-smstemreg-container">

            {/* Header */}
            <div className="dbs-smstemreg-form-header">
                <h2>SMS Template Registration</h2>
            </div>

            {/* Form Card */}
            <div className="dbs-form-card">
                <h3>SMS Template Information</h3>
                <div className="dbs-form-grid-4">
                    <div className="dbs-input-box">
                        <label>Sender Id</label>
                        <select name="sENDER_ID" value={dataInput.sENDER_ID} ref={senderIdRef} onChange={handleChange}>
                            <option value="0">Select Sender Id</option>
                            <option value="LBRCEY">LBRCEY</option>
                        </select>
                    </div>
                    <div className="dbs-input-box">
                        <label>Template Name</label>
                        <input
                            type="text" name="tEMPLATE_NAME" value={dataInput.tEMPLATE_NAME} ref={templateNameRef}
                            placeholder="Enter Template Name" onChange={handleChange} />
                    </div>
                    <div className="dbs-input-box">
                        <label>Template Id</label>
                        <input
                            type="text" name="tEMPLATE_ID" value={dataInput.tEMPLATE_ID} ref={templateIdRef}
                            placeholder="Enter Template Id" onChange={handleChange} />
                    </div>
                </div>
                <div >
                    <div className="dbs-input-box">
                        <label>SMS / Template Content</label>
                        <textarea
                            rows={6} name="tEMPLATE_CONTENT" value={dataInput.tEMPLATE_CONTENT} ref={smsContentRef}
                            placeholder="SMS Content" onChange={handleChange} />
                    </div>
                </div>

                {/* Form Buttons */}
                <div className="dbs-form-actions-row">
                    <button
                        type="button"
                        className="dbs-form-cancel-btn" onClick={handleCancel}
                    >
                        Cancel / Reset
                    </button>

                    <button
                        type="button"
                        className="dbs-form-save-btn" onClick={handleSave}
                    >
                        <Save size={16} /> Save
                    </button>
                </div>
            </div>


            {/* Reactive Table Grid */}
            <div className="dbs-table-container">
                {templateDataLoad.length === 0 ? (
                    <div className="dbs-empty-state">
                        <AlertCircle className="dbs-empty-state-icon" />
                        <div className="dbs-empty-state-title">No records found</div>
                    </div>
                ) : (
                    <div className="dbs-table-card">
                        <div
                            className={
                                templateDataLoad.length > 5
                                    ? "dbs-table-scroll active-scroll"
                                    : "dbs-table-scroll"
                            }
                        >
                            <table className="dbs-data-table">
                                <thead>
                                    <tr>
                                        <th>SL.NO</th>
                                        <th>TEMPLATE NAME</th>
                                        <th>TEMPLATE CONTENT</th>
                                        <th>TEMPLATE ID</th>
                                        <th>Action(s)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templateDataLoad.map((item: any, index: number) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.tEMPLATE_NAME}</td>
                                            <td>{item.tEMPLATE_CONTENT}</td>
                                            <td>{item.tEMPLATE_ID}</td>
                                            <td>
                                                <button
                                                    className="dbs-icon-btn delete"
                                                    title="Delete Designation"
                                                    onClick={() => {
                                                        setDeleteItem(item);
                                                        setShowDeleteModal(true);
                                                    }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                    </div>
                )}


            </div>

            <DeleteModal
                open={showDeleteModal}
                title="Delete Designation"
                itemName={deleteItem?.tEMPLATE_ID}
                loading={deleting}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setDeleteItem(null);
                }}
                onConfirm={() => {
                    if (deleteItem) {
                        handleDelete(deleteItem.id.toString());
                    }
                }}
            />

        </div>

    )
}

export default SmsTemplateRegistration
