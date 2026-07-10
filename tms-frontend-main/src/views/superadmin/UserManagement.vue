<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200">
    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 font-roboto">User Management</h3>
        <p class="text-sm text-gray-600 mt-1">Create and manage system users</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3">
        <!-- Bulk Upload CSV Button -->
        <button
          @click="openBulkUploadModal"
          class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          Bulk Upload User
        </button>

        <!-- Regular Create User Button -->
        <button
          @click="openCreateModal"
          class="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create User
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="px-6 pt-6">
      <div class="flex space-x-2 border-b border-gray-200">
        <button
          v-for="filter in userFilters.filter(f => f.value !== 'all')"
          :key="filter.value"
          @click="activeFilter = filter.value"
          class="px-4 py-2 text-sm font-medium transition-colors relative"
          :class="activeFilter === filter.value 
            ? 'text-indigo-600 border-b-2 border-indigo-600' 
            : 'text-gray-600 hover:text-gray-900'"
        >
          {{ filter.label }}
          
          <span 
            class="ml-2 px-2 py-0.5 text-xs rounded-full"
            :class="activeFilter === filter.value 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'bg-gray-100 text-gray-600'"
          >
            {{ getUserCountByFilter(filter.value) }}
          </span>
        </button>
      </div>
    </div>

    <div class="p-6">
      <!-- Users List Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="isUsersLoading" class="animate-pulse">
              <td colspan="6" class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
            </tr>

            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                No users found in this category. Create your first user by clicking the 'Create User' button or upload users in bulk via CSV.
              </td>
            </tr>

            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <!-- User Avatar/Logo -->
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      v-if="user.temple_details?.logo_url" 
                      :src="user.temple_details.logo_url" 
                      alt="Logo" 
                      class="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div v-else class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span class="text-indigo-600 font-medium text-sm">{{ getUserInitials(user.full_name) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ user.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {{ getRoleDisplay(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    :id="`toggle-${user.id}`"
                    :checked="(user.status || '').toLowerCase() === 'active'"
                    @change="toggleUserStatus(user)"
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    :for="`toggle-${user.id}`"
                    class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
                <span class="text-xs ml-1">{{ (user.status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editUser(user)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>

                <div :class="{'opacity-50 pointer-events-none select-none': isAssignDisabled(user)}">
                  <user-assign-button :user="user" :disabled="isAssignDisabled(user)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bulk Upload CSV Modal -->
    <div v-if="showBulkUploadModal" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Bulk Upload Users via CSV</h3>
          <button @click="closeBulkUploadModal" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-4">
          <!-- Upload Result Alert -->
          <div v-if="bulkUploadResult" class="mb-6 rounded-lg p-4" :class="bulkUploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg v-if="bulkUploadResult.success" class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 w-full">
                <h3 class="text-sm font-medium" :class="bulkUploadResult.success ? 'text-green-800' : 'text-red-800'">
                  {{ bulkUploadResult.success ? 'Bulk Upload Completed!' : 'Bulk Upload Failed!' }}
                </h3>
                <div class="mt-2 text-sm" :class="bulkUploadResult.success ? 'text-green-700' : 'text-red-700'">
                  <p v-if="bulkUploadResult.success">
                    Successfully processed {{ bulkUploadResult.data?.total_rows || 0 }} rows.
                    {{ bulkUploadResult.data?.success_count || 0 }} users created successfully.
                    <span v-if="bulkUploadResult.data?.failed_count > 0">
                      {{ bulkUploadResult.data.failed_count }} failed.
                    </span>
                  </p>
                  <p v-else>{{ bulkUploadResult.message }}</p>

                  <ul v-if="bulkUploadResult.data?.errors && bulkUploadResult.data.errors.length > 0" class="mt-2 list-disc list-inside">
                    <li v-for="(err, index) in bulkUploadResult.data.errors" :key="index" class="text-xs">
                      {{ err }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- File Upload Section -->
          <div v-if="!csvData.length" class="space-y-6">
            <!-- Instructions -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="h-5 w-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-blue-800">CSV Upload Instructions</h4>
                  <div class="mt-2 text-sm text-blue-700">
                    <p>Please ensure your CSV file contains the following columns in exact order:</p>
                    <ul class="list-disc list-inside mt-1 space-y-1">
                      <li><strong>Full Name</strong> - User's complete name</li>
                      <li><strong>Email</strong> - Valid email address</li>
                      <li><strong>Phone</strong> - Phone number</li>
                      <li><strong>Password</strong> - User password</li>
                      <li>
                        <strong>Role</strong> - User role
                        ({{ bulkAllowedRoles.join(', ') }})
                      </li>
                      <li><strong>Status</strong> - active or inactive</li>
                    </ul>

                    <!-- Temple Admin blocked notice -->
                    <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p class="text-red-700 font-medium flex items-center">
                        <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <strong>Temple Admin role is NOT supported in bulk upload.</strong>
                      </p>
                      <p class="text-red-600 text-xs mt-1">
                        To create a Temple Admin account, please use the
                        <strong>'Create User'</strong> button individually. Any row containing the
                        <strong>'templeadmin'</strong> role will be rejected.
                      </p>
                    </div>

                    <p class="mt-2 text-xs text-blue-600">
                      <strong>CSV Warning:</strong> Commas (,) are not allowed in field values like Address, Description and Place.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Download Sample CSV -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 class="text-sm font-medium text-gray-800">Need a template?</h4>
                <p class="text-sm text-gray-600">Download a sample CSV file with the correct format.</p>
              </div>
              <button
                @click="downloadSampleCSV"
                class="flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download Sample
              </button>
            </div>

            <!-- File Upload Area -->
            <div class="mt-6">
              <div
                @click="$refs.fileInput.click()"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="handleFileDrop"
                class="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
                :class="{ 'border-green-400 bg-green-50': isDragOver }"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".csv"
                  @change="handleFileSelect"
                  class="hidden"
                />

                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                <div class="mt-4">
                  <p class="text-lg text-gray-600">Drop your CSV file here or click to browse</p>
                  <p class="text-sm text-gray-500 mt-1">Only .csv files are accepted</p>
                </div>
              </div>

              <div v-if="fileError" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ fileError }}
              </div>
            </div>
          </div>

          <!-- CSV Data Preview -->
          <div v-if="csvData.length > 0" class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-lg font-medium text-gray-900">CSV Data Preview</h4>
                <p class="text-sm text-gray-600">{{ csvData.length }} rows found. Review the data before uploading.</p>
              </div>
              <button
                @click="clearCsvData"
                class="text-sm text-gray-500 hover:text-gray-700"
              >
                Upload Different File
              </button>
            </div>

            <div class="overflow-x-auto border border-gray-200 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(row, index) in csvData.slice(0, 10)" :key="index" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ row.full_name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ row.email }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ row.phone }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ row.password ? '****' : 'Missing' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span
                        class="px-2 py-1 text-xs rounded-full"
                        :class="isValidRole(row.role) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ row.role }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <span
                        class="px-2 py-1 text-xs rounded-full"
                        :class="isValidStatus(row.status) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ row.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-if="csvData.length > 10" class="text-sm text-gray-500 text-center">
              Showing first 10 rows. {{ csvData.length - 10 }} more rows will be processed.
            </p>

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                @click="clearCsvData"
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="uploadBulkUsers"
                :disabled="isBulkUploading || !csvData.length"
                class="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isBulkUploading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isBulkUploading ? 'Uploading...' : `Upload ${csvData.length} Users` }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Single User Create/Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">{{ isEditing ? 'Edit User' : 'Create New User' }}</h3>
          <button @click="cancelUserForm" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-4">
          <!-- Success Alert -->
          <div v-if="registrationSuccess" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">User {{ isEditing ? 'Updated' : 'Created' }} Successfully!</h3>
                <div class="mt-1 text-sm text-green-700">
                  <p>User account has been {{ isEditing ? 'updated' : 'created' }} successfully.</p>
                </div>
              </div>
            </div>
          </div>

          <form v-if="!registrationSuccess" @submit.prevent="handleSubmitUser" class="space-y-6">
            <!-- Full Name Field -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                v-model="form.fullName"
                type="text"
                placeholder="Enter full name"
                required
                autocomplete="name"
                class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                :class="{ 'border-red-500': errors.fullName }"
              />
              <div v-if="errors.fullName" class="mt-1 text-sm text-red-600">
                {{ errors.fullName }}
              </div>
            </div>

            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Enter email"
                required
                autocomplete="email"
                class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                :class="{ 'border-red-500': errors.email }"
              />
              <div v-if="errors.email" class="mt-1 text-sm text-red-600">
                {{ errors.email }}
              </div>
            </div>

            <!-- Password Field (only for new users) -->
            <div v-if="!isEditing">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Create a strong password"
                required
                autocomplete="new-password"
                class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                :class="{ 'border-red-500': errors.password }"
              />
              <div v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </div>
              <PasswordStrengthMeter
                :password="form.password"
                class="mt-2"
              />
            </div>

            <!-- Phone Field -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span class="text-red-500">*</span>
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="Enter phone number"
                required
                autocomplete="tel"
                class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                :class="{ 'border-red-500': errors.phone }"
              />
              <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
                {{ errors.phone }}
              </div>
            </div>

            <!-- Role Dropdown Selector -->
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
                User Role <span class="text-red-500">*</span>
              </label>
              <select
                id="role"
                v-model="form.role"
                class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                required
                :disabled="isRolesLoading || isEditing"
              >
                <option value="" disabled>{{ isRolesLoading ? 'Loading roles...' : 'Select a role' }}</option>
                <option
                  v-for="role in roles"
                  :key="role.id"
                  :value="role.role_name"
                >
                  {{ role.role_name }}
                </option>
              </select>
              <div v-if="isEditing" class="mt-2 text-xs text-gray-500">
                Role cannot be changed when editing
              </div>
              <div v-if="roles.length === 0 && !isRolesLoading" class="mt-2 text-sm text-amber-600">
                No roles available. Please check role configuration.
              </div>
              <div v-if="errors.role" class="mt-2 text-sm text-red-600">
                {{ errors.role }}
              </div>
            </div>

            <!-- Temple details section (only for temple admin role) -->
            <div v-if="form.role === 'templeadmin'" class="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 class="font-medium text-gray-900">Temple Details</h4>

              <!-- Logo Upload Section -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Logo
                </label>
                
                <!-- Current Logo Preview -->
                <div v-if="form.templeDetails.logoUrl || logoPreview" class="mb-3">
                  <div class="relative inline-block">
                    <img 
                      :src="logoPreview || form.templeDetails.logoUrl" 
                      alt="Logo Preview" 
                      class="h-24 w-24 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      @click="removeLogo"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Upload Button -->
                <div class="flex items-center space-x-3">
                  <button
                    type="button"
                    @click="$refs.logoInput.click()"
                    class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {{ form.templeDetails.logoUrl || logoPreview ? 'Change Logo' : 'Upload Logo' }}
                  </button>
                  <span class="text-xs text-gray-500">JPG, PNG, GIF, WebP (Max 500kb)</span>
                </div>
                
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  @change="handleLogoUpload"
                  class="hidden"
                />
                
                <div v-if="logoUploadError" class="mt-2 text-sm text-red-600">
                  {{ logoUploadError }}
                </div>
              </div>

              <!-- Video Upload Section -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Intro Video
                </label>
                
                <!-- Current Video Preview -->
                <div v-if="form.templeDetails.introVideoUrl || videoPreview" class="mb-3">
                  <div class="relative inline-block">
                    <video 
                      :src="videoPreview || form.templeDetails.introVideoUrl" 
                      class="h-32 w-56 object-cover rounded-lg border-2 border-gray-300"
                      controls
                    ></video>
                    <button
                      type="button"
                      @click="removeVideo"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Upload Button -->
                <div class="flex items-center space-x-3">
                  <button
                    type="button"
                    @click="$refs.videoInput.click()"
                    class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {{ form.templeDetails.introVideoUrl || videoPreview ? 'Change Video' : 'Upload Video' }}
                  </button>
                  <span class="text-xs text-gray-500">MP4, AVI, MOV, WMV, WebM (Max 5MB)</span>
                </div>
                
                <input
                  ref="videoInput"
                  type="file"
                  accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                  @change="handleVideoUpload"
                  class="hidden"
                />
                
                <div v-if="videoUploadError" class="mt-2 text-sm text-red-600">
                  {{ videoUploadError }}
                </div>
              </div>

              <!-- Temple Name -->
              <div>
                <label for="templeName" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="templeName"
                  v-model="form.templeDetails.name"
                  type="text"
                  placeholder="Enter temple name"
                  required
                  class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                  :class="{ 'border-red-500': errors.templeName }"
                />
                <div v-if="errors.templeName" class="mt-1 text-sm text-red-600">
                  {{ errors.templeName }}
                </div>
              </div>

              <!-- Temple Place -->
              <div>
                <label for="templePlace" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Location <span class="text-red-500">*</span>
                </label>
                <input
                  id="templePlace"
                  v-model="form.templeDetails.place"
                  type="text"
                  placeholder="Enter city, state"
                  required
                  class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                  :class="{ 'border-red-500': errors.templePlace }"
                />
                <div v-if="errors.templePlace" class="mt-1 text-sm text-red-600">
                  {{ errors.templePlace }}
                </div>
              </div>

              <!-- Temple Address -->
              <div>
                <label for="templeAddress" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Address <span class="text-red-500">*</span>
                </label>
                <input
                  id="templeAddress"
                  v-model="form.templeDetails.address"
                  type="text"
                  placeholder="Enter complete address"
                  required
                  class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                  :class="{ 'border-red-500': errors.templeAddress }"
                />
                <div v-if="errors.templeAddress" class="mt-1 text-sm text-red-600">
                  {{ errors.templeAddress }}
                </div>
              </div>

              <!-- Temple Phone -->
              <div>
                <label for="templePhoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Phone <span class="text-red-500">*</span>
                </label>
                <input
                  id="templePhoneNumber"
                  v-model="form.templeDetails.phoneNumber"
                  type="tel"
                  placeholder="Enter temple contact number"
                  required
                  class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                  :class="{ 'border-red-500': errors.templePhoneNumber }"
                />
                <div v-if="errors.templePhoneNumber" class="mt-1 text-sm text-red-600">
                  {{ errors.templePhoneNumber }}
                </div>
              </div>

              <!-- Temple Description -->
              <div>
                <label for="templeDescription" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="templeDescription"
                  v-model="form.templeDetails.description"
                  rows="3"
                  class="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200 p-3 leading-relaxed"
                  placeholder="Brief description about the temple"
                  required
                ></textarea>
                <div v-if="errors.templeDescription" class="mt-1 text-sm text-red-600">
                  {{ errors.templeDescription }}
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                @click="cancelUserForm"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                :disabled="isLoading || isUploadingFile"
              >
                <svg v-if="isLoading || isUploadingFile" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isUploadingFile ? 'Uploading Files...' : (isEditing ? 'Update User' : 'Create User') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useSuperAdminStore } from '@/stores/superadmin'
