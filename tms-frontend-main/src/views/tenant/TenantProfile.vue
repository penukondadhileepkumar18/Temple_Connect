<!-- src/views/tenant/TenantProfile.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <BaseCard class="mb-6">
        <div class="flex items-center justify-between p-6">
          <div class="flex items-center gap-4">
            <div class="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-full">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 8h2V9h-2v8z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">Tenant Profile</h1>
              <p class="text-gray-600">Manage your tenant and temple information</p>
            </div>
          </div>
          
          <BaseButton
            v-if="!isEditing"
            @click="startEditing"
            variant="primary"
            size="lg"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Alert Messages -->
      <div v-if="error" class="mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold text-red-800">Error</h3>
            <p class="text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="mb-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-semibold text-green-800">Success</h3>
            <p class="text-green-600">{{ successMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <BaseCard v-if="loading" class="p-12 text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading profile...</p>
      </BaseCard>

      <!-- Profile Form -->
      <form v-else @submit.prevent="handleSubmit">
        <!-- User Information -->
        <BaseCard class="mb-6">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800">User Information</h2>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <BaseInput v-model="formData.full_name" type="text" :disabled="!isEditing" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <BaseInput v-model="formData.phone" type="tel" :disabled="!isEditing" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div class="relative">
                  <BaseInput :model-value="profile?.user?.email || ''" type="email" disabled />
                  <svg class="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p class="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <BaseInput :model-value="profile?.user?.role || ''" type="text" disabled />
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Temple Information -->
        <BaseCard class="mb-6">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 8h2V9h-2v8z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800">Temple Information</h2>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Temple Name</label>
                <BaseInput v-model="formData.temple_name" type="text" :disabled="!isEditing" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Temple Place</label>
                <BaseInput v-model="formData.temple_place" type="text" :disabled="!isEditing" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Temple Address</label>
                <textarea
                  v-model="formData.temple_address"
                  rows="3"
                  :disabled="!isEditing"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-600"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Temple Phone Number</label>
                <BaseInput v-model="formData.temple_phone_no" type="tel" :disabled="!isEditing" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Temple Description</label>
                <textarea
                  v-model="formData.temple_description"
                  rows="4"
                  :disabled="!isEditing"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:text-gray-600"
                ></textarea>
              </div>

              <!-- Temple Logo Upload -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Temple Logo</label>

                <div v-if="logoPreview || currentLogoUrl" class="mb-3">
                  <img
                    :src="logoPreview || currentLogoUrl"
                    alt="Temple Logo"
                    class="h-32 w-auto rounded-lg border shadow-sm"
                    @error="handleImageError"
                  />
                </div>

                <p v-else-if="!isEditing" class="text-gray-400 text-sm mb-3">No logo uploaded</p>

                <div v-if="isEditing" class="flex items-center gap-3">
                  <input ref="logoInput" type="file" accept="image/*" @change="handleLogoChange" class="hidden" />
                  <BaseButton type="button" @click="$refs.logoInput.click()" variant="secondary">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ logoFile ? 'Change Logo' : 'Upload Logo' }}
                  </BaseButton>
                  <BaseButton v-if="logoPreview || currentLogoUrl" type="button" @click="removeLogo" variant="secondary">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </BaseButton>
                  <span v-if="logoFile" class="text-sm text-gray-600">{{ logoFile.name }}</span>
                </div>
                <p class="mt-2 text-xs text-gray-500">Recommended: PNG or JPG, max 5MB</p>
              </div>

              <!-- Temple Video Upload -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Temple Introduction Video</label>

                <div v-if="videoPreview || currentVideoUrl" class="mb-3">
                  <video
                    :src="videoPreview || currentVideoUrl"
                    controls
                    class="w-full max-w-md rounded-lg border shadow-sm"
                    @error="handleVideoError"
                  ></video>
                </div>

                <p v-else-if="!isEditing" class="text-gray-400 text-sm mb-3">No video uploaded</p>

                <div v-if="isEditing" class="flex items-center gap-3">
                  <input ref="videoInput" type="file" accept="video/*" @change="handleVideoChange" class="hidden" />
                  <BaseButton type="button" @click="$refs.videoInput.click()" variant="secondary">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {{ videoFile ? 'Change Video' : 'Upload Video' }}
                  </BaseButton>
                  <BaseButton v-if="videoPreview || currentVideoUrl" type="button" @click="removeVideo" variant="secondary">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </BaseButton>
                  <span v-if="videoFile" class="text-sm text-gray-600">{{ videoFile.name }}</span>
                </div>
                <p class="mt-2 text-xs text-gray-500">Recommended: MP4 format, max 50MB</p>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Bank Account Details -->
        <BaseCard class="mb-6">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800">Bank Account Details</h2>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <BaseInput v-model="formData.account_holder_name" type="text" :disabled="!isEditing" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <BaseInput v-model="formData.account_number" type="text" :disabled="!isEditing" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <BaseInput v-model="formData.bank_name" type="text" :disabled="!isEditing" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <BaseInput v-model="formData.branch_name" type="text" :disabled="!isEditing" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <BaseInput v-model="formData.ifsc_code" type="text" :disabled="!isEditing" class="uppercase" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select
                  v-model="formData.account_type"
                  :disabled="!isEditing"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-600"
                >
                  <option value="">Select account type</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID <span class="text-gray-400 text-xs">(Optional)</span>
                </label>
                <BaseInput v-model="formData.upi_id" type="text" :disabled="!isEditing" placeholder="yourname@bank" />
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- ─── Razorpay Integration ──────────────────────────────────────────── -->
        <BaseCard class="mb-6">
          <div class="p-6">
            <!-- Section header -->
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-800">Razorpay Integration</h2>

              <!-- Badge: editable when empty, locked when already saved -->
              <span
                class="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="razorpayAlreadySet
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-blue-100 text-blue-600'"
              >
                <svg v-if="razorpayAlreadySet" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {{ razorpayAlreadySet ? 'Read only' : 'Editable' }}
              </span>
            </div>

            <!-- Context message -->
            <p class="text-sm text-gray-500 mb-6">
              <template v-if="razorpayAlreadySet">
                Razorpay credentials are already configured and cannot be changed here. Please contact your platform administrator to update them.
              </template>
              <template v-else>
                No Razorpay credentials have been added yet. You can enter your Key ID and Secret below while editing your profile.
              </template>
            </p>

            <!-- ── CASE 1: credentials already saved → display-only with copy/reveal ── -->
            <div v-if="razorpayAlreadySet" class="grid md:grid-cols-2 gap-6">

              <!-- Key ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Razorpay Key ID</label>
                <div class="flex items-center gap-2">
                  <div class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-800 truncate select-all">
                    {{ formData.razorpay_key_id }}
                  </div>
                  <button
                    type="button"
                    @click="copyToClipboard(formData.razorpay_key_id, 'key')"
                    class="flex-shrink-0 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy Key ID"
                  >
                    <svg v-if="copiedField !== 'key'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                <!-- Live / Test badge -->
                <p class="mt-1.5 text-xs">
                  <span
                    :class="formData.razorpay_key_id?.startsWith('rzp_live_')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full inline-block"
                      :class="formData.razorpay_key_id?.startsWith('rzp_live_') ? 'bg-green-500' : 'bg-yellow-500'"
                    ></span>
                    {{ formData.razorpay_key_id?.startsWith('rzp_live_') ? 'Live Mode' : 'Test Mode' }}
                  </span>
                </p>
              </div>

              <!-- Secret -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Razorpay Secret</label>
                <div class="flex items-center gap-2">
                  <div class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-800 truncate select-all">
                    {{ showSecret ? formData.razorpay_secret : maskedSecret }}
                  </div>
                  <!-- Toggle reveal -->
                  <button
                    type="button"
                    @click="showSecret = !showSecret"
                    class="flex-shrink-0 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                    :title="showSecret ? 'Hide secret' : 'Reveal secret'"
                  >
                    <svg v-if="!showSecret" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                  <!-- Copy -->
                  <button
                    type="button"
                    @click="copyToClipboard(formData.razorpay_secret, 'secret')"
                    class="flex-shrink-0 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy Secret"
                  >
                    <svg v-if="copiedField !== 'secret'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                <p class="mt-1.5 text-xs text-gray-400">Click the eye icon to reveal your secret key</p>
              </div>
            </div>

            <!-- ── CASE 2: no credentials yet → editable input fields ── -->
            <div v-else class="grid md:grid-cols-2 gap-6">

              <!-- Key ID input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Key ID
                  <span class="text-gray-400 text-xs ml-1">(Optional)</span>
                </label>
                <BaseInput
                  v-model="formData.razorpay_key_id"
                  type="text"
                  :disabled="!isEditing"
                  placeholder="rzp_live_xxxxxxxxxxxx"
                  class="font-mono"
                />
                <p class="mt-1 text-xs text-gray-400">
                  Starts with <code class="bg-gray-100 px-1 rounded">rzp_live_</code> for production or
                  <code class="bg-gray-100 px-1 rounded">rzp_test_</code> for testing.
                </p>
              </div>

              <!-- Secret input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Secret
                  <span class="text-gray-400 text-xs ml-1">(Optional)</span>
                </label>
                <div class="relative">
                  <BaseInput
                    v-model="formData.razorpay_secret"
                    :type="showNewSecret ? 'text' : 'password'"
                    :disabled="!isEditing"
                    placeholder="Enter your Razorpay secret"
                    class="font-mono pr-10"
                  />
                  <button
                    v-if="isEditing"
                    type="button"
                    @click="showNewSecret = !showNewSecret"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    :title="showNewSecret ? 'Hide secret' : 'Show secret'"
                  >
                    <svg v-if="!showNewSecret" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-400">
                  Once saved, this value will be masked and can only be changed by an administrator.
                </p>
              </div>

              <!-- Info notice when not editing -->
              <div v-if="!isEditing" class="md:col-span-2">
                <div class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Click <strong class="mx-1">Edit Profile</strong> to add your Razorpay credentials.
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Action Buttons -->
        <BaseCard v-if="isEditing">
          <div class="flex gap-4 justify-end p-6">
            <BaseButton
              type="button"
              @click="cancelEditing"
              :disabled="saving || uploading"
              variant="secondary"
              size="lg"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </BaseButton>
            
            <BaseButton
              type="submit"
              :disabled="saving || uploading"
              :loading="saving || uploading"
              variant="primary"
              size="lg"
            >
              <svg v-if="!saving && !uploading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes' }}
            </BaseButton>
          </div>
        </BaseCard>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'
