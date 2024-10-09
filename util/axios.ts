import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.AXIOS_BASE_URL,
});
