<template>
  <div class="h-[95vh] bg-gray-100 p-4 rounded-md overflow-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div class="mb-4 text-left">
        <h1 class="text-2xl font-semibold text-gray-800">
          Welcome, {{ user.first_name }} 👋
        </h1>
        <p class="text-sm text-gray-500">Here's what's happening today</p>
      </div>

      <!-- Doctor Availability Selector -->
      <div class="flex flex-col items-end gap-1">
        <label class="text-sm font-medium text-gray-700">
          Doctor Availability
        </label>
        <div class="flex items-center gap-3">
          <span
            :class="
              doctorAvailability === 'available'
                ? 'text-green-600 font-semibold'
                : 'text-gray-500'
            "
          >
            {{
              doctorAvailability === "available" ? "Available" : "Not Available"
            }}
          </span>

          <button
            @click="toggleAvailability"
            class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300"
            :class="
              doctorAvailability === 'available'
                ? 'bg-green-500'
                : 'bg-gray-300'
            "
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300"
              :class="
                doctorAvailability === 'available'
                  ? 'translate-x-6'
                  : 'translate-x-1'
              "
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Summary Cards + Calendar -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div
            class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
          >
            <CardMonthCensus />
          </div>
          <div
            class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
          >
            <CardPatientVisit />
          </div>
          <div
            class="bg-white rounded-2xl shadow p-5 flex flex-col justify-between min-h-[150px]"
          >
            <CardNoShowPatient />
          </div>
        </div>

        <!-- Calendar -->
        <div class="bg-white rounded-t-2xl shadow p-6 h-full overflow-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-700">{{ monthYear }}</h2>
            <div class="flex gap-2">
              <button
                @click="prevMonth"
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 flex items-center gap-1 rounded-lg"
              >
                <span><icon :name="'arrow-left'" /></span>
                Prev
              </button>
              <button
                @click="nextMonth"
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 flex items-center gap-1 rounded-lg"
              >
                Next
                <span><icon :name="'arrow-right'" /></span>
              </button>
            </div>
          </div>

          <!-- Weekdays -->
          <div
            class="grid grid-cols-7 text-center text-sm font-semibold text-gray-500 border-b pb-2"
          >
            <div v-for="day in weekDays" :key="day">{{ day }}</div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-2 pt-2">
            <div
              v-for="(date, index) in calendarDays"
              :key="index"
              class="aspect-square rounded-xl h-[10vh] cursor-pointer relative p-2 text-right"
              :class="{
                'bg-[#34699A] text-white font-bold': isToday(date),
                'text-gray-400': date.month() !== currentMonth.month(),
                'hover:bg-blue-100': date.month() === currentMonth.month(),
              }"
              @click="selectDate(date)"
            >
              {{ date.date() }}

              <!-- Appointments -->
              <div
                v-for="(appointment, idx) in getAppointmentsByDate(date)"
                :key="'appt-' + idx"
                class="absolute inset-x-1 bottom-1 flex flex-col items-start gap-1"
                @click.stop="openEventDetails(appointment)"
              >
                <div
                  class="bg-[#34699A] text-white text-xs px-2 py-0.5 rounded cursor-pointer truncate w-full"
                >
                  {{ appointment.patient.first_name }}
                  {{ appointment.patient.last_name }}
                  <span class="text-[10px] ml-1"
                    >({{ appointment.appointment_time }})</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Announcements -->
      <div class="bg-white rounded-t-2xl shadow p-6 h-full overflow-y-auto">
        <div
          class="flex justify-between items-center mb-4 border-b border-gray-100 pb-2"
        >
          <h2 class="text-xl font-semibold text-gray-700">Announcements</h2>
          <icon :name="'3dots'" />
        </div>

        <!-- Event Lists -->
        <div v-if="todaysEvents.length">
          <h3 class="text-sm font-bold text-gray-600 mb-2">Today</h3>
          <div
            v-for="(event, idx) in todaysEvents"
            :key="'today-' + idx"
            class="bg-green-50 border border-green-200 rounded-xl p-4 mb-3 shadow-sm cursor-pointer hover:bg-green-100"
            @click="openEventDetails(event.raw || event)"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 mb-1">
                  {{ formatDate(event) }}
                </div>
                <div class="text-sm font-medium text-gray-800">
                  {{ event.title }}
                </div>
              </div>
              <div
                :class="{
                  'w-9 h-9 bg-green-400 rounded-full flex items-center justify-center':
                    event.type !== 'appointment',
                  'w-9 h-9 bg-blue-400 rounded-full flex items-center justify-center':
                    event.type === 'appointment',
                }"
              >
                <icon
                  :name="event.type === 'appointment' ? 'calendar' : 'calendar'"
                  class="text-white w-5 h-5"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="upcomingEvents.length">
          <h3 class="text-sm font-bold text-gray-600 mt-4 mb-2">Upcoming</h3>
          <div
            v-for="(event, idx) in upcomingEvents"
            :key="'upcoming-' + idx"
            class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3 shadow-sm cursor-pointer hover:bg-blue-100"
            @click="openEventDetails(event)"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 mb-1">
                  {{ formatDate(event) }}
                </div>
                <div class="text-sm font-medium text-gray-800">
                  {{ event.title }}
                </div>
              </div>
              <div
                class="w-9 h-9 bg-[#34699A] rounded-full flex items-center justify-center"
              >
                <icon :name="'noticeBell'" class="text-white w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="pastEvents.length">
          <h3 class="text-sm font-bold text-gray-600 mt-4 mb-2">Completed</h3>
          <div
            v-for="(event, idx) in pastEvents"
            :key="'past-' + idx"
            class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 shadow-sm cursor-pointer hover:bg-gray-100"
            @click="openEventDetails(event)"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 mb-1">
                  {{ formatDate(event) }}
                </div>
                <div class="text-sm font-medium text-gray-800">
                  {{ event.title }}
                </div>
              </div>
              <div
                class="w-9 h-9 bg-gray-400 rounded-full flex items-center justify-center"
              >
                <icon :name="'check1'" class="text-white w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <p
          v-if="
            !todaysEvents.length && !upcomingEvents.length && !pastEvents.length
          "
          class="text-sm text-gray-500"
        >
          No announcements to show.
        </p>
      </div>
    </div>

    <!-- View Details Modal -->
    <div
      v-if="selectedEvent"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-[450px] max-w-full p-6 animate-slideUp"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-gray-200 pb-3 mb-4"
        >
          <h3 class="text-xl font-semibold text-gray-800">
            Event / Appointment Details
          </h3>
          <button
            @click="closeEventModal"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            ✖
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4 text-gray-700 text-sm">
          <!-- Date -->
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"
                />
              </svg>
            </div>
            <span class="font-medium"
              ><strong>Date:</strong> {{ formattedEventDate }}</span
            >
          </div>

          <!-- Patient -->
          <div v-if="selectedEvent.patient" class="flex items-center gap-3">
            <div
              class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 1116 0H2z" />
              </svg>
            </div>
            <span class="font-medium">
              <strong>Patient:</strong> {{ selectedEvent.patient.first_name }}
              {{ selectedEvent.patient.last_name }}
            </span>
          </div>

          <!-- Time -->
          <div
            v-if="selectedEvent.appointment_time"
            class="flex items-center gap-3"
          >
            <div
              class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zm.5 4H9v5l4.25 2.52.75-1.23-3.5-2.07V6z"
                />
              </svg>
            </div>
            <span class="font-medium"
              ><strong>Time:</strong> {{ selectedEvent.appointment_time }}</span
            >
          </div>

          <!-- Status -->
          <div
            v-if="selectedEvent.appointment_status"
            class="flex items-center gap-3"
          >
            <div
              class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-11.707a1 1 0 00-1.414 0L7 9.586 6.293 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z"
                />
              </svg>
            </div>
            <span class="font-medium">
              <strong>Status:</strong>
              <span
                class="inline-block px-2 py-0.5 rounded-full bg-purple-200 text-purple-700 text-xs"
              >
                {{ selectedEvent.appointment_status }}
              </span>
            </span>
          </div>

          <!-- Doctor -->
          <div
            v-if="selectedEvent.user_accounts"
            class="flex items-center gap-3"
          >
            <div
              class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 9a3 3 0 116 0 3 3 0 01-6 0zM2 18a6 6 0 1112 0H2z" />
              </svg>
            </div>
            <span class="font-medium">
              <strong>Doctor:</strong>
              {{ selectedEvent.user_accounts.first_name }}
              {{ selectedEvent.user_accounts.last_name }}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end mt-6">
          <button
            @click="closeEventModal"
            class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "vue3-toastify";
