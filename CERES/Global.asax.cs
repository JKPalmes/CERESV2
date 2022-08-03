using CERES.Core.Services;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;


namespace CERES.Web.Api
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);


        }

        protected void Application_BeginRequest(Object sender, EventArgs e)
        {
            //// Preflight request comes with HttpMethod OPTIONS
            //HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "*");
            //if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            //{
            //    HttpContext.Current.Response.AddHeader("Cache-Control", "no-cache");
            //    HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST");
            //    // The following line solves the error message
            //    //HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "*");
            //    // If any http headers are shown in preflight error in browser console add them below
            //    HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Pragma, Cache-Control, Authorization ");
            //    HttpContext.Current.Response.AddHeader("Access-Control-Max-Age", "1728000");
            //    HttpContext.Current.Response.End();
            //}

            if (Request.Headers.AllKeys.Contains("Origin") && Request.HttpMethod == "OPTIONS")
            {
                Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3011");
                Response.Headers.Add("Access-Control-Allow-Headers",
                  "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
                Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                Response.Headers.Add("Access-Control-Allow-Credentials", "true");
                Response.Flush();
            }

            if (Request["_ul"] != null)
            {
                var userService = new UserService();
                var cred = Request["_ul"];
                //var username = "bbeltran@cbps.canon.com";
                //var pwd = "C1mplex135$";
                var username = cred.Split('|')[0];
                var pwd = cred.Split('|')[1];
                var user = userService.ValidateUser(username, pwd);
                //userService.QuickLogin(Request["_ul"]);
                //var userManager = HttpContext.Current.GetOwinContext().Get<ApplicationUserManager>();

                if (user != null)
                {
                    var claims = new List<Claim>()
                    {
                        new Claim(ClaimTypes.Sid, Convert.ToString(user.Id)),
                        new Claim(ClaimTypes.Name, HttpUtility.HtmlEncode(user.Name)),
                        new Claim(ClaimTypes.Email, HttpUtility.HtmlEncode(user.Email)),
                        new Claim(ClaimTypes.Role, HttpUtility.HtmlEncode(user.AccountType))
                    };
                    ClaimsIdentity oAuthIdentity = new ClaimsIdentity(claims,
                                Startup.OAuthOptions.AuthenticationType);

                    var properties = CreateProperties(HttpUtility.HtmlEncode(user.Name), HttpUtility.HtmlEncode(user.Email), HttpUtility.HtmlEncode(user.ClientID), HttpUtility.HtmlEncode(user.AccountType));

                    //var ticket = new AuthenticationTicket(oAuthIdentity, properties);
                    //context.Validated(ticket);

                    // this might be different in your code. Basically you need to crate ClaimsIdentity from ApplicationUser object
                    //var identity = user.CreateIdentity(userManager, DefaultAuthenticationTypes.ApplicationCookie);

                    if (HttpContext.Current != null && HttpContext.Current.Items["owin.Environment"] == null)// && container.IsVerifying())
                    {
                        var authenticationManager = new OwinContext().Authentication;
                        //var authenticationManager = HttpContext.Current.GetOwinContext().Authentication;

                        // signs out the current user
                        authenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);

                        // you need this for the current request, otherwise user will be authenticated only for the next request.
                        var claimsPrincipal = new ClaimsPrincipal(oAuthIdentity);
                        HttpContext.Current.User = claimsPrincipal;

                        // sets the cookie for the next request
                        authenticationManager.SignIn(new AuthenticationProperties(), oAuthIdentity);
                    }
                }
                else
                {
                    
                }
            }
        }

        public static AuthenticationProperties CreateProperties(string userName, string email, string clientID, string accountType)
        {
            IDictionary<string, string> data = new Dictionary<string, string>
            {
                { "userName", userName },
                { "email", email },
                { "clientId", clientID},
                { "accountType", accountType}
            };
            return new AuthenticationProperties(data);
        }
    }
}
