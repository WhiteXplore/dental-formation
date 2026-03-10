<template>
  <div
    class="fixed inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center z-50"
  >
    <div class="rounded-[15px] shadow-lg justify-center animate-fadeInUp">
      <form
        @submit.prevent="submitData"
        class="w-auto bg-white text-[13px] rounded-[15px] shadow-l p-0.5"
      >
        <!-- Header -->
        <div
          class="w-full p-5 py-3 bg-[#34699A] text-white rounded-t-[15px] flex justify-between items-center border-b shadow"
        >
          <div class="flex gap-1 items-center">
            <icon :name="isEdit ? 'edit' : 'add-students'" />

            <h1 class="font-bold tracking-wide text-lg">
              {{ isEdit ? "Edit Status" : "Add Status" }}
            </h1>
          </div>

          <icon
            name="circle-close3"
            class="cursor-pointer"
            @click="$emit('close')"
          />
        </div>

        <!-- Form -->
        <div class="p-5 w-[27vw] space-y-4">
          <!-- Status Name -->
          <div class="space-y-1.5 text-left flex flex-col">
            <label class="font-bold">Status Name:</label>

            <input
              v-model="form.status_name"
              type="text"
              required
              class="w-full border px-3 py-3 border-gray-600 rounded-md text-md text-gray-800"
              placeholder="Enter status name"
            />
          </div>

          <!-- Divider -->
          <div class="w-full h-[1px] rounded-md bg-gray-200 mt-4"></div>

          <!-- Buttons -->
          <div class="tracking-wide flex justify-end gap-2 mt-4">
            <button
              type="button"
              class="bg-red-600 p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-red-800 hover:text-red-800 hover:shadow-md"
              @click="$emit('close')"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="bg-[#34699A] p-2 px-3 rounded-lg text-white hover:bg-white border hover:border-green-800 hover:text-green-800 hover:shadow-md"
            >
              {{ isEdit ? "Update" : "Submit" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import icon from "@/assets/icon.vue";
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  name: "StatusModal",

  components: { icon },

  props: {
    status: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      form: {
        status_name: "",
      },
    };
  },

  computed: {
    isEdit() {
      return !!this.status;
    },
  },

  created() {
    if (this.isEdit) {
      this.populateForm();
    }
  },

  methods: {
    populateForm() {
      this.form.status_name = this.status.status_name;
    },

    async submitData() {
      try {
        const payload = {
          status_name: this.form.status_name,
        };

        if (this.isEdit) {
          await axios.patch(
            process.env.VUE_APP_API_BASE_URL +
              `/status/update/${this.status.status_id}`,
            payload,
          );

          toast.success("Status updated successfully!");
        } else {
          await axios.post(
            process.env.VUE_APP_API_BASE_URL + "/status/add-status",
            payload,
          );

          toast.success("Status added successfully!");
        }

        this.$emit("refresh");
        this.$emit("close");
      } catch (err) {
        toast.error("Failed to save status.");
      }
    },
  },
};
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.3s ease-out;
}
</style>
