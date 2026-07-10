// src/services/temple.service.js

import api from '@/plugins/axios'

const templeService = {
async getTemples(searchParams = {}) {
  try {
    console.log('📡 Making API call to fetch available temples')
    console.log('🔍 Search params:', searchParams)

    // Check the current URL path directly
    const currentPath = window.location.pathname
    console.log('📍 Current path:', currentPath)
    
    // Improved detection for standard user dashboard paths
    // This captures both /tenant/dashboard and /tenant/2/dashboard patterns
    const isStandardUserPath = 
      currentPath.includes('/standarduser') || 
      currentPath.match(/\/tenant\/\d+\/dashboard/) !== null ||
      currentPath === '/tenant/dashboard'  // Add this line to catch the redirect path
    
    // Get the tenant ID from local storage or URL
    const tenantId = 
      localStorage.getItem('current_tenant_id') || 
      currentPath.match(/\/tenant\/(\d+)\/dashboard/)?.[1]
    
    console.log(`👤 Is standard user check: ${isStandardUserPath}`)
    console.log(`🔑 Using tenant ID: ${tenantId || 'none'}`)
    
    // IMPORTANT: Check if this is a SuperAdmin request first
    const isSuperAdminRequest = searchParams.superAdmin === true;
    console.log(`🔍 Is SuperAdmin request: ${isSuperAdminRequest}`);
    
    // IMPORTANT: For standard users, use our specialized function that loads all temples
    if (isStandardUserPath && !isSuperAdminRequest) {
      console.log('👤 Standard user detected - using specialized multi-fetch approach')
      return await this.getTemplesForStandardUser()
    }
    
    // Original code for other user types below...
    let response
    
    if (isSuperAdminRequest) {
      console.log(`🔍 Using SuperAdmin endpoint for tenant ${searchParams.tenantId}`)
      try {
        // Add cache busting timestamp to ensure fresh data
        const timestamp = Date.now()
        
        // First attempt with specific tenant parameter and cache busting
        response = await api.get(`/entities?tenant_id=${searchParams.tenantId}&_=${timestamp}`)
        console.log('✅ First attempt successful with /entities endpoint')
      } catch (err) {
        console.log('⚠️ First endpoint failed, trying fallback...', err.message)
        try {
          const timestamp = Date.now()
          // Fallback to superadmin specific endpoint with cache busting
          response = await api.get(`/superadmin/entities?tenant_id=${searchParams.tenantId}&_=${timestamp}`)
          console.log('✅ Second attempt successful with /superadmin/entities endpoint')
        } catch (err2) {
          console.log('⚠️ Second endpoint failed, trying third endpoint...', err2.message)
          try {
            const timestamp = Date.now()
            // Try a different superadmin endpoint format with cache busting
            response = await api.get(`/superadmin/tenants/${searchParams.tenantId}/entities?_=${timestamp}`)
            console.log('✅ Third attempt successful with /superadmin/tenants/[id]/entities endpoint')
          } catch (err3) {
            console.log('⚠️ All SuperAdmin tenant-specific endpoints failed, using generic endpoint', err3.message)
            // Last resort, general entities endpoint
            const timestamp = Date.now()
            response = await api.get(`/entities?_=${timestamp}`)
          }
        }
      }
    }
    // Handle normal temple admin case
    else if (currentPath.includes('/tenant/dashboard')) {
      // Use the special endpoint for temple admins to see their created temples
      const timestamp = Date.now()
      console.log('🔑 Using temple admin special endpoint with multi-fallback strategy')
      
      try {
        // First attempt with by-creator endpoint
        console.log('🔍 Trying /entities/by-creator?tenant_id= endpoint...')
        response = await api.get(`/entities/by-creator?tenant_id=${tenantId}&&_=${timestamp}`)
        console.log('✅ by-creator endpoint successful')
      } catch (err) {
        console.log('⚠️ by-creator endpoint failed, trying tenant-created endpoint...', err.message)
        
        try {
          // Second attempt with tenant-created endpoint
          const tenantId = localStorage.getItem('current_tenant_id') ||
                          currentPath.match(/\/tenant\/(\d+)\/dashboard/)?.[1]
          
          if (tenantId) {
            console.log(`🔍 Trying /entities/tenant/${tenantId}/created endpoint...`)
            response = await api.get(`/entities/tenant/${tenantId}/created?_=${timestamp}`)
            console.log('✅ tenant-created endpoint successful')
          } else {
            throw new Error('No tenant ID available for tenant-created endpoint')
          }
        } catch (err2) {
          console.log('⚠️ tenant-created endpoint failed, trying general entities...', err2.message)
          
          try {
            // Third attempt with general entities endpoint
            console.log('🔍 Trying /entities endpoint...')
            response = await api.get(`/entities?_=${timestamp}`)
            console.log('✅ general entities endpoint successful')
          } catch (err3) {
            console.log('⚠️ All temple admin endpoints failed, creating empty response', err3.message)
            // Last resort - return empty array wrapped in a response-like object
            response = { data: [] }
          }
        }
      }
    }
    // For other admin paths
    else if (currentPath.includes('/tenant/') || 
        currentPath.includes('/entity/') || 
        currentPath.includes('/admin/') || 
        currentPath.includes('/standarduser/') || 
        currentPath.includes('/superadmin/')) {
      const timestamp = Date.now()
      console.log('🔒 Using admin endpoint: /entities')
      response = await api.get(`/entities?_=${timestamp}`)
    } else {
      // Otherwise use devotee endpoint with search params
      console.log('🔍 Using devotee endpoint: /temples/search')
      const queryString = new URLSearchParams()
      if (searchParams.query) queryString.append('query', searchParams.query)
      if (searchParams.state) queryString.append('state', searchParams.state)
      if (searchParams.type) queryString.append('type', searchParams.type)
      // Add cache busting
      queryString.append('_', Date.now())
      
      response = await api.get(`/temples/search${queryString.toString() ? '?' + queryString.toString() : ''}`)
    }
    
    console.log('📥 Temple API response received:', response)

    // Extract data from response
    let templeData = response?.data || response
    if (!Array.isArray(templeData)) {
      if (templeData?.data && Array.isArray(templeData.data)) {
        templeData = templeData.data
      } else if (templeData?.temples && Array.isArray(templeData.temples)) {
        templeData = templeData.temples
      } else if (templeData?.entities && Array.isArray(templeData.entities)) {
        templeData = templeData.entities
      } else if (templeData?.items && Array.isArray(templeData.items)) {
        templeData = templeData.items
      } else {
        // Return empty array if we couldn't extract data
        console.log('⚠️ Could not extract temple data from response, returning empty array')
        return []
      }
    }

    if (!Array.isArray(templeData)) {
      console.error('🚨 Could not extract array from response:', response)
      return [] // Return empty array instead of throwing error for better UI handling
    }

    // CRITICAL FIX: SuperAdmin filtering logic needs to run first
    if (isSuperAdminRequest && searchParams.tenantId) {
      console.log(`🔍 SUPERADMIN: Filtering temples by tenant ID ${searchParams.tenantId}`);
      templeData = templeData.filter(temple => 
        (temple.created_by && temple.created_by.toString() === searchParams.tenantId.toString()) ||
        (temple.tenant_id && temple.tenant_id.toString() === searchParams.tenantId.toString()) ||
        (temple.creator_id && temple.creator_id.toString() === searchParams.tenantId.toString())
      );
      console.log(`✅ SUPERADMIN: After filtering: ${templeData.length} temples match tenant ID ${searchParams.tenantId}`);
      
      // Return immediately after SuperAdmin filtering to avoid other filtering logic
      const normalizedTemples = templeData.map(temple => this.normalizeTempleData(temple));
      console.log(`✅ SUPERADMIN: Final normalized temples: ${normalizedTemples.length}`);
      return normalizedTemples;
    }

    // Apply filtering if needed (for non-SuperAdmin flows)
    const tenantIdFromHeader = searchParams.tenantId || 
                              localStorage.getItem('current_tenant_id') || 
                              currentPath.match(/\/tenant\/(\d+)\/dashboard/)?.[1]
    
    // For standard user paths, no filtering is done
    if (isStandardUserPath) {
      console.log(`📊 STANDARD USER - SHOWING ALL TEMPLES (${templeData.length}) WITHOUT FILTERING`)
    }
    // Apply filtering for other roles if in tenant context or if tenant ID is available
    else if (tenantIdFromHeader && (currentPath.includes('/tenant/') || searchParams.superAdmin)) {
      console.log(`🔍 Filtering temples by tenant ID ${tenantIdFromHeader}`);
      templeData = templeData.filter(temple => 
        (temple.created_by && temple.created_by.toString() === tenantIdFromHeader.toString()) ||
        (temple.tenant_id && temple.tenant_id.toString() === tenantIdFromHeader.toString()) ||
        (temple.creator_id && temple.creator_id.toString() === tenantIdFromHeader.toString())
      );
      console.log(`✅ After filtering: ${templeData.length} temples match tenant ID ${tenantIdFromHeader}`);
    }

    const normalizedTemples = templeData.map(temple => this.normalizeTempleData(temple))
    console.log(`✅ Final temples count: ${normalizedTemples.length}`)
    console.log('✅ Normalized temples:', normalizedTemples)

    return normalizedTemples
  } catch (error) {
    console.error('❌ Error fetching temples:', error)
    console.error('Error response:', error.response?.data)
    return []
  }
},

async getTempleById(id) {
  try {
    console.log(`📡 Fetching temple details for ID: ${id}`)
    
    const timestamp = Date.now()
    
    // Try multiple endpoints in order of preference
    let response
    
    try {
      // First: try the standard entity endpoint
      response = await api.get(`/entities/${id}?_=${timestamp}`)
    } catch (err) {
      if (err.response?.status === 403) {
        console.warn(`⚠️ Access denied to /entities/${id}, trying public endpoint...`)
        
        try {
          // Second: try a public/temple-specific endpoint
          response = await api.get(`/temples/${id}?_=${timestamp}`)
        } catch (err2) {
          try {
            // Third: try fetching from the list and finding by ID
            response = await api.get(`/entities?_=${timestamp}`)
            const list = Array.isArray(response.data) ? response.data 
              : response.data?.data || response.data?.entities || []
            const found = list.find(e => String(e.id) === String(id))
            if (found) return this.normalizeTempleData(found)
            throw new Error('Temple not found in accessible list')
          } catch (err3) {
            throw err // re-throw original 403
          }
        }
      } else {
        throw err
      }
    }
    
    const templeData = response.data || response
    return this.normalizeTempleData(templeData)
    
  } catch (error) {
    console.error(`❌ Error fetching temple ID ${id}:`, error)
    console.error('Error response:', error.response?.data)
    throw error
  }
},
// NEW METHOD: Get temple documents
async getTempleDocuments(id) {
  try {
    console.log(`📄 Fetching documents for temple ID: ${id}`)
    
    const timestamp = Date.now()
    const response = await api.get(`/entities/${id}/documents?_=${timestamp}`)
    
    console.log('📥 Temple documents response:', response)
    
    const documents = response.data || response
    return documents
  } catch (error) {
    console.error(`❌ Error fetching temple documents for ID ${id}:`, error)
    console.error('Error response:', error.response?.data)
    throw error
  }
},

// NEW METHOD: Download document
async downloadDocument(templeId, documentType) {
  try {
    console.log(`📥 Downloading ${documentType} for temple ID: ${templeId}`)
    
    const response = await api.get(`/entities/${templeId}/documents/${documentType}/download`, {
      responseType: 'blob'
    })
    
    // Create blob URL for download
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    
    // Extract filename from response headers or use default
    const contentDisposition = response.headers['content-disposition']
    let filename = `${documentType}_${templeId}.pdf`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }
    
    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log(`✅ Downloaded ${documentType} as ${filename}`)
    return { success: true, filename }
  } catch (error) {
    console.error(`❌ Error downloading ${documentType} for temple ID ${templeId}:`, error)
    throw error
  }
},

