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
              {{ isEditMode ? "Edit" : "Add" }} Appointment
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
              class="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-md max-h-60 overflow-y-auto z-10"
            >
              <div v-if="filteredDentists.length > 0">
                <div
                  v-for="dentist in filteredDentists"
                  :key="dentist.user_id"
                  class="px-3 py-2 flex flex-col cursor-pointer"
                  :class="{
                    'hover:bg-gray-100': dentist.isAvailable,
                    'opacity-50 cursor-not-allowed': !dentist.isAvailable,
                  }"
                  @mousedown.prevent="selectDentist(dentist)"
                >
                  <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                      <span>
                        Dr. {{ dentist.last_name }}, {{ dentist.first_name }}
                        {{ dentist.middle_name || "" }}
                      </span>
                    </div>
                    <span
                      :class="
                        dentist.isAvailable
                          ? 'text-white bg-green-600 font-semibold px-2 py-1 rounded-full'
                          : 'text-white bg-red-900 font-semibold px-2 py-1 rounded-full'
                      "
                    >
                      {{ dentist.isAvailable ? "Available" : "Not-Available" }}
                    </span>
                  </div>

                  <!-- Morning Slots -->
                  <div>
                    <span class="font-semibold">
                      Morning
                      <span class="text-gray-600">
                        ({{
                          getSessionTimeRange(dentist, "morning") || "N/A"
                        }}) </span
                      >:
                    </span>

                    <span
                      v-if="getSessionSlots(dentist, 'morning') === null"
                      class="text-gray-500 italic"
                    >
                      N/A
                    </span>

                    <span
                      v-else
                      :class="
                        getSessionSlots(dentist, 'morning') > 0
                          ? 'text-green-600 font-bold'
                          : 'text-red-700'
                      "
                    >
                      {{ getSessionSlots(dentist, "morning") }}/5
                    </span>
                  </div>

                  <!-- Afternoon Slots -->
                  <div>
                    <span class="font-semibold">
                      Afternoon
                      <span class="text-gray-600">
                        ({{
                          getSessionTimeRange(dentist, "afternoon") || "N/A"
                        }}) </span
                      >:
                    </span>

                    <span
                      v-if="getSessionSlots(dentist, 'afternoon') === null"
                      class="text-gray-500 italic"
                    >
                      N/A
                    </span>

                    <span
                      v-else
                      :class="
                        getSessionSlots(dentist, 'afternoon') > 0
                          ? 'text-green-600 font-bold'
                          : 'text-red-700'
                      "
                    >
                      {{ getSessionSlots(dentist, "afternoon") }}/5
                    </span>
                  </div>
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
                <option value="Call">Call</option>
                <option value="Walk-In">Walk-In</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
          </div>

          <!-- Call Appointment Fields -->
          <div v-if="form.appointment_status === 'Call'" class="space-y-3">
            <!-- Call Type -->
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="call_type" class="font-bold">Call Type:</label>
              <select
                v-model="form.call_type"
                class="w-full border px-2 py-3 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select type</option>
                <option value="Cash">Cash</option>
                <option value="HMO">HMO</option>
              </select>
            </div>

            <!-- Dynamic Fields Based on Call Type -->
            <div class="space-y-2">
              <!-- Patient -->
              <div class="w-full space-y-1.5 text-left relative">
                <label class="font-bold">Patient:</label>
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

              <!-- Contact Number -->
              <div class="w-full space-y-1.5 text-left flex flex-col">
                <label class="font-bold">Contact Number:</label>
                <input
                  v-model="form.contact_number"
                  type="text"
                  class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                />
              </div>

              <!-- HMO-specific Fields -->
              <template v-if="form.call_type === 'HMO'">
                <!-- Birthdate -->
                <div class="w-full space-y-1.5 text-left flex flex-col">
                  <label class="font-bold">Birthdate:</label>
                  <input
                    v-model="form.birthdate"
                    type="date"
                    class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                  />
                </div>
              </template>

              <!-- Procedure -->
              <div class="w-full space-y-1.5 text-left relative">
                <label class="font-bold">Procedure:</label>
                <input
                  v-model="searchProcedureQuery"
                  type="text"
                  placeholder="Search procedure..."
                  class="px-3 py-3 border w-full border-gray-600 rounded-md text-md text-gray-800"
                  @focus="showProcedureDropdown = true"
                  @blur="hideDropdown('procedure')"
                  readonly
                />
                <div
                  v-if="showProcedureDropdown"
                  class="absolute left-0 top-full w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto z-10"
                >
                  <div v-if="filteredProcedures.length > 0">
                    <div
                      v-for="proc in filteredProcedures"
                      :key="proc.price_procedure_id"
                      class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      @mousedown.prevent="selectProcedure(proc)"
                    >
                      {{ proc.procedure_name }} - ₱{{ proc.price }}
                    </div>
                  </div>
                  <div v-else class="px-3 py-2 text-gray-500 italic">
                    No results found
                  </div>
                </div>
              </div>

              <!-- HMO Account No & Valid ID Side by Side -->
              <div
                v-if="form.call_type === 'HMO'"
                class="flex gap-2 justify-between"
              >
                <div class="w-1/2 space-y-1.5 text-left flex flex-col">
                  <label class="font-bold">HMO Account No:</label>
                  <input
                    v-model="form.hmo_account_no"
                    type="text"
                    class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                  />
                </div>
                <div class="w-1/2 space-y-1.5 text-left flex flex-col">
                  <label class="font-bold">Valid ID:</label>
                  <input
                    v-model="form.valid_id"
                    type="text"
                    class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Walk-In Patient Dropdown -->
          <div
            v-if="form.appointment_status === 'Walk-In'"
            class="w-full space-y-1.5 text-left relative"
          >
            <label class="font-bold">Patient:</label>
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
    editData: { type: Object, default: null },
  },
  data() {
    return {
      form: {
        patient_id: "",
        user_id: "",
        scheduled_date: "",
        appointment_status: "",
        appointment_time: "",
        call_type: "",
        contact_number: "",
        procedure: "", // price_procedure_id
        birthdate: "",
        hmo_account_no: "",
        valid_id: "",
      },
      searchPatientQuery: "",
      searchDentistQuery: "",
      searchProcedureQuery: "",
      showPatientDropdown: false,
      showDentistDropdown: false,
      showProcedureDropdown: false,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, [
      "patients",
      "dentists",
      "appointments",
      "prices",
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
          .includes(query),
      );
    },
    filteredDentists() {
      const query = this.searchDentistQuery.toLowerCase();

      const selectedDay = this.form.scheduled_date
        ? dayjs(this.form.scheduled_date).format("dddd")
        : null;

      return this.dentists
        .filter((d) => d.role === "Dentist" && d.status === "Active")
        .filter((d) =>
          `${d.last_name}, ${d.first_name} ${d.middle_name || ""}`
            .toLowerCase()
            .includes(query),
        )
        .map((d) => {
          const hasSchedule =
            selectedDay &&
            Array.isArray(d.schedules) &&
            d.schedules.some((s) => s.day === selectedDay);

          return {
            ...d,
            isAvailable: !!hasSchedule,
          };
        });
    },
    filteredProcedures() {
      const query = this.searchProcedureQuery.toLowerCase();
      if (!query) return this.prices;
      return this.prices.filter((p) =>
        p.procedure_name.toLowerCase().includes(query),
      );
    },
  },
  methods: {
    ...mapActions(useFetchDataStore, [
      "fetchPatients",
      "fetchDentist",
      "fetchAppointments",
      "fetchPrices",
    ]),
    formatTime(time) {
      if (!time) return "";

      // Supports "HH:mm" or "HH:mm:ss"
      const [hourStr, minute] = time.split(":");
      let hour = parseInt(hourStr, 10);

      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;

      // Show minutes only if not :00
      return minute && minute !== "00"
        ? `${hour}:${minute} ${period}`
        : `${hour} ${period}`;
    },
    getSessionTimeRange(dentist, session) {
      if (!this.form.scheduled_date) return null;

      const selectedDay = dayjs(this.form.scheduled_date).format("dddd");

      const schedules = (dentist.schedules || []).filter(
        (s) => s.day === selectedDay,
      );

      if (!schedules.length) return null;

      let filtered = [];

      if (session === "morning") {
        filtered = schedules.filter(
          (s) => parseInt(s.start_time.split(":")[0]) < 12,
        );
      }

      if (session === "afternoon") {
        filtered = schedules.filter(
          (s) => parseInt(s.start_time.split(":")[0]) >= 12,
        );
      }

      if (!filtered.length) return null;

      const start = filtered[0].start_time;
      const end = filtered[filtered.length - 1].end_time;

      return `${this.formatTime(start)} – ${this.formatTime(end)}`;
    },
    getDentistSchedules(dentist) {
      if (!this.form.scheduled_date) return [];

      const selectedDay = dayjs(this.form.scheduled_date).format("dddd");

      return (dentist.schedules || []).filter((s) => s.day === selectedDay);
    },
    getSessionSlots(dentist, session) {
      if (!this.form.scheduled_date) return null;

      const selectedDay = dayjs(this.form.scheduled_date).format("dddd");
      const schedules = (dentist.schedules || []).filter(
        (s) => s.day === selectedDay,
      );

      if (!schedules.length) return null;

      const isMorningAvailable = schedules.some((s) => {
        const start = parseInt(s.start_time.split(":")[0]);
        return start < 12;
      });

      const isAfternoonAvailable = schedules.some((s) => {
        const end = parseInt(s.end_time.split(":")[0]);
        return end > 12;
      });

      if (session === "morning" && !isMorningAvailable) return null;
      if (session === "afternoon" && !isAfternoonAvailable) return null;

      const selectedDate = dayjs(this.form.scheduled_date).format("YYYY-MM-DD");

      const dentistAppointments = this.appointments.filter(
        (appt) =>
          appt.user_id === dentist.user_id &&
          dayjs(appt.scheduled_date).format("YYYY-MM-DD") === selectedDate,
      );

      let count = 0;

      dentistAppointments.forEach((appt) => {
        const hour = parseInt(appt.appointment_time.split(":")[0]);
        if (session === "morning" && hour >= 9 && hour < 12) count++;
        if (session === "afternoon" && hour >= 12 && hour < 17) count++;
      });

      const maxSlots = 5;
      return maxSlots - count;
    },
    selectPatient(patient) {
      this.form.patient_id = patient.patient_id;
      this.searchPatientQuery = `${patient.last_name}, ${patient.first_name} ${
        patient.middle_name || ""
      }`;
      this.showPatientDropdown = false;
    },
    selectDentist(dentist) {
      if (!dentist.isAvailable) {
        toast.warning("This dentist has no schedule for the selected date.");
        return;
      }
      this.form.user_id = dentist.user_id;
      this.searchDentistQuery = `Dr. ${dentist.last_name}, ${
        dentist.first_name
      } ${dentist.middle_name || ""}`;
      this.showDentistDropdown = false;
    },
    selectProcedure(proc) {
      this.form.procedure = proc.price_procedure_id; // store ID
      this.searchProcedureQuery = proc.procedure_name;
      this.showProcedureDropdown = false;
    },
    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "dentist") this.showDentistDropdown = false;
        if (type === "procedure") this.showProcedureDropdown = false;
      }, 150);
    },
    async submitData() {
      const formEl = this.$refs.patientForm;
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      try {
        const manilaDate = dayjs(this.form.scheduled_date).format("YYYY-MM-DD");

        // Prepare payload
        const payload = {
          ...this.form,
          scheduled_date: manilaDate,
          price_procedure_id:
            this.form.appointment_status === "Call"
              ? this.form.procedure
              : null,
          call_type:
            this.form.appointment_status === "Call"
              ? this.form.call_type
              : null,
          contact_number:
            this.form.appointment_status === "Call"
              ? this.form.contact_number
              : null,
          birthdate:
            this.form.appointment_status === "Call" &&
            this.form.call_type === "HMO"
              ? this.form.birthdate
              : null,
          hmo_account_no:
            this.form.appointment_status === "Call" &&
            this.form.call_type === "HMO"
              ? this.form.hmo_account_no
              : null,
          valid_id:
            this.form.appointment_status === "Call" &&
            this.form.call_type === "HMO"
              ? this.form.valid_id
              : null,
        };

        if (!this.isEditMode) {
          await axios.post(
            process.env.VUE_APP_API_BASE_URL + "/appointment/add-appointment",
            payload,
          );
          toast.success("Appointment added successfully!");
        } else {
          await axios.patch(
            process.env.VUE_APP_API_BASE_URL +
              `/appointment/${this.editData.appointment_id}`,
            payload,
          );
          toast.success("Appointment updated successfully!");
        }

        this.$emit("refresh");
        this.$emit("close");
      } catch (error) {
        console.error(error);
        toast.error("Failed to save appointment.");
      }
    },
    setEditForm() {
      // Set all form fields from editData
      this.form = {
        ...this.editData,
        scheduled_date: this.editData.scheduled_date
          ? dayjs(this.editData.scheduled_date).format("YYYY-MM-DD")
          : "",
      };

      // Set Patient display
      const patient = this.patients.find(
        (p) => p.patient_id === this.form.patient_id,
      );
      if (patient) {
        this.searchPatientQuery = `${patient.last_name}, ${
          patient.first_name
        } ${patient.middle_name || ""}`;
      }

      // Set Dentist display
      const dentist = this.dentists.find(
        (d) => d.user_id === this.form.user_id,
      );
      if (dentist) {
        this.searchDentistQuery = `Dr. ${dentist.last_name}, ${
          dentist.first_name
        } ${dentist.middle_name || ""}`;
      }

      // Set Procedure display
      const procedure = this.prices.find(
        (p) => p.price_procedure_id === this.form.price_procedure_id,
      );
      if (procedure) {
        this.searchProcedureQuery = procedure.procedure_name;
        this.form.procedure = procedure.price_procedure_id;
      }
    },
  },
  mounted() {
    this.fetchPatients();
    this.fetchDentist();
    this.fetchAppointments();
    this.fetchPrices();

    if (this.isEditMode) this.setEditForm();
  },
};
</script>
