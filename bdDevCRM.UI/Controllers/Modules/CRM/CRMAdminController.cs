using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace bdDevCRM.UI.Controllers.Modules.CRM
{
  [Route("CRMAdmin")]
  public class CRMAdminController : Controller
  {
    // Constructor (Dependency Injection can be added here if needed later)
    public CRMAdminController()
    {
    }

    //Optional helper method to check user login session
    private bool IsUserLoggedIn()
    {
      var user = HttpContext.Session.GetString("CurrentUser");
      return !string.IsNullOrEmpty(user);
    }

    //Common login redirect method
    private IActionResult RedirectToLogin()
    {
      return RedirectToAction("Logoff", "Home");
    }

    // =========================
    //       CRM VIEWS
    // =========================

    [HttpGet("CRMCourse")]
    public IActionResult CRMCourse()    
    {
      //if (!IsUserLoggedIn())
      //  return RedirectToLogin();

      return View("~/Views/CRM/CRMAdmin/CRMCourse/Course.cshtml");
    }

    //[HttpGet("CRMInstitute")]
    //public IActionResult CRMInstitute()
    //{
    //  //if (!IsUserLoggedIn())
    //  //  return RedirectToLogin();

    //  return View("~/Views/CRM/CRMAdmin/CRMInstitute/Institute.cshtml");
    //}

    //[HttpGet("CRMInstituteType")]
    //public IActionResult CRMInstituteType()
    //{
    //  //if (!IsUserLoggedIn())
    //  //  return RedirectToLogin();

    //  return View("~/Views/CRM/CRMAdmin/CRMInstituteType/InstituteType.cshtml");
    //}

    //[HttpGet("IntakeMonth")]
    //public IActionResult IntakeMonth()
    //{
    //  //if (!IsUserLoggedIn())
    //  //  return RedirectToLogin();

    //  return View("~/Views/CRM/CRMAdmin/CRMIntakeMonth/IntakeMonth.cshtml");
    //}

    //[HttpGet("IntakeYear")]
    //public IActionResult IntakeYear()
    //{
    //  //if (!IsUserLoggedIn())
    //  //  return RedirectToLogin();

    //  return View("~/Views/CRM/CRMAdmin/CRMIntakeYear/IntakeYear.cshtml");
    //}

    //[HttpGet("PaymentMethod")]
    //public IActionResult PaymentMethod()
    //{
    //  //if (!IsUserLoggedIn())
    //  //  return RedirectToLogin();

    //  return View("~/Views/CRM/CRMAdmin/CRMPaymentMethod/PaymentMethod.cshtml");
    //}

  }
}
