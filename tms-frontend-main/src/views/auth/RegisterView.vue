<!-- src/components/auth/RegisterForm.vue -->
<template>
  <BaseCard class="w-full max-w-md mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
      <p class="text-gray-600">Join our temple management platform</p>
    </div>

    <!-- Registration Success Alert (Non-modal version) -->
    <div v-if="registrationSuccess" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Registration Successful!</h3>
          <div class="mt-1 text-sm text-green-700">
            <p v-if="needsApproval">
              Your temple admin account has been created. You'll receive an email once your account is approved by our team.
            </p>
            <p v-else>
              Your account has been created successfully. You can now login to access your dashboard.
            </p>
          </div>
          <div class="mt-3">
            <BaseButton @click="goToLogin" variant="success" size="sm">
              Go to Login
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Error Banner -->
    <div
      v-if="globalError && !registrationSuccess"
      class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
      role="alert"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">Registration Failed</h3>
          <p class="mt-1 text-sm text-red-700">{{ globalError }}</p>
        </div>
        <button
          type="button"
          class="ml-3 flex-shrink-0 text-red-400 hover:text-red-600"
          @click="globalError = ''"
          aria-label="Dismiss error"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <form v-if="!registrationSuccess" @submit.prevent="handleRegister" class="space-y-6">
      <!-- Full Name Field -->
      <div>
        <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="fullName"
          v-model="form.fullName"
          type="text"
          placeholder="Enter your full name"
          :error="errors.fullName"
          required
          autocomplete="name"
          @input="clearError('fullName')"
        />
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          :error="errors.email"
          required
          autocomplete="email"
          @input="clearError('email'); globalError = ''"
        />
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Password <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Create a strong password"
          :error="errors.password"
          required
          autocomplete="new-password"
          @input="clearError('password')"
        />
        <PasswordStrengthMeter 
          :password="form.password" 
          class="mt-2"
        />
      </div>

      <!-- Phone Field (Required) -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="phone"
          v-model="form.phone"
          type="tel"
          placeholder="Enter your phone number"
          :error="errors.phone"
          required
          autocomplete="tel"
          @input="clearError('phone'); globalError = ''"
        />
      </div>

      <!-- Role Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          I want to join as <span class="text-red-500">*</span>
        </label>
        
        <!-- Role Selection Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="role in roleOptions"
            :key="role.value"
            :class="[
              'relative border-2 rounded-lg cursor-pointer transition-all duration-200 p-4',
              form.role === role.value 
                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            ]"
            @click="selectRole(role.value)"
          >
            <div class="flex flex-col items-center text-center">
              <!-- Icon -->
              <div :class="[
                'w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-colors duration-200',
                form.role === role.value ? 'bg-indigo-100' : 'bg-gray-200'
              ]">
                <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="role.value === 'tenant'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 8h2V9h-2v8z" />
                  <path v-else-if="role.value === 'devotee'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <path v-else-if="role.value === 'volunteer'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <!-- Role Name -->
              <h3 class="font-medium text-gray-900">{{ role.label }}</h3>
            </div>
            
            <!-- Selection Indicator -->
            <div v-if="form.role === role.value" 
                class="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Role Error -->
        <div v-if="errors.role" class="mt-2 text-sm text-red-600">
          {{ errors.role }}
        </div>
      </div>
      
      <!-- Temple Details Form (shown when Temple Admin is selected) -->
      <div v-if="form.role === 'tenant'" class="mt-6 space-y-6">
        <!-- Temple Details Section -->
        <div class="overflow-hidden bg-white rounded-lg border border-gray-200">
          <div class="px-6 py-4 bg-indigo-600">
            <div class="flex items-center">
              <h3 class="text-lg font-medium leading-6 text-white">Temple Details</h3>
            </div>
            <p class="mt-1 text-sm text-indigo-100">
              Please provide the following details about your temple
            </p>
          </div>
          
          <div class="px-6 py-5 space-y-6">
            <!-- Temple Name -->
            <div>
              <label for="templeName" class="block text-sm font-medium text-gray-700 mb-1">
                Temple Name <span class="text-red-500">*</span>
              </label>
              <input
                id="templeName"
                v-model="templeDetails.name"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter temple name"
                required
                @input="clearError('templeName')"
              />
              <div v-if="errors.templeName" class="mt-1 text-xs text-red-600">
                {{ errors.templeName }}
              </div>
            </div>
            
            <!-- Temple Place -->
            <div>
              <label for="templePlace" class="block text-sm font-medium text-gray-700 mb-1">
                Temple Place <span class="text-red-500">*</span>
              </label>
              <input
                id="templePlace"
                v-model="templeDetails.place"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter temple location"
                required
                @input="clearError('templePlace')"
              />
              <div v-if="errors.templePlace" class="mt-1 text-xs text-red-600">
                {{ errors.templePlace }}
              </div>
            </div>
            
            <!-- Temple Address -->
            <div>
              <label for="templeAddress" class="block text-sm font-medium text-gray-700 mb-1">
                Temple Address <span class="text-red-500">*</span>
              </label>
              <textarea
                id="templeAddress"
                v-model="templeDetails.address"
                rows="3"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter complete temple address"
                required
                @input="clearError('templeAddress')"
              ></textarea>
              <div v-if="errors.templeAddress" class="mt-1 text-xs text-red-600">
                {{ errors.templeAddress }}
              </div>
            </div>
            
            <!-- Temple Phone -->
            <div>
              <label for="templePhone" class="block text-sm font-medium text-gray-700 mb-1">
                Temple Phone Number <span class="text-red-500">*</span>
              </label>
              <input
                id="templePhone"
                v-model="templeDetails.phoneNumber"
                type="tel"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter temple contact number"
                required
                @input="clearError('templePhoneNo')"
              />
              <div v-if="errors.templePhoneNo" class="mt-1 text-xs text-red-600">
                {{ errors.templePhoneNo }}
              </div>
            </div>
            
            <!-- Temple Description -->
            <div>
              <label for="templeDescription" class="block text-sm font-medium text-gray-700 mb-1">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                id="templeDescription"
                v-model="templeDetails.description"
                rows="4"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Provide additional details about your temple (history, services, etc.)"
                required
                @input="clearError('templeDescription')"
              ></textarea>
              <div v-if="errors.templeDescription" class="mt-1 text-xs text-red-600">
                {{ errors.templeDescription }}
              </div>
            </div>

            <!-- Temple Logo Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Temple Logo <span class="text-red-500">*</span>
              </label>
              
              <div class="mt-1 flex items-center space-x-4">
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  @change="onLogoChange"
                  class="hidden"
                />
                
                <button
                  type="button"
                  @click="$refs.logoInput.click()"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Choose Logo
                </button>
                
                <span v-if="logoFile" class="text-sm text-gray-600">
                  {{ logoFile.name }}
                </span>
                <span v-else class="text-sm text-gray-400">
                  No file chosen
                </span>
              </div>
              
              <div v-if="logoPreview" class="mt-3">
                <img 
                  :src="logoPreview" 
                  alt="Logo Preview" 
                  class="h-24 w-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  @click="removeLogo"
                  class="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              
              <p class="mt-1 text-xs text-gray-500">
                PNG, JPG, JPEG (max 500kb, recommended: 500x500px)
              </p>
              <div v-if="errors.logo" class="mt-1 text-xs text-red-600">
                {{ errors.logo }}
              </div>
            </div>

            <!-- Temple Intro Video Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Temple Intro Video <span class="text-red-500">*</span>
              </label>
              
              <div class="mt-1 flex items-center space-x-4">
                <input
                  ref="videoInput"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  @change="onVideoChange"
                  class="hidden"
                />
                
                <button
                  type="button"
                  @click="$refs.videoInput.click()"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Choose Video
                </button>
                
                <span v-if="videoFile" class="text-sm text-gray-600">
                  {{ videoFile.name }}
                </span>
                <span v-else class="text-sm text-gray-400">
                  No file chosen
                </span>
              </div>
              
              <div v-if="videoPreview" class="mt-3">
                <video 
                  :src="videoPreview" 
                  controls 
                  class="w-full max-w-md rounded-lg border-2 border-gray-200"
                  style="max-height: 200px;"
                >
                  Your browser does not support the video tag.
                </video>
                <button
                  type="button"
                  @click="removeVideo"
                  class="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              
              <p class="mt-1 text-xs text-gray-500">
                MP4, WebM, MOV (max 5MB, recommended: under 2 minutes)
              </p>
              <div v-if="errors.video" class="mt-1 text-xs text-red-600">
                {{ errors.video }}
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Account Details Section -->
        <div class="overflow-hidden bg-white rounded-lg border border-gray-200">
          <div class="px-6 py-4 bg-emerald-600">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 class="text-lg font-medium leading-6 text-white">Bank Account Details</h3>
            </div>
            <p class="mt-1 text-sm text-emerald-100">
              Required for receiving donations and payments
            </p>
          </div>
          
          <div class="px-6 py-5 space-y-6">
            <!-- Account Holder Name -->
            <div>
              <label for="accountHolderName" class="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name <span class="text-red-500">*</span>
              </label>
              <input
                id="accountHolderName"
                v-model="bankDetails.accountHolderName"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Enter account holder name"
                required
                @input="clearError('accountHolderName')"
              />
              <div v-if="errors.accountHolderName" class="mt-1 text-xs text-red-600">
                {{ errors.accountHolderName }}
              </div>
            </div>

            <!-- Account Number -->
            <div>
              <label for="accountNumber" class="block text-sm font-medium text-gray-700 mb-1">
                Account Number <span class="text-red-500">*</span>
              </label>
              <input
                id="accountNumber"
                v-model="bankDetails.accountNumber"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Enter account number"
                required
                @input="clearError('accountNumber'); globalError = ''"
              />
              <div v-if="errors.accountNumber" class="mt-1 text-xs text-red-600">
                {{ errors.accountNumber }}
              </div>
            </div>

            <!-- Bank Name -->
            <div>
              <label for="bankName" class="block text-sm font-medium text-gray-700 mb-1">
                Bank Name <span class="text-red-500">*</span>
              </label>
              <input
                id="bankName"
                v-model="bankDetails.bankName"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Enter bank name"
                required
                @input="clearError('bankName')"
              />
              <div v-if="errors.bankName" class="mt-1 text-xs text-red-600">
                {{ errors.bankName }}
              </div>
            </div>

            <!-- Branch Name -->
            <div>
              <label for="branchName" class="block text-sm font-medium text-gray-700 mb-1">
                Branch Name <span class="text-red-500">*</span>
              </label>
              <input
                id="branchName"
                v-model="bankDetails.branchName"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Enter branch name"
                required
                @input="clearError('branchName')"
              />
              <div v-if="errors.branchName" class="mt-1 text-xs text-red-600">
                {{ errors.branchName }}
              </div>
            </div>

            <!-- IFSC Code -->
            <div>
              <label for="ifscCode" class="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code <span class="text-red-500">*</span>
              </label>
              <input
                id="ifscCode"
                v-model="bankDetails.ifscCode"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm uppercase"
                placeholder="Enter IFSC code"
                maxlength="11"
                required
                @input="clearError('ifscCode'); globalError = ''; bankDetails.ifscCode = bankDetails.ifscCode.toUpperCase()"
              />
              <p class="mt-1 text-xs text-gray-500">11-character code (e.g., SBIN0001234)</p>
              <div v-if="errors.ifscCode" class="mt-1 text-xs text-red-600">
                {{ errors.ifscCode }}
              </div>
            </div>

            <!-- Account Type -->
            <div>
              <label for="accountType" class="block text-sm font-medium text-gray-700 mb-1">
                Account Type <span class="text-red-500">*</span>
              </label>
              <select
                id="accountType"
                v-model="bankDetails.accountType"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                required
                @change="clearError('accountType')"
              >
                <option value="">Select account type</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
              </select>
              <div v-if="errors.accountType" class="mt-1 text-xs text-red-600">
                {{ errors.accountType }}
              </div>
            </div>

            <!-- UPI ID (Optional) no use of upi id as we are using razorpay -->
             <!--
            <div>
              <label for="upiId" class="block text-sm font-medium text-gray-700 mb-1">
                UPI ID <span class="text-gray-400">(Optional)</span>
              </label>
              <input
                id="upiId"
                v-model="bankDetails.upiId"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="yourname@bank"
                @input="clearError('upiId')"
              />
              <p class="mt-1 text-xs text-gray-500">Format: username@bank (e.g., templename@paytm)</p>
              <div v-if="errors.upiId" class="mt-1 text-xs text-red-600">
                {{ errors.upiId }}
              </div>
            </div>
             -->

            <!-- Razorpay Divider -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-3 bg-white text-sm text-gray-500 flex items-center gap-1">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Razorpay Payment Gateway
                </span>
              </div>
            </div>

            <!-- Razorpay Info Banner -->
            <div class="rounded-md bg-blue-50 border border-blue-200 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3 text-sm text-blue-700">
                  <p class="font-medium mb-1">How to get your Razorpay credentials</p>
                  <ol class="list-decimal list-inside space-y-1 text-blue-600">
                    <li>Login to your <span class="font-medium">Razorpay Dashboard</span></li>
                    <li>Go to <span class="font-medium">Settings → API Keys</span></li>
                    <li>Generate or copy your <span class="font-medium">Key ID</span> and <span class="font-medium">Key Secret</span></li>
                  </ol>
                </div>
              </div>
            </div>

            <!-- Razorpay Key ID -->
            <div>
              <label for="razorpayKeyId" class="block text-sm font-medium text-gray-700 mb-1">
                Razorpay Key ID <span class="text-red-500">*</span>
              </label>
              <input
                id="razorpayKeyId"
                v-model="bankDetails.razorpayKeyId"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-mono"
                placeholder="rzp_live_XXXXXXXXXXXXXXXXXX"
                required
                autocomplete="off"
                @input="clearError('razorpayKeyId'); globalError = ''"
              />
              <p class="mt-1 text-xs text-gray-500">Starts with <code class="bg-gray-100 px-1 rounded">rzp_live_</code> or <code class="bg-gray-100 px-1 rounded">rzp_test_</code></p>
              <div v-if="errors.razorpayKeyId" class="mt-1 text-xs text-red-600">
                {{ errors.razorpayKeyId }}
              </div>
            </div>

            <!-- Razorpay Key Secret -->
            <div>
              <label for="razorpaySecret" class="block text-sm font-medium text-gray-700 mb-1">
                Razorpay Key Secret <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="razorpaySecret"
                  v-model="bankDetails.razorpaySecret"
                  :type="showRazorpaySecret ? 'text' : 'password'"
                  class="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm font-mono"
                  placeholder="Enter your Razorpay Key Secret"
                  required
                  autocomplete="off"
                  @input="clearError('razorpaySecret'); globalError = ''"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  @click="showRazorpaySecret = !showRazorpaySecret"
                >
                  <!-- Eye Open -->
                  <svg v-if="!showRazorpaySecret" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <!-- Eye Closed -->
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">Keep this secret — never share it publicly</p>
              <div v-if="errors.razorpaySecret" class="mt-1 text-xs text-red-600">
                {{ errors.razorpaySecret }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Privacy -->
      <div class="flex items-start mt-6">
        <input
          id="terms"
          v-model="form.acceptTerms"
          type="checkbox"
          required
          class="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
          @change="clearError('acceptTerms')"
        />
        <label for="terms" class="ml-3 text-sm text-gray-700">
          I agree to the 
          <router-link to="/terms" class="text-indigo-600 hover:text-indigo-800 font-medium">
            Terms of Service
          </router-link>
          and 
          <router-link to="/privacy" class="text-indigo-600 hover:text-indigo-800 font-medium">
            Privacy Policy
          </router-link>
          <span class="text-red-500">*</span>
        </label>
      </div>
      <div v-if="errors.acceptTerms" class="text-red-600 text-sm -mt-4">
        {{ errors.acceptTerms }}
      </div>

      <!-- CAPTCHA Container -->
      <div id="turnstile"></div>      

      <!-- Submit Button -->
      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="isLoading"
        :disabled="!isFormValid || !isCaptchaVerified"
        class="w-full mt-6"
      >
        <template v-if="!isCaptchaVerified">
          Complete CAPTCHA to Register
        </template>
        <template v-else>
          Create Account
        </template>
      </BaseButton>

      <!-- Login Link -->
      <div class="text-center pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Already have an account?
          <router-link 
            to="/login" 
            class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
          >
            Sign In
          </router-link>
        </p>
      </div>
    </form>

    <!-- Registration Success Modal -->
    <BaseModal v-if="showSuccessModal" @close="goToLogin">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Registration Successful!</h3>
      </template>
      <template #default>
        <div class="py-4">
          <p v-if="needsApproval" class="text-gray-600">
            Your temple admin account has been created. You'll receive an email once your account is approved by our team.
          </p>
          <p v-else class="text-gray-600">
            Your account has been created successfully. You can now login to access your dashboard.
          </p>
        </div>
      </template>
      <template #footer>
        <BaseButton @click="goToLogin" variant="primary" class="w-full">
          Go to Login
        </BaseButton>
      </template>
    </BaseModal>
  </BaseCard>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/plugins/axios'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: showError } = useToast()

// State
const logoFile = ref(null)
const videoFile = ref(null)
const logoPreview = ref(null)
const videoPreview = ref(null)
const isLoading = ref(false)
const showSuccessModal = ref(false)
const needsApproval = ref(false)
const registrationSuccess = ref(false)
const errors = ref({})
const globalError = ref('')
const captchaToken = ref('')
const isCaptchaVerified = ref(false)
const widgetId = ref(null)
const siteKey = import.meta.env.VITE_CLOUDFLARE_CAPTCHA_KEY || ''

// Toggle visibility for Razorpay secret
const showRazorpaySecret = ref(false)

// Fixed role options
const roleOptions = [
  { value: 'tenant', label: 'Temple Admin' },
  { value: 'devotee', label: 'Devotee' },
  { value: 'volunteer', label: 'Volunteer' }
]

// Form data
const form = ref({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: '',
  acceptTerms: false,
  templeDetails: null
})

// Temple details
const templeDetails = ref({
  name: '',
  place: '',
  address: '',
  phoneNumber: '',
  description: ''
})

// Bank account details
const bankDetails = ref({
  accountHolderName: '',
  accountNumber: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  accountType: '',
  upiId: '',
  razorpayKeyId: '',
  razorpaySecret: ''
})

// Watch for role changes to clear temple-related errors
watch(() => form.value.role, (newRole, oldRole) => {
  if (oldRole === 'tenant' && newRole !== 'tenant') {
    const templeErrorKeys = ['templeName', 'templePlace', 'templeAddress', 'templePhoneNo', 'templeDescription', 'logo', 'video']
    const bankErrorKeys = ['accountHolderName', 'accountNumber', 'bankName', 'branchName', 'ifscCode', 'accountType', 'upiId', 'razorpayKeyId', 'razorpaySecret']
    const allKeys = [...templeErrorKeys, ...bankErrorKeys]
    
    allKeys.forEach(key => {
      delete errors.value[key]
    })
    
    logoFile.value = null
    videoFile.value = null
    logoPreview.value = null
    videoPreview.value = null
    
    bankDetails.value = {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      branchName: '',
      ifscCode: '',
      accountType: '',
      upiId: '',
      razorpayKeyId: '',
      razorpaySecret: ''
    }
  }
})

// Computed
const isFormValid = computed(() => {
  const hasBasicFields = form.value.fullName && 
                        form.value.email && 
                        form.value.password && 
                        form.value.phone && 
                        form.value.role &&
                        form.value.acceptTerms
                        
  const hasTempleDetails = form.value.role !== 'tenant' || 
                          (templeDetails.value.name && 
                           templeDetails.value.place && 
                           templeDetails.value.address && 
                           templeDetails.value.phoneNumber &&
                           templeDetails.value.description &&
                           logoFile.value &&
                           videoFile.value)
  
  const hasBankDetails = form.value.role !== 'tenant' ||
                        (bankDetails.value.accountHolderName &&
                         bankDetails.value.accountNumber &&
                         bankDetails.value.bankName &&
                         bankDetails.value.branchName &&
                         bankDetails.value.ifscCode &&
                         bankDetails.value.accountType &&
                         bankDetails.value.razorpayKeyId &&
                         bankDetails.value.razorpaySecret)
                           
  return hasBasicFields && hasTempleDetails && hasBankDetails && Object.keys(errors.value).length === 0
})

// Methods
const onLogoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    errors.value.logo = 'Please upload a PNG, JPG, or JPEG file'
    showError('Please upload a PNG, JPG, or JPEG file')
    return
  }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    errors.value.logo = 'Logo file size must be less than 2MB'
    showError('Logo file size must be less than 2MB')
    return
  }

  logoFile.value = file
  clearError('logo')
  
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const onVideoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  if (!validTypes.includes(file.type)) {
    errors.value.video = 'Please upload an MP4, WebM, or MOV file'
    showError('Please upload an MP4, WebM, or MOV file')
    return
  }

  const maxSize = 20 * 1024 * 1024
  if (file.size > maxSize) {
    errors.value.video = 'Video file size must be less than 20MB'
    showError('Video file size must be less than 20MB')
    return
  }

  videoFile.value = file
  clearError('video')
  
  const reader = new FileReader()
  reader.onload = (e) => {
    videoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = null
  clearError('logo')
}

