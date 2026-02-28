# API Error Handling - Quick Reference Card

> **দ্রুত শুরু করার জন্য সবচেয়ে গুরুত্বপূর্ণ commands**

---

## 🚀 Setup (1 Minute)

### HTML এ Script যোগ করুন

```html
<!-- Add in your _Layout.cshtml or main HTML file -->
<script src="/assets/Scripts/Core/Api/AppConfig.js"></script>
<script src="/assets/Scripts/Core/Managers/MessageManager.js"></script>
<script src="/assets/Scripts/Core/Api/ApiErrorHandler.js"></script>
<script src="/assets/Scripts/Core/Managers/ApiCallManager.js"></script>
```

### Test করুন (Browser Console)

```javascript
// Check if loaded
ApiErrorHandler.getInfo()

// Expected: { name: 'ApiErrorHandler', version: '1.0.0', ... }
```

✅ **Done! এখন আপনার প্রজেক্টে enterprise error handling চালু আছে**

---

## 📖 Most Common Commands

### 1. Error Information

```javascript
// Get module info
ApiErrorHandler.getInfo()

// Get current configuration
ApiErrorHandler.getConfig()

// Get error statistics
ApiErrorHandler.getErrorStatistics()

// Get recent errors (last 50)
ApiErrorHandler.getErrorHistory()
```

### 2. Error Handling

```javascript
// Auto-handle error (shows notification)
ApiErrorHandler.handleError(error)

// Handle without notification
ApiErrorHandler.handleError(error, { showNotification: false })

// Just parse error (no handling)
const parsed = ApiErrorHandler.parseError(error)
console.log(parsed.correlationId)  // ERR-1709097600000-1-abc123
```

### 3. Error Type Checking

```javascript
// Get error type
const errorType = ApiErrorHandler.getErrorType(error)

// Check if retryable
const isRetryable = ApiErrorHandler.isRetryable(errorType)

// Get retry delay
const delay = ApiErrorHandler.getRetryDelay(1)  // Returns: 1000ms
```

### 4. Configuration

```javascript
// Update config
ApiErrorHandler.setConfig({
  enableConsoleLog: true,
  enableRemoteLog: false,
  showUserMessages: true,
  circuitBreakerEnabled: false
})

// Production config
ApiErrorHandler.setConfig({
  enableConsoleLog: false,
  enableRemoteLog: true,
  circuitBreakerEnabled: true
})
```

### 5. Error History

```javascript
// View recent errors
ApiErrorHandler.getErrorHistory()

// Clear history
ApiErrorHandler.clearHistory()
```

### 6. Circuit Breaker

```javascript
// Check if circuit is open
ApiErrorHandler.isCircuitOpen()

// Reset circuit breaker
ApiErrorHandler.resetCircuitBreaker()
```

---

## 🎯 Quick Use Cases

### Use Case 1: Basic API Call (No Code Change Needed)

```javascript
// Your existing code works as-is
const result = await ApiCallManager.get('/users')

// Errors are automatically:
// ✅ Classified
// ✅ Logged with correlation ID
// ✅ Shown to user (MessageManager)
// ✅ Tracked in history
```

### Use Case 2: Custom Error Handling

```javascript
try {
  const result = await ApiCallManager.get('/users')
} catch (error) {
  const parsed = ApiErrorHandler.handleError(error, {
    showNotification: false  // Don't show automatic notification
  })

  // Custom logic
  if (parsed.errorType === ApiErrorHandler.ErrorType.UNAUTHORIZED) {
    window.location.href = '/Login/Index'
  } else {
    console.error(`Error ${parsed.correlationId}: ${parsed.message}`)
  }
}
```

### Use Case 3: Check Error Type Before Action

```javascript
try {
  await ApiCallManager.post('/save-user', userData)
} catch (error) {
  const errorType = ApiErrorHandler.getErrorType(error)

  if (errorType === ApiErrorHandler.ErrorType.VALIDATION_ERROR) {
    // Show form errors
    showFormErrors(error.validationErrors)
  } else if (errorType === ApiErrorHandler.ErrorType.NETWORK_ERROR) {
    // Retry or show offline message
    showOfflineMode()
  } else {
    // Generic error handling
    ApiErrorHandler.handleError(error)
  }
}
```

### Use Case 4: Retry Logic

```javascript
async function saveDataWithRetry(data, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ApiCallManager.post('/save-data', data)
    } catch (error) {
      const errorType = ApiErrorHandler.getErrorType(error)

      if (!ApiErrorHandler.isRetryable(errorType)) {
        // Don't retry
        throw error
      }

      if (attempt < maxAttempts) {
        const delay = ApiErrorHandler.getRetryDelay(attempt)
        console.log(`Retry ${attempt}/${maxAttempts} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
}
```

### Use Case 5: Error Dashboard

```javascript
function showErrorDashboard() {
  const stats = ApiErrorHandler.getErrorStatistics()
  const history = ApiErrorHandler.getErrorHistory()
  const info = ApiErrorHandler.getInfo()

  console.group('📊 Error Dashboard')
  console.log('Total Errors:', info.totalErrors)
  console.log('Circuit Breaker:', info.circuitBreakerOpen ? '🔴 OPEN' : '🟢 CLOSED')
  console.table(stats)
  console.log('Recent Errors:')
  console.table(history.slice(0, 5))
  console.groupEnd()
}

// Call it
showErrorDashboard()

