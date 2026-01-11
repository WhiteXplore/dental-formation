<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        ref="patientForm"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">
              {{ isEditMode ? "Edit" : "Add" }} Appointmentss
            </h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Form Body -->
        <div class="p-5 w-[30vw] space-y-3">
          <!-- Date and Time -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="scheduled_date" class="font-bold">Date:</label>
              <input
                v-model="form.scheduled_date"
                type="date"
                id="scheduled_date"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="appointment_time" class="font-bold">Time:</label>
              <input
                v-model="form.appointment_time"
                type="time"
                id="appointment_time"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              />
            </div>
          </div>
          <!-- Patient Dropdown -->
          <div class="w-full space-y-1.5 text-left relative">
            <label for="patient_id" class="font-bold">Patient:</label>
            <input
              v-model="searchPatientQuery"
              type="text"
              placeholder="Search patient..."
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              @focus="showPatientDropdown = true"
              @blur="hideDropdown('patient')"
            />
            <div
              v-if="showPatientDropdown"
              class="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto z-10"
            >
              <div v-if="filteredPatients.length > 0">
                <div
                  v-for="patient in filteredPatients"
                  :key="patient.patient_id"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  @mousedown="selectPatient(patient)"
                >
                  {{ patient.last_name }}, {{ patient.first_name }}
                  {{ patient.middle_name }}
                </div>
              </div>
              <div v-else class="px-3 py-2 text-gray-500 italic">
                No results found
              </div>
            </div>
          </div>

          <!-- Dentist Dropdown -->
          <div class="w-full space-y-1.5 text-left relative">
            <label for="user_id" class="font-bold">Dentist:</label>
            <input
              v-model="searchDentistQuery"
              type="text"
              placeholder="Search dentist..."
              class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
              @focus="showDentistDropdown = true"
              @blur="hideDropdown('dentist')"
            />

            <div
              v-if="showDentistDropdown"
              class="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto z-10"
            >
              <div v-if="filteredDentists.length > 0">
                <div
                  v-for="dentist in filteredDentists"
                  :key="dentist.user_id"
                  class="px-3 py-2 flex justify-between items-center cursor-pointer"
                  :class="{
                    'hover:bg-gray-100': dentist.isAvailable,
                    'opacity-50 cursor-not-allowed': !dentist.isAvailable,
                  }"
                  @mousedown.prevent="selectDentist(dentist)"
                >
                  <div class="flex flex-col">
                    <span>
                      Dr. {{ dentist.last_name }}, {{ dentist.first_name }}
                      {{ dentist.middle_name }}
                    </span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span
                        v-for="day in Array.isArray(dentist.available_days)
                          ? dentist.available_days
                          : [dentist.available_days]"
                        :key="day"
                        class="px-2 py-0.5 rounded-full text-xs font-medium text-white bg-blue-500"
                      >
                        {{ day }}
                      </span>
                    </div>

                    <span class="text-gray-600 text-sm">
                      {{ dentist.schedule_start }} - {{ dentist.schedule_end }}
                    </span>
                  </div>

                  <span
                    :class="
                      dentist.isAvailable
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    "
                  >
                    ({{ dentist.isAvailable ? "available" : "not-available" }})
                  </span>
                </div>
              </div>
              <div v-else class="px-3 py-2 text-gray-500 italic">
                No results found
              </div>
            </div>
          </div>

          <!-- Appointment Status -->
          <div class="flex flex-col gap-2">
            <div class="w-full space-y-2 text-left flex flex-col">
              <label for="appointment_status" class="font-bold"
                >Appointment Status:</label
              >
              <select
                v-model="form.appointment_status"
                required
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select appointment status</option>
                <option value="Walk-In">Walk-In</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
          </div>

          <!-- Divider -->
          <div class="w-full h-[1px] bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="tracking-wide flex justify-end gap-2 mt-4">
            <button
              type="button"
              class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
    <div
      v-if="showConflictModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
    >
      <div class="bg-white p-5 rounded-md shadow-lg w-[25vw]">
        <h2 class="font-bold text-lg mb-3">Conflict Warning</h2>
        <p>{{ conflictMessage }}</p>
        <div class="flex justify-end mt-4">
          <button
            @click="showConflictModal = false"
            class="bg-[#34699A] text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import { toast } from "vue3-toastify";
