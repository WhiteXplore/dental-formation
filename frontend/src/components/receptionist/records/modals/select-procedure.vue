<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-[35vw] p-2 overflow-y-auto max-h-[80vh]"
    >
      <!-- Header -->
      <div
        class="flex justify-between items-center px-6 py-4 border-b bg-[#34699A] text-white rounded-t-xl"
      >
        <h2 class="text-xl font-semibold">Select Procedure to Edit</h2>
        <icon
          name="circle-close3"
          class="cursor-pointer hover:scale-110 transition"
          @click="$emit('close')"
        />
      </div>

      <!-- Procedure List -->
      <ul class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
        <li
          v-for="procedure in procedures"
          :key="procedure.dental_id"
          class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 shadow-sm transition flex flex-col gap-1"
          @click="$emit('select', procedure)"
        >
          <!-- Date and Procedure -->
          <div class="flex justify-between items-center">
            <span class="text-gray-700 font-medium">
              {{ formatDate(procedure.procedure_date) }}
            </span>
            <span
              class="text-xs px-2 py-1 rounded-full font-normal text-white tracking-wide"
              :class="
                procedure.priceProcedure?.status_color ||
                'bg-gray-300 text-gray-800'
              "
            >
              {{ procedure.priceProcedure?.procedure_name || "Unknown" }}
            </span>
          </div>

          <!-- Notes -->
          <p class="text-sm text-gray-500">
            {{ procedure.procedure_notes || "No notes" }}
          </p>

          <!-- Dentist Info -->
          <p class="text-xs text-gray-400">
            Dentist: {{ procedure.user_accounts?.first_name }}
            {{ procedure.user_accounts?.last_name }}
          </p>

          <!-- Patient Info -->
          <p class="text-xs text-gray-400">
            Patient: {{ procedure.patient?.first_name }}
            {{ procedure.patient?.last_name }}
          </p>
        </li>
      </ul>

      <!-- Cancel Button -->
      <div class="mt-2 p-2 flex justify-end text-sm">
        <button
          class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
          @click="$emit('close')"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import icon from "@/assets/icon.vue";
export default {
  props: {
    procedures: Array,
  },
  components: {
    icon,
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format("MMM DD, YYYY - hh:mm A");
    },
  },
};
</script>

<style scoped>
/* Optional smooth scrollbar for long procedure lists */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
