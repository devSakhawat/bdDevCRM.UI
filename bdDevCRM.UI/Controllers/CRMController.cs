using Microsoft.AspNetCore.Mvc;

namespace bdDevCRM.UI.Controllers
{
    public class CRMController : Controller
    {
        public IActionResult Application()
        {
            return View();
        }
    }
}
