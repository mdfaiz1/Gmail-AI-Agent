import { axiosInstance } from "./axios";

export const googleLoginApi = async code => {
  console.log(code);
  return axiosInstance.get(`/auth/google/login?code=${code}`);
};

export const getAuthUserApi = async () => {
  const response = await axiosInstance.get("/auth/user");
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const fetcheEmailsApi = async data => {
  // console.log("Fetching emails for user with data:", data.page);
  const response = await axiosInstance.get(
    `/email?page=${data.page}&limit=${data.limit}`
  );
  return response.data;
};

export const fetchEmailDetailApi = async emailId => {
  const response = await axiosInstance.get(`/email/${emailId}`);
  return response.data;
};

export const toggleEmailSyncApi = async data => {
  const response = await axiosInstance.post(
    `/email/toggleIsSync/${data.userId}?enable=${data.status}`,
    data
  );
  return response.data;
};

export const sendMailReplyApi = async data => {
  const resposne = await axiosInstance.put(
    `/email/sendMail/${data.emailId}`,
    data
  );
  return resposne.data;
};

export const regenerateEmailApi = async data => {
  // console.log(data);
  // return;
  const response = await axiosInstance.put(
    `/email/regenerateEmail/${data.emailId}`,
    data
  );
  return response.data;
};

export const cancelSendMailApi = async data => {
  // console.log(data);
  const resposne = await axiosInstance.put(
    `/email/cancelEmail/${data.emailId}`,
    data
  );
  return resposne.data;
};
