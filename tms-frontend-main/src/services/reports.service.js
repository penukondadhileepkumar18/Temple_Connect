import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth' 

class ReportsService {


  // ===============================
  // NEW: TENANT DETAILS METHODS
  // ===============================
  
  /**
   * Get all tenant details for superadmin
   * @returns {Promise<Array>} - List of tenants with details
   */
  async getAllTenantDetails() {
    try {
      console.log('📋 Fetching all tenant details...');
      
      // Try the new endpoint first
      try {
        const response = await api.get('/tenant-details');
        console.log('✅ Tenant details fetched successfully');
        return response.data;
      } catch (error) {
        console.log('⚠️ New endpoint failed, trying fallback...');
        // Fallback to existing tenants endpoint
        const response = await api.get('/superadmin/tenants');
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error fetching tenant details:', error);
      throw error;
    }
  }

  /**
   * Get specific tenant details by ID
   * @param {string|number} tenantId - The tenant ID
   * @returns {Promise<Object>} - Tenant details with temples/entities
   */
  async getTenantDetailsById(tenantId) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    try {
      console.log(`📋 Fetching tenant details for ID: ${tenantId}`);
      
      // Try the new specific tenant endpoint
      try {
        const response = await api.get(`/tenant-details/${tenantId}`);
        console.log('✅ Specific tenant details fetched successfully');
        return response.data;
      } catch (error) {
        console.log('⚠️ Specific endpoint failed, trying alternative...');
        
        // Fallback to entities endpoint with tenant filter
        const response = await api.get(`/entities`, {
          params: { tenant_id: tenantId }
        });
        
        return {
          id: tenantId,
          entities: response.data,
          temples: response.data // Alias for backward compatibility
        };
      }
    } catch (error) {
      console.error(`❌ Error fetching tenant details for ${tenantId}:`, error);
      throw error;
    }
  }

  // ===============================
  // Utility to build query params
  // ===============================
  buildQueryParams(filters) {
    const queryParams = new URLSearchParams()

    // Common filters
    if (filters.dateRange) queryParams.append('date_range', filters.dateRange)
    if (filters.format) queryParams.append('format', filters.format)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.role && ["Tenant", "Temple"].includes(filters.role)) {
  queryParams.append('role', filters.role)
}

    // Handle custom date ranges
    if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      queryParams.append('start_date', filters.startDate)
      queryParams.append('end_date', filters.endDate)
    }

    return queryParams
  }

  // ===============================
  // Utility to build report URLs
  // ===============================
  buildReportURL({ isSuperAdmin, entityId, entityIds, endpoint, queryParams }) {
    // Special case for approval-status endpoint - it should always go to the superadmin route
    if (endpoint === 'approval-status') {
      return `/superadmin/reports/${endpoint}?${queryParams}`;
    }
    
    // Special case for user-details endpoint - also always goes to superadmin route
    if (endpoint === 'user-details') {
      return `/superadmin/reports/${endpoint}?${queryParams}`;
    }
    
    // Regular logic for other reports
    if (isSuperAdmin) {
      if (entityIds && entityIds.length > 1) {
        return `/superadmin/reports/${endpoint}?${queryParams}&entities=${entityIds.join(',')}`;
      } else {
        // Fallback: single entity (superadmin scope)
        return `/superadmin/entities/${entityId}/reports/${endpoint}?${queryParams}`;
      }
    } else {
      // Tenant scope
      return `/entities/${entityId}/reports/${endpoint}?${queryParams}`;
    }
  }

  // ===============================
  // APPROVAL STATUS REPORT METHODS
  // ===============================
  async getApprovalStatusReport(params) {
    const { entityId, entityIds, isSuperAdmin } = params
    if (!entityId && !entityIds) throw new Error('Entity ID or Entity IDs are required')

    const queryParams = this.buildQueryParams(params)
    const url = this.buildReportURL({ ...params, endpoint: 'approval-status', queryParams })

    console.log('📊 Approval Status API request:', url)
    return api.get(url)
  }

  /**
   * Download approval status report in specified format
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} - Download result
   */
  async downloadApprovalStatusReport(params) {
    try {
      const { entityId, entityIds, format } = params;
      if ((!entityId && !entityIds) || !format) {
        throw new Error('Entity ID (or IDs) and format are required');
      }

      // Build query params
      const queryParams = this.buildQueryParams(params);
      
      // Use the buildReportURL method to construct the URL correctly
      const url = this.buildReportURL({ 
        ...params, 
        endpoint: 'approval-status', 
        queryParams 
      });

      // Call download method
      return this.downloadReport(url, { format }, 'approval_status_report');
    } catch (error) {
      console.error('Error downloading approval status report:', error);
      throw error;
    }
  }

  /**
   * Get approval status preview data for display
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} - Preview data
   */
  async getApprovalStatusPreview(params) {
    const response = await this.getApprovalStatusReport(params)
    const data = response.data?.data || response.data || []

    const columns = [
      { key: 'item_name', label: 'Item Name' },
      { key: 'item_type', label: 'Type' },
      { key: 'submitted_by', label: 'Submitted By' },
      { key: 'submitted_date', label: 'Submitted Date' },
      { key: 'status', label: 'Status' },
      { key: 'approved_by', label: 'Approved By' },
      { key: 'approval_date', label: 'Approval Date' },
      { key: 'comments', label: 'Comments' }
    ]

    return {
      data: Array.isArray(data)
        ? data.map(item => ({
            ...item,
            submitted_date: item.submitted_date ? this.formatDate(item.submitted_date) : '-',
            approval_date: item.approval_date ? this.formatDate(item.approval_date) : '-'
          }))
        : [],
      columns,
      totalRecords: Array.isArray(data) ? data.length : 0
    }
  }

  // ===============================
  // USER DETAILS REPORT METHODS
  // ===============================
  // Modified sections in reports.service.js

async getUserDetailsReport(params) {
  const { entityId, entityIds, role, status, dateRange = 'monthly', startDate, endDate, isSuperAdmin } = params;

  if (!entityId && !entityIds) {
    throw new Error('Entity ID or Entity IDs are required');
  }

  const queryParams = new URLSearchParams({
    date_range: dateRange
  });

  if (role && role !== 'all') {
    queryParams.append('role', role);
  }

  if (status && status !== 'all') {
    queryParams.append('status', status);
  }

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate);
    queryParams.append('end_date', endDate);
  }

  // The only valid URL pattern is for superadmin
  let url;
  
  if (isSuperAdmin) {
    if (entityIds && entityIds.length > 1) {
      url = `/superadmin/reports/user-details?${queryParams}&tenants=${entityIds.join(',')}`;
    } else {
      url = `/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
    }
  } else {
    // For non-superadmin, there is no directly registered route, so we'll use
    // the superadmin route with tenant_id parameter
    url = `/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
  }

  console.log('👥 User Details API request:', url);
  return api.get(url);
}

