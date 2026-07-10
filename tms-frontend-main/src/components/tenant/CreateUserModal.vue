<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto">
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold font-['Roboto'] text-gray-800">Create User</h2>
        <button 
          @click="$emit('close')" 
          class="text-gray-500 hover:text-gray-700 transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="submitForm">
        <!-- Name Field -->
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Enter full name"
          />
        </div>
        
        <!-- Email Field -->
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Enter email address"
          />
        </div>
        
        <!-- Password Field -->
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Enter password"
          />
        </div>
        
        <!-- Phone Number Field -->
        <div class="mb-4">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Enter phone number"
          />
        </div>
        
        <!-- Role Selection Field -->
        <div class="mb-6">
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            id="role"
            v-model="formData.role"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="" disabled>Select a role</option>
            <option value="StandardUser">Standard User</option>
            <option value="MonitoringUser">Monitoring User</option>
          </select>
        </div>
        
        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="mr-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Emits
const emit = defineEmits(['close', 'create']);

// Form data
const formData = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  role: ''
});

// Methods
const submitForm = () => {
  // Form validation (can be enhanced)
  if (!formData.value.name || !formData.value.email || !formData.value.password || !formData.value.phone || !formData.value.role) {
    alert('Please fill in all fields');
    return;
  }
  
  // Send data to parent component
  emit('create', {
    name: formData.value.name,
    email: formData.value.email,
    password: formData.value.password,
    phone: formData.value.phone,
    role: formData.value.role
  });
};
</script>