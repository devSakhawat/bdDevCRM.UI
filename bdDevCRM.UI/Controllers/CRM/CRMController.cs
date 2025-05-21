using Microsoft.AspNetCore.Mvc;

namespace bdDevCRM.UI.Controllers.CRM
{
  public class CRMController : Controller
  {
    public IActionResult Application()
    {
      return View("CRMApplication/Application");
    }
  }
}
