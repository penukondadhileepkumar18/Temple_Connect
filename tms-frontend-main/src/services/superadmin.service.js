import api, { endpoints } from './api.js'


class SuperAdminService {
  constructor() {
    this.baseURL = '/superadmin';
    this.pendingRequests = new Map(); // Track pending requests to prevent duplicates
  }

   // ==========================================
  // TENANT SELECTION - NEW
  // ==========================================

  /**
   * Get tenants available for selection by the current user
   * Endpoint: GET /api/v1/superadmin/tenants/selection
   * This endpoint is protected and available to superadmin, standarduser, and monitoringuser roles
   */
 async getTenantsForSelection() {
  try {
    console.log('Service: Fetching tenants for selection...');
    
    // Use the actual endpoint from your backend
    const response = await api.get(`${this.baseURL}/tenants/selection`);
    console.log('Service: Tenants selection response:', response);
    
    // For debugging - log the exact structure of the first item
    if (response && response.data && response.data.length > 0) {
      console.log('First tenant raw data:', JSON.stringify(response.data[0], null, 2));
    } else if (Array.isArray(response) && response.length > 0) {
      console.log('First tenant raw data (direct array):', JSON.stringify(response[0], null, 2));
    }
    
    // Handle the response format
    if (response && response.data && Array.isArray(response.data)) {
      // Process the tenants data to ensure consistent format
      const processedTenants = response.data.map(tenant => {
        // Log the raw tenant data for debugging
        console.log(`Processing tenant ${tenant.id}: temple_name=${tenant.temple_name}, templeName=${tenant.templeName}, location=${tenant.location}, temple_place=${tenant.temple_place}`);
        
        return {
          id: tenant.id || tenant.ID,
          name: tenant.name || tenant.full_name || tenant.fullName || tenant.Name || 'Unknown Tenant',
          email: tenant.email || tenant.Email || '',
          // Handle all possible field name variations
          templeName: tenant.temple_name || tenant.templeName || '',
          location: tenant.location || tenant.temple_place || '',
          status: (tenant.status || tenant.Status || 'active').toLowerCase(),
          templesCount: tenant.temples_count || tenant.templesCount || 0,
          imageUrl: tenant.image_url || tenant.imageUrl || null,
          // Keep the temple object for compatibility with existing code
          temple: {
            name: tenant.temple_name || tenant.templeName || '',
            address: tenant.location || tenant.temple_place || ''
          }
        };
      });
      
      console.log('Service: Processed tenants for selection:', processedTenants);
      
      return {
        success: true,
        data: processedTenants,
        message: 'Tenants fetched successfully'
      };
    } else if (Array.isArray(response)) {
      // Direct array response
      const processedTenants = response.map(tenant => {
        // Log the raw tenant data for debugging
        console.log(`Processing tenant ${tenant.id} (direct array): temple_name=${tenant.temple_name}, templeName=${tenant.templeName}, location=${tenant.location}, temple_place=${tenant.temple_place}`);
        
        return {
          id: tenant.id || tenant.ID,
          name: tenant.name || tenant.full_name || tenant.fullName || tenant.Name || 'Unknown Tenant',
          email: tenant.email || tenant.Email || '',
          templeName: tenant.temple_name || tenant.templeName || '',
          location: tenant.location || tenant.temple_place || '',
          status: (tenant.status || tenant.Status || 'active').toLowerCase(),
          templesCount: tenant.temples_count || tenant.templesCount || 0,
          imageUrl: tenant.image_url || tenant.imageUrl || null,
          temple: {
            name: tenant.temple_name || tenant.templeName || '',
            address: tenant.location || tenant.temple_place || ''
          }
        };
      });
      
      return {
        success: true,
        data: processedTenants,
        message: 'Tenants fetched successfully'
      };
    }
    
    console.warn('Service: Unexpected response format for tenant selection');
    return {
      success: false,
      data: [],
      message: 'Unexpected response format'
    };
    
  } catch (error) {
    console.error('Service: Error fetching tenants for selection:', error);
    
    // Fallback to mock data for development
    if (error.response?.status === 404) {
      console.warn('Tenants selection endpoint not found, using mock data');
      const mockData = this.getMockTenantsForSelection();
      return {
        success: true,
        data: mockData,
        message: 'Mock tenants loaded (API endpoint not available)'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch tenants for selection'
    };
  }
}

async getTenantDetails(tenantId) {
  try {
    console.log(`Service: Fetching tenant details for ID ${tenantId}`);
    
    // Try to get tenant details from the dedicated endpoint
    try {
      const response = await api.get(`${this.baseURL}/tenants/${tenantId}`);
      console.log('Service: Tenant details response:', response);
      
      if (response && response.data) {
        console.log('Retrieved temple details for tenant:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.warn(`Primary tenant details endpoint failed:`, error);
      
      // Try fallback endpoint
      try {
        const fallbackResponse = await api.get(`${this.baseURL}/tenant-details/${tenantId}`);
        if (fallbackResponse && fallbackResponse.data) {
          return {
            success: true,
            data: { temple_details: fallbackResponse.data }
          };
        }
      } catch (fallbackError) {
        console.warn(`Fallback endpoint failed too:`, fallbackError);
      }
    }
    
    // If we reach here, both attempts failed, return mock data
    console.log('Using mock data for tenant details');
    return {
      success: true,
      data: this.getMockTenantDetails(tenantId)
    };
    
  } catch (error) {
    console.error(`Service: Error fetching tenant details for ID ${tenantId}:`, error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Mock data for tenant details in case endpoints fail
getMockTenantDetails(tenantId) {
  // Generate some fake but realistic data based on the tenant ID
  const temples = [
    { name: 'Sri Krishna Temple', place: 'Bengaluru, Karnataka' },
    { name: 'Ganesh Temple', place: 'Mumbai, Maharashtra' },
    { name: 'Meenakshi Temple', place: 'Madurai, Tamil Nadu' },
    { name: 'Jagannath Temple', place: 'Puri, Odisha' },
    { name: 'Kashi Vishwanath', place: 'Varanasi, Uttar Pradesh' }
  ];
  
  // Use tenant ID as an index (with wrapping)
  const index = (tenantId % temples.length);
  const temple = temples[index];
  
  return {
    temple_details: {
      temple_name: temple.name,
      temple_place: temple.place,
      temple_address: `${123 + tenantId} Temple Street, ${temple.place.split(',')[0]}`,
      temple_phone_no: `+91 98765${10000 + Number(tenantId)}`,
      temple_description: `A beautiful ${temple.name} dedicated to devotional services.`
    }
  };
}

// Add this method to superadmin.service.js
async batchFetchTenantDetails(tenantIds) {
  console.log(`Service: Batch fetching details for ${tenantIds.length} tenants`);
  const results = {};
  
  // Process in smaller batches of 3 with delay between batches
  const batchSize = 3;
  const delay = 1000; // 1 second delay between batches
  
  for (let i = 0; i < tenantIds.length; i += batchSize) {
    const batch = tenantIds.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch}`);
    
    // Process each tenant in the current batch concurrently
    const batchPromises = batch.map(async (tenantId) => {
      try {
        const response = await this.getTenantDetails(tenantId);
        if (response.success) {
          results[tenantId] = response.data;
        }
      } catch (error) {
        console.warn(`Error fetching details for tenant ${tenantId}:`, error);
      }
    });
    
    // Wait for current batch to complete
    await Promise.all(batchPromises);
    
    // Add delay before next batch (but not after the last batch)
    if (i + batchSize < tenantIds.length) {
      console.log(`Waiting ${delay}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

  /**
   * Helper method to format location from tenant data
   */
  formatLocationForSelection(tenant) {
    // Try to build location from available data
    const city = tenant.city || tenant.City || tenant.temple?.city || tenant.Temple?.city || '';
    const state = tenant.state || tenant.State || tenant.temple?.state || tenant.Temple?.state || '';
    const address = tenant.address || tenant.Address || tenant.temple?.address || tenant.Temple?.address || '';
    
    if (city && state) {
      return `${city}, ${state}`;
    } else if (address) {
      // Extract city and state from address if possible
      const parts = address.split(',');
      if (parts.length >= 2) {
        return `${parts[parts.length-2].trim()}, ${parts[parts.length-1].trim()}`;
      }
      return address;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }
    
    return 'Location not specified';
  }

  /**
   * Mock data for tenant selection (development/fallback)
   */
  getMockTenantsForSelection() {
    return [
      {
        id: 1,
        name: 'Bangalore Temple Trust',
        email: 'admin@bangaloretemple.com',
        templeName: 'Sri Venkateswara Temple',
        location: 'Bengaluru, Karnataka',
        status: 'active',
        templesCount: 5,
        imageUrl: null,
        temple: {
          name: 'Sri Venkateswara Temple',
          address: '123 Temple Street, Bengaluru',
          city: 'Bengaluru',
          state: 'Karnataka'
        }
      },
      {
        id: 2,
        name: 'Mumbai Temples Association',
        email: 'info@mumbaitemples.org',
        templeName: 'Ganesh Temple',
        location: 'Mumbai, Maharashtra',
        status: 'active',
        templesCount: 8,
        imageUrl: null,
        temple: {
          name: 'Ganesh Temple',
          address: '456 Temple Road, Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra'
        }
      },
      {
        id: 3,
        name: 'Madurai Temple Management',
        email: 'admin@maduraitemples.com',
        templeName: 'Meenakshi Temple',
        location: 'Madurai, Tamil Nadu',
        status: 'active',
        templesCount: 3,
        imageUrl: null,
        temple: {
          name: 'Meenakshi Temple',
          address: '789 Divine Lane, Madurai',
          city: 'Madurai',
          state: 'Tamil Nadu'
        }
      },
      {
        id: 4,
        name: 'Puri Temple Network',
        email: 'contact@puritemples.org',
        templeName: 'Jagannath Temple',
        location: 'Puri, Odisha',
        status: 'pending',
        templesCount: 2,
        imageUrl: null,
        temple: {
          name: 'Jagannath Temple',
          address: '101 Sacred Avenue, Puri',
          city: 'Puri',
          state: 'Odisha'
        }
      },
      {
        id: 5,
        name: 'Chennai Temple Board',
        email: 'board@chennaitemples.org',
        templeName: 'Kapaleeshwarar Temple',
        location: 'Chennai, Tamil Nadu',
        status: 'active',
        templesCount: 6,
        imageUrl: null,
        temple: {
          name: 'Kapaleeshwarar Temple',
          address: '202 Temple Square, Chennai',
          city: 'Chennai',
          state: 'Tamil Nadu'
        }
      }
    ];
  }

  // ==========================================
  // COUNT ENDPOINTS - EXISTING
  // ==========================================

  /**
   * Get tenant approval counts (pending, approved, rejected)
   * Endpoint: GET /api/v1/superadmin/tenant-approval-count
   * Response: {"approved": 2, "pending": 0, "rejected": 1}
   */
  async getTenantApprovalCounts() {
    try {
      console.log('Service: Fetching tenant approval counts...')
      
      const response = await api.get(`${this.baseURL}/tenant-approval-count`)
      console.log('Service: Tenant counts response:', response)
      
      // Handle the response format
      if (response && typeof response === 'object') {
        return {
          success: true,
          data: {
            pending: response.pending || 0,
            approved: response.approved || 0,
            rejected: response.rejected || 0
          },
          message: 'Tenant approval counts fetched successfully'
        }
      }
      
      return {
        success: false,
        data: { pending: 0, approved: 0, rejected: 0 },
        message: 'Invalid response format for tenant counts'
      }
    } catch (error) {
      console.error('Service: Error fetching tenant approval counts:', error)
      
      // Fallback to mock data for development
      if (error.response?.status === 404) {
        console.warn('Tenant count endpoint not found, using mock data')
        return {
          success: true,
          data: { pending: 2, approved: 3, rejected: 1 }, // Mock data
          message: 'Mock tenant counts loaded (API endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: { pending: 0, approved: 0, rejected: 0 },
        message: error.message || 'Failed to fetch tenant approval counts'
      }
    }
  }

  /**
   * Get temple approval counts (pending_approvals, active_temples, rejected, total_users)
   * Endpoint: GET /api/v1/superadmin/temple-approval-count
   * Response: {"pending_approval": 0, "active_temples": 1, "rejected": 0, "total_devotees": 2}
   */
  async getTempleApprovalCounts() {
    try {
      console.log('Service: Fetching temple approval counts...')
      
      const response = await api.get(`${this.baseURL}/temple-approval-count`)
      console.log('Service: Temple counts response:', response)
      
      // Handle the response format
      if (response && typeof response === 'object') {
        return {
          success: true,
          data: {
            pendingApprovals: response.pending_approval || response.pending_approvals || 0,
            activeTemples: response.active_temples || 0,
            rejectedTemples: response.rejected || 0,
            totalUsers: response.total_devotees || response.total_users || 0,
            newThisWeek: response.new_this_week || 0 // May not be in API response
          },
          message: 'Temple approval counts fetched successfully'
        }
      }
      
      return {
        success: false,
        data: {
          pendingApprovals: 0,
          activeTemples: 0,
          rejectedTemples: 0,
          totalUsers: 0,
          newThisWeek: 0
        },
        message: 'Invalid response format for temple counts'
      }
    } catch (error) {
      console.error('Service: Error fetching temple approval counts:', error)
      
      // Fallback to mock data for development
      if (error.response?.status === 404) {
        console.warn('Temple count endpoint not found, using mock data')
        return {
          success: true,
          data: {
            pendingApprovals: 5,
            activeTemples: 32,
            rejectedTemples: 3,
            totalUsers: 178,
            newThisWeek: 4
          },
          message: 'Mock temple counts loaded (API endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: {
          pendingApprovals: 0,
          activeTemples: 0,
          rejectedTemples: 0,
          totalUsers: 0,
          newThisWeek: 0
        },
        message: error.message || 'Failed to fetch temple approval counts'
      }
    }
  }

  // ==========================================
  // TENANT MANAGEMENT - EXISTING
  // ==========================================


/**
 * Get pending tenants - FIXED VERSION
 */
async getPendingTenants() {
  try {
    console.log('Service: Fetching pending tenants...');
    
    const response = await api.get(`${this.baseURL}/tenants?status=pending`);
    console.log('Service: Raw API response:', response);
    
    // Handle multiple possible response structures
    let tenantData = [];
    
    // Check different possible response formats
    if (Array.isArray(response)) {
      // Direct array response
      tenantData = response;
    } else if (response && Array.isArray(response.data)) {
      // Wrapped in data property
      tenantData = response.data;
    } else if (response && Array.isArray(response.pending_tenants)) {
      // Wrapped in pending_tenants property
      tenantData = response.pending_tenants;
    } else if (response && response.data && Array.isArray(response.data.data)) {
      // Double nested in data.data
      tenantData = response.data.data;
    } else if (response && response.data && Array.isArray(response.data.pending_tenants)) {
      // Nested in data.pending_tenants
      tenantData = response.data.pending_tenants;
    }
    
    console.log(`Service: Processed ${tenantData.length} pending tenants`);
    
    return {
      success: true,
      data: tenantData,
      total: tenantData.length,
      message: 'Pending tenants fetched successfully'
    };
  } catch (error) {
    console.error('Service: Error fetching pending tenants:', error);
    
    if (error.response?.status === 404) {
      console.warn('Endpoint not found, using mock data for demonstration');
      return {
        success: true,
        data: this.getMockPendingTenants(),
        message: 'Mock tenant data loaded (API endpoint not available)'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch pending tenants'
    };
  }
}

/**
 * Get all tenants - FIXED VERSION
 */
async getAllTenants(filters = {}) {
  try {
    console.log('Service: Fetching all tenants...');
    
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `${this.baseURL}/tenants?${queryString}` : `${this.baseURL}/tenants`;
    
    console.log(`Service: Calling endpoint: ${endpoint}`);
    const response = await api.get(endpoint);
    console.log('Service: Raw API response:', response);
    
    // Handle multiple possible response structures
    let tenantData = [];
    let pagination = {};
    
    if (Array.isArray(response)) {
      // Direct array response
      tenantData = response;
      pagination = { total: response.length };
    } else if (response && Array.isArray(response.data)) {
      // Wrapped in data property
      tenantData = response.data;
      pagination = {
        total: response.total || response.data.length,
        page: response.page || filters.page || 1,
        limit: response.limit || filters.limit || 10
      };
    } else if (response && response.data && Array.isArray(response.data.data)) {
      // Double nested in data.data
      tenantData = response.data.data;
      pagination = response.data.pagination || {
        total: response.data.total || response.data.data.length
      };
    } else if (response && response.data && Array.isArray(response.data.tenants)) {
      // Nested in data.tenants
      tenantData = response.data.tenants;
      pagination = response.data.pagination || {
        total: response.data.total || response.data.tenants.length
      };
    }
    
    console.log(`Service: Processed ${tenantData.length} total tenants`);
    
    return {
      success: true,
      data: tenantData,
      pagination: pagination,
      message: 'Tenants fetched successfully'
    };
  } catch (error) {
    console.error('Service: Error fetching all tenants:', error);
    
    if (error.response?.status === 404) {
      console.warn('Endpoint not found, using mock data for demonstration');
      return {
        success: true,
        data: this.getMockAllTenants(),
        message: 'Mock tenant data loaded (API endpoint not available)'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch tenants'
    };
  }
}

  /**
   * Get temple admins list for reports section
   * Try multiple possible endpoints to find the right one
   */
  async getTempleadminsForReports() {
  try {
    console.log('Service: Fetching temple admins list for reports...')
    
    // Try the enhanced endpoint first which includes temple details
    try {
      const response = await api.get(`${this.baseURL}/tenants/reports`);
      console.log('Service: Enhanced tenants/reports response:', response);
      
      if (response && (Array.isArray(response.data) || Array.isArray(response))) {
        const tenantData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response) ? response : [];
        
        console.log('Service: First tenant data from enhanced endpoint:', tenantData[0]);
        
        return {
          success: true,
          data: tenantData,
          message: 'Temple admins list fetched successfully with temple details'
        }
      }
    } catch (enhancedError) {
      console.warn('Enhanced endpoint not available, trying standard endpoints...');
    }
    
    // Try using the superadmin/tenants endpoint with templeadmin role filter
    try {
      const params = new URLSearchParams({
        role: 'templeadmin',
        status: 'active'  // Only get active templeadmins
      })
      
      const response = await api.get(`${this.baseURL}/tenants?${params}`)
      console.log('Service: Tenant response for templeadmins:', response)
      
      if (response && (Array.isArray(response.data) || Array.isArray(response))) {
        const tenantData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response) ? response : [];
                          
        // Fetch temple details for each tenant
        for (const tenant of tenantData) {
          const tenantId = tenant.id || tenant.ID;
          try {
            const detailsResponse = await api.get(`${this.baseURL}/tenant-details/${tenantId}`);
            if (detailsResponse && detailsResponse.data) {
              tenant.temple_details = detailsResponse.data;
              tenant.temple = {
                name: detailsResponse.data.temple_name,
                city: detailsResponse.data.temple_place,
                state: detailsResponse.data.temple_state || ""
              };
            }
          } catch (detailsError) {
            console.warn(`Could not fetch details for tenant ${tenantId}:`, detailsError);
          }
        }
        
        return {
          success: true,
          data: tenantData,
          message: 'Temple admins list fetched successfully with supplementary details'
        }
      }
    } catch (tenantError) {
      console.warn('Could not fetch templeadmins from tenants endpoint, trying alternatives...');
    }
    
    // Second try: get all tenants and filter for templeadmins in the code
    try {
      const allTenantsResponse = await this.getAllTenants()
      
      if (allTenantsResponse.success && Array.isArray(allTenantsResponse.data)) {
        // Filter for templeadmins by role
        const templeadmins = allTenantsResponse.data.filter(tenant => {
          const role = tenant.role?.roleName || tenant.role?.RoleName || '';
          return role.toLowerCase() === 'templeadmin' || role.toLowerCase() === 'temple_admin';
        });
        
        return {
          success: true,
          data: templeadmins,
          message: 'Temple admins filtered from all tenants'
        }
      }
    } catch (allTenantsError) {
      console.warn('Could not fetch templeadmins from all tenants:', allTenantsError);
    }
    
    // As a last resort, use mock data
    console.warn('No API endpoints available for temple admins, using mock data');
    return {
      success: true,
      data: this.getMockTenantsWithTempleDetails(),
      message: 'Mock temple admins list loaded (API endpoints not available)'
    }
    
  } catch (error) {
    console.error('Service: Error fetching temple admins list:', error);
    
    // Fallback to mock data for development
    console.warn('Temple admins list endpoint not found, using mock data');
    return {
      success: true,
      data: this.getMockTenantsWithTempleDetails(),
      message: 'Mock temple admins list loaded (API endpoint not available)'
    }
  }
}

  async approveTenant(tenantId) {
    try {
      console.log(`Approving tenant ${tenantId}...`)
      
      // Use the correct endpoint from api.js
      const payload = {
        status: "APPROVED"
      }
      
      // Updated to use the actual endpoint from backend
      const response = await api.patch(`${this.baseURL}/tenants/${tenantId}/approval`, payload)
      console.log('Tenant approval response:', response)
      
      return {
        success: true,
        data: response,
        message: 'Tenant approved successfully'
      }
    } catch (error) {
      console.error('Error approving tenant:', error)
      
      // If we're in demo mode, simulate success
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, simulating successful approval')
        
        // Update our mock data to reflect the approval
        this.updateMockTenantStatus(tenantId, 'approved')
        
        return {
          success: true,
          data: { status: 'approved', message: 'Tenant approved successfully (mock)' },
          message: 'Tenant approved successfully (mock)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to approve tenant'
      }
    }
  }

  async rejectTenant(tenantId, data) {
    try {
      console.log(`Rejecting tenant ${tenantId}...`)
      
      // Use the correct endpoint from api.js
      const payload = {
        status: "REJECTED",
        reason: data.reason || data.notes || ''
      }

      // Updated to use the actual endpoint from backend
      const response = await api.patch(`${this.baseURL}/tenants/${tenantId}/approval`, payload)
      console.log('Tenant rejection response:', response)
      
      return {
        success: true,
        data: response,
        message: 'Tenant rejected successfully'
      }
    } catch (error) {
      console.error('Error rejecting tenant:', error)
      
      // If we're in demo mode, simulate success
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, simulating successful rejection')
        
        // Update our mock data to reflect the rejection
        this.updateMockTenantStatus(tenantId, 'rejected')
        
        return {
          success: true,
          data: { 
            status: 'rejected', 
            reason: data.reason || data.notes,
            message: 'Tenant rejected successfully (mock)' 
          },
          message: 'Tenant rejected successfully (mock)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to reject tenant'
      }
    }
  }

  async getTenantDetails(tenantId) {
    try {
      const response = await api.get(`${this.baseURL}/tenants/${tenantId}`)
      
      if (response.data && response.data.tenant) {
        return {
          success: true,
          data: response.data.tenant,
          temples: response.data.temples || [],
          message: 'Tenant details fetched successfully'
        }
      } else if (response.data) {
        return {
          success: true,
          data: response.data,
          temples: response.data.temples || [],
          message: 'Tenant details fetched successfully'
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Unexpected API response format'
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch tenant details'
      }
    }
  }

// In superadmin.service.js - Replace the getPendingEntities method

async getPendingEntities(statusFilter = null) {
  try {
    console.log('🔧 Service: Fetching entities with status filter:', statusFilter);
    
    // Build params object
    const params = {};
    
    // Add status parameter if provided
    if (statusFilter && statusFilter !== 'all') {
      // Don't convert to uppercase - let backend handle case-insensitivity
      params.status = statusFilter;
      console.log('🔍 Adding status filter to params:', params.status);
    } else if (statusFilter === 'all') {
      // Explicitly pass 'all' to backend
      params.status = 'all';
      console.log('🔍 Fetching ALL entities');
    }
    
    console.log('📤 API Request params:', params);
    
    const response = await api.get(`${this.baseURL}/entities`, { params });
    
    console.log('📥 Raw API response:', response);
    
    const d = response?.data ?? response ?? {};

    // Backend now returns entities as direct array (not wrapped in data object)
    // Handle both old format (wrapped) and new format (direct array)
    let entitiesArray = [];
    
    if (Array.isArray(response)) {
      // Direct array response
      entitiesArray = response;
      console.log('✅ Direct array response:', entitiesArray.length, 'entities');
    } else if (Array.isArray(response?.data)) {
      // Wrapped in response.data
      entitiesArray = response.data;
      console.log('✅ Wrapped response.data:', entitiesArray.length, 'entities');
    } else if (Array.isArray(d.pending_entities)) {
      // Old format
      entitiesArray = d.pending_entities;
      console.log('✅ Old format pending_entities:', entitiesArray.length, 'entities');
    } else if (Array.isArray(d.entities)) {
      // Another old format
      entitiesArray = d.entities;
      console.log('✅ Old format entities:', entitiesArray.length, 'entities');
    } else if (Array.isArray(d.data)) {
      // Nested data
      entitiesArray = d.data;
      console.log('✅ Nested data:', entitiesArray.length, 'entities');
    } else {
      console.warn('⚠️ Unexpected response format:', d);
    }

    console.log('📊 Final entities array length:', entitiesArray.length);
    
    return {
      success: true,
      data: entitiesArray,
      total: entitiesArray.length,
      message: `Entities fetched successfully (${entitiesArray.length} found)`
    };
  } catch (error) {
    console.error('❌ Error fetching entities:', error);
    
    if (error.response?.status === 404) {
      const mocks = this.getMockPendingEntities?.() || [];
      return {
        success: true,
        data: mocks,
        total: mocks.length,
        message: 'Mock entities loaded (API endpoint not available)'
      };
    }
    
    return {
      success: false,
      data: [],
      message: error.response?.data?.error || error.message || 'Failed to fetch entities'
    };
  }
}

async approveEntity(entityId, data) {
  try {
    console.log(`Approving entity ${entityId}...`);
    const payload = {
      status: 'APPROVED',
      notes: data?.notes || ''
    };
    const response = await api.patch(`${this.baseURL}/entities/${entityId}/approval`, payload);
    return {
      success: true,
      data: response?.data ?? null,
      message: response?.data?.message || 'Entity approved successfully'
    };
  } catch (error) {
    console.error('Error approving entity:', error);
    if (error.response?.status === 404) {
      console.warn('Endpoint not found, simulating successful approval');
      return {
        success: true,
        data: { status: 'approved', message: 'Entity approved successfully (mock)' },
        message: 'Entity approved successfully (mock)'
      };
    }
    return {
      success: false,
      data: null,
      message: error.response?.data?.error || error.message || 'Failed to approve entity'
    };
  }
}

async rejectEntity(entityId, data) {
  try {
    console.log(`Rejecting entity ${entityId}...`);
    const payload = {
      status: 'REJECTED',
      reason: data?.reason || data?.notes || ''
    };
    const response = await api.patch(`${this.baseURL}/entities/${entityId}/approval`, payload);
    return {
      success: true,
      data: response?.data ?? null,
      message: response?.data?.message || 'Entity rejected successfully'
    };
  } catch (error) {
    console.error('Error rejecting entity:', error);
    if (error.response?.status === 404) {
      console.warn('Endpoint not found, simulating successful rejection');
      return {
        success: true,
        data: {
          status: 'rejected',
          reason: data?.reason || data?.notes || '',
          message: 'Entity rejected successfully (mock)'
        },
        message: 'Entity rejected successfully (mock)'
      };
    }
    return {
      success: false,
      data: null,
      message: error.response?.data?.error || error.message || 'Failed to reject entity'
    };
  }
}

async getEntitiesWithFilters(params = {}) {
  try {
    const response = await api.get(`${this.baseURL}/entities`, { params });
    const d = response?.data ?? {};
    if (Array.isArray(d)) return { success: true, data: d, total: d.length, message: 'Entities fetched' };
    if (Array.isArray(d.entities)) return { success: true, data: d.entities, total: d.total || d.entities.length, message: 'Entities fetched' };
    if (Array.isArray(d.data)) return { success: true, data: d.data, total: d.total || d.data.length, message: 'Entities fetched' };
    return { success: true, data: [], total: 0, message: 'No entities found' };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.error || error.message || 'Failed to fetch entities'
    };
  }
}

  // ==========================================
  // USER MANAGEMENT - NEW
  // ==========================================

  /**
   * Get all user roles 
   * Endpoint: GET /api/v1/superadmin/user-roles
   */
  async getUserRoles() {
    try {
      console.log('Service: Fetching user roles...')
      const response = await api.get(`${this.baseURL}/user-roles`)
      console.log('Service: User roles response:', response)
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          message: 'User roles fetched successfully'
        }
      } else if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
          message: 'User roles fetched successfully'
        }
      }
      
      return {
        success: false,
        data: [],
        message: 'Invalid response format for user roles'
      }
    } catch (error) {
      console.error('Service: Error fetching user roles:', error)
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch user roles'
      }
    }
  }

  /**
   * Get all users with pagination and filters
   * Endpoint: GET /api/v1/superadmin/users
   */
  async getUsers(filters = {}) {
    try {
      console.log('Service: Fetching users...')
      
      const params = new URLSearchParams()
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.page) params.append('page', filters.page)
      if (filters.search) params.append('search', filters.search)
      if (filters.role) params.append('role', filters.role)
      if (filters.status) params.append('status', filters.status)

      const response = await api.get(`${this.baseURL}/users?${params}`)
      console.log('Service: Users response:', response)
      
      if (response && response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          total: response.total || response.data.length,
          pagination: {
            page: response.page || filters.page || 1,
            limit: response.limit || filters.limit || 10,
            total: response.total || response.data.length
          },
          message: 'Users fetched successfully'
        }
      } else if (Array.isArray(response)) {
        return {
          success: true,
          data: response,
          total: response.length,
          pagination: {
            page: filters.page || 1,
            limit: filters.limit || 10,
            total: response.length
          },
          message: 'Users fetched successfully'
        }
      }
      
      return {
        success: false,
        data: [],
        message: 'Invalid response format for users'
      }
    } catch (error) {
      console.error('Service: Error fetching users:', error)
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch users'
      }
    }
  }

