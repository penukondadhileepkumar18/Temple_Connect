<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back to SuperAdmin Reports button -->
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
            <h1 class="text-2xl font-bold text-gray-900">Devotee Reports</h1>
            <p class="text-gray-600 mt-1">
              Download devotee data for your temples
              <span v-if="fromSuperadmin && tenantIds.length > 1" class="text-indigo-600 font-medium">
                (Multiple Tenants: {{ tenantIds.length }} selected)
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
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span class="text-gray-900 font-medium">Loading data...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
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

    <!-- Debug Info -->
    <div v-if="debugMode" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm">
        <h4 class="font-medium text-yellow-800">Debug Info:</h4>
        <p><strong>From Superadmin:</strong> {{ fromSuperadmin }}</p>
        <p><strong>Effective Tenant ID:</strong> {{ effectiveTenantId }}</p>
        <p><strong>Tenant IDs:</strong> {{ JSON.stringify(tenantIds) }}</p>
        <p><strong>Selected Temple:</strong> {{ selectedTemple }}</p>
        <p><strong>Available Temples:</strong> {{ availableTemples.length }}</p>
        <p><strong>Route Query:</strong> {{ JSON.stringify(route.query) }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Report Type Selector -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Select Report Type</h3>
          <div class="flex space-x-4 flex-wrap gap-2">
            <button 
              @click="setReportType('birthdays')"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'birthdays' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Devotee Birthdays
            </button>
            <button 
              @click="setReportType('devotees')"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'devotees' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Devotee List
            </button>
            <button 
              @click="setReportType('statusActive')"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'statusActive' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Active Devotees  
            </button>
            <button 
              @click="setReportType('statusInactive')"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'statusInactive' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Inactive Devotees
            </button>
            <button 
              @click="setReportType('profile')"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'profile' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Devotee Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Filter & Download Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">
            {{ getReportTypeTitle() }}
          </h3>
          <p class="text-gray-600 mt-1">
            Configure filters and download {{ getReportTypeDescription() }}
          </p>
        </div>

        <div class="p-6">
          <!-- Temple Selection -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-gray-700 font-medium">Select Temple</label>
              <button 
                @click="manualRefreshTemples"
                :disabled="loading"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="mr-1 h-3 w-3" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ loading ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
            <div class="relative">
              <select 
                v-model="selectedTemple" 
                class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                @change="handleTempleChange"
                :disabled="loading"
              >
                <option value="all">All Temples</option>
                <option v-for="temple in availableTemples" :key="temple.id" :value="temple.id">
                 {{ temple.name }} 
                 <span v-if="temple.tenant_id" class="text-gray-500">(Tenant: {{ temple.tenant_id }})</span>
                </option>
              </select>
            </div>
            <div v-if="availableTemples.length === 0 && !loading" class="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
              <div class="flex items-center">
                <svg class="h-4 w-4 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                No temples found for selected tenant(s). Please check tenant access or try refreshing.
              </div>
            </div>
            <div v-else-if="availableTemples.length > 0" class="mt-2 text-sm text-green-600">
              {{ availableTemples.length }} temple{{ availableTemples.length !== 1 ? 's' : '' }} available
              <span v-if="fromSuperadmin && tenantIds.length > 1">
                across {{ tenantIds.length }} tenant{{ tenantIds.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Filter Section based on report type -->
          <div v-if="activeReportType === 'birthdays'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2">Birthday Period</label>
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
          </div>

          <div v-else-if="['devotees', 'statusActive', 'statusInactive'].includes(activeReportType)">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2">Join Date Period</label>
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
              
              <div v-if="activeReportType === 'devotees'">
                <label class="block text-gray-700 font-medium mb-2">Devotee Status</label>
                <div class="relative">
                  <select 
                    v-model="devoteeStatus" 
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="new">New Members</option>
                  </select>
                </div>
              </div>
              
              <div v-else-if="activeReportType === 'statusActive' || activeReportType === 'statusInactive'">
                <label class="block text-gray-700 font-medium mb-2">Status Filter</label>
                <div class="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                  <span class="text-gray-700">
                    {{ activeReportType === 'statusActive' ? 'Active Devotees Only' : 'Inactive Devotees Only' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeReportType === 'profile'">
            <p class="text-gray-600 mb-6">This report includes detailed profile information for devotees.</p>
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

                <button 
                  @click="downloadReport"
                  :disabled="isDownloading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isDownloading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Report Type:</span>
              {{ getReportTypeTitle() }}
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">
                {{ fromSuperadmin && tenantIds.length > 1 ? 'Tenants:' : 'Tenant:' }}
              </span>
              <span v-if="fromSuperadmin && tenantIds.length > 1">
                {{ tenantIds.length }} selected
              </span>
              <span v-else>
                {{ effectiveTenantId }}
              </span>
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Temple:</span>
              {{ selectedTemple === 'all' ? 'All Temples' : getTempleName(selectedTemple) }}
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Period:</span>
              {{ getTimeFilterLabel(activeFilter) }}
              <span v-if="activeFilter === 'custom'">
                ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})
              </span>
            </div>

            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Status:</span>
              {{ getActiveDevoteeStatusLabel() }}
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Format:</span>
              {{ getFormatLabel(selectedFormat) }}
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
import { useReportsStore } from '@/stores/reports';
import { useToast } from '@/composables/useToast';
import api from '@/plugins/axios';

// Composables & stores
const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();
const userStore = useAuthStore();
const reportsStore = useReportsStore();
const { showToast } = useToast();

// Reactive state
const activeReportType = ref('birthdays');
const selectedTemple = ref('all');
const activeFilter = ref('monthly');
const selectedFormat = ref('pdf');
const debugMode = ref(false); // Set to true for debugging

// Date initialization
const initializeDates = () => {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return {
    start: monthAgo.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  };
};

const { start: initialStartDate, end: initialEndDate } = initializeDates();
const startDate = ref(initialStartDate);
const endDate = ref(initialEndDate);
const devoteeStatus = ref('all');

const loading = ref(false);
const error = ref(null);
const allTemples = ref([]);
const isDownloading = ref(false);

// Time formatting utility functions
const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const dateStr = String(dateString).trim();
  
  if (dateStr.includes('0000-01-01') || 
      dateStr.includes('0001-01-01') ||
      dateStr.startsWith('0000-') || 
      dateStr.startsWith('0001-')) {
    return false;
  }
  
  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900;
  } catch {
    return false;
  }
};

const formatTime12Hour = (timeString) => {
  if (!timeString) return '';
  
  const timeStr = String(timeString).trim();
  
  if (timeStr.includes('0000-01-01') || 
      timeStr.includes('0001-01-01') ||
      timeStr.startsWith('0000-') || 
      timeStr.startsWith('0001-')) {
    return '';
  }
  
  try {
    let hours, minutes;
    
    if (timeStr.includes('T') || (timeStr.includes(' ') && timeStr.includes('-'))) {
      if (!isValidDate(timeStr)) {
        return '';
      }
      
      const date = new Date(timeStr);
      if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
        return '';
      }
      
      hours = date.getHours();
      minutes = date.getMinutes();
    } else if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      return '';
    }
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return '';
    }
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinutes} ${ampm}`;
  } catch (err) {
    return '';
  }
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const dateTimeStr = String(dateTimeString).trim();
  
  if (dateTimeStr.includes('0000-01-01') || 
      dateTimeStr.includes('0001-01-01') ||
      dateTimeStr.startsWith('0000-') || 
      dateTimeStr.startsWith('0001-')) {
    return '';
  }
  
  try {
    if (!isValidDate(dateTimeStr)) {
      return '';
    }
    
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
      return '';
    }
    
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    return '';
  }
};

// Options
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

// Role detection
const isSuperAdmin = computed(() => {
  const u = userStore?.user || {};
  const role = (u.role || u.userType || '').toString().toLowerCase();
  const roles = Array.isArray(u.roles) ? u.roles.map(r => (r || '').toString().toLowerCase()) : [];
  const flag = Boolean(u.isSuperAdmin || u.is_super_admin);
  return role === 'superadmin' || roles.includes('superadmin') || flag || route?.query?.from === 'superadmin';
});

const fromSuperadmin = computed(() => !!isSuperAdmin.value);

// Tenant resolution
const effectiveTenantId = computed(() => {
  if (fromSuperadmin.value && route.query.tenants) {
    const tenantList = String(route.query.tenants).split(',').filter(Boolean);
    if (tenantList.length > 1) {
      return null;
    } else if (tenantList.length === 1) {
      return tenantList[0].trim();
    }
  }
  
  return route.params.tenantId
    || route.query.tenantId
    || route.query.tenant_id
    || userStore.user?.tenantId
    || userStore.user?.tenant_id
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('current_tenant_id') : null)
    || null;
});

const tenantIds = computed(() => {
  if (fromSuperadmin.value && route.query.tenants) {
    return String(route.query.tenants).split(',').map(s => s.trim()).filter(Boolean);
  }
  const singleTenant = effectiveTenantId.value;
  return singleTenant ? [singleTenant] : [];
});

// Temple list logic
const availableTemples = computed(() => {
  if (fromSuperadmin.value && tenantIds.value.length > 1) {
    return allTemples.value || [];
  } else {
    return templeStore.temples || [];
  }
});

// UI helpers
const getTempleName = (templeId) => {
  if (templeId === 'all') return 'All Temples';
  const temple = availableTemples.value.find(t => t.id?.toString() === templeId?.toString());
  return temple ? temple.name : 'Unknown Temple';
};

const getReportTypeTitle = () => {
  switch (activeReportType.value) {
    case 'birthdays':
      return 'Devotee Birthdays';
    case 'devotees':
      return 'Devotee List';
    case 'statusActive':
      return 'Active Devotees';
    case 'statusInactive':
      return 'Inactive Devotees';
    case 'profile':
      return 'Devotee Profile';
    default:
      return 'Report';
  }
};

const getReportTypeDescription = () => {
  switch (activeReportType.value) {
    case 'birthdays':
      return 'devotee birthday data';
    case 'devotees':
      return 'devotee list data';
    case 'statusActive':
      return 'active devotee data';
    case 'statusInactive':
      return 'inactive devotee data';
    case 'profile':
      return 'devotee profile data';
    default:
      return 'report data';
  }
};

const getActiveDevoteeStatusLabel = () => {
  switch (activeReportType.value) {
    case 'statusActive':
      return 'Active Only';
    case 'statusInactive':
      return 'Inactive Only';
    case 'devotees':
      return devoteeStatus.value === 'all' ? 'All Statuses' : 
             devoteeStatus.value === 'active' ? 'Active' :
             devoteeStatus.value === 'inactive' ? 'Inactive' :
             devoteeStatus.value === 'new' ? 'New Members' : 'All';
    default:
      return 'All';
  }
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
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const clearError = () => {
  error.value = null;
};

// Handlers
const setReportType = (type) => {
  activeReportType.value = type;
  if (type === 'statusActive' || type === 'statusInactive') {
    devoteeStatus.value = 'all';
  }
};

const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  const now = new Date();
  
  if (filter === 'weekly') {
    const start = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = now.toISOString().split('T')[0];
  } else if (filter === 'monthly') {
    const start = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = now.toISOString().split('T')[0];
  } else if (filter === 'yearly') {
    const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = now.toISOString().split('T')[0];
  }
};

const handleTempleChange = () => {
  console.log('Temple changed to:', selectedTemple.value);
  clearError();
};

const handleDateChange = () => {
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    error.value = 'Start date cannot be after end date';
  } else {
    clearError();
  }
};



// CRITICAL FIX: buildReportParams() function for Vue component
// Add this to your BirthdaysReport.vue <script> section
// In BirthdaysReport.vue - Update buildReportParams()
const buildReportParams = () => {
  const params = {
    dateRange: activeFilter.value,
    startDate: startDate.value,
    endDate: endDate.value,
    format: selectedFormat.value,
    isSuperAdmin: fromSuperadmin.value,
    reportType: activeReportType.value
  };

  // Devotee status filter
  if (activeReportType.value === 'statusActive') {
    params.status = 'active';
  } else if (activeReportType.value === 'statusInactive') {
    params.status = 'inactive';
  } else if (activeReportType.value === 'devotees' && devoteeStatus.value !== 'all') {
    params.status = devoteeStatus.value;
  }

  // ⭐⭐⭐ CRITICAL: Single temple selection ⭐⭐⭐
  if (selectedTemple.value !== 'all') {
    const templeId = selectedTemple.value;
    
    // Find temple object
    const temple = availableTemples.value.find(t => String(t.id) === String(templeId));
    
    if (!temple) {
      console.error('Temple not found:', templeId);
      throw new Error('Selected temple not found');
    }
    
    // Get tenant ID (temple owner user ID)
    const templeTenantId = temple.tenant_id || temple.created_by || temple.entityId;
    
    if (!templeTenantId) {
      console.error('Temple has no tenant_id:', temple);
      throw new Error('Temple has no associated tenant');
    }
    
    // ⭐ Set these parameters - THIS IS CRITICAL!
    params.entityId = templeId;           // Temple ID
    params.tenantId = templeTenantId;     // Tenant/User ID who owns temple
    params.singleTemple = true;            // Flag to use /entities/{id} endpoint
    
    console.log('✅ Single temple params:', {
      templeId,
      tenantId: templeTenantId,
      singleTemple: true
    });
  } 
  // All temples selected
  else {
    if (fromSuperadmin.value && tenantIds.value.length > 1) {
      params.tenantIds = tenantIds.value.slice();
      params.entityIds = tenantIds.value.slice();
      params.allTemples = true;
    } else if (effectiveTenantId.value) {
      params.tenantId = effectiveTenantId.value;
      params.entityId = effectiveTenantId.value;
      params.allTemples = true;
    }
  }

  return params;
};

// Download function with proper error handling
const downloadReport = async () => {
  if (isDownloading.value) return;
  
  // Validation
  if (!startDate.value || !endDate.value) {
    error.value = 'Please select both start and end dates';
    showToast('Please select both start and end dates', 'error');
    return;
  }
  
  if (new Date(startDate.value) > new Date(endDate.value)) {
    error.value = 'Start date cannot be after end date';
    showToast('Start date cannot be after end date', 'error');
    return;
  }

  if (tenantIds.value.length === 0) {
    error.value = 'No tenant selected for report generation';
    showToast('No tenant selected for report generation', 'error');
    return;
  }
  
  // Validate single temple selection
  if (selectedTemple.value !== 'all') {
    const temple = availableTemples.value.find(t => String(t.id) === String(selectedTemple.value));
    if (!temple) {
      error.value = 'Selected temple not found. Please refresh and try again.';
      showToast('Selected temple not found', 'error');
      return;
    }
  }
  
  isDownloading.value = true;
  error.value = null;
  
  try {
    const params = buildReportParams();
    console.log('Downloading devotee report with params:', params);
    
    let result;

    // Use reportsStore methods if available
    if (reportsStore) {
      try {
        switch (activeReportType.value) {
          case 'birthdays':
            if (typeof reportsStore.downloadDevoteeBirthdaysReport === 'function') {
              result = await reportsStore.downloadDevoteeBirthdaysReport(params);
            } else {
              throw new Error('Birthday report download method not available in store');
            }
            break;
            
          case 'devotees':
          case 'statusActive':
          case 'statusInactive':
            if (typeof reportsStore.downloadDevoteeListReport === 'function') {
              result = await reportsStore.downloadDevoteeListReport(params);
            } else {
              throw new Error('Devotee list report download method not available in store');
            }
            break;
            
          case 'profile':
            if (typeof reportsStore.downloadDevoteeProfileReport === 'function') {
              result = await reportsStore.downloadDevoteeProfileReport(params);
            } else {
              throw new Error('Devotee profile report download method not available in store');
            }
            break;
            
          default:
            throw new Error('Unknown report type selected');
        }

        // If store method succeeded
        if (result && result.success) {
          const templeInfo = selectedTemple.value === 'all' ? 'all temples' : getTempleName(selectedTemple.value);
          showToast(`${getReportTypeTitle()} for ${templeInfo} downloaded successfully as ${getFormatLabel(selectedFormat.value)}`, 'success');
        } else {
          throw new Error(result?.message || 'Failed to download report');
        }
        
      } catch (storeError) {
        console.warn('Store method failed, trying direct API call:', storeError);
        
        // Fallback to direct API call
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add tenant headers
        if (selectedTemple.value !== 'all') {
          const temple = availableTemples.value.find(t => String(t.id) === String(selectedTemple.value));
          const templeTenantId = temple?.tenant_id || temple?.entityId || temple?.created_by || effectiveTenantId.value;
          if (templeTenantId) {
            Object.assign(headers, buildTenantHeaders(templeTenantId));
          }
        } else if (effectiveTenantId.value && tenantIds.value.length === 1) {
          Object.assign(headers, buildTenantHeaders(effectiveTenantId.value));
        }
        
        // Try multiple possible API endpoints
        let endpoint = '';
        let endpoints = [];
        
        if (activeReportType.value === 'birthdays') {
          endpoints = [
            '/v1/reports/devotees/birthdays/download',
            '/reports/devotees/birthdays/download',
            '/api/reports/devotees/birthdays',
            '/v1/devotees/birthdays/report'
          ];
        } else if (['devotees', 'statusActive', 'statusInactive'].includes(activeReportType.value)) {
          endpoints = [
            '/v1/reports/devotees/list/download',
            '/reports/devotees/list/download',
            '/api/reports/devotees/list',
            '/v1/devotees/list/report'
          ];
        } else if (activeReportType.value === 'profile') {
          endpoints = [
            '/v1/reports/devotees/profile/download',
            '/reports/devotees/profile/download',
            '/api/reports/devotees/profile',
            '/v1/devotees/profile/report'
          ];
        }
        
        let response = null;
        let lastError = null;
        
        // Try each endpoint
        for (const testEndpoint of endpoints) {
          try {
            console.log('Trying endpoint:', testEndpoint);
            response = await api.post(testEndpoint, params, {
              responseType: 'blob',
              headers
            });
            
            if (response && response.data) {
              endpoint = testEndpoint;
              console.log('Success with endpoint:', endpoint);
              break;
            }
          } catch (endpointError) {
            console.warn(`Endpoint ${testEndpoint} failed:`, endpointError.message);
            lastError = endpointError;
          }
        }
        
        if (!response || !response.data) {
          throw new Error(`All API endpoints failed. Last error: ${lastError?.message || 'Unknown error'}. Please contact support.`);
        }
        
        // Handle blob response
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const blob = new Blob([response.data], { type: contentType });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        const reportLabel = getReportTypeTitle().toLowerCase().replace(/\s+/g, '-');
        const templeLabel = selectedTemple.value === 'all' ? 'all-temples' : `temple-${selectedTemple.value}`;
        link.download = `${reportLabel}-${templeLabel}-${timestamp}.${params.format}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        const templeInfo = selectedTemple.value === 'all' ? 'all temples' : getTempleName(selectedTemple.value);
        showToast(`${getReportTypeTitle()} for ${templeInfo} downloaded successfully as ${getFormatLabel(selectedFormat.value)}`, 'success');
      }
    } else {
      throw new Error('Reports store is not available');
    }
    
  } catch (err) {
    console.error('Error downloading report:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
    error.value = `Failed to download report: ${errorMessage}`;
    showToast(`Failed to download report: ${errorMessage}`, 'error');
  } finally {
    isDownloading.value = false;
  }
};

