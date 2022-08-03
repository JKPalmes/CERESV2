using System.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Ceres.Controllers
{
    public class DashBoardController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

    }
}
