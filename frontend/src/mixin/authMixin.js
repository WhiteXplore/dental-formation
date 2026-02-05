import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      errorMessage: "",
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    async login() {
      try {
        // ✅ Automatically detect if running locally or on LAN
        const baseURL =
          window.location.hostname === "localhost"
            ? process.env.VUE_APP_API_BASE_URL + "/auth/login"
            : "http://192.168.1.16:8000/auth/login";

        const response = await axios.post(
          baseURL,
          {
            email: this.email,
            password: this.password,
          },
          { withCredentials: true },
        );

        const { role, status } = response.data;
        localStorage.setItem("role", role);

        if (status !== "Active") {
          toast.error("Account is not active. Please contact admin.");
          return;
        }

        // ✅ Redirect by role
        if (role === "Receptionist") {
          this.$router.push("/receptionist-dashboard");
        } else if (role === "Dentist") {
          this.$router.push("/dentist-dashboard");
        } else if (role === "Admin") {
          this.$router.push("/admin-dashboard");
        } else {
          toast.error("Unknown role. Please contact admin.");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Login failed. Please check your credentials.");
      }
    },
  },
};