const removeVideo = () => {
  videoFile.value = null
  videoPreview.value = null
  clearError('video')
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
    errors.value = { ...errors.value }
  }
}

const selectRole = (role) => {
  console.log('Role selected:', role)
  form.value.role = role
  clearError('role')
  
  if (role !== 'tenant') {
    const templeErrorKeys = ['templeName', 'templePlace', 'templeAddress', 'templePhoneNo', 'templeDescription', 'logo', 'video']
    const bankErrorKeys = ['accountHolderName', 'accountNumber', 'bankName', 'branchName', 'ifscCode', 'accountType', 'upiId', 'razorpayKeyId', 'razorpaySecret']
    const allKeys = [...templeErrorKeys, ...bankErrorKeys]
    
    allKeys.forEach(key => delete errors.value[key])
    errors.value = { ...errors.value }
  }
}

const validateForm = () => {
  const newErrors = {}

  const namePattern = /^[A-Za-z\s]+$/
  if (!form.value.fullName.trim()) {
    newErrors.fullName = 'Full name is required'
  } else if (form.value.fullName.trim().length < 2) {
    newErrors.fullName = 'Full name must be at least 2 characters'
  } else if (!namePattern.test(form.value.fullName.trim())) {
    newErrors.fullName = 'Full name cannot contain numbers or special characters'
  }

  if (!form.value.email) {
    newErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    newErrors.email = 'Please enter a valid email address'
  } else if (!form.value.email.endsWith('@gmail.com')) {
    newErrors.email = 'Only @gmail.com email addresses are allowed'
  }

  if (!form.value.password) {
    newErrors.password = 'Password is required'
  } else if (form.value.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters'
  }

  if (!form.value.phone) {
    newErrors.phone = 'Phone number is required'
  } else if (!/^[\\+]?[1-9][\d]{0,15}$/.test(form.value.phone.replace(/\s/g, ''))) {
    newErrors.phone = 'Please enter a valid phone number'
  }

  if (!form.value.role) {
    newErrors.role = 'Please select your role'
  }

  if (form.value.role === 'tenant') {
    // Temple details validation
    if (!templeDetails.value.name) {
      newErrors.templeName = 'Temple name is required'
    }
    if (!templeDetails.value.place) {
      newErrors.templePlace = 'Temple place is required'
    }
    if (!templeDetails.value.address) {
      newErrors.templeAddress = 'Temple address is required'
    }
    if (!templeDetails.value.phoneNumber) {
      newErrors.templePhoneNo = 'Temple phone number is required'
    }
    if (!templeDetails.value.description) {
      newErrors.templeDescription = 'Temple description is required'
    }
    if (!logoFile.value) {
      newErrors.logo = 'Temple logo is required'
    }
    if (!videoFile.value) {
      newErrors.video = 'Temple intro video is required'
    }
    
    // Bank details validation
    if (!bankDetails.value.accountHolderName) {
      newErrors.accountHolderName = 'Account holder name is required'
    }
    if (!bankDetails.value.accountNumber) {
      newErrors.accountNumber = 'Account number is required'
    } else if (!/^\d{9,18}$/.test(bankDetails.value.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 9-18 digits'
    }
    if (!bankDetails.value.bankName) {
      newErrors.bankName = 'Bank name is required'
    }
    if (!bankDetails.value.branchName) {
      newErrors.branchName = 'Branch name is required'
    }
    if (!bankDetails.value.ifscCode) {
      newErrors.ifscCode = 'IFSC code is required'
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.value.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format'
    }
    if (!bankDetails.value.accountType) {
      newErrors.accountType = 'Account type is required'
    }
    
    // UPI validation (optional but if provided, validate format)
    if (bankDetails.value.upiId && !/^[\w.-]+@[\w]+$/.test(bankDetails.value.upiId)) {
      newErrors.upiId = 'Invalid UPI ID format'
    }

    // Razorpay Key ID validation
    if (!bankDetails.value.razorpayKeyId) {
      newErrors.razorpayKeyId = 'Razorpay Key ID is required'
    } else if (!/^rzp_(live|test)_[A-Za-z0-9]+$/.test(bankDetails.value.razorpayKeyId)) {
      newErrors.razorpayKeyId = 'Invalid Razorpay Key ID format (e.g. rzp_live_XXXX or rzp_test_XXXX)'
    }

    // Razorpay Secret validation
    if (!bankDetails.value.razorpaySecret) {
      newErrors.razorpaySecret = 'Razorpay Key Secret is required'
    } else if (bankDetails.value.razorpaySecret.length < 20) {
      newErrors.razorpaySecret = 'Razorpay Key Secret appears to be too short'
    }
    
    if (templeDetails.value.name && 
        templeDetails.value.place && 
        templeDetails.value.address && 
        templeDetails.value.phoneNumber &&
        templeDetails.value.description) {
      form.value.templeDetails = { ...templeDetails.value }
    }
  }

  if (!form.value.acceptTerms) {
    newErrors.acceptTerms = 'You must accept the terms and privacy policy'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const resetCaptcha = () => {
  if (import.meta.env.VITE_ENABLE_TURNSTILE === "false") {
    console.log("⚠️ CAPTCHA is disabled via VITE_ENABLE_TURNSTILE=false")
    isCaptchaVerified.value = true
    return
  }
  
  isCaptchaVerified.value = false
  captchaToken.value = ''
  if (window.turnstile && widgetId.value !== null) {
    window.turnstile.reset(widgetId.value)
  }
}

// Maps a raw backend error string to the specific form field(s) it relates to.
// This lets us surface precise, field-level feedback (including Razorpay-specific
// errors) instead of only a generic banner, without requiring the backend to
// change its response shape.
const mapBackendErrorToField = (message) => {
  if (!message) return null
  const msg = message.toLowerCase()

  // Razorpay-specific errors
  if (msg.includes('razorpay key id and secret are required')) {
    return {
      fields: ['razorpayKeyId', 'razorpaySecret'],
      message: 'Razorpay Key ID and Secret are both required.'
    }
  }
  if (msg.includes('razorpay key id is already registered') || msg.includes('razorpay') && msg.includes('already registered')) {
    return {
      fields: ['razorpayKeyId'],
      message: 'This Razorpay Key ID is already registered with another account.'
    }
  }
  if (msg.includes('invalid razorpay key id or secret') || (msg.includes('razorpay') && msg.includes('credentials'))) {
    return {
      fields: ['razorpayKeyId', 'razorpaySecret'],
      message: 'Invalid Razorpay Key ID or Secret. Please double-check your Razorpay Dashboard credentials.'
    }
  }
  if (msg.includes('razorpay verification failed') || (msg.includes('razorpay') && msg.includes('unable to verify'))) {
    return {
      fields: ['razorpayKeyId', 'razorpaySecret'],
      message: 'We could not verify your Razorpay credentials right now. Please check them and try again.'
    }
  }
  if (msg.includes('razorpay')) {
    // Catch-all for any other Razorpay-related backend error
    return {
      fields: ['razorpayKeyId', 'razorpaySecret'],
      message: message
    }
  }

  // Email
  if (msg.includes('gmail')) {
    return { fields: ['email'], message: 'Only @gmail.com email addresses are allowed.' }
  }
  if (msg.includes('email') && (msg.includes('already') || msg.includes('exists') || msg.includes('registered') || msg.includes('duplicate'))) {
    return {
      fields: ['email'],
      message: 'This email is already registered. Please use a different email or try logging in.'
    }
  }

  // Role
  if (msg.includes('invalid role')) {
    return { fields: ['role'], message: 'Please select a valid role.' }
  }

  // Phone
  if (msg.includes('phone number format') || msg.includes('invalid phone')) {
    return { fields: ['phone'], message: 'Please enter a valid 10-digit phone number.' }
  }

  // Bank fields
  if (msg.includes('ifsc')) {
    return { fields: ['ifscCode'], message: 'Invalid IFSC code. Please check and re-enter it.' }
  }
  if (msg.includes('account number')) {
    return { fields: ['accountNumber'], message: 'Invalid account number.' }
  }
  if (msg.includes('bank account details') || msg.includes('bank details')) {
    return {
      fields: ['accountHolderName', 'accountNumber', 'bankName', 'branchName', 'ifscCode', 'accountType'],
      message: 'Please review your bank account details — all fields are required.'
    }
  }

  // Temple fields
  if (msg.includes('temple details') || (msg.includes('temple') && msg.includes('required'))) {
    return {
      fields: ['templeName', 'templePlace', 'templeAddress', 'templePhoneNo', 'templeDescription'],
      message: 'Please complete all temple details.'
    }
  }
  if (msg.includes('logo')) {
    return { fields: ['logo'], message: 'Temple logo is required.' }
  }
  if (msg.includes('video')) {
    return { fields: ['video'], message: 'Temple intro video is required.' }
  }

  // CAPTCHA
  if (msg.includes('captcha')) {
    return { fields: [], message: 'CAPTCHA verification failed. Please complete it again.' }
  }

  return null
}

const handleRegister = async () => {
  globalError.value = ''
  
  if (!isCaptchaVerified.value) {
    globalError.value = 'Please complete the CAPTCHA verification'
    showError('Please complete the CAPTCHA verification')
    return
  }

  errors.value = {}
  
  if (!validateForm()) {
    nextTick(() => {
      const firstError = document.querySelector('.text-red-600')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
    return
  }
  
  isLoading.value = true

  try {
    const roleMapping = {
      'tenant': 'templeadmin',
      'devotee': 'devotee', 
      'volunteer': 'volunteer'
    }

    const formData = new FormData()

    formData.append('fullName', form.value.fullName)
    formData.append('email', form.value.email)
    formData.append('password', form.value.password)
    formData.append('phone', form.value.phone)
    formData.append('role', roleMapping[form.value.role] || form.value.role)
    formData.append('captchaToken', captchaToken.value)

    if (form.value.role === 'tenant') {
      // Temple details
      formData.append('templeName', templeDetails.value.name)
      formData.append('templePlace', templeDetails.value.place)
      formData.append('templeAddress', templeDetails.value.address)
      formData.append('templePhoneNo', templeDetails.value.phoneNumber)
      formData.append('templeDescription', templeDetails.value.description)

      if (logoFile.value) {
        formData.append('logo', logoFile.value)
      }

      if (videoFile.value) {
        formData.append('video', videoFile.value)
      }
      
      // Bank account details
      formData.append('accountHolderName', bankDetails.value.accountHolderName)
      formData.append('accountNumber', bankDetails.value.accountNumber)
      formData.append('bankName', bankDetails.value.bankName)
      formData.append('branchName', bankDetails.value.branchName)
      formData.append('ifscCode', bankDetails.value.ifscCode)
      formData.append('accountType', bankDetails.value.accountType)
      
      if (bankDetails.value.upiId) {
        formData.append('upiId', bankDetails.value.upiId)
      }

      // Razorpay credentials
      formData.append('razorpayKeyId', bankDetails.value.razorpayKeyId)
      formData.append('razorpaySecret', bankDetails.value.razorpaySecret)
    }

    try {
      const response = await apiClient.auth.register(formData)
      console.log('Registration successful:', response.data)
      needsApproval.value = form.value.role === 'tenant'
      showSuccessModal.value = true
      registrationSuccess.value = true

      success(needsApproval.value 
        ? 'Your temple admin account has been created! You\'ll be notified after approval.' 
        : 'Your account has been created successfully!')

      if (authStore && typeof authStore.setRegistrationResult === 'function') {
        authStore.setRegistrationResult({
          success: true,
          needsApproval: needsApproval.value,
          message: needsApproval.value 
            ? 'Your temple admin account has been created. You\'ll be notified after approval.'
            : 'Your account has been created successfully.'
        })
      }

      resetForm()
      setTimeout(() => goToLogin(), 3000)
    } catch (apiError) {
      console.error('API Error during registration:', apiError)

      if (!apiError.response) {
        // Network error, timeout, CORS failure, server unreachable, etc.
        globalError.value = 'Unable to reach the server. Please check your connection and try again.'
        showError(globalError.value)
      } else {
        const backendMessage =
          apiError.response.data?.error ||
          apiError.response.data?.message ||
          null

        if (backendMessage) {
          const mapped = mapBackendErrorToField(backendMessage)

          if (mapped) {
            mapped.fields.forEach(field => {
              errors.value[field] = mapped.message
            })
            globalError.value = mapped.message
            showError(mapped.message)

            nextTick(() => {
              const firstFieldId = mapped.fields[0]
              const el = firstFieldId
                ? document.getElementById(firstFieldId)
                : document.querySelector('.text-red-600')
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            })
          } else {
            // No specific field match — show as a global error only
            globalError.value = backendMessage
            showError(backendMessage)
          }
        } else {
          globalError.value = 'Registration failed. Please try again.'
          showError(globalError.value)
        }

        // If the backend ever starts returning structured per-field errors,
        // apply them directly (takes precedence alongside the mapped ones above).
        if (apiError.response.data?.errors) {
          const backendErrors = apiError.response.data.errors
          Object.keys(backendErrors).forEach(field => {
            errors.value[field] = backendErrors[field]
          })
        }
      }

      errors.value = { ...errors.value }
      resetCaptcha()
    }
  } catch (err) {
    console.error('Registration error:', err)
    globalError.value = 'An error occurred during registration. Please try again.'
    showError('An error occurred during registration. Please try again.')
    resetCaptcha()
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  form.value = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    acceptTerms: false,
    templeDetails: null
  }

  templeDetails.value = {
    name: '',
    place: '',
    address: '',
    phoneNumber: '',
    description: ''
  }

  bankDetails.value = {
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
    accountType: '',
    upiId: '',
    razorpayKeyId: '',
    razorpaySecret: ''
  }

  logoFile.value = null
  videoFile.value = null
  logoPreview.value = null
  videoPreview.value = null

  errors.value = {}
  globalError.value = ''
  showRazorpaySecret.value = false
}

const goToLogin = () => {
  showSuccessModal.value = false
  nextTick(() => router.push('/login'))
}

onMounted(async () => {
  await nextTick()
  
  if (import.meta.env.VITE_ENABLE_TURNSTILE === "false") {
    console.log("⚠️ CAPTCHA is disabled via VITE_ENABLE_TURNSTILE=false")
    isCaptchaVerified.value = true
    return
  }

  if (!siteKey) {
    console.error('❌ Cloudflare Turnstile sitekey is missing. Please set VITE_CLOUDFLARE_CAPTCHA_KEY in your .env file')
    globalError.value = 'CAPTCHA configuration error. Please contact support.'
    return
  }
  
  console.log("OnMounted() getting called for CAPTCHA rendering")
  window.turnstile.ready(function() {
    if (window.turnstile) {
      widgetId.value = window.turnstile.render(
        '#turnstile', 
        {
          sitekey: siteKey,
          callback: function(token) {
            captchaToken.value = token
            isCaptchaVerified.value = true
            console.log("✅ CAPTCHA verification successful")
          },
          'error-callback': function(error) {
            captchaToken.value = ''
            isCaptchaVerified.value = false
            const errorCode = error?.error || error || 'Unknown error'
            console.error("❌ CAPTCHA verification failed:", errorCode, error)
            
            if (String(errorCode).includes('300010') || String(error).includes('300010')) {
              globalError.value = 'Invalid CAPTCHA sitekey. Please check your VITE_CLOUDFLARE_CAPTCHA_KEY environment variable.'
            } else if (String(errorCode).includes('300011') || String(error).includes('300011')) {
              globalError.value = 'CAPTCHA domain mismatch. The sitekey does not match this domain.'
            } else {
              globalError.value = `CAPTCHA verification failed (Error: ${errorCode}). Please try again.`
            }
          },
          'expired-callback': function() {
            captchaToken.value = ''
            isCaptchaVerified.value = false
            globalError.value = 'CAPTCHA expired. Please verify again.'
            console.log("⏰ CAPTCHA expired")
          }
        }
      )
    }
  });
})
</script>