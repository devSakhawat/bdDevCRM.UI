🎯 Usage Examples:
StringHelper:
JavaScript
// Capitalize
StringHelper.capitalize("hello world"); // "Hello world"

// Format
StringHelper.format("Hello {0}, you have {1} messages", "John", 5);
// "Hello John, you have 5 messages"

// Truncate
StringHelper.truncate("Long text here", 10); // "Long te..."

// Generate GUID
StringHelper.generateGuid(); // "550e8400-e29b-41d4-a716-446655440000"
DateHelper:
JavaScript
// Format date
DateHelper.formatDate(new Date(), 'DD-MM-YYYY'); // "13-11-2025"

// Relative time
DateHelper.getRelativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"

// Add days
DateHelper.addDays(new Date(), 7); // Date 7 days from now
NumberHelper:
JavaScript
// Format currency
NumberHelper.formatCurrency(1234.56); // "৳ 1,234.56"

// Format number
NumberHelper.formatNumber(1234567.89, 2); // "1,234,567.89"

// Compact notation
NumberHelper.toCompact(1500000); // "1.5M"
FormHelper:
JavaScript
// Get form data
var data = FormHelper.getFormData('#myForm');

// Set form data
FormHelper.setFormData('#myForm', { name: 'John', age: 30 });

// Clear form
FormHelper.clearForm('#myForm');

// Validate
if (FormHelper.validate('#myForm')) {
  // Form is valid
}
StorageManager:
JavaScript
// Save to localStorage
StorageManager.local.set('user', { name: 'John', id: 1 });

// Get from localStorage
var user = StorageManager.local.get('user');

// Save to sessionStorage
StorageManager.session.set('temp', 'value');

// Unified API (localStorage by default)
StorageManager.set('key', 'value');
StorageManager.get('key');

// Session storage
StorageManager.set('key', 'value', true); // true = use session
ConfirmationManager:
JavaScript
// Delete confirmation
ConfirmationManager.confirmDelete('group', function () {
  // User confirmed
  GroupManager.deleteGroup(id);
});

// Save confirmation
ConfirmationManager.confirmSave(function () {
  GroupManager.saveGroup();
});

// Custom confirmation
ConfirmationManager.confirm({
  title: 'Custom Title',
  message: 'Custom message',
  type: 'warning',
  onConfirm: function () {
    // Confirmed
  }
});


//Code
//wwwroot / assets / Scripts /
//├── Core /
//│   ├── Helpers /
//│   │   ├── StringHelper.js     String utilities
//│   │   ├── DateHelper.js       Date utilities
//│   │   ├── NumberHelper.js     Number / currency formatting
//│   │   ├── FormHelper.js       Form manipulation
//│   │   ├── GridHelper.js       Grid utilities(already exists)
//│   │   └── ValidationHelper.js Validation(already exists)
//│   │
//│   └── Managers /
//│       ├── StorageManager.js       localStorage / sessionStorage
//│       ├── ConfirmationManager.js  Confirmation dialogs
//│       ├── ApiCallManager.js       Centralized API calls
//│       ├── GridManager.js          Grid setup
//│       └── NotificationManager.js  Messages / notifications