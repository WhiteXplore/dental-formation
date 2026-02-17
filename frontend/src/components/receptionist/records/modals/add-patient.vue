<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
        ref="patientForm"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'add-students'" />
           <h1 class="font-bold tracking-wide text-lg">
  {{ isEdit ? "Edit Patient" : "Add Patient" }}
</h1>

          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>
        <div class="p-5 w-[40vw] space-y-3" v-if="step === 1">
          <label for="">Patient Information</label>
          <!-- ROW 1  -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="first_name" class="font-bold">First Name:</label>
              <input
                v-model="form.first_name"
                type="text"
                id="first_name"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter first name"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="middle_name" class="font-bold">Middle Name:</label>
              <input
                v-model="form.middle_name"
                type="text"
                id="middle_name"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter middle name"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="last_name" class="font-bold">Last Name:</label>
              <input
                v-model="form.last_name"
                type="text"
                id="last_name"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter last name"
              />
            </div>
          </div>
          <!-- ROW 2  -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="gender" class="font-bold">Gender:</label>
              <select
                v-model="form.gender"
                required
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="birthdate" class="font-bold">Birthdate:</label>
              <input
                v-model="form.birthdate"
                type="date"
                id="birthdate"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter birthdate"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="age" class="font-bold">Age:</label>
              <input
                v-model="form.age"
                type="number"
                id="age"
                readonly
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter age"
              />
            </div>
          </div>
          <!-- ROW 3  -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="contact_number" class="font-bold">Contact No.:</label>
              <input
                v-model="form.contact_number"
                type="text"
                id="contact_number"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter contact number"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="religion" class="font-bold">Religion:</label>
              <input
                v-model="form.religion"
                type="text"
                id="religion"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter religion"
              />
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="nationality" class="font-bold">Nationality:</label>
              <input
                v-model="form.nationality"
                type="text"
                id="nationality"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter nationality"
              />
            </div>
          </div>
          <!-- ROW 4  -->
          <div class="flex gap-2 items-center w-full">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="marital_status" class="font-bold">Status:</label>
              <select
                v-model="form.marital_status"
                required
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="occupation" class="font-bold">Occupation:</label>
              <input
                v-model="form.occupation"
                type="text"
                id="occupation"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter occupation"
              />
            </div>
          </div>
          <div class="w-full space-y-1.5 text-left flex flex-col">
            <label for="dental_insurance" class="font-bold">
              Dental Insurance:
            </label>

            <select
              v-model="form.has_insurance"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Do you have dental insurance?</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            <!-- Insurance list -->
            <select
              v-if="form.has_insurance === 'Yes'"
              v-model="form.dental_insurance"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select insurance</option>
              <option value="Philhealth">PhilHealth</option>
              <option value="Maxicare">Maxicare</option>
              <option value="Intellicare">Intellicare</option>
              <option value="Medicard">Medicard</option>
              <option value="Other">Other</option>
            </select>

            <!-- Show only if "Other" -->
            <input
              v-if="
                form.has_insurance === 'Yes' &&
                form.dental_insurance === 'Other'
              "
              v-model="form.other_insurance"
              type="text"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Please specify insurance"
              required
            />
          </div>

          <!-- ROW 5  -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="parent_fullname" class="font-bold">Parent:</label>
              <input
                v-model="form.parent_fullname"
                type="text"
                id="parent_fullname"
                :disabled="form.age >= 18"
                :required="form.age < 18"
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter the parent name if the client is minor"
              />
            </div>
          </div>
          <!-- ROW 6  -->
          <div class="flex gap-2">
            <div class="w-full space-y-1.5 text-left flex flex-col">
              <label for="address" class="font-bold">Address:</label>
              <input
                v-model="form.address"
                type="text"
                id="address"
                required
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Enter address"
              />
            </div>
          </div>
          <!-- Divider -->
          <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>
          <div class="flex justify-end gap-2 pt-4">
            <button
              type="button"
              class="bg-red-600 px-4 py-2 rounded-lg text-white hover:bg-red-700"
              @click="$emit('close')"
            >
              Cancel
            </button>

            <button
              type="button"
              class="bg-[#34699A] px-4 py-2 rounded-lg text-white hover:bg-blue-700"
              @click="goNext"
            >
              Next
            </button>
          </div>
        </div>
        <div
          class="p-5 w-[40vw] h-[80vh] overflow-auto space-y-3"
          v-if="step === 2"
        >
          <label class="font-bold text-[14px]">Health Questionnaire</label>

          <div class="space-y-2">
            <label class="font-semibold">Are you in good health?</label>
            <select
              v-model="form.good_health"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            <input
              v-if="form.good_health === 'No'"
              v-model="form.health_details"
              type="text"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Please specify"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="font-semibold"
              >Are you under medical treatment now?</label
            >
            <select
              v-model="form.medical_treatment"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            <input
              v-if="form.medical_treatment === 'Yes'"
              v-model="form.medical_treatment_details"
              type="text"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="If so , what is the condition being treated?"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="font-semibold"
              >Have you ever had serious illness or surgical operation?</label
            >
            <select
              v-model="form.serious_illness"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            <input
              v-if="form.serious_illness === 'Yes'"
              v-model="form.serious_illness_details"
              type="text"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="If so , what illness or surgical operation?"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="font-semibold"
              >Have you ever been hospitalized?</label
            >
            <select
              v-model="form.hospitalized"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            <input
              v-if="form.hospitalized === 'Yes'"
              v-model="form.hospitalized_details"
              type="text"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="If so , when and why?"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="font-semibold"
              >Are you taking any prescription/non-prescription
              medication?</label
            >
            <select
              v-model="form.taking_medication"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            <input
              v-if="form.taking_medication === 'Yes'"
              v-model="form.taking_medication_details"
              type="text"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="If so , what medications?"
              required
            />
          </div>

          <div class="space-y-2">
            <label class="font-semibold">Do you use tabacco products?</label>
            <select
              v-model="form.use_tobacco"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="font-semibold"
              >Do you use alcohol, cocaine, or other dangerous drugs?</label
            >
            <select
              v-model="form.use_alcohol"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="font-semibold"
              >Are you allergic to any of the following:</label
            >
            <select
              v-model="form.allergies"
              class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
            >
              <option disabled value="">Select</option>
              <option value="LOCAL ANESTHETIC (ex. Lidocaine)">
                LOCAL ANESTHETIC (ex. Lidocaine)
              </option>
              <option value="SULFA DRUGS">SULFA DRUGS</option>
              <option value="PENICILLIN, ANTIBIOTIC">
                PENICILLIN, ANTIBIOTIC
              </option>
              <option value="LATEX">LATEX</option>
              <option value="ASPIRIN">ASPIRIN</option>
              <option value="OTHERS">OTHERS</option>
            </select>

            <input
              v-if="form.allergies === 'OTHERS'"
              v-model="form.allergies_details"
              type="text"
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="what other allergies?"
              required
            />
          </div>
          <div>
            <div class="space-y-2">
              <label class="font-semibold">Bleeding Time:</label>
              <input
                v-model="form.bleeding_time_details"
                type="text"
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="add bleeding time?"
                required
              />
            </div>

            <div class="space-y-2">
              <div class="flex flex-col">
                <label class="font-semibold">For woman only:</label>
                <label class="font-semibold">Are you pregnant?:</label>
              </div>

              <select
                v-model="form.pregnant"
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="font-semibold">Are you nursing?:</label>
              <select
                v-model="form.nursing"
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="font-semibold"
                >Are you taking birth control pills?:</label
              >
              <select
                v-model="form.control_pills"
                class="w-full border px-2 py-3.5 border-gray-600 rounded-md text-md text-gray-800"
              >
                <option disabled value="">Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <label class="font-semibold">Blood Type:</label>
                <select
                  v-model="form.blood_type"
                  class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800 bg-white"
                  required
                >
                  <option value="" disabled>Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="font-semibold">Blood Pressure:</label>
                <input
                  v-model="form.blood_pressure"
                  type="text"
                  pattern="^\d{2,3}\/\d{2,3}$"
                  title="Blood pressure must be in the format 120/80"
                  @input="sanitizeBloodPressure"
                  class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                  placeholder="Enter blood pressure (e.g. 120/80)"
                  required
                />
              </div>
            </div>
            <div class="space-y-3">
              <label class="font-semibold">
                Do you have or have you had any of the following?
                <span class="text-gray-500">(Select all that apply)</span>
              </label>

              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="condition in conditionsList"
                  :key="condition"
                  class="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="condition"
                    v-model="form.medical_conditions"
                    class="accent-blue-600"
                  />
                  <span>{{ condition }}</span>
                </label>
              </div>

              <!-- Show only if "Others" is selected -->
              <input
                v-if="form.medical_conditions.includes('Others')"
                v-model="form.other_condition_details"
                type="text"
                class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
                placeholder="Please specify other condition"
                required
              />
            </div>
          </div>

          <!-- Divider -->
          <div class="w-full h-[1px] bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="flex justify-between mt-4">
            <button
              class="bg-gray-500 p-2 px-3 rounded-lg text-white hover:bg-gray-600"
              type="button"
              @click="step = 1"
            >
              Back
            </button>

            <button
              class="bg-green-600 p-2 px-3 rounded-lg text-white hover:bg-green-700"
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

