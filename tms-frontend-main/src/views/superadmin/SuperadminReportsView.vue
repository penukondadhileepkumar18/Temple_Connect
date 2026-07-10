<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Reports Management</h1>
            <p class="text-gray-600 mt-1">
              Select tenant to generate reports
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
              <span class="text-indigo-800 font-medium">Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Tenants Selection Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Select Tenant</h3>
              <p class="text-gray-600 mt-1">Choose tenant</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-lg font-medium text-gray-900">Tenant Selection</h4>
              </div>
              <div class="flex space-x-3">
                <button 
                  @click="retryFetchTenants" 
                  class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  :disabled="loading"
                >
                  {{ loading ? 'Loading...' : 'Retry Load' }}
                </button>
              </div>
            </div>
            
            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-4 mb-4">
              <div class="relative flex-1 min-w-[250px]">
                <input
                  v-model="searchQuery"
                  placeholder="Search tenants..."
                  type="search"
                  class="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div class="relative">
                <select 
                  v-model="statusFilter" 
                  class="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="inactive">InActive</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
            
            <!-- Error Display -->
            <div v-if="lastError && !loading" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-red-800">{{ lastError }}</p>
                  <button 
                    @click="retryFetchTenants" 
                    class="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Tenant List -->
            <div v-if="loading" class="py-10 flex justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
            <div v-else-if="!superAdminStore.tenants || superAdminStore.tenants.length === 0" class="text-center py-8">
              <div class="text-gray-400 mb-4">
                <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p class="text-gray-500 text-lg">No tenants available</p>
              <p class="text-gray-400 text-sm mt-2">Click "Retry Load" to fetch tenant data</p>
            </div>
            <div v-else-if="filteredTenants.length === 0" class="text-center py-8">
              <div class="text-gray-400 mb-4">
                <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p class="text-gray-500">No tenants found matching your filters</p>
              <button 
                @click="clearFilters" 
                class="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
            <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div class="flex items-center">
                        Select
                      </div>
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temple Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="tenant in filteredTenants" :key="getTenantId(tenant)" :class="{ 'bg-indigo-50': isSelected(getTenantId(tenant)) }">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <input
                        type="radio"
                        :checked="isSelected(getTenantId(tenant))"
                        @change="toggleSelect(getTenantId(tenant))"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ getTenantDisplayName(tenant) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getTempleNameDisplay(tenant) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ getLocationDisplay(tenant) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" 
                            :class="getStatusClass(tenant.status || tenant.Status)">
                        {{ tenant.status || tenant.Status || 'Unknown' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Report Type Selection -->
          <div class="mt-8 border-t border-gray-200 pt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Select Report Type</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                v-for="report in reportTypes" 
                :key="report.id"
                @click="selectReport(report.id)"
                :class="[
                  'border p-4 rounded-lg cursor-pointer transition-colors',
                  selectedReport === report.id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                ]"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 flex items-center justify-center rounded-lg" :class="report.bgColor">
                      <svg class="h-6 w-6" :class="report.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="report.icon" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h5 class="text-base font-medium text-gray-900">{{ report.name }}</h5>
                    <p class="mt-1 text-sm text-gray-500">{{ report.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Proceed Button -->
          <div class="mt-8 flex justify-end">
            <button 
              @click="proceedToReport"
              :disabled="!canProceed"
              class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Report
            </button>
          </div>
        </div>
      </div>
      
      <!-- Selection Summary -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Selection Summary</h3>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Selected Tenant:</span>
              {{ selectedTenants.length > 0 ? '1' : '0' }}
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Report Type:</span>
              {{ getReportName() }}
            </div>
          </div>
          
          <div v-if="selectedTenants.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Tenant:</h4>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tenantId in selectedTenants" 
                :key="tenantId"
                class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm bg-gray-100 text-gray-800"
              >
                {{ getTenantName(tenantId) }}
                <button 
                  @click="toggleSelect(tenantId)" 
                  class="ml-1.5 text-gray-500 hover:text-gray-700"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
          
          <p class="mt-4 text-sm text-gray-600">
            Select a tenant and a report type above, then click "Proceed to Report" to generate the report.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSuperAdminStore } from '@/stores/superadmin';
import { useToast } from '@/composables/useToast';
import superAdminService from '@/services/superadmin.service';

// Router and stores
const router = useRouter();
const superAdminStore = useSuperAdminStore();
const toast = useToast();

// Reactive state
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const selectedTenants = ref([]);
const selectedReport = ref('');
const lastError = ref('');

// Report types (removed devotee reports symbol)
const reportTypes = [
  {
    id: 'temple-register',
    name: 'Temple Register Report',
    description: 'View temple registration data for selected tenant',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    route: '/superadmin/reports/temple-register'
  },
  {
    id: 'temple-activities',
    name: 'Temple Activities Report',
    description: 'Track events, seva, and other temple activities',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    route: '/superadmin/reports/temple-activities'
  },
  {
    id: 'birthdays',
    name: 'Devotee Reports',
    description: 'View devotee birthdays, lists, and profiles',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    route: '/superadmin/reports/birthdays'
  }
];

// Temple data mapping for tenants
const tenantTempleMap = ref({});

// Computed properties
const filteredTenants = computed(() => {
  if (!superAdminStore.tenants || !Array.isArray(superAdminStore.tenants)) {
    return [];
  }
  
  let tenants = superAdminStore.tenants;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    tenants = tenants.filter(tenant => 
      tenant.name?.toLowerCase().includes(query) || 
      tenant.fullName?.toLowerCase().includes(query) ||
      tenant.FullName?.toLowerCase().includes(query) ||
      getTempleNameDisplay(tenant).toLowerCase().includes(query) ||
      getLocationDisplay(tenant).toLowerCase().includes(query)
    );
  }
  
  if (statusFilter.value !== 'all') {
    tenants = tenants.filter(tenant => 
      (tenant.status?.toLowerCase() === statusFilter.value.toLowerCase()) ||
      (tenant.Status?.toLowerCase() === statusFilter.value.toLowerCase())
    );
  }
  
  return tenants;
});

const canProceed = computed(() => {
  return selectedTenants.value.length > 0 && selectedReport.value;
});

// Helper function to get tenant ID
const getTenantId = (tenant) => {
  let id = null;
  if (tenant.id !== undefined) id = tenant.id;
  else if (tenant.ID !== undefined) id = tenant.ID;
  else if (tenant.tenant_id !== undefined) id = tenant.tenant_id;
  else if (tenant.tenantId !== undefined) id = tenant.tenantId;
  else if (tenant.userId !== undefined) id = tenant.userId;
  else if (tenant.user_id !== undefined) id = tenant.user_id;
  
  return normalizeId(id);
};

// Helper function to normalize IDs
const normalizeId = (id) => {
  if (id === undefined || id === null) {
    return null;
  }
  
  if (typeof id === 'number') {
    return id;
  }
  
  if (typeof id === 'string') {
    const numericStr = id.replace(/[^0-9]/g, '');
    if (numericStr && !isNaN(parseInt(numericStr, 10))) {
      return parseInt(numericStr, 10);
    }
  }
  
  return id;
};

// Utility methods
const getTenantDisplayName = (tenant) => {
  return tenant.fullName || tenant.FullName || tenant.name || tenant.Name || `Tenant #${getTenantId(tenant)}`;
};

const getTempleNameDisplay = (tenant) => {
  const tenantId = getTenantId(tenant);
  
  if (tenant.temple_details?.temple_name) {
    return tenant.temple_details.temple_name;
  }
  
  if (tenantTempleMap.value[tenantId]?.name) {
    return tenantTempleMap.value[tenantId].name;
  }
  
  if (tenant.temple?.name) return tenant.temple.name;
  if (tenant.temple?.Name) return tenant.temple.Name;
  if (tenant.Temple?.name) return tenant.Temple.name;
  if (tenant.Temple?.Name) return tenant.Temple.Name;
  if (tenant.templeName) return tenant.templeName;
  if (tenant.TemplateName) return tenant.TemplateName;
  
  return `${getTenantDisplayName(tenant)}'s Temple`;
};

const getLocationDisplay = (tenant) => {
  const tenantId = getTenantId(tenant);
  
  if (tenant.temple_details?.temple_place) {
    return tenant.temple_details.temple_place;
  }
  
  if (tenantTempleMap.value[tenantId]) {
    const templeInfo = tenantTempleMap.value[tenantId];
    if (templeInfo.city && templeInfo.state) {
      return `${templeInfo.city}, ${templeInfo.state}`;
    } else if (templeInfo.address) {
      return templeInfo.address;
    }
  }
  
  if (tenant.temple?.city && tenant.temple?.state) {
    return `${tenant.temple.city}, ${tenant.temple.state}`;
  }
  if (tenant.Temple?.City && tenant.Temple?.State) {
    return `${tenant.Temple.City}, ${tenant.Temple.State}`;
  }
  
  if (tenant.temple?.location) return tenant.temple.location;
  if (tenant.Temple?.Location) return tenant.Temple.Location;
  if (tenant.temple?.place) return tenant.temple.place;
  if (tenant.Temple?.Place) return tenant.Temple.Place;
  
  if (tenant.temple?.address) return tenant.temple.address;
  if (tenant.Temple?.Address) return tenant.Temple.Address;
  
  if (tenant.location) return tenant.location;
  if (tenant.Location) return tenant.Location;
  if (tenant.city && tenant.state) return `${tenant.city}, ${tenant.state}`;
  if (tenant.City && tenant.State) return `${tenant.City}, ${tenant.State}`;
  if (tenant.address) return tenant.address;
  if (tenant.Address) return tenant.Address;
  if (tenant.place) return tenant.place;
  if (tenant.Place) return tenant.Place;
  
  return "Location not available";
};

// Main fetch function
const fetchTenants = async () => {
  loading.value = true;
  lastError.value = '';
  
  try {
    console.log('Starting tenant fetch...');
    
    const response = await superAdminStore.fetchTenantsForReports();
    console.log('Store fetchTenantsForReports response:', response);
    
    if (response && response.success && superAdminStore.tenants && Array.isArray(superAdminStore.tenants) && superAdminStore.tenants.length > 0) {
      console.log('Successfully loaded tenants via store:', superAdminStore.tenants.length);
      
      processTenantsData();
      await fetchTempleDetailsForTenants();
    } else {
      console.log('Store method failed, trying basic fetchTenants...');
      
      await superAdminStore.fetchTenants();
      
      if (superAdminStore.tenants && Array.isArray(superAdminStore.tenants) && superAdminStore.tenants.length > 0) {
        console.log('Basic fetch successful:', superAdminStore.tenants.length);
        
        processTenantsData();
        await fetchTempleDetailsForTenants();
      } else {
        throw new Error('No tenants found in store after fetch attempts');
      }
    }
  } catch (error) {
    console.error('Error fetching tenants:', error);
    lastError.value = `Failed to load tenants: ${error.message}`;
    
    if (!superAdminStore.tenants) {
      superAdminStore.tenants = [];
    }
    
    toast.error('Failed to load tenants. Please check console for details.');
  } finally {
    loading.value = false;
  }
};

const processTenantsData = () => {
  if (!superAdminStore.tenants || !Array.isArray(superAdminStore.tenants)) return;
  
  if (superAdminStore.tenants.length > 0) {
    console.log('First tenant object:', superAdminStore.tenants[0]);
  }
  
  superAdminStore.tenants.forEach(tenant => {
    const tenantId = getTenantId(tenant);
    
    if (tenantId === null) {
      console.warn('Tenant has no valid ID:', tenant);
      return;
    }
    
    if (tenant.temple_details) {
      tenantTempleMap.value[tenantId] = {
        name: tenant.temple_details.temple_name || '',
        city: tenant.temple_details.temple_place ? tenant.temple_details.temple_place.split(',')[0]?.trim() : '',
        state: tenant.temple_details.temple_place ? tenant.temple_details.temple_place.split(',')[1]?.trim() : '',
        address: tenant.temple_details.temple_address || ''
      };
    }
    else if (tenant.temple) {
      tenantTempleMap.value[tenantId] = {
        name: tenant.temple.name || tenant.temple.Name || '',
        city: tenant.temple.city || tenant.temple.City || '',
        state: tenant.temple.state || tenant.temple.State || '',
        address: tenant.temple.address || tenant.temple.Address || ''
      };
    }
    else if (tenant.Temple) {
      tenantTempleMap.value[tenantId] = {
        name: tenant.Temple.name || tenant.Temple.Name || '',
        city: tenant.Temple.city || tenant.Temple.City || '',
        state: tenant.Temple.state || tenant.Temple.State || '',
        address: tenant.Temple.address || tenant.Temple.Address || ''
      };
    }
  });
  
  console.log(`Processed ${Object.keys(tenantTempleMap.value).length} temple data entries`);
};

const fetchTempleDetailsForTenants = async () => {
  if (!superAdminStore.tenants || !Array.isArray(superAdminStore.tenants)) {
    return;
  }
  
  const tenantsNeedingDetails = superAdminStore.tenants.filter(tenant => {
    const tenantId = getTenantId(tenant);
    return tenantId !== null && !tenant.temple && !tenant.Temple && !tenant.temple_details && !tenantTempleMap.value[tenantId];
  });
  
  if (tenantsNeedingDetails.length === 0) {
    console.log('All tenants already have temple details');
    return;
  }
  
  console.log(`Fetching temple details for ${tenantsNeedingDetails.length} tenants...`);
  
  const batchSize = 5;
  for (let i = 0; i < tenantsNeedingDetails.length; i += batchSize) {
    const batch = tenantsNeedingDetails.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (tenant) => {
      try {
        const tenantId = getTenantId(tenant);
        
        if (tenantId === null) return;
        
        if (typeof superAdminService.getTenantDetails === 'function') {
          const response = await superAdminService.getTenantDetails(tenantId);
          
          if (response && response.success && response.data) {
            const details = response.data;
            
            tenantTempleMap.value[tenantId] = {
              name: details.temple_name || details.templeName || details.TempleName || '',
              city: details.temple_place || details.templePlace || details.TemplePlace || '',
              state: details.temple_state || details.templeState || details.TempleState || '',
              address: details.temple_address || details.templeAddress || details.TempleAddress || ''
            };
            
            tenant.temple_details = {
              temple_name: tenantTempleMap.value[tenantId].name,
              temple_place: tenantTempleMap.value[tenantId].city + (tenantTempleMap.value[tenantId].state ? ', ' + tenantTempleMap.value[tenantId].state : ''),
              temple_address: tenantTempleMap.value[tenantId].address
            };
            
            console.log(`Updated temple details for tenant ${tenantId}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch temple details for tenant:`, error);
      }
    }));
    
    if (i + batchSize < tenantsNeedingDetails.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
 
  
  console.log(`Completed fetching temple details. Temple map has ${Object.keys(tenantTempleMap.value).length} entries.`);
};

// Selection methods - IMPROVED with better error handling
const isSelected = (tenantId) => {
  // Handle invalid IDs gracefully
  if (tenantId === null || tenantId === undefined) return false;
  
  const normalizedId = normalizeId(tenantId);
  return selectedTenants.value.some(id => normalizeId(id) === normalizedId);
};

const toggleSelect = (tenantId) => {
  // Handle invalid IDs gracefully
  if (tenantId === null || tenantId === undefined) {
    console.warn('Attempted to toggle selection with null/undefined ID');
    return;
  }
  
  const normalizedId = normalizeId(tenantId);
  const index = selectedTenants.value.findIndex(id => normalizeId(id) === normalizedId);
  
  if (index === -1) {
    selectedTenants.value.push(normalizedId);
    console.log(`Added tenant ${normalizedId} to selection, now have ${selectedTenants.value.length} selected`);
  } else {
    selectedTenants.value.splice(index, 1);
    console.log(`Removed tenant ${normalizedId} from selection, now have ${selectedTenants.value.length} selected`);
  }
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Deselect all filtered tenants
    selectedTenants.value = selectedTenants.value.filter(
      id => !filteredTenants.value.some(tenant => normalizeId(getTenantId(tenant)) === normalizeId(id))
    );
  } else {
    // Select all filtered tenants that are not already selected
    const newSelectedIds = filteredTenants.value
      .filter(tenant => !isSelected(getTenantId(tenant)))
      .map(tenant => normalizeId(getTenantId(tenant)))
      .filter(id => id !== null); // Filter out null IDs
    
    selectedTenants.value = [...selectedTenants.value, ...newSelectedIds];
  }
  console.log(`After toggle all, have ${selectedTenants.value.length} selected tenants`);
};

const selectAllTenants = () => {
  selectedTenants.value = filteredTenants.value
    .map(tenant => normalizeId(getTenantId(tenant)))
    .filter(id => id !== null); // Filter out null IDs
  
  console.log(`Selected all tenants: ${selectedTenants.value.length} total`);
};

const clearTenantSelection = () => { 
  selectedTenants.value = []; 
  console.log('Cleared tenant selection');
};

const clearFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
};

const selectReport = (reportId) => { 
  selectedReport.value = reportId; 
  console.log('Selected report:', reportId);
};

const retryFetchTenants = async () => {
  console.log('Retrying tenant fetch...');
  await fetchTenants();
};

const getStatusClass = (status) => {
  const statusMap = {
    'approved': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'rejected': 'bg-red-100 text-red-800',
    'active': 'bg-green-100 text-green-800'
  };
  return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const getTenantName = (tenantId) => {
  if (!superAdminStore.tenants || !Array.isArray(superAdminStore.tenants)) {
    return `Tenant #${tenantId}`;
  }
  
  // Normalize the ID for comparison
  const normalizedId = normalizeId(tenantId);
  
  // Find tenant by normalized ID
  const tenant = superAdminStore.tenants.find(t => normalizeId(getTenantId(t)) === normalizedId);
  return tenant ? getTenantDisplayName(tenant) : `Tenant #${tenantId}`;
};

const getReportName = () => {
  const report = reportTypes.find(r => r.id === selectedReport.value);
  return report ? report.name : 'None Selected';
};

// IMPROVED: proceedToReport function
const proceedToReport = () => {
  if (!canProceed.value) return;
  
  const report = reportTypes.find(r => r.id === selectedReport.value);
  if (!report) return;
  
  // Debug info - before processing
  console.log('Selected tenant IDs before processing:', selectedTenants.value);
  
  // Ensure all IDs are numbers where possible and non-null
  const processedIds = selectedTenants.value
    .map(id => normalizeId(id))
    .filter(id => id !== null);
    
  console.log('Processed tenant IDs:', processedIds);
  
  // Log numeric vs string IDs for debugging
  const numericIds = processedIds.filter(id => typeof id === 'number');
  const stringIds = processedIds.filter(id => typeof id === 'string');
  console.log(`ID types: ${numericIds.length} numeric, ${stringIds.length} string`);
  
  // Create comma-separated string of tenant IDs
  const tenantsParam = processedIds.join(',');
  console.log('Final tenants parameter string:', tenantsParam);
  
  if (!tenantsParam) {
    toast.error('No valid tenant IDs to include in report');
    return;
  }
  
  // Navigate to report with query params
  router.push({
    path: report.route,
    query: {
      tenants: tenantsParam,
      from: 'superadmin'
    }
  });
  
  // Log the final URL for debugging
  console.log('Navigating to:', `${report.route}?tenants=${tenantsParam}&from=superadmin`);
};

// Lifecycle hook
onMounted(async () => {
  console.log('Component mounted, fetching tenants...');
  await fetchTenants();
});
</script>