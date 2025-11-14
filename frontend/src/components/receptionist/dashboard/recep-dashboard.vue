<template>
  <div class="min-h-screen bg-gray-100 p-4 rounded-md">
    <!-- Header -->
    <div class="mb-4 text-left">
      <h1 class="text-2xl font-semibold text-gray-800">
        Welcome, {{ user.first_name }} 👋
      </h1>
      <p class="text-sm text-gray-500">Here's what's happening today</p>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="bg-white rounded-2xl shadow p-6 lg:col-span-2 h-[80vh]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-700">Calendar</h2>
          <div class="flex gap-2">
            <button
              @click="prevMonth"
              class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
            >
              <span><icon :name="'arrow-left'" /></span>
              Prev
            </button>
            <button
              @click="nextMonth"
              class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
            >
              Next<span><icon :name="'arrow-right'" /></span>
            </button>
          </div>
        </div>

        <div class="text-lg font-semibold text-gray-700 mb-2">
          {{ monthYear }}
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
            class="aspect-square rounded-xl h-[10vh] w-full cursor-pointer relative group p-2 text-right"
            :class="{
              'bg-[#34699A] text-white font-bold': isToday(date),
              'text-gray-400': date.month() !== currentMonth.month(),
              'hover:bg-blue-100': date.month() === currentMonth.month(),
            }"
            @click="selectDate(date)"
          >
            {{ date.date() }}

            <!-- Events -->
            <div
              v-if="hasEvent(date)"
              class="absolute inset-x-1 bottom-1 flex flex-col items-start gap-1"
            >
              <div
                v-for="event in getEventsByDate(date)"
                :key="event.title + event.date"
                @click.stop="openEventDetails(event)"
                class="bg-[#34699A] text-white text-xs px-2 py-0.5 rounded hover:bg-green-300 cursor-pointer truncate w-full"
              >
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Announcements -->
      <div class="bg-white rounded-2xl shadow p-6 h-[80vh] overflow-y-auto">
        <div
          class="flex justify-between items-center mb-4 border-b border-gray-100 pb-2"
        >
          <h2 class="text-xl font-semibold text-gray-700">Announcements</h2>
          <icon :name="'3dots'" />
        </div>

        <!-- Today -->
        <div v-if="todaysEvents.length">
          <h3 class="text-sm font-bold text-gray-600 mb-2">Today</h3>
          <div
            v-for="(event, idx) in todaysEvents"
            :key="'today-' + idx"
            class="bg-green-50 border border-green-200 rounded-xl p-4 mb-3 shadow-sm cursor-pointer hover:bg-green-100"
            @click="openEventDetails(event)"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-gray-500 mb-1">
                  {{ formatDate(event.date) }}
                </div>
                <div class="text-sm font-medium text-gray-800">
                  {{ event.title }}
                </div>
              </div>
              <div
                class="w-9 h-9 bg-green-400 rounded-full flex items-center justify-center"
              >
                <icon :name="'calendar'" class="text-white w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming -->
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
                  {{ formatDate(event.date) }}
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

        <!-- Past -->
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
                  {{ formatDate(event.date) }}
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

        <!-- If nothing -->
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

    <!-- Add Event Modal -->
    <div
      v-if="showEventModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 shadow-xl w-[450px]">
        <h3 class="text-lg font-semibold mb-3">
          Add Event on {{ selectedDate.format("MMMM D, YYYY") }}
        </h3>
        <textarea
          v-model="newEventTitle"
          type="text"
          placeholder="Event title"
          class="w-full border px-3 py-2 rounded mb-4 text-sm"
        />
        <div class="flex justify-end gap-2">
          <button @click="cancelEvent" class="text-gray-600 hover:underline">
            Cancel
          </button>
          <button
            @click="addEvent"
            class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-[#34699A]"
          >
            Add
          </button>
        </div>
      </div>
    </div>

    <!-- View/Edit Event Modal -->
    <div
      v-if="selectedEvent"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 shadow-xl w-[350px]">
        <h3 class="text-lg font-semibold mb-2">Edit Event</h3>
        <p class="text-xs text-gray-500 mb-2">Date: {{ formattedEventDate }}</p>
        <textarea
          v-model="selectedEvent.title"
          class="w-full border px-3 py-2 rounded mb-4 text-sm"
        />

        <div class="flex justify-between">
          <button class="text-red-500 hover:underline" @click="deleteEvent">
            Delete
          </button>
          <div class="flex gap-2">
            <button
              @click="closeEventModal"
              class="text-gray-600 hover:underline"
            >
              Cancel
            </button>
            <button
              @click="saveEvent"
              class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-[#34699A]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import icon from "@/assets/icon.vue";
import { toast } from "vue3-toastify";

export default {
  name: "EmployeeDashboard",
  components: {
    icon,
  },
  data() {
    return {
      user: {
        first_name: "John",
      },
      currentMonth: dayjs().startOf("month"),
      weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      events: [
        { title: "Team Meeting", date: "2025-06-23" },
        { title: "Project Deadline", date: "2025-06-25" },
      ],
      selectedDate: null,
      showEventModal: false,
      newEventTitle: "",
      selectedEvent: null,
    };
  },
  computed: {
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
    formattedEventDate() {
      return this.selectedEvent
        ? dayjs(this.selectedEvent.date).format("MMMM D, YYYY")
        : "";
    },
    todaysEvents() {
      return this.events.filter((e) => dayjs(e.date).isSame(dayjs(), "day"));
    },
    upcomingEvents() {
      return this.events
        .filter((e) => dayjs(e.date).isAfter(dayjs(), "day"))
        .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
    },
    pastEvents() {
      return this.events
        .filter((e) => dayjs(e.date).isBefore(dayjs(), "day"))
        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
    },
  },
  methods: {
    formatDate(date) {
      return dayjs(date).format("MMM D, YYYY");
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
    hasEvent(date) {
      return this.events.some((e) => dayjs(e.date).isSame(date, "day"));
    },
    getEventsByDate(date) {
      return this.events.filter((e) => dayjs(e.date).isSame(date, "day"));
    },
    selectDate(date) {
      this.selectedDate = date;
      this.newEventTitle = "";
      this.showEventModal = true;
    },
    addEvent() {
      if (this.newEventTitle.trim()) {
        this.events.push({
          title: this.newEventTitle,
          date: this.selectedDate.format("YYYY-MM-DD"),
        });
        this.showEventModal = false;
        this.newEventTitle = "";
        toast.success("Event added successfully!");
      }
    },
    cancelEvent() {
      this.showEventModal = false;
      this.newEventTitle = "";
    },
    openEventDetails(event) {
      this.selectedEvent = { ...event };
    },
    closeEventModal() {
      this.selectedEvent = null;
    },
    saveEvent() {
      const index = this.events.findIndex(
        (e) =>
          e.date === this.selectedEvent.date &&
          e.title === this.selectedEvent.title
      );
      if (index !== -1) {
        this.events[index].title = this.selectedEvent.title;
        toast.success("Event edited successfully!");
      }
      this.selectedEvent = null;
    },
    deleteEvent() {
      this.events = this.events.filter(
        (e) =>
          !(
            e.date === this.selectedEvent.date &&
            e.title === this.selectedEvent.title
          )
      );
      this.selectedEvent = null;
      toast.success("Event deleted successfully!");
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap");
</style>
