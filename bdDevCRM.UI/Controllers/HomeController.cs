using bdDevCRM.UI.Models;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace EduSolutionWeb_v1.Controllers
{
  public class HomeController : Controller
  {
    private readonly ILogger<HomeController> _logger;
    const string SessionThem = "_theme";

    public HomeController(ILogger<HomeController> logger)
    {
      _logger = logger;
    }

    public IActionResult Login()
    {
      return View();
    }

    public IActionResult Index()
    {
      return View();
    }

    public IActionResult Index2()
    {
      return View();
    }

    public IActionResult Privacy()
    {
      return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
      return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    [HttpPost]
    public IActionResult CultureManagement(string cultureName, string returnUrl)
    {
      Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName, CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(cultureName)), new CookieOptions { Expires = DateTimeOffset.Now.AddDays(30) });

      //return RedirectToAction(nameof(Index));
      return LocalRedirect(returnUrl);
    }

    public string UpdateTheme(string themeName)
    {
      if (HttpContext.Session == null)
      {
        HttpContext.Session.SetString("SessionThem", null);
        HttpContext.Session.SetString("SessionThem", themeName);
      }
      else
      {
        HttpContext.Session.SetString("SessionThem", themeName);
      }
      return "Success";
    }
  }
}
