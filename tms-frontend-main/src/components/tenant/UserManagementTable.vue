<template>
  <div>
    <!-- Search & Filter -->
    <div class="mb-4 flex flex-col md:flex-row gap-4">
      <div class="relative flex-grow">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Search users..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        />
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div class="w-full md:w-48">
        <select
          v-model="roleFilter"
          class="w-full py-2 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        >
          <option value="">All Roles</option>
          <option value="StandardUser">Standard User</option>
          <option value="MonitoringUser">Monitoring User</option>
        </select>
      </div>
    </div>

    <!-- User Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ user.phone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="user.role === 'StandardUser' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
              >
                {{ formatRole(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <!-- Status Toggle -->
              <div class="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  :id="`toggle-${user.id}`" 
                  :checked="user.status === 'active'" 
                  class="sr-only peer"
                />
                <div 
                  @click="toggleUserStatus(user)"
                  class="block w-10 h-6 rounded-full bg-gray-200 cursor-pointer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                ></div>
              </div>
              <label :for="`toggle-${user.id}`" class="text-xs text-gray-700">
                {{ user.status === 'active' ? 'Active' : 'Inactive' }}
              </label>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="editUser(user)" 
                type="button"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              No users found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showEditModal = false"></div>
        
        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Edit User
                </h3>
                <div class="mt-4 space-y-4">
                  <!-- Name -->
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      v-model="editedUser.name" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <!-- Email -->
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      v-model="editedUser.email" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <!-- Phone -->
                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                    <input 
                      type="text" 
                      id="phone" 
                      v-model="editedUser.phone" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <!-- Role -->
                  <div>
                    <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                      id="role" 
                      v-model="editedUser.role" 
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="StandardUser">Standard User</option>
                      <option value="MonitoringUser">Monitoring User</option>
                    </select>
                  </div>
                  
                  <!-- Status -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <div class="mt-2">
                      <label class="inline-flex items-center">
                        <input 
                          type="radio" 
                          v-model="editedUser.status" 
                          value="active" 
                          class="form-radio h-4 w-4 text-indigo-600"
                        />
                        <span class="ml-2 text-gray-700">Active</span>
                      </label>
                      <label class="inline-flex items-center ml-6">
                        <input 
                          type="radio" 
                          v-model="editedUser.status" 
                          value="inactive" 
                          class="form-radio h-4 w-4 text-red-600"
                        />
                        <span class="ml-2 text-gray-700">Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modal footer -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="saveUserChanges" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save
            </button>
            <button 
              type="button" 
              @click="showEditModal = false" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useToast } from '@/composables/useToast';

// Props
const props = defineProps({
  users: {
    type: Array,
    required: true
  }
});

// Emits
const emit = defineEmits(['update-user', 'toggle-status']);

// Composables
const { showToast } = useToast();

// State
const searchTerm = ref('');
const roleFilter = ref('');
const showEditModal = ref(false);
const editedUser = reactive({
  id: null,
  name: '',
  email: '',
  phone: '',
  role: '',
  status: 'active',
  password: 'password123' // Default password for updates
});

// Computed
const filteredUsers = computed(() => {
  return props.users.filter(user => {
    // Filter by search term
    const searchMatch = searchTerm.value === '' || 
      user.name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm.value));
    
    // Filter by role
    const roleMatch = roleFilter.value === '' || user.role === roleFilter.value;
    
    // Both filters must match
    return searchMatch && roleMatch;
  });
});

// Methods
const formatRole = (role) => {
  if (role === 'StandardUser') return 'Standard User';
  if (role === 'MonitoringUser') return 'Monitoring User';
  return role;
};

const editUser = (user) => {
  console.log('Editing user:', user);
  // Clone user data to avoid direct mutation
  editedUser.id = user.id;
  editedUser.name = user.name || '';
  editedUser.email = user.email || '';
  editedUser.phone = user.phone || '';
  editedUser.role = user.role || 'StandardUser';
  editedUser.status = user.status || 'active';
  editedUser.password = 'password123'; // Default password for updates
  
  // Show edit modal
  showEditModal.value = true;
};

const saveUserChanges = async () => {
  try {
    console.log('Saving user changes:', editedUser);
    // Emit event to parent component to handle the update
    emit('update-user', { ...editedUser });
    
    // Close modal
    showEditModal.value = false;
    
    // Show success message
    showToast('User updated successfully', 'success');
  } catch (error) {
    console.error('Error updating user:', error);
    showToast('Failed to update user', 'error');
  }
};

const toggleUserStatus = async (user) => {
  try {
    // Calculate new status (toggle from current)
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    console.log(`Toggling user ${user.id} status from ${user.status} to ${newStatus}`);
    
    // Emit a specific status toggle event
    emit('toggle-status', {
      userId: user.id,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    showToast('Failed to update user status', 'error');
  }
};
</script>