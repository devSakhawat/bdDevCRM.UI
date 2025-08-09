using Microsoft.AspNetCore.Mvc;

namespace bdDevCRM.UI.Controllers.CRM
{
  public class DealsController : Controller
  {
    public IActionResult Index()
    {
      return View();
    }



    public IActionResult Deals()
    {
      return View("Deals/Deals");
    }
  }
}