import UserAssignButton from '@/components/superadmin/UserAssignButton.vue'
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue'
import api from '@/services/api'

const { success, error } = useToast()
const superAdminStore = useSuperAdminStore()

// ─── State ────────────────────────────────────────────────────────────────────
const isLoading = computed(() => superAdminStore.loadingUserAction)
const isRolesLoading = computed(() => superAdminStore.loadingUserRoles)
const isUsersLoading = computed(() => superAdminStore.loadingUsers)
const registrationSuccess = ref(false)
const showCreateModal = ref(false)
const isEditing = ref(false)
const editingUserId = ref(null)

// File upload state
const isUploadingFile = ref(false)
const logoPreview = ref(null)
const videoPreview = ref(null)
const logoUploadError = ref('')
const videoUploadError = ref('')

// Filter state
const activeFilter = ref('internal')

// Bulk upload state
const showBulkUploadModal = ref(false)
const csvData = ref([])
const fileError = ref('')
const isDragOver = ref(false)
const isBulkUploading = ref(false)
const bulkUploadResult = ref(null)
const tenantsData = ref([])
const isTenantsLoading = ref(false)

// ─── Reactive data ────────────────────────────────────────────────────────────
const roles = computed(() => superAdminStore.userRoles || [])
const users = computed(() => superAdminStore.users || [])
const availableRoles = computed(() => roles.value.map(role => role.role_name))

