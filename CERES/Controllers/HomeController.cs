using System.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CERES.Core.DTO;

namespace Ceres.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(string username, string password, string clientId)
        {
            // validate the user credential
            // add cookie
            var user = new User();
            user.Email = username;
            user.Password = password;
            //AddCookie(user);

            //get client info
            //var clientId = "1000002";
            //var clientId = int.Parse(clientid);
            if (clientId == "1") clientId = "1000001";
            //return RedirectToAction("Index", "Dashboard");

                //var segment = string.Join(" ", address, Area, city, zipCode);
                //var escapedSegment = Uri.EscapeDataString(segment);
                //var baseFormat = "https://www.google.co.za/maps/search/{0}/";
                //var url = string.Format(baseFormat, escapedSegment);
                //return Redirect(url);

                //save email and token to aspnetusertokens
                //return Redirect("http://localhost:3011/auth/reset-password?email=" + email + "&token=" + token);
            return Redirect("http://localhost:3011/metronic8/react/demo2/dashboard?clientId=" + clientId + "&password=" + password + "&email=" + username);
            //return Redirect(appUrl + "/auth/reset-password?email=" + email + "&token=" + token);

            //var appUrl = _authManager.GetAppUrl();

            //return Redirect(appUrl + "?email=" + email + "&token=" + token);
            //return Redirect(appUrl);// + "?email=" + email + "&token=" + token);

        }

    }
}
