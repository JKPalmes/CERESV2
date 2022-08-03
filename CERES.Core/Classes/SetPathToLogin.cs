using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Web;

namespace CERES.Core.Classes
{
    public class SetPathToLogin
    {
        string ClientFolderName = "";
        //private readonly string LoggedInUser = HttpContext.Current.User.Identity.Name; // need to replace this with the actual loginUsername
        private readonly string LoggedInUser = string.Empty;
        private string _ConnectionString = Common.GetSqlConnectionString();
           // ConfigurationManager.ConnectionStrings["BiDataEntryConnectionString"].ConnectionString;

        public SetPathToLogin(string UserName)
        {
            LoggedInUser = UserName;
        }

        public string GetLoggedInPathFromUserName()
        {
            try
            {
                SqlConnection conn = new SqlConnection(_ConnectionString);
                conn.Open();
                SqlCommand comm = new SqlCommand();
                comm.CommandText =
                string.Format("select distinct case when isnull(siteid,0) <>0 then UserFolderName else (select SiteFolderName From Client WHERE ClientID = usr.ClientID) end ClientFolderName from UserFolderConfig Usr where userid = dbo.fnGetUserID('{0}')", LoggedInUser.Trim()); 

                //  string.Format("SELECT UserClientSiteFolderName ClientFolderName FROM dbo.Users WHERE userName LIKE '%{0}%'",LoggedInUser.Trim());
                    //string.Format("SELECT (select siteFolderName FROM [BIDataEntry_TEST].[dbo].[Client] where clientID = us.[ClientFolderName]) ClientFolderName FROM [BIDataEntry_TEST].[dbo].[Users] us WHERE userName LIKE '%{0}%'", LoggedInUser.Trim());
                comm.CommandType = CommandType.Text;
                comm.Connection = conn;

                SqlDataReader reader = comm.ExecuteReader();
               
                    while (reader.Read())
                    {
                        ClientFolderName = reader["ClientFolderName"].ToString();
                    }
                    conn.Close();
                    comm.Dispose();
                    

                }
           
            catch (SqlException sqlException)
            {
                return sqlException.Message;

            }

            return ClientFolderName;
        }

    }
}