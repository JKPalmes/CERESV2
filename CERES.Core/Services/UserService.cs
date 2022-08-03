using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Configuration;
using CERES.Core.Classes;
using CERES.Core.DAL;
using CERES.Core.DTO;
using CERES.Core.Repository;

namespace CERES.Core.Services
{
    public class UserService
    {
        private readonly int _validViewPeriod = Int32.Parse(WebConfigurationManager.AppSettings["ValidPeriodForView"]);

        public static User GetUserProfile(string email)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var appUser = dbContext.Database.SqlQuery<AppUser>("EXEC spEDSUser_GetUser @userName", new SqlParameter("@userName", email)).FirstOrDefault();//ToList();
                    if (appUser != null)
                    {
                        User validUser = new User();
                        validUser.Email = appUser.userName;
                        validUser.Name = appUser.fullname;
                        validUser.Id = appUser.userID;
                        validUser.AccountType = appUser.AccountType;
                        validUser.ClientID = (int)appUser.clientID;
                        validUser.ManagerFullName = appUser.managerfullname;
                        validUser.ManagerUserName = appUser.managerusername;
                        validUser.CompanyName = appUser.company_nm;
                        validUser.ContactNo = appUser.contact_phone_nbr;
                        validUser.LastLogin = (DateTime)appUser.lastlogin_dttm;
                        validUser.CanUpload = Convert.ToInt16(appUser.Upload_ind);
                        validUser.AccessGoldReports = Convert.ToInt16(appUser.GoldReports_ind);
                        validUser.MstrUser = Convert.ToInt16(appUser.MstrUser_ind);
                        return validUser;
                    }
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
                return null;
            }

        }
        public User ValidateUser(string email, string password)
        {
            var resetPwd = false;
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spEDSUser_ValidateUser";
            cmd.Parameters.AddWithValue("@USER", email);
            cmd.Parameters.AddWithValue("@PWD", password);

            cmd.Parameters.Add("@RESETPWD", SqlDbType.Bit, 0);
            cmd.Parameters["@RESETPWD"].Direction = ParameterDirection.Output;
            cmd.Parameters.Add("@RESULT", SqlDbType.TinyInt, 0);
            cmd.Parameters["@RESULT"].Direction = ParameterDirection.Output;
            try
            {
                conn.Open();
                int i = cmd.ExecuteNonQuery();
                //Storing the output parameters value in different variables.  
                resetPwd = Convert.ToString(cmd.Parameters["@RESETPWD"].Value) == "False" ? false : true;
                result = int.Parse(Convert.ToString(cmd.Parameters["@RESULT"].Value));
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    if (result == 1) //valid user
                    {
                        var appUser = dbContext.Database.SqlQuery<AppUser>("EXEC spEDSUser_GetUser @userName", new SqlParameter("@userName", email)).FirstOrDefault();//ToList();
                        if (appUser != null)
                        {
                            User validUser = new User();
                            validUser.Email = appUser.userName;
                            validUser.Name = appUser.fullname;
                            validUser.Id = appUser.userID;
                            validUser.AccountType = appUser.AccountType;
                            validUser.ClientID = resetPwd ? 0 : appUser.clientID;
                            //validUser.ClientID = 0; //triggers reset password in login3.html
                            return validUser;
                        }
                    }
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
                return null;
            }

        }

        public static int ChangePassword(string email, string oldPassword, string newPassword)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spEDS_Update_UserPwd";
            cmd.Parameters.AddWithValue("@userName", email);
            cmd.Parameters.AddWithValue("@userPwdOld", oldPassword);
            cmd.Parameters.AddWithValue("@userPwdNew", newPassword);
            cmd.Parameters.AddWithValue("@passKey", "4F6E6C7956616C6964416E64417574686F72697A65644170704973416C6C6F776564");
            cmd.Parameters.Add("@result", SqlDbType.TinyInt, 0);
            cmd.Parameters["@result"].Direction = ParameterDirection.Output;

            try
            {
                conn.Open();
                int i = cmd.ExecuteNonQuery();
                //Storing the output parameters value in variable.  
                result = int.Parse(Convert.ToString(cmd.Parameters["@result"].Value));

                //Sync password with MicroStrategy
                var fileName = Common.CreateChangePwdFiles(newPassword, email);
                //Common.SyncMSTRPassword(fileName);
                //Common.DeleteChangePwdFiles(fileName);

            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int UpdateResetFlag(string email)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = "	update U set resetflag = 0 FROM [EDS_TDB].[dbo].[Users] u where userName = '" + email + "'";

            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int UpdateUserProfile(string email, string contactNo)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = "	update U set contact_phone_nbr = '" + contactNo + "' FROM [EDS_TDB].[dbo].[Users] u where userName = '" + email + "'";

            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }
        public IEnumerable<TransactionsResponseModel> GetDataBySiteAccess(string email, string date, int serviceAreaId, string viewData, string accountType, int lastDayProductionDate = 90)
        {
            var allData = true;
            //var allData = false;

            if (string.IsNullOrEmpty(date) || date.Contains("undefined"))
                date = DateTime.Today.ToShortDateString();
            else
            {
                var tDate = date.Split('/');
                date = tDate[2] + "-" + tDate[0] + "-" + tDate[1];  //YYYY-MM-DD
            }

            var tmpStartDate = DateTime.Parse(date);
            var tmpEndDate = DateTime.Parse(date).AddMonths(1);

            var startDate = DateTime.Parse(tmpStartDate.Year + "-" + tmpStartDate.Month + "-01");
            if (allData)
            {
                startDate = DateTime.Parse("2000-01-01");
            }
            var endDate = DateTime.Parse(tmpEndDate.Year + "-" + tmpEndDate.Month + "-01");

            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;
                try
                {
                    DateTime searchDateRange = DateTime.Today.AddDays(lastDayProductionDate * -1);
                    //if (viewData == "ShowAllTransactions")
                    //{
                    //    searchDateRange = DateTime.Parse("2000-01-01");
                    //}
                    DateTime today = DateTime.Today.AddDays(7);
                    var result = (from t in dbContext.Transactions
                                  join a in dbContext.ServiceAreas on t.svcID equals a.svcID
                                  join b in dbContext.locations on t.locID equals b.locID
                                  join c in dbContext.sites on t.siteID equals c.siteID
                                  join d in dbContext.Clients on t.accountID equals d.clientID
                                  where 1 == 1 &&
                                  //t.tID == 163 &&
                                  t.svcID == serviceAreaId &&
                                  (t.tDate >= searchDateRange && t.tDate <= today) &&
                                  (t.StatusCode == "U" || t.StatusCode == null || t.StatusCode == "")  //NOT DELETED FLAG
                                  //&& (t.tDate >= startDate && t.tDate < endDate)    //GET DATA WITHIN THE MONTH OF CURRENT SELECTED PROD-DATE
                                  //&& t.userName == email //filter by user
                                  select new TransactionsResponseModel
                                  {
                                      ProductionDate = t.tDate,
                                      TransactionId = t.tID,
                                      AccountId = t.accountID,
                                      SiteId = t.siteID,
                                      LocationId = t.locID,
                                      ServiceAreaId = t.svcID,
                                      AccountName = d.clientName,
                                      SiteName = c.siteName,
                                      LocationName = b.locName,
                                      ServiceAreaName = a.svcName,
                                      JOB_ID = t.JOB_ID,
                                      Remarks = t.Remarks,
                                      StatusCode = t.StatusCode,
                                      UpdateUserID = t.UpdateUserID,
                                      CreationDate = t.CreationDate,
                                      UpdateDate = t.UpdateDate,
                                      UserName = t.userName,
                                      field1 = t.field1,
                                      field2 = t.field2,
                                      field3 = t.field3,
                                      field4 = t.field4,
                                      field5 = t.field5,
                                      field6 = t.field6,
                                      field7 = t.field7,
                                      field8 = t.field8,
                                      field9 = t.field9,
                                      field10 = t.field10,
                                      field11 = t.field11,
                                      field12 = t.field12,
                                      field13 = t.field13,
                                      field14 = t.field14,
                                      field15 = t.field15,
                                      field16 = t.field16,
                                      field17 = t.field17,
                                      field18 = t.field18,
                                      field19 = t.field19,
                                      field20 = t.field20,
                                      field21 = t.field21,
                                      field22 = t.field22,
                                      field23 = t.field23,
                                      field24 = t.field24,
                                      field25 = t.field25,
                                      field26 = t.field26,
                                      field27 = t.field27,
                                      field28 = t.field28,
                                      field29 = t.field29,
                                      field30 = t.field30,
                                      field31 = t.field31,
                                      field32 = t.field32,
                                      field33 = t.field33,
                                      field34 = t.field34,
                                      field35 = t.field35,
                                      field36 = t.field36,
                                      field37 = t.field37,
                                      field38 = t.field38,
                                      field39 = t.field39,
                                      field40 = t.field40,
                                      field41 = t.field41,
                                      field42 = t.field42,
                                      field43 = t.field43,
                                      field44 = t.field44,
                                      field45 = t.field45,
                                      field46 = t.field46,
                                      field47 = t.field47,
                                      field48 = t.field48,
                                      field49 = t.field49,
                                      field50 = t.field50,
                                      field51 = t.field51,
                                      field52 = t.field52,
                                      field53 = t.field53,
                                      field54 = t.field54,
                                      field55 = t.field55,
                                      field56 = t.field56,
                                      field57 = t.field57,
                                      field58 = t.field58,
                                      field59 = t.field59,
                                      field60 = t.field60,
                                      field61 = t.field61,
                                      field62 = t.field62,
                                      field63 = t.field63,
                                      field64 = t.field64,
                                      field65 = t.field65,
                                      field66 = t.field66,
                                      field67 = t.field67,
                                      field68 = t.field68,
                                      field69 = t.field69,
                                      field70 = t.field70,
                                      field71 = t.field71,
                                      field72 = t.field72,
                                      field73 = t.field73,
                                      field74 = t.field74,
                                      field75 = t.field75,
                                      field76 = t.field76,
                                      field77 = t.field77,
                                      field78 = t.field78,
                                      field79 = t.field79,
                                      field80 = t.field80,
                                      field81 = t.field81,
                                      field82 = t.field82,
                                      field83 = t.field83,
                                      field84 = t.field84,
                                      field85 = t.field85,
                                      field86 = t.field86,
                                      field87 = t.field87,
                                      field88 = t.field88,
                                      field89 = t.field89,
                                      field90 = t.field90,
                                      field91 = t.field91,
                                      field92 = t.field92,
                                      field93 = t.field93,
                                      field94 = t.field94,
                                      field95 = t.field95,
                                      field96 = t.field96,
                                      field97 = t.field97,
                                      field98 = t.field98,
                                      field99 = t.field99,
                                      field100 = t.field100,
                                      field101 = t.field101,
                                      field102 = t.field102,
                                      field103 = t.field103,
                                      field104 = t.field104,
                                      field105 = t.field105,
                                      field106 = t.field106,
                                      field107 = t.field107,
                                      field108 = t.field108,
                                      field109 = t.field109,
                                      field110 = t.field110,
                                      field111 = t.field111,
                                      field112 = t.field112,
                                      field113 = t.field113,
                                      field114 = t.field114,
                                      field115 = t.field115,
                                      field116 = t.field116,
                                      field117 = t.field117,
                                      field118 = t.field118,
                                      field119 = t.field119,
                                      field120 = t.field120,
                                      field121 = t.field121,
                                      field122 = t.field122,
                                      field123 = t.field123,
                                      field124 = t.field124,
                                      field125 = t.field125,
                                      field126 = t.field126,
                                      field127 = t.field127,
                                      field128 = t.field128,
                                      field129 = t.field129,
                                      field130 = t.field130,
                                      field131 = t.field131,
                                      field132 = t.field132,
                                      field133 = t.field133,
                                      field134 = t.field134,
                                      field135 = t.field135,
                                      field136 = t.field136,
                                      field137 = t.field137,
                                      field138 = t.field138,
                                      field139 = t.field139,
                                      field140 = t.field140,
                                      field141 = t.field141,
                                      field142 = t.field142,
                                      field143 = t.field143,
                                      field144 = t.field144,
                                      field145 = t.field145,
                                      field146 = t.field146,
                                      field147 = t.field147,
                                      field148 = t.field148,
                                      field149 = t.field149,
                                      field150 = t.field150,
                                      field151 = t.field151,
                                      field152 = t.field152,
                                      field153 = t.field153,
                                      field154 = t.field154,
                                      field155 = t.field155,
                                      field156 = t.field156,
                                      field157 = t.field157,
                                      field158 = t.field158,
                                      field159 = t.field159,
                                      field160 = t.field160,
                                      field161 = t.field161,
                                      field162 = t.field162,
                                      field163 = t.field163,
                                      field164 = t.field164,
                                      field165 = t.field165,
                                      field166 = t.field166,
                                      field167 = t.field167,
                                      field168 = t.field168,
                                      field169 = t.field169,
                                      field170 = t.field170,
                                      field171 = t.field171,
                                      field172 = t.field172,
                                      field173 = t.field173,
                                      field174 = t.field174,
                                      field175 = t.field175,
                                      field176 = t.field176,
                                      field177 = t.field177,
                                      field178 = t.field178,
                                      field179 = t.field179,
                                      field180 = t.field180,
                                      field181 = t.field181,
                                      field182 = t.field182,
                                      field183 = t.field183,
                                      field184 = t.field184,
                                      field185 = t.field185,
                                      field186 = t.field186,
                                      field187 = t.field187,
                                      field188 = t.field188,
                                      field189 = t.field189,
                                      field190 = t.field190,
                                      field191 = t.field191,
                                      field192 = t.field192,
                                      field193 = t.field193,
                                      field194 = t.field194,
                                      field195 = t.field195,
                                      field196 = t.field196,
                                      field197 = t.field197,
                                      field198 = t.field198,
                                      field199 = t.field199,
                                      field200 = t.field200,
                                      StringField1 = t.StringField1,
                                      StringField2 = t.StringField2,
                                      StringField3 = t.StringField3,
                                      StringField4 = t.StringField4,
                                      StringField5 = t.StringField5,
                                      StringField6 = t.StringField6,
                                      StringField7 = t.StringField7,
                                      StringField8 = t.StringField8,
                                      StringField9 = t.StringField9,
                                      StringField10 = t.StringField10,
                                      StringField11 = t.StringField11,
                                      StringField12 = t.StringField12,
                                      StringField13 = t.StringField13,
                                      StringField14 = t.StringField14,
                                      StringField15 = t.StringField15,
                                      StringField16 = t.StringField16,
                                      StringField17 = t.StringField17,
                                      StringField18 = t.StringField18,
                                      StringField19 = t.StringField19,
                                      StringField20 = t.StringField20,
                                      StringField21 = t.StringField21,
                                      StringField22 = t.StringField22,
                                      StringField23 = t.StringField23,
                                      StringField24 = t.StringField24,
                                      StringField25 = t.StringField25,
                                      StringField26 = t.StringField26,
                                      StringField27 = t.StringField27,
                                      StringField28 = t.StringField28,
                                      StringField29 = t.StringField29,
                                      StringField30 = t.StringField30,
                                      StringField31 = t.StringField31,
                                      StringField32 = t.StringField32,
                                      StringField33 = t.StringField33,
                                      StringField34 = t.StringField34,
                                      StringField35 = t.StringField35,
                                      StringField36 = t.StringField36,
                                      StringField37 = t.StringField37,
                                      StringField38 = t.StringField38,
                                      StringField39 = t.StringField39,
                                      StringField40 = t.StringField40,
                                      StringField41 = t.StringField41,
                                      StringField42 = t.StringField42,
                                      StringField43 = t.StringField43,
                                      StringField44 = t.StringField44,
                                      StringField45 = t.StringField45,
                                      StringField46 = t.StringField46,
                                      StringField47 = t.StringField47,
                                      StringField48 = t.StringField48,
                                      StringField49 = t.StringField49,
                                      StringField50 = t.StringField50,
                                      StringField51 = t.StringField51,
                                      StringField52 = t.StringField52,
                                      StringField53 = t.StringField53,
                                      StringField54 = t.StringField54,
                                      StringField55 = t.StringField55,
                                      StringField56 = t.StringField56,
                                      StringField57 = t.StringField57,
                                      StringField58 = t.StringField58,
                                      StringField59 = t.StringField59,
                                      StringField60 = t.StringField60,
                                      StringField61 = t.StringField61,
                                      StringField62 = t.StringField62,
                                      StringField63 = t.StringField63,
                                      StringField64 = t.StringField64,
                                      StringField65 = t.StringField65,
                                      StringField66 = t.StringField66,
                                      StringField67 = t.StringField67,
                                      StringField68 = t.StringField68,
                                      StringField69 = t.StringField69,
                                      StringField70 = t.StringField70,
                                      StringField71 = t.StringField71,
                                      StringField72 = t.StringField72,
                                      StringField73 = t.StringField73,
                                      StringField74 = t.StringField74,
                                      StringField75 = t.StringField75,
                                      StringField76 = t.StringField76,
                                      StringField77 = t.StringField77,
                                      StringField78 = t.StringField78,
                                      StringField79 = t.StringField79,
                                      StringField80 = t.StringField80,
                                      StringField81 = t.StringField81,
                                      StringField82 = t.StringField82,
                                      StringField83 = t.StringField83,
                                      StringField84 = t.StringField84,
                                      StringField85 = t.StringField85,
                                      StringField86 = t.StringField86,
                                      StringField87 = t.StringField87,
                                      StringField88 = t.StringField88,
                                      StringField89 = t.StringField89,
                                      StringField90 = t.StringField90,
                                      StringField91 = t.StringField91,
                                      StringField92 = t.StringField92,
                                      StringField93 = t.StringField93,
                                      StringField94 = t.StringField94,
                                      StringField95 = t.StringField95,
                                      StringField96 = t.StringField96,
                                      StringField97 = t.StringField97,
                                      StringField98 = t.StringField98,
                                      StringField99 = t.StringField99,
                                      StringField100 = t.StringField100,
                                      StringField101 = t.StringField101,
                                      StringField102 = t.StringField102,
                                      StringField103 = t.StringField103,
                                      StringField104 = t.StringField104,
                                      StringField105 = t.StringField105,
                                      StringField106 = t.StringField106,
                                      StringField107 = t.StringField107,
                                      StringField108 = t.StringField108,
                                      StringField109 = t.StringField109,
                                      StringField110 = t.StringField110,
                                      StringField111 = t.StringField111,
                                      StringField112 = t.StringField112,
                                      StringField113 = t.StringField113,
                                      StringField114 = t.StringField114,
                                      StringField115 = t.StringField115,
                                      StringField116 = t.StringField116,
                                      StringField117 = t.StringField117,
                                      StringField118 = t.StringField118,
                                      StringField119 = t.StringField119,
                                      StringField120 = t.StringField120,
                                      StringField121 = t.StringField121,
                                      StringField122 = t.StringField122,
                                      StringField123 = t.StringField123,
                                      StringField124 = t.StringField124,
                                      StringField125 = t.StringField125,
                                      StringField126 = t.StringField126,
                                      StringField127 = t.StringField127,
                                      StringField128 = t.StringField128,
                                      StringField129 = t.StringField129,
                                      StringField130 = t.StringField130,
                                      StringField131 = t.StringField131,
                                      StringField132 = t.StringField132,
                                      StringField133 = t.StringField133,
                                      StringField134 = t.StringField134,
                                      StringField135 = t.StringField135,
                                      StringField136 = t.StringField136,
                                      StringField137 = t.StringField137,
                                      StringField138 = t.StringField138,
                                      StringField139 = t.StringField139,
                                      StringField140 = t.StringField140,
                                      StringField141 = t.StringField141,
                                      StringField142 = t.StringField142,
                                      StringField143 = t.StringField143,
                                      StringField144 = t.StringField144,
                                      StringField145 = t.StringField145,
                                      StringField146 = t.StringField146,
                                      StringField147 = t.StringField147,
                                      StringField148 = t.StringField148,
                                      StringField149 = t.StringField149,
                                      StringField150 = t.StringField150,
                                      StringField151 = t.StringField151,
                                      StringField152 = t.StringField152,
                                      StringField153 = t.StringField153,
                                      StringField154 = t.StringField154,
                                      StringField155 = t.StringField155,
                                      StringField156 = t.StringField156,
                                      StringField157 = t.StringField157,
                                      StringField158 = t.StringField158,
                                      StringField159 = t.StringField159,
                                      StringField160 = t.StringField160,
                                      StringField161 = t.StringField161,
                                      StringField162 = t.StringField162,
                                      StringField163 = t.StringField163,
                                      StringField164 = t.StringField164,
                                      StringField165 = t.StringField165,
                                      StringField166 = t.StringField166,
                                      StringField167 = t.StringField167,
                                      StringField168 = t.StringField168,
                                      StringField169 = t.StringField169,
                                      StringField170 = t.StringField170,
                                      StringField171 = t.StringField171,
                                      StringField172 = t.StringField172,
                                      StringField173 = t.StringField173,
                                      StringField174 = t.StringField174,
                                      StringField175 = t.StringField175,
                                      StringField176 = t.StringField176,
                                      StringField177 = t.StringField177,
                                      StringField178 = t.StringField178,
                                      StringField179 = t.StringField179,
                                      StringField180 = t.StringField180,
                                      StringField181 = t.StringField181,
                                      StringField182 = t.StringField182,
                                      StringField183 = t.StringField183,
                                      StringField184 = t.StringField184,
                                      StringField185 = t.StringField185,
                                      StringField186 = t.StringField186,
                                      StringField187 = t.StringField187,
                                      StringField188 = t.StringField188,
                                      StringField189 = t.StringField189,
                                      StringField190 = t.StringField190,
                                      StringField191 = t.StringField191,
                                      StringField192 = t.StringField192,
                                      StringField193 = t.StringField193,
                                      StringField194 = t.StringField194,
                                      StringField195 = t.StringField195,
                                      StringField196 = t.StringField196,
                                      StringField197 = t.StringField197,
                                      StringField198 = t.StringField198,
                                      StringField199 = t.StringField199,
                                      StringField200 = t.StringField200
                                  }).OrderBy(o => o.StatusCode)
                                        .ThenByDescending(o => o.CreationDate)
                                        .ThenByDescending(o => o.UpdateDate)
                                        .ThenByDescending(o => o.TransactionId)
                                        .ThenByDescending(o => o.JOB_ID);

                    //.Skip(pageSize * (pageNumber - 1)).Take(pageSize);
                    var sql = result.ToString();
                    if (viewData == "ShowCompletedTransactions")
                        result = (IOrderedQueryable<TransactionsResponseModel>)result.Where(t => t.StatusCode == "C");
                    else if (viewData == "ShowPendingTransactions")
                        result = (IOrderedQueryable<TransactionsResponseModel>)result.Where(t => t.StatusCode != "C");
                    if (accountType == "U")
                        result = (IOrderedQueryable<TransactionsResponseModel>)result.Where(t => t.UserName == email);
                    return result.ToList();
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public IEnumerable<TransactionV2Response> GetDataBySiteAccess(string email, List<int> acl, int pageSize, string viewData, string accountType, int lastDayProductionDate = 90)
        {
            //var allData = false;
            var allData = true;

            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;
                    DateTime searchDateRange = DateTime.Today.AddDays(lastDayProductionDate * -1);
                    if (allData)
                    {
                        searchDateRange = DateTime.Parse("2000-01-01");
                    }
                    DateTime today = DateTime.Today.AddDays(7);
                    var result = (from t in dbContext.Transactions
                                  join a in dbContext.ServiceAreas on t.svcID equals a.svcID
                                  join b in dbContext.locations on t.locID equals b.locID
                                  join c in dbContext.sites on t.siteID equals c.siteID
                                  join d in dbContext.Clients on t.accountID equals d.clientID
                                  where
                                  acl.Contains(t.accountID) &&
                                  (t.tDate >= searchDateRange && t.tDate <= today) //&&
                                  //(t.StatusCode == "U" || t.StatusCode == null)   //NOT DELETED FLAG
                                  //(t.StatusCode == "U" || t.StatusCode == null || t.StatusCode == "")   //NOT DELETED FLAG
                                  //&& t.userName == email //filter by user
                                  select new TransactionV2Response
                                  {
                                      ProductionDate = t.tDate,
                                      AccountName = d.clientName,
                                      SiteName = c.siteName,
                                      LocationName = b.locName,
                                      ServiceAreaName = a.svcName,
                                      UserName = t.userName,
                                      TransactionId = t.tID,
                                      AccountId = t.accountID,
                                      SiteId = t.siteID,
                                      LocationId = t.locID,
                                      ServiceAreaId = t.svcID,
                                      CreationDate = t.CreationDate,
                                      UpdateDate = t.UpdateDate,
                                      Remarks = t.Remarks,
                                      JOB_ID = t.JOB_ID,
                                      StatusCode = t.StatusCode
                                  }).OrderBy(o => o.StatusCode)
                                  .ThenByDescending(o => o.CreationDate)
                                  .ThenByDescending(o => o.UpdateDate)
                                  .ThenByDescending(o => o.TransactionId)
                                  .ThenByDescending(o => o.JOB_ID);
                    var sql = result.ToString();
                    if (viewData == "ShowCompletedTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.StatusCode == "C");
                    else if (viewData == "ShowPendingTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.StatusCode != "C");
                    else if (viewData == "ShowUploadedTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.Remarks.Contains("UPLOAD"));
                    //if (accountType == "U")
                    //    result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.UserName == email);
                    return result.ToList();
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public IEnumerable<TransactionV2Response> GetDataBySiteAccess(string email, List<int> acl, int pageSize, string viewData, string accountType, int clientId, int lastDayProductionDate = 90)
        {
            //var allData = false;
            var allData = true;

            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;
                    DateTime searchDateRange = DateTime.Today.AddDays(lastDayProductionDate * -1);
                    if (allData)
                    {
                        searchDateRange = DateTime.Parse("2000-01-01");
                    }
                    DateTime today = DateTime.Today.AddDays(7);
                    var result = (from t in dbContext.Transactions
                                  join a in dbContext.ServiceAreas on t.svcID equals a.svcID
                                  join b in dbContext.locations on t.locID equals b.locID
                                  join c in dbContext.sites on t.siteID equals c.siteID
                                  join d in dbContext.Clients on t.accountID equals d.clientID
                                  where
                                  acl.Contains(t.accountID) && t.accountID == clientId && 
                                  (t.tDate >= searchDateRange && t.tDate <= today) //&&
                                  //(t.StatusCode == "U" || t.StatusCode == null)   //NOT DELETED FLAG
                                  //(t.StatusCode == "U" || t.StatusCode == null || t.StatusCode == "")   //NOT DELETED FLAG
                                  //&& t.userName == email //filter by user
                                  select new TransactionV2Response
                                  {
                                      ProductionDate = t.tDate,
                                      AccountName = d.clientName,
                                      SiteName = c.siteName,
                                      LocationName = b.locName,
                                      ServiceAreaName = a.svcName,
                                      UserName = t.userName,
                                      TransactionId = t.tID,
                                      AccountId = t.accountID,
                                      SiteId = t.siteID,
                                      LocationId = t.locID,
                                      ServiceAreaId = t.svcID,
                                      CreationDate = t.CreationDate,
                                      UpdateDate = t.UpdateDate,
                                      Remarks = t.Remarks,
                                      JOB_ID = t.JOB_ID,
                                      StatusCode = t.StatusCode
                                  }).OrderBy(o => o.StatusCode)
                                  .ThenByDescending(o => o.CreationDate)
                                  .ThenByDescending(o => o.UpdateDate)
                                  .ThenByDescending(o => o.TransactionId)
                                  .ThenByDescending(o => o.JOB_ID);
                    var sql = result.ToString();
                    if (viewData == "ShowCompletedTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.StatusCode == "C");
                    else if (viewData == "ShowPendingTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.StatusCode != "C");
                    else if (viewData == "ShowUploadedTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.Remarks.Contains("UPLOAD"));
                    //if (accountType == "U")
                    //    result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.UserName == email);
                    return result.ToList();
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public IEnumerable<TransactionV2Response> GetDataByServiceArea(string date, string viewData, string userName, string accountType, int serviceAreaId, int lastDayProductionDate = 90)
        {
            var allData = true;

            if (string.IsNullOrEmpty(date) || date.Contains("undefined"))
                date = DateTime.Today.ToShortDateString();
            else
            {
                var tDate = date.Split('/');
                date = tDate[2] + "-" + tDate[0] + "-" + tDate[1];  //YYYY-MM-DD
            }

            var tmpStartDate = DateTime.Parse(date);
            var tmpEndDate = DateTime.Parse(date).AddMonths(1);

            var startDate = DateTime.Parse(tmpStartDate.Year + "-" + tmpStartDate.Month + "-01");
            if (allData)
            {
                startDate = DateTime.Parse("2000-01-01");
            }
            var endDate = DateTime.Parse(tmpEndDate.Year + "-" + tmpEndDate.Month + "-01");

            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    dbContext.Configuration.LazyLoadingEnabled = false;
                    DateTime searchDateRange = DateTime.Today.AddDays(lastDayProductionDate * -1);
                    if (allData)
                    {
                        searchDateRange = DateTime.Parse("2000-01-01");
                    }
                    DateTime today = DateTime.Today.AddDays(7);
                    var result = (from t in dbContext.Transactions
                                  join a in dbContext.ServiceAreas on t.svcID equals a.svcID
                                  join b in dbContext.locations on t.locID equals b.locID
                                  join c in dbContext.sites on t.siteID equals c.siteID
                                  join d in dbContext.Clients on t.accountID equals d.clientID
                                  where 1 == 1 &&
                                  //t.tID == 163 &&
                                  t.svcID == serviceAreaId &&
                                  ((t.tDate >= searchDateRange && t.tDate <= today && t.StatusCode != "C") ||
                                  //t.StatusCode != "C"   //status is not completed 
                                  ((t.StatusCode == "U" || t.StatusCode == null || t.StatusCode == "" || t.StatusCode == "C")))   //NOT DELETED FLAG
                                  //&& (t.tDate >= startDate && t.tDate < endDate)))    //GET DATA WITHIN THE MONTH OF CURRENT SELECTED PROD-DATE
                                  //&& t.userName == userName //filter by user
                                  select new TransactionV2Response
                                  {
                                      ProductionDate = t.tDate,
                                      AccountName = d.clientName,
                                      SiteName = c.siteName,
                                      LocationName = b.locName,
                                      ServiceAreaName = a.svcName,
                                      UserName = t.userName,
                                      TransactionId = t.tID,
                                      AccountId = t.accountID,
                                      SiteId = t.siteID,
                                      LocationId = t.locID,
                                      ServiceAreaId = t.svcID,
                                      CreationDate = t.CreationDate,
                                      UpdateDate = t.UpdateDate,
                                      Remarks = t.Remarks,
                                      JOB_ID = t.JOB_ID,
                                      StatusCode = t.StatusCode
                                  }).OrderBy(o => o.StatusCode)
                                  .ThenByDescending(o => o.CreationDate)
                                  .ThenByDescending(o => o.UpdateDate)
                                  .ThenByDescending(o => o.TransactionId)
                                  .ThenByDescending(o => o.JOB_ID);
                    var sql = result.ToString();
                    if (viewData == "ShowCompletedTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.StatusCode == "C");
                    else if (viewData == "ShowPendingTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.StatusCode != "C");
                    else if (viewData == "ShowUploadedTransactions")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.Remarks.Contains("UPLOAD"));
                    if (accountType == "U")
                        result = (IOrderedQueryable<TransactionV2Response>)result.Where(t => t.UserName == userName);
                    return result.ToList();
                }
                catch (Exception e)
                {
                    //throw new InvalidOperationException(e.Message, e);
                    return new List<TransactionV2Response>();
                }
            }
        }

        public IEnumerable<TransactionsResponseModel> GetDataByServiceAreaBySiteAccess(string email, string date, string accountType, int serviceAreaId, string viewData, int lastDayProductionDate = 90)
        {
            var allData = true;
            //var allData = false;

            if (string.IsNullOrEmpty(date) || date.Contains("undefined"))
                date = DateTime.Today.ToShortDateString();
            else
            {
                var tDate = date.Split('/');
                date = tDate[2] + "-" + tDate[0] + "-" + tDate[1];  //YYYY-MM-DD
            }

            var tmpStartDate = DateTime.Parse(date);
            var tmpEndDate = DateTime.Parse(date).AddMonths(1);

            var startDate = DateTime.Parse(tmpStartDate.Year + "-" + tmpStartDate.Month + "-01");
            if (allData)
            {
                startDate = DateTime.Parse("2000-01-01");
            }
            var endDate = DateTime.Parse(tmpEndDate.Year + "-" + tmpEndDate.Month + "-01");

            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;
                try
                {
                    DateTime searchDateRange = DateTime.Today.AddDays(lastDayProductionDate * -1);
                    if (allData)
                    {
                        searchDateRange = DateTime.Parse("2000-01-01");
                    }
                    DateTime today = DateTime.Today.AddDays(7);
                    var result = (from t in dbContext.Transactions
                                  join a in dbContext.ServiceAreas on t.svcID equals a.svcID
                                  join b in dbContext.locations on t.locID equals b.locID
                                  join c in dbContext.sites on t.siteID equals c.siteID
                                  join d in dbContext.Clients on t.accountID equals d.clientID
                                  where 1 == 1 &&
                                  //t.tID == 163 &&
                                  t.svcID == serviceAreaId &&
                                  ((t.tDate >= searchDateRange && t.tDate <= today && t.StatusCode != "C") ||
                                  //t.StatusCode != "C"   //status is not completed 
                                  ((t.StatusCode == "U" || t.StatusCode == null || t.StatusCode == "" || t.StatusCode == "C")))   //NOT DELETED FLAG
                                  //&& (t.tDate >= startDate && t.tDate < endDate)))    //GET DATA WITHIN THE MONTH OF CURRENT SELECTED PROD-DATE
                                  //&& t.userName == email //filter by user
                                  select new TransactionsResponseModel
                                  {
                                      ProductionDate = t.tDate,
                                      TransactionId = t.tID,
                                      AccountId = t.accountID,
                                      SiteId = t.siteID,
                                      LocationId = t.locID,
                                      ServiceAreaId = t.svcID,
                                      AccountName = d.clientName,
                                      SiteName = c.siteName,
                                      LocationName = b.locName,
                                      ServiceAreaName = a.svcName,
                                      JOB_ID = t.JOB_ID,
                                      Remarks = t.Remarks,
                                      StatusCode = t.StatusCode,
                                      UpdateUserID = t.UpdateUserID,
                                      CreationDate = t.CreationDate,
                                      UpdateDate = t.UpdateDate,
                                      UserName = t.userName,
                                      field1 = t.field1,
                                      field2 = t.field2,
                                      field3 = t.field3,
                                      field4 = t.field4,
                                      field5 = t.field5,
                                      field6 = t.field6,
                                      field7 = t.field7,
                                      field8 = t.field8,
                                      field9 = t.field9,
                                      field10 = t.field10,
                                      field11 = t.field11,
                                      field12 = t.field12,
                                      field13 = t.field13,
                                      field14 = t.field14,
                                      field15 = t.field15,
                                      field16 = t.field16,
                                      field17 = t.field17,
                                      field18 = t.field18,
                                      field19 = t.field19,
                                      field20 = t.field20,
                                      field21 = t.field21,
                                      field22 = t.field22,
                                      field23 = t.field23,
                                      field24 = t.field24,
                                      field25 = t.field25,
                                      field26 = t.field26,
                                      field27 = t.field27,
                                      field28 = t.field28,
                                      field29 = t.field29,
                                      field30 = t.field30,
                                      field31 = t.field31,
                                      field32 = t.field32,
                                      field33 = t.field33,
                                      field34 = t.field34,
                                      field35 = t.field35,
                                      field36 = t.field36,
                                      field37 = t.field37,
                                      field38 = t.field38,
                                      field39 = t.field39,
                                      field40 = t.field40,
                                      field41 = t.field41,
                                      field42 = t.field42,
                                      field43 = t.field43,
                                      field44 = t.field44,
                                      field45 = t.field45,
                                      field46 = t.field46,
                                      field47 = t.field47,
                                      field48 = t.field48,
                                      field49 = t.field49,
                                      field50 = t.field50,
                                      field51 = t.field51,
                                      field52 = t.field52,
                                      field53 = t.field53,
                                      field54 = t.field54,
                                      field55 = t.field55,
                                      field56 = t.field56,
                                      field57 = t.field57,
                                      field58 = t.field58,
                                      field59 = t.field59,
                                      field60 = t.field60,
                                      field61 = t.field61,
                                      field62 = t.field62,
                                      field63 = t.field63,
                                      field64 = t.field64,
                                      field65 = t.field65,
                                      field66 = t.field66,
                                      field67 = t.field67,
                                      field68 = t.field68,
                                      field69 = t.field69,
                                      field70 = t.field70,
                                      field71 = t.field71,
                                      field72 = t.field72,
                                      field73 = t.field73,
                                      field74 = t.field74,
                                      field75 = t.field75,
                                      field76 = t.field76,
                                      field77 = t.field77,
                                      field78 = t.field78,
                                      field79 = t.field79,
                                      field80 = t.field80,
                                      field81 = t.field81,
                                      field82 = t.field82,
                                      field83 = t.field83,
                                      field84 = t.field84,
                                      field85 = t.field85,
                                      field86 = t.field86,
                                      field87 = t.field87,
                                      field88 = t.field88,
                                      field89 = t.field89,
                                      field90 = t.field90,
                                      field91 = t.field91,
                                      field92 = t.field92,
                                      field93 = t.field93,
                                      field94 = t.field94,
                                      field95 = t.field95,
                                      field96 = t.field96,
                                      field97 = t.field97,
                                      field98 = t.field98,
                                      field99 = t.field99,
                                      field100 = t.field100,
                                      field101 = t.field101,
                                      field102 = t.field102,
                                      field103 = t.field103,
                                      field104 = t.field104,
                                      field105 = t.field105,
                                      field106 = t.field106,
                                      field107 = t.field107,
                                      field108 = t.field108,
                                      field109 = t.field109,
                                      field110 = t.field110,
                                      field111 = t.field111,
                                      field112 = t.field112,
                                      field113 = t.field113,
                                      field114 = t.field114,
                                      field115 = t.field115,
                                      field116 = t.field116,
                                      field117 = t.field117,
                                      field118 = t.field118,
                                      field119 = t.field119,
                                      field120 = t.field120,
                                      field121 = t.field121,
                                      field122 = t.field122,
                                      field123 = t.field123,
                                      field124 = t.field124,
                                      field125 = t.field125,
                                      field126 = t.field126,
                                      field127 = t.field127,
                                      field128 = t.field128,
                                      field129 = t.field129,
                                      field130 = t.field130,
                                      field131 = t.field131,
                                      field132 = t.field132,
                                      field133 = t.field133,
                                      field134 = t.field134,
                                      field135 = t.field135,
                                      field136 = t.field136,
                                      field137 = t.field137,
                                      field138 = t.field138,
                                      field139 = t.field139,
                                      field140 = t.field140,
                                      field141 = t.field141,
                                      field142 = t.field142,
                                      field143 = t.field143,
                                      field144 = t.field144,
                                      field145 = t.field145,
                                      field146 = t.field146,
                                      field147 = t.field147,
                                      field148 = t.field148,
                                      field149 = t.field149,
                                      field150 = t.field150,
                                      field151 = t.field151,
                                      field152 = t.field152,
                                      field153 = t.field153,
                                      field154 = t.field154,
                                      field155 = t.field155,
                                      field156 = t.field156,
                                      field157 = t.field157,
                                      field158 = t.field158,
                                      field159 = t.field159,
                                      field160 = t.field160,
                                      field161 = t.field161,
                                      field162 = t.field162,
                                      field163 = t.field163,
                                      field164 = t.field164,
                                      field165 = t.field165,
                                      field166 = t.field166,
                                      field167 = t.field167,
                                      field168 = t.field168,
                                      field169 = t.field169,
                                      field170 = t.field170,
                                      field171 = t.field171,
                                      field172 = t.field172,
                                      field173 = t.field173,
                                      field174 = t.field174,
                                      field175 = t.field175,
                                      field176 = t.field176,
                                      field177 = t.field177,
                                      field178 = t.field178,
                                      field179 = t.field179,
                                      field180 = t.field180,
                                      field181 = t.field181,
                                      field182 = t.field182,
                                      field183 = t.field183,
                                      field184 = t.field184,
                                      field185 = t.field185,
                                      field186 = t.field186,
                                      field187 = t.field187,
                                      field188 = t.field188,
                                      field189 = t.field189,
                                      field190 = t.field190,
                                      field191 = t.field191,
                                      field192 = t.field192,
                                      field193 = t.field193,
                                      field194 = t.field194,
                                      field195 = t.field195,
                                      field196 = t.field196,
                                      field197 = t.field197,
                                      field198 = t.field198,
                                      field199 = t.field199,
                                      field200 = t.field200,
                                      StringField1 = t.StringField1,
                                      StringField2 = t.StringField2,
                                      StringField3 = t.StringField3,
                                      StringField4 = t.StringField4,
                                      StringField5 = t.StringField5,
                                      StringField6 = t.StringField6,
                                      StringField7 = t.StringField7,
                                      StringField8 = t.StringField8,
                                      StringField9 = t.StringField9,
                                      StringField10 = t.StringField10,
                                      StringField11 = t.StringField11,
                                      StringField12 = t.StringField12,
                                      StringField13 = t.StringField13,
                                      StringField14 = t.StringField14,
                                      StringField15 = t.StringField15,
                                      StringField16 = t.StringField16,
                                      StringField17 = t.StringField17,
                                      StringField18 = t.StringField18,
                                      StringField19 = t.StringField19,
                                      StringField20 = t.StringField20,
                                      StringField21 = t.StringField21,
                                      StringField22 = t.StringField22,
                                      StringField23 = t.StringField23,
                                      StringField24 = t.StringField24,
                                      StringField25 = t.StringField25,
                                      StringField26 = t.StringField26,
                                      StringField27 = t.StringField27,
                                      StringField28 = t.StringField28,
                                      StringField29 = t.StringField29,
                                      StringField30 = t.StringField30,
                                      StringField31 = t.StringField31,
                                      StringField32 = t.StringField32,
                                      StringField33 = t.StringField33,
                                      StringField34 = t.StringField34,
                                      StringField35 = t.StringField35,
                                      StringField36 = t.StringField36,
                                      StringField37 = t.StringField37,
                                      StringField38 = t.StringField38,
                                      StringField39 = t.StringField39,
                                      StringField40 = t.StringField40,
                                      StringField41 = t.StringField41,
                                      StringField42 = t.StringField42,
                                      StringField43 = t.StringField43,
                                      StringField44 = t.StringField44,
                                      StringField45 = t.StringField45,
                                      StringField46 = t.StringField46,
                                      StringField47 = t.StringField47,
                                      StringField48 = t.StringField48,
                                      StringField49 = t.StringField49,
                                      StringField50 = t.StringField50,
                                      StringField51 = t.StringField51,
                                      StringField52 = t.StringField52,
                                      StringField53 = t.StringField53,
                                      StringField54 = t.StringField54,
                                      StringField55 = t.StringField55,
                                      StringField56 = t.StringField56,
                                      StringField57 = t.StringField57,
                                      StringField58 = t.StringField58,
                                      StringField59 = t.StringField59,
                                      StringField60 = t.StringField60,
                                      StringField61 = t.StringField61,
                                      StringField62 = t.StringField62,
                                      StringField63 = t.StringField63,
                                      StringField64 = t.StringField64,
                                      StringField65 = t.StringField65,
                                      StringField66 = t.StringField66,
                                      StringField67 = t.StringField67,
                                      StringField68 = t.StringField68,
                                      StringField69 = t.StringField69,
                                      StringField70 = t.StringField70,
                                      StringField71 = t.StringField71,
                                      StringField72 = t.StringField72,
                                      StringField73 = t.StringField73,
                                      StringField74 = t.StringField74,
                                      StringField75 = t.StringField75,
                                      StringField76 = t.StringField76,
                                      StringField77 = t.StringField77,
                                      StringField78 = t.StringField78,
                                      StringField79 = t.StringField79,
                                      StringField80 = t.StringField80,
                                      StringField81 = t.StringField81,
                                      StringField82 = t.StringField82,
                                      StringField83 = t.StringField83,
                                      StringField84 = t.StringField84,
                                      StringField85 = t.StringField85,
                                      StringField86 = t.StringField86,
                                      StringField87 = t.StringField87,
                                      StringField88 = t.StringField88,
                                      StringField89 = t.StringField89,
                                      StringField90 = t.StringField90,
                                      StringField91 = t.StringField91,
                                      StringField92 = t.StringField92,
                                      StringField93 = t.StringField93,
                                      StringField94 = t.StringField94,
                                      StringField95 = t.StringField95,
                                      StringField96 = t.StringField96,
                                      StringField97 = t.StringField97,
                                      StringField98 = t.StringField98,
                                      StringField99 = t.StringField99,
                                      StringField100 = t.StringField100,
                                      StringField101 = t.StringField101,
                                      StringField102 = t.StringField102,
                                      StringField103 = t.StringField103,
                                      StringField104 = t.StringField104,
                                      StringField105 = t.StringField105,
                                      StringField106 = t.StringField106,
                                      StringField107 = t.StringField107,
                                      StringField108 = t.StringField108,
                                      StringField109 = t.StringField109,
                                      StringField110 = t.StringField110,
                                      StringField111 = t.StringField111,
                                      StringField112 = t.StringField112,
                                      StringField113 = t.StringField113,
                                      StringField114 = t.StringField114,
                                      StringField115 = t.StringField115,
                                      StringField116 = t.StringField116,
                                      StringField117 = t.StringField117,
                                      StringField118 = t.StringField118,
                                      StringField119 = t.StringField119,
                                      StringField120 = t.StringField120,
                                      StringField121 = t.StringField121,
                                      StringField122 = t.StringField122,
                                      StringField123 = t.StringField123,
                                      StringField124 = t.StringField124,
                                      StringField125 = t.StringField125,
                                      StringField126 = t.StringField126,
                                      StringField127 = t.StringField127,
                                      StringField128 = t.StringField128,
                                      StringField129 = t.StringField129,
                                      StringField130 = t.StringField130,
                                      StringField131 = t.StringField131,
                                      StringField132 = t.StringField132,
                                      StringField133 = t.StringField133,
                                      StringField134 = t.StringField134,
                                      StringField135 = t.StringField135,
                                      StringField136 = t.StringField136,
                                      StringField137 = t.StringField137,
                                      StringField138 = t.StringField138,
                                      StringField139 = t.StringField139,
                                      StringField140 = t.StringField140,
                                      StringField141 = t.StringField141,
                                      StringField142 = t.StringField142,
                                      StringField143 = t.StringField143,
                                      StringField144 = t.StringField144,
                                      StringField145 = t.StringField145,
                                      StringField146 = t.StringField146,
                                      StringField147 = t.StringField147,
                                      StringField148 = t.StringField148,
                                      StringField149 = t.StringField149,
                                      StringField150 = t.StringField150,
                                      StringField151 = t.StringField151,
                                      StringField152 = t.StringField152,
                                      StringField153 = t.StringField153,
                                      StringField154 = t.StringField154,
                                      StringField155 = t.StringField155,
                                      StringField156 = t.StringField156,
                                      StringField157 = t.StringField157,
                                      StringField158 = t.StringField158,
                                      StringField159 = t.StringField159,
                                      StringField160 = t.StringField160,
                                      StringField161 = t.StringField161,
                                      StringField162 = t.StringField162,
                                      StringField163 = t.StringField163,
                                      StringField164 = t.StringField164,
                                      StringField165 = t.StringField165,
                                      StringField166 = t.StringField166,
                                      StringField167 = t.StringField167,
                                      StringField168 = t.StringField168,
                                      StringField169 = t.StringField169,
                                      StringField170 = t.StringField170,
                                      StringField171 = t.StringField171,
                                      StringField172 = t.StringField172,
                                      StringField173 = t.StringField173,
                                      StringField174 = t.StringField174,
                                      StringField175 = t.StringField175,
                                      StringField176 = t.StringField176,
                                      StringField177 = t.StringField177,
                                      StringField178 = t.StringField178,
                                      StringField179 = t.StringField179,
                                      StringField180 = t.StringField180,
                                      StringField181 = t.StringField181,
                                      StringField182 = t.StringField182,
                                      StringField183 = t.StringField183,
                                      StringField184 = t.StringField184,
                                      StringField185 = t.StringField185,
                                      StringField186 = t.StringField186,
                                      StringField187 = t.StringField187,
                                      StringField188 = t.StringField188,
                                      StringField189 = t.StringField189,
                                      StringField190 = t.StringField190,
                                      StringField191 = t.StringField191,
                                      StringField192 = t.StringField192,
                                      StringField193 = t.StringField193,
                                      StringField194 = t.StringField194,
                                      StringField195 = t.StringField195,
                                      StringField196 = t.StringField196,
                                      StringField197 = t.StringField197,
                                      StringField198 = t.StringField198,
                                      StringField199 = t.StringField199,
                                      StringField200 = t.StringField200
                                  }).OrderBy(o => o.StatusCode)
                                        .ThenByDescending(o => o.CreationDate)
                                        .ThenByDescending(o => o.UpdateDate)
                                        .ThenByDescending(o => o.TransactionId)
                                        .ThenByDescending(o => o.JOB_ID);
                    var sql = result.ToString();
                    if (viewData == "ShowCompletedTransactions")
                        result = (IOrderedQueryable<TransactionsResponseModel>)result.Where(t => t.StatusCode == "C");
                    else if (viewData == "ShowPendingTransactions")
                        result = (IOrderedQueryable<TransactionsResponseModel>)result.Where(t => t.StatusCode != "C");
                    else if (viewData == "ShowUploadedTransactions")
                        result = (IOrderedQueryable<TransactionsResponseModel>)result.Where(t => t.Remarks.Contains("UPLOAD"));
                    if (accountType == "U")
                        result = (IOrderedQueryable<TransactionsResponseModel>)result.Where(t => t.UserName == email);
                    return result.ToList();

                }
                catch (Exception e)
                {
                    //throw new InvalidOperationException(e.Message, e);
                    return new List<TransactionsResponseModel>();
                }
            }
        }
        public IEnumerable<TransactionV2Response> SearchDataBySiteAccess(int userId, string searchText, int pageSize = 20, int pageNumber = 0, int lastDayProductionDate = 90)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;
                try
                {
                    var svcId = 0;
                    var result = dbContext.Database.SqlQuery<TransactionV2Response>("EXEC sp_SearchTransactions @userId, @svcId, @searchText, @pageNumber, @pageItems, @searchInDays"
                        , new SqlParameter("@userId", userId)
                        , new SqlParameter("@svcId", svcId)
                        , new SqlParameter("@searchText", searchText)
                        , new SqlParameter("@pageNumber", pageNumber)
                        , new SqlParameter("@pageItems", pageSize)
                        , new SqlParameter("@searchInDays", lastDayProductionDate));
                    return result.ToList();
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public IEnumerable<TransactionsResponseModel> SearchDataBySiteAccess(int userId, string searchText, int svcId, int pageSize = 20, int pageNumber = 0, int lastDayProductionDate = 90)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;
                try
                {
                    var result = dbContext.Database.SqlQuery<TransactionsResponseModel>("EXEC sp_SearchTransactions @userId, @svcId, @searchText, @pageNumber, @pageItems, @searchInDays"
                        , new SqlParameter("@userId", userId)
                        , new SqlParameter("@svcId", svcId)
                        , new SqlParameter("@searchText", searchText)
                        , new SqlParameter("@pageNumber", pageNumber)
                        , new SqlParameter("@pageItems", pageSize)
                        , new SqlParameter("@searchInDays", lastDayProductionDate));
                    return result.ToList();
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }
        public static int GetLatestTransactionId()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var result = dbContext.Database.SqlQuery<int>("select max(Transactions.tID) from Transactions").FirstOrDefault();
                    return result;
                }
                catch (Exception e)
                {
                    //throw new InvalidOperationException(e.Message, e);
                    return 0;
                }
            }
        }
        public static void UpdateConfigAppSettings(Dictionary<string, string> dictAppSettings)
        {
            var config = WebConfigurationManager.OpenWebConfiguration("~");
            foreach (string key in dictAppSettings.Keys)
            {
                var newValue = dictAppSettings[key];
                var oldValue = config.AppSettings.Settings[key].Value;
                if (oldValue != newValue)
                {
                    config.AppSettings.Settings[key].Value = newValue;
                    config.Save(ConfigurationSaveMode.Modified);
                }
            }
            //WebConfigurationManager.RefreshSection("appSettings");
        }

        public IEnumerable<TransactionsResponseModel> GetTransactionDataById(int tranId)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                dbContext.Configuration.LazyLoadingEnabled = false;
                try
                {
                    var result = (from t in dbContext.Transactions
                                  join a in dbContext.ServiceAreas on t.svcID equals a.svcID
                                  join b in dbContext.locations on t.locID equals b.locID
                                  join c in dbContext.sites on t.siteID equals c.siteID
                                  join d in dbContext.Clients on t.accountID equals d.clientID
                                  where 1 == 1 &&
                                  t.tID == tranId
                                  select new TransactionsResponseModel
                                  {
                                      ProductionDate = t.tDate,
                                      TransactionId = t.tID,
                                      AccountId = t.accountID,
                                      SiteId = t.siteID,
                                      LocationId = t.locID,
                                      ServiceAreaId = t.svcID,
                                      AccountName = d.clientName,
                                      SiteName = c.siteName,
                                      LocationName = b.locName,
                                      ServiceAreaName = a.svcName,
                                      JOB_ID = t.JOB_ID,
                                      Remarks = t.Remarks,
                                      StatusCode = t.StatusCode,
                                      UpdateUserID = t.UpdateUserID,
                                      CreationDate = t.CreationDate,
                                      UpdateDate = t.UpdateDate,
                                      UserName = t.userName,
                                      field1 = t.field1,
                                      field2 = t.field2,
                                      field3 = t.field3,
                                      field4 = t.field4,
                                      field5 = t.field5,
                                      field6 = t.field6,
                                      field7 = t.field7,
                                      field8 = t.field8,
                                      field9 = t.field9,
                                      field10 = t.field10,
                                      field11 = t.field11,
                                      field12 = t.field12,
                                      field13 = t.field13,
                                      field14 = t.field14,
                                      field15 = t.field15,
                                      field16 = t.field16,
                                      field17 = t.field17,
                                      field18 = t.field18,
                                      field19 = t.field19,
                                      field20 = t.field20,
                                      field21 = t.field21,
                                      field22 = t.field22,
                                      field23 = t.field23,
                                      field24 = t.field24,
                                      field25 = t.field25,
                                      field26 = t.field26,
                                      field27 = t.field27,
                                      field28 = t.field28,
                                      field29 = t.field29,
                                      field30 = t.field30,
                                      field31 = t.field31,
                                      field32 = t.field32,
                                      field33 = t.field33,
                                      field34 = t.field34,
                                      field35 = t.field35,
                                      field36 = t.field36,
                                      field37 = t.field37,
                                      field38 = t.field38,
                                      field39 = t.field39,
                                      field40 = t.field40,
                                      field41 = t.field41,
                                      field42 = t.field42,
                                      field43 = t.field43,
                                      field44 = t.field44,
                                      field45 = t.field45,
                                      field46 = t.field46,
                                      field47 = t.field47,
                                      field48 = t.field48,
                                      field49 = t.field49,
                                      field50 = t.field50,
                                      field51 = t.field51,
                                      field52 = t.field52,
                                      field53 = t.field53,
                                      field54 = t.field54,
                                      field55 = t.field55,
                                      field56 = t.field56,
                                      field57 = t.field57,
                                      field58 = t.field58,
                                      field59 = t.field59,
                                      field60 = t.field60,
                                      field61 = t.field61,
                                      field62 = t.field62,
                                      field63 = t.field63,
                                      field64 = t.field64,
                                      field65 = t.field65,
                                      field66 = t.field66,
                                      field67 = t.field67,
                                      field68 = t.field68,
                                      field69 = t.field69,
                                      field70 = t.field70,
                                      field71 = t.field71,
                                      field72 = t.field72,
                                      field73 = t.field73,
                                      field74 = t.field74,
                                      field75 = t.field75,
                                      field76 = t.field76,
                                      field77 = t.field77,
                                      field78 = t.field78,
                                      field79 = t.field79,
                                      field80 = t.field80,
                                      field81 = t.field81,
                                      field82 = t.field82,
                                      field83 = t.field83,
                                      field84 = t.field84,
                                      field85 = t.field85,
                                      field86 = t.field86,
                                      field87 = t.field87,
                                      field88 = t.field88,
                                      field89 = t.field89,
                                      field90 = t.field90,
                                      field91 = t.field91,
                                      field92 = t.field92,
                                      field93 = t.field93,
                                      field94 = t.field94,
                                      field95 = t.field95,
                                      field96 = t.field96,
                                      field97 = t.field97,
                                      field98 = t.field98,
                                      field99 = t.field99,
                                      field100 = t.field100,
                                      field101 = t.field101,
                                      field102 = t.field102,
                                      field103 = t.field103,
                                      field104 = t.field104,
                                      field105 = t.field105,
                                      field106 = t.field106,
                                      field107 = t.field107,
                                      field108 = t.field108,
                                      field109 = t.field109,
                                      field110 = t.field110,
                                      field111 = t.field111,
                                      field112 = t.field112,
                                      field113 = t.field113,
                                      field114 = t.field114,
                                      field115 = t.field115,
                                      field116 = t.field116,
                                      field117 = t.field117,
                                      field118 = t.field118,
                                      field119 = t.field119,
                                      field120 = t.field120,
                                      field121 = t.field121,
                                      field122 = t.field122,
                                      field123 = t.field123,
                                      field124 = t.field124,
                                      field125 = t.field125,
                                      field126 = t.field126,
                                      field127 = t.field127,
                                      field128 = t.field128,
                                      field129 = t.field129,
                                      field130 = t.field130,
                                      field131 = t.field131,
                                      field132 = t.field132,
                                      field133 = t.field133,
                                      field134 = t.field134,
                                      field135 = t.field135,
                                      field136 = t.field136,
                                      field137 = t.field137,
                                      field138 = t.field138,
                                      field139 = t.field139,
                                      field140 = t.field140,
                                      field141 = t.field141,
                                      field142 = t.field142,
                                      field143 = t.field143,
                                      field144 = t.field144,
                                      field145 = t.field145,
                                      field146 = t.field146,
                                      field147 = t.field147,
                                      field148 = t.field148,
                                      field149 = t.field149,
                                      field150 = t.field150,
                                      field151 = t.field151,
                                      field152 = t.field152,
                                      field153 = t.field153,
                                      field154 = t.field154,
                                      field155 = t.field155,
                                      field156 = t.field156,
                                      field157 = t.field157,
                                      field158 = t.field158,
                                      field159 = t.field159,
                                      field160 = t.field160,
                                      field161 = t.field161,
                                      field162 = t.field162,
                                      field163 = t.field163,
                                      field164 = t.field164,
                                      field165 = t.field165,
                                      field166 = t.field166,
                                      field167 = t.field167,
                                      field168 = t.field168,
                                      field169 = t.field169,
                                      field170 = t.field170,
                                      field171 = t.field171,
                                      field172 = t.field172,
                                      field173 = t.field173,
                                      field174 = t.field174,
                                      field175 = t.field175,
                                      field176 = t.field176,
                                      field177 = t.field177,
                                      field178 = t.field178,
                                      field179 = t.field179,
                                      field180 = t.field180,
                                      field181 = t.field181,
                                      field182 = t.field182,
                                      field183 = t.field183,
                                      field184 = t.field184,
                                      field185 = t.field185,
                                      field186 = t.field186,
                                      field187 = t.field187,
                                      field188 = t.field188,
                                      field189 = t.field189,
                                      field190 = t.field190,
                                      field191 = t.field191,
                                      field192 = t.field192,
                                      field193 = t.field193,
                                      field194 = t.field194,
                                      field195 = t.field195,
                                      field196 = t.field196,
                                      field197 = t.field197,
                                      field198 = t.field198,
                                      field199 = t.field199,
                                      field200 = t.field200,
                                      StringField1 = t.StringField1,
                                      StringField2 = t.StringField2,
                                      StringField3 = t.StringField3,
                                      StringField4 = t.StringField4,
                                      StringField5 = t.StringField5,
                                      StringField6 = t.StringField6,
                                      StringField7 = t.StringField7,
                                      StringField8 = t.StringField8,
                                      StringField9 = t.StringField9,
                                      StringField10 = t.StringField10,
                                      StringField11 = t.StringField11,
                                      StringField12 = t.StringField12,
                                      StringField13 = t.StringField13,
                                      StringField14 = t.StringField14,
                                      StringField15 = t.StringField15,
                                      StringField16 = t.StringField16,
                                      StringField17 = t.StringField17,
                                      StringField18 = t.StringField18,
                                      StringField19 = t.StringField19,
                                      StringField20 = t.StringField20,
                                      StringField21 = t.StringField21,
                                      StringField22 = t.StringField22,
                                      StringField23 = t.StringField23,
                                      StringField24 = t.StringField24,
                                      StringField25 = t.StringField25,
                                      StringField26 = t.StringField26,
                                      StringField27 = t.StringField27,
                                      StringField28 = t.StringField28,
                                      StringField29 = t.StringField29,
                                      StringField30 = t.StringField30,
                                      StringField31 = t.StringField31,
                                      StringField32 = t.StringField32,
                                      StringField33 = t.StringField33,
                                      StringField34 = t.StringField34,
                                      StringField35 = t.StringField35,
                                      StringField36 = t.StringField36,
                                      StringField37 = t.StringField37,
                                      StringField38 = t.StringField38,
                                      StringField39 = t.StringField39,
                                      StringField40 = t.StringField40,
                                      StringField41 = t.StringField41,
                                      StringField42 = t.StringField42,
                                      StringField43 = t.StringField43,
                                      StringField44 = t.StringField44,
                                      StringField45 = t.StringField45,
                                      StringField46 = t.StringField46,
                                      StringField47 = t.StringField47,
                                      StringField48 = t.StringField48,
                                      StringField49 = t.StringField49,
                                      StringField50 = t.StringField50,
                                      StringField51 = t.StringField51,
                                      StringField52 = t.StringField52,
                                      StringField53 = t.StringField53,
                                      StringField54 = t.StringField54,
                                      StringField55 = t.StringField55,
                                      StringField56 = t.StringField56,
                                      StringField57 = t.StringField57,
                                      StringField58 = t.StringField58,
                                      StringField59 = t.StringField59,
                                      StringField60 = t.StringField60,
                                      StringField61 = t.StringField61,
                                      StringField62 = t.StringField62,
                                      StringField63 = t.StringField63,
                                      StringField64 = t.StringField64,
                                      StringField65 = t.StringField65,
                                      StringField66 = t.StringField66,
                                      StringField67 = t.StringField67,
                                      StringField68 = t.StringField68,
                                      StringField69 = t.StringField69,
                                      StringField70 = t.StringField70,
                                      StringField71 = t.StringField71,
                                      StringField72 = t.StringField72,
                                      StringField73 = t.StringField73,
                                      StringField74 = t.StringField74,
                                      StringField75 = t.StringField75,
                                      StringField76 = t.StringField76,
                                      StringField77 = t.StringField77,
                                      StringField78 = t.StringField78,
                                      StringField79 = t.StringField79,
                                      StringField80 = t.StringField80,
                                      StringField81 = t.StringField81,
                                      StringField82 = t.StringField82,
                                      StringField83 = t.StringField83,
                                      StringField84 = t.StringField84,
                                      StringField85 = t.StringField85,
                                      StringField86 = t.StringField86,
                                      StringField87 = t.StringField87,
                                      StringField88 = t.StringField88,
                                      StringField89 = t.StringField89,
                                      StringField90 = t.StringField90,
                                      StringField91 = t.StringField91,
                                      StringField92 = t.StringField92,
                                      StringField93 = t.StringField93,
                                      StringField94 = t.StringField94,
                                      StringField95 = t.StringField95,
                                      StringField96 = t.StringField96,
                                      StringField97 = t.StringField97,
                                      StringField98 = t.StringField98,
                                      StringField99 = t.StringField99,
                                      StringField100 = t.StringField100,
                                      StringField101 = t.StringField101,
                                      StringField102 = t.StringField102,
                                      StringField103 = t.StringField103,
                                      StringField104 = t.StringField104,
                                      StringField105 = t.StringField105,
                                      StringField106 = t.StringField106,
                                      StringField107 = t.StringField107,
                                      StringField108 = t.StringField108,
                                      StringField109 = t.StringField109,
                                      StringField110 = t.StringField110,
                                      StringField111 = t.StringField111,
                                      StringField112 = t.StringField112,
                                      StringField113 = t.StringField113,
                                      StringField114 = t.StringField114,
                                      StringField115 = t.StringField115,
                                      StringField116 = t.StringField116,
                                      StringField117 = t.StringField117,
                                      StringField118 = t.StringField118,
                                      StringField119 = t.StringField119,
                                      StringField120 = t.StringField120,
                                      StringField121 = t.StringField121,
                                      StringField122 = t.StringField122,
                                      StringField123 = t.StringField123,
                                      StringField124 = t.StringField124,
                                      StringField125 = t.StringField125,
                                      StringField126 = t.StringField126,
                                      StringField127 = t.StringField127,
                                      StringField128 = t.StringField128,
                                      StringField129 = t.StringField129,
                                      StringField130 = t.StringField130,
                                      StringField131 = t.StringField131,
                                      StringField132 = t.StringField132,
                                      StringField133 = t.StringField133,
                                      StringField134 = t.StringField134,
                                      StringField135 = t.StringField135,
                                      StringField136 = t.StringField136,
                                      StringField137 = t.StringField137,
                                      StringField138 = t.StringField138,
                                      StringField139 = t.StringField139,
                                      StringField140 = t.StringField140,
                                      StringField141 = t.StringField141,
                                      StringField142 = t.StringField142,
                                      StringField143 = t.StringField143,
                                      StringField144 = t.StringField144,
                                      StringField145 = t.StringField145,
                                      StringField146 = t.StringField146,
                                      StringField147 = t.StringField147,
                                      StringField148 = t.StringField148,
                                      StringField149 = t.StringField149,
                                      StringField150 = t.StringField150,
                                      StringField151 = t.StringField151,
                                      StringField152 = t.StringField152,
                                      StringField153 = t.StringField153,
                                      StringField154 = t.StringField154,
                                      StringField155 = t.StringField155,
                                      StringField156 = t.StringField156,
                                      StringField157 = t.StringField157,
                                      StringField158 = t.StringField158,
                                      StringField159 = t.StringField159,
                                      StringField160 = t.StringField160,
                                      StringField161 = t.StringField161,
                                      StringField162 = t.StringField162,
                                      StringField163 = t.StringField163,
                                      StringField164 = t.StringField164,
                                      StringField165 = t.StringField165,
                                      StringField166 = t.StringField166,
                                      StringField167 = t.StringField167,
                                      StringField168 = t.StringField168,
                                      StringField169 = t.StringField169,
                                      StringField170 = t.StringField170,
                                      StringField171 = t.StringField171,
                                      StringField172 = t.StringField172,
                                      StringField173 = t.StringField173,
                                      StringField174 = t.StringField174,
                                      StringField175 = t.StringField175,
                                      StringField176 = t.StringField176,
                                      StringField177 = t.StringField177,
                                      StringField178 = t.StringField178,
                                      StringField179 = t.StringField179,
                                      StringField180 = t.StringField180,
                                      StringField181 = t.StringField181,
                                      StringField182 = t.StringField182,
                                      StringField183 = t.StringField183,
                                      StringField184 = t.StringField184,
                                      StringField185 = t.StringField185,
                                      StringField186 = t.StringField186,
                                      StringField187 = t.StringField187,
                                      StringField188 = t.StringField188,
                                      StringField189 = t.StringField189,
                                      StringField190 = t.StringField190,
                                      StringField191 = t.StringField191,
                                      StringField192 = t.StringField192,
                                      StringField193 = t.StringField193,
                                      StringField194 = t.StringField194,
                                      StringField195 = t.StringField195,
                                      StringField196 = t.StringField196,
                                      StringField197 = t.StringField197,
                                      StringField198 = t.StringField198,
                                      StringField199 = t.StringField199,
                                      StringField200 = t.StringField200
                                  }).OrderBy(o => o.StatusCode)
                                        .ThenByDescending(o => o.CreationDate)
                                        .ThenByDescending(o => o.UpdateDate)
                                        .ThenByDescending(o => o.TransactionId)
                                        .ThenByDescending(o => o.JOB_ID);
                    var sql = result.ToString();
                    return result.ToList();

                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static int SaveClientInfo(int clientId, string clientName, int statusCode)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertClientInfo";
            cmd.Parameters.AddWithValue("@clientId", clientId);
            cmd.Parameters.AddWithValue("@clientname", clientName);
            cmd.Parameters.AddWithValue("@status", statusCode);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int SaveAccountInfo(int clientId, string clientName, string owner, string email, string phone, string comment, string statusCode)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertAccountInfo";
            cmd.Parameters.AddWithValue("@clientId", clientId);
            cmd.Parameters.AddWithValue("@clientName", clientName);
            cmd.Parameters.AddWithValue("@owner", owner);
            cmd.Parameters.AddWithValue("@email", email);
            cmd.Parameters.AddWithValue("@phone", phone);
            cmd.Parameters.AddWithValue("@comment", comment);
            cmd.Parameters.AddWithValue("@status", statusCode);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int SaveSiteInfo(int siteId, int clientId, string clientName, string siteName, int statusCode)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertSiteInfo";
            cmd.Parameters.AddWithValue("@siteId", siteId);
            cmd.Parameters.AddWithValue("@clientId", clientId);
            cmd.Parameters.AddWithValue("@clientName", clientName);
            cmd.Parameters.AddWithValue("@siteName", siteName);
            cmd.Parameters.AddWithValue("@status", statusCode);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int SaveLocationInfo(int locID, int siteID, string locName, int status, string continent, string country, string cBPSRegion, string state, string city,
    string campus, string building, string floorno, string area, string office)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertLocationInfo";
            cmd.Parameters.AddWithValue("@locID", locID);
            cmd.Parameters.AddWithValue("@siteID", siteID);
            cmd.Parameters.AddWithValue("@locName", locName);
            cmd.Parameters.AddWithValue("@status", status);
            cmd.Parameters.AddWithValue("@continent", continent);
            cmd.Parameters.AddWithValue("@country", country);
            cmd.Parameters.AddWithValue("@cBPSRegion", cBPSRegion);
            cmd.Parameters.AddWithValue("@state", state);
            cmd.Parameters.AddWithValue("@city", city);
            cmd.Parameters.AddWithValue("@campus", campus);
            cmd.Parameters.AddWithValue("@building", building);
            cmd.Parameters.AddWithValue("@floor", floorno);
            cmd.Parameters.AddWithValue("@area", area);
            cmd.Parameters.AddWithValue("@office", office);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }


        public static int SaveServiceAreaFieldInfo(int svcID, int svcFieldNumber, string svcFieldName, int svcFieldID, string shade, int serviceAreaFieldGroup_SAID, 
            string metricShortName, string metricFormat, int isVisible, int isMandatory, int isLogVisible, string groupName, int fieldType, string description_Txt, 
            string defaultValue, string dataType, string categoryCode, string constraint_Txt)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertServiceAreaFieldInfo";
            cmd.Parameters.AddWithValue("@svcID", svcID);
            cmd.Parameters.AddWithValue("@svcFieldNumber", svcFieldNumber);
            cmd.Parameters.AddWithValue("@svcFieldName", svcFieldName);
            cmd.Parameters.AddWithValue("@svcFieldID", svcFieldID);
            cmd.Parameters.AddWithValue("@shade", shade);
            cmd.Parameters.AddWithValue("@serviceAreaFieldGroup_SAID", serviceAreaFieldGroup_SAID);
            cmd.Parameters.AddWithValue("@metricShortName", metricShortName);
            cmd.Parameters.AddWithValue("@metricFormat", metricFormat);
            cmd.Parameters.AddWithValue("@isVisible", isVisible);
            cmd.Parameters.AddWithValue("@isMandatory", isMandatory);
            cmd.Parameters.AddWithValue("@isLogVisible", isLogVisible);
            cmd.Parameters.AddWithValue("@groupName", groupName);
            cmd.Parameters.AddWithValue("@fieldType", fieldType);
            cmd.Parameters.AddWithValue("@description_Txt", description_Txt);
            cmd.Parameters.AddWithValue("@defaultValue", defaultValue);
            cmd.Parameters.AddWithValue("@dataType", dataType);
            cmd.Parameters.AddWithValue("@categoryCode", categoryCode);
            cmd.Parameters.AddWithValue("@constraint_Txt", constraint_Txt);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int SaveServiceAreaFieldLOV(int recId, int svcFieldId, int fieldId, string fieldText)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertServiceAreaFieldLOV";
            cmd.Parameters.AddWithValue("@recId", recId);
            cmd.Parameters.AddWithValue("@svcFieldId", svcFieldId);
            cmd.Parameters.AddWithValue("@fieldId", fieldId);
            cmd.Parameters.AddWithValue("@fieldText", fieldText);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int SaveServiceAreaInfo(int serviceAreaId, int locId, string serviceAreaName, int statusCode, string serviceAreaCategory)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertServiceAreaInfo";
            cmd.Parameters.AddWithValue("@serviceAreaId", serviceAreaId);
            cmd.Parameters.AddWithValue("@locId", locId);
            cmd.Parameters.AddWithValue("@svcName", serviceAreaName);
            cmd.Parameters.AddWithValue("@serviceCategory", serviceAreaCategory);
            cmd.Parameters.AddWithValue("@status", statusCode);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }
        public static int SaveUserInfo(int UserID, string fullname, string userName, string AccountType,  int userStatus, int resetflag, int Upload_ind, int MstrUser_Ind, 
            int GoldReports_ind, int admin, int ClientID, string ClientFolderName, string managerUserName, string company_nm, string contact_phone_nbr, int visit_cnt)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spUpsertUserInfo";
            cmd.Parameters.AddWithValue("@UserID", UserID);
            cmd.Parameters.AddWithValue("@fullname", fullname);
            cmd.Parameters.AddWithValue("@userName", userName);
            cmd.Parameters.AddWithValue("@AccountType", AccountType);
            cmd.Parameters.AddWithValue("@userStatus", userStatus);
            cmd.Parameters.AddWithValue("@resetflag", resetflag);
            cmd.Parameters.AddWithValue("@Upload_ind", Upload_ind);
            cmd.Parameters.AddWithValue("@MstrUser_Ind", MstrUser_Ind);
            cmd.Parameters.AddWithValue("@GoldReports_ind", GoldReports_ind);
            cmd.Parameters.AddWithValue("@admin", admin);
            cmd.Parameters.AddWithValue("@ClientID", ClientID);
            cmd.Parameters.AddWithValue("@ClientFolderName", ClientFolderName);
            cmd.Parameters.AddWithValue("@managerUserName", managerUserName);
            cmd.Parameters.AddWithValue("@company_nm", company_nm);
            cmd.Parameters.AddWithValue("@contact_phone_nbr", contact_phone_nbr);
            cmd.Parameters.AddWithValue("@visit_cnt", visit_cnt);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }

        public static int SaveUserTransactionLog(int tranId, DateTime tranDate, string tranType, string userName, string fileName)
        {
            var result = 0;
            SqlConnection conn = new SqlConnection();
            SqlCommand cmd = new SqlCommand();
            conn.ConnectionString = WebConfigurationManager.AppSettings["EDS"];
            cmd.Connection = conn;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spSaveUserTransactionLog";
            cmd.Parameters.AddWithValue("@tranId", tranId);
            cmd.Parameters.AddWithValue("@tranDate", tranDate);
            cmd.Parameters.AddWithValue("@tranType", tranType);
            cmd.Parameters.AddWithValue("@userName", userName);
            cmd.Parameters.AddWithValue("@fileName", fileName);
            try
            {
                conn.Open();
                result = cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                // throw the exception  
            }
            finally
            {
                conn.Close();
            }
            return result;
        }
    }
}
