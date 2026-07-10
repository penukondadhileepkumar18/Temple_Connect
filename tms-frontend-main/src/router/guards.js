// src/router/guards.js
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useDevoteeStore } from '@/stores/devotee'

/**
 * Role mapping - map backend roles to frontend roles
 */
const roleMapping = {
  'templeadmin': 'tenant',
  'standarduser': 'standard_user',
  'monitoringuser': 'monitoring_user'
}

/**
 * Get mapped role (or original if no mapping exists)
 */
function getMappedRole(role) {
  if (!role) return null;
  return roleMapping[role.toLowerCase()] || role.toLowerCase();
}

/**
 * Helper function for case-insensitive status comparison
 */
function isStatusEqual(status1, status2) {
  return (status1 || '').toString().toLowerCase() === (status2 || '').toString().toLowerCase()
}

/**
 * Authentication Guard - UPDATED with localStorage check
 */
export function requireAuth(to, from, next) {
  const authStore = useAuthStore()
  
  // 🔥 CRITICAL: Re-initialize if not authenticated but token exists
  if (!authStore.isAuthenticated) {
    const hasToken = localStorage.getItem('auth_token')
    const hasUser = localStorage.getItem('user_data')
    
    if (hasToken && hasUser) {
      console.log('🔄 Auth not loaded, reinitializing from localStorage...')
      authStore.initialize()
    }
  }
  
  // Debug auth state
  console.log('🔐 Auth Check:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    userRole: authStore.userRole,
    needsTenantSelection: authStore.needsTenantSelection,
    assignedTenantId: authStore.assignedTenantId,
    route: to.path,
    toName: to.name
  })
  
  if (!authStore.isAuthenticated) {
    console.log('⚠️ Not authenticated, redirecting to login')
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        message: 'Please login to access this page'
      }
    })
    return false
  }
  
  // Check assigned tenant ID before redirecting to tenant selection
  if (authStore.needsTenantSelection && 
      to.name !== 'TenantSelection' && 
      !to.path.includes('/tenant-selection')) {
    
    console.log('📍 User needs tenant selection, redirecting...')
    console.log('- User role:', authStore.userRole)
    console.log('- Needs tenant selection:', authStore.needsTenantSelection)
    console.log('- Assigned tenant ID:', authStore.assignedTenantId)
    
    next({ name: 'TenantSelection' });
    return false;
  }
  
  // ALLOW: Superadmin can access tenant selection too
  if (authStore.isSuperAdmin && to.name === 'TenantSelection') {
    console.log('📍 SuperAdmin accessing tenant selection - allowed');
    next();
    return true;
  }
  
  console.log('✅ Auth guard passed for role:', authStore.userRole);
  next()
  return true
}


function normalizeRole(role) {
  if (!role) return ''
  const r = role.toLowerCase().trim()
  if (r === 'monitoringuser' || r === 'monitoring_user') return 'monitoring_user'
  if (r === 'standarduser' || r === 'standard_user') return 'standard_user'
  if (r === 'superadmin' || r === 'super_admin') return 'superadmin'
  return r
}

/**
 * Guest Guard - Updated with localStorage check
 */
export function requireGuest(to, from, next) {
  const authStore = useAuthStore()
  
  // 🔥 CRITICAL: Check localStorage even if store says not authenticated
  if (!authStore.isAuthenticated) {
    const hasToken = localStorage.getItem('auth_token')
    const hasUser = localStorage.getItem('user_data')
    
    if (hasToken && hasUser) {
      console.log('🔄 Guest guard: Found auth in localStorage, reinitializing...')
      authStore.initialize()
    }
  }
  
  if (authStore.isAuthenticated) {
    const redirectPath = authStore.getDashboardPath(authStore.userRole)
    console.log('🚪 Guest guard: authenticated user redirected to:', redirectPath)
    next({ path: redirectPath })
    return false
  }
  
  next()
  return true
}

/**
 * SPECIFIC GUARD: Check Profile Completed (for devotee routes)
 */
export function checkProfileCompleted(to, from, next) {
  const authStore = useAuthStore()
  const devoteeStore = useDevoteeStore()
  const { showToast } = useToast()
  
  if (!authStore.isAuthenticated) {
    next({ name: 'Login' })
    return
  }
  
  if (!authStore.isDevotee) {
    next({ name: 'Unauthorized' })
    return
  }
  
  // Check if profile is completed
  if (!devoteeStore.isProfileComplete && !authStore.user?.profileCompleted) {
    showToast('Please complete your profile first', 'warning')
    
    // If entity ID exists, redirect to entity-specific profile creation
    const entityId = to.params.id
    if (entityId) {
      next({ name: 'DevoteeProfileCreation', params: { id: entityId } })
    } else {
      next({ name: 'DevoteeTempleSelection' })
    }
    return
  }
  
  next()
}

