<template>
  <div v-if="isTable">
    <!-- Header -->
    <div class="text-sm flex justify-between">
      <div class="text-[13px] text-text mt-4 font-regular">
        Pages / Appointment
      </div>

      <div
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 border text-green-600 border-green-600 rounded-xl hover:bg-green-700 hover:shadow-lg cursor-pointer transition duration-200"
      >
        <div
          class="p-1 bg-[#34699A] bg-opacity-20 rounded-full flex items-center justify-center"
        >
          <icon :name="'add-account1.1'" class="w-4 h-4" />
        </div>
        <span class="font-medium text-sm">Add Appointment</span>
      </div>
    </div>

    <!-- Table & Controls -->
    <div class="text-[14px] bg-white rounded-xl mt-4">
      <div class="overflow-x-auto border p-2 rounded-xl">
        <!-- Top controls -->
        <div class="text-gray-700 flex justify-between items-center mt-1">
          <!-- Items Per Page -->
          <div class="flex items-center">
            <select
              v-model="itemsPerPage"
              class="px-2 py-1 border rounded-md"
              @change="changePage(1)"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
            <span class="ml-2 text-sm">Per page</span>
          </div>

          <!-- Date Filter Toggle -->
          <div class="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              v-for="type in ['All', 'Past', 'Today', 'Upcoming']"
              :key="type"
              @click="setDateFilter(type)"
              class="px-4 py-1 text-sm rounded-lg transition-all duration-200"
              :class="{
                'bg-[#34699A] text-white shadow-md': activeDateFilter === type,
                'text-gray-600 hover:bg-gray-200': activeDateFilter !== type,
              }"
            >
              {{ type }}
            </button>
          </div>

          <!-- Search -->
          <div class="flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              class="px-3 w-[300px] py-2 border rounded-md"
              placeholder="Search..."
              @input="changePage(1)"
            />
          </div>
        </div>

        <!-- Table -->
        <div class="w-full mt-3 rounded-xl shadow overflow-hidden">
          <div
            class="overflow-y-auto transition-all duration-300"
            :class="tableHeightClass"
          >
            <table
              class="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-700"
            >
              <thead
                class="bg-[#34699A] text-white sticky top-0 z-10 tracking-wide"
              >
                <tr>
                  <th
                    class="w-10 px-4 py-2 text-left rounded-tl-lg font-normal"
                  >
                    No.
                  </th>
                  <th class="px-4 py-3 text-left font-normal">Dentist</th>
                  <th class="px-4 py-3 text-left font-normal">Patient</th>
                  <th class="px-4 py-3 text-left font-normal">Date</th>
                  <th class="px-4 py-3 text-left font-normal">Time</th>
                  <th class="px-4 py-3 text-left font-normal">Status</th>
                  <th class="px-4 py-3 text-left font-normal">Procedure</th>
                  <th class="px-4 py-3 text-left rounded-tr-lg font-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(appointment_data, index) in paginatedData"
                  :key="appointment_data.appointment_id"
                  class="bg-white hover:bg-green-50 transition-all border border-gray-200 rounded-md shadow-sm"
                >
                  <td class="px-4 py-2 text-left">{{ startIndex + index }}</td>

                  <td class="px-4 py-2 text-left">
                    Dr. {{ appointment_data.user_accounts?.last_name }},
                    {{ appointment_data.user_accounts?.first_name }}
                    {{ appointment_data.user_accounts?.middle_name }}
                  </td>

                  <td class="px-4 py-2 text-left">
                    {{ appointment_data.patient?.last_name }},
                    {{ appointment_data.patient?.first_name }}
                    {{ appointment_data.patient?.middle_name }}
                  </td>

                  <td class="px-4 py-2 text-left">
                    {{ formatScheduledDate(appointment_data.scheduled_date) }}
                  </td>

                  <td class="px-4 py-2 text-left">
                    {{ formatTime12(appointment_data.appointment_time) }}
                  </td>

                  <td class="px-4 py-2 text-left">
                    {{ appointment_data.appointment_status }}
                  </td>
                  <td class="px-4 py-2 text-left">
                    {{
                      appointment_data.priceProcedure?.procedure_name || "N/A"
                    }}
                  </td>

                  <td class="px-4 py-2 text-left">
                    <div class="flex gap-2">
                      <button
                        class="px-3 py-1 h-8 border border-green-300 hover:bg-green-200 text-green-800 rounded-lg flex items-center gap-1"
                        @click="openEditModal(appointment_data)"
                      >
                        <icon name="edit" /> Edit
                      </button>
                      <button
                        class="px-3 py-1 h-8 border border-red-300 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-1"
                        @click="toggleDelete(appointment_data)"
                      >
                        <icon name="delete" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="paginatedData.length === 0">
                  <td colspan="7" class="text-center py-8 text-gray-400">
                    No records found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-gray-700">
            Showing {{ startIndex }} to {{ endIndex }} of
            {{ filteredData.length }} entries
          </div>
          <div class="flex items-center">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 bg-gray-300 text-gray-700 rounded-l-md hover:bg-gray-400"
            >
              &lt;
            </button>
            <span v-for="page in pageNumbers" :key="'page-' + page">
              <button
                @click="changePage(page)"
                :class="{
                  'bg-[#34699A] text-white': currentPage === page,
                  'bg-gray-200 text-gray-700': currentPage !== page,
                }"
                class="px-3 py-1 mx-1 rounded-md hover:bg-green-300"
              >
                {{ page }}
              </button>
            </span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 bg-gray-300 text-gray-700 rounded-r-md hover:bg-gray-400"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Appointment Modal -->
  <addAppointment
    v-if="showAppointmentModal"
    :editData="appointmentToEdit"
    @close="closeAppointmentModal"
    @refresh="loadAppointments"
  />

  <!-- Delete Confirmation Modal -->
  <div
    v-if="showDeleteModal"
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  ></div>
  <div
    v-if="showDeleteModal"
    class="rounded-xl shadow-lg w-[300px] md:w-[400px] bg-white py-6 px-4 flex flex-col items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
  >
    <div
      class="rounded-full w-16 h-16 md:w-20 md:h-20 flex justify-center items-center bg-red-300 animate-pulse"
    >
      <icon name="question" class="w-8 h-8 md:w-10 md:h-10 text-white" />
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
import addAppointment from "../modals/add-appointment.vue";
import { toast } from "vue3-toastify";
import { useFetchDataStore } from "../../../../store/fetch-data-store";
import { mapState } from "pinia";
import axios from "axios";
import dayjs from "dayjs";

