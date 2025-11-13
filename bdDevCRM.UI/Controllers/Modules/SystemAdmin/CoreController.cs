using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace bdDevCRM.UI.Controllers.Modules.SystemAdmin
{
  public class CoreController : Controller
  {
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CoreController> _logger;

    public CoreController(
        IHttpClientFactory httpClientFactory, 
        IWebHostEnvironment environment,
        IConfiguration configuration,
        ILogger<CoreController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _environment = environment;
        _configuration = configuration;
        _logger = logger;
    }

    public ActionResult AccessSettings()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("AccessControl/AccessControlSettings");
      //}
      //else
      //{
      //  return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult UserSettings()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Users/UserSettings");
      //}
      //else
      //{
      //  return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult WorkFlowStatus()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Workflow/WorkFlowState");
      //}
      //else
      //{
      //  return RedirectToAction("Login", "Home");
      //}
    }
    public ActionResult Currency()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Currency/Currency");
      //}
      //else
      //{
      //  return RedirectToAction("Login", "Home");
      //}
    }

    public ActionResult Country()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Country/Country");
      //}
      //else
      //{
      //  return RedirectToAction("Login", "Home");
      //}
    }

    public ActionResult BoardInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Board/Board");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult BranchInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Branch/Branch");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult DistrictInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("District/District");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult MenuSettings()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Menu/Menu");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult ModuleSettings()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Module/Module");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult ThanaInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Thana/Thana");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult AccessTypeInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("AccessType/AccessType");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult UsersTypeInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("UsersType/UsersType");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult WorkflowSetup()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("WorkflowSetup/WorkflowSetup");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult UsersInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("UsersInformation/UsersInformation");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult UsersGroupsInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("UsersGroups/UsersGroups");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }


    public ActionResult GroupInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("UsersGroups/UsersGroups");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public IActionResult GroupSettings()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Group/GroupSettings");
      //}
      //else
      //{
      //  return RedirectToAction("LogOut", "Home");
      //}

    }

    public IActionResult FileUploadTest()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("FileUploadTest/FileUploadTest");
      //}
      //else
      //{
      //  return RedirectToAction("LogOut", "Home");
      //}

    }

  }

}