// ✅ Roles allowed in bulk upload — templeadmin is intentionally excluded
const BLOCKED_BULK_ROLES = ['templeadmin']
const bulkAllowedRoles = computed(() =>
  availableRoles.value.filter(r => !BLOCKED_BULK_ROLES.includes(r.toLowerCase()))
)

// ─── Filter config ────────────────────────────────────────────────────────────
const userFilters = [
  { value: 'internal', label: 'Internal Admins' },
  { value: 'volunteers', label: 'Volunteers' },
  { value: 'devotees', label: 'Devotees' }
]

const roleCategories = {
  internal: ['superadmin', 'templeadmin', 'standarduser', 'monitoringuser'],
  volunteers: ['volunteer', '4'],
  devotees: ['devotee', 'user', '3']
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeRoleName = (role) => {
  let name = ''
  if (typeof role === 'object' && role) {
    name = role.role_name || role.name || role.description || ''
  } else {
    name = role || ''
  }
  return String(name).toLowerCase().replace(/[\s\-_]/g, '')
}

const isTempleAdminRole = (user) => normalizeRoleName(user?.role) === 'templeadmin'

const resolveTempleApproval = (u) => {
  const s = (v) => (typeof v === 'string' ? v.toLowerCase().trim() : null)
  const b = (v) => (typeof v === 'boolean' ? v : null)

  const statusCandidates = [
    s(u?.temple_details?.approval_status),
    s(u?.temple_details?.approvalStatus),
    s(u?.temple_details?.approval),
    s(u?.approval_status),
    s(u?.approvalStatus),
  ].filter(Boolean)

  const boolCandidates = [
    b(u?.temple_details?.is_approved),
    b(u?.is_approved),
  ].filter((v) => v !== null)

  if (boolCandidates.includes(true)) return { known: true, approved: true }

  const hasApproved = statusCandidates.some((x) =>
    x === 'approved' ||
    x === 'approve' ||
    (x.includes('approve') && !x.includes('not') && !x.includes('un') && !x.includes('reject') && !x.includes('pending'))
  )
  if (hasApproved) return { known: true, approved: true }

  const negativeSet = ['pending', 'under_review', 'underreview', 'awaiting_approval', 'awaitingapproval', 'not_approved', 'notapproved', 'rejected', 'declined']
  const isPendingOrRejected = statusCandidates.some((x) => negativeSet.includes(x))
  if (isPendingOrRejected) return { known: true, approved: false }

  return { known: false, approved: false }
}

const getUserCategory = (user) => {
  const roleName = normalizeRoleName(user?.role)
  const roleId = String(user?.role_id || user?.role?.id || '')

  if (roleCategories.internal.includes(roleName)) return 'internal'
  if (roleCategories.volunteers.includes(roleName) || roleCategories.volunteers.includes(roleId)) return 'volunteers'
  if (roleCategories.devotees.includes(roleName) || roleCategories.devotees.includes(roleId)) return 'devotees'
  return 'other'
}

const getUserCountByFilter = (filterValue) => {
  const list = baseFilteredUsers.value ?? []
  return list.filter(user => getUserCategory(user) === filterValue).length || 0
}

const getUserInitials = (fullName) => {
  if (!fullName) return '??'
  const names = fullName.split(' ')
  if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase()
  return fullName.substring(0, 2).toUpperCase()
}

const baseFilteredUsers = computed(() =>
  (users.value || []).filter((u) => {
    if (!isTempleAdminRole(u)) return true
    const st = resolveTempleApproval(u)
    if (st.known) return st.approved
    return true
  })
)

const filteredUsers = computed(() =>
  baseFilteredUsers.value.filter(user => getUserCategory(user) === activeFilter.value)
)

// ─── Form state ───────────────────────────────────────────────────────────────
const form = ref({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: '',
  isActive: true,
  templeDetails: {
    name: '',
    place: '',
    address: '',
    phoneNumber: '',
    description: '',
    logoUrl: '',
    introVideoUrl: ''
  }
})

const errors = ref({})

// ─── Logo upload ──────────────────────────────────────────────────────────────
const handleLogoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  logoUploadError.value = ''

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    logoUploadError.value = 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    logoUploadError.value = 'File size must be less than 5MB.'
    return
  }

  try {
    isUploadingFile.value = true

    const reader = new FileReader()
    reader.onload = (e) => { logoPreview.value = e.target.result }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('logo', file)

    if (isEditing.value && editingUserId.value) {
      formData.append('targetUserId', editingUserId.value.toString())
    }

    const response = await api.post('/superadmin/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const logoUrl = response.url || response.data?.url

    if (logoUrl) {
      form.value.templeDetails.logoUrl = logoUrl
      logoUploadError.value = ''
      success('Logo uploaded successfully!')
    } else {
      throw new Error('No URL in logo upload response')
    }
  } catch (err) {
    logoUploadError.value = err.response?.data?.error || err.message || 'Failed to upload logo'
    error(logoUploadError.value)
    logoPreview.value = null
    form.value.templeDetails.logoUrl = ''
  } finally {
    isUploadingFile.value = false
  }
}