// Add this as a new method to temple.service.js
async getSuperAdminTemplesStrict(tenantId) {
  try {
    console.log(`🔒 STRICT: Fetching temples for tenant ID ${tenantId}`);
    
    if (!tenantId) {
      console.error('🚫 STRICT: No tenant ID provided');
      return [];
    }
    
    // Make a direct API call
    const timestamp = Date.now();
    const response = await api.get(`/entities?_=${timestamp}`);
    
    console.log('📥 STRICT: API response:', response);
    
    // Extract temple data
    let templeData = response?.data || response;
    if (!Array.isArray(templeData)) {
      if (templeData?.data && Array.isArray(templeData.data)) templeData = templeData.data;
      else if (templeData?.temples && Array.isArray(templeData.temples)) templeData = templeData.temples;
      else if (templeData?.entities && Array.isArray(templeData.entities)) templeData = templeData.entities;
      else if (templeData?.items && Array.isArray(templeData.items)) templeData = templeData.items;
      else templeData = [];
    }
    
    console.log(`📊 STRICT: Total temples before filtering: ${templeData.length}`);
    
    // EXPLICITLY filter by tenant ID
    const filteredTemples = templeData.filter(temple => {
      const createdByMatch = temple.created_by && temple.created_by.toString() === tenantId.toString();
      const tenantIdMatch = temple.tenant_id && temple.tenant_id.toString() === tenantId.toString();
      const creatorIdMatch = temple.creator_id && temple.creator_id.toString() === tenantId.toString();
      
      return createdByMatch || tenantIdMatch || creatorIdMatch;
    });
    
    console.log(`📊 STRICT: Temples after filtering: ${filteredTemples.length}`);
    
    // Normalize temples
    const normalizedTemples = filteredTemples.map(temple => this.normalizeTempleData(temple));
    
    return normalizedTemples;
  } catch (error) {
    console.error('❌ STRICT: Error fetching temples:', error);
    return [];
  }
},

