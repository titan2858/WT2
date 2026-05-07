import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://cognicare-backend.onrender.com",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cognicare_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cognicare_token");
      localStorage.removeItem("cognicare_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ──────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login:  (data) => api.post("/auth/login",  data),
  me:     ()     => api.get("/auth/me"),
};

// ─── Patients ──────────────────────────────────────
export const patientsAPI = {
  list:   ()       => api.get("/patients/"),
  create: (data)   => api.post("/patients/", data),
  get:    (id)     => api.get(`/patients/${id}`),
};

// ─── Sessions ──────────────────────────────────────
export const sessionsAPI = {
  create:        (data)      => api.post("/sessions/", data),
  mySessions:    ()          => api.get("/sessions/my"),
  doctorAll:     ()          => api.get("/sessions/doctor/all"),
  get:           (id)        => api.get(`/sessions/${id}`),
  start:         (id)        => api.patch(`/sessions/${id}/start`),
  complete:      (id)        => api.patch(`/sessions/${id}/complete`),
};

// ─── Results ───────────────────────────────────────
export const resultsAPI = {
  submit:       (data)       => api.post("/results/", data),
  bySession:    (sessionId)  => api.get(`/results/session/${sessionId}`),
  report:       (sessionId)  => api.get(`/results/report/${sessionId}`),
  doctorScore:  (id, score)  => api.patch(`/results/${id}/doctor-score`, { score }),
};

export default api;
