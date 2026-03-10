import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import globalSidebar from "@/components/global/navigation/sidebar.vue";
import NotFound from "@/views/404.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
  },

  // ======================
  // RECEPTIONIST
  // ======================
  {
    path: "/receptionist-navigation",
    component: globalSidebar,
    meta: { requiresAuth: true, roles: ["Receptionist", "Admin"] },
    children: [
      {
        path: "/receptionist-dashboard",
        name: "receptionist-dashboard",
        component: () =>
          import("@/components/receptionist/recep-dashboard/dashboard.vue"),
      },
      {
        path: "/patient-records",
        name: "patient-records",
        component: () =>
          import("@/components/receptionist/records/patient.vue"),
      },
      {
        path: "/appointments",
        name: "appointments",
        component: () =>
          import("@/components/receptionist/records/appointment.vue"),
      },
      {
        path: "/recep-dental-chart",
        name: "recep-dental-chart",
        component: () => import("@/components/receptionist/records/charts.vue"),
      },
      {
        path: "/billing-payments",
        name: "billing-payments",
        component: () =>
          import("@/components/receptionist/records/billing.vue"),
      },
      {
        path: "/outpatient-list",
        name: "outpatient-list",
        component: () =>
          import("@/components/receptionist/records/outpatient.vue"),
      },
      {
        path: "/dental-certificate",
        name: "dental-certificate",
        component: () =>
          import("@/components/receptionist/records/certificate.vue"),
      },
      {
        path: "/monthly-reports",
        name: "monthly-reports",
        component: () =>
          import("@/components/receptionist/records/monthly.vue"),
      },
    ],
  },

  // ======================
  // DENTIST
  // ======================
  {
    path: "/dentist-navigation",
    component: globalSidebar,
    meta: { requiresAuth: true, roles: ["Dentist"] },
    children: [
      {
        path: "/dentist-dashboard",
        name: "dentist-dashboard",
        component: () =>
          import("@/components/dentist/dentist-dashboard/dashboard.vue"),
      },
      {
        path: "/dentist-appointments",
        name: "dentist-appointments",
        component: () =>
          import("@/components/receptionist/records/appointment.vue"),
      },
      {
        path: "/dentist-dental-chart",
        name: "dentist-dental-chart",
        component: () => import("@/components/receptionist/records/charts.vue"),
      },
      {
        path: "/view-patient",
        name: "view-patient",
        component: () =>
          import("@/components/dentist/doctor-record/modals/view-patient.vue"),
      },
      {
        path: "/dental-chart",
        name: "dental-chart",
        component: () =>
          import("@/components/dentist/doctor-record/charts.vue"),
      },
      {
        path: "/prescription-medication",
        name: "prescription-medication",
        component: () =>
          import("@/components/dentist/doctor-record/medication.vue"),
      },
      {
        path: "/monthly-income",
        name: "monthly-income",
        component: () =>
          import("@/components/dentist/doctor-record/monthly-income.vue"),
      },
    ],
  },

  // ======================
  // ADMIN
  // ======================
  {
    path: "/admin-navigation",
    component: globalSidebar,
    meta: { requiresAuth: true, roles: ["Admin", "Dentist"] },
    children: [
      {
        path: "/admin-dashboard",
        name: "admin-dashboard",
        component: () =>
          import("@/components/admin/admin-dashboard/dashboard.vue"),
      },
      {
        path: "/inventory",
        name: "inventory",
        component: () =>
          import("@/components/admin/admin-record/inventory.vue"),
      },
      {
        path: "/user-accounts",
        name: "user-accounts",
        component: () => import("@/components/admin/admin-record/users.vue"),
      },
      {
        path: "/price-procedure",
        name: "price-procedure",
        component: () => import("@/components/admin/admin-record/price.vue"),
      },
      {
        path: "/status",
        name: "status",
        component: () => import("@/components/admin/admin-record/status.vue"),
      },
      {
        path: "/report-analytics",
        name: "report-analytics",
        component: () =>
          import("@/components/admin/admin-record/analytics.vue"),
      },
      {
        path: "/tracker",
        name: "tracker",
        component: () =>
          import("@/components/admin/admin-record/inventory-tracker.vue"),
      },
      {
        path: "/hmo-guarantors",
        name: "hmo-guarantors",
        component: () =>
          import("@/components/admin/admin-record/hmo-guarantors.vue"),
      },
      {
        path: "/usage-consumption",
        name: "usage-consumption",
        component: () => import("@/components/admin/admin-record/usage.vue"),
      },
      {
        path: "/revenue-forcasting",
        name: "revenue-forcasting",
        component: () =>
          import("@/components/admin/admin-record/forcasting.vue"),
      },
    ],
  },

  // ======================
  // 404
  // ======================
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ======================
// AUTH + ROLE GUARD
// ======================
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth) {
    if (!role) return next({ name: "login" });

    if (to.meta.roles && !to.meta.roles.includes(role)) {
      return next({ name: "NotFound" });
    }
  }

  next();
});

// ======================
// AUTO FIX ChunkLoadError
// ======================
router.onError((error) => {
  if (
    error.message.includes("ChunkLoadError") ||
    error.message.includes("Loading chunk")
  ) {
    console.warn("Chunk load failed. Reloading app...");
    window.location.reload();
  }
});

export default router;