// Add this as a new method to temple.service.js
async getTemplesDirectByTenant(tenantId) {
  try {
    console.log(`📡 DIRECT: Making direct API call for tenant ${tenantId}`);
    
    if (!tenantId) {
      console.error('📡 DIRECT: No tenant ID provided');
      return [];
    }
    
    // Try multiple endpoints to find one that works
    let response = null;
    let endpoint = '';
    let success = false;
    
    // Add auth header to all requests
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    };
    
    // First try: entities/by-creator
    try {
      endpoint = `/entities/by-creator?tenant_id=${tenantId}&_=${Date.now()}`;
      console.log(`📡 DIRECT: Trying endpoint: ${endpoint}`);
      response = await api.get(endpoint, { headers });
      console.log(`📡 DIRECT: Success with ${endpoint}`);
      success = true;
    } catch (err1) {
      console.log(`📡 DIRECT: Failed with ${endpoint}: ${err1.message}`);
      
      // Second try: entities with tenant_id parameter
      try {
        endpoint = `/entities?tenant_id=${tenantId}&_=${Date.now()}`;
        console.log(`📡 DIRECT: Trying endpoint: ${endpoint}`);
        response = await api.get(endpoint, { headers });
        console.log(`📡 DIRECT: Success with ${endpoint}`);
        success = true;
      } catch (err2) {
        console.log(`📡 DIRECT: Failed with ${endpoint}: ${err2.message}`);
        
        // Third try: superadmin/tenants/{id}/entities
        try {
          endpoint = `/superadmin/tenants/${tenantId}/entities?_=${Date.now()}`;
          console.log(`📡 DIRECT: Trying endpoint: ${endpoint}`);
          response = await api.get(endpoint, { headers });
          console.log(`📡 DIRECT: Success with ${endpoint}`);
          success = true;
        } catch (err3) {
          console.log(`📡 DIRECT: Failed with ${endpoint}: ${err3.message}`);
          
          // Last resort: use regular entities endpoint
          endpoint = `/entities?_=${Date.now()}`;
          console.log(`📡 DIRECT: Using fallback endpoint: ${endpoint}`);
          response = await api.get(endpoint, { headers });
        }
      }
    }
    
    // Log response for debugging
    console.log(`📡 DIRECT: Response from ${endpoint}:`, response);
    
    // Extract temples
    let temples = [];
    if (response && response.data) {
      temples = Array.isArray(response.data) ? response.data :
                response.data.data ? response.data.data :
                response.data.entities ? response.data.entities :
                response.data.items ? response.data.items : [];
    }
    
    console.log(`📡 DIRECT: Extracted ${temples.length} temples`);
    
    // Apply filtering client-side regardless of which endpoint worked
    const filteredTemples = temples.filter(temple => {
      // Try all possible property names for tenant ID
      const createdByMatch = temple.created_by && temple.created_by.toString() === tenantId.toString();
      const tenantIdMatch = temple.tenant_id && temple.tenant_id.toString() === tenantId.toString();
      const creatorIdMatch = temple.creator_id && temple.creator_id.toString() === tenantId.toString();
      
      return createdByMatch || tenantIdMatch || creatorIdMatch;
    });
    
    console.log(`📡 DIRECT: After filtering: ${filteredTemples.length} temples`);
    
    // Normalize the temples
    return filteredTemples.map(temple => this.normalizeTempleData(temple));
  } catch (error) {
    console.error('📡 DIRECT: Fatal error:', error);
    return [];
  }
},

