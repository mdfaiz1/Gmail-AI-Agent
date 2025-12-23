import axios from "axios";

// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000/api/v1"
//     : "https://snap-sync-backend.vercel.app/api/v1";

const BASE_URL = "http://localhost:3000/api/v1";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});
