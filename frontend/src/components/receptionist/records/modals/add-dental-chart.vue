<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-3xl shadow-lg justify-center bg-white p-2">
      <!-- ===== Step Indicator ===== -->
      <!-- <div class="flex items-center justify-center gap-4 p-2">
        <div :class="stepClass(1)">1. Dental Chart</div>

        <div :class="stepClass(2)">2. Prescription</div>
      </div> -->

      <div class="relative mb-12 px-0.5" v-if="currentStep === 1">
        <form
          @submit.prevent="submitData"
          ref="dentalChartForm"
          class="w-auto bg-white text-[13px] rounded-[15px] shadow-l border"
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
              <!-- Procedure Selection -->
              <div class="w-full space-y-1.5 text-left">
                <label class="font-bold">Procedure:</label>

                <!-- Dropdown -->
                <select
                  v-model="selectedProcedureToAdd"
                  @change="addProcedure"
                  class="w-full px-3 py-3 border border-gray-600 rounded-md text-md text-gray-800 bg-white"
                >
                  <option disabled value="">Select Procedure</option>

                  <option
                    v-for="p in prices.filter((proc) => proc.is_active)"
                    :key="p.price_procedure_id"
                    :value="p.price_procedure_id"
                    :disabled="form.selected_procedures.includes(p.price_procedure_id)"
                  >
                    {{ p.procedure_name }}
                  </option>
                </select>

                <!-- Selected Procedure Badges -->
                <div
                  v-if="form.selected_procedures.length"
                  class="flex flex-wrap gap-2 mt-2"
                >
                  <label
                    v-for="procId in form.selected_procedures"
                    :key="procId"
                    class="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs border border-blue-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked
                      @change="removeProcedure(procId)"
                      class="cursor-pointer"
                    />

                    {{ procedureNameMap[procId] }}
                  </label>
                </div>
              </div>
              <!-- Braces Position Selection -->
              <div v-if="isBracesProcedure" class="w-full space-y-1.5 text-left">
                <label class="font-bold">Teeth Position:</label>
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
                    <div
                      class="flex flex-col items-center gap-[1px] relative"
                      @mouseenter="hoveredTooth = tooth"
                      @mouseleave="hoveredTooth = null"
                    >
                      <!-- Tooth -->
                      <div
                        class="w-8 h-8 border border-black flex items-center justify-center cursor-pointer"
                        :class="[
                          selectedTeeth.includes(tooth)
                            ? statusColors[toothStatusMap[tooth]] || 'bg-blue-500'
                            : 'bg-white',
                        ]"
                        @click="toggleTooth(tooth)"
                      >
                        <div class="w-4 h-4 border border-black rounded-full"></div>
                      </div>

                      <!-- Tooth Number -->
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

                      <!-- ✅ Hover Modal -->
                      <div
                        v-if="hoveredTooth === tooth && selectedTeeth.includes(tooth)"
                        class="absolute top-10 left-1/2 -translate-x-1/2 z-50 bg-white border rounded-lg shadow-lg p-3 w-44 text-xs"
                      >
                        <div class="font-semibold mb-2 text-gray-700">
                          Tooth {{ tooth }}
                        </div>

                        <!-- Procedure -->
                        <label class="text-[11px] text-gray-600">Procedure</label>
                        <select
                          v-model="toothStatusMap[tooth]"
                          class="w-full border rounded px-2 py-1 text-xs mb-2"
                        >
                          <option
                            v-for="procId in form.selected_procedures"
                            :key="procId"
                            :value="procId"
                          >
                            {{ procedureNameMap[procId] }}
                          </option>
                        </select>

                        <!-- Condition -->
                        <label class="text-[11px] text-gray-600">Status</label>
                        <select
                          v-model="toothConditionMap[tooth]"
                          class="w-full bg-white border border-gray-300 rounded-md px-2 py-2 text-sm"
                        >
                          <option disabled value="">Select Status</option>

                          <option
                            v-for="s in status"
                            :key="s.status_id"
                            :value="s.status_name"
                          >
                            {{ s.status_name }}
                          </option>
                        </select>
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
                <div class="h-[20vh] overflow-y-auto mt-2 border rounded-md shadow-sm">
                  <table class="w-full text-[13px] text-center">
                    <thead
                      class="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-wide sticky top-0 z-10"
                    >
                      <tr>
                        <th class="p-3 border w-[15%]">Tooth #</th>
                        <th class="p-3 border w-[50]">Procedure</th>
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
                        <!-- Tooth Number -->
                        <td class="p-3 border">{{ tooth }}</td>

                        <!-- Procedure -->
                        <td class="p-3 border">
                          <select
                            v-model="toothStatusMap[tooth]"
                            class="w-full bg-white border border-gray-300 rounded-md px-2 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-green1 focus:border-green1"
                          >
                            <option disabled value="">Select Procedure</option>

                            <option
                              v-for="proc in selectedProceduresList"
                              :key="proc.price_procedure_id"
                              :value="proc.price_procedure_id"
                            >
                              {{ proc.procedure_name }}
                            </option>
                          </select>
                        </td>

                        <!-- Tooth Condition -->
                        <td class="p-3 border">
                          <select
                            v-model="toothConditionMap[tooth]"
                            class="w-full bg-white border border-gray-300 rounded-md px-2 py-2 text-sm"
                          >
                            <option disabled value="">Select Status</option>

                            <option
                              v-for="s in status"
                              :key="s.status_id"
                              :value="s.status_name"
                            >
                              {{ s.status_name }}
                            </option>
                          </select>
                        </td>

                        <!-- Color -->
                        <td class="p-3 border">
                          <div
                            :class="[
                              statusColors[toothStatusMap[tooth]] || 'bg-white border',
                              'w-6 h-6 mx-auto rounded-full border border-gray-400 shadow-inner',
                            ]"
                          ></div>
                        </td>
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
                <label class="font-bold">Select Additional Inventory Items:</label>
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
                      <span class="font-semibold text-gray-800">{{ item.name }}</span>
                      <span class="text-xs text-gray-600 italic"
                        >{{ item.type }} • {{ item.quantity }} {{ item.unit }}</span
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
                <div v-if="form.selected_inventories.length > 0" class="mt-2 space-y-2">
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
                            >({{ item.type }} • {{ item.quantity }} {{ item.unit }})</span
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

              <!-- <div class="tracking-wide flex justify-end gap-2 mt-4">
              <button
                type="button"
                class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
                @click="$emit('close')"
              >
                Cancel
              </button>
              <button
                class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Submitting...</span>
                <span v-else>Submit</span>
              </button>
            </div> -->
            </div>
          </div>
        </form>
        <!-- Step 1 Buttons -->
        <div class="absolute -bottom-11 right-0 px-2">
          <button
            type="button"
            class="bg-green-700 px-4 py-2 rounded-lg text-white hover:opacity-90 text-sm"
            @click="handleNextStep"
          >
            Next
          </button>
        </div>
      </div>
      <div class="relative" v-if="currentStep === 2">
        <!-- Step 2 Buttons -->
        <button
          type="button"
          class="bg-gray-700 px-4 py-2 rounded-lg text-white text-sm absolute bottom-3 left-2 hover:opacity-90"
          @click="currentStep = 1"
        >
          Back
        </button>
        <div>
          <AddPrescription
            :patient-id="form.patient_id"
            :dental-id="form.dental_id"
            :edit-mode="editMode"
            @close="$emit('close')"
            @prescription-added="handlePrescriptionAdded"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import AddPrescription from "@/components/dentist/doctor-record/modals/add-prescription.vue";