async getUserDetailsPreview(params) {
  try {
    const response = await this.getUserDetailsReport(params);
    
    console.log('User Details preview response:', response);
    
    let responseData = response.data;
    
    // Handle different response structures
    if (responseData && responseData.data) {
      responseData = responseData.data;
    }
    
    const columns = [
      { key: 'name', label: 'User Name' },
      { key: 'email', label: 'Email' },
      { key: 'entity_name', label: 'Entity/Tenant' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created At' }
    ];
    
    // Handle different response formats
    let previewData = [];
    
    if (Array.isArray(responseData)) {
      previewData = responseData;
    } else if (responseData && responseData.user_details) {
      previewData = responseData.user_details;
    } else if (responseData && Array.isArray(responseData.data)) {
      previewData = responseData.data;
    } else {
      console.warn('⚠️ No valid user details data found in response:', responseData);
      previewData = [];
    }
    
    // Format date fields for better display
    previewData = previewData.map(item => ({
      ...item,
      created_at: item.created_at ? this.formatDate(item.created_at) : '-'
    }));
    
    console.log('📋 Final preview data:', previewData);
    
    return {
      data: previewData,
      columns,
      totalRecords: previewData.length || 0
    };
  } catch (error) {
    console.error('❌ Error getting user details preview:', error);
    throw error;
  }
}

// Update the downloadUserDetailsReport method in reports.service.js

async downloadUserDetailsReport(params) {
  const { entityId, entityIds, role, status, dateRange = 'monthly', startDate, endDate, format, isSuperAdmin } = params;

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required');
  }

  // Build query parameters
  const queryParams = new URLSearchParams({
    date_range: dateRange,
    format: format
  });

  // Fix the role mapping: map 'tenant' to 'templeadmin' if needed
  if (role && role !== 'all') {
    // If role is 'tenant', convert it to 'templeadmin' for the backend
    const mappedRole = role === 'tenant' ? 'templeadmin' : role;
    queryParams.append('role', mappedRole);
  }

  if (status && status !== 'all') {
    queryParams.append('status', status);
  }

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate);
    queryParams.append('end_date', endDate);
  }

  // Rest of the method remains the same...
  let url;
  if (isSuperAdmin) {
    if (entityIds && entityIds.length > 1) {
      url = `/superadmin/reports/user-details?${queryParams}&tenants=${entityIds.join(',')}`;
    } else {
      url = `/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
    }
  } else {
    url = `/superadmin/reports/user-details?${queryParams}&tenant_id=${entityId}`;
  }

  try {
    console.log('👥 Downloading user details report:', url);
    return await this.downloadReport(url, { format }, 'user_details_report', async () => {
      // Fallback function remains the same...
      if (isSuperAdmin) {
        const alternatives = [
          entityIds && entityIds.length > 1
            ? `/superadmin/user-details/report?${queryParams}&tenants=${entityIds.join(',')}`
            : `/superadmin/user-details/report?${queryParams}&tenant_id=${entityId}`,
          entityIds && entityIds.length > 1
            ? `/superadmin/entities/reports/user-details?${queryParams}&tenants=${entityIds.join(',')}`
            : `/entities/${entityId}/reports/user-details?${queryParams}`
        ];
        return alternatives;
      }
      return null;
    });
  } catch (error) {
    console.error('Error downloading user details report:', error);
    throw error;
  }
}
// ===============================================
// ACTIVITIES REPORT METHODS - reports.service.js
// Updated to use direct entity endpoints for single temple selection
// ===============================================

/**
 * Get activities report data (JSON preview)
 */
async getActivitiesReport(params) {
  const { entityId, entityIds, type, dateRange = 'weekly', startDate, endDate, isSuperAdmin, tenantId, singleTemple } = params
  
  console.log('📊 getActivitiesReport called with:', {
    entityId,
    entityIds,
    type,
    isSuperAdmin,
    tenantId,
    singleTemple
  });
  
  if ((!entityId && !entityIds) || !type) {
    throw new Error('Entity ID (or IDs) and type are required')
  }

  const queryParams = new URLSearchParams({
    type,
    date_range: dateRange
  })

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate)
    queryParams.append('end_date', endDate)
  }

  let url;
  let response;
  
  // CRITICAL: Check isSuperAdmin parameter FIRST
  if (isSuperAdmin) {
    console.log('🔑 SuperAdmin preview detected');
    
    try {
      // ⭐ SINGLE TEMPLE: Use direct entity endpoint
      if (singleTemple && entityId && entityId !== 'all') {
        url = `/entities/${entityId}/reports/activities?${queryParams}`
        console.log('📊 Single temple API call (direct entity endpoint):', {
          url,
          templeId: entityId,
          type
        })
      }
      // MULTI-TENANT: Multiple tenants selected
      else if (entityIds && entityIds.length > 1) {
        url = `/superadmin/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
        console.log('📊 Multi-tenant API call:', { url, tenantCount: entityIds.length })
      }
      // ALL TEMPLES for single tenant
      else if (tenantId && (entityId === 'all' || !entityId)) {
        url = `/superadmin/tenants/${tenantId}/reports/activities?${queryParams}`
        console.log('📊 All temples for tenant:', { url, tenantId })
      } 
      // Fallback for superadmin with specific entity
      else if (entityId && entityId !== 'all') {
        url = `/entities/${entityId}/reports/activities?${queryParams}`
        console.log('📊 SuperAdmin single entity fallback:', url)
      } else {
        url = `/superadmin/tenants/${tenantId || entityId}/reports/activities?${queryParams}`
        console.log('📊 SuperAdmin tenant fallback:', url)
      }
      
      console.log('📊 Making primary activities API request:', url)
      response = await api.get(url)
      
    } catch (error) {
      console.log('Primary API endpoint failed, trying fallback:', error.message)
      
      // FALLBACK logic remains the same...
      try {
        if (singleTemple && entityId) {
          url = `/superadmin/activities/report?${queryParams}&entity_id=${entityId}`
          if (tenantId) {
            url += `&tenant_id=${tenantId}`
          }
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/activities/report?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/superadmin/activities/report?${queryParams}&tenant_id=${tenantId || entityId}`
        }
        
        console.log('📊 Fallback 1:', url)
        response = await api.get(url)
        
      } catch (error2) {
        console.log('Second fallback failed, trying third pattern:', error2.message)
        
        if (singleTemple && entityId && tenantId) {
          url = `/superadmin/tenants/${tenantId}/reports/activities?${queryParams}&entity_id=${entityId}`
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/entities/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/entities/${entityId}/reports/activities?${queryParams}`
        }
        
        console.log('📊 Fallback 2:', url)
        response = await api.get(url)
      }
    }
  } else {
    // Regular tenant user
    console.log('👤 Standard user preview');
    
    if (entityId === 'all') {
      url = `/entities/all/reports/activities?${queryParams}`
    } else {
      url = `/entities/${entityId}/reports/activities?${queryParams}`
    }
    
    console.log('📊 Making activities API request:', url)
    response = await api.get(url)
  }
  
  console.log('✅ Activities API Response received:', response)
  return response
}

/**
 * Download activities report in specified format
 */
