using BIDE_GOLD.Web.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace BIDE_GOLD.Web.Services
{
    public class UserService
    {
        public User ValidateUser(string email, string password)
        {
            using (BIDataEntry_TESTEntities entities = new BIDataEntry_TESTEntities())
            {
                try
                {
                    var appUser = entities.Database.SqlQuery<user>("EXEC spGetUser @USER, @PWD"
                    , new SqlParameter("@USER", email)
                    , new SqlParameter("@PWD", password))
                    .FirstOrDefault();
                    User user = new User();
                    if (appUser != null)
                    {
                        user.Email = appUser.userName;
                        user.Name = appUser.fullname;
                        user.Id = appUser.userID;

                        return user;
                    }                    
                }
                catch (Exception e)
                {
                    return null;
                }
                return null;
            }
            
        }
    }

    
}