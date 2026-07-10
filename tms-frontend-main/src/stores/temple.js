// src/stores/temple.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import templeService from '@/services/temple.service'
import { useToast } from '@/composables/useToast' // Assuming you have a toast composable

export const useTempleStore = defineStore('temple', () => {
  // State
  const temples = ref([])
  const currentTemple = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

  // Temple creation/edit form state - UPDATED TO MATCH BACKEND EXPECTATIONS
  const templeForm = ref({
    name: '',
    mainDeity: '', // Changed from presiding_deity
    description: '',
    templeType: '', // Changed from category to match backend
    establishedYear: '',
    
    // Contact info
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    
    // Address info - MATCHES BACKEND STRUCTURE
    address: {
      street: '', // Will be sent as street_address
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    district: '', // Separate field as backend expects
    landmark: '',
    mapLink: '', // Will be sent as map_link
    
    // Documents for file upload
    documents: {
      registration: null,
      trustDeed: null,
      property: null,
      additional: []
    },
    logo: null,
video: null,
    status: 'pending', // Will be set by backend
    rejection_reason: '',
    admin_notes: ''
  })

  // Computed
  const approvedTemples = computed(() => 
    temples.value.filter(temple => temple.status === 'approved' || temple.status === 'active')
  )

  const pendingTemples = computed(() => 
    temples.value.filter(temple => temple.status === 'pending')
  )

  const rejectedTemples = computed(() => 
    temples.value.filter(temple => temple.status === 'rejected')
  )

  const templeCounts = computed(() => ({
    total: temples.value.length,
    approved: approvedTemples.value.length,
    pending: pendingTemples.value.length,
    rejected: rejectedTemples.value.length
  }))

  // Clear all temple data
  const clearTempleData = () => {
    temples.value = []
    currentTemple.value = null
  }

  // Actions
  const fetchTemples = async (tenantId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log(`🏛️ Fetching temples for tenant ID ${tenantId || 'unknown'}...`)
      
      // Tenant ID is passed via URL parameters, not headers
      const options = {}
      
      // Add cache busting to ensure fresh data
      const timestamp = Date.now()
      const response = await templeService.getTemples(options, timestamp)
      
      console.log('🏛️ Temple service response:', response)
      
      // The new API structure returns data directly, not response.data
      temples.value = response || []
      console.log('🏛️ Temples set in store:', temples.value)
      
      return response
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch temples'
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error fetching temples:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // This is the updated fetchTemplesForSuperAdmin method for temple.js store
  const fetchTemplesForSuperAdmin = async (tenantId) => {
    console.log(`🏛️ Fetching temples for SuperAdmin for tenant ID ${tenantId}...`);
    // Clear existing temples before fetching new ones
    temples.value = [];
    loading.value = true;
    error.value = null;
    
    try {
      if (!tenantId) {
        console.warn('No tenant ID provided for fetchTemplesForSuperAdmin');
        return [];
      }
      
      console.log(`🔄 Starting fresh fetch for tenant ID ${tenantId}`);
      
      // Store the tenant ID in localStorage to ensure it's available for filtering
      localStorage.setItem('current_tenant_id', tenantId);
      
      // Set options for the API request - tenant ID passed via URL
      const options = {
        tenantId: tenantId,
        superAdmin: true,
        timestamp: Date.now() // Add timestamp for cache busting
      };
      
      // Use the existing getTemples method with all necessary parameters
      const response = await templeService.getTemples(options);
      
      if (response && Array.isArray(response)) {
        // Double-check filtering on the client side to ensure only tenant-specific temples
        const filteredResponse = response.filter(temple => 
          (temple.created_by && temple.created_by.toString() === tenantId.toString()) ||
          (temple.tenant_id && temple.tenant_id.toString() === tenantId.toString()) ||
          (temple.creator_id && temple.creator_id.toString() === tenantId.toString())
        );
        
        temples.value = filteredResponse;
        console.log(`🏛️ Temple service response for SuperAdmin: ${filteredResponse.length} temples for tenant ${tenantId}`);
      } else {
        temples.value = [];
        console.warn(`No temples returned for tenant ID ${tenantId}`);
      }
      
      return temples.value;
    } catch (err) {
      console.error(`❌ Error fetching temples for SuperAdmin:`, err);
      error.value = `Failed to fetch temples: ${err.message || 'Unknown error'}`;
      return [];
    } finally {
      loading.value = false;
    }
  }

  // Add this as a new method to your temple.js store
  const fetchSuperAdminTemplesStrict = async (tenantId) => {
    console.log(`🔒 STRICT STORE: Fetching temples for tenant ID ${tenantId}`);
    temples.value = [];
    loading.value = true;
    error.value = null;
    
    try {
      if (!tenantId) {
        console.warn('🚫 STRICT STORE: No tenant ID provided');
        return [];
      }
      
      const response = await templeService.getSuperAdminTemplesStrict(tenantId);
      
      // Set the temples directly
      temples.value = response;
      console.log(`🔒 STRICT STORE: Set ${temples.value.length} temples in store`);
      
      return temples.value;
    } catch (err) {
      console.error(`❌ STRICT STORE: Error:`, err);
      error.value = `Failed to fetch temples: ${err.message || 'Unknown error'}`;
      return [];
    } finally {
      loading.value = false;
    }
  }

  // Add to temple.js store
  const fetchDirectByTenant = async (tenantId) => {
    console.log(`🔄 STORE DIRECT: Fetching temples for tenant ${tenantId}`);
    
    // Clear existing data
    temples.value = [];
    loading.value = true;
    error.value = null;
    
    try {
      const result = await templeService.getTemplesDirectByTenant(tenantId);
      temples.value = result;
      console.log(`🔄 STORE DIRECT: Set ${result.length} temples in store`);
      return result;
    } catch (err) {
      console.error(`🔄 STORE DIRECT: Error:`, err);
      error.value = err.message || 'Unknown error';
      return [];
    } finally {
      loading.value = false;
    }
  }

  // FIXED: createTemple method to properly format data for backend
  const createTemple = async (templeData) => {
    try {
      loading.value = true
      error.value = null

      console.log('🏛️ STORE: Creating temple with data:', templeData);

      // Transform the temple data to match backend expectations
      const transformedData = {
        // Basic temple information
        name: templeData.name || '',
        mainDeity: templeData.mainDeity || templeData.presiding_deity || '',
        templeType: templeData.templeType || templeData.category || '',
        establishedYear: templeData.establishedYear || '',
        description: templeData.description || '',
        
        // Contact information
        contact: {
          phone: templeData.contact?.phone || templeData.phone || '',
          email: templeData.contact?.email || templeData.email || ''
        },
        
        // Address information
        address: {
          street: templeData.address?.street || templeData.addressLine1 || templeData.streetAddress || '',
          city: templeData.address?.city || templeData.city || '',
          state: templeData.address?.state || templeData.state || '',
          pincode: templeData.address?.pincode || templeData.pincode || ''
        },
        district: templeData.district || '',
        landmark: templeData.landmark || '',
        mapLink: templeData.mapLink || '',
        
        // Documents (if any)
        documents: templeData.documents || {},
         logo: templeData.logo || null,
  video: templeData.video || null
      };

      console.log('🏛️ STORE: Transformed data for service:', transformedData);

      const response = await templeService.createTemple(transformedData)
      
      console.log('🏛️ STORE: Service response:', response);
      
      // Create a proper temple object to add to the list
      const newTemple = {
        id: response.id || response.ID || Date.now(),
        name: transformedData.name,
        description: transformedData.description,
        status: 'pending',
        templeType: transformedData.templeType,
        mainDeity: transformedData.mainDeity,
        establishedYear: transformedData.establishedYear,
        
        // Contact info
        phone: transformedData.contact.phone,
        email: transformedData.contact.email,
        
        // Address info
        addressLine1: transformedData.address.street,
        city: transformedData.address.city,
        state: transformedData.address.state,
        pincode: transformedData.address.pincode,
        district: transformedData.district,
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Normalize for frontend
        address: transformedData.address,
        contact: transformedData.contact
      }
      
      // Add the new temple to the list
      temples.value.push(newTemple)
      
      toast.success('Temple created successfully. It will be reviewed by the admin.')
      
      resetForm()
      
      // Clear any cached data in localStorage that might be related to temples
      try {
        localStorage.removeItem('dashboard_local_data')
        localStorage.removeItem('dashboard_counts')
        localStorage.removeItem('dashboard_seva_names')
      } catch (e) {
        console.warn('Could not clear localStorage cache:', e)
      }
      
      return response

    } catch (err) {
      const errorMessage = err.message || 'Failed to create temple'
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error creating temple:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTemple = async (id, updates) => {
    try {
      loading.value = true
      error.value = null

      console.log('🏛️ STORE: Updating temple with data:', updates);

      // Transform the updates to match backend expectations
      const transformedUpdates = {
        name: updates.name || '',
        mainDeity: updates.mainDeity || updates.presiding_deity || '',
        templeType: updates.templeType || updates.category || '',
        establishedYear: updates.establishedYear || '',
        description: updates.description || '',
        
        // Contact information
        contact: {
          phone: updates.contact?.phone || updates.phone || '',
          email: updates.contact?.email || updates.email || ''
        },
        
        // Address information
        address: {
          street: updates.address?.street || updates.addressLine1 || updates.streetAddress || '',
          city: updates.address?.city || updates.city || '',
          state: updates.address?.state || updates.state || '',
          pincode: updates.address?.pincode || updates.pincode || ''
        },
        district: updates.district || '',
        landmark: updates.landmark || '',
        mapLink: updates.mapLink || '',
        
        // Documents (if any)
        documents: updates.documents || {},
         logo: templeData.logo || null,
  video: templeData.video || null
      };

      const response = await templeService.updateTemple(id, transformedUpdates)

      // Update the temple in the list
      const index = temples.value.findIndex(t => t.id === Number(id))
      if (index !== -1) {
        // Normalize the response data
        temples.value[index] = {
          ...temples.value[index],
          ...response,
          // Ensure proper normalization
          templeType: response.temple_type || response.templeType,
          mainDeity: response.main_deity || response.mainDeity,
          addressLine1: response.street_address || response.addressLine1,
          updatedAt: new Date().toISOString()
        }
      }
      
      toast.success('Temple updated successfully')
      
      return response
    } catch (err) {
      const errorMessage = err.message || `Failed to update temple with ID: ${id}`
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error updating temple:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  // Add this to your temple.js store (in the return statement)

const updateTempleStatus = async (templeId, isActive) => {
  try {
    loading.value = true;
    error.value = null;

    console.log(`🏛️ STORE: Updating temple ${templeId} status to ${isActive}`);

    // Call the service method
    const response = await templeService.toggleTempleStatus(templeId, isActive);

    // Update the temple in the local list
    const index = temples.value.findIndex(t => t.id === Number(templeId));
    if (index !== -1) {
      temples.value[index] = {
        ...temples.value[index],
        isActive: isActive,
        updatedAt: new Date().toISOString()
      };
      console.log(`🏛️ STORE: Updated temple ${templeId} in local list`);
    }

    toast.success(`Temple ${isActive ? 'activated' : 'deactivated'} successfully`);
    
    return response;
  } catch (err) {
    const errorMessage = err.message || `Failed to update temple status`;
    error.value = errorMessage;
    toast.error(errorMessage);
    console.error('Error updating temple status:', err);
    throw err;
  } finally {
    loading.value = false;
  }
};

  const deleteTemple = async (id) => {
    try {
      loading.value = true
      error.value = null

      await templeService.deleteTemple(id)

      // Remove deleted temple from the list
      temples.value = temples.value.filter(t => t.id !== Number(id))
      
      toast.success('Temple deleted successfully')
    } catch (err) {
      const errorMessage = err.message || `Failed to delete temple with ID: ${id}`
      error.value = errorMessage
      toast.error(errorMessage)
      console.error('Error deleting temple:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentTemple = (temple) => {
    currentTemple.value = temple
  }

  const getCurrentTemple = () => {
    return currentTemple.value
  }

  const getTempleBySlug = (slug) => {
    return temples.value.find(temple => temple.slug === slug)
  }

  const setCurrentTempleBySlug = (slug) => {
    const temple = getTempleBySlug(slug)
    if (temple) {
      currentTemple.value = temple
      return temple
    }
    return null
  }

  // FIXED: resetForm to match new structure
  const resetForm = () => {
    templeForm.value = {
      name: '',
      mainDeity: '',
      description: '',
      templeType: '',
      establishedYear: '',
      
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      district: '',
      landmark: '',
      mapLink: '',
      
      documents: {
        registration: null,
        trustDeed: null,
        property: null,
        additional: []
      },
      logo: null,
video: null,

      status: 'pending',
      rejection_reason: '',
      admin_notes: ''
    }
  }

  const updateFormField = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      templeForm.value[parent][child] = value
    } else {
      templeForm.value[field] = value
    }
  }

  const searchTemples = (query) => {
    if (!query.trim()) return temples.value
    
    const searchTerm = query.toLowerCase()
    return temples.value.filter(temple => 
      temple.name.toLowerCase().includes(searchTerm) ||
      temple.address?.city?.toLowerCase().includes(searchTerm) ||
      temple.address?.state?.toLowerCase().includes(searchTerm) ||
      temple.mainDeity?.toLowerCase().includes(searchTerm)
    )
  }



const getTempleById = async (id) => {
  try {
    loading.value = true
    error.value = null
    
    console.log(`🏛️ STORE: Fetching fresh temple details for ID: ${id}`)
    
    // Make a fresh API call to get complete temple details including rejection info
    const response = await templeService.getTempleById(id)
    
    console.log('🏛️ STORE: Fresh temple data received:', response)
    
    // Update current temple
    currentTemple.value = response
    
    // Also update in temples array if it exists
    const index = temples.value.findIndex(t => t.id === parseInt(id))
    if (index !== -1) {
      temples.value[index] = response
    }
    
    return response
  } catch (err) {
    const errorMessage = err.message || 'Failed to fetch temple details'
    error.value = errorMessage
    console.error('Error fetching temple by ID:', err)
    throw err
  } finally {
    loading.value = false
  }
}

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    temples,
    currentTemple,
    loading,
    error,
    templeForm,
    
    // Computed
    approvedTemples,
    pendingTemples,
    rejectedTemples,
    templeCounts,
    getTempleById,
       // updateTempleStatus

    
    // Actions
    fetchTemples,
    fetchDirectByTenant,
    createTemple,
    updateTemple,
    deleteTemple,
    setCurrentTemple,
    getCurrentTemple,
    getTempleBySlug,
    setCurrentTempleBySlug,
    resetForm,
    updateFormField,
    searchTemples,
    clearError,
    updateTempleStatus,
    fetchTemplesForSuperAdmin,
    fetchSuperAdminTemplesStrict,
    clearTempleData
  }
})
