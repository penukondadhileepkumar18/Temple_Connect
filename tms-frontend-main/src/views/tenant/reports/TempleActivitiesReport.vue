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
            <h1 class="text-2xl font-bold text-gray-900">Temple Activities Report</h1>
            <p class="text-gray-600 mt-1">
              Download event, seva, and booking activity data for your temples
              <span v-if="fromSuperadmin && tenantIds.length > 1" class="text-indigo-600 font-medium">
                (Multiple Tenants Selected)
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
    <div v-if="loading || reportsStore.loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span class="text-gray-900 font-medium">Loading data...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error || reportsStore.error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error || reportsStore.error }}</p>
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
          <h3 class="text-xl font-bold text-gray-900">Temple Activities</h3>
          <p class="text-gray-600 mt-1">Configure filters and download your temple activity data</p>
        </div>

        <div class="p-6">
          <!-- Temple Selection -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Select Temple</label>
            <div class="relative">
              <select 
                v-model="selectedTemple" 
                class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                @change="handleTempleChange"
              >
                <option value="all">All Temples</option>
                <option v-for="temple in templeStore.temples" :key="temple.id" :value="temple.id">
                  {{ temple.name }}
                </option>
              </select>
            </div>
            <div v-if="templeStore.temples.length === 0 && !loading" class="mt-2 text-sm text-amber-600">
              No temples found for tenant ID {{ effectiveTenantId }}. Please verify tenant access.
            </div>
            <div v-else class="mt-2 text-sm text-gray-500">
              Found {{ templeStore.temples.length }} temples for tenant {{ effectiveTenantId }}
              <span v-if="selectedTemple === 'all'" class="text-indigo-600 font-medium ml-2">
                (Temple names will be included in the report)
              </span>
            </div>
          </div>

          <!-- Activity Type Selection -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Activity Type</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="type in activityTypes" 
                :key="type.value"
                @click="setActivityType(type.value)"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="activityType === type.value ? 
                  'bg-indigo-600 text-white' : 
                  'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Filter Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Date Range Filter -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Date Range</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="filter in timeFilters" 
                  :key="filter.value"
                  @click="setActiveFilter(filter.value)"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  :class="activeFilter === filter.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ filter.label }}
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
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  @change="handleDateChange"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                <input 
                  type="date" 
                  v-model="endDate"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  @change="handleDateChange"
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
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option v-for="format in formats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </select>
                </div>

                <!-- Download Button -->
                <button 
                  @click="downloadReport"
                  :disabled="reportsStore.downloadLoading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="reportsStore.downloadLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ reportsStore.downloadLoading ? 'Downloading...' : 'Download' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Applied Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Applied Filters</h3>
          
          <div class="flex flex-wrap gap-2">
            <!-- Tenant Filter -->
            <div v-if="fromSuperadmin && tenantIds.length > 1" class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Tenants:</span>
              {{ tenantIds.length }} selected
            </div>
            
            <!-- Temple Filter -->
            <div v-else class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Temple:</span>
              {{ selectedTemple === 'all' ? 'All Temples' : getTempleName(selectedTemple) }}
              <span v-if="selectedTemple === 'all'" class="ml-1 text-xs bg-indigo-200 px-2 py-0.5 rounded">
                +Temple Names
              </span>
            </div>
            
            <!-- Activity Type Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Activity:</span>
              {{ getActivityTypeLabel(activityType) }}
            </div>
            
            <!-- Date Range Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Period:</span>
              {{ getTimeFilterLabel(activeFilter) }}
              <span v-if="activeFilter === 'custom'">
                ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})
              </span>
            </div>
            
            <!-- Format -->
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
            Your report will include data based on the filters above. 
            <span v-if="shouldShowTempleName" class="text-indigo-600 font-medium">
              Temple names will be included in all report formats.
            </span>
            Click Download to generate and download the report.
          </p>
        </div>
      </div>

      <!-- Report Preview -->
      <div v-if="reportsStore.hasReportData" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Report Preview</h3>
          <p class="text-gray-600 mt-1">
            Showing {{ previewRows.length }} of {{ reportsStore.reportPreview?.totalRecords || 0 }} records
            <span v-if="shouldShowTempleName" class="text-indigo-600 font-medium ml-2">
              (Including temple names)
            </span>
          </p>
        </div>

        <div class="overflow-x-auto">
          <table v-if="tableColumns.length" class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  v-for="column in tableColumns" 
                  :key="column.key" 
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(row, i) in previewRows" :key="i">
                <td 
                  v-for="column in tableColumns" 
                  :key="column.key" 
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {{ formatCellValue(row, column.key) }}
                </td>
              </tr>
              <tr v-if="previewRows.length === 0">
                <td 
                  :colspan="tableColumns.length" 
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  No data available for the selected filters
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="p-6 text-center text-gray-500">
            No data available for preview
          </div>
        </div>

        <div v-if="reportsStore.reportPreview?.data?.length > 5" class="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <p class="text-sm text-gray-600">
            Showing 5 of {{ reportsStore.reportPreview.totalRecords }} records. Download the full report to see all data.
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
import { useReportsStore } from '@/stores/reports';
import { useToast } from '@/composables/useToast';
import { useSuperAdminService } from '@/composables/useSuperAdminService';
import templeService from '@/services/temple.service';
import api from '@/plugins/axios';

