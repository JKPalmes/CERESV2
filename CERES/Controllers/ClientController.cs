using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;
using CERES.Core.Repository;
using Newtonsoft.Json.Linq;
using System.Reflection;
using System.Web.Configuration;
using System.Web;
using CERES.Core.Services;
using CERES.Core.DTO;
using CERES.Core.DAL;
using Newtonsoft.Json;
using CERES.Core.Classes;
using System.IO;
using CERES.Web.Api.Classes;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Hosting;
using System.Threading.Tasks;
using CERES.Core;
using DevExtreme.AspNet.Data;
//using DevExtreme.AspNet.Mvc;
using System.Net.Http.Formatting;
//using DevExtreme.MVC.Demos.Models.DataGrid;


namespace CERES.Web.Api.Controllers
{
    //[Authorize]
    public class ClientController : ApiController
    {
        private readonly string[] NullDefaultValueClientId = WebConfigurationManager.AppSettings["NullDefaultValueClientID"].Split(',');
        private readonly int _pageSize = Int32.Parse(WebConfigurationManager.AppSettings["PageSize"]);
        private readonly int _lastDayProductionDate = Int32.Parse(WebConfigurationManager.AppSettings["LastDayProductionDate"]);
        private readonly int _validEditPeriod = Int32.Parse(WebConfigurationManager.AppSettings["ValidPeriodForEdit"]);
        private readonly int _validViewPeriod = Int32.Parse(WebConfigurationManager.AppSettings["ValidPeriodForView"]);
        private readonly string _reportsFolderLocation = WebConfigurationManager.AppSettings["ReportsFolderLocation"];
        private readonly string _uploadsFolderLocation = WebConfigurationManager.AppSettings["UploadsFolderLocation"];
        private readonly string _serverFolderPath = WebConfigurationManager.AppSettings["ServerFolderPath"];
        private readonly int _maxUploadFileSize = Int32.Parse(WebConfigurationManager.AppSettings["MaxUploadFileSize"]);
        private readonly string _allowedFileExtensions = WebConfigurationManager.AppSettings["AllowedFileExtensions"];
        private readonly string _eDUploadsFolderLocation = WebConfigurationManager.AppSettings["ExecutiveDashboardUploadsLocation"];

        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        private readonly HostingEnvironment environment;
        private string GetIdentity()
        {
            var identiy = this.User.Identity as System.Security.Claims.ClaimsIdentity;
            var sid = "";
            var email = "";

            foreach (var o in identiy.Claims)
            {
                if (o.Type.Contains("sid"))
                    sid = o.Value;
                else if (o.Type.Contains("email"))
                    email = HttpUtility.HtmlEncode(o.Value);
            }
            return sid + "," + email;
        }

        private string _email
        {
            get { return GetIdentity().Split(',')[1]; }
        }
        private string[] _identity { get { return GetIdentity().Split(','); } }

        public bool AllowMultiple => throw new NotImplementedException();

        private IEnumerable<int> GetSitesAccess(int clientId = 0)
        {
            //var list = new List<int>();
            //list.Add(18);
            //return list;
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                if (string.IsNullOrEmpty(_identity[0])) return new List<int>();
                
                int userId = Int32.Parse(_identity[0]);
                //if (clientId == 0)
                //{
                //return (from a in dbContext.vwGet_ClientList2
                //        where a.userid == userId
                //        select a.ID).Distinct().ToList();
                // }
                //return (from a in dbContext.vwGet_ClientList2
                //        where a.userid == userId && a.ID == clientId
                //        select a.ID).Distinct().ToList();

                var sitesAccessList = (from a in dbContext.vwGet_ClientList2
                                       where a.userid == userId
                                       select a.ID).Distinct().ToList();


                return sitesAccessList;
            }
        }

        private bool IsUserAllowedTransactionUpdates(int clientId = 0)
        {
            IEnumerable<int> accessList = this.GetSitesAccess(clientId);
            return accessList.Contains(clientId) ? true : false;
            //return false;
        }