async downloadActivitiesReport(params) {
  const { entityId, entityIds, type, format, dateRange = 'weekly', startDate, endDate, isSuperAdmin, tenantId, singleTemple } = params
  
  console.log('📥 downloadActivitiesReport called with:', {
    entityId,
    entityIds,
    type,
    format,
    isSuperAdmin,
    tenantId,
    singleTemple
  });
  
  if ((!entityId && !entityIds) || !type || !format) {
    throw new Error('Entity ID (or IDs), type, and format are required')
  }

  const queryParams = new URLSearchParams({
    type,
    date_range: dateRange,
    format
  })

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate)
    queryParams.append('end_date', endDate)
  }

  let url;
  
  // CRITICAL: Check isSuperAdmin FIRST, not user role detection
  if (isSuperAdmin) {
    console.log('🔑 SuperAdmin download detected');
    
    // ⭐ SINGLE TEMPLE: Use direct entity endpoint
    if (singleTemple && entityId && entityId !== 'all') {
      url = `/entities/${entityId}/reports/activities?${queryParams}`
      console.log('📥 Single temple download (direct entity endpoint):', {
        url,
        templeId: entityId,
        type
      })
    }
    // MULTI-TENANT
    else if (entityIds && entityIds.length > 1) {
      url = `/superadmin/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
      console.log('📥 Multi-tenant download:', url)
    }
    // ALL TEMPLES for single tenant
    else if (tenantId && (entityId === 'all' || !entityId)) {
      url = `/superadmin/tenants/${tenantId}/reports/activities?${queryParams}`
      console.log('📥 All temples for tenant download:', url)
    } 
    // Fallback for superadmin
    else if (entityId && entityId !== 'all') {
      url = `/entities/${entityId}/reports/activities?${queryParams}`
      console.log('📥 SuperAdmin single entity fallback:', url)
    } else {
      url = `/superadmin/tenants/${tenantId || entityId}/reports/activities?${queryParams}`
      console.log('📥 SuperAdmin tenant fallback:', url)
    }
  } else {
    // Standard/tenant user
    console.log('👤 Standard user download');
    
    if (entityId === 'all') {
      url = `/entities/all/reports/activities?${queryParams}`
      console.log('📥 All temples for tenant user:', url)
    } else {
      url = `/entities/${entityId}/reports/activities?${queryParams}`
      console.log('📥 Single temple for tenant user:', url)
    }
  }

  console.log('🔄 Final download URL:', url);

  try {
    return await this.downloadReport(url, { format }, `${type}_report`, async () => {
      // Fallback function for alternative URLs if the first one fails
      if (isSuperAdmin) {
        const alternatives = [];
        
        if (singleTemple && entityId && entityId !== 'all') {
          // Single temple alternatives
          alternatives.push(
            `/superadmin/activities/report?${queryParams}&entity_id=${entityId}${tenantId ? `&tenant_id=${tenantId}` : ''}`,
            `/superadmin/tenants/${tenantId || entityId}/reports/activities?${queryParams}&entity_id=${entityId}`
          )
        } else if (entityIds && entityIds.length > 1) {
          // Multi-tenant alternatives
          alternatives.push(
            `/superadmin/activities/report?${queryParams}&tenants=${entityIds.join(',')}`,
            `/superadmin/entities/reports/activities?${queryParams}&tenants=${entityIds.join(',')}`
          )
        } else {
          // All temples for single tenant alternatives
          alternatives.push(
            `/superadmin/activities/report?${queryParams}&tenant_id=${tenantId || entityId}`,
            `/entities/${entityId}/reports/activities?${queryParams}`
          )
        }
        
        console.log('🔄 Fallback URLs:', alternatives);
        return alternatives;
      }
      return null; // No alternatives for regular users
    });
  } catch (error) {
    console.error('Error downloading activities report:', error)
    throw error
  }
}

/**
 * Get report preview data for display
 */
async getReportPreview(params) {
  try {
    const response = await this.getActivitiesReport(params)
    
    console.log('📊 API Response Structure:', response)
    console.log('📊 Response Data:', response.data)
    
    let responseData = response.data
    
    if (responseData && responseData.data) {
      responseData = responseData.data
    }
    
    if (!responseData) {
      console.warn('⚠️ No data found in response')
      responseData = {}
    }
    
    let previewData = []
    let columns = []

    switch (params.type) {
      case 'events':
        columns = [
          { key: 'title', label: 'Event Title' },
          { key: 'event_type', label: 'Type' },
          { key: 'event_date', label: 'Date' },
          { key: 'location', label: 'Location' },
          { key: 'created_by', label: 'Created By' }
        ]
        previewData = responseData.events || responseData.Events || []
        break
        
      case 'sevas':
        columns = [
          { key: 'name', label: 'Seva Name' },
          { key: 'seva_type', label: 'Type' },
          { key: 'price', label: 'Price' },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Status' }
        ]
        previewData = responseData.sevas || responseData.Sevas || []
        break
        
      case 'bookings':
        columns = [
          { key: 'seva_name', label: 'Seva' },
          { key: 'devotee_name', label: 'Devotee' },
          { key: 'devotee_phone', label: 'Phone' },
          { key: 'booking_time', label: 'Booking Time' },
          { key: 'status', label: 'Status' }
        ]
        previewData = responseData.bookings || responseData.Bookings || []
        break
        
      case 'donations':
        columns = [
          { key: 'donor_name', label: 'Donor Name' },
          { key: 'amount', label: 'Amount' },
          { key: 'donation_type', label: 'Type' },
          { key: 'payment_method', label: 'Payment Method' },
          { key: 'status', label: 'Status' },
          { key: 'donation_date', label: 'Donation Date' }
        ]
        previewData = responseData.donations || responseData.Donations || []
        break
    }

    console.log('📋 Extracted preview data:', previewData)
    console.log('📋 Columns:', columns)

    return {
      data: previewData,
      columns,
      totalRecords: previewData.length
    }
  } catch (error) {
    console.error('❌ Error getting report preview:', error)
    throw error
  }
}

/**
 * Validate report parameters
 */
validateReportParams(params) {
  const errors = []

  if (!params.entityId && !params.entityIds) {
    errors.push('Entity ID or Entity IDs are required')
  }

  if (!params.type || !['events', 'sevas', 'bookings', 'donations', 'temple-registered', 'devotee-birthdays'].includes(params.type)) {
    errors.push('Valid report type is required (events, sevas, bookings, donations, temple-registered, devotee-birthdays)')
  }

  if (params.type === 'temple-registered') {
    const validStatuses = ['approved', 'rejected', 'pending']
    if (params.status && !validStatuses.includes(params.status)) {
      errors.push(`Invalid status filter. Allowed values: ${validStatuses.join(', ')}`)
    }
  }

  if (params.dateRange === 'custom') {
    if (!params.startDate || !params.endDate) {
      errors.push('Start date and end date are required for custom date range')
    } else if (new Date(params.startDate) > new Date(params.endDate)) {
      errors.push('Start date must be before end date')
    }
  }

  if (params.format && !['pdf', 'csv', 'excel'].includes(params.format)) {
    errors.push('Invalid format specified')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}


  // TEMPLE REGISTERED METHODS
  async getTempleRegisteredReport(params) {
    const { entityId, entityIds, status, dateRange = 'weekly', startDate, endDate, isSuperAdmin } = params

    if (!entityId && !entityIds) {
      throw new Error('Entity ID or Entity IDs are required')
    }

    const queryParams = new URLSearchParams({
      date_range: dateRange,
    })

    if (status) {
      queryParams.append('status', status)
    }

    if (dateRange === 'custom' && startDate && endDate) {
      queryParams.append('start_date', startDate)
      queryParams.append('end_date', endDate)
    }

    let url;
    let response;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      try {
        // First try with superadmin/tenants endpoint
        if (entityIds && entityIds.length > 1) {
          url = `/superadmin/reports/temple-registered?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}`
        }
        
        console.log('Making primary API request:', url)
        response = await api.get(url)
      } catch (error) {
        console.log('Primary API endpoint failed, trying fallback:', error.message)
        
        // Fallback to alternative superadmin endpoint structure
        try {
          if (entityIds && entityIds.length > 1) {
            url = `/superadmin/temple-registered/report?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/superadmin/temple-registered/report?${queryParams}&tenant_id=${entityId}`
          }
          
          console.log('Making fallback API request:', url)
          response = await api.get(url)
        } catch (error2) {
          console.log('Second fallback failed, trying third pattern:', error2.message)
          
          // Try one more pattern
          if (entityIds && entityIds.length > 1) {
            url = `/superadmin/entities/reports/temple-registered?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/entities/${entityId}/reports/temple-registered?${queryParams}`
          }
          
          console.log('Making third fallback API request:', url)
          response = await api.get(url)
        }
      }
    } else {
      // Regular entity endpoint
      url = `/entities/${entityId}/reports/temple-registered?${queryParams}`
      console.log('Making API request:', url)
      response = await api.get(url)
    }
    
    return response
  }

// Fix for reports.service.js downloadTempleRegisteredReport method

// --- UPDATED downloadTempleRegisteredReport method for reports.service.js ---

async downloadTempleRegisteredReport(params) {
  const { entityId, entityIds, templeId, status, dateRange = 'weekly', startDate, endDate, format, isSuperAdmin } = params;

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required');
  }

  console.log('🔍 Temple Register Report Params:', { 
    entityId, 
    entityIds, 
    templeId,
    isSuperAdmin,
    format
  });

  const queryParams = new URLSearchParams({
    date_range: dateRange,
    format
  });

  if (status) {
    queryParams.append('status', status);
  }

  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate);
    queryParams.append('end_date', endDate);
  }

  // Standard auth headers - needed for all requests
  const headers = {
    'Accept': this.getAcceptHeader(format),
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Cache-Control': 'no-cache'
  };

  // Log headers for debugging
  console.log('🔑 Using headers:', JSON.stringify(headers));

  // Define URLs to try and their priority
  const urlsToTry = [];
  
  // --- TENANT USER PATHS (keep existing working functionality) ---
  if (!isSuperAdmin) {
    if (templeId === 'all') {
      // For "All Temples" - tenant users
      urlsToTry.push(
        // Primary URL - known to work for tenant users
        `/entities/all/reports/temple-registered?${queryParams}`
      );
    } else {
      // For specific temple - tenant users
      urlsToTry.push(
        // Primary URL - known to work for tenant users
        `/entities/${templeId}/reports/temple-registered?${queryParams}`
      );
    }
  } 
  // --- SUPERADMIN PATHS (specialized handling) ---
  else {
    // CRITICAL: For Superadmin with multiple tenants and "All Temples"
    if (entityIds && entityIds.length > 0 && templeId === 'all') {
      // For multiple tenants AND "All Temples" - superadmin
      
      // Add tenant_ids parameter for multiple tenants
      const tenantsParam = entityIds.join(',');
      
      // Explicit option 1: Use report-all path with tenants list
      urlsToTry.push(
        `/superadmin/reports/all-temples?${queryParams}&tenants=${tenantsParam}`,
        `/superadmin/reports/temple-registered/all?${queryParams}&tenants=${tenantsParam}`
      );
      
      // Explicit option 2: Use standard path with all_temples flag
      urlsToTry.push(
        `/superadmin/reports/temple-registered?${queryParams}&tenants=${tenantsParam}&all_temples=true`,
        `/superadmin/reports/temple-registered?${queryParams}&tenants=${tenantsParam}&temple_id=all`
      );
      
      // Separate parameter format
      urlsToTry.push(
        `/superadmin/temple-registered?${queryParams}&tenant_ids=${tenantsParam}&all=true`
      );
      
      // Try without including temple_id parameter
      urlsToTry.push(
        `/superadmin/reports/temple-registered?${queryParams}&tenants=${tenantsParam}`
      );
      
      // Try individual tenant URLs with include_all flag
      for (const tid of entityIds) {
        urlsToTry.push(
          `/superadmin/tenants/${tid}/reports/temple-registered?${queryParams}&include_all=true`
        );
      }
    }
    // For Superadmin with single tenant and "All Temples" or specific temple
    else {
      if (templeId === 'all') {
        // For single tenant AND "All Temples" - superadmin
        urlsToTry.push(
         // `/superadmin/tenants/${entityId}/reports/all-temples?${queryParams}`,
          `/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}&all=true`,
          `/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}&temple_id=all`,
          `/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}`
        );
      } else {
        // For single tenant AND specific temple - superadmin (working case)
        urlsToTry.push(
          `/superadmin/tenants/${entityId}/reports/temple-registered?${queryParams}&temple_id=${templeId}`,
          `/superadmin/tenants/${entityId}/temples/${templeId}/reports?${queryParams}`
        );
      }
    }
  }
  
  // Common fallbacks as last resort
  urlsToTry.push(
    `/reports/temple-registered?${queryParams}`,
    `/reports/temples?${queryParams}`,
    `/entities/all/reports/temple-registered?${queryParams}`
  );
  
  console.log('🔄 URLs to try:', urlsToTry);
  
  // Try each URL until one succeeds
  let response = null;
  let successUrl = '';
  
  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i];
    console.log(`🔄 Attempt ${i+1}/${urlsToTry.length}: ${url}`);
    
    try {
      response = await fetch("/api/v1" + url, {
        method: 'GET',
        headers: headers
      });
      
      if (response.ok) {
        console.log(`✅ Success with URL: ${url}`);
        successUrl = url;
        break;
      } else {
        const errorText = await response.text().catch(() => 'Unable to get error text');
        console.log(`❌ URL failed with status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error with URL: ${error.message}`);
    }
  }
  
  // Handle case where all attempts failed
  if (!response || !response.ok) {
    throw new Error('All download attempts failed. Please check your permissions or contact support.');
  }
  
  // Check for empty response
  const blob = await response.blob();
  if (blob.size === 0) {
    console.error('✅ Success but empty file (0 bytes) from URL:', successUrl);
    throw new Error('No data available for the selected criteria. The server returned an empty file.');
  }
  
  console.log(`✅ Successfully downloaded ${blob.size} bytes of data from URL: ${successUrl}`);
  
  // Create and trigger download
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `temple_register_report_${timestamp}.${format}`;
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  
  return { success: true, filename, size: blob.size };
}

  async getTempleRegisteredPreview(params) {
    try {
      const response = await this.getTempleRegisteredReport(params)

      let responseData = response.data
      if (responseData && responseData.data) {
        responseData = responseData.data
      }

      const columns = [
        { key: 'temple_name', label: 'Temple Name' },
        { key: 'registration_date', label: 'Registration Date' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status' }
      ]

      const previewData = responseData.temples || responseData || []

      return {
        data: previewData,
        columns,
        totalRecords: previewData.length || 0
      }
    } catch (error) {
      console.error('Error getting temple-registered preview:', error)
      throw error
    }
  }

// ===============================================
// COMPLETE DEVOTEE REPORTS SERVICE CODE
// File: reports.service.js
// Using /entities/{id} endpoint for single temple selection
// ===============================================

// ============================================
// DEVOTEE BIRTHDAYS METHODS
// ============================================

async getDevoteeBirthdaysReport(params) {
  const { entityId, entityIds, dateRange = 'monthly', startDate, endDate, isSuperAdmin, tenantId, singleTemple } = params

  if (!entityId && !entityIds) {
    throw new Error('Entity ID or Entity IDs are required')
  }

  const queryParams = new URLSearchParams({
    date_range: dateRange,
  })

  // For birthdays, we need to handle date range differently
  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate)
    queryParams.append('end_date', endDate)
  } else {
    // For birthdays, set appropriate default dates
    const today = new Date()
    let calculatedStartDate, calculatedEndDate
    
    switch (dateRange) {
      case 'weekly':
        calculatedStartDate = new Date()
        calculatedEndDate = new Date()
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 7)
        break
      case 'monthly':
        calculatedStartDate = new Date()
        calculatedEndDate = new Date()
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
        break
      case 'yearly':
        calculatedStartDate = new Date(today.getFullYear(), 0, 1)
        calculatedEndDate = new Date(today.getFullYear(), 11, 31)
        break
      default:
        calculatedStartDate = new Date()
        calculatedEndDate = new Date()
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
    }
    
    queryParams.append('start_date', calculatedStartDate.toISOString().split('T')[0])
    queryParams.append('end_date', calculatedEndDate.toISOString().split('T')[0])
  }

  let url;
  let response;
  
  // Choose the right API endpoint based on user role
  if (isSuperAdmin) {
    try {
      // ⭐ SINGLE TEMPLE: Use direct entity endpoint
      if (singleTemple && entityId) {
        url = `/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
        console.log('🎂 Single temple API call (direct entity endpoint):', {
          url,
          templeId: entityId,
          note: 'Using /entities/{id} for single temple'
        })
      } 
      // MULTI-TENANT: Multiple tenants selected
      else if (entityIds && entityIds.length > 1) {
        url = `/superadmin/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
        console.log('🎂 Multi-tenant API call:', { url, tenantCount: entityIds.length })
      } 
      // ALL TEMPLES for single tenant
      else if (tenantId) {
        url = `/superadmin/tenants/${tenantId}/reports/devotee-birthdays?${queryParams}`
        console.log('🎂 All temples for tenant:', { url, tenantId })
      } else {
        url = `/superadmin/tenants/${entityId}/reports/devotee-birthdays?${queryParams}`
        console.log('🎂 All temples fallback:', { url, entityId })
      }
      
      console.log('🎂 Making primary devotee birthdays API request:', url)
      response = await api.get(url)
      
    } catch (error) {
      console.log('Primary API endpoint failed, trying fallback:', error.message)
      
      // FALLBACK 1: Alternative patterns
      try {
        if (singleTemple && entityId) {
          // Already tried direct entity endpoint, try alternative
          url = `/superadmin/devotee-birthdays/report?${queryParams}&entity_id=${entityId}`
          if (tenantId) {
            url += `&tenant_id=${tenantId}`
          }
          console.log('🎂 Fallback 1 (single temple):', url)
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/devotee-birthdays/report?${queryParams}&tenants=${entityIds.join(',')}`
          console.log('🎂 Fallback 1 (multi-tenant):', url)
        } else {
          url = `/superadmin/devotee-birthdays/report?${queryParams}&tenant_id=${tenantId || entityId}`
          console.log('🎂 Fallback 1 (all temples):', url)
        }
        
        response = await api.get(url)
        
      } catch (error2) {
        console.log('Second fallback failed, trying third pattern:', error2.message)
        
        // FALLBACK 2: Last resort patterns
        if (singleTemple && entityId && tenantId) {
          url = `/superadmin/tenants/${tenantId}/reports/devotee-birthdays?${queryParams}&entity_id=${entityId}`
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/entities/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
        }
        
        console.log('🎂 Fallback 2:', url)
        response = await api.get(url)
      }
    }
  } else {
    // Regular tenant user - Handle 'all' case
    console.log('----------->ENTITYID', entityId)
    
    // Instead of using /entities/all, fetch data for each individual temple and combine
    if (entityId === 'all') {
      const tenantIdForAll = params.tenantId
      
      if (!tenantIdForAll) {
        throw new Error('Tenant ID is required when entityId is "all"')
      }
      
      // Check if we have templeIds in params (from frontend)
      if (params.templeIds && params.templeIds.length > 0) {
        console.log('🎂 Fetching birthdays for multiple temples:', params.templeIds)
        const allData = []
        
        for (const templeId of params.templeIds) {
          try {
            const templeUrl = `/entities/${templeId}/reports/devotee-birthdays?${queryParams}`
            console.log('🎂 Fetching for temple:', templeId, templeUrl)
            const templeResponse = await api.get(templeUrl)
            
            let templeData = templeResponse.data
            if (templeData && templeData.data) {
              templeData = templeData.data
            }
            
            // Extract devotees array from various possible response structures
            let devotees = []
            if (Array.isArray(templeData)) {
              devotees = templeData
            } else if (templeData.devotees) {
              devotees = templeData.devotees
            } else if (templeData.birthdays) {
              devotees = templeData.birthdays
            } else if (templeData.devotee_birthdays) {
              devotees = templeData.devotee_birthdays
            }
            
            allData.push(...devotees)
          } catch (templeError) {
            console.warn(`Failed to fetch birthdays for temple ${templeId}:`, templeError.message)
          }
        }
        
        // Return combined data
        response = {
          data: {
            data: allData,
            devotees: allData,
            total: allData.length
          }
        }
      } else {
        // No specific temples provided, try the all endpoint as fallback
        console.warn('No templeIds provided for "all" selection, trying /entities/all endpoint')
        url = `/entities/all/reports/devotee-birthdays?${queryParams}`
        console.log('🎂 Making devotee birthdays API request:', url)
        response = await api.get(url)
      }
    } else {
      // Specific temple selected - use direct entity endpoint
      url = `/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
      console.log('🎂 Making devotee birthdays API request:', url)
      response = await api.get(url)
    }
  }
  
  console.log('✅ Devotee birthdays API Response received:', response)
  return response
}

async downloadDevoteeBirthdaysReport(params) {
  const { entityId, entityIds, format, dateRange = 'monthly', startDate, endDate, isSuperAdmin, tenantId, singleTemple } = params

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required')
  }

  const queryParams = new URLSearchParams({
    date_range: dateRange,
    format
  })

  // Same date logic as preview method
  if (dateRange === 'custom' && startDate && endDate) {
    queryParams.append('start_date', startDate)
    queryParams.append('end_date', endDate)
  } else {
    const today = new Date()
    let calculatedStartDate, calculatedEndDate
    
    switch (dateRange) {
      case 'weekly':
        calculatedStartDate = new Date()
        calculatedEndDate = new Date()
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 7)
        break
      case 'monthly':
        calculatedStartDate = new Date()
        calculatedEndDate = new Date()
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
        break
      case 'yearly':
        calculatedStartDate = new Date(today.getFullYear(), 0, 1)
        calculatedEndDate = new Date(today.getFullYear(), 11, 31)
        break
      default:
        calculatedStartDate = new Date()
        calculatedEndDate = new Date()
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 30)
    }
    
    queryParams.append('start_date', calculatedStartDate.toISOString().split('T')[0])
    queryParams.append('end_date', calculatedEndDate.toISOString().split('T')[0])
  }

  let url;
  
  // Choose the right API endpoint based on user role
  if (isSuperAdmin) {
    // ⭐ SINGLE TEMPLE: Use direct entity endpoint
    if (singleTemple && entityId) {
      url = `/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
      console.log('📥 Single temple download (direct entity endpoint):', {
        url,
        templeId: entityId
      })
    } 
    // MULTI-TENANT
    else if (entityIds && entityIds.length > 1) {
      url = `/superadmin/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
    } 
    // ALL TEMPLES for single tenant
    else if (tenantId) {
      url = `/superadmin/tenants/${tenantId}/reports/devotee-birthdays?${queryParams}`
    } else {
      url = `/superadmin/tenants/${entityId}/reports/devotee-birthdays?${queryParams}`
    }
  } else {
    // Regular tenant user
    if (entityId !== 'all') {
      url = `/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
    } else {
      // For 'all' temples download, use the first temple ID
      if (params.templeIds && params.templeIds.length > 0) {
        const firstTempleId = params.templeIds[0]
        console.log(`📥 Using first temple (${firstTempleId}) for 'all' download`)
        url = `/entities/${firstTempleId}/reports/devotee-birthdays?${queryParams}`
      } else {
        console.warn('No templeIds provided for "all" download, trying /entities/all')
        url = `/entities/all/reports/devotee-birthdays?${queryParams}`
      }
    }
  }
  
  try {
    return await this.downloadReport(url, { format }, 'devotee_birthdays_report', async () => {
      // Fallback function for alternative URLs if the first one fails
      if (isSuperAdmin) {
        const alternatives = [];
        
        if (singleTemple && entityId) {
          // Single temple alternatives
          alternatives.push(
            `/superadmin/devotee-birthdays/report?${queryParams}&entity_id=${entityId}${tenantId ? `&tenant_id=${tenantId}` : ''}`,
            `/superadmin/tenants/${tenantId || entityId}/reports/devotee-birthdays?${queryParams}&entity_id=${entityId}`
          )
        } else if (entityIds && entityIds.length > 1) {
          alternatives.push(
            `/superadmin/devotee-birthdays/report?${queryParams}&tenants=${entityIds.join(',')}`,
            `/superadmin/entities/reports/devotee-birthdays?${queryParams}&tenants=${entityIds.join(',')}`
          )
        } else {
          alternatives.push(
            `/superadmin/devotee-birthdays/report?${queryParams}&tenant_id=${tenantId || entityId}`,
            `/entities/${entityId}/reports/devotee-birthdays?${queryParams}`
          )
        }
        
        return alternatives;
      }
      return null;
    });
  } catch (error) {
    console.error('Error downloading devotee-birthdays report:', error)
    throw error
  }
}

