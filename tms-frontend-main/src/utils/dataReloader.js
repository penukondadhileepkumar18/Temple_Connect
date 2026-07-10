// src/utils/dataReloader.js
export default {
  async retryOperation(operation, maxAttempts = 5, delay = 1000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxAttempts} for operation`);
        const result = await operation();
        console.log(`✅ Operation succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed:`, error);
        lastError = error;
        
        if (attempt < maxAttempts) {
          // Exponential backoff with jitter
          const jitter = Math.random() * 300;
          const waitTime = delay * Math.pow(1.5, attempt - 1) + jitter;
          console.log(`⏱️ Waiting ${Math.round(waitTime)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    console.error(`❌ All ${maxAttempts} attempts failed for operation`);
    throw lastError;
  },
  
  // Special function for DevoteeDashboard to reload data
  setupDashboardReloader(loadFn, component) {
    // Initial load
    loadFn();
    
    // Setup retries for critical data
    const retrySchedule = [1000, 2000, 3000, 5000, 8000];
    
    retrySchedule.forEach((delay, index) => {
      setTimeout(() => {
        if (!component.dataLoaded) {
          console.log(`🔄 Automatic retry ${index + 1}/${retrySchedule.length} for dashboard data`);
          loadFn();
        }
      }, delay);
    });
  }
};