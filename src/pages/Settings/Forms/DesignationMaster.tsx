import { AlertCircle, Save, SquarePen, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { DeleteDesignation, fetchDesignationList, SaveDesignation, SaveDesignationOrder } from '../../../apis/SettingsApis';
import { toast } from 'sonner';
import "./DesignationMaster.css"
import DeleteModal from '../../../common/DeleteModal';

const DesignationMaster = () => {

    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    interface DessignationLoad {
        id: string;
        designation: string;
        academicYear: string;
        createdById: string;
        createdDate: string;
        modifiedById: string;
        modifiedDate: string;
        wORKMODE: string;
        desgOrd: string;
        oldOrder: string;
        desgOrdr: string;
    }

    const [designationInputs, setDesignationInputs] = useState({
        id: "",
        Designation: "",
        AcademicYear: "",
        UserId: "",
        WorkMode: "TEACHING",
        desgOrdr: "",
    })


    const [designationLoad, setDesignationLoad] = useState<DessignationLoad[]>([])
    const [designationLoading, setDesignationLoading] = useState(false)

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState<DessignationLoad | null>(null);
    const [deleting, setDeleting] = useState(false);


    const handleOrderChange = (id: string, value: string) => {
        setDesignationLoad((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, desgOrdr: value }
                    : item
            )
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setDesignationInputs((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const fetchdesgn = async () => {
        try {
            setDesignationLoading(true)
            const res = await fetchDesignationList(designationInputs.WorkMode)
            setDesignationLoad(res);
        } catch (error) {
            toast.error("Unable to load Designation");
        }
        finally {
            setDesignationLoading(false)
        }
    };

    const handleCancel = () => {
        setDesignationInputs({
            id: "",
            Designation: "",
            AcademicYear: "",
            UserId: "",
            WorkMode: "TEACHING",
            desgOrdr: ""
        });
        fetchdesgn();
    };

    const handleEdit = (item: DessignationLoad) => {

        setDesignationInputs({
            id: item.id.toString(),
            Designation: item.designation,
            AcademicYear: item.academicYear,
            UserId: item.createdById,
            WorkMode: item.wORKMODE,
            desgOrdr: item.desgOrdr
        });

    };

    const handleDelete = async (id: string) => {
        try {

            const payload = {
                id: id
            }

            const res = await DeleteDesignation(payload);

            if (res.message === "Success" && res.rowsAffected > 0) {
                toast.success("Designation Deleted Successfully");
                fetchdesgn(); // Refresh the table
                setShowDeleteModal(false);
                setDeleteItem(null);
            } else {
                toast.error("Unable to delete designation");
            }

        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleSave = async () => {

        if (designationInputs.WorkMode === "" || designationInputs.WorkMode === "Select Work Mode") {
            toast.error("Please Select Work Mode");
            return;
        }
        if (designationInputs.Designation.trim() === "") {
            toast.error("Please Enter Designation");
            return;
        }
        try {
            const payload = {
                id: designationInputs.id || "",
                Designation: designationInputs.Designation,
                AcademicYear: localStorage.getItem("academicYear"), // or your academic year variable
                UserId: userData.userId,
                WorkMode: designationInputs.WorkMode
            };
            const res = await SaveDesignation(payload);

            if (res.message === "Success" && res.rowsAffected > 0) {
                toast.success(payload.id ? "Designation Updated Successfully" : "Designation Saved Successfully");
                handleCancel();
            }
            else {
                toast.error("Unable to Save");
            }
        }
        catch (error) {
            toast.error("Something went wrong");
        }
    };

    // const handleSaveOrder = async () => {
    //     try {
    //         console.log(designationLoad)
    //         for (const item of designationLoad) {
    //             const payload = {
    //                 id: item.id.toString(),
    //                 WorkMode: item.wORKMODE,
    //                 DesigOrderId: item.desgOrdr.toString(),
    //             };
    //              console.log(payload)
    //             await SaveDesignationOrder(payload);
    //         }

    //         toast.success("Designation Order Saved Successfully");
    //         fetchdesgn();
    //     } catch (error) {
    //         toast.error("Unable to Save Order");
    //     }
    // };

    const handleSaveOrder = async () => {
    console.log("Total Records:", designationLoad.length);
    for (const item of designationLoad) {
        try {
            const payload = {
                id: item.id.toString(),
                WorkMode: item.wORKMODE,
                DesigOrderId: item.desgOrdr.toString(),
            };

            console.log("Calling API:", payload);
            const res = await SaveDesignationOrder(payload);
            // console.log("Response:", res);
        }catch (error: any) {
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Headers:", error.response?.headers);
    console.log("Full Error:", error);
}
    }
    toast.success("Designation Order Saved Successfully");
    fetchdesgn();
}; 

    useEffect(() => {
        fetchdesgn();
    }, [designationInputs.WorkMode])

    return (
        <div className="dbs-designationmaster-container">

            {/* Header */}
            <div className="dbs-designationmaster-form-header">
                <h2>Designation Master</h2>
            </div>

            {/* Form Card */}
            <div className="dbs-form-card">
                <h3>Designation Information</h3>
                <div className="dbs-form-grid-4">
                    <div className="dbs-input-box">
                        <label>Work Mode</label>
                        <select value={designationInputs.WorkMode} name='WorkMode' onChange={handleChange} >
                            <option >Select Work Mode</option>
                            <option value="TEACHING">TEACHING</option>
                            <option value="NON-TEACHING">NON-TEACHING</option>
                            <option value="OTHERS"> OTHERS</option>
                        </select>
                    </div>
                    <div className="dbs-input-box">
                        <label>Designation</label>
                        <input
                            type="text"
                            placeholder="Enter Category Type"
                            value={designationInputs.Designation}
                            name='Designation'
                            onChange={handleChange}
                        />
                    </div>

                </div>

                {/* Form Buttons */}
                <div className="dbs-form-actions-row">
                    <button
                        type="button"
                        className="dbs-form-cancel-btn"
                        onClick={handleCancel}
                    >
                        Cancel / Reset
                    </button>

                    <button
                        type="button"
                        className="dbs-form-save-btn"
                        onClick={handleSave}
                    >
                        <Save size={16} />{designationInputs.id ? " Update" : " Save"}
                    </button>
                </div>
            </div>


            {/* Reactive Table Grid */}
            <div className="dbs-table-container">
                {designationLoad.length === 0 ? (
                    <div className="dbs-empty-state">
                        <AlertCircle className="dbs-empty-state-icon" />
                        <div className="dbs-empty-state-title">No records found</div>
                        <div className="dbs-empty-state-desc">Try clearing your filters or add a new student above.</div>
                    </div>
                ) : (
                    <div className="dbs-table-card">
                        <div
                            className={
                                designationLoad.length > 5
                                    ? "dbs-table-scroll active-scroll"
                                    : "dbs-table-scroll"
                            }
                        >
                            <table className="dbs-data-table">
                                <thead>
                                    <tr>
                                        <th>SL.NO Order</th>
                                        <th>Work Mode</th>
                                        <th>Designation</th>
                                        <th>Action(s)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {designationLoad.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.desgOrdr}
                                                    className="dbs-order-input"
                                                    onChange={(e) =>
                                                        handleOrderChange(item.id, e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td>{item.wORKMODE}</td>
                                            <td>{item.designation}</td>
                                            <td>
                                                <div className="dbs-actions">
                                                    <button className="dbs-icon-btn edit" onClick={() => handleEdit(item)}>
                                                        <SquarePen size={18} />
                                                    </button>

                                                    <button
                                                        className="dbs-icon-btn delete"
                                                        title="Delete Designation"
                                                        onClick={() => {
                                                            setDeleteItem(item);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Form Buttons */}
                <div className="dbs-form-actions-row">
                    <button
                        type="button"
                        className="dbs-form-save-btn"
                        onClick={handleSaveOrder}
                    >
                        <Save size={16} />Save Order
                    </button>
                </div>


            </div>

            <DeleteModal
                open={showDeleteModal}
                title="Delete Designation"
                itemName={deleteItem?.designation}
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

export default DesignationMaster