import axios from "axios";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState, mapActions } from "pinia";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  name: "AddAppointment",
  components: { icon },

  props: {
    editData: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      form: {
        patient_id: "",
        user_id: "",
        scheduled_date: "",
        appointment_status: "",
        appointment_time: "",
        medical_history: "",
      },

      searchPatientQuery: "",
      searchDentistQuery: "",
      showPatientDropdown: false,
      showDentistDropdown: false,

      showConflictModal: false,
      conflictMessage: "",
      loggedUser: null,
    };
  },

  computed: {
    ...mapState(useFetchDataStore, [
      "patients",
      "dentists",
      "appointments",
      "medications",
    ]),

    isEditMode() {
      return !!this.editData;
    },

    filteredPatients() {
      const query = this.searchPatientQuery.toLowerCase();
      if (!query) return this.patients;
      return this.patients.filter((p) =>
        `${p.last_name}, ${p.first_name} ${p.middle_name || ""}`
          .toLowerCase()
          .includes(query)
      );
    },

    filteredDentists() {
      const query = this.searchDentistQuery.toLowerCase();
      return this.dentists
        .filter((d) => d.role === "Dentist")
        .filter(
          (d) =>
            d.status !== "Inactive" &&
            d.status !== "InActive" &&
            d.status !== "Not Active"
        ) // <-- exclude inactive dentists
        .filter((d) =>
          `${d.last_name}, ${d.first_name} ${d.middle_name || ""}`
            .toLowerCase()
            .includes(query)
        )
        .map((d) => {
          let isAvailable = false;

          if (
            d.doctor_availability === "available" &&
            d.available_days?.length &&
            d.schedule_start &&
            d.schedule_end &&
            this.form.scheduled_date &&
            this.form.appointment_time
          ) {
            const selectedDay = dayjs(this.form.scheduled_date).format("dddd");
            const apptTime = dayjs(
              `${this.form.scheduled_date} ${this.form.appointment_time}`,
              "YYYY-MM-DD HH:mm"
            );
            const startTime = dayjs(
              `${this.form.scheduled_date} ${d.schedule_start}`,
              "YYYY-MM-DD HH:mm"
            );
            const endTime = dayjs(
              `${this.form.scheduled_date} ${d.schedule_end}`,
              "YYYY-MM-DD HH:mm"
            );

            if (
              d.available_days.includes(selectedDay) &&
              apptTime.isBetween(startTime, endTime, null, "[]")
            ) {
              isAvailable = true;
            }
          }

          return { ...d, isAvailable };
        });
    },
  },

  methods: {
    ...mapActions(useFetchDataStore, [
      "fetchPatients",
      "fetchDentist",
      "fetchAppointments",
      "fetchMedications",
    ]),

    selectPatient(patient) {
      this.form.patient_id = patient.patient_id;
      this.searchPatientQuery = `${patient.last_name}, ${patient.first_name} ${
        patient.middle_name || ""
      }`;
      this.showPatientDropdown = false;
    },

    selectDentist(dentist) {
      if (!dentist.isAvailable) {
        toast.warning(
          "This dentist is not available for the selected date/time."
        );
        return;
      }
      this.form.user_id = dentist.user_id;
      this.searchDentistQuery = `Dr. ${dentist.last_name}, ${
        dentist.first_name
      } ${dentist.middle_name || ""}`;
      this.showDentistDropdown = false;
    },

    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "dentist") this.showDentistDropdown = false;
      }, 150);
    },
    checkDentistConflict() {
      if (
        !this.form.user_id ||
        !this.form.scheduled_date ||
        !this.form.appointment_time
      )
        return false;

      const selectedDateTime = dayjs(
        `${this.form.scheduled_date} ${this.form.appointment_time}`
      ).tz("Asia/Manila");

      const dentistAppointments = this.appointments.filter(
        (appt) => appt.user_id === this.form.user_id
      );

      for (let appt of dentistAppointments) {
        // Convert stored UTC date to Manila
        const apptDateTime = dayjs(appt.scheduled_date)
          .tz("Asia/Manila")
          .hour(appt.appointment_time.split(":")[0])
          .minute(appt.appointment_time.split(":")[1]);

        if (selectedDateTime.isSame(apptDateTime, "day")) {
          const diffMinutes = Math.abs(
            selectedDateTime.diff(apptDateTime, "minute")
          );
          if (diffMinutes < 120) {
            this.conflictMessage = `This dentist already has an appointment at ${appt.appointment_time}. Please pick a time at least 2 hours apart.`;
            return true;
          }
        }
      }

      return false;
    },
    // 🚀 ADD + EDIT FUNCTION
    async submitData() {
      const formEl = this.$refs.patientForm;
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      // Fetch latest appointments
      await this.fetchAppointments();

      // Check conflict
      if (this.checkDentistConflict()) {
        this.showConflictModal = true;
        return;
      }

      try {
        const manilaDate = dayjs(this.form.scheduled_date)
          .tz("Asia/Manila")
          .format("YYYY-MM-DD");

        if (!this.isEditMode) {
          await axios.post(
            process.env.VUE_APP_API_BASE_URL + "/appointment/add-appointment",
            {
              ...this.form,
              scheduled_date: manilaDate,
            }
          );
          toast.success("Appointment added successfully!");
        } else {
          await axios.patch(
            process.env.VUE_APP_API_BASE_URL +
              `/appointment/${this.editData.appointment_id}`,
            {
              ...this.form,
              scheduled_date: manilaDate,
              notif_status: null,
              notif_viewed_at: null,
            }
          );
          toast.success("Appointment updated successfully!");
        }

        new Audio(require("@/assets/add.mp3")).play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        toast.error("Failed to save appointment.");
      }
    },
    async fetchUser() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL + "/auth/me",
          { withCredentials: true }
        );
        if (response.data) this.loggedUser = response.data;
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    },
    setEditForm() {
      const manilaDate = dayjs(this.editData.scheduled_date)
        .tz("Asia/Manila")
        .format("YYYY-MM-DD");

      this.form = {
        patient_id: this.editData.patient_id,
        user_id: this.editData.user_id,
        scheduled_date: manilaDate,
        appointment_time: this.editData.appointment_time,
        appointment_status: this.editData.appointment_status,
        medical_history: this.editData.medical_history,
      };

      // Auto-fill patient
      const patient = this.patients.find(
        (p) => p.patient_id === this.editData.patient_id
      );
      if (patient) {
        this.searchPatientQuery = `${patient.last_name}, ${
          patient.first_name
        } ${patient.middle_name || ""}`;
      }

      // Auto-fill dentist
      const dentist = this.dentists.find(
        (d) => d.user_id === this.editData.user_id
      );
      if (dentist) {
        this.searchDentistQuery = `Dr. ${dentist.last_name}, ${
          dentist.first_name
        } ${dentist.middle_name || ""}`;
      }

      // If logged-in user is the same dentist, override to ensure correct selection
      if (
        this.loggedUser?.role === "Dentist" &&
        this.loggedUser.sub === this.editData.user_id
      ) {
        this.form.user_id = this.loggedUser.sub;
        this.searchDentistQuery = `Dr. ${this.loggedUser.last_name}, ${
          this.loggedUser.first_name
        } ${this.loggedUser.middle_name || ""}`;
      }
    },
  },

  async mounted() {
    await this.fetchUser(); // fetch logged-in user
    this.fetchPatients();
    this.fetchDentist();
    this.fetchAppointments();

    if (this.isEditMode) {
      this.setEditForm();
    } else if (this.loggedUser?.role === "Dentist") {
      // Auto-fill dentist if logged-in user is dentist
      this.form.user_id = this.loggedUser.sub;
      this.searchDentistQuery = `Dr. ${this.loggedUser.last_name}, ${
        this.loggedUser.first_name
      } ${this.loggedUser.middle_name || ""}`;
    }
  },
};
</script>
