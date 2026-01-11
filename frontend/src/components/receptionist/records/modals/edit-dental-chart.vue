<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        ref="dentalChartForm"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
            <h1 class="font-bold tracking-wide text-lg">Add Dental Charssst</h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Body -->
        <div class="p-5 flex flex-col lg:flex-row gap-6">
          <!-- LEFT -->
          <div class="flex-1 space-y-4 w-[30vw]">
            <!-- Patient Search -->
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
                    v-for="appointment in filteredPatients"
                    :key="appointment.appointment_id"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    @mousedown="selectPatient(appointment)"
                  >
                    {{ appointment.patient?.last_name }},
                    {{ appointment.patient?.first_name }}
                    {{ appointment.patient?.middle_name }}
                  </div>
                </div>
                <div v-else class="px-3 py-2 text-gray-500 italic">
                  No results found
                </div>
              </div>
            </div>

            <!-- Tooth Chart -->
            <div class="space-y-1 mt-4">
              <label class="font-bold">Tooth Chart:</label>
              <div
                v-for="(row, index) in toothRows"
                :key="index"
                class="flex justify-center gap-[2px]"
              >
                <template v-for="tooth in row" :key="tooth">
                  <div class="flex flex-col items-center gap-[1px]">
                    <div
                      class="w-8 h-8 border border-black flex items-center justify-center cursor-pointer"
                      :class="[
                        selectedTeeth.includes(tooth)
                          ? statusColors[toothStatusMap[tooth]] || 'bg-blue-500'
                          : 'bg-white',
                      ]"
                      @click="toggleTooth(tooth)"
                    >
                      <div
                        class="w-4 h-4 border border-black rounded-full"
                      ></div>
                    </div>
                    <div
                      class="w-8 h-6 border border-black flex items-center justify-center text-[11px] font-medium cursor-pointer"
                      :class="[
                        selectedTeeth.includes(tooth)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white',
                      ]"
                      @click="toggleTooth(tooth)"
                    >
                      {{ tooth }}
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <p class="text-sm mt-2 text-gray-700">
              🦷 Total Selected Teeth:
              <strong>{{ selectedTeeth.length }}</strong>
            </p>

            <!-- Status Table -->
            <div class="mt-2 space-y-1">
              <label class="font-bold">Tooth Status Table:</label>
              <div class="flex gap-4 text-[12px] flex-wrap">
                <div
                  v-for="(color, status) in statusColors"
                  :key="status"
                  class="flex items-center gap-1"
                >
                  <span :class="['w-4 h-4 rounded-sm', color]"></span>
                  {{ procedureNameMap[status] }}
                </div>
              </div>

              <table
                class="w-full text-[13px] mt-3 border border-gray-300 rounded-md overflow-hidden shadow-sm text-center"
              >
                <thead
                  class="bg-gray-100 text-gray-700 uppercase text-[11px] tracking-wide"
                >
                  <tr>
                    <th class="p-3 w-10 border">Tooth #</th>
                    <th class="p-3 border w-28">Status</th>
                    <th class="p-3 border w-16">Color</th>
                    <th class="p-3 w-10 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="tooth in selectedTeeth"
                    :key="tooth"
                    class="border-t border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    <td class="p-3 border">{{ tooth }}</td>
                    <td class="p-3 border">
                      <select
                        v-model="toothStatusMap[tooth]"
                        class="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-green1 focus:border-green1"
                      >
                        <option value="" disabled>Select Status</option>
                        <option
                          v-for="proc in prices.filter((p) => p.is_active)"
                          :key="proc.price_procedure_id"
                          :value="proc.price_procedure_id"
                        >
                          {{ proc.procedure_name }}
                        </option>
                      </select>
                    </td>
                    <td class="p-3 border">
                      <div
                        :class="[
                          statusColors[toothStatusMap[tooth]] ||
                            'bg-white border',
                          'w-6 h-6 mx-auto rounded-full border border-gray-400 shadow-inner',
                        ]"
                      ></div>
                    </td>
                    <td class="p-2 mt-1 flex justify-center text-center">
                      <button
                        class="text-red-600 text-xs font-semibold flex items-center gap-1 justify-center px-2 py-1 rounded hover:text-white hover:bg-red-500 transition"
                        @click="toggleTooth(tooth)"
                      >
                        <icon :name="'delete'" />
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- RIGHT: X-RAY -->
          <div class="w-[30vw] space-y-3 border p-2 rounded-md">
            <label class="font-bold">X-Ray Image:</label>
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="block w-full text-sm text-gray-700 border border-gray-400 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <div
              v-if="xrayPreview"
              class="mt-2 border rounded-lg p-2 bg-gray-50 text-center"
            >
              <p class="font-semibold text-gray-700 text-sm mb-2">
                X-Ray Preview
              </p>
              <img
                :src="xrayPreview"
                alt="X-Ray Preview"
                class="max-w-full max-h-[400px] mx-auto rounded shadow"
              />
            </div>

            <div>
              <label class="font-bold">Procedure Notes:</label>
              <textarea
                v-model="form.procedure_notes"
                rows="3"
                placeholder="Enter notes..."
                class="w-full border px-3 py-2 rounded-md text-sm border-gray-400"
              ></textarea>
            </div>

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
import { mapActions, mapState } from "pinia";