import { toast } from "vue3-toastify";
import axios from "axios";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapActions, mapState } from "pinia";
import dayjs from "dayjs";

export default {
  name: "AddDentalChart",
  components: { icon, AddPrescription },
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
      toothConditionMap: {},
      hoveredTooth: null,
      selectedProcedureToAdd: "",
      currentStep: 1,
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
        selected_procedures: [],
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
          18,
          17,
          16,
          15,
          14,
          13,
          12,
          11,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          48,
          47,
          46,
          45,
          44,
          43,
          42,
          41,
          31,
          32,
          33,
          34,
          35,
          36,
          37,
          38,
        ],
        child: [
          55,
          54,
          53,
          52,
          51,
          61,
          62,
          63,
          64,
          65,
          85,
          84,
          83,
          82,
          81,
          71,
          72,
          73,
          74,
          75,
        ],
      },
      showXrayModal: false,
      xrayModalSrc: null,
      isSubmitting: false,
    };
  },
  watch: {
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
        this.form.price_procedure_id = data.priceProcedure?.price_procedure_id ?? null;

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
        this.toothConditionMap = {};
        this.form.selected_procedures = [];

        if (Array.isArray(data.teeth) && data.teeth.length > 0) {
          const procedureSet = new Set();

          this.selectedTeeth = data.teeth.map((t) => t.tooth_number);

          data.teeth.forEach((t) => {
            const toothNumber = t.tooth_number;

            const procId =
              t.priceProcedure?.price_procedure_id ||
              this.form.price_procedure_id ||
              null;

            // procedure per tooth
            this.toothStatusMap[toothNumber] = procId;

            // RF / OB / NR
            this.toothConditionMap[toothNumber] = t.tooth_condition ?? "NR";

            if (procId) procedureSet.add(procId);
          });

          // load procedures in edit mode
          this.form.selected_procedures = [...procedureSet];
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
            process.env.VUE_APP_API_BASE_URL + `/dental-chart/xray/${data.dental_id}`;
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
      "status",
    ]),
    selectedProceduresList() {
      return this.prices.filter(
        (p) => p.is_active && this.form.selected_procedures.includes(p.price_procedure_id)
      );
    },
    filteredPatients() {
      if (!this.appointments || this.appointments.length === 0 || !this.user) return [];

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
      appointments = appointments.filter((a) => new Date(a.scheduled_date) >= today);

      // Apply search filter
      if (this.searchPatientQuery) {
        const query = this.searchPatientQuery.toLowerCase();
        appointments = appointments.filter((a) =>
          `${a.patient.last_name}, ${a.patient.first_name} ${a.patient.middle_name || ""}`
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
          inv.name.toLowerCase().includes(query) || inv.type.toLowerCase().includes(query)
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
      if (!this.form.selected_procedures.length) return false;

      return this.prices.some((p) => {
        if (!this.form.selected_procedures.includes(p.price_procedure_id)) return false;

        const name = p.procedure_name.toLowerCase();

        return name.includes("brace") || name.includes("oral prophylaxis");
      });
    },
  },
  methods: {
    ...mapActions(useFetchDataStore, [
      "fetchAppointments",
      "fetchPrices",
      "fetchDentalChart",
      "fetchInventories",
      "fetchStatus",
    ]),
    stepClass(step) {
      return [
        "px-4 py-2 rounded-full text-sm font-medium",
        this.currentStep === step
          ? "bg-[#34699A] text-white"
          : "bg-gray-200 text-gray-600",
      ];
    },
    addProcedure() {
      if (!this.selectedProcedureToAdd) return;

      const id = Number(this.selectedProcedureToAdd);

      if (!this.form.selected_procedures.includes(id)) {
        this.form.selected_procedures.push(id);
      }

      this.selectedProcedureToAdd = "";
    },

    removeProcedure(procId) {
      this.form.selected_procedures = this.form.selected_procedures.filter(
        (p) => p !== procId
      );
    },
    goToPrescription() {
      // Add validation if needed
      this.currentStep = 2;
    },
    formatDate(date) {
      if (!date) return "";

      return dayjs(date).format("MMM DD, YYYY");
    },
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
        teeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
      }

      if (this.form.bracesPosition === "lower") {
        teeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
      }

      if (this.form.bracesPosition === "all") {
        teeth = [
          18,
          17,
          16,
          15,
          14,
          13,
          12,
          11,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          48,
          47,
          46,
          45,
          44,
          43,
          42,
          41,
          31,
          32,
          33,
          34,
          35,
          36,
          37,
          38,
        ];
      }

      const selectedProc = this.prices.find((p) => {
        if (!this.form.selected_procedures.includes(p.price_procedure_id)) return false;

        const name = p.procedure_name.toLowerCase();

        return name.includes("brace") || name.includes("oral prophylaxis");
      });

      if (!selectedProc) return;

      this.selectedTeeth = [...teeth];

      teeth.forEach((t) => {
        this.toothStatusMap[t] = selectedProc.price_procedure_id;
        this.toothConditionMap[t] = this.toothConditionMap[t] || "NR";
      });
    },
    clearToothSelection() {
      this.selectedTeeth = [];
      this.toothStatusMap = {};
      this.toothConditionMap = {};
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
      const index = this.selectedTeeth.indexOf(tooth);

      // remove tooth
      if (index !== -1) {
        this.selectedTeeth.splice(index, 1);

        delete this.toothStatusMap[tooth];
        delete this.toothConditionMap[tooth];

        return;
      }

      // require procedure first
      if (!this.form.selected_procedures.length) {
        toast.warning("Please select a procedure first.");
        return;
      }

      // add tooth
      this.selectedTeeth.push(tooth);

      // assign procedure
      this.toothStatusMap[tooth] = this.form.selected_procedures[0];

      // default condition
      this.toothConditionMap[tooth] = this.toothConditionMap[tooth] || "NR";
    },

    handleImageUpload(e) {
      const file = e.target.files[0];

      if (!file) {
        this.xrayFile = null;
        this.xrayPreview = null;
        return;
      }

      // ✅ Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.warning("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
        this.xrayFile = null;
        this.xrayPreview = null;
        return;
      }

      // ✅ Validate file size (max 5 MB)
      const maxSizeMB = 5;
      if (file.size / 1024 / 1024 > maxSizeMB) {
        toast.warning(`Image size should not exceed ${maxSizeMB} MB.`);
        this.xrayFile = null;
        this.xrayPreview = null;
        return;
      }

      // ✅ Set file & generate preview
      this.xrayFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.xrayPreview = event.target.result;
      };
      reader.readAsDataURL(file);
    },

    hideDropdown(type) {
      setTimeout(() => {
        if (type === "patient") this.showPatientDropdown = false;
        if (type === "inventory") this.showInventoryDropdown = false;
      }, 150);
    },
    async fetchUser() {
      try {
        const response = await axios.get(process.env.VUE_APP_API_BASE_URL + "/auth/me", {
          withCredentials: true,
        });
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

          const procedure = this.prices.find((p) => p.price_procedure_id === procId);
          if (!procedure?.procedureInventories?.length) return;

          procedure.procedureInventories.forEach((pi) => {
            const invId = pi.inventory.inventory_id;
            inventoryMap[invId] = (inventoryMap[invId] || 0) + Number(pi.quantity);
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
        await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/inventory/deduct`, {
          inventoryId: Number(inventoryId),
          quantity,
        });
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
    async handleNextStep() {
      // 1️⃣ Save dental chart first
      const saved = await this.saveDentalChart();

      if (saved) {
        // 2️⃣ Log the dental_id to check
        console.log("Dental Chart saved with ID:", this.form.dental_id);

        // 3️⃣ Move to prescription step
        this.currentStep = 2;

        // 4️⃣ Optional: If you want to emit or do something with the ID
        // For example, pass it to AddPrescription
        // this.$refs.addPrescriptionComponent.setDentalId(this.form.dental_id)
      } else {
        console.warn("Dental chart not saved. Cannot proceed to prescription.");
      }
    },
    async saveDentalChart() {
      if (!this.form.patient_id) {
        toast.warning("Please select a patient.");
        return false;
      }

      if (!this.form.selected_procedures.length) {
        toast.warning("Please select at least one procedure.");
        return false;
      }

      const formData = new FormData();

      const allowedFields = [
        "patient_id",
        "user_id",
        "price_procedure_id",
        "procedure_notes",
        "procedure_date",
      ];

      allowedFields.forEach((key) => {
        const value = this.form[key];
        if (value !== null && value !== undefined && value !== "") {
          if (key === "patient_id" || key === "user_id" || key === "price_procedure_id") {
            formData.append(key, Number(value));
          } else {
            formData.append(key, value);
          }
        }
      });
      this.selectedTeeth.forEach((tooth) => {
        if (!this.toothConditionMap[tooth]) {
          this.toothConditionMap[tooth] = "NR";
        }
      });
      formData.append(
        "selected_procedures",
        JSON.stringify(this.form.selected_procedures || [])
      );
      formData.append(
        "tooth_condition_map",
        JSON.stringify(this.toothConditionMap || {})
      );
      formData.append("selected_teeth", JSON.stringify(this.selectedTeeth.map(Number)));
      formData.append("tooth_status_map", JSON.stringify(this.toothStatusMap || {}));
      formData.append(
        "additional_items",
        JSON.stringify(
          (this.form.selected_inventories || []).map((item) => ({
            inventory_id: Number(item.inventory_id),
            pcs: Number(item.selected_quantity) || 1,
          }))
        )
      );

      if (this.xrayFile instanceof File) {
        formData.append("xray_image", this.xrayFile);
      }
      // 🔎 LOG PAYLOAD
      console.log("===== SUBMITTED PAYLOAD =====");

      for (let pair of formData.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }

      console.log("=============================");
      try {
        if (this.editMode) {
          await axios.patch(
            `${process.env.VUE_APP_API_BASE_URL}/dental-chart/update/${this.form.dental_id}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        } else {
          const res = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/dental-chart/add-dental-chart`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );

          // Save returned dental_id for step 2
          this.form.dental_id = res.data.dental_id;
        }
        console.log("selectedTeeth:", this.selectedTeeth);
        console.log("toothStatusMap:", this.toothStatusMap);
        console.log("toothConditionMap:", this.toothConditionMap);
        return true;
      } catch (err) {
        console.error(err);
        toast.error("Failed to save dental chart.");
        return false;
      }
    },
  },
  async mounted() {
    await this.fetchUser();
    await this.fetchAppointments();
    await this.fetchPrices();
    await this.fetchDentalChart();
    await this.fetchInventories();
    await this.fetchStatus();
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