// Fetch temples with proper tenant scoping
const fetchTemples = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Clear existing data
    templeStore.temples = [];
    allTemples.value = [];

    if (tenantIds.value.length === 0) {
      console.warn('No tenant IDs available for fetching temples');
      error.value = 'No tenant selected to load temples.';
      return;
    }

    console.log('=== Starting Temple Fetch ===');
    console.log('Tenant IDs to fetch:', tenantIds.value);
    console.log('Is Multi-tenant:', fromSuperadmin.value && tenantIds.value.length > 1);

    // MULTI-TENANT (superadmin with multiple tenants)
    if (fromSuperadmin.value && tenantIds.value.length > 1) {
      console.log(`Fetching temples for ${tenantIds.value.length} tenants:`, tenantIds.value);
      
      const requests = tenantIds.value.map(tenantId => {
        console.log(`Creating request for tenant: ${tenantId}`);
        return fetchTemplesForSingleTenant(tenantId).catch(err => {
          console.error(`Failed to fetch temples for tenant ${tenantId}:`, err);
          return [];
        });
      });

      console.log(`Executing ${requests.length} parallel requests...`);
      const results = await Promise.allSettled(requests);
      
      console.log('Results from Promise.allSettled:', results);
      
      const aggregated = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const tenantId = tenantIds.value[i];
        
        if (result.status === 'fulfilled') {
          console.log(`Tenant ${tenantId}: ${result.value?.length || 0} temples`);
          if (Array.isArray(result.value) && result.value.length > 0) {
            aggregated.push(...result.value);
          }
        } else {
          console.error(`Tenant ${tenantId}: Request failed`, result.reason);
        }
      }

      console.log(`Total temples aggregated: ${aggregated.length}`);

      // Deduplicate by id
      const seen = new Set();
      allTemples.value = aggregated.filter(temple => {
        if (seen.has(temple.id)) {
          console.log(`Duplicate temple found: ${temple.id} - ${temple.name}`);
          return false;
        }
        seen.add(temple.id);
        return true;
      });
      
      console.log(`After deduplication: ${allTemples.value.length} unique temples`);
      console.log('Temple details:', allTemples.value.map(t => ({ id: t.id, name: t.name, tenant: t.tenant_id })));

    // SINGLE-TENANT
    } else if (effectiveTenantId.value) {
      console.log('Fetching temples for single tenant:', effectiveTenantId.value);
      
      const temples = await fetchTemplesForSingleTenant(effectiveTenantId.value);
      templeStore.temples = temples;
      
      console.log(`Loaded ${templeStore.temples.length} temples for tenant ${effectiveTenantId.value}`);
      console.log('Temple details:', templeStore.temples.map(t => ({ id: t.id, name: t.name, tenant: t.tenant_id })));
    } else {
      console.warn('No tenant ID available to fetch temples');
      error.value = 'No tenant selected to load temples.';
    }
    
    console.log('=== Temple Fetch Complete ===');
    
  } catch (err) {
    console.error('Error in fetchTemples:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
    error.value = `Failed to load temple data: ${errorMessage}`;
  } finally {
    loading.value = false;
  }
};