async getDevoteeBirthdaysPreview(params) {
  try {
    const response = await this.getDevoteeBirthdaysReport(params)

    console.log('🎂 Devotee birthdays preview response:', response)

    let responseData = response.data
    
    // Handle different response structures
    if (responseData && responseData.data) {
      responseData = responseData.data
    }

    console.log('📊 Processed response data:', responseData)

    const columns = [
      { key: 'full_name', label: 'Full Name' },
      { key: 'date_of_birth', label: 'Date of Birth' },
      { key: 'age', label: 'Age' },
      { key: 'gender', label: 'Gender' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'temple_name', label: 'Temple' },
      { key: 'upcoming_birthday', label: 'Upcoming Birthday' }
    ]

    // Handle different response formats more robustly
    let previewData = []
    
    if (Array.isArray(responseData)) {
      previewData = responseData
    } else if (responseData && responseData.devotees) {
      previewData = responseData.devotees
    } else if (responseData && responseData.birthdays) {
      previewData = responseData.birthdays
    } else if (responseData && responseData.devotee_birthdays) {
      previewData = responseData.devotee_birthdays
    } else if (responseData && Array.isArray(responseData.data)) {
      previewData = responseData.data
    } else {
      console.warn('⚠️ No valid devotee birthdays data found in response:', responseData)
      previewData = []
    }

    // Format date fields for better display
    previewData = previewData.map(item => ({
      ...item,
      date_of_birth: item.date_of_birth ? this.formatDate(item.date_of_birth) : '-',
      upcoming_birthday: item.upcoming_birthday ? this.formatDate(item.upcoming_birthday) : '-'
    }))

    console.log('📋 Final preview data:', previewData)

    return {
      data: previewData,
      columns,
      totalRecords: previewData.length || 0
    }
  } catch (error) {
    console.error('❌ Error getting devotee-birthdays preview:', error)
    throw error
  }
}

