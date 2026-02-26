<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-[40vw] p-5">
      <!-- Header -->
      <h2 class="text-lg font-bold mb-3">
        {{ headerTitle }}
      </h2>

      <!-- Message -->
      <p class="mb-3" v-if="noSchedule">
        The dentist has no schedule on {{ date }}.
      </p>
      <p class="mb-3" v-else-if="slots === 0">
        The dentist's {{ sessionTitle.toLowerCase() }} slots are fully booked on
        {{ date }}.
      </p>
      <p class="mb-3" v-else-if="slots === null">
        The dentist's {{ sessionTitle.toLowerCase() }} has no slots on
        {{ date }}.
      </p>
      <p class="mb-3" v-else-if="patients.length === 0">
        No appointments yet for this session.
      </p>

      <!-- Table only if there are patients -->
      <table
        v-if="patients.length > 0"
        class="w-full text-sm border-collapse border border-gray-300"
      >
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">Patient</th>
            <th class="border p-2 text-center">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in patients" :key="appt.appointment_id">
            <td class="border p-2">{{ appt.patient_name }}</td>
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
    session: { type: String, default: "morning" }, // morning / afternoon
    slots: { type: Number, default: null }, // null = no schedule, 0 = fully booked, >0 = available slots
    noSchedule: { type: Boolean, default: false }, // true if dentist has no schedule at all
  },
  computed: {
    sessionTitle() {
      return this.session
        ? this.session.charAt(0).toUpperCase() + this.session.slice(1)
        : "";
    },
    headerTitle() {
      if (this.noSchedule) return "No Schedule";
      if (this.slots === 0) return `${this.sessionTitle} Fully Booked`;
      if (this.slots === null) return this.sessionTitle;
      return this.sessionTitle;
    },
  },
  methods: {
    formatTime(time) {
      if (!time) return "";

      const [hourStr, minute] = time.split(":");
      let hour = parseInt(hourStr, 10);
      const period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;

      return `${hour}:${minute} ${period}`;
    },
  },
};
</script>