export default {
  name: "AddPatient",
  components: { icon },
props: {
  patient: {
    type: Object,
    default: null,
  },
},

  data() {
    return {
      step: 1,

      /* ===============================
         Medical Conditions List
      =============================== */
      conditionsList: [
        "High Blood Pressure",
        "Low Blood Pressure",
        "Epilepsy/Convulsions",
        "AIDS or HIV Infection",
        "STD",
        "Stomach Trouble/Ulcers",
        "Fainting Seizures",
        "Rapid Weight Loss",
        "Radiation Therapy",
        "Joint Replacement/Implants",
        "Heart Surgery",
        "Heart Attack",
        "Thyroid Problems",
        "Heart Disease",
        "Heart Murmur",
        "Hepatitis/Liver Disease",
        "Hay Fever/Allergies",
        "Respiratory Problems",
        "Hepatitis/Jaundice",
        "Tuberculosis",
        "Swollen Ankle",
        "Kidney Diseases",
        "Diabetes",
        "Chest Pains",
        "Stroke",
        "Cancer/Tumor",
        "Anemia",
        "Asthma",
        "Angina",
        "Emphysema",
        "Bleeding Problems",
        "Blood Diseases",
        "Head Injuries",
        "Arthritis/Rheumatism",
        "Others",
      ],

      /* ===============================
         FORM STATE
      =============================== */
      form: {
        /* Patient Info */
        first_name: "",
        middle_name: "",
        last_name: "",
        gender: "",
        birthdate: "",
        age: "",
        contact_number: "",
        religion: "",
        nationality: "",
        marital_status: "",
        occupation: "",
        parent_fullname: "",
        address: "",

        /* Insurance */
        has_insurance: "",
        dental_insurance: "",
        other_insurance: "",

        /* Health Questionnaire */
        good_health: "",
        health_details: "",

        medical_treatment: "",
        medical_treatment_details: "",

        serious_illness: "",
        serious_illness_details: "",

        hospitalized: "",
        hospitalized_details: "",

        taking_medication: "",
        taking_medication_details: "",

        use_tobacco: "",
        use_alcohol: "",

        allergies: "",
        allergies_details: "",

        bleeding_time_details: "",

        pregnant: "",
        nursing: "",
        control_pills: "",

        blood_type: "",
        blood_pressure: "",

        medical_conditions: [],
        other_condition_details: "",
      },
    };
  },

  /* ===============================
     WATCHERS
  =============================== */
  watch: {
    "form.birthdate"(newDate) {
      if (!newDate) {
        this.form.age = "";
        return;
      }
      const today = new Date();
      const birth = new Date(newDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      this.form.age = age;
    },

    /* Reset conditional fields */
    "form.has_insurance"(val) {
      if (val !== "Yes") {
        this.form.dental_insurance = "";
        this.form.other_insurance = "";
      }
    },

    "form.allergies"(val) {
      if (val !== "OTHERS") this.form.allergies_details = "";
    },

    medical_conditions: {
      handler(val) {
        if (!val.includes("Others")) {
          this.form.other_condition_details = "";
        }
      },
      deep: true,
    },
  },
computed: {
  isEdit() {
    return !!this.patient;
  },
},

  methods: {
    sanitizeBloodPressure() {
      // Allow only digits and one slash
      let val = this.form.blood_pressure
        .replace(/[^0-9/]/g, "") // remove letters/symbols
        .replace(/\/{2,}/g, "/"); // prevent multiple slashes

      // Keep only the FIRST slash
      const parts = val.split("/");
      if (parts.length > 2) {
        val = parts[0] + "/" + parts[1];
      }

      this.form.blood_pressure = val;
    },
    /* ===============================
       STEP CONTROL
    =============================== */
    goNext() {
      const form = this.$refs.patientForm;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      this.step = 2;
    },

    /* ===============================
       SUBMIT
    =============================== */
 async submitData() {
  const formEl = this.$refs.patientForm;
  if (!formEl.checkValidity()) {
    formEl.reportValidity();
    return;
  }

  try {
    // ✅ Build payload only with allowed fields
    const payload = {
      first_name: this.form.first_name,
      middle_name: this.form.middle_name,
      last_name: this.form.last_name,
      gender: this.form.gender,
      birthdate: this.form.birthdate,
      age: this.form.age,
      contact_number: this.form.contact_number,
      religion: this.form.religion,
      nationality: this.form.nationality,
      marital_status: this.form.marital_status,
      occupation: this.form.occupation,
      parent_fullname: this.form.parent_fullname,
      address: this.form.address,

      has_insurance: this.form.has_insurance,
      dental_insurance:
        this.form.has_insurance === "Yes" && this.form.dental_insurance === "Other"
          ? this.form.other_insurance
          : this.form.dental_insurance,

      good_health: this.form.good_health,
      health_details: this.form.health_details,

      medical_treatment: this.form.medical_treatment,
      medical_treatment_details: this.form.medical_treatment_details,

      serious_illness: this.form.serious_illness,
      serious_illness_details: this.form.serious_illness_details,

      hospitalized: this.form.hospitalized,
      hospitalized_details: this.form.hospitalized_details,

      taking_medication: this.form.taking_medication,
      taking_medication_details: this.form.taking_medication_details,

      use_tobacco: this.form.use_tobacco,
      use_alcohol: this.form.use_alcohol,

      allergies: this.form.allergies,
      allergies_details: this.form.allergies_details,

      bleeding_time_details: this.form.bleeding_time_details,

      pregnant: this.form.pregnant,
      nursing: this.form.nursing,
      control_pills: this.form.control_pills,

      blood_type: this.form.blood_type,
      blood_pressure: this.form.blood_pressure,

      medical_conditions: this.form.medical_conditions,
      other_condition_details: this.form.other_condition_details,
    };

    /* =========================
       EDIT MODE
    ========================= */
    if (this.isEdit && this.patient && this.patient.patient_id) {
      await axios.patch(
        process.env.VUE_APP_API_BASE_URL +
          `/patient/update-patient/${this.patient.patient_id}`,
        payload
      );

      toast.success("Patient updated successfully!");
    } 
    /* =========================
       ADD MODE
    ========================= */
    else {
      // Duplicate check only for add
      const { data: patients } = await axios.get(
        process.env.VUE_APP_API_BASE_URL + "/patient/get-patient"
      );

      const duplicate = patients.find(
        (p) =>
          p.first_name?.toLowerCase() === payload.first_name.toLowerCase() &&
          p.middle_name?.toLowerCase() === payload.middle_name.toLowerCase() &&
          p.last_name?.toLowerCase() === payload.last_name.toLowerCase()
      );

      if (duplicate) {
        toast.warning("Patient already exists!");
        new Audio(require("@/assets/add.mp3")).play();
        return;
      }

      await axios.post(
        process.env.VUE_APP_API_BASE_URL + "/patient/add-patient",
        payload
      );

      toast.success("Patient added successfully!");
    }

    new Audio(require("@/assets/add.mp3")).play();

    this.$emit("refresh");
    this.$emit("close");
  } catch (err) {
    console.error(err);
    toast.error(this.isEdit ? "Failed to update patient." : "Failed to add patient.");
  }
}
,

  },  mounted() {
  if (this.patient) {
    const allowedKeys = Object.keys(this.form);

    allowedKeys.forEach((key) => {
      if (this.patient[key] !== undefined) {
        this.form[key] = this.patient[key];
      }
    });
  }
}


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
