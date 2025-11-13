using Microsoft.AspNetCore.Mvc;

namespace bdDevCRM.UI.Controllers.Modules.CRM;

public class CRMAdminController : Controller
{

  public ActionResult CRMCourse()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("../CRM/CRMAdmin/CRMCourse/Course");
    //}
    //else
    //{
    //    return RedirectToAction("Logoff", "Home");
    //}
  }

  public ActionResult CRMInstitute()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("CRM/CRMAdmin/CRMInstitute/Institute");
    //}
    //else
    //{
    //    return RedirectToAction("Logoff", "Home");
    //}
  }

  public ActionResult CRMInstituteType()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("CRM/CRMAdmin/CRMInstituteType/InstituteType");
    //}
    //else
    //{
    //    return RedirectToAction("Logoff", "Home");
    //}
  }

  public ActionResult IntakeMonth()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("CRM/CRMAdmin/CRMIntakeMonth/IntakeMonth");
    //}
    //else
    //{
    //    return RedirectToAction("Logoff", "Home");
    //}
  }

  public ActionResult IntakeYear()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("CRM/CRMAdmin/CRMIntakeYear/IntakeYear");
    //}
    //else
    //{
    //    return RedirectToAction("Logoff", "Home");
    //}
  }

  public ActionResult PaymentMethod()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("CRM/CRMAdmin/CRMPaymentMethod/PaymentMethod");
    //}
    //else
    //{
    //    return RedirectToAction("Logoff", "Home");
    //}
  }


}