// ============================================
// DEVOTEE LIST METHODS
// ============================================

async getDevoteeList(params) {
  console.trace()
  console.log('getDevoteeList called with params:', params)
  const { entityId, entityIds, status = 'all', isSuperAdmin, tenantId, singleTemple } = params

  if (!entityId && !entityIds) {
    throw new Error('Entity ID or Entity IDs are required')
  }

  const allowedStatuses = ['all', 'active', 'inactive']
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`)
  }

  const queryParams = new URLSearchParams()
  if (status !== 'all') { 
    queryParams.append('status', status)
  }

  let url;
  let response;
  
  // Choose the right API endpoint based on user role
  console.log('Role:isSuperAdmin', isSuperAdmin)
  if (isSuperAdmin) {
    try {
      // ⭐ SINGLE TEMPLE: Use direct entity endpoint
      if (singleTemple && entityId) {
        url = `/entities/${entityId}/reports/devotee-list?${queryParams}`
        console.log('📋 Single temple API call (direct entity endpoint):', {
          url,
          templeId: entityId,
          note: 'Using /entities/{id} for single temple'
        })
      } 
      // MULTI-TENANT: Multiple tenants selected
      else if (entityIds && entityIds.length > 1) {
        url = `/superadmin/reports/devotee-list?${queryParams}&tenants=${entityIds.join(',')}`
        console.log('📋 Multi-tenant API call:', { url, tenantCount: entityIds.length })
      } 
      // ALL TEMPLES for single tenant
      else if (tenantId) {
        url = `/superadmin/tenants/${tenantId}/reports/devotee-list?${queryParams}`
        console.log('📋 All temples for tenant:', { url, tenantId })
      } else {
        url = `/superadmin/tenants/${entityId}/reports/devotee-list?${queryParams}`
        console.log('📋 All temples fallback:', { url, entityId })
      }
      
      console.log('📋 Making primary devotee list API request:', url)
      response = await api.get(url)
      
    } catch (error) {
      console.log('Primary API endpoint failed, trying fallback:', error.message)
      
      // FALLBACK 1: Alternative patterns
      try {
        if (singleTemple && entityId) {
          url = `/superadmin/devotee-list/report?${queryParams}&entity_id=${entityId}`
          if (tenantId) {
            url += `&tenant_id=${tenantId}`
          }
          console.log('📋 Fallback 1 (single temple):', url)
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/devotee-list/report?${queryParams}&tenants=${entityIds.join(',')}`
          console.log('📋 Fallback 1 (multi-tenant):', url)
        } else {
          url = `/superadmin/devotee-list/report?${queryParams}&tenant_id=${tenantId || entityId}`
          console.log('📋 Fallback 1 (all temples):', url)
        }
        
        response = await api.get(url)
        
      } catch (error2) {
        console.log('Second fallback failed, trying third pattern:', error2.message)
        
        // FALLBACK 2: Last resort
        if (singleTemple && entityId && tenantId) {
          url = `/superadmin/tenants/${tenantId}/reports/devotee-list?${queryParams}&entity_id=${entityId}`
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/entities/reports/devotees?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/entities/${entityId}/reports/devotees?${queryParams}`
        }
        
        console.log('📋 Fallback 2:', url)
        response = await api.get(url)
      }
    }
  } else {
    // Regular entity endpoint
    console.log('----------->ENTITYID', entityId)
    if (entityId !== 'all') {
      url = `/entities/${entityId}/reports/devotee-list?${queryParams}`
    } else {
      url = `/entities/all/reports/devotee-list?${queryParams}`
    }
    console.log('📋 Making devotee list API request:', url)
    response = await api.get(url)
  }
  
  console.log('✅ Devotee list API Response received:', response)
  return response
}

async downloadDevoteeListReport(params) {
  const { entityId, entityIds, status = 'all', format, isSuperAdmin, tenantId, singleTemple } = params

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required')
  }

  const queryParams = new URLSearchParams({ format })
  if (status !== 'all') {
    queryParams.append('status', status)
  }

  let url;
  
  // Choose the right API endpoint based on user role
  if (isSuperAdmin) {
    // ⭐ SINGLE TEMPLE: Use direct entity endpoint
    if (singleTemple && entityId) {
      url = `/entities/${entityId}/reports/devotee-list?${queryParams}`
      console.log('📥 Single temple download (direct entity endpoint):', {
        url,
        templeId: entityId
      })
    } 
    // MULTI-TENANT
    else if (entityIds && entityIds.length > 1) {
      url = `/superadmin/reports/devotee-list?${queryParams}&tenants=${entityIds.join(',')}`
    } 
    // ALL TEMPLES for single tenant
    else if (tenantId) {
      url = `/superadmin/tenants/${tenantId}/reports/devotee-list?${queryParams}`
    } else {
      url = `/superadmin/tenants/${entityId}/reports/devotee-list?${queryParams}`
    }
  } else {
    if (entityId !== 'all') {
      console.log('-->entityId1', entityId)
      url = `/entities/${entityId}/reports/devotee-list?${queryParams}`
    } else {
      console.log('-->>entityId2', entityId)
      url = `/entities/all/reports/devotee-list?${queryParams}`
    }
  }
  
  try {
    return await this.downloadReport(url, { format }, `devotee_list_${status}_report`, async () => {
      // Fallback function for alternative URLs if the first one fails
      if (isSuperAdmin) {
        const alternatives = [];
        
        if (singleTemple && entityId) {
          alternatives.push(
            `/superadmin/devotee-list/report?${queryParams}&entity_id=${entityId}${tenantId ? `&tenant_id=${tenantId}` : ''}`,
            `/superadmin/tenants/${tenantId || entityId}/reports/devotee-list?${queryParams}&entity_id=${entityId}`
          )
        } else if (entityIds && entityIds.length > 1) {
          alternatives.push(
            `/superadmin/devotee-list/report?${queryParams}&tenants=${entityIds.join(',')}`,
            `/superadmin/entities/reports/devotees?${queryParams}&tenants=${entityIds.join(',')}`
          )
        } else {
          alternatives.push(
            `/superadmin/devotee-list/report?${queryParams}&tenant_id=${tenantId || entityId}`,
            `/entities/${entityId}/reports/devotees?${queryParams}`
          )
        }
        
        return alternatives;
      }
      
      return null;
    });
  } catch (error) {
    console.error('Error downloading devotee list report:', error)
    throw error
  }
}

async getDevoteeListPreview(params) {
  try {
    const response = await this.getDevoteeList(params)

    let responseData = response.data
    if (responseData && responseData.data) {
      responseData = responseData.data
    }

    const previewData = responseData.devotees || responseData || []

    const columns = [
      { key: 'full_name', label: 'Full Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
      { key: 'registration_date', label: 'Registration Date' },
      { key: 'last_login', label: 'Last Login' }
    ]

    return {
      data: previewData,
      columns,
      totalRecords: previewData.length || 0
    }
  } catch (error) {
    console.error('Error getting devotee list preview:', error)
    throw error
  }
}

// ============================================
// DEVOTEE PROFILE METHODS
// ============================================

async getDevoteeProfile(params) {
  const { entityId, entityIds, isSuperAdmin, tenantId, singleTemple } = params

  if (!entityId && !entityIds) {
    throw new Error('Entity ID or Entity IDs are required')
  }

  let url;
  let response;
  
  // Choose the right API endpoint based on user role
  if (isSuperAdmin) {
    try {
      // ⭐ SINGLE TEMPLE: Use direct entity endpoint
      if (singleTemple && entityId) {
        url = `/entities/${entityId}/reports/devotee-profile`
        console.log('👤 Single temple API call (direct entity endpoint):', {
          url,
          templeId: entityId
        })
      } 
      // MULTI-TENANT
      else if (entityIds && entityIds.length > 1) {
        url = `/superadmin/reports/devotee-profile?tenants=${entityIds.join(',')}`
      } 
      // ALL TEMPLES for single tenant
      else if (tenantId) {
        url = `/superadmin/tenants/${tenantId}/reports/devotee-profile`
      } else {
        url = `/superadmin/tenants/${entityId}/reports/devotee-profile`
      }
      
      console.log('👤 Making primary devotee profile API request:', url)
      response = await api.get(url)
      
    } catch (error) {
      console.log('Primary API endpoint failed, trying fallback:', error.message)
      
      // FALLBACK 1
      try {
        if (singleTemple && entityId) {
          url = `/superadmin/devotee-profile/report?entity_id=${entityId}`
          if (tenantId) {
            url += `&tenant_id=${tenantId}`
          }
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/devotee-profile/report?tenants=${entityIds.join(',')}`
        } else {
          url = `/superadmin/devotee-profile/report?tenant_id=${tenantId || entityId}`
        }
        
        console.log('👤 Making fallback devotee profile API request:', url)
        response = await api.get(url)
        
      } catch (error2) {
        console.log('Second fallback failed, trying third pattern:', error2.message)
        
        // FALLBACK 2
        if (singleTemple && entityId && tenantId) {
          url = `/superadmin/tenants/${tenantId}/reports/devotee-profile?entity_id=${entityId}`
        } else if (entityIds && entityIds.length > 1) {
          url = `/superadmin/entities/reports/devotee-profile?tenants=${entityIds.join(',')}`
        } else {
          url = `/entities/${entityId}/reports/devotee-profile`
        }
        
        console.log('👤 Making third fallback devotee profile API request:', url)
        response = await api.get(url)
      }
    }
  } else {
    // Regular entity endpoint
    url = `/entities/${entityId}/reports/devotee-profile`
    console.log('👤 Making devotee profile API request:', url)
    response = await api.get(url)
  }
  
  console.log('✅ Devotee profile API Response received:', response)
  return response
}

