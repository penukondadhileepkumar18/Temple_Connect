// src/services/devotee.service.js
import api from '@/plugins/axios';
import router from '@/router';

// Get the auth token from localStorage with validation
const getAuthToken = () => {
  const token = localStorage.getItem('temple_auth_token') || localStorage.getItem('auth_token');
  if (!token) {
    console.log('❌ No auth token found in localStorage');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    return null;
  }
  console.log('✅ Auth token found:', token.substring(0, 20) + '...');
  return token;
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = getAuthToken();
  return token !== null && token !== undefined && token !== '';
};

// Clear authentication data
const clearAuth = () => {
  localStorage.removeItem('temple_auth_token');
  localStorage.removeItem('temple_user_data');
  localStorage.removeItem('temple_user_role');
  // Clear legacy keys too
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

// Redirect to login
const redirectToLogin = () => {
  clearAuth();
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login');
  }
};

export default {
  /**
   * Get devotee profile (current user)
   */
  async getProfile() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/profiles/me');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },
/**
 * Get temple by ID for devotee dashboard
 * This uses the devotee-accessible endpoint
 */
async getTempleForDevotee(entityId) {
  try {
    console.log(`📡 Fetching temple for devotee, entity ID: ${entityId}`);
    
    const tenantId = localStorage.getItem('current_tenant_id') || '2';
    const timestamp = Date.now();
    
    // Try devotee-specific endpoint first
    try {
     const response = await api.get(`/temples/${entityId}?_=${timestamp}`);
      
      console.log('✅ Temple fetched via /temples endpoint');
      return this.normalizeTempleData(response.data);
    } catch (err) {
      console.log('⚠️ /temples endpoint failed, trying /entities...');
      
      // Fallback to entities endpoint
      const response = await api.get(`/entities/${entityId}?_=${timestamp}`);
      
      console.log('✅ Temple fetched via /entities endpoint');
      return this.normalizeTempleData(response.data);
    }
  } catch (error) {
    console.error(`❌ Error fetching temple for devotee ID ${entityId}:`, error);
    throw error;
  }
},
  /**
   * Get devotee by ID (for admin purposes)
   */
  async getDevoteeById(id) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get(`/profiles/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * NEW: Get devotee profile by entity and user ID
   * This is the main method for viewing devotee profiles in management
   */
  async getDevoteeProfileByEntity(entityId, userId) {
    try {
      console.log('🔍 getDevoteeProfileByEntity called:', { entityId, userId });
      
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        throw new Error('Authentication required');
      }

      if (!entityId || !userId) {
        console.error('❌ Missing required parameters');
        throw new Error('Entity ID and User ID are required');
      }

      // Ensure entityId and userId are integers
      const parsedEntityId = parseInt(entityId, 10);
      const parsedUserId = parseInt(userId, 10);

      console.log('📡 Making request to:', `/entities/${parsedEntityId}/devotees/${parsedUserId}/profile`);
      const response = await api.get(`/entities/${parsedEntityId}/devotees/${parsedUserId}/profile`);
      
      console.log('✅ Devotee profile fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ getDevoteeProfileByEntity error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        entityId,
        userId
      });
      throw this.handleError(error);
    }
  },

  /**
   * Create or update devotee profile
   */
  async createOrUpdateProfile(profileData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      let response;
      
      if (profileData instanceof FormData) {
        response = await api.post('/profiles', profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.post('/profiles', profileData);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update devotee profile
   */
  async updateProfile(id, profileData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      let response;
      if (profileData instanceof FormData) {
        response = await api.put('/profiles', profileData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await api.put('/profiles', profileData);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Join a temple
   */
  async joinTemple(entityId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      // Ensure entityId is an integer
      const parsedEntityId = parseInt(entityId, 10);

      const response = await api.post('/memberships', {
        entity_id: parsedEntityId
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get temple memberships
   */
  async getMemberships() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/memberships');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Check if devotee has joined a specific temple
   */
  async checkTempleJoined(templeId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      // Ensure templeId is an integer
      const parsedTempleId = parseInt(templeId, 10);

      const response = await api.get(`/memberships/check/${parsedTempleId}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return { data: { joined: false } };
      }
      throw this.handleError(error);
    }
  },

  /**
   * Get all devotees for an entity with enhanced debugging
   */
  async getAllDevotees(entityId) {
    try {
      console.log('🔍 getAllDevotees called with entityId:', entityId, 'type:', typeof entityId);
      
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        throw new Error('Authentication required');
      }

      if (!entityId) {
        console.error('❌ Entity ID is missing');
        throw new Error('Entity ID is required');
      }

      // Ensure entityId is an integer
      const parsedEntityId = parseInt(entityId, 10);
      console.log('🔢 Parsed entityId:', parsedEntityId, 'type:', typeof parsedEntityId);

      // Log current user info
      const userData = localStorage.getItem('temple_user_data') || localStorage.getItem('user_data');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('👤 Current user:', {
            id: user.id,
            email: user.email,
            role: user.role
          });
        } catch (e) {
          console.warn('⚠️ Could not parse user data');
        }
      }

      // Log current entity
      const currentEntityId = localStorage.getItem('current_entity_id');
      const currentTenantId = localStorage.getItem('current_tenant_id');
      console.log('🏛️ Current context:', {
        entityId: parsedEntityId,
        storedEntityId: currentEntityId,
        storedTenantId: currentTenantId
      });

      console.log('📡 Making request to:', `/entities/${parsedEntityId}/devotees`);
      const response = await api.get(`/entities/${parsedEntityId}/devotees`);
      
      console.log('✅ Devotees fetched successfully:', response.data?.length || 0);
      return response;
    } catch (error) {
      console.error('❌ getAllDevotees error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        entityId: entityId
      });
      throw this.handleError(error);
    }
  },

  /**
   * Get devotee stats for an entity with enhanced debugging
   */
  async getDevoteeStats(entityId) {
    try {
      console.log('🔍 getDevoteeStats called with entityId:', entityId, 'type:', typeof entityId);
      
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        throw new Error('Authentication required');
      }

      if (!entityId) {
        console.error('❌ Entity ID is missing');
        throw new Error('Entity ID is required');
      }

      // Ensure entityId is an integer
      const parsedEntityId = parseInt(entityId, 10);
      console.log('🔢 Parsed entityId:', parsedEntityId, 'type:', typeof parsedEntityId);

      console.log('📡 Making request to:', `/entities/${parsedEntityId}/devotee-stats`);
      const response = await api.get(`/entities/${parsedEntityId}/devotee-stats`);
      
      console.log('✅ Devotee stats fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ getDevoteeStats error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        entityId: entityId
      });
      throw this.handleError(error);
    }
  },

  /**
   * Update devotee membership status with enhanced debugging
   */
  async updateDevoteeStatus(entityId, devoteeId, status) {
    try {
      console.log('🔍 updateDevoteeStatus called:', { entityId, devoteeId, status });
      console.log('🔍 Parameter types:', { 
        entityIdType: typeof entityId, 
        devoteeIdType: typeof devoteeId 
      });
      
      if (!isAuthenticated()) {
        console.error('❌ User not authenticated');
        throw new Error('Authentication required');
      }

      if (!entityId || !devoteeId || !status) {
        console.error('❌ Missing required parameters');
        throw new Error('Entity ID, Devotee ID, and Status are required');
      }

      // Ensure entityId and devoteeId are integers
      const parsedEntityId = parseInt(entityId, 10);
      const parsedDevoteeId = parseInt(devoteeId, 10);
      
      console.log('🔢 Parsed IDs:', { 
        parsedEntityId, 
        parsedDevoteeId,
        entityIdType: typeof parsedEntityId,
        devoteeIdType: typeof parsedDevoteeId
      });

      // Validate parsed values
      if (isNaN(parsedEntityId) || isNaN(parsedDevoteeId)) {
        console.error('❌ Invalid ID format after parsing');
        throw new Error('Invalid entity ID or devotee ID format');
      }

      console.log('📡 Making request to:', `/entities/${parsedEntityId}/devotees/${parsedDevoteeId}/status`);
      const response = await api.patch(`/entities/${parsedEntityId}/devotees/${parsedDevoteeId}/status`, {
        status: status
      });
      
      console.log('✅ Devotee status updated successfully');
      return response;
    } catch (error) {
      console.error('❌ updateDevoteeStatus error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        entityId,
        devoteeId,
        newStatus: status
      });
      throw this.handleError(error);
    }
  },

  /**
   * Get all profiles/devotees (fallback method)
   */
  async getAllProfiles() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/profiles');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Add family member to devotee profile
   */
  async addFamilyMember(profileId, familyMemberData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      // Ensure profileId is an integer
      const parsedProfileId = parseInt(profileId, 10);

      const response = await api.post(`/profiles/${parsedProfileId}/family`, familyMemberData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Update family member
   */
  async updateFamilyMember(profileId, familyMemberId, familyMemberData) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      // Ensure IDs are integers
      const parsedProfileId = parseInt(profileId, 10);
      const parsedFamilyMemberId = parseInt(familyMemberId, 10);

      const response = await api.put(`/profiles/${parsedProfileId}/family/${parsedFamilyMemberId}`, familyMemberData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Remove family member
   */
  async removeFamilyMember(profileId, familyMemberId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      // Ensure IDs are integers
      const parsedProfileId = parseInt(profileId, 10);
      const parsedFamilyMemberId = parseInt(familyMemberId, 10);

      const response = await api.delete(`/profiles/${parsedProfileId}/family/${parsedFamilyMemberId}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get dashboard data
   */
  async getDashboardData(entityId) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      // Ensure entityId is an integer
      const parsedEntityId = parseInt(entityId, 10);

      const response = await api.get(`/entity/${parsedEntityId}/devotee/dashboard`);
      return response;
    } catch (error) {
      console.warn('Dashboard endpoint not available');
      throw this.handleError(error);
    }
  },

  /**
   * Search temples
   */
  async searchTemples(searchParams = {}) {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/temples/search', { params: searchParams });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Get recent temples
   */
  async getRecentTemples() {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }

      const response = await api.get('/temples/recent');
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('🔴 401 Authentication error:', error.response?.data);
      redirectToLogin();
      return new Error('Authentication failed. Please login again.');
    }

    // Handle authorization errors with detailed info
    if (error.response?.status === 403) {
      console.error('🔴 403 Authorization error:', error.response?.data);
      const errorMsg = error.response?.data?.error || 'Access denied. You do not have permission to perform this action.';
      return new Error(errorMsg);
    }

    if (error.response?.status === 404) {
      return new Error('The requested resource was not found.');
    }

    // Handle 400 Bad Request errors with more details
    if (error.response?.status === 400) {
      console.error('🔴 400 Bad Request error:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Bad request. Please check your input.';
      return new Error(errorMsg);
    }

    if (error.response?.status >= 500) {
      return new Error('Server error. Please try again later.');
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return new Error('Network error. Please check your internet connection.');
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }

    // Extract error messages from response
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  },

  /**
   * Utility methods for authentication
   */
  isAuthenticated,
  getAuthToken,
  clearAuth,
  redirectToLogin
};