import { useToast } from '@/composables/useToast'
import BaseCard   from '@/components/common/BaseCard.vue'
import BaseInput  from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const { success, error: showError } = useToast()

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL

const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return convertToHttps(path)
  return convertToHttps(`${BACKEND_URL}${path}`)
}

function convertToHttps(url) {
  const parsedUrl = new URL(url)
  parsedUrl.protocol = window.location.protocol
  return parsedUrl.href
}

// ─── State ────────────────────────────────────────────────────────────────────
const profile        = ref(null)
const isEditing      = ref(false)
const loading        = ref(true)
const saving         = ref(false)
const uploading      = ref(false)
const error          = ref('')
const successMessage = ref('')

// Razorpay UI state
const showSecret    = ref(false)   // for the reveal button when credentials already set
const showNewSecret = ref(false)   // for the password input when entering new credentials
const copiedField   = ref('')      // 'key' | 'secret' | ''

// File upload states
const logoFile     = ref(null)
const videoFile    = ref(null)
const logoPreview  = ref('')
const videoPreview = ref('')
const logoInput    = ref(null)
const videoInput   = ref(null)

const formData = ref({
  full_name: '',
  phone: '',
  temple_name: '',
  temple_place: '',
  temple_address: '',
  temple_phone_no: '',
  temple_description: '',
  logo_url: '',
  intro_video_url: '',
  // Bank details
  account_holder_name: '',
  account_number: '',
  bank_name: '',
  branch_name: '',
  ifsc_code: '',
  account_type: '',
  upi_id: '',
  // Razorpay — editable only when empty at registration
  razorpay_key_id: '',
  razorpay_secret: ''
})