// Fetch temples for a single tenant
const fetchTemplesForSingleTenant = async (tenantId) => {
  console.log(`Fetching temples for tenant: ${tenantId}`);
  
  try {
    let fetchedTemples = [];
    
    // Strategy 1: Try temples endpoint with tenant filtering (query params only)
    try {
      console.log(`Strategy 1: Trying /v1/temples for tenant ${tenantId}`);
      const templesResponse = await api.get('/v1/temples', {
        params: {
          tenant_id: tenantId,
          entityId: tenantId,
          entity_id: tenantId
        }
        // ❌ NO HEADERS - removed buildTenantHeaders(tenantId)
      });
      
      let temples = [];
      if (Array.isArray(templesResponse.data)) {
        temples = templesResponse.data;
      } else if (templesResponse.data && Array.isArray(templesResponse.data.data)) {
        temples = templesResponse.data.data;
      } else if (templesResponse.data && Array.isArray(templesResponse.data.temples)) {
        temples = templesResponse.data.temples;
      }
      
      console.log(`Found ${temples.length} temples from /v1/temples for tenant ${tenantId}`);
      
      if (temples.length > 0) {
        fetchedTemples = temples.map(temple => ({
          id: temple.id,
          name: temple.name || temple.temple_name || temple.entity_name || 'Unknown Temple',
          status: temple.status || 'active',
          tenant_id: temple.tenant_id || temple.entityId || temple.created_by || tenantId,
          created_by: temple.created_by || tenantId,
          entityId: temple.entityId || temple.tenant_id || tenantId
        }));
        return fetchedTemples;
      }
    } catch (templesErr) {
      console.log(`Strategy 1 failed for tenant ${tenantId}:`, templesErr.message);
    }

    // Strategy 2: Try entities endpoint (query params only)
    try {
      console.log(`Strategy 2: Trying /entities for tenant ${tenantId}`);
      const entitiesResponse = await api.get('/entities', {
        params: {
          tenant_id: tenantId,
          entityId: tenantId,
          entity_id: tenantId,
          created_by: tenantId
        }
        // ❌ NO HEADERS
      });

      let entities = [];
      if (Array.isArray(entitiesResponse.data)) {
        entities = entitiesResponse.data;
      } else if (entitiesResponse.data && Array.isArray(entitiesResponse.data.data)) {
        entities = entitiesResponse.data.data;
      } else if (entitiesResponse.data && Array.isArray(entitiesResponse.data.entities)) {
        entities = entitiesResponse.data.entities;
      }

      console.log(`Got ${entities.length} total entities from /entities`);

      const tenantEntities = entities.filter(entity => {
        const entityCreatedBy = String(entity.created_by || '');
        const entityTenantId = String(entity.tenant_id || '');
        const entityId = String(entity.entityId || '');
        const tenantIdStr = String(tenantId);
        
        return entityCreatedBy === tenantIdStr || 
               entityTenantId === tenantIdStr || 
               entityId === tenantIdStr;
      });

      console.log(`Filtered ${tenantEntities.length} entities for tenant ${tenantId}`);

      if (tenantEntities.length > 0) {
        fetchedTemples = tenantEntities.map(entity => ({
          id: entity.id,
          name: entity.name || entity.temple_name || entity.entity_name || 'Unknown Temple',
          status: entity.status || 'active',
          tenant_id: entity.tenant_id || entity.entityId || entity.created_by || tenantId,
          created_by: entity.created_by || tenantId,
          entityId: entity.entityId || entity.tenant_id || tenantId
        }));
        return fetchedTemples;
      }

    } catch (entitiesErr) {
      console.log(`Strategy 2 failed for tenant ${tenantId}:`, entitiesErr.message);
    }

    // Strategy 3: Get all entities and filter client-side
    try {
      console.log(`Strategy 3: Trying /entities without filters for tenant ${tenantId}`);
      const allResponse = await api.get('/entities');
      // ❌ NO HEADERS

      let allEntities = [];
      if (Array.isArray(allResponse.data)) {
        allEntities = allResponse.data;
      } else if (allResponse.data && Array.isArray(allResponse.data.data)) {
        allEntities = allResponse.data.data;
      }

      console.log(`Got ${allEntities.length} total entities from /entities (no filter)`);

      const filteredEntities = allEntities.filter(entity => {
        const entityCreatedBy = String(entity.created_by || '');
        const entityTenantId = String(entity.tenant_id || '');
        const entityIdField = String(entity.entityId || '');
        const entityOwnerId = String(entity.owner_id || '');
        const entityUserId = String(entity.user_id || '');
        const tenantIdStr = String(tenantId);
        
        return entityCreatedBy === tenantIdStr || 
               entityTenantId === tenantIdStr || 
               entityIdField === tenantIdStr ||
               entityOwnerId === tenantIdStr ||
               entityUserId === tenantIdStr;
      });

      console.log(`Client-side filtered ${filteredEntities.length} entities for tenant ${tenantId}`);

      if (filteredEntities.length > 0) {
        fetchedTemples = filteredEntities.map(entity => ({
          id: entity.id,
          name: entity.name || entity.temple_name || entity.entity_name || 'Unknown Temple',
          status: entity.status || 'active',
          tenant_id: entity.tenant_id || entity.entityId || entity.created_by || tenantId,
          created_by: entity.created_by || tenantId,
          entityId: entity.entityId || entity.tenant_id || tenantId
        }));
        return fetchedTemples;
      }

    } catch (fallbackErr) {
      console.error(`Strategy 3 failed for tenant ${tenantId}:`, fallbackErr);
    }

    console.warn(`All strategies failed for tenant ${tenantId}, returning empty array`);
    return [];

  } catch (err) {
    console.error(`Error fetching temples for tenant ${tenantId}:`, err);
    return [];
  }
};
// Manual refresh function
const manualRefreshTemples = async () => {
  await fetchTemples();
};

