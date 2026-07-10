import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

// API Configuration - FIXED to use proper URL structure
const API_CONFIG = {
  BASE_URL:'/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

console.log('🔧 API Config:', API_CONFIG)

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Add auth token and tenant context
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)

    let token = localStorage.getItem('access_token')

    if (!token) {
      try {
        const authStore = useAuthStore()
        token = authStore.token
      } catch (e) {
        console.warn('Could not access auth store:', e)
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No authentication token for:', config.url)
    }

    config.metadata = { startTime: new Date() }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
    return response
  },
  async (error) => {
    console.error('❌ API Error:', error)

    let showToast
    try {
      const toastService = useToast()
      showToast = toastService.showToast || toastService.error || toastService
    } catch {
      showToast = () => {}
    }

    let authStore
    try {
      authStore = useAuthStore()
    } catch {}

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          showToast({ type: 'error', title: 'Authentication Required', message: 'Your session has expired. Please login again.' })
          if (authStore) authStore.logout()
          else localStorage.removeItem('auth_token')
          window.location.href = '/login'
          break

        case 403:
          showToast({ type: 'warning', title: 'Access Denied', message: data.message || 'You do not have permission.' })
          break

        case 404:
          showToast({ type: 'error', title: 'Not Found', message: data?.message || 'API endpoint not found.' })
          console.warn('404 URL:', error.config.url)
          break

        case 422:
          console.warn('Validation errors:', data.errors)
          break

        case 429:
          showToast({ type: 'warning', title: 'Too Many Requests', message: 'Please wait before retrying.' })
          break

        case 500:
          showToast({ type: 'error', title: 'Server Error', message: 'Internal error, please try again later.' })
          break

        default:
          showToast({ type: 'error', title: 'Request Failed', message: data?.message || 'Unexpected error occurred.' })
      }
    } else if (error.request) {
      showToast({ type: 'error', title: 'Network Error', message: 'Check your internet connection.' })
    } else {
      showToast({ type: 'error', title: 'Request Error', message: 'Request setup failed.' })
    }

    return Promise.reject(error)
  }
)

// Retry logic
const retryRequest = async (config, attempt = 1) => {
  try {
    return await axiosInstance(config)
  } catch (error) {
    if (attempt < API_CONFIG.RETRY_ATTEMPTS && error.response?.status >= 500) {
      console.log(`Retrying request (attempt ${attempt + 1})`)
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt))
      return retryRequest(config, attempt + 1)
    }
    throw error
  }
}

// Core API
export const api = {
  async get(url, config = {}) {
    try {
      const response = await retryRequest({ method: 'get', url, ...config })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async post(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.post(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async put(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.put(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async patch(url, data = {}, config = {}) {
    try {
      const response = await axiosInstance.patch(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async delete(url, config = {}) {
    try {
      const response = await axiosInstance.delete(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async upload(url, formData, onProgress = null) {
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
      if (onProgress) {
        config.onUploadProgress = (e) => {
          const percent = Math.round((e.loaded * 100) / e.total)
          onProgress(percent)
        }
      }
      const response = await axiosInstance.post(url, formData, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async download(url, filename = null) {
    try {
      const response = await axiosInstance.get(url, { responseType: 'blob' })
      const blob = new Blob([response.data])
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  },

  async batch(requests) {
    try {
      const promises = requests.map(({ method, url, data, config }) =>
        this[method](url, data, config)
      )
      return await Promise.allSettled(promises)
    } catch (error) {
      throw this.handleError(error)
    }
  },

  handleError(error) {
    const err = {
      message: 'Unexpected error occurred',
      status: null,
      data: null,
      errors: null
    }
    if (error.response) {
      err.message = error.response.data?.message || error.message
      err.status = error.response.status
      err.data = error.response.data
      err.errors = error.response.data?.errors
    } else if (error.request) {
      err.message = 'Network error - check your internet connection'
    } else {
      err.message = error.message
    }
    return err
  }
}

// API Endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email'
  },

  superAdmin: {
    dashboard: '/superadmin/dashboard',
    tenants: '/superadmin/tenants',
    pendingTenants: '/superadmin/tenants/pending',
    updateTenantApproval: (id) => `/superadmin/tenants/${id}/approval`,
    pendingEntities: '/superadmin/entities/pending',
    updateEntityApproval: (id) => `/superadmin/entities/${id}/approval`,
    stats: '/superadmin/stats'
  },

  tenant: {
    dashboard: '/tenant/dashboard',
    profile: '/tenant/profile',
    temples: '/tenant/temples',
    createTemple: '/tenant/temples',
    updateTemple: (id) => `/tenant/temples/${id}`,
    deleteTemple: (id) => `/tenant/temples/${id}`,
    documents: '/tenant/documents',
    uploadDocument: '/tenant/documents/upload'
  },

  entity: (entityId) => ({
    dashboard: `/entities/${entityId}/dashboard`,
    devotees: `/entities/${entityId}/devotees`,
    devotee: (devoteeId) => `/entities/${entityId}/devotees/${devoteeId}`,
    sevas: `/entities/${entityId}/sevas`,
    seva: (sevaId) => `/entities/${entityId}/sevas/${sevaId}`,
    donations: `/entities/${entityId}/donations`,
    donation: (donationId) => `/entity/${entityId}/donations/${donationId}`,
    events: `/entities/${entityId}/events`,
    event: (eventId) => `/entities/${entityId}/events/${eventId}`,
    volunteers: `/entities/${entityId}/volunteers`,
    volunteer: (volunteerId) => `/entities/${entityId}/volunteers/${volunteerId}`,
    communication: `/entities/${entityId}/communication`,
    templates: `/entities/${entityId}/communication/templates`,
    bulkMessage: `/entities/${entityId}/communication/bulk`,
    reports: `/entities/${entityId}/reports`,
    settings: `/entities/${entityId}/settings`
  }),

  donations: {
    my: '/donations/my',
  },

  // ✅ Updated: Use Devotee-accessible endpoint for temple listings
  public: {
    temples: '/devotee/available-temples',
    temple: (id) => `/devotee/available-temples/${id}`,
    searchTemples: '/devotee/available-temples/search',
    joinTemple: '/devotee/available-temples/join'
  },

  user: {
    profile: '/user/profile',
    preferences: '/user/preferences',
    notifications: '/user/notifications',
    markNotificationRead: (id) => `/user/notifications/${id}/read`,
    avatar: '/user/avatar'
  }
}

// API Utils
export const apiUtils = {
  buildQuery(params) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, value)
      }
    })
    return query.toString()
  },

  async paginate(endpoint, params = {}) {
    const query = this.buildQuery(params)
    const url = query ? `${endpoint}?${query}` : endpoint
    return api.get(url)
  },

  async search(endpoint, searchTerm, filters = {}) {
    const params = { search: searchTerm, ...filters }
    return this.paginate(endpoint, params)
  },

  async bulkOperation(endpoint, operation, ids) {
    return api.post(`${endpoint}/bulk`, { operation, ids })
  }
}

export default api