dayjs.extend(utc);
dayjs.extend(timezone);
import icon from "@/assets/icon.vue";

import axios from "axios";
import CardPatientVisit from "@/components/admin/admin-record/graphs/card-walk-in-patient.vue";
import CardNoShowPatient from "@/components/admin/admin-record/graphs/card-no-show-patient.vue";
import CardMonthCensus from "@/components/admin/admin-record/graphs/card-appointments.vue";
// import CardTotalRevenue from "@/components/admin/admin-record/graphs/card-total-revenue.vue";
import { useFetchDataStore } from "@/store/fetch-data-store";
import { mapState } from "pinia";

export default {
  name: "EmployeeDashboard",
  components: {
    icon,
    CardNoShowPatient,
    CardPatientVisit,
    CardMonthCensus,
    // CardTotalRevenue,
  },
  data() {
    return {
      user: {},
      doctorAvailability: "",
      currentMonth: dayjs().startOf("month"),
      weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      events: [],
      selectedDate: null,
      showEventModal: false,
      newEventTitle: "",
      selectedEvent: null,
      selectedEventIndex: null,
      loadingAvailability: false,
    };
  },
  computed: {
    ...mapState(useFetchDataStore, ["appointments"]),
    formattedEventDate() {
      if (!this.selectedEvent) return "";
      // Use scheduled_date if it's an appointment
      const dateStr =
        this.selectedEvent.scheduled_date || this.selectedEvent.date;
      return dayjs(dateStr).tz("Asia/Manila").format("MMMM D, YYYY");
    },
    monthYear() {
      return this.currentMonth.format("MMMM YYYY");
    },
    calendarDays() {
      const startOfMonth = this.currentMonth.startOf("month");
      const endOfMonth = this.currentMonth.endOf("month");
      const startDay = startOfMonth.day();
      const totalDays = endOfMonth.date();
      const days = [];

      for (let i = 0; i < startDay; i++) {
        days.push(startOfMonth.subtract(startDay - i, "day"));
      }
      for (let i = 1; i <= totalDays; i++) {
        days.push(
          dayjs(
            `${this.currentMonth.format("YYYY-MM")}-${String(i).padStart(
              2,
              "0"
            )}`
          )
        );
      }
      while (days.length < 42) {
        days.push(days[days.length - 1].add(1, "day"));
      }
      return days;
    },
    filteredAppointments() {
      if (this.user.role === "Dentist" && this.user.email) {
        return this.appointments.filter(
          (a) => a.user_accounts?.email === this.user.email
        );
      }
      return this.appointments;
    },

    getAppointmentsByDate() {
      return (date) =>
        this.filteredAppointments.filter((a) =>
          dayjs(a.scheduled_date).tz("Asia/Manila").isSame(date, "day")
        );
    },

    todaysEvents() {
      const eventsToday = this.events.filter((e) =>
        dayjs(e.date).isSame(dayjs(), "day")
      );
      const appointmentsToday = this.filteredAppointments
        .filter((a) => dayjs(a.scheduled_date).isSame(dayjs(), "day"))
        .map((a) => ({
          ...a,
          title: `${a.patient.first_name} ${a.patient.last_name} (${a.appointment_time})`,
          type: "appointment",
          raw: a,
        }));
      return [...eventsToday, ...appointmentsToday];
    },

    upcomingEvents() {
      const futureEvents = this.events
        .filter((e) => dayjs(e.date).isAfter(dayjs(), "day"))
        .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
      const futureAppointments = this.filteredAppointments
        .filter((a) => dayjs(a.scheduled_date).isAfter(dayjs(), "day"))
        .map((a) => ({
          ...a,
          title: `${a.patient.first_name} ${a.patient.last_name} (${a.appointment_time})`,
          type: "appointment",
          raw: a,
        }))
        .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
      return [...futureEvents, ...futureAppointments];
    },

    pastEvents() {
      const pastEvents = this.events
        .filter((e) => dayjs(e.date).isBefore(dayjs(), "day"))
        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
      const pastAppointments = this.filteredAppointments
        .filter((a) => dayjs(a.scheduled_date).isBefore(dayjs(), "day"))
        .map((a) => ({
          ...a,
          title: `${a.patient.first_name} ${a.patient.last_name} (${a.appointment_time})`,
          type: "appointment",
          raw: a,
        }))
        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
      return [...pastEvents, ...pastAppointments];
    },
  },
  methods: {
    formatDate(event) {
      // Use scheduled_date for appointments, otherwise use event.date
      const dateStr = event.scheduled_date || event.date;
      return dayjs(dateStr).tz("Asia/Manila").format("MMM D, YYYY");
    },

    prevMonth() {
      this.currentMonth = this.currentMonth.subtract(1, "month");
    },
    nextMonth() {
      this.currentMonth = this.currentMonth.add(1, "month");
    },
    isToday(date) {
      return date.isSame(dayjs(), "day");
    },
    selectDate(date) {
      // just open details of appointments on that day
      const appointments = this.getAppointmentsByDate(date);
      if (appointments.length > 0) this.openEventDetails(appointments[0]);
    },
    openEventDetails(event) {
      this.selectedEvent = event.raw || event;
    },
    closeEventModal() {
      this.selectedEvent = null;
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
          this.user = {
            ...response.data,
            user_id: response.data.user_id || response.data.sub,
          };
          // Always read availability from backend
          this.doctorAvailability =
            response.data.doctor_availability || "not-available";
        } else {
          this.$router.push("/");
          location.reload();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.$router.push("/");
      }
    },

    async fetchAnotherUsers() {
      try {
        const response = await axios.get(
          process.env.VUE_APP_API_BASE_URL +
            `/user/get-user/${this.user?.user_id}`,
          { withCredentials: true }
        );

        if (response.data) {
          this.user = response.data;
          this.doctorAvailability =
            response.data.doctor_availability || "not-available";

          console.log("👤 User fetched:", this.user);
          console.log("📌 Availability:", this.doctorAvailability);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    },
    async toggleAvailability() {
      if (!this.user?.user_id || this.loadingAvailability) return;

      this.loadingAvailability = true;
      const previousAvailability = this.doctorAvailability;

      // Toggle locally first
      this.doctorAvailability =
        this.doctorAvailability === "available" ? "not-available" : "available";

      try {
        const url =
          process.env.VUE_APP_API_BASE_URL +
          `/user/${this.user.user_id}/availability`;
        await axios.patch(url, {
          availability: this.doctorAvailability,
        });

        toast.success(`Doctor marked as ${this.doctorAvailability}`);
      } catch (error) {
        console.error("Failed to update availability:", error);
        toast.error("Failed to update availability");
        // Rollback if API fails
        this.doctorAvailability = previousAvailability;
      } finally {
        this.loadingAvailability = false;
      }
    },
  },
  async mounted() {
    await this.fetchUser(); // wait for user to be loaded

    // Set the availability after user is fetched
    this.doctorAvailability = this.user.doctor_availability || "not-available";

    // If you want to fetch another user's data:
    if (this.user.user_id !== this.user.sub) {
      await this.fetchAnotherUsers();
    } // Always fetch latest doctor data
    await this.fetchAnotherUsers();

    // Initialize doctor availability safely
    this.doctorAvailability = this.user.doctor_availability || "not-available";

    try {
      const appointmentRes = await axios.get(
        process.env.VUE_APP_API_BASE_URL + "/appointment/get-appointment",
        { withCredentials: true }
      );

      const announcementRes = await axios.get(
        process.env.VUE_APP_API_BASE_URL + "/announcement/get-announcements",
        { withCredentials: true }
      );

      let allAppointments = appointmentRes.data.map((a) => ({
        ...a,
        scheduled_date: dayjs(a.scheduled_date).tz("Asia/Manila").format(),
      }));

      let allAnnouncements = announcementRes.data;

      // Filter for dentist role
      if (this.user.role === "Dentist" && this.user.email) {
        allAppointments = allAppointments.filter(
          (a) => a.user_accounts?.email === this.user.email
        );
        allAnnouncements = allAnnouncements.filter(
          (ann) => ann.user_accounts?.email === this.user.email
        );
      }

      // If using Pinia:
      const store = useFetchDataStore();
      store.appointments = allAppointments;
      store.announcements = allAnnouncements;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  },
};
</script>