// Add this new method to your temple.service.js file
async getTemplesForStandardUser() {
  try {
    console.log('🔎 Standard user: Fetching all accessible temples...')
    const tenantId = localStorage.getItem('current_tenant_id') || 
                     document.querySelector('meta[name="tenant-id"]')?.getAttribute('content') ||
                     window.location.pathname.match(/\/tenant\/(\d+)\/dashboard/)?.[1]
    
    console.log(`🔑 Using tenant ID: ${tenantId}`)
    
    // Create a Map to deduplicate temples by ID
    const templeMap = new Map()
    
    // 1. First, get all entities (will be filtered by backend to show assigned entity)
    try {
      console.log('1️⃣ Fetching assigned entity...')
      const timestamp = Date.now()
      const response = await api.get(`/entities?_=${timestamp}`)
      
      let temples = response.data || []
      if (!Array.isArray(temples)) {
        if (temples.data && Array.isArray(temples.data)) temples = temples.data
        else if (temples.entities && Array.isArray(temples.entities)) temples = temples.entities
        else if (temples.items && Array.isArray(temples.items)) temples = temples.items
        else temples = []
      }
      
      console.log(`✅ Got ${temples.length} assigned temples`)
      
      // Add temples to the map
      temples.forEach(temple => {
        templeMap.set(temple.id, temple)
      })
    } catch (err) {
      console.warn('⚠️ Error fetching assigned entity:', err.message)
    }
    
    /*
    // 2. Get temples for the tenant
    if (tenantId) {
      try {
        console.log(`2️⃣ Fetching temples for tenant ${tenantId}...`)
        const timestamp = Date.now()
        const response = await api.get(`/entities?tenant_id=${tenantId}&_=${timestamp}`)
        
        let temples = response.data || []
        if (!Array.isArray(temples)) {
          if (temples.data && Array.isArray(temples.data)) temples = temples.data
          else if (temples.entities && Array.isArray(temples.entities)) temples = temples.entities
          else if (temples.items && Array.isArray(temples.items)) temples = temples.items
          else temples = []
        }
        
        console.log(`✅ Got ${temples.length} tenant temples`)
        
        // Add temples to the map
        temples.forEach(temple => {
          templeMap.set(temple.id, temple)
        })
      } catch (err) {
        console.warn(`⚠️ Error fetching tenant temples:`, err.message)
      }
    }
    
    // 3. Get temples for superadmin (as fallback)
    try {
      console.log(`3️⃣ Fetching all temples as fallback...`)
      const timestamp = Date.now()
      const response = await api.get(`/superadmin/entities?_=${timestamp}`)
      
      let temples = response.data || []
      if (!Array.isArray(temples)) {
        if (temples.data && Array.isArray(temples.data)) temples = temples.data
        else if (temples.entities && Array.isArray(temples.entities)) temples = temples.entities
        else if (temples.items && Array.isArray(temples.items)) temples = temples.items
        else temples = []
      }
      
      // If we have a tenant ID, filter to only show related temples
      if (tenantId) {
        temples = temples.filter(temple => 
          (temple.created_by && temple.created_by.toString() === tenantId.toString()) ||
          (temple.tenant_id && temple.tenant_id.toString() === tenantId.toString()) ||
          (temple.creator_id && temple.creator_id.toString() === tenantId.toString())
        )
      }
      
      console.log(`✅ Got ${temples.length} superadmin temples for tenant`)
      
      // Add temples to the map
      temples.forEach(temple => {
        templeMap.set(temple.id, temple)
      })
    } catch (err) {
      console.warn('⚠️ Error fetching superadmin temples:', err.message)
    }
    */
    // Convert map values to array
    const allTemples = Array.from(templeMap.values())
    console.log(`🏛️ Total unique temples found: ${allTemples.length}`)
    
    // Normalize the temples
    const normalizedTemples = allTemples.map(temple => this.normalizeTempleData(temple))
    return normalizedTemples
    
  } catch (error) {
    console.error('❌ Error in getTemplesForStandardUser:', error)
    return []
  }
},

  /**
   * Get temples for a specific tenant when logged in as SuperAdmin
   * This is a convenience method that calls getTemples with superAdmin flag
   * @param {string|number} tenantId - The ID of the tenant to fetch temples for
   * @returns {Array} - Normalized list of temples
   */
  async getSuperAdminTemples(tenantId) {
    console.log(`📡 Making API call to fetch temples for SuperAdmin for tenant ${tenantId}`)
    return this.getTemples({
      tenantId: tenantId,
      superAdmin: true
    })
  },