// Composables
const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();
const userStore = useAuthStore();
const reportsStore = useReportsStore();
const { showToast } = useToast();
const { fetchTenantReportPreview, downloadTenantReport, getTenantEntityDetails } = useSuperAdminService();

// Reactive state
const selectedTemple = ref('all');
const activityType = ref('events');
const activeFilter = ref('monthly');
const selectedFormat = ref('pdf');
const startDate = ref(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(false);
const error = ref(null);

// Filter options
const activityTypes = [
  { label: 'Events Report', value: 'events' },
  { label: 'Seva Reports', value: 'sevas' },
  { label: 'Seva Bookings', value: 'bookings' },
  { label: 'Donations Reports', value: 'donations' },
];

const timeFilters = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom Range', value: 'custom' },
];

const formats = [
  { label: 'PDF', value: 'pdf' },
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
];

// Report column definitions for each type
const reportColumnDefinitions = {
  events: [
    { key: 'title', label: 'Title' },
    { key: 'temple_name', label: 'Temple' },
    { key: 'event_type', label: 'Type' },
    { key: 'event_date', label: 'Date' },
    { key: 'location', label: 'Location' },
    { key: 'is_active', label: 'Status' }
  ],
  sevas: [
    { key: 'name', label: 'Seva Name' },
    { key: 'temple_name', label: 'Temple' },
    { key: 'seva_type', label: 'Type' },
    { key: 'price', label: 'Price' },
    { key: 'start_time', label: 'Start Time' },
    { key: 'status', label: 'Status' }
  ],
  bookings: [
    { key: 'seva_name', label: 'Seva' },
    { key: 'temple_name', label: 'Temple' },
    { key: 'devotee_name', label: 'Devotee' },
    { key: 'booking_time', label: 'Booking Time' },
    { key: 'status', label: 'Status' }
  ],
  donations: [
    { key: 'donor_name', label: 'Donor' },
    { key: 'temple_name', label: 'Temple' },
    { key: 'amount', label: 'Amount' },
    { key: 'donation_type', label: 'Type' },
    { key: 'donation_date', label: 'Date' },
    { key: 'status', label: 'Status' }
  ]
};

// Check if user is super admin
const isSuperAdmin = computed(() => {
  const role = userStore.user?.role || userStore.user?.roleName;
  const roleId = userStore.user?.roleId;
  
  // Check by role name
  if (role === 'super_admin' || role === 'superadmin') {
    return true;
  }
  
  // Check by roleId (1 = superadmin in your system)
  if (roleId === 1) {
    return true;
  }
  
  return false;
});
// Check for tenants parameter from superadmin
const fromSuperadmin = computed(() => {
  return route.query.from === 'superadmin' || isSuperAdmin.value;
});

const tenantIds = computed(() => {
  if (route.query.tenants) {
    return route.query.tenants.split(',');
  }
  return [];
});

const effectiveTenantId = computed(() => {
  if (fromSuperadmin.value && tenantIds.value.length === 1) {
    return tenantIds.value[0];
  }
  
  if (route.params.tenantId) {
    return route.params.tenantId;
  }
  
  if (userStore.user?.assignedTenantId) {
    return userStore.user.assignedTenantId.toString();
  }
  
  const currentTenantId = localStorage.getItem('current_tenant_id');
  if (currentTenantId) {
    return currentTenantId;
  }
  
  return null;
});

const shouldShowTempleName = computed(() => {
  return selectedTemple.value === 'all' || 
         (fromSuperadmin.value && tenantIds.value.length > 1);
});

