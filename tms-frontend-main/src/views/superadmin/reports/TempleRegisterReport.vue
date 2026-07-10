<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back to SuperAdmin Reports button (when viewed from superadmin) -->
    <div v-if="fromSuperadmin" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <router-link 
        to="/superadmin/reports" 
        class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to SuperAdmin Reports
      </router-link>
    </div>

    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Temple Register Report</h1>
            <p class="text-gray-600 mt-1">
              Download registration data for your temples
              <span v-if="fromSuperadmin && tenantIds.length > 1" class="text-indigo-600 font-medium">
                (Multiple Tenants Selected: {{ tenantIds.length }})
              </span>
              <span v-else-if="effectiveTenantId" class="text-indigo-600 font-medium">
                (Tenant ID: {{ effectiveTenantId }})
              </span>
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
              <span class="text-indigo-800 font-medium">{{ userStore.user?.name || 'Tenant User' }}</span>
              <span class="text-indigo-600 text-sm ml-2">{{ fromSuperadmin ? '(Super Admin)' : '(Tenant)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading || isDownloading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span class="text-gray-900 font-medium">{{ isDownloading ? 'Downloading...' : 'Loading data...' }}</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
          </div>
          <div class="ml-auto pl-3">
            <button @click="clearError" class="text-red-400 hover:text-red-500">
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filter & Download Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Temple Register</h3>
          <p class="text-gray-600 mt-1">Configure filters and download your temple registration data</p>
        </div>

        <div class="p-6">
          <!-- Temple Selection -->
        
          

          <!-- Filter Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Registration Date Filter -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Registration Date</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="filter in timeFilters" 
                  :key="filter.value"
                  @click="setActiveFilter(filter.value)"
                  :disabled="loading"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="activeFilter === filter.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>

            <!-- Temple Status Filter -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Temple Status</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="status in statusFilters" 
                  :key="status.value"
                  @click="setActiveStatus(status.value)"
                  :disabled="loading"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="activeStatus === status.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div v-if="activeFilter === 'custom'" class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Start Date</label>
                <input 
                  type="date" 
                  v-model="startDate"
                  :disabled="loading"
                  :max="endDate"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                <input 
                  type="date" 
                  v-model="endDate"
                  :disabled="loading"
                  :min="startDate"
                  :max="today"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <!-- Download Section -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div class="mb-4 md:mb-0">
                <h4 class="text-lg font-medium text-gray-900">Download Report</h4>
                <p class="text-sm text-gray-600">Select a format and click download</p>
              </div>
              <div class="flex items-center space-x-3">
                <!-- Format Selection -->
                <div class="relative">
                  <select 
                    v-model="selectedFormat" 
                    :disabled="loading"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option v-for="format in formats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </select>
                </div>

                <!-- Download Button -->
                <button 
                  @click="downloadReport"
                  :disabled="loading || !isFormValid"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg v-if="isDownloading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ isDownloading ? 'Downloading...' : 'Download' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Applied Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Applied Filters</h3>
          
          <div class="flex flex-wrap gap-2">
            <div v-if="fromSuperadmin && tenantIds.length > 1" class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Tenants:</span>
              {{ tenantIds.length }} selected
            </div>
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Temple:</span>
              {{ selectedTemple === 'all' ? 'All Temples' : getTempleName(selectedTemple) }}
            </div>
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Period:</span>
              {{ getTimeFilterLabel(activeFilter) }}
              <span v-if="activeFilter === 'custom' && startDate && endDate">
                ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})
              </span>
            </div>
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Status:</span>
              {{ getStatusFilterLabel(activeStatus) }}
            </div>
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Format:</span>
              {{ getFormatLabel(selectedFormat) }}
            </div>
            <!-- Current Tenant ID Display -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800">
              <span class="font-medium mr-1">Tenant ID:</span>
              {{ effectiveTenantId }}
            </div>
          </div>

          <p class="mt-4 text-sm text-gray-600">
            Your report will include data based on the filters above. Click Download to generate and download the report.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTempleStore } from '@/stores/temple';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import ReportsService from '@/services/reports.service';
