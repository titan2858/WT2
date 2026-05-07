import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("cognicare_user") || "null"),
  token: localStorage.getItem("cognicare_token") || null,

  login: (user, token) => {
    localStorage.setItem("cognicare_token", token);
    localStorage.setItem("cognicare_user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("cognicare_token");
    localStorage.removeItem("cognicare_user");
    set({ user: null, token: null });
  },

  isDoctor:  () => useAuthStore.getState().user?.role === "doctor",
  isPatient: () => useAuthStore.getState().user?.role === "patient",
}));

export default useAuthStore;
