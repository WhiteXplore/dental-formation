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
            <h1 class="font-bold tracking-wide text-lg">
              {{ editMode ? "Edit Dental Chart" : "Add Dental Chart" }}
            </h1>
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
                    {{ appointment.patient?.middle_name }} -
                    {{ formatDate(appointment.scheduled_date) }}
                  </div>
                </div>
                <div v-else class="px-3 py-2 text-gray-500 italic">
                  No results found
                </div>
              </div>
            </div>
            <!-- Procedure Selection -->
            <div class="w-full space-y-1.5 text-left">
              <label class="font-bold">Procedure:</label>

              <select
                v-model="form.price_procedure_id"
                class="w-full px-3 py-3 border border-gray-600 rounded-md text-md text-gray-800 bg-white"
              >
                <option disabled value="">Select Procedure</option>
                <option
                  v-for="p in prices.filter((proc) => proc.is_active)"
                  :key="p.price_procedure_id"
                  :value="p.price_procedure_id"
                >
                  {{ p.procedure_name }}
                </option>
              </select>
            </div>
            <!-- Braces Position Selection -->
            <div v-if="isBracesProcedure" class="w-full space-y-1.5 text-left">
              <label class="font-bold">Braces Position:</label>
              <select
                v-model="form.bracesPosition"
                class="w-full px-3 py-3 border border-gray-600 rounded-md text-md text-gray-800 bg-white"
                @change="handleBracesSelection"
              >
                <option disabled value="">Select Position</option>
                <option value="upper">Upper Teeth</option>
                <option value="lower">Lower Teeth</option>
                <option value="all">All Teeth</option>
                <!-- NEW -->
              </select>
            </div>

            <!-- Tooth Chart -->
            <div class="space-y-1 mt-4">
              <div class="flex justify-between items-center">
                <label class="font-bold">Tooth Chart:</label>
                <button
                  type="button"
                  class="ml-4 px-2 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-xs"
                  @click="clearToothSelection"
                >
                  Clear Teeth
                </button>
              </div>

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
            <p class="text-sm text-gray-700">
              Total Selected Teeth:
              <strong>{{ selectedTeeth.length }}</strong>
            </p>
          </div>

          <!-- RIGHT: X-RAY -->
          <div class="w-[30vw] space-y-3 border p-2 rounded-md">
            <!-- Status Table -->
            <div class="space-y-1">
              <label class="font-bold">Tooth Status Table:</label>

              <!-- Legend (always visible, not part of scroll) -->
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

              <!-- Scrollable table ONLY -->
              <div
                class="h-[20vh] overflow-y-auto mt-2 border rounded-md shadow-sm"
              >
                <table class="w-full text-[13px] text-center">
                  <thead
                    class="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-wide sticky top-0 z-10"
                  >
                    <tr>
                      <th class="p-3 border w-[15%]">Tooth #</th>
                      <th class="p-3 border w-[50]">Status</th>
                      <th class="p-3 border w-[20%]">Color</th>
                      <!-- <th class="p-3 w-10 border">Action</th> -->
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
                          class="w-full bg-white border border-gray-300 rounded-md px-2 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-green1 focus:border-green1"
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
                      <!-- <td class="p-2 mt-1 flex justify-center">
                        <button
                          class="text-red-600 text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded hover:text-white hover:bg-red-500 transition"
                          @click="toggleTooth(tooth)"
                        >
                          <icon :name="'delete'" /> Remove
                        </button>
                      </td> -->
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- X-Ray Input & Preview -->
            <div class="space-y-2">
              <label class="font-bold">X-Ray Image:</label>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="block w-full text-sm text-gray-700 border border-gray-400 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <!-- Preview -->
              <div v-if="xrayPreview" class="mt-2">
                <img
                  :src="xrayPreview"
                  alt="X-Ray Preview"
                  class="w-40 h-auto mx-auto rounded cursor-pointer border"
                  @click="openXrayModal"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="font-bold">Procedure Notes:</label>
              <textarea
                v-model="form.procedure_notes"
                rows="3"
                placeholder="Enter notes..."
                class="w-full border px-3 py-2 rounded-md text-sm border-gray-400"
              ></textarea>
            </div>
            <div class="flex flex-col gap-2 relative">
              <label class="font-bold"
                >Select Additional Inventory Items:</label
              >
              <input
                type="text"
                v-model="searchInventoryQuery"
                @focus="showInventoryDropdown = true"
                @blur="hideDropdown('inventory')"
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Search inventory..."
              />

              <!-- Dropdown -->
              <div
                v-if="showInventoryDropdown"
                class="absolute left-0 top-full z-30 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto w-full mt-1"
              >
                <div
                  v-for="item in filteredInventories"
                  :key="item.inventory_id"
                  class="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b"
                  @mousedown.prevent="toggleInventory(item)"
                >
                  <div class="flex flex-col">
                    <span class="font-semibold text-gray-800">{{
                      item.name
                    }}</span>
                    <span class="text-xs text-gray-600 italic"
                      >{{ item.type }} • {{ item.quantity }}
                      {{ item.unit }}</span
                    >
                  </div>
                </div>
                <div
                  v-if="filteredInventories.length === 0"
                  class="p-3 text-gray-500 italic text-center text-sm"
                >
                  No inventory found
                </div>
              </div>

              <!-- Selected Inventories -->
              <div
                v-if="form.selected_inventories.length > 0"
                class="mt-2 space-y-2"
              >
                <div
                  v-for="(item, index) in form.selected_inventories"
                  :key="item.inventory_id"
                  class="flex justify-between items-center border border-green-300 bg-white shadow-sm rounded-lg px-4 py-2"
                >
                  <div class="flex flex-col w-full text-sm">
                    <div class="flex justify-between items-center">
                      <span>
                        {{ item.name }}
                        <span class="text-xs text-gray-500"
                          >({{ item.type }} • {{ item.quantity }}
                          {{ item.unit }})</span
                        >
                      </span>

                      <input
                        type="number"
                        min="1"
                        class="border rounded px-2 py-1 w-[70px] text-sm"
                        v-model.number="item.selected_quantity"
                        placeholder="pcs"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    @click="removeInventory(index)"
                    class="ml-3 text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
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
  <div
    v-if="showXrayModal"
    class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
    @click.self="closeXrayModal"
  >
    <div
      class="relative w-full max-w-[90vw] max-h-[90vh] flex justify-center items-center overflow-hidden"
    >
      <!-- Close Button -->
      <button
        class="absolute top-2 right-2 text-white text-2xl font-bold z-20"
        @click="closeXrayModal"
      >
        &times;
      </button>

      <!-- X-Ray Image -->
      <img
        :src="xrayModalSrc"
        alt="X-Ray Large View"
        class="max-w-full max-h-full rounded shadow-lg object-contain"
        style="max-height: calc(100vh - 2rem)"
      />
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import { toast } from "vue3-toastify";
import axios from "axios";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapActions, mapState } from "pinia";
import dayjs from "dayjs";

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

  data() {
    return {
      user: null,
      form: {
        dental_id: null,
        patient_id: "",
        user_id: "",
        price_procedure_id: "",
        scheduled_date: "",
        appointment_status: "",
        appointment_time: "",
        medical_history: "",
        procedure_notes: "",
        procedure_date: "",
        selected_teeth: [],
        bracesPosition: "",
        selected_inventories: [],
        patientAge: null,
      },
      searchInventoryQuery: "",
      showInventoryDropdown: false,
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
      toothAgeMap: {
        adult: [
          18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48,
          47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
        ],
        child: [
          55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 85, 84, 83, 82, 81, 71, 72,
          73, 74, 75,
        ],
      },
      showXrayModal: false,
      xrayModalSrc: null,
    };
  },
  watch: {
    "form.price_procedure_id"(newVal) {
      if (!newVal || this.editMode) return;

      const procedure = this.selectedProcedure;
      if (!procedure) return;

      // 🛑 Patient must be selected first
      if (!this.patientAge) {
        toast.warning("Please select a patient first.");
        this.form.price_procedure_id = "";
        return;
      }

      /* ===============================
       * 🔹 ALL_TEETH → AUTO SELECT
       * =============================== */
      if (procedure.procedure_scope === "ALL_TEETH") {
        const teeth =
          this.patientAge <= 12
            ? this.toothAgeMap.child
            : this.toothAgeMap.adult;

        this.selectedTeeth = [...teeth];
        this.toothStatusMap = {};
        this.form.bracesPosition = "";

        teeth.forEach((tooth) => {
          this.toothStatusMap[tooth] = newVal;
        });
      }

      /* ===============================
       * 🔹 PER_TOOTH → MANUAL SELECT
       * =============================== */
      if (procedure.procedure_scope === "PER_TOOTH") {
        this.selectedTeeth = [];
        this.toothStatusMap = {};
        this.form.bracesPosition = ""; // 🔥 important reset
      }
    },
    existingData: {
      immediate: true,
      handler(data) {
        if (!this.editMode || !data) return;

        /* ===========================
         * 🔑 BASIC IDS
         * =========================== */
        this.form.dental_id = data.dental_id;
        this.form.patient_id = data.patient?.patient_id ?? null;
        this.form.user_id = data.user_accounts?.user_id ?? null;
        this.form.price_procedure_id =
          data.priceProcedure?.price_procedure_id ?? null;

        this.form.procedure_notes = data.procedure_notes ?? "";
        this.form.procedure_date = data.procedure_date ?? null;

        /* ===========================
         * 👤 PATIENT LABEL
         * =========================== */
        if (data.patient) {
          this.searchPatientQuery = `${data.patient.last_name}, ${data.patient.first_name}`;
        }

        /* ===========================
         * 🦷 TEETH + STATUS
         * =========================== */
        this.selectedTeeth = [];
        this.toothStatusMap = {};

        if (Array.isArray(data.teeth) && data.teeth.length > 0) {
          this.selectedTeeth = data.teeth.map((t) => t.tooth_number);

          data.teeth.forEach((t) => {
            this.toothStatusMap[t.tooth_number] =
              t.priceProcedure?.price_procedure_id ||
              this.form.price_procedure_id;
          });
        }
        /* ===========================
         * 🧰 DISPLAY ADDITIONAL INVENTORIES (EDIT MODE)
         * =========================== */
        this.form.selected_inventories = [];

        if (Array.isArray(data.addItems) && data.addItems.length > 0) {
          this.form.selected_inventories = data.addItems
            .filter((item) => item.additionalInventory)
            .map((item) => ({
              inventory_id: item.additionalInventory.inventory_id,
              name: item.additionalInventory.name,
              type: item.additionalInventory.type,
              unit: item.additionalInventory.unit,
              quantity: item.additionalInventory.quantity, // stock display
              selected_quantity: Number(item.pcs) || 1,
            }));
        }

        /* ===========================
         * 🩻 X-RAY PREVIEW
         * =========================== */
        if (data.xray_image_url) {
          this.xrayPreview = data.xray_image_url.startsWith("http")
            ? data.xray_image_url
            : process.env.VUE_APP_API_BASE_URL + "/" + data.xray_image_url;
        } else if (data.xray_image) {
          this.xrayPreview =
            process.env.VUE_APP_API_BASE_URL +
            `/dental-chart/xray/${data.dental_id}`;
        } else {
          this.xrayPreview = null;
        }
      },
    },
  },

  computed: {
    ...mapState(useFetchDataStore, [
      "appointments",
      "prices",
      "dentalCharts",
      "inventories",
    ]),
    filteredPatients() {
      if (!this.appointments || this.appointments.length === 0 || !this.user)
        return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to midnight

      // Role-based filtering
      let appointments = [];
      if (this.user.role === "Admin") {
        appointments = [...this.appointments];
      } else if (this.user.role === "Dentist") {
        appointments = this.appointments.filter(
          (a) => a.user_id === this.user.user_id || a.user_id === this.user.sub
        );
      }

      // Only upcoming appointments
      appointments = appointments.filter(
        (a) => new Date(a.scheduled_date) >= today
      );

      // Apply search filter
      if (this.searchPatientQuery) {
        const query = this.searchPatientQuery.toLowerCase();
        appointments = appointments.filter((a) =>
          `${a.patient.last_name}, ${a.patient.first_name} ${
            a.patient.middle_name || ""
          }`
            .toLowerCase()
            .includes(query)
        );
      }

      // Sort by nearest date first
      appointments.sort(
        (a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)
      );

      return appointments;
    },
    filteredInventories() {
      const query = this.searchInventoryQuery.toLowerCase();

      return this.inventories.filter((inv) => {
        // hide already selected inventories
        const alreadySelected = this.form.selected_inventories.some(
          (i) => i.inventory_id === inv.inventory_id
        );

        if (alreadySelected) return false;

        if (!query) return true;

        return (
          inv.name.toLowerCase().includes(query) ||
          inv.type.toLowerCase().includes(query)
        );
      });
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
    selectedProcedure() {
      return this.prices.find(
        (p) => p.price_procedure_id === this.form.price_procedure_id
      );
    },

    isAllTeethScope() {
      return this.selectedProcedure?.procedure_scope === "ALL_TEETH";
    },

    isPerToothScope() {
      return this.selectedProcedure?.procedure_scope === "PER_TOOTH";
    },
    isBracesProcedure() {
      if (!this.selectedProcedure) return false;

      // 🔥 braces only allowed when ALL_TEETH
      if (this.selectedProcedure.procedure_scope !== "ALL_TEETH") return false;

      const name = this.selectedProcedure.procedure_name.toLowerCase();
      return ["braces", "brace"].some((word) => name.includes(word));
    },
  },
  methods: {
    ...mapActions(useFetchDataStore, [
      "fetchAppointments",
      "fetchPrices",
      "fetchDentalChart",
      "fetchInventories",
    ]),
    toggleInventory(item) {
      const exists = this.form.selected_inventories.some(
        (i) => i.inventory_id === item.inventory_id
      );

      if (!exists) {
        this.form.selected_inventories.push({
          ...item,
          selected_quantity: 1,
        });
      }

      this.searchInventoryQuery = "";
      this.showInventoryDropdown = false;
    },

    removeInventory(index) {
      this.form.selected_inventories.splice(index, 1);
    },
    openXrayModal() {
      this.xrayModalSrc = this.xrayPreview;
      this.showXrayModal = true;
    },
    closeXrayModal() {
      this.showXrayModal = false;
      this.xrayModalSrc = null;
    },
    handleBracesSelection() {
      let teeth = [];

      if (this.form.bracesPosition === "upper") {
        teeth = [
          18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
        ];
      } else if (this.form.bracesPosition === "lower") {
        teeth = [
          48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
        ];
      } else if (this.form.bracesPosition === "all") {
        // Combine both upper and lower teeth
        teeth = [
          18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48,
          47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
        ];
      }

      this.selectedTeeth = [...teeth];

      // Assign the selected procedure as the status for all selected teeth
      teeth.forEach((t) => {
        this.toothStatusMap[t] = this.form.price_procedure_id;
      });
    },
    clearToothSelection() {
      this.selectedTeeth = [];
      this.toothStatusMap = {};
    },
    selectPatient(appointment) {
      this.form.patient_id = appointment.patient.patient_id;
      this.form.user_id = appointment.user_id;
      this.form.scheduled_date = appointment.scheduled_date;
      this.form.procedure_date = appointment.scheduled_date;

      this.patientAge = Number(appointment.patient.age);

      this.searchPatientQuery = `${appointment.patient.last_name}, ${
        appointment.patient.first_name
      } ${appointment.patient.middle_name || ""}`;

      this.showPatientDropdown = false;
    },
    toggleTooth(tooth) {
      // // 🚫 Disable clicking when ALL_TEETH
      // if (this.isAllTeethScope) return;

      // // 🚫 Block if no procedure selected
      // if (!this.form.price_procedure_id) {
      //   toast.warning("Please select a procedure first.");
      //   return;
      // }

      const index = this.selectedTeeth.indexOf(tooth);

      if (index !== -1) {
        // ❌ Remove tooth
        this.selectedTeeth.splice(index, 1);
        delete this.toothStatusMap[tooth];
      } else {
        // ✅ Add tooth
        this.selectedTeeth.push(tooth);

        // Auto-assign selected procedure
        this.toothStatusMap[tooth] = this.form.price_procedure_id;
      }
    },

    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        this.xrayFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.xrayPreview = e.target.result; // ✅ sets preview
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
        if (type === "inventory") this.showInventoryDropdown = false;
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
          this.form.user_id = this.user?.user_id ?? this.user?.sub;
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    },
    async deductEditedInventory() {
      const editedDataRaw = localStorage.getItem("latestEditedDentalChart");
      if (!editedDataRaw) return;

      const editedData = JSON.parse(editedDataRaw);

      const inventoryMap = {};

      /* ===============================
       * 🦷 DEDUCT TOOTH-LINKED INVENTORIES
       * =============================== */
      if (Array.isArray(editedData.teeth)) {
        editedData.teeth.forEach((tooth) => {
          const procId = tooth.price_procedure_id;

          const procedure = this.prices.find(
            (p) => p.price_procedure_id === procId
          );
          if (!procedure?.procedureInventories?.length) return;

          procedure.procedureInventories.forEach((pi) => {
            const invId = pi.inventory.inventory_id;
            inventoryMap[invId] =
              (inventoryMap[invId] || 0) + Number(pi.quantity);
          });
        });
      }

      /* ===============================
       * 🧰 DEDUCT ADDITIONAL INVENTORIES
       * =============================== */
      if (Array.isArray(editedData.addItems)) {
        editedData.addItems.forEach((item) => {
          inventoryMap[item.inventory_id] =
            (inventoryMap[item.inventory_id] || 0) + Number(item.pcs || 1);
        });
      }

      /* ===============================
       * 🚀 SEND DEDUCTIONS TO BACKEND
       * =============================== */
      for (const [inventoryId, quantity] of Object.entries(inventoryMap)) {
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/inventory/deduct`,
          {
            inventoryId: Number(inventoryId),
            quantity,
          }
        );
      }

      /* ===============================
       * ✅ MARK AS DEDUCTED
       * =============================== */
      await axios.patch(
        `${process.env.VUE_APP_API_BASE_URL}/dental-chart/deduct-inventory/${editedData.dental_id}`,
        {
          teeth: editedData.teeth,
          addItems: editedData.addItems,
        }
      );

      /* ===============================
       * 🧹 CLEAN UP
       * =============================== */
      localStorage.removeItem("latestEditedDentalChart");
      localStorage.removeItem("latestAddedDentalChart");

      await this.fetchInventories();
    },
    async submitData() {
      // 1️⃣ Validate required fields
      if (!this.form.patient_id || this.selectedTeeth.length === 0) {
        toast.warning("Please select a patient and at least one tooth.");
        return;
      }

      // 2️⃣ Duplicate check
      const hasDuplicate = this.dentalCharts.some((dc) => {
        if (this.editMode && dc.dental_id === this.form.dental_id) return false;
        return (
          dc.patient_id === this.form.patient_id &&
          dayjs(dc.procedure_date).isSame(
            dayjs(this.form.procedure_date),
            "day"
          ) &&
          dc.price_procedure_id === this.form.price_procedure_id
        );
      });

      if (hasDuplicate) {
        toast.error(
          "This procedure is already recorded for this patient on the same date."
        );
        return;
      }

      // 3️⃣ Build FormData
      const formData = new FormData();
      Object.entries(this.form).forEach(([key, val]) => {
        if (
          !["selected_teeth", "selected_inventories"].includes(key) &&
          val !== null &&
          val !== undefined
        ) {
          formData.append(key, val);
        }
      });

      formData.set("procedure_date", this.form.procedure_date);
      if (this.xrayFile) formData.append("xray_image", this.xrayFile);

      // 4️⃣ REQUIRED BACKEND PAYLOADS
      formData.append("selected_teeth", JSON.stringify(this.selectedTeeth));
      formData.append("tooth_status_map", JSON.stringify(this.toothStatusMap));

      // 🔥 THIS IS THE FIX — SEND additional_items
      formData.append(
        "additional_items",
        JSON.stringify(
          this.form.selected_inventories.map((item) => ({
            inventory_id: item.inventory_id,
            pcs: Number(item.selected_quantity) || 1,
          }))
        )
      );

      try {
        if (this.editMode) {
          // ✅ UPDATE
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/dental-chart/update/${this.form.dental_id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          // Get previous teeth
          const prevChartTeeth = this.existingData?.teeth || [];

          // Newly added teeth only
          const newlyEditedTeeth = this.selectedTeeth
            .filter(
              (tooth) => !prevChartTeeth.some((t) => t.tooth_number === tooth)
            )
            .map((tooth) => ({
              tooth_number: tooth,
              price_procedure_id:
                this.toothStatusMap[tooth] || this.form.price_procedure_id,
            }));

          // Save latest edit for deduction
          const latestEdited = {
            dental_id: this.form.dental_id,
            teeth: newlyEditedTeeth,
            addItems: this.form.selected_inventories.map((item) => ({
              inventory_id: item.inventory_id,
              pcs: Number(item.selected_quantity) || 1,
            })),
          };

          localStorage.setItem(
            "latestEditedDentalChart",
            JSON.stringify(latestEdited)
          );

          await this.deductEditedInventory();
          toast.success("Dental chart updated successfully!");
        } else {
          // ✅ CREATE
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/dental-chart/add-dental-chart`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          const newDentalData = {
            dental_id: this.form.dental_id,
            teeth: this.selectedTeeth.map((tooth) => ({
              tooth_number: tooth,
              status: this.toothStatusMap[tooth] || null,
              price_procedure_id:
                this.toothStatusMap[tooth] || this.form.price_procedure_id,
            })),
          };

          localStorage.setItem(
            "latestAddedDentalChart",
            JSON.stringify(newDentalData)
          );

          toast.success("Dental chart added successfully!");
        }

        this.$emit("refresh");
        this.$emit("close");
      } catch (err) {
        console.error(err);
        toast.error(
          this.editMode
            ? "Failed to update dental chart."
            : "Failed to add dental chart."
        );
      }
    },
    formatDate(date) {
      return dayjs(date).format("MMMM DD, YYYY");
    },
  },
  async mounted() {
    await this.fetchUser();
    await this.fetchAppointments();
    await this.fetchPrices();
    await this.fetchDentalChart();
    await this.fetchInventories();
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
