import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
//   baseURL: "https://interview-ai-k1k4.onrender.com",
  withCredentials: true, // ← correct spelling
});

/**
 * @description generate new interview report on the basis of use self description, resume pdf and job description
 */

export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);

    const response = await api.post("/api/interview", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })

    return response.data;
}

/**
 * @description get interview report by interview id
 */

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
}

/**
 * @description Service to get all interview reports of logged in user
 */

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview");
    return response.data;
}

/**
 * @description generate resume pdf based on job
 */

export const generateResumePdf = async (interviewReportId) => {
    const response = await api.post(
      `/api/interview/resume/pdf/${interviewReportId}`,
      null,
      {
        responseType: "blob",
      },
    );
    return response.data; // this will be the PDF file as a Blob
}

export const logoutUser = async () => {
    const response = await api.get("/api/auth/logout")
    return response.data
}