<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold font-['Roboto'] text-gray-800 mb-1">
          Tenant User Management
        </h1>
        <p class="text-gray-500 text-sm">Manage users and assign roles to your tenant</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 flex items-center mt-4 md:mt-0 transform hover:scale-105"
      >
        <span class="mr-2 font-medium">Create User</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Stats Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Total Users Card -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center">
          <div class="p-3 rounded-xl bg-indigo-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">Total Users</p>
            <h3 class="text-2xl font-bold text-gray-800">{{ tenantStore.users.length }}</h3>
          </div>
        </div>
      </div>
      
      <!-- Standard Users Card -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center">
          <div class="p-3 rounded-xl bg-green-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">Standard Users</p>
            <h3 class="text-2xl font-bold text-gray-800">{{ tenantStore.standardUsersCount }}</h3>
          </div>
        </div>
      </div>
      
      <!-- Monitoring Users Card -->
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition-all duration-200 hover:shadow-lg">
        <div class="flex items-center">
          <div class="p-3 rounded-xl bg-blue-100 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">Monitoring Users</p>
            <h3 class="text-2xl font-bold text-gray-800">{{ tenantStore.monitoringUsersCount }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="tenantStore.isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error Message -->
    <div v-else-if="tenantStore.error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
      <p>{{ tenantStore.error }}</p>
      <button 
        @click="fetchUsers" 
        class="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
      >
        Try Again
      </button>
    </div>

    <!-- User Management Table -->
    <div v-else class="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100 transition-all duration-200 hover:shadow-lg">
      <UserManagementTable 
        :users="tenantStore.users" 
        @update-user="updateUser"
        @toggle-status="toggleUserStatus"
      />
    </div>

    <!-- Create User Modal -->
    <CreateUserModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @create="createUser"
    />
    
    <!-- Toast Notification -->
    <div v-if="toast.show" class="fixed bottom-4 right-4 bg-white shadow-lg rounded-xl p-4 max-w-md border-l-4 z-50" :class="toast.type === 'success' ? 'border-green-500' : 'border-red-500'">
      <div class="flex items-center">
        <div v-if="toast.type === 'success'" class="mr-3 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div v-else class="mr-3 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p>{{ toast.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTenantStore } from '@/stores/tenant';
import UserManagementTable from '@/components/tenant/UserManagementTable.vue';
import CreateUserModal from '@/components/tenant/CreateUserModal.vue';

// Composables
const router = useRouter();
const authStore = useAuthStore();
const tenantStore = useTenantStore();

// State
const showCreateModal = ref(false);
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

// Helper to get current tenant ID - FIXED to prioritize localStorage value
const getCurrentTenantId = () => {
  // 1️⃣ Auth store (source of truth)
  if (authStore.currentTenantId) {
    return authStore.currentTenantId;
  }

  // 2️⃣ Local storage fallback
  const storedTenantId = localStorage.getItem('current_tenant_id');
  if (storedTenantId) {
    return Number(storedTenantId);
  }

  // 3️⃣ Hard fail instead of silent bug
  throw new Error('Tenant ID not found. User must re-login.');
};

// Fetch users on component mount
const fetchUsers = async () => {
  try {
    console.log('Fetching users...');
    const tenantId = getCurrentTenantId();
    console.log(`Using tenant ID: ${tenantId}`);
    await tenantStore.fetchUsers(tenantId);
  } catch (error) {
    showToast('Failed to fetch users: ' + (error.message || 'Unknown error'), 'error');
  }
};

onMounted(fetchUsers);

// Handle user creation/update
const createUser = async (userData) => {
  try {
    const result = await tenantStore.createOrUpdateUser(userData);
    
    // Check if the user already existed in this tenant
    const isUpdate = tenantStore.users.some(u => 
      u.email === userData.email && 
      u.id !== result.id
    );
    
    showToast(
      isUpdate 
        ? `User ${userData.email} reassigned to ${userData.role} role successfully` 
        : 'User created and assigned to this tenant successfully',
      'success'
    );
    
    showCreateModal.value = false;
  } catch (error) {
    showToast('Error creating user: ' + (error.message || 'Unknown error'), 'error');
  }
};

// Handle user updates from the table component
const updateUser = async (userData) => {
  try {
    console.log('Parent received update user event:', userData);
    const tenantId = getCurrentTenantId();
    console.log(`Updating user with tenant ID: ${tenantId}`);
    
    // Update user in the backend
    await tenantStore.updateUser(tenantId, userData);
    
    // Show success toast
    showToast(`User ${userData.name} updated successfully`, 'success');
  } catch (error) {
    console.error('Error updating user:', error);
    showToast('Error updating user: ' + (error.message || 'Unknown error'), 'error');
  }
};

// Handle user status toggle
const toggleUserStatus = async ({ userId, status }) => {
  try {
    console.log(`Toggling status for user ${userId} to ${status}`);
    const tenantId = getCurrentTenantId();
    
    // Call the store method to toggle status
    await tenantStore.toggleUserStatus(tenantId, userId, status);
    
    // Show success toast
    showToast(`User status updated to ${status}`, 'success');
  } catch (error) {
    console.error('Error toggling user status:', error);
    showToast('Error updating user status: ' + (error.message || 'Unknown error'), 'error');
  }
};

// Display toast notification
const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type
  };
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};
</script>

<style scoped>
/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>