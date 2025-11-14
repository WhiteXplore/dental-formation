// src/stores/fetch-data-store.js
import { defineStore } from "pinia";
import axios from "axios";

export const useFetchDataStore = defineStore("fetchData", {
  state: () => ({
    patients: [],
    appointments: [],
    dentists: [],
    payments: [],
    dentalCharts: [],
    medications: [],
    inventories: [],
    useraccounts: [],
    prices: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPatients() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/patient/get-patient"
        );
        this.patients = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch patient";
      } finally {
        this.loading = false;
      }
    },

    async fetchAppointments() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/appointment/get-appointment"
        );
        this.appointments = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch appointments";
      } finally {
        this.loading = false;
      }
    },

    async fetchDentist() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/user/get-user"
        );
        this.dentists = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch dentists";
      } finally {
        this.loading = false;
      }
    },

    async fetchPayments() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/payment/get-billing-payment"
        );
        this.payments = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch payments";
      } finally {
        this.loading = false;
      }
    },

    async fetchDentalChart() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/dental-chart/get-dental-chart"
        );
        this.dentalCharts = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch dental charts";
      } finally {
        this.loading = false;
      }
    },

    async fetchMedications() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/prescription/get-prescription"
        );
        this.medications = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch medications";
      } finally {
        this.loading = false;
      }
    },

    async fetchInventories() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/inventory/get-inventory"
        );
        this.inventories = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch inventories";
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/user/get-user"
        );
        this.useraccounts = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch user accounts";
      } finally {
        this.loading = false;
      }
    },

    async fetchPrices() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL +
            "/price-procedure/get-price-procedure"
        );
        this.prices = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch prices";
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    notificationsByUser: (state) => (userId) => {
      return state.appointments
        .filter((appt) => appt.user_id === userId)
        .map((appt) => ({
          message: `Appointment with ${appt.patient.first_name} ${
            appt.patient.last_name
          } on ${new Date(appt.scheduled_date).toLocaleString()}`,
          time: new Date(appt.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          appointment_id: appt.appointment_id,
        }));
    },
  },
});
