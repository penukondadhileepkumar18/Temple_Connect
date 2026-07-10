/**
 * Centralized redirect helper functions for role-based navigation
 * This ensures consistent redirect behavior across the application
 */

/**
 * Determines the appropriate redirect path based on user role and data
 * @param {string} userRole - The user's role
 * @param {Object} user - The user object containing additional data
 * @returns {string} The redirect path
 */
export function getRoleBasedRedirectPath(userRole, user) {
  const role = (userRole || '').toLowerCase().trim()
  
  console.log('🎭 Determining redirect for role:', role)
  
  // Handle special admin roles (standard_user, monitoring_user)
  if (role === 'standard_user' || role === 'standarduser' || 
      role === 'monitoring_user' || role === 'monitoringuser') {
    
    // Check if user has assigned tenant ID
    const assignedTenantId = localStorage.getItem('assigned_tenant_id')
    if (assignedTenantId) {
      console.log('✅ Redirecting special user to assigned tenant dashboard:', assignedTenantId)
      return `/tenant/${assignedTenantId}/dashboard`
    }
    
    // Otherwise redirect to tenant selection
    console.log('✅ Redirecting special user to tenant selection')
    return '/tenant-selection'
  }
  
  // Handle superadmin
  if (role === 'superadmin' || role === 'super_admin') {
    console.log('✅ Redirecting superadmin to dashboard')
    return '/superadmin/dashboard'
  }
  
  // Handle tenant/templeadmin
  if (role === 'tenant' || role === 'templeadmin') {
    const tenantId = user?.id || localStorage.getItem('current_tenant_id')
    const redirectPath = tenantId ? `/tenant/${tenantId}/dashboard` : '/tenant/dashboard'
    console.log('✅ Redirecting tenant to:', redirectPath)
    return redirectPath
  }
  
  // Handle devotee
  if (role === 'devotee') {
    const entityId = user?.entityId || user?.current_entity?.id
    if (entityId) {
      console.log('✅ Redirecting devotee to entity dashboard:', entityId)
      return `/entity/${entityId}/devotee/dashboard`
    } else {
      console.log('✅ Redirecting devotee to temple selection')
      return '/devotee/temple-selection'
    }
  }
  
  // Handle volunteer
  if (role === 'volunteer') {
    const entityId = user?.entityId || user?.current_entity?.id
    if (entityId) {
      console.log('✅ Redirecting volunteer to entity dashboard:', entityId)
      return `/entity/${entityId}/volunteer/dashboard`
    } else {
      console.log('✅ Redirecting volunteer to temple selection')
      return '/volunteer/temple-selection'
    }
  }
  
  // Handle entity_admin
  if (role === 'entity_admin') {
    const entityId = user?.entityId || user?.current_entity?.id
    if (entityId) {
      console.log('✅ Redirecting entity admin to entity dashboard:', entityId)
      return `/entity/${entityId}/dashboard`
    } else {
      console.log('✅ Redirecting entity admin to tenant dashboard')
      return '/tenant/dashboard'
    }
  }
  
  // Fallback for unknown roles
  console.log('⚠️ Unknown role, redirecting to login')
  return '/login'
}

/**
 * Checks if a user should be redirected from the current route
 * @param {string} currentPath - The current route path
 * @param {string} userRole - The user's role
 * @param {Object} user - The user object
 * @returns {boolean} Whether the user should be redirected
 */
export function shouldRedirectFromRoute(currentPath, userRole, user) {
  // Don't redirect if already on the correct dashboard
  const expectedPath = getRoleBasedRedirectPath(userRole, user)
  return currentPath !== expectedPath && currentPath === '/'
}

/**
 * Gets the dashboard path for a specific role
 * @param {string} role - The role to get dashboard for
 * @param {Object} user - The user object (optional)
 * @returns {string} The dashboard path
 */
export function getDashboardPathForRole(role, user = null) {
  return getRoleBasedRedirectPath(role, user)
}

/**
 * Role-specific dashboard paths for reference
 */
export const ROLE_DASHBOARD_PATHS = {
  SUPERADMIN: '/superadmin/dashboard',
  TENANT: '/tenant/dashboard',
  DEVOTEE_TEMPLE_SELECTION: '/devotee/temple-selection',
  VOLUNTEER_TEMPLE_SELECTION: '/volunteer/temple-selection',
  TENANT_SELECTION: '/tenant-selection',
  LOGIN: '/login'
}

/**
 * Validates if a redirect path is valid for a given role
 * @param {string} path - The path to validate
 * @param {string} role - The user's role
 * @returns {boolean} Whether the path is valid for the role
 */
export function isValidPathForRole(path, role) {
  const normalizedRole = (role || '').toLowerCase().trim()
  
  // Define valid paths for each role
  const validPaths = {
    'superadmin': ['/superadmin/dashboard'],
    'super_admin': ['/superadmin/dashboard'],
    'tenant': ['/tenant/dashboard', '/tenant'],
    'templeadmin': ['/tenant/dashboard', '/tenant'],
    'devotee': ['/devotee/temple-selection', '/entity', '/devotee'],
    'volunteer': ['/volunteer/temple-selection', '/entity', '/volunteer'],
    'standard_user': ['/tenant-selection', '/tenant', '/entity'],
    'standarduser': ['/tenant-selection', '/tenant', '/entity'],
    'monitoring_user': ['/tenant-selection', '/tenant', '/entity'],
    'monitoringuser': ['/tenant-selection', '/tenant', '/entity'],
    'entity_admin': ['/tenant/dashboard', '/entity', '/tenant']
  }
  
  const rolePaths = validPaths[normalizedRole] || []
  return rolePaths.some(validPath => path.startsWith(validPath))
}
