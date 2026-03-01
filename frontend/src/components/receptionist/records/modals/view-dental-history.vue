<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl overflow-y-auto scrollbar-hidden w-full max-w-5xl"
    >
      <!-- Header -->
      <div
        class="flex justify-between items-center px-6 py-4 border-b bg-[#34699A] text-white rounded-t-xl"
      >
        <h2 class="text-xl font-semibold">Dental Chart History</h2>
        <icon
          name="circle-close3"
          class="cursor-pointer hover:scale-110 transition"
          @click="$emit('close')"
        />
      </div>

      <!-- Body -->
      <div class="text-[13px] p-4">
        <div
          v-if="groupedHistory.length === 0"
          class="text-gray-500 text-center italic py-12"
        >
          No dental history found for this patient.
        </div>

        <div v-else>
          <!-- Dental History Grouped by Date -->
          <div
            v-for="(group, index) in groupedHistory"
            :key="group.date"
            class=""
          >
            <!-- Patient Info (Page 1) -->
            <div v-if="currentPage[index] === 1" class="mx-auto">
              <!-- Header -->
              <div class="flex justify-between items-start">
                <div
                  class="flex flex-col justify-start items-start gap-2 mb-4 w-full"
                >
                  <h3
                    class="text-2xl font-semibold text-[#2C3E50] flex items-center gap-2"
                  >
                    Patient Information
                  </h3>
                  <span
                    class="text-sm text-gray-900 bg-green-100 px-3 py-1 rounded-full border border-gray-200"
                  >
                    Record ID: {{ group.records[0].dental_id }}
                  </span>
                </div>

                <!-- Date Filter -->
                <div class="flex justify-end items-center gap-2">
                  <select
                    id="dateFilter"
                    v-model="selectedDate"
                    @change="applyDateFilter"
                    class="border border-gray-300 px-3 py-3 text-sm rounded-lg"
                    :disabled="availableDates.length <= 1"
                  >
                    <option value="">All Dates</option>
                    <option
                      v-for="date in availableDates"
                      :key="date"
                      :value="date"
                    >
                      {{ formatDate(date) }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Card Container -->
              <div
                class="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-4 rounded-2xl border"
              >
                <!-- Left Column -->
                <div class="flex flex-col justify-between">
                  <!-- Basic Info -->
                  <div>
                    <h4
                      class="text-gray-700 font-semibold uppercase text-[13px] tracking-wide border-b border-gray-200 pb-2 mb-3"
                    >
                      Basic Information
                    </h4>
                    <div class="space-y-2 text-[14px] text-gray-700">
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Full Name:</span
                        >
                        <span class="font-semibold text-gray-800">{{
                          group.patient
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Birthdate:</span
                        >
                        <span>{{
                          formatDate(group.patientDetails.birthdate)
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Gender:</span>
                        <span>{{ group.patientDetails.gender }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Age:</span>
                        <span>{{ group.patientDetails.age }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Demographics -->
                  <div class="mt-8">
                    <h4
                      class="text-gray-700 font-semibold uppercase text-[13px] tracking-wide border-b border-gray-200 pb-2 mb-3"
                    >
                      Demographics
                    </h4>
                    <div class="space-y-2 text-[14px] text-gray-700">
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Religion:</span>
                        <span>{{ group.patientDetails.religion }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Nationality:</span
                        >
                        <span>{{ group.patientDetails.nationality }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Marital Status:</span
                        >
                        <span>{{ group.patientDetails.marital_status }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Occupation:</span
                        >
                        <span>{{ group.patientDetails.occupation }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="flex flex-col">
                  <!-- Contact Details -->
                  <div>
                    <h4
                      class="text-gray-700 font-semibold uppercase text-[13px] tracking-wide border-b border-gray-200 pb-2 mb-3"
                    >
                      Contact Information
                    </h4>
                    <div class="space-y-2 text-[14px] text-gray-700">
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Contact Number:</span
                        >
                        <span>{{ group.patientDetails.contact_number }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="font-medium text-gray-600 mb-1"
                          >Address:</span
                        >
                        <p
                          class="text-gray-800 bg-gray-50 border border-gray-200 rounded-md p-3 text-sm leading-relaxed"
                        >
                          {{ group.patientDetails.address }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Details -->
                  <div class="mt-9">
                    <h4
                      class="text-gray-700 font-semibold uppercase text-[13px] tracking-wide border-b border-gray-200 pb-2 mb-2"
                    >
                      Additional Details
                    </h4>
                    <div class="space-y-2 text-[14px] text-gray-700">
                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-600"
                          >Parent/Guardian:</span
                        >
                        <span
                          class="text-gray-800 font-medium truncate max-w-[55%] text-right"
                        >
                          {{ group.patientDetails.parent_fullname }}
                        </span>
                      </div>

                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-600"
                          >Dental Insurance:</span
                        >
                        <span
                          class="text-gray-800 font-medium truncate max-w-[55%] text-right"
                        >
                          {{ group.patientDetails.dental_insurance }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Operations Table (Page 2) -->
            <div v-else-if="currentPage[index] === 2" class="w-full">
              <h3 class="text-lg font-semibold mb-4">
                Dental Operations — {{ formatDate(group.date) }}
              </h3>
              <table class="w-full border border-gray-300 text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="border p-2 w-[20%]">Dentist</th>
                    <th class="border p-2 w-[15%]">Notes</th>
                    <th class="border p-2 w-[12%]">Procedure</th>
                    <th class="border p-2">X-Ray</th>
                    <th class="border p-2 max-w-[40%]">Teeth</th>
                    <th class="border p-2 w-[40%]">Medication</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in group.records" :key="record.dental_id">
                    <td class="border p-2">Dr. {{ record.dentist }}</td>
                    <td class="border p-2">
                      <span v-if="record.notes">{{ record.notes }}</span>
                      <span v-else class="italic text-gray-400">None</span>
                    </td>

                    <td class="border p-2">
                      {{ record.procedure_type.procedure_name }}
                    </td>
                    <td class="border p-2">
                      <img
                        v-if="record.xray_image_name"
                        :src="`${apiUrl}/dental-chart/xray/${
                          record.xray_image_name
                        }?t=${Date.now()}`"
                        class="w-20 mx-auto rounded"
                      />

                      <span v-else class="italic text-gray-400">None</span>
                    </td>
                    <td class="border p-2">
                      <div class="flex flex-wrap gap-1">
                        <div
                          v-for="(status, tooth) in record.teeth"
                          :key="tooth"
                          class="w-6 h-6 text-xs flex items-center justify-center border"
                          :class="statusColors[status]"
                        >
                          {{ tooth }}
                        </div>
                      </div>
                    </td>
                    <td class="border p-2 align-top">
                      <div v-if="record.prescribe && record.prescribe.length">
                        <ul class="list-disc pl-4 space-y-1">
                          <li
                            v-for="(med, i) in record.prescribe"
                            :key="med.prescribe_medication_id || i"
                            class="text-sm"
                          >
                            <span class="font-medium">{{ med.name }}</span>
                            ({{ med.dosage }}) – {{ med.pcs }} pcs •
                            {{ med.duration }} days • {{ med.frequencies }}x/day
                            •
                            {{ med.preparation }}
                          </li>
                        </ul>
                      </div>

                      <span v-else class="italic text-gray-400">None</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Buttons -->
            <div class="flex justify-between mt-4">
              <button
                v-if="currentPage[index] > 1"
                @click="prevPage(index)"
                class="px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Previous
              </button>

              <button
                v-if="currentPage[index] < 2"
                @click="nextPage(index)"
                class="px-4 py-2 bg-green-700 text-white rounded-lg ml-auto"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import axios from "axios";
import dayjs from "dayjs";

export default {
  name: "ViewDentalHistory",
  components: { icon },

  props: {
    patientId: { type: Number, required: true },
  },

  data() {
    return {
      apiUrl: process.env.VUE_APP_API_BASE_URL,
      groupedHistory: [],
      allGrouped: [],
      availableDates: [],
      selectedDate: "",
      currentPage: [],
      statusColors: {},
      user: null,
    };
  },

  methods: {
    async updateDentalChart(id, formData) {
      await axios.patch(`${this.apiUrl}/dental-chart/update/${id}`, formData, {
        withCredentials: true,
      });

      const recordGroup = this.groupedHistory.find((g) =>
        g.records.some((r) => r.dental_id === id),
      );

      if (recordGroup) {
        const dentalRecord = recordGroup.records.find(
          (r) => r.dental_id === id,
        );
        dentalRecord.xrayUpdatedAt = Date.now();
      }
    },

    async fetchHistory() {
      if (!this.user) return;

      const res = await axios.get(
        `${this.apiUrl}/prescription/patient/${this.patientId}`,
        { withCredentials: true },
      );

      const mapByDate = {};

      res.data.forEach((prescription) => {
        const chart = prescription.dentalChart;
        if (!chart || !chart.patient) return;

        const patient = chart.patient;
        const dentist = chart.user_accounts;

        // ✅ Use actual procedure date (better grouping)
        const date = chart.procedure_date
          ? dayjs(chart.procedure_date).format("YYYY-MM-DD")
          : prescription.issued_date;

        if (!mapByDate[date]) {
          mapByDate[date] = {
            date,
            patient: `${patient.last_name}, ${patient.first_name}`,
            patientDetails: patient,
            records: [],
          };
        }

        // ✅ FIXED TEETH MAPPING (your API structure)
        const teeth = {};
        (chart.teeth || []).forEach((t) => {
          teeth[t.tooth_number] =
            chart.priceProcedure?.procedure_name || "Unknown";
        });

        // ✅ FIXED MEDICATIONS (KEEP AS ARRAY)
        const medications = prescription.prescribedMedications || [];

        mapByDate[date].records.push({
          prescription_id: prescription.prescription_id,
          dental_id: chart.dental_id,
          dentist: dentist
            ? `${dentist.last_name}, ${dentist.first_name}`
            : "Unknown",
          notes: chart.procedure_notes,
          procedure_type: {
            procedure_name: chart.priceProcedure?.procedure_name || "Unknown",
          },
          xray_image_name: chart.xray_image,
          teeth,
          prescribe: medications, // 🔥 KEEP ARRAY
          payment_status: prescription.payment_status,
          instruction: prescription.instruction,
          is_discharged: prescription.is_discharged,
        });
      });

      // ✅ Sort newest first
      this.allGrouped = Object.values(mapByDate).sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      this.groupedHistory = [...this.allGrouped];
      this.availableDates = this.allGrouped.map((g) => g.date);
      this.currentPage = this.groupedHistory.map(() => 1);

      this.selectedDate = this.availableDates[0] || "";
      this.applyDateFilter();
    },

    async fetchProcedureColors() {
      const res = await axios.get(
        `${this.apiUrl}/price-procedure/get-price-procedure`,
      );

      res.data
        .filter((p) => p.is_active)
        .forEach((p) => {
          this.statusColors[p.procedure_name] = p.status_color;
        });

      this.statusColors["Unknown"] = "bg-gray-300";
    },

    applyDateFilter() {
      this.groupedHistory = this.selectedDate
        ? this.allGrouped.filter((g) => g.date === this.selectedDate)
        : [...this.allGrouped];

      this.currentPage = this.groupedHistory.map(() => 1);
    },

    formatDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },

    nextPage(i) {
      this.currentPage.splice(i, 1, 2);
    },

    prevPage(i) {
      this.currentPage.splice(i, 1, 1);
    },

    async fetchUser() {
      const res = await axios.get(`${this.apiUrl}/auth/me`, {
        withCredentials: true,
      });

      this.user = res.data;
    },
  },

  async mounted() {
    await this.fetchUser();
    await this.fetchProcedureColors();
    await this.fetchHistory();
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  scrollbar-width: none;
}
</style>
