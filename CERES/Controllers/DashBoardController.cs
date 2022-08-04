using System.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CERES.Core.Services;
using CERES.Web.Api.Classes;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System.Web;
using System.Security.Claims;
using static CERES.Web.Api.Classes.Helper;
using CERES.Core.DTO;

namespace Ceres.Controllers
{
    public class DashBoardController : Controller
    {
        public ActionResult Index()
        {
            var email = "bbeltran2@cbps.canon.com";
            if (Session["Email"] != null)
            {
                email = Session["Email"].ToString();
            }
            var list = ClientHierarchyService.GetTop10ServiceAreasByUserName(email).ToList();
            ViewBag.model = list;
            return View();
        }

        public ActionResult UserPreferences(string email)
        {
            var list = new List<StringKeyValue>();
            if (!string.IsNullOrEmpty(email))
            {
                list = ClientHierarchyService.GetTop10ServiceAreasByUserName(email).ToList();
            } 
            ViewBag.model = list;
            ViewBag.user = email;
            return View();
        }

    }
}
