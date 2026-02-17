<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-[40vw] p-5">
      <h2 class="text-lg font-bold mb-3">Morning Fully Booked</h2>
      <p class="mb-3">
        The dentist's morning slots are fully booked on {{ date }}.
      </p>

      <table class="w-full text-sm border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">Patient</th>
            <th class="border p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in patients" :key="appt.appointment_id">
            <td class="border p-2">
              {{ appt.patient_name }}
            </td>
            <td class="border p-2 text-center">
              {{ formatTime(appt.appointment_time) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 flex justify-end">
        <button
          class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    date: { type: String, required: true },
    patients: { type: Array, default: () => [] },
  },
  methods: {
    formatTime(time) {
      if (!time) return "";

      // Supports HH:mm or HH:mm:ss
      const [hourStr, minute] = time.split(":");
      let hour = parseInt(hourStr, 10);
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;

      return `${hour}:${minute} ${period}`;
    },
  },
};
</script>