// ── True when BOTH key and secret were already saved on the server ────────────
// This is the single flag that controls editable vs read-only Razorpay UI.
const razorpayAlreadySet = computed(() =>
  !!(profile.value?.bank?.razorpay_key_id && profile.value?.bank?.razorpay_secret)
)

const currentLogoUrl  = computed(() => getMediaUrl(formData.value.logo_url))
const currentVideoUrl = computed(() => getMediaUrl(formData.value.intro_video_url))

// Mask secret: show first 6 chars then bullets
const maskedSecret = computed(() => {
  const s = formData.value.razorpay_secret
  if (!s) return '—'
  return s.slice(0, 6) + '•'.repeat(Math.max(0, s.length - 6))
})

// ─── Copy to clipboard ────────────────────────────────────────────────────────
const copyToClipboard = async (text, field) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copiedField.value = field
    setTimeout(() => { copiedField.value = '' }, 2000)
  } catch {
    showError('Failed to copy to clipboard')
  }
}

// ─── Image / Video error handlers ────────────────────────────────────────────
const handleImageError = (event) => {
  console.error('❌ Error loading logo:', event.target.src)
  showError('Failed to load temple logo')
}

const handleVideoError = (event) => {
  console.error('❌ Error loading video:', event.target.src)
  showError('Failed to load temple video')
}