import templeService from '@/services/temple.service';
import api from '@/plugins/axios';

// Composables
const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();
const userStore = useAuthStore();
const { showToast } = useToast();

// Reactive state
const selectedTemple = ref('all');
const activeFilter = ref('weekly');
const activeStatus = ref('all');
const selectedFormat = ref('pdf');
const startDate = ref('');
const endDate = ref('');
const isDownloading = ref(false);
const errorMessage = ref('');
const loading = ref(false);

// Initialize dates
const initializeDates = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  endDate.value = today.toISOString().split('T')[0];
  startDate.value = weekAgo.toISOString().split('T')[0];
};

// Filter options
const timeFilters = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom Range', value: 'custom' },
];

const statusFilters = [
  { label: 'All Status', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
];

const formats = [
  { label: 'PDF', value: 'pdf' },
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
];

// Check for tenants parameter from superadmin
const fromSuperadmin = computed(() => route.query.from === 'superadmin');

const tenantIds = computed(() => {
  if (route.query.tenants) {
    return route.query.tenants.split(',').filter(id => id && id.trim());
  }
  return [];
});

// Fix the effective tenant ID computation
const effectiveTenantId = computed(() => {
  // Priority 1: If coming from superadmin with single tenant
  if (fromSuperadmin.value && tenantIds.value.length === 1) {
    return tenantIds.value[0];
  }
  
  // Priority 2: Current route tenant parameter
  if (route.params.tenantId) {
    return route.params.tenantId;
  }
  
  // Priority 3: User's assigned tenant from auth store
  if (userStore.user?.assignedTenantId) {
    return userStore.user.assignedTenantId.toString();
  }
  
  // Priority 4: Extract from localStorage tenant header
  const currentTenantId = localStorage.getItem('current_tenant_id');
  if (currentTenantId) {
    return currentTenantId;
  }
  
  // Priority 5: User ID as fallback (based on your working activities report)
  if (userStore.user?.id) {
    return userStore.user.id.toString();
  }
  
  console.warn('No tenant ID found, using fallback');
  return null;
});

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const isFormValid = computed(() => {
  if (activeFilter.value === 'custom') {
    return startDate.value && endDate.value && new Date(startDate.value) <= new Date(endDate.value);
  }
  return true;
});

// Filtered temples for dropdown (approved/active only)
const filteredTemples = computed(() => {
  if (!templeStore.temples || !Array.isArray(templeStore.temples)) {
    return [];
  }
  
  return templeStore.temples.filter(temple => {
    if (!temple) return false;
    const status = (temple.status || '').toLowerCase();
    return status === 'approved' || status === 'active';
  });
});

// Methods
const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  clearError();
  const today = new Date();
  const start = new Date();
  if (filter === 'weekly') start.setDate(today.getDate() - 7);
  else if (filter === 'monthly') start.setDate(today.getDate() - 30);
  else if (filter === 'yearly') start.setDate(today.getDate() - 365);
  if (filter !== 'custom') {
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = today.toISOString().split('T')[0];
  }
};

const setActiveStatus = (status) => {
  activeStatus.value = status;
  clearError();
};

const onTempleChange = () => {
  clearError();
};

const clearError = () => {
  errorMessage.value = '';
};

const getTempleName = (templeId) => {
  if (templeId === 'all') return 'All Temples';
  const temple = templeStore.temples.find(t => t?.id?.toString() === templeId?.toString());
  return temple ? temple.name : 'Unknown Temple';
};

const getTimeFilterLabel = (filter) => {
  const found = timeFilters.find(f => f.value === filter);
  return found ? found.label : 'Unknown';
};

const getStatusFilterLabel = (status) => {
  const found = statusFilters.find(s => s.value === status);
  return found ? found.label : 'Unknown';
};

const getFormatLabel = (format) => {
  const found = formats.find(f => f.value === format);
  return found ? found.label : 'Unknown';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString || '';
  }
};