const tableColumns = computed(() => {
  if (reportColumnDefinitions[activityType.value]) {
    let columns = [...reportColumnDefinitions[activityType.value]];
    
    if (!shouldShowTempleName.value) {
      columns = columns.filter(col => col.key !== 'temple_name');
    }
    
    return columns;
  }
  
  if (reportsStore.reportPreview?.columns?.length) {
    return reportsStore.reportPreview.columns;
  }
  
  return [];
});

const previewRows = computed(() => {
  if (!reportsStore.reportPreview?.data) return [];
  
  const rawData = reportsStore.reportPreview.data.slice(0, 5);
  
  return rawData.map(row => {
    const formattedRow = { ...row };
    
    if (row.temple_id && !row.temple_name) {
      const temple = templeStore.temples.find(t => 
        t.id.toString() === row.temple_id.toString()
      );
      formattedRow.temple_name = temple ? temple.name : `Temple ${row.temple_id}`;
    }
    
    if (row.event_date) {
      formattedRow.event_date = formatDateTime(row.event_date, 'date');
    }
    if (row.donation_date) {
      formattedRow.donation_date = formatDateTime(row.donation_date, 'date');
    }
    
    if (row.start_time) {
      formattedRow.start_time = formatDateTime(row.start_time, 'time');
    }
    if (row.booking_time) {
      formattedRow.booking_time = formatDateTime(row.booking_time, 'datetime');
    }
    
    if (row.price) {
      formattedRow.price = formatCurrency(row.price);
    }
    if (row.amount) {
      formattedRow.amount = formatCurrency(row.amount);
    }
    
    if (row.is_active !== undefined) {
      formattedRow.is_active = row.is_active ? 'Active' : 'Inactive';
    }
    if (row.status) {
      formattedRow.status = capitalizeFirst(row.status);
    }
    
    return formattedRow;
  });
});

// Helper functions
const formatCellValue = (row, key) => {
  const value = row[key] || row[key.replace('_', '')];
  
  if (value === null || value === undefined) return '-';
  
  if (key.includes('date') && !key.includes('time')) {
    return formatDateTime(value, 'date');
  }
  
  if (key.includes('time')) {
    if (key === 'booking_time' || key.includes('datetime')) {
      return formatDateTime(value, 'datetime');
    }
    return formatDateTime(value, 'time');
  }
  
  if (key === 'price' || key === 'amount') {
    return formatCurrency(value);
  }
  
  if (key === 'is_active') {
    return value ? 'Active' : 'Inactive';
  }
  
  if (key === 'status') {
    return capitalizeFirst(value);
  }
  
  return value;
};

