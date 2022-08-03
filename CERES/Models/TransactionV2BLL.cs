using CERES.Core.DAL;
using CERES.Core.Repository;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace CERES.Web.Api.Models
{
    public class TransactionV2BLL
    {
        private Transactions _data;
        private JObject _json;
        private string _userName;
        public TransactionV2BLL(JObject json)
        {
            _json = json;
            var jObject = JsonConvert.SerializeObject(_json, Newtonsoft.Json.Formatting.Indented);
            var jObjectData = JsonConvert.DeserializeObject<Transactions>(jObject);
            _data = jObjectData;
            if(_data.tID==0)
                _data.JOB_ID = DateTime.Now.ToString("yyyyMMddHHmmssfff") + _data.locID.ToString();
        }

        
        public Transactions TransformData(string[] nullDefaultValueClientId)
        {
            //set status to COMPLETE when user sets the completion date
            var svcFields = Core.Services.ClientHierarchyService.GetServiceAreaFields(_data.svcID);
            var svcField = svcFields.Where(o => o.svcFieldName.ToLower().Trim().Contains("date completed") && o.FieldType==0).FirstOrDefault();
            var svcFieldStatus = svcFields.Where(o => o.svcFieldName.ToLower().Trim() == "status" && o.FieldType == 0).FirstOrDefault();

            var dateCompletedField = string.Empty;
            var dateCompletedValue = string.Empty;
            var statusField = string.Empty;
            bool isStatusFieldComplete = false;
            if (svcField != null)
                dateCompletedField = "StringField" + svcField.svcFieldNumber.ToString();

            if (svcFieldStatus != null)
                statusField = "StringField" + svcFieldStatus.svcFieldNumber.ToString();


            var dtNow = DateTime.Now;
            foreach (PropertyInfo propertyInfo in _data.GetType().GetProperties())
            {
                var nullItemClientId = Array.Find(nullDefaultValueClientId, e => e.Equals(_data.accountID.ToString()));
                //if (nullItemClientId != _data.accountID.ToString() && propertyInfo.Name.StartsWith("field") && propertyInfo.GetValue(_data, null) == null)
                //    propertyInfo.SetValue(_data, 0.0m);//0.0 metric for NON-LM
                //else if (nullItemClientId == _data.accountID.ToString() && propertyInfo.Name.StartsWith("field") && propertyInfo.GetValue(_data, null) == string.Empty)
                //    propertyInfo.SetValue(_data, null);//empty metric for LM

                if (propertyInfo.Name.StartsWith("field") && (propertyInfo.GetValue(_data, null) == null))// || propertyInfo.GetValue(_data, null) == string.Empty))
                    propertyInfo.SetValue(_data, null);
                else if (propertyInfo.Name.StartsWith("StringField") || propertyInfo.Name.StartsWith("Remarks"))
                {
                    var encodedData = propertyInfo.GetValue(_data);
                    propertyInfo.SetValue(_data, HttpUtility.HtmlEncode(encodedData));//ENCODE VERYTHING
                }

                //brb
                //trigger: set status to completed
                if (!string.IsNullOrEmpty(dateCompletedField))
                {
                    if (propertyInfo.Name.Equals(dateCompletedField))
                    {
                        dateCompletedValue = propertyInfo.GetValue(_data).ToString();
                        if (!string.IsNullOrEmpty(dateCompletedValue))
                            isStatusFieldComplete = true;
                    }
                }
            }

            var st = _data.GetType().GetProperties().Where(o => o.Name == statusField).FirstOrDefault();
            if (isStatusFieldComplete)
            {
                //st.SetValue(_data, "3");    //SET STATUS TO COMPLETED
                var prodMonth= _data.GetType().GetProperties().Where(o => o.Name == "tDate").FirstOrDefault();
                prodMonth.SetValue(_data, DateTime.Parse(dateCompletedValue));  //SET DELIVERY DATE TO PRODUCTION MONTH
                var statusCode = _data.GetType().GetProperties().Where(o => o.Name.ToLower().Trim() == "statuscode").FirstOrDefault();
                statusCode.SetValue(_data, "C");    //COMPLETED
            }

            //set transaction date to current date when the status field vallue is Complete or 3????
            //if (isStatusFieldComplete)
                //_data.tDate = dtNow;

            //_data.UpdateDate = dtNow;            
            if (_data.tID == 0 || string.IsNullOrEmpty(_data.CreationDate.ToString()))
                _data.CreationDate = dtNow;   //EF not working with default value 

            return _data;
        }

        public Transactions TransformData(string statusCode, string updateUserId, int userId)
        {
            _data.StatusCode = statusCode;
            _data.UpdateDate = DateTime.Now;
            _data.UpdateUserID = updateUserId;

            var origTranData = this.GetTransactionOwner(_data.tID);
            _data.UserID = Int32.Parse(origTranData[2]);
            _data.userName = origTranData[0];
            _data.CreationDate = DateTime.Parse(origTranData[1]);
            //TODO: set tdate from production month to production date when Status Field = COMPLETE

            return _data;
        }

        public List<string> GetTransactionOwner(int transactionId)
        {
            using (var tran = new TransactionV2())
            {
                var result = new List<string>();
                var transaction = tran.TransactionV2Repository.Get(o => o.tID == transactionId).FirstOrDefault();
                if (transaction != null)
                {
                    result.Add(transaction.userName);
                    result.Add(transaction.CreationDate.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                    result.Add(transaction.UserID.ToString());
                    return result;
                }
                return null;
            }
        }
    }
}