// Build robust parameters for ReportsService
const buildReportParams = () => {
  try {
    if (!effectiveTenantId.value) {
      throw new Error('No valid tenant ID available for report generation');
    }

    const params = {
      dateRange: activeFilter.value || 'weekly',
      format: selectedFormat.value || 'pdf',
      startDate: startDate.value,
      endDate: endDate.value,
      isSuperAdmin: fromSuperadmin.value,
      tenantId: effectiveTenantId.value
    };

    // Set entity ID based on context
    if (fromSuperadmin.value) {
      if (tenantIds.value.length > 1) {
        params.entityIds = tenantIds.value;
        params.entityId = tenantIds.value[0]; // Use first as primary
      } else {
        params.entityId = effectiveTenantId.value;
      }
    } else {
      params.entityId = effectiveTenantId.value;
    }

    // CRITICAL: Set templeId properly
    // If "All Temples" is selected, set to 'all' (the service will handle not sending it to backend)
    // If specific temple is selected, use the temple ID
    if (selectedTemple.value === 'all') {
      params.templeId = 'all'; // Service layer will omit this from query params
    } else {
      params.templeId = selectedTemple.value.toString();
    }

    // Status filter
    if (activeStatus.value !== 'all') {
      params.status = activeStatus.value;
    }

    console.log('Built temple register report params:', params);
    return params;
  } catch (error) {
    console.error('Error building report params:', error);
    throw error;
  }
};

