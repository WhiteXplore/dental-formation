<!-- src/components/AddInventoryModal.vue -->
<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
      <h2 class="text-xl font-bold mb-4 text-gray-800">
        {{ isEditing ? "Edit" : "Add" }} Inventory Item
      </h2>

      <form @submit.prevent="onSave" class="space-y-4">
        <input
          v-model="formData.name"
          required
          type="text"
          placeholder="Name"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="formData.type"
          required
          type="text"
          placeholder="Type"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <input
          v-model="formData.dosage"
          required
          type="text"
          placeholder="Dosage"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model.number="formData.quantity"
          required
          min="0"
          type="number"
          placeholder="Quantity"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="formData.unit"
          required
          type="text"
          placeholder="Unit"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="formData.price_per_unit"
          required
          type="text"
          placeholder="Unit"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="file"
          accept="image/*"
          @change="onImageUpload"
          class="w-full"
        />

        <div v-if="formData.preview" class="text-center">
          <img
            :src="formData.preview"
            class="h-32 w-auto mx-auto mt-2 rounded border object-contain"
            alt="Preview"
          />
        </div>

        <div class="flex justify-end gap-3 mt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-[#34699A] transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddInventoryModal",
  props: {
    show: Boolean,
    formData: Object,
    isEditing: Boolean,
  },
  emits: ["save", "close", "update:formData"],
  methods: {
    onSave() {
      this.$emit("save");
    },
    onImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.formData.file = file;
        this.formData.preview = URL.createObjectURL(file);
        this.$emit("update:formData", { ...this.formData });
      }
    },
  },
};
</script>
