import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import globalSidebar from "@/components/global/navigation/sidebar.vue";
import receptionistSidebar from "../components/receptionist/navigation/sidebar.vue";
// import dentistSidebar from "../components/dentist/navigation/sidebar.vue";
// import adminSidebar from "../components/admin/navigation/sidebar.vue";
import NotFound from "@/views/404.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
  },
  // Receptionist
  {
    path: "/receptionist-navigation",
    name: "receptionist-navigation",
    component: receptionistSidebar,
    children: [
      {
        path: "/receptionist-dashboard",
        name: "receptionist-dashboard",
        component: () =>
          import("@/components/receptionist/dashboard/dashboard.vue"),
        meta: { requiresAuth: true, role: "Receptionist" },
      },

      {
        path: "/patient-records",
        name: "patient-records",
        component: () =>
          import("@/components/receptionist/records/patient.vue"),
        children: [],
        meta: { requiresAuth: true, role: "Receptionist" },
      },

      {
        path: "/appointments",
        name: "appointments",
        component: () =>
          import("@/components/receptionist/records/appointment.vue"),
        children: [],
        meta: { requiresAuth: true, role: "Receptionist" },
      },
      {
        path: "/recep-dental-chart",
        name: "recep-dental-chart",
        component: () => import("@/components/receptionist/records/charts.vue"),
        meta: { requiresAuth: true, role: "Receptionist" },
      },
      {
        path: "/billing-payments",
        name: "billing-payments",
        component: () =>
          import("@/components/receptionist/records/billing.vue"),
        children: [],
        meta: { requiresAuth: true, role: "Receptionist" },
      },
    ],
  },
  // Dentist
  {
    path: "/dentist-navigation",
    name: "dentist-navigation",
    component: globalSidebar,
    children: [
      {
        path: "/dentist-dashboard",
        name: "dentist-dashboard",
        component: () =>
          import("@/components/dentist/dentist-dashboard/dashboard.vue"),
        meta: { requiresAuth: true, role: "Dentist" },
      },

      {
        path: "/dentist-appointment",
        name: "dentist-appointment",
        component: () =>
          import("@/components/dentist/doctor-record/appointment.vue"),
        meta: { requiresAuth: true, role: "Dentist" },
      },

      {
        path: "/view-patient",
        name: "view-patient",
        component: () =>
          import("@/components/dentist/doctor-record/modals/view-patient.vue"),
        meta: { requiresAuth: true, role: "Dentist" },
      },
      {
        path: "/dental-chart",
        name: "dental-chart",
        component: () =>
          import("@/components/dentist/doctor-record/charts.vue"),
        meta: { requiresAuth: true, role: "Dentist" },
      },
      {
        path: "/prescription-medication",
        name: "prescription-medication",
        component: () =>
          import("@/components/dentist/doctor-record/medication.vue"),
        meta: { requiresAuth: true, role: "Dentist" },
      },
    ],
  },

  // Admin
  {
    path: "/admin-navigation",
    name: "admin-navigation",
    component: globalSidebar,
    children: [
      {
        path: "/admin-dashboard",
        name: "admin-dashboard",
        component: () =>
          import("@/components/admin/admin-dashboard/dashboard.vue"),
        meta: { requiresAuth: true, role: "Admin" },
      },
      {
        path: "/inventory",
        name: "inventory",
        component: () =>
          import("@/components/admin/admin-record/inventory.vue"),
        meta: { requiresAuth: true, role: "Admin" },
      },
      {
        path: "/user-accounts",
        name: "user-accounts",
        component: () => import("@/components/admin/admin-record/users.vue"),
        meta: { requiresAuth: true, role: "Admin" },
      },
      {
        path: "/price-procedure",
        name: "price-procedure",
        component: () => import("@/components/admin/admin-record/price.vue"),
        meta: { requiresAuth: true, role: "Admin" },
      },
      {
        path: "/report-analytics",
        name: "report-analytics",
        component: () =>
          import("@/components/admin/admin-record/analytics.vue"),
        meta: { requiresAuth: true, role: "Admin" },
      },
      {
        path: "/tracker",
        name: "tracker",
        component: () =>
          import("@/components/admin/admin-record/inventory-tracker.vue"),
        meta: { requiresAuth: true, role: "Admin" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
// 🔒 Navigation Guard
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth) {
    if (!role) return next({ name: "login" });

    // Role mismatch
    if (to.meta.role && to.meta.role !== role) {
      return next({ name: "NotFound" });
    }
  }

  next();
});
export default router;