  /**
   * Get user by ID
   * Endpoint: GET /api/v1/superadmin/users/:id
   */
  async getUserById(userId) {
    try {
      console.log(`Service: Fetching user ${userId}...`)
      const response = await api.get(`${this.baseURL}/users/${userId}`)
      console.log('Service: User details response:', response)
      
      if (response && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'User details fetched successfully'
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Invalid response format for user details'
      }
    } catch (error) {
      console.error('Service: Error fetching user details:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch user details'
      }
    }
  }

  /**
   * Create new user
   * Endpoint: POST /api/v1/superadmin/users
   */
  async createUser(userData) {
    try {
      console.log('Service: Creating user...', userData)
      const response = await api.post(`${this.baseURL}/users`, userData)
      console.log('Service: Create user response:', response)
      
      return {
        success: true,
        data: response,
        message: 'User created successfully'
      }
    } catch (error) {
      console.error('Service: Error creating user:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || error.message || 'Failed to create user'
      }
    }
  }

  /**
   * Update user
   * Endpoint: PUT /api/v1/superadmin/users/:id
   */
  async updateUser(userId, userData) {
    try {
      console.log(`Service: Updating user ${userId}...`, userData)
      const response = await api.put(`${this.baseURL}/users/${userId}`, userData)
      console.log('Service: Update user response:', response)
      
      return {
        success: true,
        data: response,
        message: 'User updated successfully'
      }
    } catch (error) {
      console.error('Service: Error updating user:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || error.message || 'Failed to update user'
      }
    }
  }

