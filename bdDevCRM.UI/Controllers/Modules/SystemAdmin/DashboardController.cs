using Microsoft.AspNetCore.Mvc;

namespace bdDevCRM.UI.Controllers.Modules.SystemAdmin;

//public class DashboardController : Controller
//{

public class DashboardController : Controller
{
  private readonly IHttpClientFactory _httpClientFactory;
  private readonly IWebHostEnvironment _environment;
  private readonly IConfiguration _configuration;
  private readonly ILogger<DashboardController> _logger;

  public DashboardController(
      IHttpClientFactory httpClientFactory,
      IWebHostEnvironment environment,
      IConfiguration configuration,
      ILogger<DashboardController> logger)
  {
    _httpClientFactory = httpClientFactory;
    _environment = environment;
    _configuration = configuration;
    _logger = logger;
  }


  public IActionResult Index()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("CrmDashboard/AdminDashboard");
    //}
    //else
    //{
    //  return RedirectToAction("Logoff", "Home");
    //}
  }

  public ActionResult AdminDashboard()
  {
    //if (Session["CurrentUser"] != null)
    //{
    return View("CrmDashboard/AdminDashboard");
    //}
    //else
    //{
    //  return RedirectToAction("Logoff", "Home");
    //}
  }
}

