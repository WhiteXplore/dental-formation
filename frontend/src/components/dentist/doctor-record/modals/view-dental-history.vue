<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-xl shadow-2xl overflow-y-auto border scrollbar-hidden"
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
      <!-- Date Filter -->
      <!-- Place this at the end of your template -->
      <div class="w-full p-5">
        <div class="flex justify-end items-center gap-2">
          <label for="dateFilter" class="text-sm font-medium text-gray-700">
            Filter by Date:
          </label>
          <select
            id="dateFilter"
            v-model="selectedDate"
            @change="applyDateFilter"
            class="border border-gray-300 px-3 py-2 text-sm rounded-md"
            :disabled="availableDates.length <= 1"
          >
            <option value="">All Dates</option>
            <option v-for="date in availableDates" :key="date" :value="date">
              {{ formatDate(date) }}
            </option>
          </select>
        </div>
      </div>

      <!-- Body -->
      <div class="p-2 text-[13px]">
        <div
          v-if="groupedHistory.length === 0"
          class="text-gray-500 text-center italic py-12"
        >
          No dental history found for this patient.
        </div>

        <div v-else class="">
          <div
            v-for="(record, index) in groupedHistory"
            :key="index"
            class="border rounded-xl shadow p-6 bg-white"
          >
            <!-- Page 1: Patient Information -->
            <div v-if="currentPage[index] === 1" class="mx-auto w-[30vw]">
              <h3
                class="text-lg font-semibold border-b pb-3 mb-6 text-gray-800"
              >
                Patient Information
              </h3>

              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 space-y-2 gap-y-4 text-gray-700 text-sm"
              >
                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Full Name:</span>
                  <span class="text-right">{{ record.patient }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Birthdate:</span>
                  <span class="text-right">{{
                    formatDate(record.patientDetails.birthdate)
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Gender:</span>
                  <span class="text-right">{{
                    record.patientDetails.gender
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Age:</span>
                  <span class="text-right">{{
                    record.patientDetails.age
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Religion:</span>
                  <span class="text-right">{{
                    record.patientDetails.religion
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Nationality:</span>
                  <span class="text-right">{{
                    record.patientDetails.nationality
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600"
                    >Marital Status:</span
                  >
                  <span class="text-right">{{
                    record.patientDetails.marital_status
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Occupation:</span>
                  <span class="text-right">{{
                    record.patientDetails.occupation
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600"
                    >Dental Insurance:</span
                  >
                  <span class="text-right">{{
                    record.patientDetails.dental_insurance
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600"
                    >Parent/Guardian:</span
                  >
                  <span class="text-right">{{
                    record.patientDetails.parent_fullname
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600"
                    >Contact Number:</span
                  >
                  <span class="text-right">{{
                    record.patientDetails.contact_number
                  }}</span>
                </div>

                <div class="flex justify-between">
                  <span class="font-semibold text-gray-600">Address:</span>
                  <span class="text-right">{{
                    record.patientDetails.address
                  }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span class="font-semibold text-gray-600"
                    >Medical History:</span
                  >
                  <div
                    class="text-left whitespace-pre-line w-[100%] h-[10vh] bg-gray-50 border border-gray-300 rounded-md p-2"
                  >
                    {{ record.patientDetails.medical_history }}
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <span class="font-semibold text-gray-600"
                    >Dental History:</span
                  >
                  <div
                    class="text-left whitespace-pre-line w-[100%] h-[10vh] bg-gray-50 border border-gray-300 rounded-md p-2"
                  >
                    {{ record.patientDetails.dental_history }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 2: Dental Chart Info -->
            <div
              v-else-if="currentPage[index] === 2"
              class="w-[40vw] max-h-[60vh] overflow-y-auto 4"
            >
              <div
                class="w-full flex justify-between gap-4 mb-6 text-gray-800 font-semibold"
              >
                <div class="space-y-1 w-full">
                  <p class="text-gray-500 font-medium">Patient</p>
                  <p
                    class="p-3 bg-gray-50 border border-gray-100 rounded-md whitespace-pre-line break-words max-w-full shadow"
                  >
                    {{ record.patient }}
                  </p>
                </div>
                <div class="space-y-1 w-full">
                  <p class="text-gray-500 font-medium">Dentist</p>
                  <p
                    class="p-3 bg-gray-50 border border-gray-100 rounded-md whitespace-pre-line break-words max-w-full shadow"
                  >
                    Dr. {{ record.user_accounts }}
                  </p>
                </div>
                <div class="space-y-1 w-full">
                  <p class="text-gray-500 font-medium">Date</p>
                  <p
                    class="p-3 bg-gray-50 border border-gray-100 rounded-md whitespace-pre-line break-words max-w-full shadow"
                  >
                    {{ formatDate(record.date) }}
                  </p>
                </div>
              </div>

              <!-- Procedure Notes -->
              <div class="space-y-1 mb-6 max-w-full">
                <p class="text-gray-500 font-medium">Procedure Notes</p>
                <p
                  class="text-gray-800 font-semibold p-3 bg-gray-50 border border-gray-100 rounded-md whitespace-pre-line break-words max-w-full shadow"
                >
                  {{ record.notes }}
                </p>
              </div>

              <!-- X-Ray Image -->
              <div class="mb-6 max-w-full">
                <p class="text-gray-500 font-medium mb-2">X-Ray</p>
                <div v-if="record.xray" class="max-w-full">
                  <a
                    :href="`http://localhost:8000/dental-chart/xray/${record.dental_id}`"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      :src="`http://localhost:8000/dental-chart/xray/${record.dental_id}`"
                      alt="X-Ray"
                      class="w-48 max-w-full h-auto rounded-lg shadow border object-contain"
                    />
                  </a>
                </div>
                <p v-else class="italic text-gray-400">
                  No X-Ray image available
                </p>
              </div>

              <!-- Tooth Chart -->
              <div class="max-w-full">
                <p class="text-gray-500 font-medium mb-2">Tooth Chart</p>

                <!-- Legend -->
                <div
                  class="flex flex-wrap items-center justify-center gap-4 text-[13px] mb-5 max-w-full"
                >
                  <div
                    v-for="(color, status) in statusColors"
                    :key="status"
                    class="flex items-center gap-2"
                  >
                    <div
                      class="w-4 h-4 border border-black rounded"
                      :class="color"
                    ></div>
                    <span>{{ status }}</span>
                  </div>
                </div>

                <div
                  v-for="(row, rowIndex) in toothRows"
                  :key="rowIndex"
                  class="flex justify-center gap-[3px] mt-1 max-w-full flex-wrap"
                >
                  <template v-for="tooth in row" :key="tooth">
                    <div class="flex flex-col items-center gap-[2px]">
                      <div
                        class="w-8 h-8 border border-black flex items-center justify-center relative group"
                        :class="[
                          record.teeth[tooth]
                            ? statusColors[record.teeth[tooth]] || 'bg-blue-500'
                            : 'bg-white',
                        ]"
                      >
                        <div
                          class="w-4 h-4 border border-black rounded-full"
                        ></div>
                        <div
                          v-if="record.teeth[tooth]"
                          class="absolute bottom-full mb-1 text-xs bg-black text-white px-2 py-1 rounded hidden group-hover:block z-10"
                        >
                          {{ record.teeth[tooth] }}
                        </div>
                      </div>
                      <div
                        class="w-8 h-6 border border-black flex items-center justify-center text-[11px] font-medium"
                        :class="[
                          record.teeth[tooth]
                            ? 'bg-blue-500 text-white'
                            : 'bg-white',
                        ]"
                      >
                        {{ tooth }}
                      </div>
                    </div>
                  </template>
                </div>

                <!-- Delete Button -->
                <div class="mt-4 flex justify-end">
                  <button
                    class="bg-red-700 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
                    @click="deleteHistory(record.dental_id)"
                  >
                    Delete Record
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination Buttons -->
            <div class="flex justify-between mt-6">
              <button
                v-if="currentPage[index] > 1"
                @click="prevPage(index)"
                class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Previous
              </button>

              <button
                v-if="currentPage[index] < 2"
                @click="nextPage(index)"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50 w-min-screen"
  ></div>
  <div
    v-if="showDeleteModal"
    class="rounded-xl shadow-lg w-[300px] md:w-[400px] bg-white py-6 px-4 flex flex-col items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
  >
    <div
      class="rounded-full w-16 h-16 md:w-20 md:h-20 flex justify-center items-center bg-red-300 animate-pulse"
    >
      <icon
        name="question"
        class="w-8 h-8 md:w-10 md:h-10 text-white flex justify-center items-center"
      />
    </div>

    <h1 class="text-[14px] md:text-[16px] font-semibold mt-4">
      Delete Confirmation
    </h1>
    <p class="mt-2 text-[12px] md:text-[13px] text-center px-8">
      Are you sure you want to delete this record? This action cannot be undone.
    </p>

    <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

    <div class="tracking-wide flex gap-2 mt-4">
      <button
        class="bg-red-400 p-2 px-3 text-[11px] md:text-[13px] rounded-md text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
        @click="showDeleteModal = false"
      >
        No, Cancel
      </button>
      <button
        class="bg-green-400 p-2 px-3 text-[11px] md:text-[13px] rounded-md text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
        @click="confirmDelete"
      >
        Yes, Delete
      </button>
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
      selectedDate: "",
      availableDates: [],
      history: [],
      groupedHistory: [],
      allGrouped: [],
      currentPage: [],
      statusColors: {},
      toothRows: [
        [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
        [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
        [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
        [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
      ],
    };
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },
    patientInfo(details) {
      return {
        "Full Name": `${details.last_name}, ${details.first_name}`,
        Birthdate: this.formatDate(details.birthdate),
        Gender: details.gender,
        Age: details.age,
        Religion: details.religion,
        Nationality: details.nationality,
        "Marital Status": details.marital_status,
        Occupation: details.occupation,
        "Dental Insurance": details.dental_insurance,
        "Parent/Guardian": details.parent_fullname,
        "Contact Number": details.contact_number,
        Address: details.address,
      };
    },
    async fetchProcedureColors() {
      try {
        const res = await axios.get(
          process.env.VUE_APP_API_BASE_URL +
            "/price-procedure/get-price-procedure"
        );
        const active = res.data.filter((p) => p.is_active);
        const map = {};
        active.forEach((p) => (map[p.procedure_name] = p.status_color));
        map["Unknown"] = "bg-gray-300";
        this.statusColors = map;
      } catch (err) {
        console.error("Failed to fetch colors:", err);
      }
    },
    async fetchHistory() {
      try {
        const res = await axios.get(
          `http://localhost:8000/dental-chart/history/${this.patientId}`
        );
        const rawHistory = res.data || [];

        const grouped = rawHistory.map((entry) => {
          const toothMap = {};
          (entry.teeth || []).forEach((tooth) => {
            if (tooth.priceProcedure?.procedure_name) {
              toothMap[tooth.tooth_number] =
                tooth.priceProcedure.procedure_name;
            } else {
              toothMap[tooth.tooth_number] = "Unknown";
            }
          });

          return {
            dental_id: entry.dental_id,
            date: entry.procedure_date,
            patient: `${entry.patient?.last_name}, ${entry.patient?.first_name}`,
            patientDetails: entry.patient,
            user_accounts: `${entry.user_accounts?.last_name}, ${entry.user_accounts?.first_name}`,
            notes: entry.procedure_notes,
            xray: entry.xray_mime_type,
            teeth: toothMap,
          };
        });

        // Sort by ascending date
        const sortedGrouped = grouped.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        this.availableDates = [...new Set(sortedGrouped.map((g) => g.date))];

        const firstDate = this.availableDates[0];
        this.selectedDate = firstDate;
        this.allGrouped = [...sortedGrouped];
        this.groupedHistory = sortedGrouped.filter((g) => g.date === firstDate);
        this.currentPage = this.groupedHistory.map(() => 1);
      } catch (err) {
        console.error("Failed to fetch dental chart history:", err);
      }
    },
    applyDateFilter() {
      if (!this.selectedDate) {
        this.groupedHistory = [...this.allGrouped];
      } else {
        this.groupedHistory = this.allGrouped.filter(
          (g) => g.date === this.selectedDate
        );
      }
      this.currentPage = this.groupedHistory.map(() => 1);
    },
    deleteHistory(dentalId) {
      if (!confirm("Are you sure you want to delete this dental record?"))
        return;
      axios
        .delete(`http://localhost:8000/dental-chart/${dentalId}`)
        .then(() => {
          this.groupedHistory = this.groupedHistory.filter(
            (g) => g.dental_id !== dentalId
          );
          this.allGrouped = this.allGrouped.filter(
            (g) => g.dental_id !== dentalId
          );
          this.currentPage = this.groupedHistory.map(() => 1);
        })
        .catch((err) => {
          console.error("Failed to delete record:", err);
          alert("Failed to delete record.");
        });
    },
    nextPage(i) {
      this.currentPage.splice(i, 1, this.currentPage[i] + 1);
    },
    prevPage(i) {
      this.currentPage.splice(i, 1, this.currentPage[i] - 1);
    },
  },
  async mounted() {
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
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
