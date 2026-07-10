<template>
  <div class="min-h-screen bg-gray-50">

    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Manage Temples</h1>
              <p class="mt-2 text-sm text-gray-600">
                View and manage all your temple registrations
              </p>
            </div>
            <router-link
              to="/tenant/entities/create"
              class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Create New Temple
            </router-link>
          </div>
        </div>
      </div>
    </div>


    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-indigo-100">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Temples</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-green-100">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Approved</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-yellow-100">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="p-3 rounded-lg bg-red-100">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Rejected</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.rejected }}</p>
            </div>
          </div>
        </div>
      </div>


      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">

          <div class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                placeholder="Search temples by name, location..."
              />
            </div>
          </div>

          <div class="sm:w-48">
            <select
              v-model="statusFilter"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            >
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>


          <div class="sm:w-48">
            <select
              v-model="sortBy"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Your Temples</h3>
          <p class="text-sm text-gray-600 mt-1">{{ filteredTemples.length }} temples found</p>
        </div>

        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="text-gray-600 mt-4">Loading temples...</p>
        </div>

        <div v-else-if="filteredTemples.length === 0" class="p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4">
            <svg class="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No temples found</h3>
          <p class="text-gray-600 mb-4">
            {{ searchQuery || statusFilter ? 'Try adjusting your filters' : 'Get started by creating your first temple' }}
          </p>
          <router-link
            to="/tenant/entities/create"
            class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Create Temple
          </router-link>
        </div>


        <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <TempleCard
            v-for="temple in filteredTemples"
            :key="temple.id"
            :temple="temple"
            @view="handleViewTemple"
            @edit="handleEditTemple"
            @delete="handleDeleteTemple"
            @resubmit="handleResubmitTemple"
            @manage="handleViewTemple"
          />
        </div>
      </div>
    </div>

    <BaseModal
      v-if="showDeleteModal"
      @close="showDeleteModal = false"
      title="Delete Temple"
    >
      <div class="p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            <p class="text-gray-600 mt-1">
              Are you sure you want to delete <strong>{{ templeToDelete?.name }}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Delete Temple
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTempleStore } from '@/stores/temple'
import TempleCard from '@/components/temple/TempleCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useToast } from '@/composables/useToast'

// Composables
const router = useRouter()
const templeStore = useTempleStore()
const { success, error, info, warning } = useToast()


// Reactive data
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('created_desc')
const showDeleteModal = ref(false)
const templeToDelete = ref(null)

// Computed properties
const stats = computed(() => {
  const temples = templeStore.temples
  return {
    total: temples.length,
    approved: temples.filter(t => t.status === 'APPROVED' || t.status === 'approved').length,
    pending: temples.filter(t => t.status === 'PENDING' || t.status === 'pending').length,
    rejected: temples.filter(t => t.status === 'REJECTED' || t.status === 'rejected').length
  }
})

const filteredTemples = computed(() => {
  let filtered = templeStore.temples

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(temple =>
      temple.name.toLowerCase().includes(query) ||
      temple.address.toLowerCase().includes(query) ||
      temple.city.toLowerCase().includes(query) ||
      temple.state.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    const status = statusFilter.value.toLowerCase()
    filtered = filtered.filter(temple => 
      temple.status.toLowerCase() === status
    )
  }

  // Apply sorting
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'created_asc':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'created_desc':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })
})

// Methods
const loadTemples = async () => {
  loading.value = true;
  try {
    // Get the selected tenant ID from localStorage
    const selectedTenantId = localStorage.getItem('selected_tenant_id');
    
    if (selectedTenantId) {
      console.log(`⚡️ COMPONENT: Using direct method for tenant ID: ${selectedTenantId}`);
      // Use our direct method instead of any existing methods
      await templeStore.fetchDirectByTenant(selectedTenantId);
    } else {
      // Normal flow for non-SuperAdmin users
      await templeStore.fetchTemples();
    }
  } catch (error) {
    console.error('⚡️ COMPONENT: Failed to load temples:', error);
  } finally {
    loading.value = false;
  }
}

