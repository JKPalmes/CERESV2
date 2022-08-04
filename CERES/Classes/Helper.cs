//using Microsoft.AspNetCore.Mvc.ModelBinding;
using CERES.Web.Api.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.ModelBinding;
using System.Web.Mvc;
//using System.Web.Mvc;

namespace CERES.Web.Api.Classes
{
    public class Helper
    {
        public class AppUser : ClaimsPrincipal
        {
            public AppUser(ClaimsPrincipal principal)
                : base(principal)
            {
            }

            public string Name
            {
                get
                {
                    return this.FindFirst(ClaimTypes.Name).Value;
                }
            }

        }

        public abstract class AppController : System.Web.Http.ApiController
        {
            public AppUser CurrentUser
            {
                get
                {
                    return new AppUser(this.User as ClaimsPrincipal);
                }
            }
        }



    }

}
