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
            <h1 class="font-bold tracking-wide text-lg">Edi Appointment</h1>
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
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  @mousedown="selectDentist(dentist)"
                >
                  Dr. {{ dentist.last_name }}, {{ dentist.first_name }}
                  {{ dentist.middle_name }}
                </div>
              </div>
              <div v-else class="px-3 py-2 text-gray-500 italic">
                No results found
              </div>
            </div>
          </div>

          <!-- Date and Status -->
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

          <!-- Medical History -->
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
            <!-- <div class="w-full space-y-2 text-left flex flex-col">
              <label for="medical_history" class="font-bold"
                >Medical History:</label
              >
              <textarea
                v-model="form.medical_history"
                id="medical_history"
                required
                class="w-full h-[10vh] border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter medical history"
              ></textarea>
            </div> -->
          </div>

          <!-- Divider -->
          <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

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
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import { toast } from "vue3-toastify";
import axios from "axios";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState, mapActions } from "pinia";
import dayjs from "dayjs";
export default {
  name: "AddAppointment",
  components: { icon },
  props: {
    appointment: {
      type: Object,
      required: true,
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
      },
      searchPatientQuery: "",
      searchDentistQuery: "",
      showPatientDropdown: false,
      showDentistDropdown: false,
    };
  },
  watch: {
    appointment: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.form = {
            appointment_id: newVal.appointment_id,
            patient_id: newVal.patient?.patient_id || "",
            user_id: newVal.user_accounts?.user_id || "",
            scheduled_date: dayjs(newVal.scheduled_date).format("YYYY-MM-DD"),
            appointment_status: newVal.appointment_status,
            appointment_time: newVal.appointment_time,
          };

          this.searchPatientQuery = `${newVal.patient?.last_name || ""}, ${
            newVal.patient?.first_name || ""
          } ${newVal.patient?.middle_name || ""}`;

          this.searchDentistQuery = `Dr. ${
            newVal.user_accounts?.last_name || ""
          }, ${newVal.user_accounts?.first_name || ""} ${
            newVal.user_accounts?.middle_name || ""
          }`;
        }
      },
    },
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
      }, 150); // Delay to allow dropdown click
    },

    async submitData() {
      const form = this.$refs.patientForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Check if anything changed
      const hasChanges =
        this.form.patient_id !== this.appointment.patient?.patient_id ||
        this.form.user_id !== this.appointment.user_accounts?.user_id ||
        this.form.scheduled_date !==
          dayjs(this.appointment.scheduled_date).format("YYYY-MM-DD") ||
        this.form.appointment_time !== this.appointment.appointment_time ||
        this.form.appointment_status !== this.appointment.appointment_status;

      if (!hasChanges) {
        toast.warning("No changes detected.");
        return;
      }

      const inputDate = dayjs(this.form.scheduled_date).format("YYYY-MM-DD");
      const inputTime = this.form.appointment_time;
      const dentistId = this.form.user_id;

      // Check for conflict
      const hasConflict = this.appointments.some((a) => {
        const apptDate = dayjs(a.scheduled_date).format("YYYY-MM-DD");
        const apptTime = a.appointment_time;
        return (
          apptDate === inputDate &&
          apptTime === inputTime &&
          a.user_id === dentistId &&
          a.appointment_id !== this.form.appointment_id // exclude current appointment
        );
      });

      if (hasConflict) {
        toast.warning(
          "This dentist already has an appointment at the selected date and time."
        );
        return;
      }

      try {
        await axios.patch(
          `http://localhost:8000/appointment/${this.form.appointment_id}`,
          this.form
        );

        toast.success("Appointment updated successfully!");
        const audio = new Audio(require("@/assets/add.mp3"));
        audio.play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update appointment.");
      }
    },
  },
  mounted() {
    this.fetchPatients();
    this.fetchDentist();
    this.fetchAppointments().then(() => {
      console.log("Appointments fetched:", this.appointments);
    });
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
