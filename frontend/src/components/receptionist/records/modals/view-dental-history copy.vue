<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl overflow-y-auto scrollbar-hidden"
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
      <div class="text-[13px]">
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
            class="p-5 bg-white"
          >
            <!-- Page 1: Patient Information -->
            <div v-if="currentPage[index] === 1" class="mx-auto w-[45vw]">
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
                    Record ID: {{ record.dental_id }}
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
                          record.patient
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Birthdate:</span
                        >
                        <span>{{
                          formatDate(record.patientDetails.birthdate)
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Gender:</span>
                        <span>{{ record.patientDetails.gender }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600">Age:</span>
                        <span>{{ record.patientDetails.age }}</span>
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
                        <span>{{ record.patientDetails.religion }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Nationality:</span
                        >
                        <span>{{ record.patientDetails.nationality }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Marital Status:</span
                        >
                        <span>{{ record.patientDetails.marital_status }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-600"
                          >Occupation:</span
                        >
                        <span>{{ record.patientDetails.occupation }}</span>
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
                        <span>{{ record.patientDetails.contact_number }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="font-medium text-gray-600 mb-1"
                          >Address:</span
                        >
                        <p
                          class="text-gray-800 bg-gray-50 border border-gray-200 rounded-md p-3 text-sm leading-relaxed"
                        >
                          {{ record.patientDetails.address }}
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
                          {{ record.patientDetails.parent_fullname }}
                        </span>
                      </div>

                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-600"
                          >Dental Insurance:</span
                        >
                        <span
                          class="text-gray-800 font-medium truncate max-w-[55%] text-right"
                        >
                          {{ record.patientDetails.dental_insurance }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 2: Dental Chart Info -->
            <div
              v-else-if="currentPage[index] === 2"
              class="w-[40vw] max-h-[70vh] overflow-y-auto 4"
            >
              <div
                class="w-full flex justify-between gap-4 mb-6 text-gray-800 font-semibold"
              >
                <div class="space-y-1 w-full">
                  <p class="text-gray-500 font-medium">Patient</p>
                  <p
                    class="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-line break-words max-w-full"
                  >
                    {{ record.patient }}
                  </p>
                </div>
                <div class="space-y-1 w-full">
                  <p class="text-gray-500 font-medium">Dentist</p>
                  <p
                    class="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-line break-words max-w-full"
                  >
                    Dr. {{ record.user_accounts }}
                  </p>
                </div>
                <div class="space-y-1 w-full">
                  <p class="text-gray-500 font-medium">Date</p>
                  <p
                    class="p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-line break-words max-w-full"
                  >
                    {{ formatDate(record.date) }}
                  </p>
                </div>
              </div>

              <!-- Procedure Notes -->
              <div class="space-y-1 mb-6 max-w-full">
                <p class="text-gray-500 font-medium">Procedure Notes</p>
                <p
                  class="text-gray-800 font-semibold p-3 bg-gray-50 border border-gray-200 rounded-md whitespace-pre-line break-words max-w-full"
                >
                  {{ record.notes }}
                </p>
              </div>

              <!-- X-Ray Image -->
              <div class="mb-6 max-w-full">
                <p class="text-gray-500 font-medium mb-2">X-Ray</p>
                <div v-if="record.xray" class="max-w-full">
                  <a
                    :href="
                      process.env.VUE_APP_API_BASE_URL +
                      `/dental-chart/xray/${record.dental_id}`
                    "
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      :src="
                        process.env.VUE_APP_API_BASE_URL +
                        `/dental-chart/xray/${record.dental_id}`
                      "
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
              </div>
            </div>

            <!-- Buttons: Previous / Next / Delete -->
            <div class="flex justify-between items-center mt-6">
              <!-- Left Side: Pagination -->
              <div>
                <button
                  v-if="currentPage[index] > 1"
                  @click="prevPage(index)"
                  class="bg-gray-700 px-4 py-2 rounded-lg text-white hover:bg-white border hover:border-gray-800 hover:text-gray-800 hover:shadow-md"
                >
                  Previous
                </button>
              </div>

              <!-- Right Side: Next or Delete -->
              <div class="flex gap-2">
                <button
                  v-if="currentPage[index] < 2"
                  @click="nextPage(index)"
                  class="bg-green-700 px-4 py-2 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
                >
                  Next
                </button>

                <!-- <button
                  v-else
                  class="bg-red-700 px-4 py-2 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
                  @click="deleteHistory(record.dental_id)"
                >
                  Delete Record
                </button> -->
              </div>
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
import dayjs from "dayjs";
import axios from "axios";

export default {
  name: "ViewDentalHistory",
  components: { icon },
  props: {
    patientId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      selectedDate: "",
      selectedDates: [],
      availableDates: [],
      history: [],
      groupedHistory: [],
      allGrouped: [],
      dropdownOpen: false,
      toothRows: [
        [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
        [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
        [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
        [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
      ],
      statusColors: {},
      currentPage: [],
      showDeleteModal: false,
      dentalIdToDelete: null,
    };
  },
  methods: {
    handleOutsideClick(event) {
      const dropdown = this.$refs.modalWrapper; // ✅ safe

      if (dropdown && !dropdown.contains(event.target)) {
        this.dropdownOpen = false;
      }
    },
    deleteHistory(dentalId) {
      this.dentalIdToDelete = dentalId;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      try {
        await axios.delete(
          process.env.VUE_APP_API_BASE_URL +
            `/dental-chart/${this.dentalIdToDelete}`
        );
        this.groupedHistory = this.groupedHistory.filter(
          (item) => item.dental_id !== this.dentalIdToDelete
        );
        this.allGrouped = this.allGrouped.filter(
          (item) => item.dental_id !== this.dentalIdToDelete
        );
        this.currentPage = this.groupedHistory.map(() => 1); // reset pages
        this.showDeleteModal = false;
        this.dentalIdToDelete = null;
        this.$emit("refresh");
      } catch (error) {
        console.error("Failed to delete record:", error);
        alert("Failed to delete record.");
        this.showDeleteModal = false;
      }
    },

    async fetchHistory() {
      try {
        const res = await axios.get(
          process.env.VUE_APP_API_BASE_URL +
            `/dental-chart/history/${this.patientId}`
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
    async fetchProcedureColors() {
      try {
        const res = await axios.get(
          process.env.VUE_APP_API_BASE_URL +
            "/price-procedure/get-price-procedure"
        );
        const activeProcedures = res.data.filter((p) => p.is_active);

        const map = {};
        activeProcedures.forEach((proc) => {
          map[proc.procedure_name] = proc.status_color;
        });

        map["Unknown"] = "bg-gray-300";
        this.statusColors = map;
      } catch (err) {
        console.error("Failed to fetch procedure colors:", err);
      }
    },

    applyDateFilter() {
      if (!this.selectedDate) {
        this.groupedHistory = [...this.allGrouped];
        return;
      }

      this.groupedHistory = this.allGrouped.filter(
        (g) => g.date === this.selectedDate
      );
      this.currentPage = this.groupedHistory.map(() => 1); // reset pagination
    },

    clearFilter() {
      this.selectedDate = "";
      this.groupedHistory = [...this.allGrouped];
      this.currentPage = this.groupedHistory.map(() => 1);
    },

    formatDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },

    nextPage(index) {
      this.currentPage.splice(index, 1, (this.currentPage[index] || 1) + 1);
    },
    prevPage(index) {
      this.currentPage.splice(index, 1, (this.currentPage[index] || 1) - 1);
    },
  },
  async mounted() {
    await this.fetchProcedureColors();
    await this.fetchHistory();
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none; /* IE 10+ */
  scrollbar-width: none; /* Firefox */
}
</style>