const fetchTemples = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    if (!effectiveTenantId.value) {
      throw new Error('No tenant ID available to fetch temples');
    }

    console.log('Fetching temples for tenant ID:', effectiveTenantId.value);
    
    // Clear existing temples first
    templeStore.clearTempleData();
    
    // For superadmin with multiple tenants
    if (fromSuperadmin.value && tenantIds.value.length > 1) {
      console.log(`Fetching temples for ${tenantIds.value.length} tenants:`, tenantIds.value);
      const allTemples = [];
      
      for (const tenantId of tenantIds.value) {
        try {
          const temples = await fetchTemplesForTenant(tenantId);
          allTemples.push(...temples);
        } catch (err) {
          console.warn(`Failed to fetch temples for tenant ${tenantId}:`, err);
        }
      }
      
      templeStore.temples = allTemples;
      console.log(`Set ${templeStore.temples.length} total temples for ${tenantIds.value.length} tenants`);
    } 
    // Single tenant case
    else {
      const tenantId = effectiveTenantId.value;
      console.log(`Fetching temples for single tenant ${tenantId}`);
      
      // Use the working approach - direct API call with proper filtering
      try {
        const response = await api.get(`/entities`);
        let allEntities = [];
        
        if (response.data && Array.isArray(response.data)) {
          allEntities = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          allEntities = response.data.data;
        }
        
        // Filter entities by the correct tenant ID
        const filteredTemples = allEntities.filter(temple => {
          return String(temple.created_by) === String(tenantId) || 
                 String(temple.tenant_id) === String(tenantId);
        });
        
        console.log(`Filtered ${filteredTemples.length} temples from ${allEntities.length} total entities for tenant ${tenantId}`);
        
        // Set the filtered temples in the store
        templeStore.temples = filteredTemples.map(temple => templeService.normalizeTempleData(temple));
        
        if (templeStore.temples.length === 0) {
          console.warn(`No temples found for tenant ID ${tenantId}`);
          errorMessage.value = `No temples found for tenant ID ${tenantId}. Please verify tenant access.`;
        }
      } catch (apiError) {
        console.error('Error fetching entities directly:', apiError);
        
        // Fallback to store method
        console.log('Using store method as fallback');
        try {
          if (fromSuperadmin.value) {
            await templeStore.fetchTemplesForSuperAdmin(tenantId);
          } else {
            await templeStore.fetchTemples(tenantId);
          }
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          errorMessage.value = `Failed to load temples: ${fallbackError.message}`;
        }
      }
    }
    
    console.log(`Successfully loaded ${templeStore.temples.length} temples for tenant ${effectiveTenantId.value}`);
    
  } catch (err) {
    console.error('Error in fetchTemples:', err);
    errorMessage.value = `Failed to load temples: ${err.message}`;
    showToast(`Failed to load temple data: ${err.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

// Helper function to fetch temples for a single tenant
const fetchTemplesForTenant = async (tenantId) => {
  try {
    console.log(`Fetching temples for tenant ${tenantId}`);
    
    const response = await api.get('/entities');
    let allEntities = [];
    
    if (response.data && Array.isArray(response.data)) {
      allEntities = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      allEntities = response.data.data;
    }
    
    // Filter entities by tenant ID using multiple possible fields
    const temples = allEntities.filter(temple => 
      String(temple.created_by) === String(tenantId) || 
      String(temple.tenant_id) === String(tenantId)
    );
    
    console.log(`Found ${temples.length} temples for tenant ${tenantId}`);
    return temples.map(temple => templeService.normalizeTempleData(temple));
    
  } catch (err) {
    console.error(`Error fetching temples for tenant ${tenantId}:`, err);
    return [];
  }
};

const downloadReport = async () => {
  if (isDownloading.value || !isFormValid.value) return;
  
  clearError();
  isDownloading.value = true;

  try {
    if (!effectiveTenantId.value) {
      throw new Error('No valid tenant ID available for download');
    }

    const params = buildReportParams();

    const validation = ReportsService.validateReportParams({
      ...params,
      type: 'temple-registered'
    });
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    console.log('Downloading temple register report with params:', params);
    const result = await ReportsService.downloadTempleRegisteredReport(params);
    showToast(`Temple Register Report downloaded successfully: ${result.filename || 'report.pdf'}`, 'success');
  } catch (error) {
    console.error('Download failed:', error);
    let errorMsg = 'Failed to download report. Please try again.';
    if (error.message?.toLowerCase().includes('network error')) {
      errorMsg = 'Network error. Please check your connection and try again.';
    } else if (error.response?.status === 404) {
      errorMsg = 'Report endpoint not found. The report may not be available for this configuration.';
    } else if (error.response?.status === 403) {
      errorMsg = 'You do not have permission to download this report.';
    } else if (error.response?.status === 400) {
      errorMsg = 'Invalid report parameters. Please check your selections.';
    } else if (error.message) {
      errorMsg = error.message;
    }
    errorMessage.value = errorMsg;
    showToast(`Download failed: ${errorMsg}`, 'error');
  } finally {
    isDownloading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  console.log('Temple Register Report mounted');
  console.log('fromSuperadmin:', fromSuperadmin.value);
  console.log('Tenant IDs from URL:', tenantIds.value);
  console.log('Effective tenant ID:', effectiveTenantId.value);
  console.log('Route params:', route.params);
  console.log('User store:', userStore.user);
  
  initializeDates();
  
  // Validate tenant ID before proceeding
  if (!effectiveTenantId.value) {
    errorMessage.value = 'No valid tenant ID found. Please check your access permissions.';
    return;
  }
  
  // Always clear temple data first before fetching
  templeStore.clearTempleData();
  
  // Then fetch temples fresh
  await fetchTemples();
});

// Watch for changes in effectiveTenantId
watch(effectiveTenantId, async (newVal, oldVal) => {
  if (newVal !== oldVal && newVal) {
    console.log('Tenant ID changed, refetching temples:', newVal);
    templeStore.clearTempleData();
    await fetchTemples();
  }
});

// Watch for route changes
watch(() => route.params.tenantId, async (newTenantId, oldTenantId) => {
  if (newTenantId !== oldTenantId && newTenantId) {
    console.log('Route tenant ID changed:', newTenantId);
    templeStore.clearTempleData();
    await fetchTemples();
  }
});

// React to tenant multi-select changes
watch(() => route.query.tenants, async (newTenants, oldTenants) => {
  if (newTenants !== oldTenants && newTenants) {
    console.log('Query tenants changed:', newTenants);
    templeStore.clearTempleData();
    await fetchTemples();
    selectedTemple.value = 'all';
  }
});
</script>