// ─── Video upload ─────────────────────────────────────────────────────────────
const handleVideoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  videoUploadError.value = ''

  const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
  if (!validTypes.includes(file.type)) {
    videoUploadError.value = 'Invalid file type. Only MP4, AVI, MOV, WMV, and WebM are allowed.'
    return
  }

  if (file.size > 50 * 1024 * 1024) {
    videoUploadError.value = 'File size must be less than 50MB.'
    return
  }

  try {
    isUploadingFile.value = true

    const reader = new FileReader()
    reader.onload = (e) => { videoPreview.value = e.target.result }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('video', file)

    if (isEditing.value && editingUserId.value) {
      formData.append('targetUserId', editingUserId.value.toString())
    }

    const response = await api.post('/superadmin/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const videoUrl = response.url || response.data?.url

    if (videoUrl) {
      form.value.templeDetails.introVideoUrl = videoUrl
      videoUploadError.value = ''
      success('Video uploaded successfully!')
    } else {
      throw new Error('No URL in video upload response')
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || 'Failed to upload video'
    videoUploadError.value = errorMessage
    error(errorMessage)
    videoPreview.value = null
    form.value.templeDetails.introVideoUrl = ''
  } finally {
    isUploadingFile.value = false
  }
}

const removeLogo = async () => {
  if (form.value.templeDetails.logoUrl) {
    try {
      await api.delete('/superadmin/upload/file', {
        data: { fileUrl: form.value.templeDetails.logoUrl }
      })
    } catch (err) {
      console.error('Failed to delete logo from server:', err)
    }
  }
  form.value.templeDetails.logoUrl = ''
  logoPreview.value = null
  logoUploadError.value = ''
}

const removeVideo = async () => {
  if (form.value.templeDetails.introVideoUrl) {
    try {
      await api.delete('/superadmin/upload/file', {
        data: { fileUrl: form.value.templeDetails.introVideoUrl }
      })
    } catch (err) {
      console.error('Failed to delete video from server:', err)
    }
  }
  form.value.templeDetails.introVideoUrl = ''
  videoPreview.value = null
  videoUploadError.value = ''
}

// ─── Modal helpers ────────────────────────────────────────────────────────────
const openCreateModal = () => { showCreateModal.value = true }

const openBulkUploadModal = () => {
  showBulkUploadModal.value = true
  bulkUploadResult.value = null
}

const closeBulkUploadModal = () => {
  showBulkUploadModal.value = false
  clearCsvData()
  bulkUploadResult.value = null
}

const fetchTenantsData = async () => {
  try {
    isTenantsLoading.value = true
    const response = await api.get('/tenantsInfo?status=active')
    tenantsData.value = response.data?.data || []
  } catch (err) {
    console.error('Error fetching tenants:', err)
    tenantsData.value = []
  } finally {
    isTenantsLoading.value = false
  }
}

onMounted(async () => {
  await superAdminStore.refreshUserData()
  await fetchTenantsData()
})

// ─── Display helpers ──────────────────────────────────────────────────────────
const getRoleDisplay = (role) => {
  if (typeof role === 'object' && role?.description) return role.description
  if (typeof role === 'object' && role?.role_name) return role.role_name
  const roleObj = roles.value.find(r => r.role_name === role)
  return roleObj ? (roleObj.description || roleObj.role_name) : role
}

const isAssignDisabled = (user) => {
  const rn = normalizeRoleName(user?.role)
  const isStdOrMon = rn === 'standarduser' || rn === 'monitoringuser'
  const inactive = (user?.status || '').toLowerCase() !== 'active'
  return isStdOrMon && inactive
}

// ─── CSV validation ───────────────────────────────────────────────────────────
// ✅ Returns false for templeadmin — shows red badge in preview
const isValidRole = (role) => {
  if (!role) return false
  if (BLOCKED_BULK_ROLES.includes(role.toLowerCase())) return false
  return availableRoles.value.includes(role)
}

const isValidStatus = (status) => ['active', 'inactive'].includes(status?.toLowerCase())

// ─── Download sample CSV (no templeadmin row, no temple columns) ──────────────
const downloadSampleCSV = () => {
  const csvContent = [
    ['Full Name', 'Email', 'Phone', 'Password', 'Role', 'Status'],
    ['John Doe', 'john.doe@example.com', '+1234567890', 'password123', 'devotee', 'active'],
    ['Jane Smith', 'jane.smith@example.com', '+1234567891', 'password456', 'standarduser', 'active'],
    ['Mike Johnson', 'mike.johnson@example.com', '+1234567892', 'password789', 'volunteer', 'active']
  ]
  const csvString = csvContent.map(row => row.map(field => `"${field}"`).join(',')).join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'bulk_users_template.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ─── File handling ────────────────────────────────────────────────────────────
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) processFile(file)
}