async downloadDevoteeProfileReport(params) {
  const { entityId, entityIds, format, isSuperAdmin, tenantId, singleTemple } = params

  if ((!entityId && !entityIds) || !format) {
    throw new Error('Entity ID (or IDs) and format are required')
  }

  const queryParams = new URLSearchParams({ format })
  
  let url;
  
  // Choose the right API endpoint based on user role
  if (isSuperAdmin) {
    // ⭐ SINGLE TEMPLE: Use direct entity endpoint
    if (singleTemple && entityId) {
      url = `/entities/${entityId}/reports/devotee-profile?${queryParams}`
      console.log('📥 Single temple download (direct entity endpoint):', {
        url,
        templeId: entityId
      })
    } 
    // MULTI-TENANT
    else if (entityIds && entityIds.length > 1) {
      url = `/superadmin/reports/devotee-profile?${queryParams}&tenants=${entityIds.join(',')}`
    } 
    // ALL TEMPLES for single tenant
    else if (tenantId) {
      url = `/superadmin/tenants/${tenantId}/reports/devotee-profile?${queryParams}`
    } else {
      url = `/superadmin/tenants/${entityId}/reports/devotee-profile?${queryParams}`
    }
  } else {
    url = `/entities/${entityId}/reports/devotee-profile?${queryParams}`
  }
  
  try {
    return await this.downloadReport(url, { format }, 'devotee_profile_report', async () => {
      // Fallback function for alternative URLs if the first one fails
      if (isSuperAdmin) {
        const alternatives = [];
        
        if (singleTemple && entityId) {
          alternatives.push(
            `/superadmin/devotee-profile/report?${queryParams}&entity_id=${entityId}${tenantId ? `&tenant_id=${tenantId}` : ''}`,
            `/superadmin/tenants/${tenantId || entityId}/reports/devotee-profile?${queryParams}&entity_id=${entityId}`
          )
        } else if (entityIds && entityIds.length > 1) {
          alternatives.push(
            `/superadmin/devotee-profile/report?${queryParams}&tenants=${entityIds.join(',')}`,
            `/superadmin/entities/reports/devotee-profile?${queryParams}&tenants=${entityIds.join(',')}`
          )
        } else {
          alternatives.push(
            `/superadmin/devotee-profile/report?${queryParams}&tenant_id=${tenantId || entityId}`,
            `/entities/${entityId}/reports/devotee-profile?${queryParams}`
          )
        }
        
        return alternatives;
      }
      return null;
    });
  } catch (error) {
    console.error('Error downloading devotee profile report:', error)
    throw error
  }
}