  /**
   * Update user status (activate/deactivate)
   * Endpoint: PATCH /api/v1/superadmin/users/:id/status
   */
  async updateUserStatus(userId, status) {
    try {
      console.log(`Service: Updating user ${userId} status to ${status}...`)
      const response = await api.patch(`${this.baseURL}/users/${userId}/status`, { status })
      console.log('Service: Update user status response:', response)
      
      return {
        success: true,
        data: response,
        message: 'User status updated successfully'
      }
    } catch (error) {
      console.error('Service: Error updating user status:', error)
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || error.message || 'Failed to update user status'
      }
    }
  }
/**
 * Fetch tenants available for assignment - showing only first temple per tenant
 * @returns {Promise<{success: boolean, data: Array, message: string}>}
 */
async getAssignableTenants() {
  try {
    console.log('Service: Fetching assignable tenants...');
    const response = await api.get(`${this.baseURL}/tenants/assignable`);
    console.log('Service: Assignable tenants response:', response);
    
    let tenants = [];
    // Handle different possible response data shapes
    if (Array.isArray(response.data)) {
      tenants = response.data;
    } else if (response.data && Array.isArray(response.data.tenants)) {
      tenants = response.data.tenants;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      tenants = response.data.data;
    }
    
    console.log('Service: Raw tenants data:', tenants);
    console.log('Service: First tenant sample:', tenants[0]);
    
    // Debug: Log all possible ID fields for first tenant
    if (tenants.length > 0) {
      const firstTenant = tenants[0];
      console.log('Service: Available ID fields:', {
        id: firstTenant.id,
        tenant_id: firstTenant.tenant_id,
        tenantId: firstTenant.tenantId,
        userId: firstTenant.userId,
        user_id: firstTenant.user_id,
        userID: firstTenant.userID
      });
    }
    
    // Group by tenant ID and keep only the first temple for each tenant
    const tenantMap = new Map();
    
    tenants.forEach((tenant, index) => {
      // Try multiple ID field names
      let id = tenant.id ?? tenant.tenant_id ?? tenant.tenantId ?? tenant.userId ?? tenant.user_id ?? tenant.userID;
      
      console.log(`Service: Processing tenant ${index}:`, {
        originalId: id,
        tenantName: tenant.tenantName || tenant.name,
        templeName: tenant.templeName || tenant.temple_name
      });
      
      // Convert to number if it's a string
      if (typeof id === 'string' && id.trim() !== '') {
        id = Number(id);
      }
      
      // If still no valid ID, use index as fallback
      if (id === null || id === undefined || isNaN(id)) {
        console.log(`Service: No valid ID found for tenant ${index}, using index as ID`);
        id = index + 1;
      }
      
      // Only keep the first temple for each tenant ID
      if (!tenantMap.has(id)) {
        tenantMap.set(id, {
          ...tenant,
          id: id
        });
        console.log(`Service: Added tenant with ID ${id} to map`);
      } else {
        console.log(`Service: Skipped duplicate tenant with ID ${id}`);
      }
    });
    
    // Convert map back to array
    const uniqueTenants = Array.from(tenantMap.values());
    
    console.log('Service: Final unique tenants count:', uniqueTenants.length);
    console.log('Service: Final unique tenants:', uniqueTenants);
    
    return {
      success: true,
      data: uniqueTenants,
      message: `Assignable tenants fetched successfully (${uniqueTenants.length} unique tenants)`
    };
  } catch (error) {
    console.error('Service: Error fetching assignable tenants:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch assignable tenants'
    };
  }
}