// ─── File upload helpers ──────────────────────────────────────────────────────
const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { showError('Please select a valid image file'); return }
  if (file.size > 5 * 1024 * 1024)    { showError('Logo file size must be less than 5MB'); return }
  logoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { logoPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

const handleVideoChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('video/')) { showError('Please select a valid video file'); return }
  if (file.size > 50 * 1024 * 1024)   { showError('Video file size must be less than 50MB'); return }
  videoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { videoPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  logoFile.value  = null
  logoPreview.value = ''
  formData.value.logo_url = ''
  if (logoInput.value) logoInput.value.value = ''
}

const removeVideo = () => {
  videoFile.value  = null
  videoPreview.value = ''
  formData.value.intro_video_url = ''
  if (videoInput.value) videoInput.value.value = ''
}

const uploadFile = async (file, type) => {
  const uploadFormData = new FormData()
  uploadFormData.append('file', file)
  uploadFormData.append('type', type)
  try {
    const response = await api.post('/tenant/upload', uploadFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.url
  } catch (err) {
    console.error(`❌ Error uploading ${type}:`, err)
    throw err
  }
}

// ─── Fetch profile ────────────────────────────────────────────────────────────
const fetchProfile = async () => {
  try {
    loading.value = true
    error.value   = ''
    const response    = await api.get('/auth/account/details')
    const accountData = response.data.data
    profile.value = accountData

    formData.value = {
      full_name:           accountData.user?.full_name || '',
      phone:               accountData.user?.phone     || '',
      temple_name:         accountData.temple?.temple_name        || '',
      temple_place:        accountData.temple?.temple_place       || '',
      temple_address:      accountData.temple?.temple_address     || '',
      temple_phone_no:     accountData.temple?.temple_phone_no    || '',
      temple_description:  accountData.temple?.temple_description || '',
      logo_url:            accountData.temple?.logo_url           || '',
      intro_video_url:     accountData.temple?.intro_video_url    || '',
      // Bank
      account_holder_name: accountData.bank?.account_holder_name || '',
      account_number:      accountData.bank?.account_number       || '',
      bank_name:           accountData.bank?.bank_name            || '',
      branch_name:         accountData.bank?.branch_name          || '',
      ifsc_code:           accountData.bank?.ifsc_code            || '',
      account_type:        accountData.bank?.account_type         || '',
      upi_id:              accountData.bank?.upi_id               || '',
      // Razorpay
      razorpay_key_id:     accountData.bank?.razorpay_key_id      || '',
      razorpay_secret:     accountData.bank?.razorpay_secret      || ''
    }
  } catch (err) {
    console.error('❌ Error fetching profile:', err)
    const msg = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to fetch profile'
    error.value = msg
    showError(msg)
  } finally {
    loading.value = false
  }
}

// ─── Submit ───────────────────────────────────────────────────────────────────
const handleSubmit = async () => {
  saving.value = true
  error.value  = ''
  successMessage.value = ''

  try {
    if (logoFile.value || videoFile.value) uploading.value = true

    if (logoFile.value) {
      formData.value.logo_url = await uploadFile(logoFile.value, 'logo')
    }
    if (videoFile.value) {
      formData.value.intro_video_url = await uploadFile(videoFile.value, 'video')
    }

    uploading.value = false

    // Build payload — strip Razorpay fields when they were already set (read-only)
    let payload
    if (razorpayAlreadySet.value) {
      // eslint-disable-next-line no-unused-vars
      const { razorpay_key_id, razorpay_secret, ...rest } = formData.value
      payload = rest
    } else {
      // Include Razorpay fields only when the user is adding them for the first time
      payload = { ...formData.value }
    }

    const response = await api.put('/auth/account/details', payload)

    // Refresh local profile so razorpayAlreadySet re-evaluates correctly
    profile.value = response.data.data

    successMessage.value = response.data.message || 'Account details updated successfully!'
    success(successMessage.value)
    isEditing.value = false

    logoFile.value  = null
    videoFile.value = null
    logoPreview.value  = ''
    videoPreview.value = ''
    showNewSecret.value = false

    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err) {
    console.error('❌ Error updating account details:', err)
    const msg = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to update account details'
    error.value = msg
    showError(msg)
  } finally {
    saving.value    = false
    uploading.value = false
  }
}

// ─── Edit controls ────────────────────────────────────────────────────────────
const startEditing = () => {
  isEditing.value = true
  error.value     = ''
  successMessage.value = ''
}

const cancelEditing = () => {
  isEditing.value = false
  error.value     = ''
  successMessage.value = ''

  logoFile.value  = null
  videoFile.value = null
  logoPreview.value  = ''
  videoPreview.value = ''
  showNewSecret.value = false

  // Restore form to last fetched profile
  if (profile.value) {
    formData.value = {
      full_name:           profile.value.user?.full_name || '',
      phone:               profile.value.user?.phone     || '',
      temple_name:         profile.value.temple?.temple_name        || '',
      temple_place:        profile.value.temple?.temple_place       || '',
      temple_address:      profile.value.temple?.temple_address     || '',
      temple_phone_no:     profile.value.temple?.temple_phone_no    || '',
      temple_description:  profile.value.temple?.temple_description || '',
      logo_url:            profile.value.temple?.logo_url           || '',
      intro_video_url:     profile.value.temple?.intro_video_url    || '',
      account_holder_name: profile.value.bank?.account_holder_name || '',
      account_number:      profile.value.bank?.account_number       || '',
      bank_name:           profile.value.bank?.bank_name            || '',
      branch_name:         profile.value.bank?.branch_name          || '',
      ifsc_code:           profile.value.bank?.ifsc_code            || '',
      account_type:        profile.value.bank?.account_type         || '',
      upi_id:              profile.value.bank?.upi_id               || '',
      razorpay_key_id:     profile.value.bank?.razorpay_key_id      || '',
      razorpay_secret:     profile.value.bank?.razorpay_secret      || ''
    }
  }
}

onMounted(() => { fetchProfile() })
</script>