const handleFileDrop = (event) => {
  isDragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) processFile(files[0])
}

const processFile = (file) => {
  fileError.value = ''
  if (!file.name.toLowerCase().endsWith('.csv')) {
    fileError.value = 'Please upload a CSV file (.csv extension required)'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    fileError.value = 'File size must be less than 5MB'
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      parseCsvData(e.target.result)
    } catch (err) {
      fileError.value = 'Error reading the file. Please try again.'
    }
  }
  reader.onerror = () => { fileError.value = 'Error reading the file. Please try again.' }
  reader.readAsText(file)
}

// ✅ parseCsvData — blocks templeadmin rows immediately with a clear error
const parseCsvData = (csvText) => {
  try {
    const lines = csvText.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      fileError.value = 'CSV file must contain at least a header row and one data row'
      return
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const requiredHeaders = ['Full Name', 'Email', 'Phone', 'Password', 'Role', 'Status']

    const missingHeaders = requiredHeaders.filter(expected => !headers.includes(expected))
    if (missingHeaders.length > 0) {
      fileError.value = `Missing required CSV headers: ${missingHeaders.join(', ')}`
      return
    }

    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())

      if (values.length < requiredHeaders.length) {
        fileError.value = `Row ${i + 1} has ${values.length} columns but expected at least ${requiredHeaders.length}`
        return
      }

      const rowData = {
        full_name: values[headers.indexOf('Full Name')],
        email:     values[headers.indexOf('Email')],
        phone:     values[headers.indexOf('Phone')],
        password:  values[headers.indexOf('Password')],
        role:      values[headers.indexOf('Role')],
        status:    values[headers.indexOf('Status')]
      }

      // ✅ Block templeadmin role — stop parsing immediately
      if (rowData.role && BLOCKED_BULK_ROLES.includes(rowData.role.toLowerCase())) {
        fileError.value =
          `Row ${i + 1}: The 'templeadmin' role is not allowed in bulk upload. ` +
          `Please use the 'Create User' button to create Temple Admin accounts individually.`
        csvData.value = []
        return
      }

      if (!rowData.full_name || !rowData.email || !rowData.phone || !rowData.password || !rowData.role) {
        fileError.value = `Row ${i + 1} is missing required fields`
        return
      }

      data.push(rowData)
    }

    csvData.value = data
  } catch (err) {
    fileError.value = 'Error parsing CSV file. Please check the format and try again.'
  }
}

