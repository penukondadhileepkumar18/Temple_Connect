import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'

/**
 * Get tenants for selection (used in tenant selection screen)
 * @returns {Promise} - Promise with tenant list
 */
export const getTenantsForSelection = async () => {
  try {
    console.log('📡 Fetching tenants for selection')
    const response = await api.get('/tenants/selection') // adjust endpoint if backend differs
    console.log('✅ Tenants fetched:', response.data)

    // Handle data structure (array or wrapped in {data:[]})
    if (Array.isArray(response.data)) {
      return response.data
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    } else {
      console.warn('⚠️ Unexpected tenants response format:', response.data)
      return []
    }
  } catch (error) {
    console.error('❌ Error fetching tenants for selection:', error)
    console.error('Error response:', error.response?.data)
    return []
  }
}

/**
 * Get all temples for a tenant
 * @param {string|number} tenantId - The tenant ID
 * @returns {Promise} - Promise with temple data
 */
export const getTemples = async (tenantId) => {
  try {
    console.log('📡 Making API call to fetch available temples')
    console.log('🔍 Search params:', { tenantId, headers: api.defaults.headers.common })

    // Get current URL path to determine context
    const currentPath = window.location.pathname
    console.log('📍 Current path:', currentPath)

    // Tenant ID is passed via URL parameter, not header
    console.log(`🔑 Using tenant ID: ${tenantId || 'none'}`)

    // Get auth store to check user role
    const authStore = useAuthStore()
    const userRole = (authStore.userRole || '').toLowerCase()
    const isMonitoringUser = userRole.includes('monitoring') || userRole.includes('monitoringuser')
    const isStandardUser = userRole.includes('standard') || userRole.includes('standarduser')

    // Different endpoints based on the context
    let endpoint = '/entities'

    if ((isMonitoringUser || isStandardUser) && tenantId) {
      console.log('🔒 Standard/Monitoring user accessing temples for tenant ID:', tenantId)
      endpoint = '/entities'
    } else if (tenantId) {
      console.log('🔒 Using admin endpoint: /entities')
      endpoint = '/entities'
    } else {
      console.log('👤 Using user endpoint: /entities/available')
      endpoint = '/entities/available'
    }

    console.log(`🔍 Making GET request to: ${endpoint}`)
    const response = await api.get(endpoint)

    // Handle various response formats
    let temples = response.data
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      temples = response.data.data
    } else if (!Array.isArray(temples)) {
      console.warn('⚠️ Unexpected response format:', response.data)
      temples = []
    }

    console.log(`✅ Received ${temples.length} temples:`, temples)
    return temples
  } catch (error) {
    console.error('❌ Error fetching temples:', error)
    console.error('Error response:', error.response?.data)
    return []
  }
}

/**
 * Get a specific temple by ID
 */
export const getTempleById = async (id) => {
  try {
    console.log(`📡 Fetching temple with ID: ${id}`)
    const response = await api.get(`/entities/${id}`)
    console.log('📥 Temple details response:', response.data)
    return response.data
  } catch (error) {
    console.error(`❌ Error fetching temple ID ${id}:`, error)
    console.error('Error response:', error.response?.data)
    throw error
  }
}

/**
 * Create a new temple
 */
export const createTemple = async (templeData) => {
  try {
    const response = await api.post('/entities', templeData)
    return response.data
  } catch (error) {
    console.error('Error creating temple:', error)
    throw error
  }
}

/**
 * Update an existing temple
 */
export const updateTemple = async (id, templeData) => {
  try {
    const response = await api.put(`/entities/${id}`, templeData)
    return response.data
  } catch (error) {
    console.error('Error updating temple:', error)
    throw error
  }
}

/**
 * Delete a temple
 */
