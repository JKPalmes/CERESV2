using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CERES.Core.DAL;
using CERES.Core.DTO;

namespace CERES.Core.Services
{
    public static class ClientHierarchyService
    {
        public static IEnumerable<vwServiceAreaFieldLOV> GetAllServiceAreaFieldLOVs(List<int> svcFields)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.vwServiceAreaFieldLOVs.Where(o => svcFields.Contains(o.svcFieldId)).ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<ServiceAreaFieldLOV> GetServiceAreaFieldLOVs(List<int> svcFields)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.ServiceAreaFieldLOVs.Where(o => svcFields.Contains(o.svcFieldId)).ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<ServiceAreaField> GetServiceAreaFields(int value)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.ServiceAreaFields.Where(e => e.svcID == value).OrderBy(o => o.FieldType).ThenBy(n => n.svcFieldNumber).ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    //throw new InvalidOperationException(e.Message, e);
                    return new List<ServiceAreaField>();
                }
            }
        }

        public static IEnumerable<GenericKeyValue> GetServiceAreaByLocationId(int value)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.Database.SqlQuery<GenericKeyValue>("EXEC Get_ServiceAreaList3 @locID",
                        new SqlParameter("@locID", value)).ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<GenericKeyValue> GetLocationBySiteId(int value)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.Database.SqlQuery<GenericKeyValue>("EXEC Get_LocationList3 @siteID",
                        new SqlParameter("@siteID", value)).ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<GenericKeyValue> GetSiteByClientByIdAndUserName(UserSelectorFilter value)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.Database.SqlQuery<GenericKeyValue>("EXEC Get_SiteList3 @clientID, @userName",
                        new SqlParameter("@clientID", value.Id),
                        new SqlParameter("@userName", value.UserName)).ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<GenericKeyValue> GetClientByUserName(string value)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.Database.SqlQuery<GenericKeyValue>("EXEC Get_ClientList3 @userName", new SqlParameter("@userName", value)).ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<site> GetSites()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var sites = dbContext.sites.ToList();
                    return sites;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<location> GetLocations()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var locations = dbContext.locations.ToList();
                    return locations;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<ServiceArea> GetServiceAreas()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var serviceAreas = dbContext.ServiceAreas.ToList();
                    return serviceAreas;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<StringKeyValue> GetTop10ServiceAreasByUserName(string value)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var serviceAreas = dbContext.Database.SqlQuery<StringKeyValue>("EXEC Get_ServiceAreaListTop10ByUser @userName", new SqlParameter("@userName", value)).ToList();
                    return serviceAreas;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static string GetServiceAreaCategory(int svcId)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var result = dbContext.Database.SqlQuery<string>("select ServiceCategory FROM ServiceArea where svcid = " + svcId).FirstOrDefault();
                    return result;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<GenericKeyValue> GetServiceAreaCategories()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var serviceAreaCategories = dbContext.Database.SqlQuery<GenericKeyValue>("select distinct svcId as Id, REPLACE(REPLACE(ServiceCategory,' ',''), '&','') as Value from ServiceArea").ToList();
                    //var serviceAreaCategories = dbContext.Database.SqlQuery<GenericKeyValue>("select distinct svcId as Id, ServiceCategory as Value from ServiceArea").ToList();
                    return serviceAreaCategories;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<REF_AccountInfo> GetApproverInfo()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var accountInfo = dbContext.Database.SqlQuery<REF_AccountInfo>("SELECT * from vwGetApproverInfo").ToList();
                    return accountInfo;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }
        public static IEnumerable<AccountInfo> GetAccountInfos()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var accountInfos = dbContext.Database.SqlQuery<AccountInfo>("SELECT * from vwGetAccountInfos").ToList();
                    return accountInfos;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<AccountInfo> GetClientInfo(int clientId)
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var accountInfos = dbContext.Database.SqlQuery<AccountInfo>("SELECT top 1* from vwGetApproverInfo where clientId = " + clientId).ToList();
                    return accountInfos;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<user> GetUsers()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var users = dbContext.User.ToList();
                    return users;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

        public static IEnumerable<ClientSetting> GetClientSettings()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var settings = dbContext.ClientSettings.ToList();
                    return settings;
                }
                catch (Exception e)
                {
                    //throw new InvalidOperationException(e.Message, e);
                    return null;
                }
            }
        }

        public static IEnumerable<OptionSelectorFilter> GetClientLookup()
        {
            using (BIDE_DbContext dbContext = new BIDE_DbContext())
            {
                try
                {
                    var lookup = dbContext.Database.SqlQuery<OptionSelectorFilter>("select distinct clientid as Value, clientname as Text FROM [EDS_TDB].[dbo].[Client]").ToList();
                    return lookup;
                }
                catch (Exception e)
                {
                    throw new InvalidOperationException(e.Message, e);
                }
            }
        }

    }
}
