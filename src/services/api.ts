import axios from "axios";

// Bruk base-URL fra miljøvariabel – fallback til localhost hvis ikke satt
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

console.log("📡 API baseURL:", baseURL); // 🔍 Viktig for å bekrefte hvilken adresse som faktisk brukes

const api = axios.create({
  baseURL,
  withCredentials: true, // Tillater cookies ved behov
});

// 🔧 Global feilbehandling (valgfritt, men nyttig)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API-feil:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;
