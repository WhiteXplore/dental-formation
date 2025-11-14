<template>
  <div
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4"
  >
    <div
      class="w-full max-w-3xl bg-white rounded-2xl shadow-2xl animate-fadeInUp overflow-hidden"
    >
      <form class="text-sm text-gray-800">
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 bg-blue-700 text-white"
        >
          <div class="flex items-center gap-2">
            <icon :name="'add-students'" />
            <h2 class="text-lg font-semibold">Prescription Summary</h2>
          </div>
          <icon
            :name="'circle-close3'"
            class="cursor-pointer hover:scale-110 transition"
            @click="$emit('close')"
          />
        </div>

        <!-- Content -->
        <div v-if="prescription" class="px-6 py-6 bg-gray-50 space-y-6">
          <!-- 🧑‍⚕️ Patient & Dentist Info -->
          <section>
            <h3 class="text-md font-semibold text-gray-700 mb-3">
              Patient Information
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="border p-4 rounded-md bg-white shadow-sm">
                <label class="block text-gray-500 text-xs mb-1"
                  >Patient Name</label
                >
                <div class="text-sm font-medium text-gray-800">
                  {{ prescription.dentalChart?.patient?.first_name }}
                  {{ prescription.dentalChart?.patient?.last_name }}
                </div>
              </div>
              <div class="border p-4 rounded-md bg-white shadow-sm">
                <label class="block text-gray-500 text-xs mb-1"
                  >Attending Dentist</label
                >
                <div class="text-sm font-medium text-gray-800">
                  Dr. {{ prescription.dentalChart?.user_accounts?.first_name }}
                  {{ prescription.dentalChart?.user_accounts?.last_name }}
                </div>
              </div>
            </div>
          </section>

          <!-- 🦷 Teeth Involved -->
          <section>
            <h3
              class="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              🦷 Teeth Involved
            </h3>
            <div class="border rounded-md bg-white shadow-sm p-4 space-y-2">
              <ul class="list-disc list-inside text-gray-700">
                <li
                  v-for="tooth in prescription.dentalChart?.teeth || []"
                  :key="tooth.tooth_number"
                >
                  <span class="font-medium"
                    >Tooth {{ tooth.tooth_number }}</span
                  >
                  –
                  <span class="text-gray-600">
                    {{ tooth.priceProcedure?.procedure_name }}
                  </span>
                </li>
                <li
                  v-if="!prescription.dentalChart?.teeth?.length"
                  class="text-gray-400 italic"
                >
                  No tooth involvement recorded.
                </li>
              </ul>
            </div>
          </section>

          <!-- 💊 Medications -->
          <section>
            <h3
              class="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              💊 Prescribed Medications
            </h3>
            <div class="border rounded-md bg-white shadow-sm p-4 space-y-2">
              <ul class="list-disc list-inside text-gray-700">
                <li
                  v-for="med in prescription.prescribedMedications || []"
                  :key="med.prescribe_medication_id"
                >
                  <span class="font-semibold">{{ med.inventory?.name }}</span> –
                  {{ med.inventory?.dosage }} – {{ med.pcs }}
                  {{ med.inventory?.unit }}
                </li>
                <li
                  v-if="!prescription.prescribedMedications?.length"
                  class="text-gray-400 italic"
                >
                  No medications prescribed.
                </li>
              </ul>
            </div>
          </section>

          <!-- 📋 Instructions -->
          <section>
            <h3
              class="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              📋 Instructions
            </h3>
            <div class="border rounded-md bg-white shadow-sm p-4">
              <p class="text-gray-700">
                {{ prescription.instruction || "No specific instructions." }}
              </p>
            </div>
          </section>

          <!-- Footer -->
          <div class="flex justify-end pt-4 border-t border-gray-300">
            <button
              type="button"
              class="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              @click="$emit('close')"
            >
              Close
            </button>
          </div>
        </div>

        <!-- ⏳ Loading State -->
        <div v-else class="text-center text-gray-500 py-10">
          Loading prescription details...
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import dayjs from "dayjs";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";

export default {
  name: "viewMedicationPage",
  components: {
    icon,
  },
  props: {
    prescriptionId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]),
    prescription() {
      return this.medications.find(
        (p) => p.prescription_id === this.prescriptionId
      );
    },
  },
  methods: {
    formatDate(date) {
      return date ? dayjs(date).format("MMMM DD, YYYY") : "N/A";
    },
  },
};
</script>

<style scoped>
.animate-fadeInUp {
  animation: fadeInUp 0.3s ease-in-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