// FIXED: Updated createTemple method to properly handle files
async createTemple(templeData) {
  try {
    console.log('📡 Creating new temple entity');
    console.log('📋 Temple data received:', templeData);

    const hasFiles =
      templeData.documents &&
      (
        templeData.documents.registration ||
        templeData.documents.trustDeed ||
        templeData.documents.property ||
        (templeData.documents.additional && templeData.documents.additional.length > 0) ||
        templeData.logo ||
        templeData.video
      );

    let payload;
    let headers = {};

    if (hasFiles) {
      console.log('📦 Creating FormData with files');
      const formData = new FormData();

      // ================= BASIC DETAILS =================
      formData.append('name', templeData.name || '');
      formData.append('main_deity', templeData.main_deity || templeData.mainDeity || '');
      formData.append('temple_type', templeData.temple_type || templeData.templeType || '');
      formData.append(
        'established_year',
        templeData.established_year ? templeData.established_year.toString() : ''
      );
      formData.append('phone', templeData.phone || '');
      formData.append('email', templeData.email || '');
      formData.append('description', templeData.description || '');

      // ================= ADDRESS =================
      formData.append('street_address', templeData.street_address || templeData.address?.street || '');
      formData.append('city', templeData.city || templeData.address?.city || '');
      formData.append('district', templeData.district || '');
      formData.append('state', templeData.state || templeData.address?.state || '');
      formData.append('pincode', templeData.pincode || templeData.address?.pincode || '');
      formData.append('landmark', templeData.landmark || '');
      formData.append('map_link', templeData.map_link || templeData.mapLink || '');

      // ================= DOCUMENT FILES =================
      if (templeData.documents?.registration instanceof File) {
        formData.append('registration_cert', templeData.documents.registration);
        console.log('📄 Added registration certificate');
      }

      if (templeData.documents?.trustDeed instanceof File) {
        formData.append('trust_deed', templeData.documents.trustDeed);
        console.log('📄 Added trust deed');
      }

      if (templeData.documents?.property instanceof File) {
        formData.append('property_docs', templeData.documents.property);
        console.log('📄 Added property documents');
      }

      if (Array.isArray(templeData.documents?.additional)) {
  templeData.documents.additional.forEach((file) => {
    if (file instanceof File) {
      formData.append('additional_docs', file);  // ✅ SAME NAME FOR ALL
      console.log('📄 Added additional document:', file.name);
    }
  });
}

      // ================= 🆕 LOGO & VIDEO =================
      if (templeData.logo instanceof File) {
        formData.append('temple_logo', templeData.logo);
        console.log('🖼️ Added temple logo:', templeData.logo.name);
      }

      if (templeData.video instanceof File) {
        formData.append('temple_video', templeData.video);
        console.log('🎥 Added temple video:', templeData.video.name);
      }

      payload = formData;

      // Debug
      console.log('📦 FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? value.name : value);
      }

    } else {
      console.log('📦 Creating JSON payload (no files)');
      payload = {
        name: templeData.name || '',
        main_deity: templeData.main_deity || '',
        temple_type: templeData.temple_type || '',
        established_year: templeData.established_year || null,
        phone: templeData.phone || '',
        email: templeData.email || '',
        description: templeData.description || '',
        street_address: templeData.street_address || '',
        city: templeData.city || '',
        district: templeData.district || '',
        state: templeData.state || '',
        pincode: templeData.pincode || '',
        landmark: templeData.landmark || '',
        map_link: templeData.map_link || '',
        status: 'pending'
      };

      headers['Content-Type'] = 'application/json';
    }

    console.log('🚀 Making API request to /entities');
    const response = await api.post('/entities', payload, { headers });

    console.log('✅ Temple created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating temple:', error);
    throw error;
  }
},



