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
                    ret = reportName.StartsWith("Presentation") ? SaveFile(photo, imageId) : SaveImageFile(photo, imageId);
                }
            }

            return Redirect(_reportsUrl + "/apps/" + (reportName.StartsWith("Presentation") ? "presentations/presentation" : "dashboards/report") + reportId + "?" + ret);
        }

        string SaveImageFile(HttpPostedFileBase file, string imageId)
        {
            var targetLocation = Server.MapPath("~/Uploads/") + imageId + @"/img";
            CreateDirIfDoesNotExist(imageId, targetLocation);
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

        private void CreateDirIfDoesNotExist(string imageId, string targetLocation)
        {
            DirectoryInfo currentDirectoryInfo = new DirectoryInfo(targetLocation);
            if (!currentDirectoryInfo.Exists)
            {
                var targetDir = Server.MapPath("~/Uploads/");
                //separate clientId from imageId -> clientId/reportId)
                var clientId = imageId.Split('/')[0];
                var reportId = imageId.Split('/')[1];
                var clientDir = targetDir + clientId;
                var rptDir = clientDir + @"/" + reportId;
                //create client folder
                Directory.CreateDirectory(clientDir);
                //create report folder
                Directory.CreateDirectory(rptDir);
                //create ppt/img folder
                if (targetLocation.EndsWith("ppt"))  
                {
                    Directory.CreateDirectory(clientDir + @"/ppt");
                }
                else
                {
                    Directory.CreateDirectory(clientDir + @"/img");
                }
            }
        }
        string SaveFile(HttpPostedFileBase file, string imageId)
        {
            var targetLocation = Server.MapPath("~/Uploads/") + imageId + @"/ppt";
            DirectoryInfo currentDirectoryInfo = new DirectoryInfo(targetLocation);
            if (currentDirectoryInfo.Exists)
            {
                foreach (var pptFile in currentDirectoryInfo.GetFiles())
                {
                    if (pptFile.Extension.Contains(".ppt") && pptFile.Name.StartsWith("_"))
                    {
                        var fileName = pptFile.Name.Remove(0, 1);
                        var oldFile = Path.Combine(targetLocation, pptFile.Name);
                        var newFile = Path.Combine(targetLocation, fileName);
                        System.IO.File.Move(oldFile, newFile);
                    }
                }
            }
            try
            {
                var path = Path.Combine(targetLocation, "_" + file.FileName);
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
