using RestSharp;
using RestSharp.Authenticators;
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using CERES.API.Entities;
using CERES.Core.DAL;
using CERES.Core.Classes;
using System.Net;
using System.Threading.Tasks;
using System.Linq;

namespace CERES.Core.Repository
{
    public class RequestHandler : IRequestHandler
    {
        private static IRestClient _restClient;
        private readonly BIDE_DbContext _context;
        //private readonly ILogger<RequestInfoRepository> _logger;

        public RequestHandler(BIDE_DbContext context)
        {
            _context = context;
            _restClient = new RestClient
            {
                BaseUrl = new Uri(RequestConstants.MstrBaseUrl)
            };
            _restClient.ConfigureWebRequest((r) =>
            {
                r.ServicePoint.Expect100Continue = false;
                r.KeepAlive = true;
            });

        }
        public RequestHandler(IRestClient restClient)
        {
            _restClient = restClient;
        }

        public string GetMstrAuthToken(out string cookie)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;

            var loginData = new MstrUserTokenAccount
            {
                loginMode = 1,
                username = RequestConstants.MSTR_USERNAME,
                password = RequestConstants.MSTR_PASSWORD
            };

            var request = new RestRequest { Resource = "auth/login" };
            request.AddHeader(RequestConstants.UserAgent, RequestConstants.UserAgentValue);
            request.AddHeader("content-type", "application/json");
            request.AddParameter("application/json", JsonConvert.SerializeObject(loginData), ParameterType.RequestBody);
            request.Method = Method.POST;
            request.OnBeforeDeserialization = resp => { resp.ContentType = "application/json"; };
            //var queryResult = _restClient.Execute<Object>(request);
            //var authorizationToken = queryResult.Headers[0].Value.ToString();
            //cookie = queryResult.Cookies[0].Value.ToString();
            IRestResponse response = _restClient.Execute(request);

            var authorizationToken = response.Headers.ToList()
                .Find(x => x.Name == "X-MSTR-AuthToken")
                .Value.ToString();

            //string xCookie = _restClient.CookieContainer.GetCookieHeader(new Uri(RequestConstants.MstrBaseUrl));
            //string[] parsedStrings = xCookie.Split(new char[] { '=' });
            //IList<RestResponseCookie> cookies = response.Cookies;
            //var restResponseCookie = new RestResponseCookie()
            //{
            //    Name = parsedStrings[0],
            //    Value = parsedStrings[1]
            //};
            //cookie = restResponseCookie.Value.ToString();

            cookie = response.Cookies.ToList()[0].Value.ToString();
            //.Find(x => x.Name == "X-MSTR-AuthToken")
            //.Value.ToString();


            return authorizationToken;
        }

        public async System.Threading.Tasks.Task<IRestResponse> GetMstrAuthTokenAsync()
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;

            var loginData = new MstrUserTokenAccount
            {
                loginMode = 1,
                username = RequestConstants.MSTR_USERNAME,
                password = RequestConstants.MSTR_PASSWORD
            };

            var request = new RestRequest { Resource = "auth/login" };
            //request.AddHeader(RequestConstants.UserAgent, RequestConstants.UserAgentValue);
            //request.AddHeader("content-type", "application/json");
            request.AddParameter("application/json", JsonConvert.SerializeObject(loginData), ParameterType.RequestBody);
            request.Method = Method.POST;
            //request.OnBeforeDeserialization = resp => { resp.ContentType = "application/json"; };

            IRestResponse response = await _restClient.ExecuteAsync(request);

            return response;

        }
        public string GetMstrUsers(string token, string cookie)
        {
            //string cookie = "";
            //var mstrToken = GetMstrAuthToken(out cookie);

            var request = new RestRequest { Resource = "users/" };
            request.AddCookie("JSESSIONID", cookie);
            request.AddHeader(RequestConstants.UserAgent, RequestConstants.UserAgentValue);
            request.AddHeader("content-type", "application/json");
            request.AddHeader("X-MSTR-AuthToken", token);
            //request.AddParameter("application/json; charset=utf-8", JsonConvert.SerializeObject(operationList), ParameterType.RequestBody);
            request.Method = Method.GET;
            request.OnBeforeDeserialization = resp => { resp.ContentType = "application/json"; };
            var queryResult = _restClient.Execute<Object>(request);
            var json = JsonConvert.SerializeObject(queryResult.Data);

            return json;

        }
        public string GetMstrUserId(string token, string cookie, string name)
        {
            var users = GetMstrUsers(token, cookie);
            dynamic jsonObj = JsonConvert.DeserializeObject(users);

            var mstrUserId = "";
            foreach (var o in jsonObj)
            {
                if (o.abbreviation == name)
                {
                    mstrUserId = o.id;
                    break;
                }
            }

            return mstrUserId;
        }

        public string UpdateMstrAccount(string name, string pwd)
        {
            //var mstrResp = Task.Run(() => GetMstrAuthTokenAsync()).Result;
            //var mstrToken = mstrResp.Headers[0].Value.ToString();
            //var cookie = mstrResp.Cookies[0].Value.ToString();

            //var mstrToken = mstrResp.Headers.First().Value.ToString();
            //var cookie = mstrResp.Cookies.First().Value.ToString();

            var cookie = "";
            var mstrToken = GetMstrAuthToken(out cookie);

            var mstrUserId = GetMstrUserId(mstrToken, cookie, name);

            var replaceOp = new MstrOp
            {
                op = "replace",
                path = "/password",
                value = pwd
            };

            var list = new List<MstrOp>();
            list.Add(replaceOp);
            var opList = new MstrOperationList();
            opList.operationList = list;

            var request = new RestRequest { Resource = "users/" + mstrUserId };
            request.AddCookie("JSESSIONID", cookie);
            request.AddHeader(RequestConstants.UserAgent, RequestConstants.UserAgentValue);
            request.AddHeader("content-type", "application/json");
            request.AddHeader("X-MSTR-AuthToken", mstrToken);
            request.AddParameter("application/json; charset=utf-8", JsonConvert.SerializeObject(opList), ParameterType.RequestBody);
            request.Method = Method.PATCH;
            request.OnBeforeDeserialization = resp => { resp.ContentType = "application/json"; };
            var queryResult = _restClient.Execute<Object>(request);
            var json = JsonConvert.SerializeObject(queryResult.Data);

            return json;

        }

    }
}