async getDevoteeProfilePreview(params) {
  try {
    const response = await this.getDevoteeProfile(params)

    let responseData = response.data
    if (responseData && responseData.data) {
      responseData = responseData.data
    }

    const profileData = responseData.profile || responseData || {}

    return profileData
  } catch (error) {
    console.error('Error getting devotee profile preview:', error)
    throw error
  }
}

// ============================================
// HELPER METHODS
// ============================================

formatDate(dateString) {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return '-'
  }
}

  // AUDIT LOGS REPORT METHODS
  async getAuditLogsReport(params) {
    const {
      entityId,
      entityIds,
      dateRange = 'weekly',
      startDate,
      endDate,
      userId,
      actionType,
      isSuperAdmin
    } = params

    if (!entityId && !entityIds) {
      throw new Error('Entity ID or Entity IDs are required')
    }

    const queryParams = new URLSearchParams({ date_range: dateRange })

    // Handle date range (custom or preset)
    let finalStartDate, finalEndDate
    const today = new Date()

    if (dateRange === 'custom' && startDate && endDate) {
      finalStartDate = startDate
      finalEndDate = endDate
    } else {
      finalEndDate = today.toISOString().split('T')[0]
      const start = new Date(today)

      switch (dateRange) {
        case 'daily':
          break // today only
        case 'weekly':
          start.setDate(today.getDate() - 7)
          break
        case 'monthly':
          start.setMonth(today.getMonth() - 1)
          break
        default:
          start.setDate(today.getDate() - 7)
      }

      finalStartDate = start.toISOString().split('T')[0]
    }

    queryParams.set('start_date', finalStartDate)
    queryParams.set('end_date', finalEndDate)

    if (userId) queryParams.set('user_id', userId)
    if (actionType) queryParams.set('action_type', actionType)

    let url;
    let response;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      try {
        // First try with superadmin/tenants endpoint
        if (entityIds && entityIds.length > 1) {
          url = `/superadmin/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
        } else {
          url = `/superadmin/tenants/${entityId}/reports/audit-logs?${queryParams}`
        }
        
        console.log('🔍 Making primary audit logs API request:', url)
        response = await api.get(url)
      } catch (error) {
        console.log('Primary API endpoint failed, trying fallback:', error.message)
        
        // Fallback to alternative superadmin endpoint structure
        try {
          if (entityIds && entityIds.length > 1) {
            url = `/superadmin/audit-logs/report?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/superadmin/audit-logs/report?${queryParams}&tenant_id=${entityId}`
          }
          
          console.log('🔍 Making fallback audit logs API request:', url)
          response = await api.get(url)
        } catch (error2) {
          console.log('Second fallback failed, trying third pattern:', error2.message)
          
          // Try one more pattern
          if (entityIds && entityIds.length > 1) {
            url = `/superadmin/entities/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
          } else {
            url = `/entities/${entityId}/reports/audit-logs?${queryParams}`
          }
          
          console.log('🔍 Making third fallback audit logs API request:', url)
          response = await api.get(url)
        }
      }
    } else {
      // Regular entity endpoint
      url = `/entities/${entityId}/reports/audit-logs?${queryParams}`
      console.log('🔍 Making audit logs API request:', url)
      response = await api.get(url)
    }
    
    console.log('✅ Audit logs API Response received:', response)
    return response
  }

  async downloadAuditLogsReport(params) {
    const {
      entityId,
      entityIds,
      format = 'csv',
      dateRange = 'weekly',
      startDate,
      endDate,
      userId,
      actionType,
      isSuperAdmin
    } = params

    if ((!entityId && !entityIds) || !format) {
      throw new Error('Entity ID (or IDs) and format are required')
    }

    const queryParams = new URLSearchParams({ date_range: dateRange, format })

    // Handle date range
    let finalStartDate, finalEndDate
    const today = new Date()

    if (dateRange === 'custom' && startDate && endDate) {
      finalStartDate = startDate
      finalEndDate = endDate
    } else {
      finalEndDate = today.toISOString().split('T')[0]
      const start = new Date(today)

      switch (dateRange) {
        case 'daily':
          break // today only
        case 'weekly':
          start.setDate(today.getDate() - 7)
          break
        case 'monthly':
          start.setMonth(today.getMonth() - 1)
          break
        default:
          start.setDate(today.getDate() - 7)
      }

      finalStartDate = start.toISOString().split('T')[0]
    }

    queryParams.set('start_date', finalStartDate)
    queryParams.set('end_date', finalEndDate)

    if (userId) queryParams.set('user_id', userId)
    if (actionType) queryParams.set('action_type', actionType)

    let url;
    
    // Choose the right API endpoint based on user role
    if (isSuperAdmin) {
      if (entityIds && entityIds.length > 1) {
        url = `/superadmin/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
      } else {
        url = `/superadmin/tenants/${entityId}/reports/audit-logs?${queryParams}`
      }
    } else {
      url = `/entities/${entityId}/reports/audit-logs?${queryParams}`
    }

    try {
      return await this.downloadReport(url, { format }, 'audit_logs_report', async () => {
        // Fallback function for alternative URLs if the first one fails
        if (isSuperAdmin) {
          // Try alternative patterns
          const alternatives = [
            entityIds && entityIds.length > 1 
              ? `/superadmin/audit-logs/report?${queryParams}&tenants=${entityIds.join(',')}`
              : `/superadmin/audit-logs/report?${queryParams}&tenant_id=${entityId}`,
            
            entityIds && entityIds.length > 1
              ? `/superadmin/entities/reports/audit-logs?${queryParams}&tenants=${entityIds.join(',')}`
              : `/entities/${entityId}/reports/audit-logs?${queryParams}`
          ];
          
          return alternatives;
        }
        return null; // No alternatives for regular users
      });
    } catch (error) {
      console.error('❌ Error downloading audit logs report:', error)
      throw error
    }
  }

  async getAuditLogsPreview(params) {
    try {
      const response = await this.getAuditLogsReport(params)

      console.log('🔍 Audit logs preview response:', response)

      let responseData = response.data
      
      // Handle different response structures
      if (responseData && responseData.data) {
        responseData = responseData.data
      }

      console.log('📊 Processed audit logs data:', responseData)

      const columns = [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'user_name', label: 'User' },
        { key: 'action_type', label: 'Action' },
        { key: 'resource_type', label: 'Resource Type' },
        { key: 'resource_id', label: 'Resource ID' },
        { key: 'description', label: 'Description' },
        { key: 'ip_address', label: 'IP Address' },
        { key: 'user_agent', label: 'User Agent' }
      ]

      // Handle different response formats
      let previewData = []
      
      if (Array.isArray(responseData)) {
        previewData = responseData
      } else if (responseData && responseData.audit_logs) {
        previewData = responseData.audit_logs
      } else if (responseData && responseData.logs) {
        previewData = responseData.logs
      } else if (responseData && Array.isArray(responseData.data)) {
        previewData = responseData.data
      } else {
        console.warn('⚠️ No valid audit logs data found in response:', responseData)
        previewData = []
      }

      // Format timestamp for better display
      previewData = previewData.map(item => ({
        ...item,
        timestamp: item.timestamp ? this.formatDateTime(item.timestamp) : '-',
        description: item.description || item.details || '-',
        user_agent: item.user_agent ? this.truncateText(item.user_agent, 50) : '-'
      }))

      console.log('📋 Final audit logs preview data:', previewData)

      return {
        data: previewData,
        columns,
        totalRecords: previewData.length || 0
      }
    } catch (error) {
      console.error('❌ Error getting audit logs preview:', error)
      throw error
    }
  }

  // UTILITY METHODS
  formatDateTime(dateString) {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch (error) {
      console.warn('Invalid datetime format:', dateString)
      return dateString
    }
  }

  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  async downloadReport(apiUrl, params, defaultFilename, getFallbackUrls = null) {
    try {
      console.log('🔄 Making download request:', apiUrl)
      console.log('📋 Request parameters:', params)

      try {
        const response = await api.get(apiUrl, {
          responseType: 'blob',
          headers: {
            'Accept': this.getAcceptHeader(params.format),
            'Cache-Control': 'no-cache'
          }
        })
        
        console.log('✅ Download response received:', {
          status: response.status,
          contentType: response.headers['content-type'],
          contentLength: response.headers['content-length'],
          contentDisposition: response.headers['content-disposition']
        })

        // Validate response
        if (!response.data || response.data.size === 0) {
          throw new Error('Empty file received from server')
        }

        // Check for error responses disguised as success
        const contentType = response.headers['content-type']
        if (contentType?.includes('text/html') || contentType?.includes('application/json')) {
          const text = await response.data.text()
          console.error('❌ Server returned error response:', text)
          throw new Error(`Server error: ${text.substring(0, 200)}`)
        }

        // Extract filename
        let filename = `${defaultFilename}.${params.format}`
        const contentDisposition = response.headers['content-disposition']
        
        if (contentDisposition) {
          const patterns = [
            /filename[^;=\n]*=\s*"([^"]+)"/i,
            /filename[^;=\n]*=\s*'([^']+)'/i,
            /filename[^;=\n]*=\s*([^;\n]+)/i,
            /filename\*=UTF-8''([^;\n]+)/i
          ]
          
          for (const pattern of patterns) {
            const match = contentDisposition.match(pattern)
            if (match) {
              filename = decodeURIComponent(match[1].trim())
              break
            }
          }
        }

        // Create and trigger download
        const blob = new Blob([response.data], {
          type: this.getBlobType(params.format)
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 1000)

        console.log('✅ Download completed successfully')
        return { 
          success: true, 
          filename, 
          size: blob.size,
          contentType: contentType
        }
      } catch (error) {
        // Try fallback URLs if provided
        if (getFallbackUrls) {
          const fallbackUrls = await getFallbackUrls()
          if (fallbackUrls && fallbackUrls.length > 0) {
            console.log('Trying fallback URLs:', fallbackUrls)
            
            // Try each fallback URL
            for (const fbUrl of fallbackUrls) {
              try {
                console.log('Trying fallback URL:', fbUrl)
                const response = await api.get(fbUrl, {
                  responseType: 'blob',
                  headers: {
                    'Accept': this.getAcceptHeader(params.format),
                    'Cache-Control': 'no-cache'
                  }
                })
                
                // Extract filename
                let filename = `${defaultFilename}.${params.format}`
                const contentDisposition = response.headers['content-disposition']
                
                if (contentDisposition) {
                  const patterns = [
                    /filename[^;=\n]*=\s*"([^"]+)"/i,
                    /filename[^;=\n]*=\s*'([^']+)'/i,
                    /filename[^;=\n]*=\s*([^;\n]+)/i,
                    /filename\*=UTF-8''([^;\n]+)/i
                  ]
                  
                  for (const pattern of patterns) {
                    const match = contentDisposition.match(pattern)
                    if (match) {
                      filename = decodeURIComponent(match[1].trim())
                      break
                    }
                  }
                }

                // Create and trigger download
                const blob = new Blob([response.data], {
                  type: this.getBlobType(params.format)
                })
                
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', filename)
                link.style.display = 'none'
                
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                setTimeout(() => {
                  window.URL.revokeObjectURL(url)
                }, 1000)

                console.log('✅ Download completed successfully with fallback URL')
                return { 
                  success: true, 
                  filename, 
                  size: blob.size,
                  contentType: response.headers['content-type']
                }
              } catch (fbError) {
                console.error('❌ Fallback URL failed:', fbUrl, fbError)
                // Continue to the next fallback URL
              }
            }
          }
        }
        
        // If we reach here, all fallbacks failed
        throw error
      }
    } catch (error) {
      console.error('❌ Error in download:', error)
      
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          contentType: error.response.headers['content-type']
        })
        
        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text()
            throw new Error(`Server error (${error.response.status}): ${errorText}`)
          } catch (readError) {
            console.error('Failed to read error response:', readError)
          }
        }
        
        throw new Error(`Server returned ${error.response.status}: ${error.response.statusText}`)
      }
      
      throw error
    }
  }

  formatDate(dateString) {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.warn('Invalid date format:', dateString)
      return dateString
    }
  }

  getAcceptHeader(format) {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf'
      case 'excel':
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'csv':
        return 'text/csv'
      default:
        return 'application/octet-stream'
    }
  }
  
  getBlobType(format) {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf'
      case 'excel':
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'csv':
        return 'text/csv'
      default:
        return 'application/octet-stream'
    }
  }
}

export default new ReportsService()
