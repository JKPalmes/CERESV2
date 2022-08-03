using System;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using CERES.Core;
using System.Web;
using CERES.Core.Services;

namespace CERES.Web.Api.Providers
{
    public class OAuthProvider : OAuthAuthorizationServerProvider
    {
        #region[GrantResourceOwnerCredentials]
        public override Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {
            return Task.Factory.StartNew(() =>
            {
                var userName = context.UserName;
                var password = context.Password;
                var userSvc = new UserService();
                var user = userSvc.ValidateUser(userName, password);
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
                    var ticket = new AuthenticationTicket(oAuthIdentity, properties);
                    context.Validated(ticket);
                }
                else
                {
                    context.SetError("Invalid Credentials!", "The user name or password is incorrect");
                }
            });
        }
        #endregion

        #region[ValidateClientAuthentication]
        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {
            if (context.ClientId == null)
                context.Validated();

            return Task.FromResult<object>(null);
        }
        #endregion

        #region[TokenEndpoint]
        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }
        #endregion

        #region[CreateProperties]
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
        #endregion

    }
}