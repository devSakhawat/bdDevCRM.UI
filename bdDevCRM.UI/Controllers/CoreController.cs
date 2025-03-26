using Microsoft.AspNetCore.Mvc;

namespace EduSolutionWeb_v1.Controllers
{
  public class CoreController : Controller
  {
    public ActionResult InstituteInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("Institute/Institute");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
      //}
    }

    public ActionResult InstituteTypeInformation()
    {
      //if (Session["CurrentUser"] != null)
      //{
      return View("InstituteType/InstituteType");
      //}
      //else
      //{
      //    return RedirectToAction("Logoff", "Home");
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
   
    public ActionResult WorkflowSetupInformation()
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

    
  }
}
