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
            <h1 class="font-bold tracking-wide text-lg">Add Appointment</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Form Body -->
        <div class="p-5 w-[30vw] space-y-3">
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
              <div v-if="filteredDentist.length > 0">
                <div
                  v-for="dentist in filteredDentist"
                  :key="dentist.user_id"
                  class="px-3 py-2 flex justify-between items-center cursor-pointer"
                  :class="
                    dentist.doctor_availability === 'available'
                      ? 'hover:bg-gray-100'
                      : 'opacity-50 cursor-not-allowed'
                  "
                  @mousedown="
                    dentist.doctor_availability === 'available' &&
                      selectDentist(dentist)
                  "
                >
                  <span>
                    Dr. {{ dentist.last_name }}, {{ dentist.first_name }}
                    {{ dentist.middle_name }}
                  </span>
                  <span
                    :class="
                      dentist.doctor_availability === 'available'
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    "
                  >
                    ({{ dentist.doctor_availability }})
                  </span>
                </div>
              </div>
              <div v-else class="px-3 py-2 text-gray-500 italic">
                No results found
              </div>
            </div>
          </div>

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
              <select
                v-model="form.appointment_time"
                id="appointment_time"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select Time</option>
                <option
                  v-for="time in availableTimes"
                  :key="time"
                  :value="time"
                >
                  {{ time }}
                </option>
              </select>
            </div>
          </div>

          <!-- Appointment Status -->
          <div class="flex flex-col gap-2">
            <div class="w-full space-y-2 text-left flex flex-col">
              <label for="appointment_status" class="font-bold">
                Appointment Status:
              </label>
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

    <!-- Conflict Modal -->
    <div
      v-if="conflictModal"
      class="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-40 z-50"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-[420px] md:w-[550px] p-8 relative overflow-hidden animate-fadeInUp"
      >
        <!-- Warning Icon -->
        <div class="w-full flex justify-center">
          <div
            class="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-5 shadow-inner"
          >
            <svg
              class="w-12 h-12 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" class="text-red-200" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2
          class="text-2xl md:text-3xl font-bold text-gray-800 mb-3 text-center tracking-tight"
        >
          Schedule Conflict Detected
        </h2>

        <!-- Message Box -->
        <div
          class="w-full px-5 py-3 mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 text-center text-sm md:text-base font-medium shadow-sm"
        >
          Please select another time with at least a
          <strong>1-hour interval</strong>.
        </div>

        <!-- Conflict Details -->
        <div
          class="w-full space-y-3 text-gray-700 text-sm md:text-base bg-gray-50 rounded-xl px-5 py-4 border border-gray-200"
        >
          <div class="flex justify-between">
            <span class="font-semibold text-gray-600">Patient:</span>
            <span class="font-semibold text-gray-900">{{
              conflictData.patientName
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold text-gray-600">Dentist:</span>
            <span class="font-semibold text-gray-900">{{
              conflictData.dentistName
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold text-gray-600">Date:</span>
            <span class="font-semibold text-gray-900">{{
              conflictData.date
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold text-gray-600">Time:</span>
            <span class="font-semibold text-gray-900">{{
              conflictData.time
            }}</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-full border-t border-gray-200 my-6"></div>

        <!-- Action Button -->
        <button
          class="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold w-full py-3 rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
          @click="conflictModal = false"
        >
          Okay, Got It
        </button>
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
dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  name: "AddAppointment",
  components: { icon },
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
      conflictModal: false,
      conflictData: null,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["patients", "dentists", "appointments"]),

    filteredPatients() {
      const query = this.searchPatientQuery.toLowerCase();
      if (!query) return this.patients;
      return this.patients.filter((p) =>
        `${p.last_name}, ${p.first_name} ${p.middle_name || ""}`
          .toLowerCase()
          .includes(query)
      );
    },

    filteredDentist() {
      const query = this.searchDentistQuery.toLowerCase();
      return this.dentists
        .filter((d) => d.role === "Dentist")
        .filter((d) =>
          `${d.last_name}, ${d.first_name} ${d.middle_name || ""}`
            .toLowerCase()
            .includes(query)
        );
    },

    availableTimes() {
      const times = [];
      let hour = 8;
      let minute = 0;
      while (hour < 17 || (hour === 17 && minute === 0)) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        times.push(`${formattedHour}:${formattedMinute}`);
        minute += 30;
        if (minute === 60) {
          minute = 0;
          hour++;
        }
      }
      return times;
    },
  },

  methods: {
    ...mapActions(useFetchDataStore, [
      "fetchPatients",
      "fetchDentist",
      "fetchAppointments",
    ]),

    selectPatient(patient) {
      this.form.patient_id = patient.patient_id;
      this.searchPatientQuery = `${patient.last_name}, ${patient.first_name} ${
        patient.middle_name || ""
      }`;
      this.showPatientDropdown = false;
    },

    selectDentist(dentist) {
      if (dentist.doctor_availability !== "available") {
        toast.warning("This dentist is not available.");
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

    async submitData() {
      const form = this.$refs.patientForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const inputDate = dayjs(this.form.scheduled_date).format("YYYY-MM-DD");
      const inputTime = this.form.appointment_time;
      const dentistId = this.form.user_id;
      const selectedTime = dayjs(
        `${inputDate} ${inputTime}`,
        "YYYY-MM-DD HH:mm"
      );

      // check 1-hour conflict
      const conflict = this.appointments.find((a) => {
        if (a.user_id !== dentistId) return false;
        const apptTime = dayjs(
          `${dayjs(a.scheduled_date).format("YYYY-MM-DD")} ${
            a.appointment_time
          }`,
          "YYYY-MM-DD HH:mm"
        );
        const diff = Math.abs(apptTime.diff(selectedTime, "minute"));
        return diff < 60;
      });

      if (conflict) {
        const patient = this.patients.find(
          (p) => p.patient_id === conflict.patient_id
        );
        const dentist = this.dentists.find((d) => d.user_id === dentistId);
        this.conflictData = {
          patientName: `${patient.last_name}, ${patient.first_name} ${
            patient.middle_name || ""
          }`,
          dentistName: `Dr. ${dentist.last_name}, ${dentist.first_name} ${
            dentist.middle_name || ""
          }`,
          date: dayjs(conflict.scheduled_date).format("YYYY-MM-DD"),
          time: conflict.appointment_time,
        };
        this.conflictModal = true;
        return;
      }

      try {
        // ✅ Timezone fix — convert to Manila time before sending
        const manilaDate = dayjs(this.form.scheduled_date)
          .tz("Asia/Manila")
          .format("YYYY-MM-DD");

        await axios.post(
          process.env.VUE_APP_API_BASE_URL + "/appointment/add-appointment",
          {
            ...this.form,
            scheduled_date: manilaDate,
          }
        );

        toast.success("Appointment added successfully!");
        const audio = new Audio(require("@/assets/add.mp3"));
        audio.play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        toast.error("Failed to add appointment.");
      }
    },
  },

  mounted() {
    this.fetchPatients();
    this.fetchDentist();
    this.fetchAppointments();
  },
};
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.3s ease-out;
}
</style>