export const deleteTemple = async (id) => {
  try {
    const response = await api.delete(`/entities/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting temple:', error)
    throw error
  }
}

/**
 * Get users for a tenant
 * @param {string|number} tenantId - The tenant ID
 * @param {object} filters - Optional filters (role, name)
 * @returns {Promise} - Promise with user data
 */
export const getTenantUsers = async (tenantId, filters = {}) => {
  try {
    console.log('📡 Fetching tenant users');
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.name) params.append('name', filters.name);
    
    const queryString = params.toString();
    const endpoint = `/tenants/${tenantId}/user/management${queryString ? `?${queryString}` : ''}`;
    
    console.log(`🔍 Making GET request to: ${endpoint}`);
    const response = await api.get(endpoint);
    
    let users = response.data;
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      users = response.data.data;
    }
    
    // Standardize each user's data
    const standardizedUsers = users.map(standardizeUserData);
    
    console.log(`✅ Received ${standardizedUsers.length} users:`, standardizedUsers);
    return standardizedUsers;
  } catch (error) {
    console.error('❌ Error fetching tenant users:', error);
    console.error('Error response:', error.response?.data);
    return [];
  }
}

/**
 * Create or update a user for a tenant
 * @param {string|number} tenantId - The tenant ID
 * @param {object} userData - User data to create/update
 * @returns {Promise} - Promise with created/updated user
 */
export const createOrUpdateTenantUser = async (tenantId, userData) => {
  try {
    console.log(`📡 Creating/updating user for tenant ${tenantId}:`, userData);
    
    // Format data with capitalized field names to match Go struct
    const formattedData = {
      Name: userData.name,
      Email: userData.email,
      Phone: userData.phone,
      Password: userData.password,
      Role: userData.role,
      Status: userData.status || 'active'
    };
    
    // Make the request using the same tenant ID for both URL and header
    const response = await api.post(`/tenants/${tenantId}/user`, formattedData);
    
    console.log('📥 User creation response:', response.data);
    
    // Standardize the user data from the response
    const user = response.data.user || response.data;
    const standardizedUser = standardizeUserData(user);
    
    // Return the standardized user object
    return standardizedUser;
  } catch (error) {
    console.error('❌ Error creating/updating tenant user:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

/**
 * Update an existing user for a tenant
 * @param {string|number} tenantId - The tenant ID
 * @param {object} userData - User data to update
 * @returns {Promise} - Promise with updated user
 */
export const updateTenantUser = async (tenantId, userData) => {
  try {
    console.log(`📡 Updating user ${userData.id} for tenant ${tenantId}:`, userData);
    
    // Check if this is only a status update (just id and status fields)
    const isStatusUpdate = userData.hasOwnProperty('status') && 
                          Object.keys(userData).filter(k => k !== 'id' && k !== 'status').length === 0;
    
    let response;
    if (isStatusUpdate) {
      // For status updates, send a simple JSON with just the status
      console.log(`📡 Sending status update (${userData.status}) for user ${userData.id}`);
      
      // Send the status with capital S to match Go struct field
      response = await api.put(`/tenants/${tenantId}/user/${userData.id}`, {
        Status: userData.status
      });
    } else {
      // Always include status in full updates
      // For full updates, convert to proper format matching Go struct field names
      const formattedData = {
        Name: userData.name,
        Email: userData.email,
        Phone: userData.phone,
        Role: userData.role,
        Password: userData.password || 'password123',
        Status: userData.status // Make sure status is always included
      };
      
      console.log(`📡 Sending full update for user ${userData.id}:`, formattedData);
      response = await api.put(`/tenants/${tenantId}/user/${userData.id}`, formattedData);
    }
    
    console.log('📥 User update response:', response.data);
    
    // Return the user object from the response
    return response.data.user || response.data;
  } catch (error) {
    console.error('❌ Error updating tenant user:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

/**
 * Update a user's status in a tenant
 * @param {string|number} tenantId - The tenant ID
 * @param {string|number} userId - The user ID
 * @param {string} status - The new status ('active' or 'inactive')
 * @returns {Promise} - Promise with updated user
 */
export const updateUserStatus = async (tenantId, userId, status) => {
  try {
    console.log(`📡 Updating status to ${status} for user ${userId} in tenant ${tenantId}`);
    
    // Use the existing endpoint with a simple status object
    const response = await api.put(
      `/tenants/${tenantId}/user/${userId}`, 
      { Status: status }  // Use capital 'S' to match Go struct
    );
    
    console.log('📥 Status update response:', response.data);
    return response.data.user || response.data;
  } catch (error) {
    console.error('❌ Error updating status:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

/**
 * Standardize user data format between backend and frontend
 * @param {object} user - User data from API
 * @returns {object} - Standardized user object
 */
const standardizeUserData = (user) => {
  if (!user) return user;
  
  // Create a clone to avoid mutations
  const standardized = {...user};
  
  // Standardize role format (convert from backend to frontend format)
  if (typeof standardized.role === 'string') {
    if (standardized.role.toLowerCase() === 'monitoringuser') {
      standardized.role = 'MonitoringUser';
    } else if (standardized.role.toLowerCase() === 'standarduser') {
      standardized.role = 'StandardUser';
    }
  }
  
  return standardized;
};

export default {
  getTenantsForSelection,
  getTemples,
  getTempleById,
  createTemple,
  updateTemple,
  deleteTemple,
  getTenantUsers,
  createOrUpdateTenantUser,
  updateTenantUser,
  updateUserStatus,
  standardizeUserData
}
