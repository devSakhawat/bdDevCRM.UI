using Microsoft.AspNetCore.Mvc;

namespace bdDevCRM.UI.Controllers.Modules.CRM
{
  public class DealsController : Controller
  {
    public IActionResult Index()
    {
      return View("CRM/Deals/Deals");
    }



    public IActionResult Deals()
    {
      return View("Views/CRM/Deals/Deals.cshtml");
    }
  }
}
