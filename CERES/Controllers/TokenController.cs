using System.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CERES.Core.DTO;
using System.Web.Configuration;
using System.Web;
using System.IO;

namespace CERES.Web.Api.Controllers
{
    public class TokenController : Controller
    {
        private readonly string _reportsUrl = WebConfigurationManager.AppSettings["ExecutiveDashboardUrl"];

        public ActionResult Index(string username, string userrole, string clientId, string clientName)
        {
            //generate token
            var token = Providers.OAuthProvider.GenerateToken(username, userrole, clientId, clientName);

            //return Redirect("http://localhost:3011/metronic8/react/demo2/auth?token=" + token);
            return Redirect(_reportsUrl + "/login?token=" + token);

        }

        [HttpPost]
        public ActionResult FileSelection(string clientName, string reportName, string imageId, string reportId, HttpPostedFileBase photo)
        {
            var ret = "Success";
            if (photo != null)
            {
                if (reportName == "logo")
                {
                    ret = SaveLogo(photo, imageId);
                    return Redirect(_reportsUrl + "/apps/dashboards/report1?" + ret);
                }
                else
                {
                    ret = reportName.StartsWith("PowerPoint") ? SaveFile(photo, imageId) : SaveImageFile(photo, imageId);
                }
            }

            return Redirect(_reportsUrl + "/apps/" + (reportName.StartsWith("PowerPoint") ? "presentations/presentation" : "dashboards/report") + reportId + "?" + ret);
        }

        string SaveImageFile(HttpPostedFileBase file, string imageId)
        {
            var targetLocation = Server.MapPath("~/Uploads/") + imageId + @"/img";

            try
            {
                //var path = Path.Combine(targetLocation, file.FileName);
                var path = Path.Combine(targetLocation, file.FileName);
                file.SaveAs(path);
            }
            catch
            {
                Response.StatusCode = 400;
                return "Error";
            }

            return "Success";
        }

        string SaveFile(HttpPostedFileBase file, string imageId)
        {
            //var targetLocation = Server.MapPath("~/Uploads/");
            var targetLocation = Server.MapPath("~/Uploads/") + imageId + @"/ppt";
            //var fileName = imageId.Replace(@"/", "-") + ".pptx";
            var extension = Path.GetExtension(file.FileName);
            try
            {
                //var path = Path.Combine(targetLocation, file.FileName);
                var path = Path.Combine(targetLocation, "presentation" + extension );
                file.SaveAs(path);
            }
            catch
            {
                Response.StatusCode = 400;
                return "Error";
            }

            return "Success";
        }

        string SaveLogo(HttpPostedFileBase file, string imageId)
        {
            var targetLocation = Server.MapPath("~/Uploads/");

            try
            {
                var path = Path.Combine(targetLocation, imageId);
                file.SaveAs(path);
            }
            catch
            {
                Response.StatusCode = 400;
                return "Error";
            }

            return "Success";
        }


    }
}