export default {
  name: "AddDentalChart",
  components: { icon },
  props: {
    editMode: {
      type: Boolean,
      default: false,
    },
    existingData: {
      type: Object,
      default: null,
    },
  },
  watch: {
    existingData: {
      handler(data) {
        if (this.editMode && data) {
          this.form.patient_id = data.patient?.patient_id || "";
          this.searchPatientQuery = data.patient
            ? `${data.patient.last_name}, ${data.patient.first_name} ${
                data.patient.middle_name || ""
              }`
            : "";

          // Selected teeth
          this.selectedTeeth = (data.teeth || []).map((t) => t.tooth_number);

          // Map using price_procedure_id, not name
          this.toothStatusMap = {};
          (data.teeth || []).forEach((t) => {
            this.toothStatusMap[t.tooth_number] = t.price_procedure_id || "";
          });

          // Set dentist user_id only if not already set
          if (!this.form.user_id) {
            this.form.user_id = data.user_accounts?.user_id || "";
          }

          this.form.procedure_notes = data.procedure_notes || "";
          this.form.procedure_date = data.procedure_date?.slice(0, 10) || "";

          if (data.dental_id) {
            this.form.dental_id = data.dental_id;
            this.xrayPreview =
              process.env.VUE_APP_API_BASE_URL +
              `/dental-chart/xray/${data.dental_id}`;
          }
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      user: null,
      form: {
        patient_id: "",
        user_id: "",
        price_procedure_id: "",
        scheduled_date: "",
        appointment_status: "",
        appointment_time: "",
        medical_history: "",
        procedure_notes: "",
        procedure_date: new Date().toISOString().slice(0, 10),
        selected_teeth: [],
      },
      searchPatientQuery: "",
      showPatientDropdown: false,
      selectedTeeth: [],
      xrayFile: null,
      xrayPreview: null,
      toothStatusMap: {},
      toothRows: [
        [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
        [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
        [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
        [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
      ],
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["appointments", "prices"]),
    filteredPatients() {
      const query = this.searchPatientQuery.toLowerCase();
      if (!query) return this.appointments;
      return this.appointments.filter((a) =>
        `${a.patient.last_name}, ${a.patient.first_name} ${
          a.patient.middle_name || ""
        }`
          .toLowerCase()
          .includes(query)
      );
    },
    statusColors() {
      const colors = {};
      this.prices.forEach((p) => {
        if (p.is_active) {
          colors[p.price_procedure_id] = p.status_color;
        }
      });
      return colors;
    },
    procedureNameMap() {
      const map = {};
      this.prices.forEach((p) => {
        map[p.price_procedure_id] = p.procedure_name;
      });
      return map;
    },
  },
  methods: {
    ...mapActions(useFetchDataStore, ["fetchAppointments", "fetchPrices"]),
    selectPatient(appointment) {
      this.form.patient_id = appointment.patient.patient_id;
      // Removed this line to prevent dentist change:
      // this.form.user_id = appointment.user_id;
      this.searchPatientQuery = `${appointment.patient.last_name}, ${
        appointment.patient.first_name
      } ${appointment.patient.middle_name || ""}`;
      this.showPatientDropdown = false;
    },
    toggleTooth(tooth) {
      const index = this.selectedTeeth.indexOf(tooth);
      if (index !== -1) {
        this.selectedTeeth.splice(index, 1);
        delete this.toothStatusMap[tooth];
      } else {
        this.selectedTeeth.push(tooth);
      }
    },
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        this.xrayFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.xrayPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        toast.warning("Please select a valid image file.");
        this.xrayFile = null;
        this.xrayPreview = null;
      }
    },
    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
      }, 150);
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
          // Only set user_id if empty
          if (!this.form.user_id) {
            this.form.user_id = this.user?.user_id ?? this.user?.sub;
          }
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    },
    async submitData() {
      if (!this.form.patient_id || this.selectedTeeth.length === 0) {
        toast.warning("Please select a patient and at least one tooth.");
        return;
      }

      if (!this.form.dental_id) {
        toast.error("Missing dental ID for update.");
        return;
      }

      const formData = new FormData();
      Object.entries(this.form).forEach(([key, val]) => {
        if (key !== "selected_teeth") formData.append(key, val);
      });

      formData.append("selected_teeth", JSON.stringify(this.selectedTeeth));
      formData.append("tooth_status_map", JSON.stringify(this.toothStatusMap));
      if (this.xrayFile) {
        formData.append("xray_image", this.xrayFile);
      }

      try {
        await axios.patch(
          process.env.VUE_APP_API_BASE_URL +
            `/dental-chart/update/${this.form.dental_id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const patient = this.filteredPatients.find(
          (a) => a.patient?.patient_id === this.form.patient_id
        )?.patient;

        const mergedData = {
          "Tooth Numbers": this.selectedTeeth.join(", "),
          Statuses: this.selectedTeeth
            .map(
              (tooth) =>
                this.procedureNameMap[this.toothStatusMap[tooth]] || "N/A"
            )
            .join(", "),
          "Procedure Date": new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          Patient: patient
            ? `${patient.last_name}, ${patient.first_name}`
            : "Unknown",
        };

        console.table([mergedData]);
        this.$emit("merged-data", mergedData);
        toast.success("Dental chart updated successfully!");
        new Audio(require("@/assets/add.mp3")).play();
        this.$emit("refresh");
        this.$emit("close");
      } catch (err) {
        toast.error("Failed to update dental chart.");
        console.error(err);
      }
    },
  },
  async mounted() {
    await this.fetchUser();
    await this.fetchAppointments();
    await this.fetchPrices();
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
