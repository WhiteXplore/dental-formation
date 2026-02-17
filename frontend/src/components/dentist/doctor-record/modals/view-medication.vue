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
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="'eye'" />
            <h1 class="font-bold tracking-wide text-lg">
              Prescription Summary
            </h1>
          </div>
          <icon
            :name="'circle-close3'"
            @click="$emit('close')"
            class="cursor-pointer"
          />
        </div>

        <!-- Content -->
        <div v-if="prescription" class="px-6 py-6 bg-gray-50 space-y-6">
          <!-- 🧑‍⚕️ Patient & Dentist Info -->
          <section>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="border p-4 rounded-xl bg-white">
                <label class="block text-gray-500 text-xs mb-1"
                  >Patient Name</label
                >
                <div class="text-sm font-medium text-gray-800">
                  {{ prescription.dentalChart?.patient?.first_name }}
                  {{ prescription.dentalChart?.patient?.last_name }}
                </div>
              </div>
              <div class="border p-4 rounded-xl bg-white">
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

          <!--  Teeth Involved -->
          <section>
            <h3
              class="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              Teeth Involved
            </h3>
            <div
              class="border rounded-xl bg-white p-4 max-h-[30vh] overflow-y-auto"
            >
              <table class="min-w-full border-collapse text-gray-700">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="px-4 py-2 text-left font-medium">
                      Tooth Number
                    </th>
                    <th class="px-4 py-2 text-left font-medium">Procedure</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="tooth in prescription.dentalChart?.teeth || []"
                    :key="tooth.tooth_number"
                    class="border-b hover:bg-gray-50"
                  >
                    <td class="px-4 py-2 font-medium">
                      Tooth {{ tooth.tooth_number }}
                    </td>
                    <td class="px-4 py-2">
                      {{ tooth.priceProcedure?.procedure_name || "N/A" }}
                    </td>
                  </tr>
                  <tr v-if="!prescription.dentalChart?.teeth?.length">
                    <td
                      colspan="2"
                      class="px-4 py-2 text-gray-400 italic text-center"
                    >
                      No tooth involvement recorded.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

       <!--  Medications -->
<section>
  <h3
    class="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2"
  >
    Prescribed Medications
  </h3>
  <div class="border rounded-xl bg-white p-4 space-y-2">
    <ul class="list-disc list-inside text-gray-700">
      <li
        v-for="med in prescription.prescribedMedications || []"
        :key="med.prescribe_medication_id"
      >
        <span class="font-semibold">{{ med.name }}</span> –
        {{ med.dosage || "N/A" }} – {{ med.pcs }} {{ med.unit || "pcs" }}
        <template v-if="med.duration || med.frequencies || med.preparation">
          •
          <span v-if="med.duration">Duration: {{ med.duration }}</span>
          <span v-if="med.frequencies">, Frequency: {{ med.frequencies }}</span>
          <span v-if="med.preparation">, Preparation: {{ med.preparation }}</span>
        </template>
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


          <!--  Instructions -->
          <section>
            <h3
              class="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              Instructions
            </h3>
            <div class="border rounded-xl bg-white p-4">
              <p class="text-gray-700">
                {{ prescription.instruction || "No specific instructions." }}
              </p>
            </div>
          </section>

          <!-- Footer -->
          <div class="flex justify-end pt-4 border-t border-gray-300">
            <button
              type="button"
              class="bg-gray-300 p-2 px-3 rounded-lg text-gray-600 hover:bg-white border hover:border-gray-800 hover:text-gray-800 hover:shadow-md"
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
  name: "ViewMedicationPage",
  components: { icon },
  props: {
    prescriptionId: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState(useFetchDataStore, ["medications"]), // medications should contain all prescriptions
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