// Or call it periodically
setInterval(showErrorDashboard, 5 * 60 * 1000) // Every 5 minutes
```

---

## 🔥 Error Types Cheat Sheet

```javascript
// Network & Connection
ApiErrorHandler.ErrorType.NETWORK_ERROR        // No internet
ApiErrorHandler.ErrorType.TIMEOUT_ERROR        // Request timeout
ApiErrorHandler.ErrorType.CORS_ERROR           // CORS issue

// Authentication & Authorization
ApiErrorHandler.ErrorType.UNAUTHORIZED         // 401 - Login required
ApiErrorHandler.ErrorType.FORBIDDEN            // 403 - No permission

// Client Errors
ApiErrorHandler.ErrorType.BAD_REQUEST          // 400
ApiErrorHandler.ErrorType.NOT_FOUND            // 404
ApiErrorHandler.ErrorType.CONFLICT             // 409
ApiErrorHandler.ErrorType.VALIDATION_ERROR     // 422
ApiErrorHandler.ErrorType.TOO_MANY_REQUESTS    // 429

// Server Errors
ApiErrorHandler.ErrorType.SERVER_ERROR         // 500
ApiErrorHandler.ErrorType.SERVICE_UNAVAILABLE  // 503
ApiErrorHandler.ErrorType.GATEWAY_TIMEOUT      // 504
```

---

## 🎓 Configuration Cheat Sheet

### Development (Default)

```javascript
{
  enableConsoleLog: true,          // ✅ Show in console
  enableRemoteLog: false,          // ❌ No remote logging
  showUserMessages: true,          // ✅ Show notifications
  circuitBreakerEnabled: false     // ❌ Circuit breaker off
}
```

### Production (Recommended)

```javascript
ApiErrorHandler.setConfig({
  enableConsoleLog: false,         // ❌ Hide from users
  enableRemoteLog: true,           // ✅ Log to backend
  showUserMessages: true,          // ✅ Show safe messages
  circuitBreakerEnabled: true      // ✅ Protection on
})
```

---

## 📊 Monitoring Commands

### Check System Health

```javascript
// Quick health check
const info = ApiErrorHandler.getInfo()
console.log('Total Errors:', info.totalErrors)
console.log('Circuit Breaker:', info.circuitBreakerOpen ? 'OPEN ⚠️' : 'CLOSED ✅')

// Detailed statistics
const stats = ApiErrorHandler.getErrorStatistics()
console.table(stats)

// Recent error details
const history = ApiErrorHandler.getErrorHistory()
console.table(history.slice(0, 10))
```

### Reset & Cleanup

```javascript
// Clear error history
ApiErrorHandler.clearHistory()

// Reset circuit breaker
ApiErrorHandler.resetCircuitBreaker()

// Reset all
ApiErrorHandler.clearHistory()
ApiErrorHandler.resetCircuitBreaker()
console.log('✅ All reset')
```

---

## 🆘 Troubleshooting One-Liners

```javascript
// 1. Check if loaded
typeof ApiErrorHandler !== 'undefined' ? '✅ Loaded' : '❌ Not loaded'

// 2. Check MessageManager
typeof MessageManager !== 'undefined' ? '✅ Loaded' : '❌ Not loaded'

// 3. Test error handling
ApiErrorHandler.handleError({ message: 'Test error' })

// 4. Check configuration
console.table(ApiErrorHandler.getConfig())

// 5. View recent activity
console.table(ApiErrorHandler.getErrorHistory())
```

---

## 🎯 Production Setup Checklist

```javascript
// 1. Load scripts (HTML)
// ✅ Done: Added script references

// 2. Test in console
ApiErrorHandler.getInfo()
// ✅ Working: Shows module info

// 3. Enable production config
ApiErrorHandler.setConfig({
  enableConsoleLog: false,
  enableRemoteLog: true,
  circuitBreakerEnabled: true
})
// ✅ Configured

// 4. Test API call
await ApiCallManager.get('/test-endpoint')
// ✅ Errors handled automatically

// 5. Check error tracking
ApiErrorHandler.getErrorStatistics()
// ✅ Tracking works
```

---

## 📞 Quick Help

### Problem: ApiErrorHandler not defined

```javascript
// Solution: Check script load order
// Must be: AppConfig → MessageManager → ApiErrorHandler → ApiCallManager
```

### Problem: Errors not showing

```javascript
// Solution: Enable notifications
ApiErrorHandler.setConfig({ showUserMessages: true })
```

### Problem: Too many console logs

```javascript
// Solution: Disable console logging
ApiErrorHandler.setConfig({ enableConsoleLog: false })
```

### Problem: Circuit breaker stuck

```javascript
// Solution: Reset it
ApiErrorHandler.resetCircuitBreaker()
```

---

## 🎉 Most Useful Command

```javascript
// Show everything at once
console.group('🔍 ApiErrorHandler Status')
console.log('Info:', ApiErrorHandler.getInfo())
console.log('Config:', ApiErrorHandler.getConfig())
console.log('Stats:', ApiErrorHandler.getErrorStatistics())
console.log('Recent Errors:', ApiErrorHandler.getErrorHistory().slice(0, 5))
console.log('Circuit Open?', ApiErrorHandler.isCircuitOpen())
console.groupEnd()
```

---

**Last Updated:** ২৮ ফেব্রুয়ারি ২০২৬
**Quick Reference:** Keep this card for daily use!
