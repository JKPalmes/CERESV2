using System;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using CERES.Core;
using System.Web;
using CERES.Core.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

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

        public static string GenerateToken(string userName, string accountType, string clientId, string clientName)
        {
            var mySecret = "asdv234234^&%&^%&^hjsdfb2%%%";
            var mySecurityKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(Encoding.ASCII.GetBytes(mySecret));
            var myIssuer = "https://ceres.cbpsportal.com";
            var myAudience = "http://microstrategy.cbpsportal.com";
            var tokenHandler = new JwtSecurityTokenHandler();
            var claims = new List<Claim>()
                    {
                        new Claim(ClaimTypes.Sid, HttpUtility.HtmlEncode(clientId)),
                        new Claim(ClaimTypes.Name, HttpUtility.HtmlEncode(userName)),
                        new Claim(ClaimTypes.Email, HttpUtility.HtmlEncode(userName)),//user.Email)),
                        new Claim(ClaimTypes.Role, HttpUtility.HtmlEncode(accountType)),
                        new Claim(ClaimTypes.NameIdentifier, HttpUtility.HtmlEncode(clientName))
                    };

            var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = myIssuer,
                Audience = myAudience,
                SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(mySecurityKey, Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}