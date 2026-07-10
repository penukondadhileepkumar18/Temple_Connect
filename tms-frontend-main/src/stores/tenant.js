import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTenantUsers, createOrUpdateTenantUser, updateTenantUser, updateUserStatus } from '@/services/tenant.service'

export const useTenantStore = defineStore('tenant', () => {
  // State
  const users = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const standardUsersCount = computed(() => 
    users.value.filter(user => user.role === 'StandardUser').length
  )
  
  const monitoringUsersCount = computed(() => 
    users.value.filter(user => user.role === 'MonitoringUser').length
  )

  // Actions
  const fetchUsers = async (tenantId, filters = {}) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log(`Fetching users for tenant ID: ${tenantId}`)
      const data = await getTenantUsers(tenantId, filters)
      users.value = data
      console.log(`Fetched ${data.length} users successfully`)
      return data
    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = err.message || 'Failed to fetch users'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createOrUpdateUser = async (userData) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Get tenant ID from localStorage
      const tenantId = localStorage.getItem('current_tenant_id') || '1'
      
      console.log(`Creating/updating user for tenant ID: ${tenantId}`)
      const result = await createOrUpdateTenantUser(tenantId, userData)
      
      // Refresh the user list
      await fetchUsers(tenantId)
      
      return result
    } catch (err) {
      console.error('Error creating/updating user:', err)
      error.value = err.message || 'Failed to create/update user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (tenantId, userData) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log(`Updating user ${userData.id} for tenant ${tenantId}:`, userData)
      
      // Make the API call
      const result = await updateTenantUser(tenantId, userData)
      
      // Update the local users array immediately for UI responsiveness
      const index = users.value.findIndex(u => u.id === userData.id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...userData }
        console.log('Updated local user state:', users.value[index])
      } else {
        console.warn(`User with ID ${userData.id} not found in local state`)
      }
      
      return result
    } catch (err) {
      console.error('Error updating user:', err)
      error.value = err.message || 'Failed to update user'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleUserStatus = async (tenantId, userId, status) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log(`Toggling status for user ${userId} to ${status}`)
      const result = await updateUserStatus(tenantId, userId, status)
      
      // Update the local users array to reflect the status change
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], status }
        console.log('Updated local user status:', users.value[index])
      }
      
      return result
    } catch (err) {
      console.error('Error toggling user status:', err)
      error.value = err.message || 'Failed to toggle user status'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    users,
    isLoading,
    error,
    
    // Computed
    standardUsersCount,
    monitoringUsersCount,
    
    // Actions
    fetchUsers,
    createOrUpdateUser,
    updateUser,
    toggleUserStatus
  }
})