const formatDateTime = (value, type = 'datetime') => {
  if (!value) return '-';
  
  try {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) return value;
    
    if (type === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    if (type === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    if (type === 'datetime') {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return value;
  } catch (err) {
    console.error('Error formatting date/time:', err);
    return value;
  }
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return '-';
  
  try {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  } catch (err) {
    return `₹${value}`;
  }
};

const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Methods
const setActivityType = async (type) => {
  activityType.value = type;
  await loadReportPreview();
};

const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  
  if (filter !== 'custom') {
    const dateRange = reportsStore.getDefaultDateRange(filter);
    startDate.value = dateRange.startDate;
    endDate.value = dateRange.endDate;
  }
  
  loadReportPreview();
};

const handleTempleChange = () => {
  console.log('Temple changed to:', selectedTemple.value);
  loadReportPreview();
};

const handleDateChange = () => {
  if (activeFilter.value === 'custom') {
    loadReportPreview();
  }
};

const getTempleName = (templeId) => {
  if (templeId === 'all') return 'All Temples';
  const temple = templeStore.temples.find(t => t.id.toString() === templeId.toString());
  return temple ? temple.name : 'Unknown Temple';
};

const getActivityTypeLabel = (type) => {
  const found = activityTypes.find(t => t.value === type);
  return found ? found.label : 'Unknown';
};

const getTimeFilterLabel = (filter) => {
  const found = timeFilters.find(f => f.value === filter);
  return found ? found.label : 'Unknown';
};

const getFormatLabel = (format) => {
  const found = formats.find(f => f.value === format);
  return found ? found.label : 'Unknown';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const clearError = () => {
  error.value = null;
  reportsStore.clearError();
};

const loadReportPreview = async () => {
  try {
    if (!effectiveTenantId.value && !fromSuperadmin.value && !isSuperAdmin.value) {
      throw new Error('No valid tenant ID available');
    }

    console.log('User type - fromSuperadmin:', fromSuperadmin.value);
    console.log('User role:', userStore.user?.role || userStore.user?.roleName);
    console.log('isSuperAdmin:', isSuperAdmin.value);

    let params = {
      type: activityType.value,
      dateRange: activeFilter.value,
      startDate: startDate.value,
      endDate: endDate.value,
      includeTempleName: shouldShowTempleName.value
    };
    
    // FIXED: Superadmin should use superadmin endpoints
    if (isSuperAdmin.value) {
      console.log('SuperAdmin mode - using superadmin endpoints');
      params.isSuperAdmin = true;
      
      if (selectedTemple.value === 'all') {
        // SuperAdmin viewing all temples
        params.entityId = 'all';
      } else {
        // SuperAdmin viewing specific temple
        params.entityId = selectedTemple.value;
      }
      
      // Include tenant context if available
      if (effectiveTenantId.value) {
        params.tenantId = effectiveTenantId.value;
      }
    } else {
      // Standard/Monitoring user
      console.log('Standard user mode');
      
      if (selectedTemple.value === 'all') {
        params.entityId = 'all';
        params.tenantId = effectiveTenantId.value;
      } else {
        params.entityId = selectedTemple.value;
        params.tenantId = effectiveTenantId.value;
        params.temple_Id = selectedTemple.value;
      }
    }
    
    console.log('Loading report preview with params:', params);
    await reportsStore.getReportPreview(params);
    
    console.log('Report preview loaded successfully:', reportsStore.reportPreview?.data?.length || 0, 'records');
  } catch (error) {
    console.error('Error loading report preview:', error);
    showToast(`Failed to load report preview: ${error.message}`, 'error');
  }
};

const fetchTemples = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Fetching temples for tenant ID:', effectiveTenantId.value);
    console.log('User type - fromSuperadmin:', fromSuperadmin.value);
    console.log('User role:', userStore.user?.role || userStore.user?.roleName);
    
    templeStore.clearTempleData();
    
    // FIXED: SuperAdmin can fetch all temples without tenant restriction
    if (fromSuperadmin.value || isSuperAdmin.value) {
      console.log('SuperAdmin - Fetching all temples');
      
      if (tenantIds.value.length > 1) {
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
      } else {
        // FIXED: SuperAdmin fetching all temples
        try {
          const response = await api.get('/superadmin/entities');
          let allEntities = [];
          
          if (response.data && Array.isArray(response.data)) {
            allEntities = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            allEntities = response.data.data;
          }
          
          console.log(`SuperAdmin: Fetched ${allEntities.length} total temples`);
          templeStore.temples = allEntities.map(temple => templeService.normalizeTempleData(temple));
        } catch (err) {
          console.error('Error fetching superadmin entities:', err);
          // Fallback to regular entities endpoint
          const response = await api.get('/entities');
          let allEntities = [];
          
          if (response.data && Array.isArray(response.data)) {
            allEntities = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            allEntities = response.data.data;
          }
          
          console.log(`SuperAdmin fallback: Fetched ${allEntities.length} temples`);
          templeStore.temples = allEntities.map(temple => templeService.normalizeTempleData(temple));
        }
      }
    } else {
      // Standard/Monitoring user
      if (!effectiveTenantId.value) {
        throw new Error('No tenant ID available to fetch temples');
      }
      
      const tenantId = effectiveTenantId.value;
      console.log(`Fetching temples for single tenant ${tenantId}`);
      
      try {
        const response = await api.get(`/entities`);
        let allEntities = [];
        
        if (response.data && Array.isArray(response.data)) {
          allEntities = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          allEntities = response.data.data;
        }
        
        console.log(`Fetched ${allEntities.length} total entities from API`);
        
        // FIXED: Filter temples that belong to this tenant
        const filteredTemples = allEntities.filter(temple => {
          return String(temple.created_by) === String(tenantId) || 
                 String(temple.tenant_id) === String(tenantId) ||
                 String(temple.id) === String(tenantId);
        });
        
        console.log(`Filtered ${filteredTemples.length} temples for tenant ${tenantId}`);
        
        templeStore.temples = filteredTemples.map(temple => templeService.normalizeTempleData(temple));
      } catch (apiError) {
        console.error('Error fetching entities directly:', apiError);
        
        console.log('Using store method as fallback');
        await templeStore.fetchTemples(tenantId);
      }
    }
    
    console.log(`Successfully loaded ${templeStore.temples.length} temples`);
    
    if (templeStore.temples.length === 0) {
      console.warn(`No temples found`);
      if (!fromSuperadmin.value && !isSuperAdmin.value) {
        error.value = `No temples found for tenant ID ${effectiveTenantId.value}. Please verify tenant access.`;
      }
    }
  } catch (err) {
    console.error('Error in fetchTemples:', err);
    error.value = `Failed to load temples: ${err.message}`;
    showToast(`Failed to load temple data: ${err.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

const fetchTemplesForTenant = async (tenantId) => {
  try {
    console.log(`Fetching temples for tenant ${tenantId}`);
    
    let temples = [];
    
    try {
      const response = await api.get('/entities');
      let allEntities = [];
      
      if (response.data && Array.isArray(response.data)) {
        allEntities = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        allEntities = response.data.data;
      }
      
      temples = allEntities.filter(temple => 
        String(temple.created_by) === String(tenantId) || 
        String(temple.tenant_id) === String(tenantId)
      );
      
      console.log(`Method 1: Found ${temples.length} temples for tenant ${tenantId}`);
      
      if (temples.length > 0) {
        return temples.map(temple => templeService.normalizeTempleData(temple));
      }
    } catch (err) {
      console.warn(`Method 1 failed for tenant ${tenantId}:`, err);
    }
    
    try {
      const response = await api.get(`/entities?tenant_id=${tenantId}`);
      let entities = [];
      
      if (response.data && Array.isArray(response.data)) {
        entities = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        entities = response.data.data;
      }
      
      console.log(`Method 2: Found ${entities.length} temples for tenant ${tenantId}`);
      
      if (entities.length > 0) {
        return entities.map(temple => templeService.normalizeTempleData(temple));
      }
    } catch (err) {
      console.warn(`Method 2 failed for tenant ${tenantId}:`, err);
    }
    
    console.warn(`No temples found for tenant ${tenantId} using any method`);
    return [];
  } catch (err) {
    console.error(`Error fetching temples for tenant ${tenantId}:`, err);
    return [];
  }
};

const downloadReport = async () => {
  try {
    if (!effectiveTenantId.value && !isSuperAdmin.value) {
      throw new Error('No valid tenant ID available for download');
    }

    let params = {
      type: activityType.value,
      dateRange: activeFilter.value,
      format: selectedFormat.value,
      startDate: startDate.value,
      endDate: endDate.value,
      includeTempleName: shouldShowTempleName.value
    };
    
    // FIXED: Superadmin downloads
    if (isSuperAdmin.value) {
      console.log('SuperAdmin download');
      params.isSuperAdmin = true;
      
      if (selectedTemple.value === 'all') {
        params.entityId = 'all';
      } else {
        params.entityId = selectedTemple.value;
      }
      
      if (effectiveTenantId.value) {
        params.tenantId = effectiveTenantId.value;
      }
    } else {
      // Standard user download
      if (selectedTemple.value === 'all') {
        params.entityId = 'all';
        params.tenantId = effectiveTenantId.value;
      } else {
        params.entityId = selectedTemple.value;
        params.tenantId = effectiveTenantId.value;
        params.temple_Id = selectedTemple.value;
      }
    }
    
    console.log('Downloading report with params:', params);
    const result = await reportsStore.downloadActivitiesReport(params);
    
    if (result && result.success) {
      showToast(`${getActivityTypeLabel(activityType.value)} downloaded successfully as ${getFormatLabel(selectedFormat.value)}`, 'success');
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    showToast(`Failed to download report: ${error.message}`, 'error');
  }
};
onMounted(async () => {
  console.log('TempleActivitiesReport mounted');
  console.log('fromSuperadmin:', fromSuperadmin.value);
  console.log('Tenant IDs from URL:', tenantIds.value);
  console.log('Effective tenant ID:', effectiveTenantId.value);
  console.log('Route params:', route.params);
  console.log('User store:', userStore.user);
  
  if (!effectiveTenantId.value && !fromSuperadmin.value && !isSuperAdmin.value) {
    error.value = 'No valid tenant ID found. Please check your access permissions.';
    return;
  }
  
  templeStore.clearTempleData();
  await fetchTemples();
  await loadReportPreview();
});

watch(effectiveTenantId, async (newVal, oldVal) => {
  if (newVal !== oldVal && newVal) {
    console.log('Tenant ID changed, refetching temples:', newVal);
    templeStore.clearTempleData();
    await fetchTemples();
    await loadReportPreview();
  }
});

watch(() => route.params.tenantId, async (newTenantId, oldTenantId) => {
  if (newTenantId !== oldTenantId && newTenantId) {
    console.log('Route tenant ID changed:', newTenantId);
    templeStore.clearTempleData();
    await fetchTemples();
    await loadReportPreview();
  }
});
</script>