async updateTemple(id, updates) {
  try {
    console.log(`📡 Updating temple with ID: ${id}`);

    let payload;
    let headers = {};

    // ================= CASE 1: FormData PASSED DIRECTLY =================
    if (updates instanceof FormData) {
      console.log('📦 Using FormData directly');
      payload = updates;

    } else {
      console.log('📦 Converting object → FormData');
      const formData = new FormData();

      // ================= BASIC DETAILS =================
      if (updates.name) formData.append('name', updates.name);
      if (updates.mainDeity) formData.append('main_deity', updates.mainDeity);
      if (updates.templeType) formData.append('temple_type', updates.templeType);
      if (updates.establishedYear) {
        formData.append('established_year', updates.establishedYear.toString());
      }

      if (updates.phone) formData.append('phone', updates.phone);
      if (updates.email) formData.append('email', updates.email);
      if (updates.description) formData.append('description', updates.description);

      // ================= ADDRESS =================
      if (updates.streetAddress) formData.append('street_address', updates.streetAddress);
      if (updates.city) formData.append('city', updates.city);
      if (updates.district) formData.append('district', updates.district);
      if (updates.state) formData.append('state', updates.state);
      if (updates.pincode) formData.append('pincode', updates.pincode);
      if (updates.landmark) formData.append('landmark', updates.landmark);
      if (updates.mapLink) formData.append('map_link', updates.mapLink);

      // ================= DOCUMENT FILES =================
      if (updates.documents?.registration instanceof File) {
        formData.append('registration_cert', updates.documents.registration);
      }
      if (updates.documents?.trustDeed instanceof File) {
        formData.append('trust_deed', updates.documents.trustDeed);
      }
      if (updates.documents?.property instanceof File) {
        formData.append('property_docs', updates.documents.property);
      }
     if (Array.isArray(updates.documents?.additional)) {
  updates.documents.additional.forEach((file) => {
    if (file instanceof File) {
      formData.append('additional_docs', file);  // ✅ SAME NAME FOR ALL
      console.log('📄 Added additional document:', file.name);
    }
  });
}
      // ================= 🆕 LOGO & VIDEO =================
      if (updates.logo instanceof File) {
        formData.append('temple_logo', updates.logo);
        console.log('🖼️ Added temple logo:', updates.logo.name);
      }

      if (updates.video instanceof File) {
        formData.append('temple_video', updates.video);
        console.log('🎥 Added temple video:', updates.video.name);
      }

      payload = formData;
    }

    console.log('🚀 Making API request to /entities/' + id);

    const response = await api.put(`/entities/${id}`, payload, {
      headers,
      transformRequest: [(data) => data] // let browser set boundary
    });

    console.log('✅ Temple updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating temple ${id}:`, error);
    throw error;
  }
}
,


async toggleTempleStatus(templeId, isActive) {
  try {
    console.log(`📡 Toggling temple status for ID: ${templeId} to ${isActive ? 'active' : 'inactive'}`);
    
    // Get tenant ID from local storage
    const tenantId = localStorage.getItem('current_tenant_id');
    
    // Include tenant context in headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (tenantId) {
      console.log(`🔑 Including tenant ID in request: ${tenantId}`);
    }

    // Use the correct payload key 'isactive' (lowercase)
    const payload = { 
      isactive: isActive 
    };
    
    console.log('📦 Sending payload:', payload);
    console.log('📦 With headers:', headers);

    // Try multiple endpoint patterns
    let response;
    let lastError;
    
    // First attempt: POST to toggle-status
    try {
      console.log(`🔄 Trying POST /entities/${templeId}/toggle-status`);
      response = await api.post(`/entities/${templeId}/toggle-status`, payload, { headers });
      console.log('✅ Success with POST /entities/{id}/toggle-status');
    } catch (err) {
      console.log('⚠️ POST toggle-status failed, trying PATCH status...');
      lastError = err;
      
      // Second attempt: PATCH to status
      try {
        console.log(`🔄 Trying PATCH /entities/${templeId}/status`);
        response = await api.patch(`/entities/${templeId}/status`, payload, { headers });
        console.log('✅ Success with PATCH /entities/{id}/status');
      } catch (err2) {
        console.log('⚠️ PATCH status failed, trying PUT status...');
        lastError = err2;
        
        // Third attempt: PUT to status
        try {
          console.log(`🔄 Trying PUT /entities/${templeId}/status`);
          response = await api.put(`/entities/${templeId}/status`, payload, { headers });
          console.log('✅ Success with PUT /entities/{id}/status');
        } catch (err3) {
          lastError = err3;
          throw lastError; // Throw the last error if all attempts fail
        }
      }
    }
    
    console.log('✅ Status updated successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error(`❌ Failed to toggle temple status for ID ${templeId}:`, error.message);
    console.error('Error response:', error.response?.data);
    
    // Provide more specific error messages
    if (error.response?.status === 403) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message;
      throw new Error(errorMsg || 'You do not have permission to toggle this temple status.');
    } else if (error.response?.status === 404) {
      throw new Error('Temple not found.');
    } else if (error.response?.status === 401) {
      throw new Error('Please log in to perform this action.');
    } else {
      const errorMsg = error.response?.data?.error || error.response?.data?.message;
      throw new Error(errorMsg || 'Failed to toggle temple status. Please try again.');
    }
  }
},
  async deleteTemple(id) {
    try {
      console.log(`📡 Deleting temple with ID: ${id}`)

      const response = await api.delete(`/entities/${id}`)
      console.log('✅ Temple deleted successfully')
      return response.data || response
    } catch (error) {
      console.error(`❌ Error deleting temple ID ${id}:`, error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  async joinTemple(templeId) {
    try {
      console.log(`📡 Joining temple ID ${templeId}`)

      // Use the correct endpoint for joining temples
      const response = await api.post('/memberships', {
        entity_id: templeId
      })

      console.log('📥 Join temple response:', response)
      return response.data || response
    } catch (error) {
      console.error(`❌ Error joining temple ID ${templeId}:`, error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },

  async getRecentTemples() {
    try {
      console.log('📡 Fetching recent temples')
      
      // Use the correct endpoint for recent temples
      const response = await api.get('/temples/recent')
      console.log('📥 Recent temples response:', response)
      
      // Extract data from response
      let templeData = response.data || response;
      if (!Array.isArray(templeData)) {
        if (templeData.data && Array.isArray(templeData.data)) {
          templeData = templeData.data
        } else if (templeData.temples && Array.isArray(templeData.temples)) {
          templeData = templeData.temples
        } else if (templeData.entities && Array.isArray(templeData.entities)) {
          templeData = templeData.entities
        } else if (templeData.items && Array.isArray(templeData.items)) {
          templeData = templeData.items
        }
      }
      
      if (!Array.isArray(templeData)) {
        console.error('🚨 Could not extract array from response:', response)
        return []
      }
      
      return templeData.map(temple => this.normalizeTempleData(temple))
    } catch (error) {
      console.error('❌ Error fetching recent temples:', error)
      console.error('Error response:', error.response?.data)
      return []
    }
  },

 // FIXED: temple.service.js - normalizeTempleData method
// Replace your current normalizeTempleData method with this:

normalizeTempleData(temple) {
  if (!temple) return null

  // Helper to get first available value from multiple possible field names
  const getField = (obj, ...keys) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key]
      }
    }
    return ''
  }

  return {
    id: temple.id || temple.ID || 0,
    name: getField(temple, 'name', 'Name') || 'Unknown Temple',
    description: getField(temple, 'description', 'Description'),
    
    // Temple type - check ALL possible variations
    templeType: getField(temple, 'temple_type', 'templeType', 'templetype', 'TempleType'),
    category: getField(temple, 'temple_type', 'templeType', 'templetype', 'TempleType'),

    // Address fields - CRITICAL FIX for missing street address
    streetAddress: getField(temple, 'street_address', 'streetAddress', 'streetaddress', 'StreetAddress'),
    addressLine1: getField(temple, 'street_address', 'streetAddress', 'streetaddress', 'StreetAddress'),
    city: getField(temple, 'city', 'City'),
    state: getField(temple, 'state', 'State'),
    district: getField(temple, 'district', 'District'),
    pincode: getField(temple, 'pincode', 'Pincode'),
    landmark: getField(temple, 'landmark', 'Landmark'),
    mapLink: getField(temple, 'map_link', 'mapLink', 'maplink', 'MapLink'),
    country: 'India',

    // Contact
    phone: getField(temple, 'phone', 'Phone'),
    email: getField(temple, 'email', 'Email'),

    // Status
    status: getField(temple, 'status', 'Status') || 'pending',
    
    // 🆕 CRITICAL FIX: Extract media object
    //media: temple.media || null,
    media: temple.media || temple.Media || null,
    
    // Rejection/approval data
    rejectionReason: getField(temple, 'rejection_reason', 'rejectionReason', 'admin_notes', 'adminNotes'),
    rejectedAt: getField(temple, 'rejected_at', 'rejectedAt'),
    approvedAt: getField(temple, 'approved_at', 'approvedAt'),
    
    // Counts
    devoteeCount: temple.devotee_count || temple.DevoteeCount || 0,
    volunteersCount: temple.volunteers_count || temple.VolunteersCount || 0,

    // Image - also check media.logo
    image: temple.media?.logo || getField(temple, 'image_url', 'ImageUrl'),

    // Main deity
    mainDeity: getField(temple, 'main_deity', 'mainDeity', 'maindeity', 'MainDeity'),
    
    // Established year
    establishedYear: getField(temple, 'established_year', 'establishedYear', 'establishedyear', 'EstablishedYear'),

    // Timestamps
    createdAt: getField(temple, 'created_at', 'CreatedAt'),
    updatedAt: getField(temple, 'updated_at', 'UpdatedAt'),
    
    // Tenant/creator info
    createdBy: getField(temple, 'created_by', 'CreatedBy'),
    tenantId: getField(temple, 'tenant_id', 'TenantId', 'created_by', 'CreatedBy'),

    // Document URLs
    registrationCertUrl: getField(temple, 'registration_cert_url', 'RegistrationCertUrl'),
    trustDeedUrl: getField(temple, 'trust_deed_url', 'TrustDeedUrl'),
    propertyDocsUrl: getField(temple, 'property_docs_url', 'PropertyDocsUrl'),
    additionalDocsUrls: temple.additional_docs_urls || temple.AdditionalDocsUrls || null,

    // Document names (for display)
    registrationCertName: getField(temple, 'registration_cert_name', 'registrationCertName'),
    trustDeedName: getField(temple, 'trust_deed_name', 'trustDeedName'),
    propertyDocsName: getField(temple, 'property_docs_name', 'propertyDocsName'),
    additionalDocsNames: temple.additional_docs_names || temple.additionalDocsNames || [],

    // Nested objects for backward compatibility
    address: {
      street: getField(temple, 'street_address', 'streetAddress', 'streetaddress', 'StreetAddress'),
      city: getField(temple, 'city', 'City'),
      state: getField(temple, 'state', 'State'),
      district: getField(temple, 'district', 'District'),
      pincode: getField(temple, 'pincode', 'Pincode'),
      country: 'India'
    },

    contact: {
      phone: getField(temple, 'phone', 'Phone'),
      email: getField(temple, 'email', 'Email'),
      website: getField(temple, 'website', 'Website')
    }
  }
},
  // In your seva.service.js or entity.service.js
async getEntityDetails(entityId) {
  const response = await api.get(`/entities/${entityId}`)
  return response.data
},
  

  async searchTemples(query) {
    try {
      console.log(`📡 Searching temples with query: ${query}`)

      // Check the current URL path directly
      const currentPath = window.location.pathname
      
      let response
      
      // If on tenant or admin path, use entities endpoint
      if (currentPath.includes('/tenant/') || 
          currentPath.includes('/entity/') || 
          currentPath.includes('/admin/') || 
          currentPath.includes('/standarduser/') || 
          currentPath.includes('/superadmin/')) {
        console.log('🔒 Using admin search endpoint: /entities')
        response = await api.get(`/entities?search=${encodeURIComponent(query)}`)
      } else {
        // Otherwise use devotee endpoint
        console.log('🔍 Using devotee search endpoint: /temples/search')
        response = await api.get(`/temples/search?query=${encodeURIComponent(query)}`)
      }

      // Extract data from response
      let templeData = response.data || response;
      if (!Array.isArray(templeData)) {
        if (templeData.data && Array.isArray(templeData.data)) {
          templeData = templeData.data
        } else if (templeData.temples && Array.isArray(templeData.temples)) {
          templeData = templeData.temples
        } else if (templeData.entities && Array.isArray(templeData.entities)) {
          templeData = templeData.entities
        } else if (templeData.items && Array.isArray(templeData.items)) {
          templeData = templeData.items
        }
      }

      if (!Array.isArray(templeData)) {
        console.error('🚨 Could not extract array from response:', response)
        return []
      }

      return templeData.map(temple => this.normalizeTempleData(temple))
    } catch (error) {
      console.error('❌ Error searching temples:', error)
      console.error('Error response:', error.response?.data)
      return []
    }
  }
  
}

export default templeService