/**
 * Assign a single user to a tenant
 * @param {number} userId - User ID
 * @param {number} tenantId - Tenant ID
 * @returns {Promise<{success: boolean, data: any, message: string}>}
 */
async assignUserToTenant(userId, tenantId) {
  try {
    console.log(`Service: Assigning user ${userId} to tenant ${tenantId}...`);

    const payload = {
      tenantId: Number(tenantId),
      userId: Number(userId) // single user
    };

    console.log('Assignment payload:', payload);

    // Use the correct endpoint
    const response = await api.post(`${this.baseURL}/users/assign`, payload);
    console.log('Service: User assigned to tenant response:', response);

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'User assigned to tenant successfully'
    };
  } catch (error) {
    console.error('Service: Error assigning user to tenant:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to assign user to tenant'
    };
  }
}



  // ==========================================
  // PASSWORD RESET - NEW
  // ==========================================

  /**
   * Search for a user by email
   * Endpoint: GET /api/v1/superadmin/users/search?email=user@example.com
   */
  async searchUserByEmail(email) {
    try {
      console.log(`Service: Searching for user with email ${email}...`)
      const response = await api.get(`${this.baseURL}/users/search?email=${encodeURIComponent(email)}`)
      console.log('Service: User search response:', response)
      
      const user = response.data?.data || response.data || response;

      if (user) {
        return {
          success: true,
          data: user,
          message: 'User found successfully'
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'User not found'
      }
    } catch (error) {
      console.error('Service: Error searching for user:', error)
      
      // For development/testing only
      if (error.response?.status === 404 && email.includes('@')) {
        console.warn('Endpoint not found, using mock data for demonstration')
        return {
          success: true,
          data: {
            id: 1,
            fullName: 'John Doe',
            email: email,
            role: {
              id: 2,
              roleName: 'tenant'
            }
          },
          message: 'Mock user found (API endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || error.message || 'User not found'
      }
    }
  }

  /**
   * Reset user password
   * Endpoint: POST /api/v1/superadmin/users/:id/reset-password
   */
  async resetUserPassword(userId, newPassword) {
    try {
      console.log(`Service: Resetting password for user ${userId}...`);
      
      // Add sendEmail flag explicitly to ensure email notification is sent
      const response = await api.post(`${this.baseURL}/users/${userId}/reset-password`, { 
        password: newPassword,
        sendEmail: true
      });
      
      console.log('Service: Password reset response:', response);
      
      return {
        success: true,
        message: 'Password reset successfully. A notification email has been sent to the user.'
      };
    } catch (error) {
      console.error('Service: Error resetting password:', error);
      
      // For development/testing only
      if (error.response?.status === 404) {
        console.warn('Endpoint not found, simulating successful password reset');
        return {
          success: true,
          message: 'Password reset successfully (mock). In production, an email would be sent to the user.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to reset password'
      };
    }
  }

  // ==========================================
  // ANALYTICS & DASHBOARD - UPDATED
  // ==========================================

  async getDashboardStats(dateRange = {}) {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      if (dateRange.period) params.append('period', dateRange.period)

      console.log('Fetching dashboard stats with params:', params.toString())
      const response = await api.get(`${this.baseURL}/dashboard?${params}`)
      console.log('Dashboard stats response:', response)
      
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // If the API returns the stats directly
        if (response.pendingApprovals !== undefined || 
            response.activeTemples !== undefined ||
            response.stats !== undefined) {
          return {
            success: true,
            data: response.stats || response,
            message: 'Dashboard stats fetched successfully'
          }
        }
      }
      
      return {
        success: false,
        data: null,
        message: 'Unexpected API response format or no stats available'
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch dashboard stats'
      }
    }
  }

  async getSystemStats(dateRange = {}) {
    // Updated to use the new temple count endpoint
    return this.getTempleApprovalCounts();
  }

  async getRoles() {
    try {
      console.log('Service: Fetching roles...');
      const response = await api.get(`${this.baseURL}/roles`);

      // Log the raw response to confirm its structure
      console.log('Service: Roles response:', response);

      // Check if the response is a valid array
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response, // Use the response array directly
          message: 'Roles fetched successfully'
        };
      }

      // Fallback for an unexpected format
      console.warn('Service: API returned a non-array response for roles:', response);
      return {
        success: false,
        data: [],
        message: 'Unexpected API response format for roles'
      };
    } catch (error) {
      console.error('Service: Error fetching roles:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch roles'
      };
    }
  }
  
  async createRole(roleData) {
    try {
      console.log('Service: Creating new role...', roleData);
      const response = await api.post(`${this.baseURL}/roles`, roleData);
      console.log('Service: Create role response:', response);
      return {
        success: true,
        data: response.data,
        message: 'Role created successfully'
      };
    } catch (error) {
      console.error('Service: Error creating role:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create role'
      };
    }
  }
  
  async updateRole(id, roleData) {
    try {
      console.log(`Service: Updating role with ID ${id}...`, roleData);
      const response = await api.put(`${this.baseURL}/roles/${id}`, roleData);
      console.log('Service: Update role response:', response);
      return {
        success: true,
        data: response.data,
        message: 'Role updated successfully'
      };
    } catch (error) {
      console.error('Service: Error updating role:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update role'
      };
    }
  }
  
  async deleteRole(id) {
    try {
      console.log(`Service: Deleting role with ID ${id}...`);
      const response = await api.delete(`${this.baseURL}/roles/${id}`);
      console.log('Service: Delete role response:', response);
      return {
        success: true,
        data: response.data,
        message: 'Role deleted successfully'
      };
    } catch (error) {
      console.error('Service: Error deleting role:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to delete role'
      };
    }
  }
  
  // ==========================================
  // ACTIVITIES (MOCK)
  // ==========================================
  
  /**
   * Get recent activities - method to support the admin dashboard
   * @param {number} limit - Maximum number of activities to return
   * @returns {Promise<Object>} Recent activities
   */
  async getRecentActivities(limit = 10) {
    try {
      // Try to call the actual endpoint (which may not exist yet)
      try {
        const response = await api.get(`${this.baseURL}/activities?limit=${limit}`)
        
        // Check if valid response format
        if (Array.isArray(response)) {
          return {
            success: true,
            data: response,
            message: 'Recent activities fetched successfully'
          }
        } else if (response && Array.isArray(response.activities)) {
          return {
            success: true,
            data: response.activities,
            message: 'Recent activities fetched successfully'
          }
        }
      } catch (apiError) {
        console.warn('Activities endpoint not yet implemented:', apiError)
        
        // Return mock data instead
        return {
          success: true,
          data: this.getMockActivities(limit),
          message: 'Mock activities generated (endpoint not available)'
        }
      }
      
      return {
        success: false,
        data: [],
        message: 'Unexpected API response format for activities'
      }
    } catch (error) {
      console.error('Error in getRecentActivities:', error)
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch recent activities'
      }
    }
  }
  


  /**
   * Bulk upload users via CSV
   * Endpoint: POST /api/v1/superadmin/users/bulk-upload
   */
  async bulkUploadUsers(csvData) {
    try {
      console.log('Service: Starting bulk upload of users...', csvData.length, 'users')
      
      // Prepare FormData for file upload
      const formData = new FormData()
      
      // Convert CSV data back to CSV format
      const csvHeaders = ['Full Name', 'Email', 'Phone', 'Password', 'Role', 'Status','Temple Name',
                          'Temple Place','Temple Address','Temple Phone','Temple Description'  
      ]
      const csvRows = [
        csvHeaders.join(','), // Header row
        ...csvData.map(user => [
          `"${user.full_name || ''}"`,
          `"${user.email || ''}"`,
          `"${user.phone || ''}"`,
          `"${user.password || ''}"`,
          `"${user.role || ''}"`,
          `"${user.status || 'active'}"`,
          `"${user.temple_name || ''}"`,
          `"${user.temple_place || ''}"`,
          `"${user.temple_address || ''}"`,
          `"${user.temple_phone || ''}"`,
          `"${user.temple_description || ''}"`,

        ].join(','))
      ]
      const csvContent = csvRows.join('\n')
      
      // Create blob and append to FormData
      const blob = new Blob([csvContent], { type: 'text/csv' })
      formData.append('file', blob, 'bulk_users.csv')
      
      // Send multipart/form-data request
      const response = await api.post(`${this.baseURL}/users/bulk-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Service: Bulk upload response:', response)
      
      if (response && (response.success !== false)) {
        // Handle successful response
        return {
          success: true,
          data: {
            total_rows: response.total_rows || csvData.length,
            success_count: response.success_count || response.totalRows || csvData.length,
            failed_count: response.failed_count || response.failedCount || 0,
            errors: response.errors || []
          },
          message: response.message || 'Bulk upload completed successfully'
        }
      } else {
        return {
          success: false,
          data: {
            total_rows: csvData.length,
            success_count: 0,
            failed_count: csvData.length,
            errors: response.errors || [response.message || 'Unknown error']
          },
          message: response.message || 'Bulk upload failed'
        }
      }
      
    } catch (error) {
      console.error('Service: Error during bulk upload:', error)
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data
        return {
          success: false,
          data: {
            total_rows: csvData.length,
            success_count: 0,
            failed_count: csvData.length,
            errors: errorData.errors || [errorData.message || error.response.statusText]
          },
          message: errorData.message || `Server error: ${error.response.status}`
        }
      } else if (error.request) {
        // Network error
        return {
          success: false,
          data: {
            total_rows: csvData.length,
            success_count: 0,
            failed_count: csvData.length,
            errors: ['Network error - please check your connection']
          },
          message: 'Failed to connect to server'
        }
      } else {
        // Other error
        return {
          success: false,
          data: {
            total_rows: csvData.length,
            success_count: 0,
            failed_count: csvData.length,
            errors: [error.message || 'Unknown error occurred']
          },
          message: error.message || 'Bulk upload failed'
        }
      }
    }
  }
  // ==========================================
  // MOCK DATA HELPERS - EXISTING
  // ==========================================
  
  // Mock tenants data for development/demo
  // Store it as a class property so we can update it
  _mockTenants = [
    {
      ID: 1,
      FullName: "Naresh V",
      Email: "nareshvn4n@gmail.com",
      PasswordHash: "$2a$10$Q4IcyohhMOT49iyx0nRYqOaIVnZrh0b7nYn9CHZsiQEbV1rB6Rz4q",
      Phone: null,
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "pending",
      EmailVerified: false,
      EmailVerifiedAt: null,
      CreatedAt: "2025-07-12T17:00:16.325394Z",
      UpdatedAt: "2025-07-12T17:00:16.325394Z",
      DeletedAt: null
    },
    {
      ID: 2,
      FullName: "GANESH",
      Email: "ganesh123@gmail.com",
      PasswordHash: "$2a$10$qvfEW9znvJEH19YDGiTyROSmTM9nzPjtpHXL/MDZ/3NoDqTsW8O5q",
      Phone: null,
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "pending",
      EmailVerified: false,
      EmailVerifiedAt: null,
      CreatedAt: "2025-07-12T17:28:03.293811Z",
      UpdatedAt: "2025-07-12T17:28:03.293811Z",
      DeletedAt: null
    },
    {
      ID: 3,
      FullName: "Sharath Kumar",
      Email: "sharath@example.com",
      PasswordHash: "$2a$10$Q4IcyohhMOT49iyx0nRYqOaIVnZrh0b7nYn9CHZsiQEbV1rB6Rz4q",
      Phone: "9876543210",
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "approved", // one approved for demo
      EmailVerified: true,
      EmailVerifiedAt: "2025-07-10T10:00:00Z",
      CreatedAt: "2025-07-10T10:00:00Z",
      UpdatedAt: "2025-07-10T10:00:00Z",
      DeletedAt: null
    },
    {
      ID: 4,
      FullName: "Rajesh K",
      Email: "rajesh@example.com",
      PasswordHash: "$2a$10$Q4IcyohhMOT49iyx0nRYqOaIVnZrh0b7nYn9CHZsiQEbV1rB6Rz4q",
      Phone: "8765432109",
      RoleID: 2,
      Role: {
        ID: 0,
        RoleName: "templeadmin",
        Description: "Temple Administrator",
        CanRegisterPublicly: true,
        CreatedAt: "2025-01-01T00:00:00Z",
        UpdatedAt: "2025-01-01T00:00:00Z"
      },
      EntityID: null,
      Status: "rejected", // one rejected for demo
      EmailVerified: false,
      EmailVerifiedAt: null,
      CreatedAt: "2025-07-09T15:30:00Z",
      UpdatedAt: "2025-07-09T17:45:00Z",
      DeletedAt: null
    }
  ]
  
  // Method to get pending tenants
  getMockPendingTenants() {
    return this._mockTenants.filter(t => t.Status === 'pending');
  }
  
  // Method to get all tenants
  getMockAllTenants() {
    return this._mockTenants;
  }
  
  // Method to update tenant status in mock data
  updateMockTenantStatus(tenantId, status) {
    // Make sure ID is treated as a number for comparison
    const id = parseInt(tenantId);
    
    this._mockTenants = this._mockTenants.map(tenant => {
      if (tenant.ID === id) {
        return {
          ...tenant,
          Status: status,
          UpdatedAt: new Date().toISOString()
        };
      }
      return tenant;
    });
    
    console.log(`Mock tenant ${tenantId} status updated to ${status}`);
  }
  
  // Generate mock entities data
  getMockPendingEntities() {
    return [
      {
        ID: 1,
        Name: "Sri Venkateswara Temple",
        Description: "Famous temple dedicated to Lord Venkateswara",
        Type: "Hindu",
        Address: "123 Temple Street",
        City: "Bengaluru",
        State: "Karnataka",
        Country: "India",
        Zip: "560001",
        Phone: "9876543210",
        Email: "info@svtemple.com",
        Website: "www.svtemple.com",
        TenantID: 1,
        Status: "pending",
        CreatedBy: 1,
        CreatedAt: "2025-07-11T10:00:00Z",
        UpdatedAt: "2025-07-11T10:00:00Z"
      },
      {
        ID: 2,
        Name: "Ganesh Mandir",
        Description: "Temple dedicated to Lord Ganesha",
        Type: "Hindu",
        Address: "456 Temple Lane",
        City: "Chennai",
        State: "Tamil Nadu",
        Country: "India",
        Zip: "600001",
        Phone: "8765432109",
        Email: "info@ganeshmandir.com",
        Website: "www.ganeshmandir.com",
        TenantID: 2,
        Status: "pending",
        CreatedBy: 2,
        CreatedAt: "2025-07-12T11:30:00Z",
        UpdatedAt: "2025-07-12T11:30:00Z"
      }
    ];
  }
  
  // Generate mock available tenants for user assignment
  getMockAvailableTenants() {
    return [
      {
        id: 1,
        userId: "T001",
        name: "Sri Krishna Trust",
        temple: {
          id: 101,
          name: "Sri Krishna Temple",
          address: "123 Temple Street, Bengaluru, KA"
        }
      },
      {
        id: 2,
        userId: "T002",
        name: "Ganesh Temple Trust",
        temple: {
          id: 102,
          name: "Ganesh Temple",
          address: "456 Mandir Road, Mysore, KA"
        }
      },
      {
        id: 3,
        userId: "T003",
        name: "Shiva Temple Trust",
        temple: {
          id: 103,
          name: "Shiva Temple",
          address: "789 Divine Lane, Hassan, KA"
        }
      },
      {
        id: 4,
        userId: "T004",
        name: "Lakshmi Temple Association",
        temple: {
          id: 104,
          name: "Lakshmi Temple",
          address: "101 Prosperity Avenue, Mangalore, KA"
        }
      },
      {
        id: 5,
        userId: "T005",
        name: "Saraswati Education Trust",
        temple: {
          id: 105,
          name: "Saraswati Temple",
          address: "202 Knowledge Street, Hubli, KA"
        }
      }
    ];
  }
  
  // Generate mock activities data
  getMockActivities(limit = 10) {
    const activities = [
      {
        id: 1,
        type: 'approval',
        description: 'Approved temple admin registration',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: 2,
        type: 'approval',
        description: 'Approved new temple registration',
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: 3,
        type: 'new_application',
        description: 'Created new temple',
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: 4,
        type: 'rejection',
        description: 'Rejected temple admin registration due to incomplete information',
        timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
      },
      {
        id: 5,
        type: 'new_application',
        description: 'Received donation of ₹5000',
        timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      },
      {
        id: 6,
        type: 'new_application',
        description: 'Created new temple event: Ganesh Chaturthi Celebration',
        timestamp: new Date(Date.now() - 345600000).toISOString() // 4 days ago
      },
      {
        id: 7,
        type: 'new_application',
        description: 'Booked seva: Abhishekam',
        timestamp: new Date(Date.now() - 432000000).toISOString() // 5 days ago
      }
    ];
    
    return activities.slice(0, limit);
  }
}


// Create and export singleton instance
const superAdminService = new SuperAdminService()
export default superAdminService