// import axios from "axios";

// const API_BASE = "https://localhost:44351/api/";

// export const uploadStudentData = async (file: File) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await axios.post(
//     `${API_BASE}StudentData/InsertStudentData`,
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     },
//   );

//   return response.data;
// };

// import React, { useState } from "react";
// import { uploadStudentData } from "./StudentDataApi";

// const StudentDataUpload = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const handleUpload = async () => {
//     if (!file) {
//       alert("Please select an Excel file.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const result = await uploadStudentData(file);

//       alert(result.message);
//     } catch (error: any) {
//       console.error(error);

//       if (error.response) {
//         alert(error.response.data);
//       } else {
//         alert("Upload failed.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h3>Student Data Upload</h3>

//       <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />

//       <br />
//       <br />

//       <button onClick={handleUpload} disabled={loading}>
//         {loading ? "Uploading..." : "Upload"}
//       </button>
//     </div>
//   );
// };

// export default StudentDataUpload;