// Lifecycle
onMounted(async () => {
  console.log('Component mounted with tenant context:', {
    fromSuperadmin: fromSuperadmin.value,
    effectiveTenantId: effectiveTenantId.value,
    tenantIds: tenantIds.value,
    routeQuery: route.query,
    routeParams: route.params
  });
  
  await fetchTemples();
});

// Watch for tenant changes
watch(tenantIds, async (newIds, oldIds) => {
  if (newIds && newIds.length > 0 && JSON.stringify(newIds) !== JSON.stringify(oldIds)) {
    console.log('Tenant IDs changed, refetching temples:', { old: oldIds, new: newIds });
    await fetchTemples();
  }
}, { deep: true });

// Watch single-tenant transitions
watch(effectiveTenantId, async (newTenantId, oldTenantId) => {
  if (newTenantId !== oldTenantId) {
    console.log('Effective tenant ID changed, refetching temples:', { old: oldTenantId, new: newTenantId });
    await fetchTemples();
  }
});

// Watch route changes for tenant context updates
watch(() => route.query, async (newQuery, oldQuery) => {
  if (newQuery.tenants !== oldQuery.tenants || newQuery.tenantId !== oldQuery.tenantId) {
    console.log('Route query changed, updating tenant context:', { old: oldQuery, new: newQuery });
    await fetchTemples();
  }
}, { deep: true });

// Export time formatting functions for use in parent components
defineExpose({
  formatTime12Hour,
  formatDateTime,
  isValidDate
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
