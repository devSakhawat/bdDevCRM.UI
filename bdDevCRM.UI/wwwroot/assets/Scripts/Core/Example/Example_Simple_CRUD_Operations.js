



/*//Example 1: Simple CRUD Operations*/
// In your CourseDetails.js

var CourseDetailsManager = {
  // Fetch dropdowns
  fetchInstituteComboBoxData: async function () {
    return await InstituteService.getDropdownCached();
  },

  fetchCurrencyComboBoxData: async function () {
    return await CurrencyService.getDropdownCached();
  },

  // Save or Update
  saveOrUpdateItem: async function () {
    const id = $("#courseId").val() || 0;
    const courseData = CourseDetailsHelper.createItem();

    if (!courseData) {
      ToastrMessage.showError("Failed to create course data");
      return;
    }

    const onSuccess = function () {
      CourseDetailsHelper.clearForm();
      CommonManager.closeKendoWindow("CoursePopUp");
    };

    if (id == 0) {
      await CourseService.create(courseData, { onSuccess });
    } else {
      await CourseService.update(id, courseData, { onSuccess });
    }
  },

  // Delete
  deleteItem: async function (gridItem) {
    if (!gridItem) return;

    const onSuccess = function () {
      CourseDetailsHelper.clearForm();
    };

    await CourseService.delete(gridItem.CourseId, { onSuccess });
  }
};









/*//Example 2: Creating a NEW Service on the Fly*/
// Create a Student Service without creating a separate file
var StudentService = GenericService.createService({
  entityName: "Student",
  endpoint: "/crm-student",
  summaryEndpoint: "/crm-student-summary",
  dropdownEndpoint: "/crm-student-ddl",
  gridId: "gridSummaryStudent",
  modelFields: {
    DateOfBirth: { type: "date" },
    EnrollmentDate: { type: "date" }
  },
  useFormData: true, // If students can upload photos
  cacheTime: 5 * 60 * 1000
});

// Use it immediately
var students = await StudentService.getDropdownCached();
var gridDataSource = StudentService.getGridDataSource();








/*//Example 3: Custom Endpoints*/
// Add custom method to existing service
CourseService.getPopularCourses = async function () {
  return await this.customGet("/popular", "Failed to load popular courses");
};

CourseService.searchCourses = async function (searchTerm) {
  return await this.customPost(
    "/search",
    { SearchTerm: searchTerm },
    "Failed to search courses"
  );
};

// Use it
var popularCourses = await CourseService.getPopularCourses();
var searchResults = await CourseService.searchCourses("Engineering");





/*//Example 4: Grid Integration*/
var CourseSummaryManager = {
  getSummaryCourseGridDataSource: function () {
    // Super simple now!
    return CourseService.getGridDataSource();
  }
};

var CourseSummaryHelper = {
  initCourseSummary: function () {
    this.initializeSummaryGrid();
  },

  initializeSummaryGrid: function () {
    $("#gridSummaryCourse").kendoGrid({
      dataSource: CourseSummaryManager.getSummaryCourseGridDataSource(),
      // ... rest of grid config
    });
  }
};








/*//Complete File Structure*/

//bdDevCRM.UI / wwwroot / assets / Scripts /
//├── Config /
//│   └── config.js(Already Created)
//│
//├── Core /
//│   ├── Managers /
//│   │   ├── VanillaApiCallManager.js(Already Created)
//│   │   ├── BaseManager.js
//│   │   ├── TokenManager.js
//│   │   ├── LoadingManager.js
//│   │   └── CacheManager.js
//│   │
//│   ├── Helpers /
//│   │   ├── ValidationHelper.js
//│   │   ├── DateHelper.js
//│   │   └── GridHelper.js
//│   │
//│   └── Services /
//│       ├── GenericService.js ⭐ (NEW - MOST IMPORTANT)
//│       ├── CourseService.js(Uses GenericService)
//│       ├── InstituteService.js(Uses GenericService)
//│       ├── InstituteTypeService.js(Uses GenericService)
//│       ├── CountryService.js(Uses GenericService)
//│       ├── CurrencyService.js(Uses GenericService)
//│       └── UserService.js
//│
//└── CRM /
//    └── Services /
//        ├── CRMApplicationService.js(Uses GenericService)
//        └── CRMCourseInformationService.js



/*//Updated Script References Order*/

//  < !--Configuration -->
//<script src="~/assets/Scripts/Config/config.js"></script>

//<!--Core Managers-- >
//<script src="~/assets/scripts/modules/core/Managers/VanillaApiCallManager.js"></script>
//<script src="~/assets/scripts/modules/core/Managers/BaseManager.js"></script>
//<script src="~/assets/scripts/modules/core/Managers/TokenManager.js"></script>
//<script src="~/assets/scripts/modules/core/Managers/LoadingManager.js"></script>
//<script src="~/assets/scripts/modules/core/Managers/CacheManager.js"></script>

//<!--Core Helpers-- >
//<script src="~/assets/scripts/modules/core/Helpers/ValidationHelper.js"></script>
//<script src="~/assets/scripts/modules/core/Helpers/DateHelper.js"></script>
//<script src="~/assets/scripts/modules/core/Helpers/GridHelper.js"></script>

//<!-- ⭐ Generic Service(MUST BE LOADED BEFORE OTHER SERVICES)-- >
//<script src="~/assets/scripts/modules/core/Services/GenericService.js"></script>

//<!--Core Services-- >
//<script src="~/assets/scripts/modules/core/Services/UserService.js"></script>
//<script src="~/assets/scripts/modules/core/Services/CountryService.js"></script>
//<script src="~/assets/scripts/modules/core/Services/CurrencyService.js"></script>
//<script src="~/assets/scripts/modules/core/Services/InstituteTypeService.js"></script>
//<script src="~/assets/scripts/modules/core/Services/InstituteService.js"></script>
//<script src="~/assets/scripts/modules/core/Services/CourseService.js"></script>

//<!--CRM Services-- >
//<script src="~/assets/Scripts/CRM/Services/CRMApplicationService.js"></script>
//<script src="~/assets/Scripts/CRM/Services/CRMCourseInformationService.js"></script>