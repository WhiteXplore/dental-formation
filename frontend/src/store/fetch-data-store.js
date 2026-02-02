import { defineStore } from "pinia";
import axios from "axios";
import { io } from "socket.io-client"; // add socket.io client

export const useFetchDataStore = defineStore("fetchData", {
  state: () => ({
    patients: [],
    appointments: [],
    dentists: [],
    payments: [],
    dentalCharts: [],
    medications: [],
    prescribemedication: [],
    inventories: [],
    useraccounts: [],
    hmoGuarantors: [],
    prices: [],
    loading: false,
    error: null,
    socket: null,
  }),

  actions: {
    async fetchHMOGuarantors() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL +
            "/hmo-guarantors/get-hmo-guarantors",
        );
        this.hmoGuarantors = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch hmoGuarantors";
      } finally {
        this.loading = false;
      }
    },
    async fetchPatients() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/patient/get-patient",
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
          process.env.VUE_APP_API_BASE_URL + "/appointment/get-appointment",
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
          process.env.VUE_APP_API_BASE_URL + "/user/get-user",
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
          process.env.VUE_APP_API_BASE_URL + "/payment/get-billing-payment",
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
          process.env.VUE_APP_API_BASE_URL + "/dental-chart/get-dental-chart",
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
          process.env.VUE_APP_API_BASE_URL + "/prescription/get-prescription",
        );
        this.medications = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch medications";
      } finally {
        this.loading = false;
      }
    },

    async fetchPrecribeMedication() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/prescribe-medication",
        );
        this.prescribemedication = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch prescribemedication";
      } finally {
        this.loading = false;
      }
    },

    async fetchInventories() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/inventory/get-inventory",
        );
        this.inventories = response.data;
      } catch (err) {
        this.error = err.message || "Failed to fetch inventories";
      } finally {
        this.loading = false;
      }
    },

    // ---------------------- WebSocket setup ----------------------
    initInventorySocket() {
      if (!this.socket) {
        this.socket = io(process.env.VUE_APP_API_BASE_URL);
        this.socket.on("inventory-updated", (updatedInventory) => {
          this.updateInventory(updatedInventory);
        });
      }
    },

    updateInventory(updated) {
      const index = this.inventories.findIndex(
        (i) => i.inventory_id === updated.inventory_id,
      );
      if (updated.deleted) {
        // remove deleted item
        if (index !== -1) this.inventories.splice(index, 1);
      } else if (index !== -1) {
        // update existing item
        this.inventories[index] = updated;
      } else {
        // add new item
        this.inventories.push(updated);
      }
    },
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/user/get-user",
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
            "/price-procedure/get-price-procedure",
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
  lowStockItems: (state) =>
    state.inventories.filter((i) => i.quantity > 0 && i.quantity <= 10),

  outOfStockItems: (state) => state.inventories.filter((i) => i.quantity === 0),

  inventoryNotifications(state) {
    return [
      ...state.outOfStockItems.map((i) => ({
        inventory_id: i.inventory_id,
        name: i.name,
        quantity: i.quantity,
        type: "out",
      })),
      ...state.lowStockItems.map((i) => ({
        inventory_id: i.inventory_id,
        name: i.name,
        quantity: i.quantity,
        type: "low",
      })),
    ];
  },
});
