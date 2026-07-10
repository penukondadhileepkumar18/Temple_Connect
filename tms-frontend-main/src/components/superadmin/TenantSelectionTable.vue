<template>
  <div class="tenant-selection-container">
    <!-- Header and Search -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-medium">Select Tenant to Assign</h3>
      <div class="relative w-64">
        <input
          v-model="searchQuery"
          placeholder="Search tenants..."
          type="search"
          class="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Selected Tenant Info -->
    <div v-if="selectedTenantId" class="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
      Selected Tenant ID: {{ selectedTenantId }} (Type: {{ typeof selectedTenantId }})
    </div>

    <!-- Error & Success Messages -->
    <div v-if="assignError" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 
            1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 
            1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 
            00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Assignment Failed</h3>
          <p class="text-sm text-red-700 mt-1">{{ assignError }}</p>
          <button @click="clearError" class="text-sm text-red-600 underline mt-2">Dismiss</button>
        </div>
      </div>
    </div>
    <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Success</h3>
          <p class="text-sm text-green-700 mt-1">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-10 flex justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Tenant Table -->
    <div v-else-if="filteredTenants.length === 0" class="text-center py-8">
      <p class="text-gray-500">{{ tenants.length === 0 ? 'No tenants available' : 'No tenants match your search' }}</p>
      <button @click="refreshTenants" class="mt-2 text-indigo-600 hover:text-indigo-800 underline">Refresh Tenants</button>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temple Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="tenant in filteredTenants" :key="`tenant-${tenant.id}`" :class="{ 'bg-indigo-50': selectedTenantId === tenant.id }" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input type="radio" name="selectedTenant" :value="tenant.id" v-model="selectedTenantId" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" @change="onTenantSelect(tenant.id)" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{{ tenant.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ tenant.tenantName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ tenant.templeName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ tenant.templeAddress }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': tenant.status === 'active' || tenant.status === 'approved',
                  'bg-yellow-100 text-yellow-800': tenant.status === 'pending',
                  'bg-red-100 text-red-800': tenant.status === 'inactive' || tenant.status === 'rejected'
                }">
                {{ tenant.status || 'active' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Action Buttons -->
    <div class="mt-6 flex justify-end space-x-3">
      <button @click="$emit('cancel')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
      <button @click="assignSelected" :disabled="!selectedTenantId || assigning" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="assigning" class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Assigning...
        </span>
        <span v-else>Assign Selected</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import superAdminService from '@/services/superadmin.service';

export default {
  name: 'TenantSelectionTable',
  props: { userId: { type: [String, Number], required: true } },
  emits: ['assign', 'cancel'],
  setup(props, { emit }) {
    const tenants = ref([]);
    const selectedTenantId = ref(null);
    const loading = ref(true);
    const assigning = ref(false);
    const searchQuery = ref('');
    const assignError = ref('');
    const successMessage = ref('');

    const fetchTenants = async () => {
      loading.value = true;
      assignError.value = '';
      try {
        const res = await superAdminService.getAssignableTenants();
        if (res && res.success && Array.isArray(res.data)) {
          tenants.value = res.data.map((tenant, index) => {
            const id = tenant.tenant_id || tenant.tenantId || tenant.id || tenant.userID || tenant.userId || tenant.user_id || index + 1;
            return {
              ...tenant,
              id,
              tenantName: tenant.tenantName || tenant.name || 'N/A',
              templeName: tenant.templeName || tenant.temple_name || 'N/A',
              templeAddress: tenant.templeAddress || tenant.temple_address || tenant.location || 'N/A',
              status: tenant.status || 'active',
              originalData: tenant
            };
          });
        } else {
          throw new Error(res?.message || 'Failed to fetch tenants');
        }
      } catch (err) {
        assignError.value = err.message || 'Failed to fetch tenants';
        tenants.value = [];
      } finally {
        loading.value = false;
      }
    };

    const filteredTenants = computed(() => {
      if (!searchQuery.value) return tenants.value;
      const q = searchQuery.value.toLowerCase();
      return tenants.value.filter(t =>
        String(t.id).toLowerCase().includes(q) ||
        (t.tenantName || '').toLowerCase().includes(q) ||
        (t.templeName || '').toLowerCase().includes(q) ||
        (t.templeAddress || '').toLowerCase().includes(q)
      );
    });

    const selectedTenantObject = computed(() => tenants.value.find(t => t.id === selectedTenantId.value));

    const onTenantSelect = (tenantId) => { selectedTenantId.value = tenantId; };

    const assignSelected = async () => {
      if (!selectedTenantId.value) return assignError.value = 'Please select a tenant';
      const tenant = selectedTenantObject.value;
      if (!tenant) return assignError.value = 'Invalid tenant selection';

      assigning.value = true;
      assignError.value = '';
      successMessage.value = '';
      try {
        const actualId = tenant.originalData?.tenant_id || tenant.originalData?.tenantId || tenant.id;
        const res = await superAdminService.assignUserToTenant(Number(props.userId), actualId);
        if (res?.success) {
          successMessage.value = res.message || 'User assigned successfully';
          emit('assign', { tenantId: actualId, tenant, userId: props.userId });
          selectedTenantId.value = null;
          setTimeout(() => { successMessage.value = ''; }, 3000);
        } else {
          assignError.value = res?.message || 'Assignment failed';
        }
      } catch (err) {
        assignError.value = err.response?.data?.message || err.message || 'Unexpected error';
      } finally {
        assigning.value = false;
      }
    };

    const clearError = () => { assignError.value = ''; };
    const refreshTenants = async () => { selectedTenantId.value = null; await fetchTenants(); };

    watch(() => props.userId, () => { selectedTenantId.value = null; assignError.value = ''; successMessage.value = ''; });

    onMounted(fetchTenants);

    return {
      tenants, selectedTenantId, filteredTenants, loading, assigning, searchQuery,
      assignError, successMessage, assignSelected, clearError, refreshTenants, onTenantSelect
    };
  }
};
</script>

<style scoped>
.tenant-selection-container { padding: 1rem; }
.tenant-selection-container tbody tr:hover { background-color: #f9fafb; }
.tenant-selection-container .bg-indigo-50 { background-color: #eef2ff !important; }
.tenant-selection-container table { border-radius: 0.5rem; overflow: hidden; }
.tenant-selection-container thead th { background-color: #f8fafc; font-weight: 600; }
.tenant-selection-container tbody td { vertical-align: middle; }
</style>