const handleViewTemple = (temple) => {
  // Case-insensitive check for approved status
  if (temple.status && temple.status.toString().toLowerCase() === 'approved') {
    console.log("Navigating to entity dashboard with ID:", temple.id)
    router.push(`/entity/${temple.id}/dashboard`)
  } else {
    warning('Temple must be approved to access dashboard')
  }
}

const handleEditTemple = (temple) => {
  router.push(`/tenant/entities/${temple.id}/edit`)
}

const handleDeleteTemple = (temple) => {
  templeToDelete.value = temple
  showDeleteModal.value = true
}

const handleResubmitTemple = (temple) => {
  router.push(`/tenant/entities/${temple.id}/resubmit`)
}

const confirmDelete = async () => {
  try {
    await templeStore.deleteTemple(templeToDelete.value.id)
    success('Temple deleted successfully')
    showDeleteModal.value = false
    templeToDelete.value = null
  } catch (error) {
    error('Failed to delete temple')
  }
}

// Add this new function to your component
const fetchTenantTemples = async () => {
  try {
    loading.value = true;
    
    // Get the selected tenant ID
    const tenantId = localStorage.getItem('selected_tenant_id');
    console.log(`🔍 Direct fetch for tenant ID: ${tenantId}`);
    
    if (!tenantId) {
      console.error('No tenant ID found in localStorage');
      return;
    }
    
    // Make direct API call
    const url = `/superadmin/tenants/${tenantId}/entities`;
    console.log(`🔍 Using URL: ${url}`);
    
    const response = await fetch(API_URL + url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(`🔍 API response:`, data);
    
    // Extract temples
    let templeData = data;
    if (!Array.isArray(templeData)) {
      if (templeData.data && Array.isArray(templeData.data)) templeData = templeData.data;
      else if (templeData.entities && Array.isArray(templeData.entities)) templeData = templeData.entities;
      else if (templeData.items && Array.isArray(templeData.items)) templeData = templeData.items;
    }
    
    console.log(`🔍 Extracted temples: ${templeData.length}`);
    
    // Normalize temples
    const normalizedTemples = templeData.map(temple => ({
      id: temple.id || temple.ID || 0,
      name: temple.name || temple.Name || 'Unknown Temple',
      description: temple.description || temple.Description || '',
      templeType: temple.temple_type || temple.TempleType || '',
      category: temple.temple_type || temple.TempleType || '',
      addressLine1: temple.street_address || temple.StreetAddress || '',
      city: temple.city || temple.City || '',
      state: temple.state || temple.State || '',
      district: temple.district || temple.District || '',
      pincode: temple.pincode || temple.Pincode || '',
      country: 'India',
      phone: temple.phone || temple.Phone || '',
      email: temple.email || temple.Email || '',
      status: temple.status || temple.Status || 'pending',
      mainDeity: temple.main_deity || temple.MainDeity || '',
      establishedYear: temple.established_year || temple.EstablishedYear || null,
      createdAt: temple.created_at || temple.CreatedAt || null,
      updatedAt: temple.updated_at || temple.UpdatedAt || null,
      createdBy: temple.created_by || temple.CreatedBy || null,
      tenantId: temple.tenant_id || temple.TenantId || temple.created_by || temple.CreatedBy || null,
      address: {
        street: temple.street_address || temple.StreetAddress || '',
        city: temple.city || temple.City || '',
        state: temple.state || temple.State || '',
        district: temple.district || temple.District || '',
        pincode: temple.pincode || temple.Pincode || '',
        country: 'India'
      },
      contact: {
        phone: temple.phone || temple.Phone || '',
        email: temple.email || temple.Email || '',
        website: temple.website || temple.Website || ''
      }
    }));
    
    // Set directly in the store
    templeStore.temples.value = normalizedTemples;
    
  } catch (error) {
    console.error('Direct fetch error:', error);
  } finally {
    loading.value = false;
  }
};

// Then replace your onMounted hook with this:
onMounted(() => {
  // Check if we're in SuperAdmin flow
  const selectedTenantId = localStorage.getItem('selected_tenant_id');
  
  if (selectedTenantId) {
    // Use our direct fetch for SuperAdmin
    fetchTenantTemples();
  } else {
    // Use normal flow for other users
    loadTemples();
  }
})
</script>