export default {
  name: "TableAppointment",
  components: {
    icon,
    addAppointment,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: "",
      showAppointmentModal: false,
      appointmentToEdit: null,
      isTable: true,
      showDeleteModal: false,
      recordToDelete: null,
      loggedUser: null,
      activeDateFilter: "All",
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),
    // Filter appointments by role
    filteredAppointmentsByUser() {
      if (!this.loggedUser) return [];

      const fullAccessRoles = ["Receptionist", "Admin"];

      if (fullAccessRoles.includes(this.loggedUser.role)) {
        return this.appointments;
      }

      if (this.loggedUser.role === "Dentist") {
        return this.appointments.filter(
          (appt) => appt.user_accounts?.user_id === this.loggedUser.sub,
        );
      }

      return [];
    },

    // Then apply search filter on top
    filteredData() {
      const query = this.searchQuery.toLowerCase();
      const today = dayjs().startOf("day");

      return this.filteredAppointmentsByUser
        .filter((item) => {
          const appointmentDate = dayjs(item.scheduled_date).startOf("day");

          if (this.activeDateFilter === "Past") {
            return appointmentDate.isBefore(today);
          }

          if (this.activeDateFilter === "Today") {
            return appointmentDate.isSame(today);
          }

          if (this.activeDateFilter === "Upcoming") {
            return appointmentDate.isAfter(today);
          }

          return true; // All
        })
        .filter((item) =>
          `${item.user_accounts?.first_name} ${
            item.user_accounts?.middle_name || ""
          } ${item.user_accounts?.last_name} ${item.patient?.first_name} ${
            item.patient?.middle_name || ""
          } ${item.patient?.last_name}`
            .toLowerCase()
            .includes(query),
        );
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
  },
  methods: {
    setDateFilter(type) {
      this.activeDateFilter = type;
      this.changePage(1);
    },

    formatTime12(time) {
      if (!time) return "-";

      // Add a dummy date to ensure valid parsing
      return dayjs(`2000-01-01 ${time}`, "YYYY-MM-DD HH:mm:ss").format(
        "hh:mm A",
      );
    },
    formatScheduledDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },
    async loadAppointments() {
      const store = useFetchDataStore();
      await store.fetchAppointments();
    },
    openAddModal() {
      this.appointmentToEdit = null;
      this.showAppointmentModal = true;
    },
    openEditModal(appointment) {
      this.appointmentToEdit = appointment;
      this.showAppointmentModal = true;
    },
    closeAppointmentModal() {
      this.showAppointmentModal = false;
      this.appointmentToEdit = null;
    },
    toggleDelete(item) {
      this.recordToDelete = item;
      this.showDeleteModal = true;
    },
    confirmDelete() {
      if (!this.recordToDelete) {
        toast.error("Invalid appointment.");
        return;
      }
      const id = this.recordToDelete.appointment_id;
      axios
        .delete(
          `${process.env.VUE_APP_API_BASE_URL}/appointment/delete-id/${id}`,
        )
        .then(() => {
          this.showDeleteModal = false;
          this.recordToDelete = null;
          const audio = new Audio(require("@/assets/delete.mp3"));
          audio.play();
          this.loadAppointments();
          toast.success("Record deleted successfully");
        })
        .catch(() => {
          toast.error("Failed to delete record.");
        });
    },
    changePage(page) {
      this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    },
    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          { withCredentials: true },
        );

        if (response.data) {
          this.loggedUser = response.data; // <-- store logged-in user
          console.log("Authenticated User:", this.loggedUser);
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
  mounted() {
    this.loadAppointments();
    this.fetchUser();
  },
};
</script>
