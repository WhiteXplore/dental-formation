<template>
  <div class="bg-white">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
      🦷 Patient by Procedure Type
    </h3>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-700">
        <thead class="text-xs uppercase text-gray-500 bg-gray-50">
          <tr>
            <th class="px-4 py-2">Procedure</th>
            <th class="px-4 py-2">Patient</th>
            <th class="px-4 py-2">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in procedureSummary"
            :key="i"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-4 py-3">{{ item.procedure }}</td>
            <td class="px-4 py-3">{{ item.patients }}</td>
            <td class="px-4 py-3">₱{{ item.revenue.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// import icon from "@/assets/icon.vue";

import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import dayjs from "dayjs";
import axios from "axios";

export default {
  name: "TablePatientProcedure",
  //   components: { icon },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      isAdd: false,
      isTable: true,
      editGroup: null,
      isEdit: false,
      isViewMedication: false,
      selectedPrescriptionId: null,
      user: null, // Store logged-in user
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),

    // Patient Revenue Summary computed property
    procedureSummary() {
      if (!Array.isArray(this.medications)) return [];

      const procedureMap = new Map();

      // Step 1: Group existing procedure data
      this.medications.forEach((item) => {
        const dentalChart = item.dentalChart;
        const patient = dentalChart?.patient;
        const teeth = dentalChart?.teeth || [];

        if (!patient) return;
        const patientId = patient.patient_id;

        teeth.forEach((tooth) => {
          const procedure = tooth.priceProcedure;
          if (!procedure) return;

          const procedureName = procedure.procedure_name;
          const price = parseFloat(procedure.price || "0");

          if (!procedureMap.has(procedureName)) {
            procedureMap.set(procedureName, {
              procedure: procedureName,
              patients: new Set(),
              revenue: 0,
            });
          }

          const entry = procedureMap.get(procedureName);
          entry.patients.add(patientId);
          entry.revenue += price;
        });
      });

      // Step 2: Add all known procedures with 0 values if not found
      const allProcedures = [
        "Check-Up",
        "Extracted",
        "Tooth Fillings",
        "Braces",
      ];

      allProcedures.forEach((name) => {
        if (!procedureMap.has(name)) {
          procedureMap.set(name, {
            procedure: name,
            patients: new Set(),
            revenue: 0,
          });
        }
      });

      // Step 3: Convert to array
      return Array.from(procedureMap.values()).map((entry) => ({
        procedure: entry.procedure,
        patients: entry.patients.size,
        revenue: entry.revenue,
      }));
    },
    filteredData() {
      const query = this.searchQuery.toLowerCase();

      if (!this.user || !Array.isArray(this.medications)) {
        return [];
      }

      return this.medications.filter((item) => {
        const dentist = item.dentalChart?.user_accounts;

        const dentistFullName = `${dentist?.first_name || ""} ${
          dentist?.middle_name || ""
        } ${dentist?.last_name || ""}`.toLowerCase();

        const matchesSearch = query === "" || dentistFullName.includes(query);

        const isSameUser = dentist?.user_id === this.user.sub;

        return matchesSearch && isSameUser;
      });
    },

    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage) || 1;
    },

    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredData.slice(start, start + this.itemsPerPage);
    },

    startIndex() {
      return this.filteredData.length === 0
        ? 0
        : (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    endIndex() {
      const end = this.currentPage * this.itemsPerPage;
      return end > this.filteredData.length ? this.filteredData.length : end;
    },

    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    },

    tableHeightClass() {
      return this.paginatedData.length <= 10 ? "h-auto" : "h-[65vh]";
    },

    groupedData() {
      const grouped = [];
      const patientMap = new Map();

      this.paginatedData.forEach((item) => {
        const pid = item.patient?.patient_id;
        if (!patientMap.has(pid)) {
          patientMap.set(pid, {
            patient: item.patient,
            rows: [item],
          });
        } else {
          patientMap.get(pid).rows.push(item);
        }
      });

      patientMap.forEach((value) => {
        grouped.push(value);
      });

      return grouped;
    },
  },

  methods: {
    viewMedication(prescriptionId) {
      this.selectedPrescriptionId = prescriptionId;
      this.isViewMedication = true;
    },

    formatScheduledDate(date) {
      return date ? dayjs(date).format("MMMM DD, YYYY") : "N/A";
    },

    hasMultipleDates(rows) {
      if (!rows || rows.length === 0) return false;
      const firstDate = this.formatScheduledDate(
        rows[0].dentalChart?.created_at
      );
      return rows.some(
        (r) => this.formatScheduledDate(r.dentalChart?.created_at) !== firstDate
      );
    },

    toggleAdd() {
      this.isAdd = true;
    },

    closeView() {
      this.isAdd = false;
    },

    editPrescription(group) {
      this.editGroup = group;
      this.isEdit = true;
    },

    closeEdit() {
      this.isEdit = false;
      this.editGroup = null;
    },

    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },

    getRowIndex(indexInGroup, groupIndex) {
      let offset = 0;
      for (let i = 0; i < groupIndex; i++) {
        offset += this.groupedData[i].rows.length;
      }
      return this.startIndex + offset + indexInGroup;
    },

    openMedication(id) {
      if (!id) return;
      this.selectedPrescriptionId = id;
      this.isViewMedication = true;
    },

    async loadMedications() {
      const store = useFetchDataStore();
      await store.fetchMedications();
    },

    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          this.user = response.data;
          console.log("Authenticated User:", this.user);
        } else {
          this.$router.push("/");
          location.reload();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.$router.push("/");
      }
    },
  },

  async mounted() {
    await this.fetchUser();
    await this.loadMedications();

    console.log(
      "Matching Records for Logged-in User:",
      this.medications.filter(
        (item) => item.user_accounts?.user_id === this.user?.sub
      )
    );
  },
};
</script>