const clearCsvData = () => {
  csvData.value = []
  fileError.value = ''
  const fileInput = window.document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

const uploadBulkUsers = async () => {
  if (!csvData.value.length) {
    error('No CSV data to upload')
    return
  }
  isBulkUploading.value = true
  bulkUploadResult.value = null
  try {
    const result = await superAdminStore.createBulkUsers(csvData.value)
    if (result.success) {
      bulkUploadResult.value = { success: true, message: 'Bulk upload completed successfully', data: result.data }
      success(`Successfully uploaded ${result.data.success_count} out of ${result.data.total_rows} users`)
      await superAdminStore.refreshUserData()
      setTimeout(() => { clearCsvData() }, 3000)
    } else {
      bulkUploadResult.value = { success: false, message: result.error || 'Bulk upload failed', data: result.data }
      error(result.error || 'Failed to upload users')
    }
  } catch (err) {
    bulkUploadResult.value = { success: false, message: 'An error occurred during bulk upload', data: null }
    error('Failed to upload users. Please try again.')
  } finally {
    isBulkUploading.value = false
  }
}

// ─── Form validation ──────────────────────────────────────────────────────────
const isFormValid = computed(() => {
  if (!form.value.fullName || !form.value.email || (!isEditing.value && !form.value.password) || !form.value.phone || !form.value.role) return false
  if (form.value.role === 'templeadmin') {
    const t = form.value.templeDetails
    if (!t.name || !t.place || !t.address || !t.phoneNumber || !t.description) return false
  }
  return Object.keys(errors.value).length === 0
})

const validateForm = () => {
  errors.value = {}

  if (!form.value.fullName.trim()) errors.value.fullName = 'Full name is required'
  else if (form.value.fullName.trim().length < 2) errors.value.fullName = 'Full name must be at least 2 characters'

  if (!form.value.email) errors.value.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errors.value.email = 'Please enter a valid email address'

  if (!isEditing.value) {
    if (!form.value.password) errors.value.password = 'Password is required'
    else if (form.value.password.length < 6) errors.value.password = 'Password must be at least 6 characters'
  }

  if (!form.value.phone) errors.value.phone = 'Phone number is required'
  else if (!/^[\+]?[1-9][\d]{0,15}$/.test(form.value.phone.replace(/\s/g, ''))) errors.value.phone = 'Please enter a valid phone number'

  if (!form.value.role) errors.value.role = 'Please select a user role'

  if (form.value.role === 'templeadmin') {
    if (!form.value.templeDetails.name)        errors.value.templeName        = 'Temple name is required'
    if (!form.value.templeDetails.place)       errors.value.templePlace       = 'Temple location is required'
    if (!form.value.templeDetails.address)     errors.value.templeAddress     = 'Temple address is required'
    if (!form.value.templeDetails.phoneNumber) errors.value.templePhoneNumber = 'Temple phone number is required'
    if (!form.value.templeDetails.description?.trim()) errors.value.templeDescription = 'Temple description is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmitUser = async () => {
  if (!validateForm()) return

  try {
    let userData = {
      fullName: form.value.fullName,
      email:    form.value.email,
      phone:    form.value.phone
    }

    if (!isEditing.value) {
      userData.role     = form.value.role
      userData.password = form.value.password
    }

    if (form.value.role === 'templeadmin') {
      const temple = form.value.templeDetails

      if (!temple.name || !temple.place) {
        error('Temple name and place are required')
        return
      }

      userData = {
        ...userData,
        templeName:       temple.name,
        templePlace:      temple.place,
        templeAddress:    temple.address     || '',
        templePhoneNo:    temple.phoneNumber || '',
        templeDescription: temple.description || '',
        logoUrl:          temple.logoUrl      || '',
        introVideoUrl:    temple.introVideoUrl || ''
      }
    }

    let result
    if (isEditing.value) {
      result = await superAdminStore.updateUser(editingUserId.value, userData)
    } else {
      result = await superAdminStore.createUser(userData)
    }

    if (result?.message) {
      registrationSuccess.value = true
      success(result.message)
      setTimeout(() => {
        resetForm()
        showCreateModal.value = false
        registrationSuccess.value = false
      }, 2000)
    } else {
      error(`Failed to ${isEditing.value ? 'update' : 'create'} user`)
    }
  } catch (err) {
    console.error('❌ User submit error:', err)
    error(`Failed to ${isEditing.value ? 'update' : 'create'} user. Please try again.`)
  }
}

// ─── Toggle status ────────────────────────────────────────────────────────────
const toggleUserStatus = async (user) => {
  try {
    const newStatus = (user.status || '').toLowerCase() === 'active' ? 'inactive' : 'active'
    const result = await superAdminStore.updateUserStatus(user.id, newStatus)
    if (result.success) {
      success(result.message || `User status updated to ${newStatus}`)
    } else {
      error(result.error || 'Failed to update user status')
    }
  } catch (err) {
    error('Failed to update user status')
  }
}

// ─── Media URL helper ─────────────────────────────────────────────────────────
const getFullMediaUrl = (relativePath) => {
  if (!relativePath) return null
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return relativePath
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin
  return `${baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
}

// ─── Edit user ────────────────────────────────────────────────────────────────
const editUser = async (user) => {
  isEditing.value = true
  editingUserId.value = user.id

  const isTempleAdmin = normalizeRoleName(user?.role) === 'templeadmin'
  let templeDetails = user.temple_details

  if (isTempleAdmin && !templeDetails) {
    try {
      const response = await api.get(`/superadmin/users/${user.id}`)
      if (response && response.data) {
        templeDetails = response.data.temple_details
      }
    } catch (err) {
      console.error('❌ Failed to fetch temple details:', err)
      error('Failed to load temple details')
    }
  }

  const logoUrl  = templeDetails?.logo_url        ? getFullMediaUrl(templeDetails.logo_url)        : ''
  const videoUrl = templeDetails?.intro_video_url ? getFullMediaUrl(templeDetails.intro_video_url) : ''

  form.value = {
    fullName: user.full_name || '',
    email:    user.email    || '',
    phone:    user.phone    || '',
    role:     (typeof user.role === 'object' ? user.role?.role_name : user.role) || '',
    isActive: (user.status || '').toLowerCase() === 'active',
    templeDetails: {
      name:          templeDetails?.temple_name        || '',
      place:         templeDetails?.temple_place       || '',
      address:       templeDetails?.temple_address     || '',
      phoneNumber:   templeDetails?.temple_phone_no    || '',
      description:   templeDetails?.temple_description || '',
      logoUrl,
      introVideoUrl: videoUrl
    }
  }

  logoPreview.value  = logoUrl
  videoPreview.value = videoUrl

  showCreateModal.value = true
}

// ─── Cancel / Reset ───────────────────────────────────────────────────────────
const cancelUserForm = () => {
  showCreateModal.value = false
  setTimeout(() => {
    resetForm()
    isEditing.value = false
    editingUserId.value = null
    registrationSuccess.value = false
  }, 300)
}

const resetForm = () => {
  form.value = {
    fullName: '',
    email:    '',
    password: '',
    phone:    '',
    role:     '',
    isActive: true,
    templeDetails: {
      name:          '',
      place:         '',
      address:       '',
      phoneNumber:   '',
      description:   '',
      logoUrl:       '',
      introVideoUrl: ''
    }
  }
  errors.value        = {}
  logoPreview.value   = null
  videoPreview.value  = null
  logoUploadError.value  = ''
  videoUploadError.value = ''
}
</script>

<style scoped>
.toggle-checkbox:checked { right: 0; border-color: #4f46e5; }
.toggle-checkbox:checked + .toggle-label { background-color: #4f46e5; }

.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-50 { z-index: 50; }
</style>