        [HttpGet]
        [Route("api/Client/GetTransactionById")]
        public IHttpActionResult GetTransactionById(int transactionId, int accountId, int svcId)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            var userSvc = new UserService();
            if (this.IsUserAllowedTransactionUpdates(accountId))
            {
                var result = new TransactionUpdateViewModel
                {
                    Transactions = userSvc.GetTransactionDataById(transactionId),
                    ServiceAreaFields = ClientHierarchyService.GetServiceAreaFields(svcId).Where(e => e.IsVisible == true)
                };
                List<int> svcFields = result.ServiceAreaFields.Select(o => o.svcFieldID).ToList();
                result.FieldLOV = ClientHierarchyService.GetServiceAreaFieldLOVs(svcFields);
                return Ok(result);
            }
            return InternalServerError(new Exception("Invalid Request"));
        }

        [HttpGet]
        [Route("api/Client/SearchSavedData")]
        public IHttpActionResult SearchSavedData(int pageNumber, string userName, string searchText)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), searchText));

            var userSvc = new UserService();
            var result = new TransactionUpdateViewModel
            {
                GenericTransactions = userSvc.SearchDataBySiteAccess(Int32.Parse(_identity[0]), searchText, _pageSize, pageNumber, _lastDayProductionDate),
            };
            return Ok(result);
        }

        [HttpGet]
        [Route("api/Client/SearchSavedData")]
        public IHttpActionResult SearchSavedData(int pageNumber, string userName, string searchText, int svcId)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), searchText));

            var userSvc = new UserService();
            var result = new TransactionUpdateViewModel
            {
                Transactions = userSvc.SearchDataBySiteAccess(Int32.Parse(_identity[0]), searchText, svcId, _pageSize, pageNumber, _lastDayProductionDate),
                ServiceAreaFields = ClientHierarchyService.GetServiceAreaFields(svcId).Where(e => e.IsVisible == true)
            };
            List<int> svcFields = result.ServiceAreaFields.Select(o => o.svcFieldID).ToList();
            result.FieldLOV = ClientHierarchyService.GetServiceAreaFieldLOVs(svcFields);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/Client/GetSavedDataByServiceArea")]
        public IHttpActionResult GetSavedDataByServiceArea(int validPeriod, string viewData, string userName, string accountType, string date, int clientId, int serviceAreaId)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), serviceAreaId));

            var userSvc = new UserService();
            if (this.IsUserAllowedTransactionUpdates(clientId))
            {
                var result = new TransactionUpdateViewModel
                {
                    GenericTransactions = userSvc.GetDataByServiceArea(date, viewData, userName, accountType, serviceAreaId, validPeriod * 30),// _lastDayProductionDate),
                    Transactions = userSvc.GetDataByServiceAreaBySiteAccess(userName, date, accountType, serviceAreaId, viewData, validPeriod * 30),// _lastDayProductionDate),
                    ServiceAreaFields = ClientHierarchyService.GetServiceAreaFields(serviceAreaId).Where(e => e.IsVisible == true)
                };
                List<int> svcFields = result.ServiceAreaFields.Select(o => o.svcFieldID).ToList();
                result.FieldLOV = ClientHierarchyService.GetServiceAreaFieldLOVs(svcFields);
                return Ok(result);
            }
            else
            {
                return Ok("No data");
            }
            //return InternalServerError(new Exception("Invalid Request"));
        }

        //[HttpGet]
        //[Route("api/Client/GetSavedData")]
        //public IHttpActionResult GetSavedData(int validPeriod, string viewData, string userName, string accountType, string date, int clientId, int serviceAreaId)
        //{
        //    //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), serviceAreaId));

        //    var userSvc = new UserService();
        //    if (this.IsUserAllowedTransactionUpdates(clientId))
        //    {
        //        var result = new TransactionUpdateViewModel
        //        {
        //            Transactions = userSvc.GetDataBySiteAccess(userName, date, serviceAreaId, viewData, accountType, validPeriod * 30),// _lastDayProductionDate),
        //            ServiceAreaFields = ClientHierarchyService.GetServiceAreaFields(serviceAreaId).Where(e => e.IsVisible == true)
        //        };
        //        List<int> svcFields = result.ServiceAreaFields.Select(o => o.svcFieldID).ToList();
        //        result.FieldLOV = ClientHierarchyService.GetServiceAreaFieldLOVs(svcFields);
        //        return Ok(result);
        //    }
        //    return InternalServerError(new Exception("Invalid Request"));
        //}

        [HttpGet]
        [Route("api/Client/GetSavedData")]
        public IHttpActionResult GetSavedData(int validPeriod, string viewData, string userName, string accountType)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), viewData));

            var userSvc = new UserService();
            var result = new TransactionUpdateViewModel
            {
                GenericTransactions = userSvc.GetDataBySiteAccess(userName, this.GetSitesAccess().ToList(), _pageSize, viewData, accountType, validPeriod * 30)
                //GenericTransactions = userSvc.GetDataBySiteAccess(userName, this.GetSitesAccess().ToList(), _pageSize, viewAllData, _lastDayProductionDate),
                //Transactions = userSvc.GetDataBySiteAccess(_pageSize, date, serviceAreaId, pageNumber, _lastDayProductionDate),
                //ServiceAreaFields = ClientHierarchyService.GetServiceAreaFields(serviceAreaId).Where(e => e.IsVisible == true)
            };
            //List<int> svcFields = result.ServiceAreaFields.Select(o => o.svcFieldID).ToList();
            //result.FieldLOV = ClientHierarchyService.GetServiceAreaFieldLOVs(svcFields);
            return Ok(result);

        }

        [HttpGet]
        [Route("api/Client/GetSavedDataAll")]
        public IHttpActionResult GetSavedDataAll(int validPeriod, string viewData, string userName, string accountType, int clientId)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), viewData));
            var userSvc = new UserService();
            var result = new TransactionUpdateViewModel
            {
                GenericTransactions = userSvc.GetDataBySiteAccess(userName, this.GetSitesAccess().ToList(), _pageSize, viewData, accountType, clientId, validPeriod * 30)
            };
            return Ok(result);

        }

        [HttpPost]
        [Route("api/Client/SaveData")]
        public IHttpActionResult SaveData(JObject value)
        {
            //log.Info(string.Format("{0} {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var tranType = "Update";
            using (var data = new TransactionV2())
            {
                if (string.IsNullOrEmpty(value["tID"].Value<int>().ToString()) || value["tID"].Value<int>() == 0)
                {
                    value["UserID"] = Int32.Parse(_identity[0]);
                    value["userName"] = _email;
                    value["ID"] = 0;
                }
                //transform data
                Models.TransactionV2BLL tranData = new Models.TransactionV2BLL(value);
                Transactions tran = tranData.TransformData(NullDefaultValueClientId);
                if (tran.tID == 0)
                {
                    tranType = "Add";
                    data.TransactionV2Repository.Add(tran);
                }
                else
                {
                    var statusCode = string.IsNullOrEmpty(tran.StatusCode) ? "U" : tran.StatusCode;
                    if (statusCode == "D")
                    {
                        data.TransactionV2Repository.Remove(tran);
                        data.Save();
                        return Ok("Transaction deleted");
                    }
                    else
                    {
                        tran = tranData.TransformData(statusCode, _email, Int32.Parse(_identity[0]));
                        data.TransactionV2Repository.Alter(tran);
                    }
                }

                data.Save();

                var result = new List<KeyValuePair<string, string>>();
                result.Add(new KeyValuePair<string, string>("TransactionId", tran.tID.ToString()));
                result.Add(new KeyValuePair<string, string>("JOB_ID", tran.JOB_ID));
                result.Add(new KeyValuePair<string, string>("ProductionDate", tran.tDate.ToString("yyyy-MM-dd")));
                result.Add(new KeyValuePair<string, string>("IsDataOnDiffMonth", (((tran.tDate.Year - tran.CreationDate.Year) * 12) + tran.tDate.Month - tran.CreationDate.Month).ToString()));

                //TODO: refactor
                //SET STATUS VALUE WHEN DATE COMPLETED IS PROVIDED
                var svcFieldStatus = Core.Services.ClientHierarchyService.GetServiceAreaFields(tran.svcID).Where(o => o.svcFieldName.ToLower().Trim() == "status" && o.FieldType == 0).FirstOrDefault();
                var statusField = "";
                PropertyInfo status;
                if (svcFieldStatus != null)
                {
                    status = tran.GetType().GetProperties().Where(o => o.Name == "StringField" + svcFieldStatus.svcFieldNumber.ToString()).FirstOrDefault();
                    if (status.GetValue(tran) != null)
                        statusField = status.GetValue(tran).ToString();

                    result.Add(new KeyValuePair<string, string>("StringField" + svcFieldStatus.svcFieldNumber.ToString(), statusField));
                }

                log.Info(string.Format("{0}| {1} is called: {2}|{3}|{4}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString(),
                    tranType, tran.tID));

                UserService.SaveUserTransactionLog(tran.tID, DateTime.Today, tranType, _email, "");

                return Ok(result);
            }
        }

        [HttpPost]
        [Route("api/Client/GetAllServiceAreaFieldLOV")]
        public IHttpActionResult GetAllServiceAreaFieldLOV(UserSelectorFilter value)
        {
            var svcFields = ClientHierarchyService.GetServiceAreaFields(value.Id).ToList();
            List<int> lstSvcFields = svcFields.Select(o => o.svcFieldID).ToList();
            var fieldLOV = ClientHierarchyService.GetAllServiceAreaFieldLOVs(lstSvcFields);
            return Ok(fieldLOV);
        }

        [HttpPost]
        [Route("api/Client/GetAllServiceAreaFields")]
        public IHttpActionResult GetAllServiceAreaFields(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            return Ok(ClientHierarchyService.GetServiceAreaFields(value.Id));
        }

        [HttpPost]
        [Route("api/Client/GetServiceAreaFields")]
        public IHttpActionResult GetServiceAreaFields(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            return Ok(ClientHierarchyService.GetServiceAreaFields(value.Id).Where(e => e.IsVisible == true));
        }

        [HttpPost]
        [Route("api/Client/GetClientByUserName")]
        public IHttpActionResult GetClientByUserName(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            return Ok(ClientHierarchyService.GetClientByUserName(_email));
        }

        [HttpPost]
        [Route("api/Client/GetSiteByUserName")]
        public IHttpActionResult GetSiteByUserName(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            value.UserName = _email;
            return Ok(ClientHierarchyService.GetSiteByClientByIdAndUserName(value));
        }

        [HttpPost]
        [Route("api/Client/GetLocationById")]
        public IHttpActionResult GetLocationsById(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            return Ok(ClientHierarchyService.GetLocationBySiteId(value.Id));
        }

        [HttpPost]
        [Route("api/Client/GetServiceAreaById")]
        public IHttpActionResult GetServiceAreaById(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            return Ok(ClientHierarchyService.GetServiceAreaByLocationId(value.Id));
        }

        [HttpGet]
        [Route("api/Client/GetSites")]
        public IHttpActionResult GetSites()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetSites());
        }

        [HttpGet]
        [Route("api/Client/GetLocations")]
        public IHttpActionResult GetLocations()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetLocations());
        }

        [HttpGet]
        [Route("api/Client/GetServiceAreas")]
        public IHttpActionResult GetServiceAreas()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetServiceAreas());
        }

        [HttpPost]
        [Route("api/Client/GetTop10ServiceAreasByUserName")]
        public IHttpActionResult GetTop10ServiceAreasByUserName(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            return Ok(ClientHierarchyService.GetTop10ServiceAreasByUserName(_email));
        }

        [HttpGet]
        [Route("api/Client/GetLatestTransactionId")]
        public IHttpActionResult GetLatestTransactionId()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(UserService.GetLatestTransactionId());
        }

        [HttpPost]
        [Route("api/Client/GetServiceAreaCategory")]
        public IHttpActionResult GetServiceAreaCategory(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetServiceAreaCategory(value.Id));
        }

        [HttpGet]
        [Route("api/Client/GetServiceAreaCategories")]
        public IHttpActionResult GetServiceAreaCategories()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetServiceAreaCategories());
        }

        [HttpPost]
        [Route("api/Client/ChangePassword")]
        public IHttpActionResult ChangePassword([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);

            var userName = values.UserName.ToString();
            var newPassword = values.NewPassword.ToString();
            var oldPassword = values.OldPassword.ToString();

            return Ok(UserService.ChangePassword(userName, oldPassword, newPassword));
        }

        [HttpPost]
        [Route("api/Client/UpdateResetFlag")]
        public IHttpActionResult UpdateResetFlag()
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), ""));

            return Ok(UserService.UpdateResetFlag(_email));
        }

        [HttpPost]
        [Route("api/Client/SetUserFolders")]
        public IHttpActionResult SetUserFolders([FromBody] JObject value)
        {
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            var email = values.email.ToString();
            var folderClass = new FolderStuctureClass(email);
            TreeNode treeNodes = folderClass.PopulateTree();
            var serverPath = HostingEnvironment.MapPath(_serverFolderPath);
            var jsonString = folderClass.ConvertTreeNodeToJson(treeNodes, serverPath);

            return Ok(jsonString.ToString().Replace("\"items\": {},", ""));
        }

        [HttpGet]
        [Route("api/Client/GetUserProfile")]
        public IHttpActionResult GetUserProfile(string email)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(UserService.GetUserProfile(email));
        }

        [HttpPost]
        [Route("api/Client/SetUserProfile")]
        public IHttpActionResult SetUserProfile([FromBody] JObject value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            var email = values.email.ToString();
            return Ok(UserService.GetUserProfile(email));
        }

        [HttpPost]
        [Route("api/Client/UpdateUserProfile")]
        public IHttpActionResult UpdateUserProfile([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);

            var contactNo = values.ContactNo.ToString();
            return Ok(UserService.UpdateUserProfile(_email, contactNo));
        }

        [HttpGet]
        [Route("api/Client/GetUserSettings")]
        public IHttpActionResult GetUserSettings()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));
            var userSettings = new UserSettings();
            userSettings.PageSize = _pageSize;
            userSettings.ValidPeriod = _validEditPeriod;
            userSettings.ViewablePeriod = _validViewPeriod;

            return Ok(userSettings);
        }

        [HttpGet]
        [Route("api/Client/GetAppSettings")]
        public IHttpActionResult GetAppSettings()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));
            var appSettings = new AppSettings();
            appSettings.ServerFolderPath = _serverFolderPath;
            appSettings.ReportsFolderLocation = _reportsFolderLocation;
            appSettings.UploadsFolderLocation = _uploadsFolderLocation;
            appSettings.MaxUploadFileSize = _maxUploadFileSize;
            appSettings.AllowedFileExtensions = _allowedFileExtensions;
            appSettings.GridPageSize = _pageSize;
            appSettings.ValidPeriodForEdit = _validEditPeriod;
            appSettings.ValidPeriodForView = _validViewPeriod;

            return Ok(appSettings);
        }

        [HttpGet]
        [Route("api/Client/GetUserFolders")]
        public IHttpActionResult GetUserFolders()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            var folderClass = new FolderStuctureClass(_email);
            TreeNode treeNodes = folderClass.PopulateTree();
            var serverPath = HostingEnvironment.MapPath(_serverFolderPath);
            var jsonString = folderClass.ConvertTreeNodeToJson(treeNodes, serverPath);

            return Ok(jsonString.ToString().Replace("\"items\": {},", ""));
        }

        [HttpPost]
        [Route("api/Client/GetFileSystemItems")]
        public IHttpActionResult GetFileSystemItems([FromBody] JObject value)
        {
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);

            //var currentFolder = values.folderName.ToString();
            var currentFolderPath = values.folderPath.ToString().Replace("D:\\BI_REPORTS\\", "");
            var folderPath = Path.Combine(HostingEnvironment.MapPath(_serverFolderPath), currentFolderPath);

            //var folderClass = new FolderStuctureClass(_email);
            //var listFiles = new List<string>();
            //DirectoryInfo currentDirectoryInfo = new DirectoryInfo(folderPath);
            //if (currentDirectoryInfo.Exists)
            //{
            //    var files2 = folderClass.GetFileSystemItems(folderPath);
            //    foreach (var file in files2)
            //    {
            //        listFiles.Add(file.FullName);
            //    }
            //}

            //return Ok(listFiles);

            var rtdBase64Data = "";
            if (File.Exists(folderPath))
            {
                rtdBase64Data = Convert.ToBase64String(File.ReadAllBytes(folderPath));
            }
            return Ok(rtdBase64Data);

            //var serverPath = Path.Combine(_rootPath, imagePath);
            //var fileInfo = new FileInfo(serverPath);
            //return !fileInfo.Exists
            //    ? (IHttpActionResult)NotFound()
            //    : new FileResult(fileInfo.FullName);

        }

        //[AllowAnonymous]
        [HttpPost]
        [Route("api/Client/UploadFilesAsync")]
        public async Task<IHttpActionResult> UploadFilesAsync()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), ""));

            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            try
            {
                MultipartMemoryStreamProvider provider = new MultipartMemoryStreamProvider();

                await Request.Content.ReadAsMultipartAsync(provider);

                if (provider.Contents != null && provider.Contents.Count == 0)
                {
                    return BadRequest("No files provided.");
                }

                //var currentFolderPath = _uploadsFolderLocation;
                //var folderPath = Path.Combine(HostingEnvironment.MapPath("~//BI_Reports//"), currentFolderPath);
                //var folderPath = Path.Combine(HostingEnvironment.MapPath(_serverFolderPath), currentFolderPath);
                //private readonly string _serverFolderPath = WebConfigurationManager.AppSettings["ServerFolderPath"];

                //var folderPath = Path.Combine(HostingEnvironment.MapPath(_serverFolderPath), currentFolderPath);

                //var folderPath = Path.Combine(WebConfigurationManager.AppSettings["UploadsServerLocation"], WebConfigurationManager.AppSettings["UploadsFolderLocation"]);
                //var impUserName = WebConfigurationManager.AppSettings["ImpersonateUserName"];
                //var impDomain = WebConfigurationManager.AppSettings["ImpersonateDomain"]; 
                //var impPassword = WebConfigurationManager.AppSettings["ImpersonatePassword"]; 

                //var imp = new ImpersonateUser();
                //if (imp.impersonateValidUser(impUserName, impDomain, impPassword))
                //{
                var folderPath = Path.Combine(HostingEnvironment.MapPath(_uploadsFolderLocation));
                foreach (HttpContent file in provider.Contents)
                        {
                            string filename = file.Headers.ContentDisposition.FileName.Trim('\"');
                            var filePath = folderPath + "//" + filename;
                            UserService.SaveUserTransactionLog(0, DateTime.Today, "Upload", _email, filename);

                            byte[] buffer = await file.ReadAsByteArrayAsync();

                            using (MemoryStream stream = new MemoryStream(buffer))
                            {
                                //await stream.CopyToAsync(stream);
                                //write to file
                                FileStream fileToSave = new FileStream(filePath, FileMode.Create, FileAccess.Write);
                                stream.WriteTo(fileToSave);
                                fileToSave.Close();
                            }
                        }
                log.Info(string.Format("{0}| {1} is called: {2}|{3}|{4}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), provider.Contents.ToString(),
                    "Upload", _email));

                return Ok("files Uploaded");
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("api/Client/UpdateAppSettings")]
        public IHttpActionResult UpdateAppSettings([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);

            var dictAppSettings = new Dictionary<string, string>();
            dictAppSettings.Add("ServerFolderPath", values.ServerFolderPath.ToString());
            dictAppSettings.Add("ReportsFolderLocation", values.ReportsFolderLocation.ToString());
            dictAppSettings.Add("UploadsFolderLocation", values.UploadsFolderLocation.ToString());
            dictAppSettings.Add("MaxUploadFileSize", values.MaxUploadFileSize.ToString());
            dictAppSettings.Add("AllowedFileExtensions", values.AllowedFileExtensions.ToString());
            dictAppSettings.Add("GridPageSize", values.GridPageSize.ToString());
            dictAppSettings.Add("ValidPeriodForEdit", values.ValidPeriodForEdit.ToString());
            dictAppSettings.Add("ValidPeriodForView", values.ValidPeriodForView.ToString());
            //dictAppSettings.Add("", values..ToString());
            UserService.UpdateConfigAppSettings(dictAppSettings);

            return Ok("app settings updated");
        }

        [HttpGet]
        [Route("api/Client/GetApproverInfo")]
        public IHttpActionResult GetApproverInfo()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));
            return Ok(ClientHierarchyService.GetApproverInfo());
        }

        [HttpPost]
        [Route("api/Client/GetAccountInfos")]
        public IHttpActionResult GetAccountInfos()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetAccountInfos());
        }

        [HttpPost]
        [Route("api/Client/GetClientInfo")]
        public IHttpActionResult GetClientInfo(UserSelectorFilter value)
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetClientInfo(value.Id));
        }

        [HttpPost]
        [Route("api/Client/GetUsers")]
        public IHttpActionResult GetUsers()
        {
            //log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), transactionId));

            return Ok(ClientHierarchyService.GetUsers());
        }

        [HttpPost]
        [Route("api/Client/SaveClientInfo")]
        public IHttpActionResult SaveClientInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var clientId = int.Parse(values.clientId.ToString());
                var clientName = values.accountName.ToString();
                var statusCode = int.Parse(values.statusCode.id.ToString());
                result = UserService.SaveClientInfo(clientId, clientName, statusCode);
            }
            return Ok(result);
        }

        [HttpPut]
        [Route("api/Client/UpdateAccountInfo")]
        public IHttpActionResult UpdateAccountInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var clientId = int.Parse(values.clientId.ToString());
                var clientName = values.accountName.ToString();
                var accountOwner = values.accountOwner.ToString();
                var email = values.email.ToString();
                var phone = values.phone.ToString();
                var comment = values.comment.ToString();
                var statusCode = values.statusCode.text.ToString();
                result = UserService.SaveAccountInfo(clientId, clientName, accountOwner, email, phone, comment, statusCode);
            }
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Client/SaveAccountInfo")]
        public IHttpActionResult SaveAccountInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var clientId = int.Parse(values.clientId.ToString());
                var clientName = values.accountName.ToString();
                var accountOwner = values.accountOwner.ToString();
                var email = values.email.ToString();
                var phone = values.phone.ToString();
                var comment = values.comment.ToString();
                var statusCode = values.statusCode.text.ToString();
                result = UserService.SaveAccountInfo(clientId, clientName, accountOwner, email, phone, comment, statusCode);
            }
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Client/SaveLocationInfo")]
        public IHttpActionResult SaveLocationInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var locID = int.Parse(values.LocationID.ToString());
                var siteID = int.Parse(values.SiteID.ToString());
                var locName = values.LocationName.ToString();
                //var siteName = values.SiteName.ToString();
                var status = int.Parse(values.LocStatus.id.ToString());
                var continent = values.Continent.ToString();
                var country = values.Country.ToString();
                var cBPSRegion = values.CBPSRegion.ToString();
                var state = values.State.ToString();
                var city = values.City.ToString();
                var campus = values.Campus.ToString();
                var building = values.Building.ToString();
                var floorno = values.Floor.ToString();
                var area = values.Area.ToString();
                var office = values.Office.ToString();
                result = UserService.SaveLocationInfo(locID, siteID, locName, status, continent, country, cBPSRegion, state, city, campus, building, floorno, area, office);
            }
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Client/SaveSiteInfo")]
        public IHttpActionResult SaveSiteInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var siteId = int.Parse(values.clientId.ToString());
                var clientId = int.Parse(values.clientId.ToString());
                var clientName = values.accountName.ToString();
                var siteName = values.siteName.ToString();
                var statusCode = int.Parse(values.statusCode.id.ToString());
                result = UserService.SaveSiteInfo(siteId, clientId, clientName, siteName, statusCode);
            }
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Client/SaveServiceAreaInfo")]
        public IHttpActionResult SaveServiceAreaInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var serviceAreaId = int.Parse(values.serviceAreaId.ToString());
                var locId = int.Parse(values.locId.ToString());
                var serviceAreaName = values.serviceAreaName.ToString();
                var statusCode = int.Parse(values.statusCode.id.ToString());
                var serviceAreaCategory = values.serviceAreaCategory.ToString();
                result = UserService.SaveServiceAreaInfo(serviceAreaId, locId, serviceAreaName, statusCode, serviceAreaCategory);
            }
            return Ok(result);
        }


        [HttpPost]
        [Route("api/Client/SaveServiceAreaFieldInfo")]
        public IHttpActionResult SaveServiceAreaFieldInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var categoryCode = values.categoryCode.ToString();
                var dataType = string.IsNullOrEmpty(values.dataType.ToString()) ? "" : string.IsNullOrEmpty(values.dataType.text.ToString()) ? "" : values.dataType.text.ToString();
                var defaultValue = values.defaultValue.ToString();
                var description_Txt = values.description_Txt.ToString();
                var fieldType = int.Parse(values.fieldType.id.ToString());
                var groupName = values.groupName.ToString();
                var isLogVisible = int.Parse(values.isLogVisible.id.ToString());
                var isMandatory = int.Parse(values.isMandatory.id.ToString());
                var isVisible = string.IsNullOrEmpty(values.isVisible.id.ToString()) ? 0 : values.isVisible.id.ToString() == "true" ? 1 : 0;
                var metricFormat = values.metricFormat.ToString();
                var metricShortName = values.metricShortName.ToString();
                var serviceAreaFieldGroup_SAID = string.IsNullOrEmpty(values.serviceAreaFieldGroup_SAID.ToString()) ? 0 : int.Parse(values.serviceAreaFieldGroup_SAID.ToString());
                var shade = "";
                if (!string.IsNullOrEmpty(values.shade.ToString()) || values.shade.ToString() != "{}") shade = values.shade.id.ToString();
                var svcFieldID = int.Parse(values.svcFieldID.ToString());
                var svcFieldName = values.svcFieldName.ToString();
                var svcFieldNumber = int.Parse(values.svcFieldNumber.ToString());
                var svcID = int.Parse(values.svcID.ToString());
                var constraint_Txt = values.constraint_Txt.ToString();
                result = UserService.SaveServiceAreaFieldInfo(svcID, svcFieldNumber, svcFieldName, svcFieldID, shade, serviceAreaFieldGroup_SAID, metricShortName, metricFormat, 
                    isVisible, isMandatory, isLogVisible, groupName, fieldType, description_Txt, defaultValue, dataType, categoryCode, constraint_Txt);
            }
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Client/DeleteServiceAreaFieldInfo")]
        public IHttpActionResult DeleteServiceAreaFieldInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var categoryCode = values.categoryCode.ToString();
                var dataType = string.IsNullOrEmpty(values.dataType.ToString()) ? "" : values.dataType.ToString();
                var defaultValue = values.defaultValue.ToString();
                var description_Txt = values.description_Txt.ToString();
                var fieldType = int.Parse(values.fieldType.ToString());
                var groupName = values.groupName.ToString();
                var isLogVisible = int.Parse(values.isLogVisible.ToString());
                var isMandatory = int.Parse(values.isMandatory.ToString());
                var isVisible = string.IsNullOrEmpty(values.isVisible.ToString()) ? 0 : values.isVisible.ToString() == "true" ? 1 : 0;
                var metricFormat = values.metricFormat.ToString();
                var metricShortName = values.metricShortName.ToString();
                var serviceAreaFieldGroup_SAID = string.IsNullOrEmpty(values.serviceAreaFieldGroup_SAID.ToString()) ? 0 : int.Parse(values.serviceAreaFieldGroup_SAID.ToString());
                var shade = values.shade.ToString();
                var svcFieldID = int.Parse(values.svcFieldID.ToString());
                var svcFieldName = values.svcFieldName.ToString();
                var svcFieldNumber = int.Parse(values.svcFieldNumber.ToString());
                var svcID = int.Parse(values.svcID.ToString());
                var constraint_Txt = values.constraint_Txt.ToString();
                result = UserService.SaveServiceAreaFieldInfo(svcID, svcFieldNumber, svcFieldName, svcFieldID, shade, serviceAreaFieldGroup_SAID, metricShortName, metricFormat,
                    isVisible, isMandatory, isLogVisible, groupName, fieldType, description_Txt, defaultValue, dataType, categoryCode, constraint_Txt);
            }
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Client/SaveServiceAreaFieldLOV")]
        public IHttpActionResult SaveServiceAreaFieldLOV([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));
            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                //var serviceAreaFieldLOV_SAID = string.IsNullOrEmpty(values.serviceAreaFieldLOV_SAID.ToString()) ? 0 : int.Parse(values.serviceAreaFieldLOV_SAID.ToString());
                var recId = int.Parse(values.recid.ToString());
                var svcFieldId = int.Parse(values.svcFieldId.ToString());
                var fieldId = int.Parse(values.FieldId.ToString());
                var fieldText= values.FieldText.ToString();
                result = UserService.SaveServiceAreaFieldLOV(recId, svcFieldId, fieldId, fieldText);
            }
            return Ok(result);
        }

        [HttpPost]
        [Route("api/Client/SaveUserInfo")]
        public IHttpActionResult SaveUserInfo([FromBody] JObject value)
        {
            log.Info(string.Format("{0}: {1} is called: {2}", this._email, System.Reflection.MethodBase.GetCurrentMethod().ToString(), value.ToString()));

            var result = 0;
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);
            {
                var UserID = int.Parse(values.UserID.ToString()); 
                var fullname = values.fullname.ToString();
                var userName = values.userName.ToString();
                var AccountType = values.AccountType.id.ToString();
                var userStatus = int.Parse(values.userStatus.id.ToString());
                var resetflag = int.Parse(values.resetflag.id.ToString());
                var Upload_ind = int.Parse(values.Upload_ind.id.ToString());
                var MstrUser_Ind = int.Parse(values.MstrUser_Ind.id.ToString());
                var GoldReports_ind = int.Parse(values.GoldReports_ind.id.ToString());
                var admin = int.Parse(values.admin.id.ToString());
                var ClientID = int.Parse(values.ClientID.ToString());
                var ClientFolderName = values.ClientFolderName.ToString();
                var managerUserName = values.managerUserName.ToString();
                var company_nm = values.company_nm.ToString();
                var contact_phone_nbr = values.contact_phone_nbr.ToString();
                var visit_cnt = int.Parse(values.visit_cnt.ToString());
                result = UserService.SaveUserInfo(UserID, fullname, userName, AccountType, userStatus, resetflag, Upload_ind, MstrUser_Ind, GoldReports_ind,
                    admin, ClientID, ClientFolderName, managerUserName, company_nm, contact_phone_nbr, visit_cnt);
            }
            return Ok(result);
        }

        [HttpGet]
        [Route("api/Client/GetClientSettings")]
        public IHttpActionResult GetClientSettings()
        {
            return Ok(ClientHierarchyService.GetClientSettings());
        }

        [HttpGet]
        [Route("api/Client/ClientLookup")]
        //public HttpResponseMessage CientLookup(DataSourceLoadOptionsBase loadOptions)
        public IHttpActionResult ClientLookup()
        {
            var lookup = ClientHierarchyService.GetClientLookup();
            return Ok(lookup);
        }

        [HttpGet]
        [Route("api/Client/GetClientLookup")]
        public HttpResponseMessage GetClientLookup(DataSourceLoadOptionsBase loadOptions)
        {
            //var loadOptions = new DataSourceLoadOptionsBase(); 
            loadOptions = new DataSourceLoadOptionsBase();
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var lookup = dbContext.Database.SqlQuery<OptionSelectorFilter>("select distinct clientid as Value, clientname as Text FROM [EDS_TDB].[dbo].[Client]").ToList();
                    return Request.CreateResponse(DataSourceLoader.Load(lookup, loadOptions));
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        [HttpPost]
        [Route("api/Client/BatchSaveClientSettings")]
        public HttpResponseMessage BatchSaveClientSettings([FromBody] List<DataChange> changes)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    foreach (var change in changes)
                    {
                        ClientSetting clientSetting;

                        if (change.Type == "update" || change.Type == "remove")
                        {
                            var key = Convert.ToInt32(change.Key);
                            clientSetting = dbContext.ClientSettings.First(o => o.clientID== key);
                        }
                        else
                        {
                            clientSetting = new ClientSetting();
                        }

                        if (change.Type == "insert" || change.Type == "update")
                        {
                            JsonConvert.PopulateObject(change.Data.ToString(), clientSetting);

                            Validate(clientSetting);
                            if (!ModelState.IsValid)
                                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState.ToFullErrorString());// ModelState.GetFullErrorMessage());

                            if (change.Type == "insert")
                            {
                                dbContext.ClientSettings.Add(clientSetting);
                            }
                            change.Data = clientSetting;
                        }
                        else if (change.Type == "remove")
                        {
                            dbContext.ClientSettings.Remove(clientSetting);
                        }
                    }

                    dbContext.SaveChanges();

                    return Request.CreateResponse(HttpStatusCode.OK, changes);
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        [HttpPost]
        [Route("api/Client/BatchSaveClientSetting")]
        public HttpResponseMessage BatchSaveClientSetting([FromBody] List<DataChange> changes)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    foreach (var change in changes)
                    {
                        REF_AccountInfo accountInfo;

                        if (change.Type == "update" || change.Type == "remove")
                        {
                            var key = Convert.ToInt32(change.Key);
                            accountInfo = dbContext.REF_AccountInfo.First(o => o.ClientID == key);
                        }
                        else
                        {
                            accountInfo = new REF_AccountInfo();
                        }

                        if (change.Type == "insert" || change.Type == "update")
                        {
                            JsonConvert.PopulateObject(change.Data.ToString(), accountInfo);

                            Validate(accountInfo);
                            if (!ModelState.IsValid)
                                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState.ToFullErrorString());// ModelState.GetFullErrorMessage());

                            if (change.Type == "insert")
                            {
                                dbContext.REF_AccountInfo.Add(accountInfo);
                            }
                            change.Data = accountInfo;
                        }
                        else if (change.Type == "remove")
                        {
                            dbContext.REF_AccountInfo.Remove(accountInfo);
                        }
                    }

                    dbContext.SaveChanges();

                    return Request.CreateResponse(HttpStatusCode.OK, changes);
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }


        }

        [HttpPost]
        [Route("api/Client/Auth")]
        public IHttpActionResult Auth([FromBody] JObject value)
        {
            var json = value.ToString(Formatting.None);
            dynamic values = JObject.Parse(json);

            var email = values.data.email.ToString();
            var password = values.data.password.ToString();

            try
            {
                var userSvc = new UserService();
                User user = userSvc.ValidateUser(email, password);
                if (user != null)
                {
                    if (user.CompanyName == null) user.CompanyName = "Milbank";
                    var token = Providers.OAuthProvider.GenerateToken(user.Email, user.AccountType, user.ClientID.ToString(), user.CompanyName);

                    user.Id = user.ClientID;
                    var roles = new List<string>();
                    roles.Add(user.AccountType);
                    var role = "Guest";
                    switch (user.AccountType)
                    {
                        case "A":
                            role = "Administrator";
                            break;
                        case "M":
                            role = "Manager";
                            break;
                        case "U":
                            role = "User";
                            break;
                        default:
                            break;
                    }
                    var userED = new UserED
                    {
                        displayName = "Executive Dashboard",
                        username = user.Email,
                        occupation = role,
                        avatar = "assets/images/avatars/" + role + ".png",
                        photoURL = _eDUploadsFolderLocation + "/" + user.ClientID + ".png",
                        shortcuts = "",
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        AccountType = user.AccountType,
                        ClientID = user.ClientID,
                        CompanyName = user.CompanyName
                    };

                    var userData = new UserData
                    {
                        User = userED,
                        Role = roles,
                        Access_Token = token
                    };

                    return Ok(userData);
                }
                else
                    return Unauthorized();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(ex.Message, ex);
                //return Problem($"Something Went Wrong in the {nameof(Login)}", statusCode: 500);
            }
        }

        [HttpGet]
        [Route("api/Client/GetClientData")]
        public IHttpActionResult GetClientData()
        {
            var lookup = ClientHierarchyService.GetClientData();
            return Ok(lookup);

            //return Ok(UserService.UpdateUserProfile(_email, contactNo));
        }

    }
}