export function setupRouteGuards(router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    // 🔥 CRITICAL: Always check localStorage first
    if (!authStore.isAuthenticated) {
      const hasToken = localStorage.getItem('auth_token')
      const hasUser = localStorage.getItem('user_data')
      
      if (hasToken && hasUser) {
        console.log('🔄 Route guard: Reinitializing auth from localStorage...')
        authStore.initialize()
      }
    }
    
    const isAuthenticated = authStore.isAuthenticated;
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
const userRole = (authStore.user?.role || authStore.userRole || '').toLowerCase();
    
    console.log('🔐 Route Guard Check:', {
      isAuthenticated,
      userRole,
      route: to.path,
      requiresAuth
    });
    
    // Special check for entity routes with tenant ID
    if (to.path.includes('/entity/') && to.params.id) {
      console.log('🏛️ Entity access check for tenant ID:', to.params.id);
      
      // Store the current entity ID
      localStorage.setItem('current_entity_id', to.params.id);
      
      // For superadmin, always allow access to any entity
      if (userRole.includes('superadmin')) {
        console.log('✅ SuperAdmin accessing entity - allowed');
        return next();
      }
    }
    
    if (requiresAuth && !isAuthenticated) {
      console.log('❌ Authentication required - redirecting to login');
      return next('/auth/login');
    }
    
    // All checks pass, continue
    next();
  });
}

/**
 * Role-based Access Guard
 */
export function requireRole(roles) {
  return (to, from, next) => {
    const authStore = useAuthStore()
    const { showToast } = useToast()
    
    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    const userRole = authStore.userRole || ''
    const normalizedRole = userRole.toLowerCase().trim()
    
    const userRoles = [normalizedRole]
    
    if (roleMapping[normalizedRole]) {
      userRoles.push(roleMapping[normalizedRole])
    }
    
    const roleVariations = {
      'standard_user': ['standarduser'],
      'monitoring_user': ['monitoringuser'],
      'standarduser': ['standard_user'],
      'monitoringuser': ['monitoring_user'],
      'super_admin': ['superadmin'],
      'superadmin': ['super_admin']
    }
    
    if (roleVariations[normalizedRole]) {
      userRoles.push(...roleVariations[normalizedRole])
    }
    
    const normalizedRequiredRoles = roles.map(role => role.toLowerCase().trim())
    
    const hasRequiredRole = normalizedRequiredRoles.some(requiredRole => 
      userRoles.includes(requiredRole)
    )
    
    console.log('🎭 Role check:', {
      userRole,
      userRoles,
      requiredRoles: normalizedRequiredRoles,
      hasAccess: hasRequiredRole
    })
    
    if (!hasRequiredRole) {
      showToast(`Access denied: User has role "${userRole}" but route requires one of: ${roles.join(', ')}`, 'error')
      next({ name: 'Unauthorized' })
      return
    }
    
    next()
  }
}

/**
 * SPECIFIC GUARD: Check Role (for route files)
 */
export function checkRole(to, from, next, requiredRole) {
  const authStore = useAuthStore()
  const { showToast } = useToast()
  
  if (!authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  const userRole = authStore.userRole || ''
  const normalizedRole = userRole.toLowerCase().trim()
  const normalizedRequiredRole = requiredRole.toLowerCase().trim()
  
  const userRoles = [normalizedRole]
  
  if (roleMapping[normalizedRole]) {
    userRoles.push(roleMapping[normalizedRole])
  }
  
  const roleVariations = {
    'standard_user': ['standarduser'],
    'monitoring_user': ['monitoringuser'],
    'standarduser': ['standard_user'],
    'monitoringuser': ['monitoring_user'],
    'super_admin': ['superadmin'],
    'superadmin': ['super_admin']
  }
  
  if (roleVariations[normalizedRole]) {
    userRoles.push(...roleVariations[normalizedRole])
  }
  
  if (!userRoles.includes(normalizedRequiredRole)) {
    showToast(`Access denied: User has role "${userRole}" but route requires: ${requiredRole}`, 'error')
    next({ name: 'Unauthorized' })
    return
  }
  
  next()
}

/**
 * Get default route based on user role - UPDATED with assigned tenant support
 */
export function getDefaultRoute(role) {
  if (!role) return '/';
  
  const normalizedRole = role.toLowerCase().trim()
  const authStore = useAuthStore();
  
  const routes = {
    'tenant': '/tenant/dashboard',
    'templeadmin': '/tenant/dashboard', 
    'devotee': '/devotee/temple-selection',
    'volunteer': '/volunteer/temple-selection',
    'superadmin': '/superadmin/dashboard',
    'super_admin': '/superadmin/dashboard'
  }
  
  // Special handling for standard_user and monitoring_user
  if (normalizedRole === 'standard_user' || normalizedRole === 'standarduser' || 
      normalizedRole === 'monitoring_user' || normalizedRole === 'monitoringuser') {
    
    // Use assigned tenant ID if available
    if (authStore.assignedTenantId) {
      return `/tenant/${authStore.assignedTenantId}/dashboard`;
    }
    return '/tenant-selection';
  }
  
  return routes[normalizedRole] || '/'
}

// Export utility functions
export {
  getMappedRole,
  isStatusEqual
}

// Export the default object with all guard functions
export default {
  requireAuth,
  requireGuest,
  requireRole,
  checkRole,
  checkProfileCompleted,
  getDefaultRoute
}