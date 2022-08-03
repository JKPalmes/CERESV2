namespace CERES.Core.DAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class AccountInfo
    {
        public int ClientID { get; set; }
        public int SiteID { get; set; }
        public int LocationID { get; set; }
        public int ServiceAreaID { get; set; }

        public string AccountName { get; set; }
        public bool ClientStatus { get; set; }

        public string StatusCode { get; set; }
        public System.DateTime CreateDate { get; set; }
        public string SiteFolderName { get; set; }

        public string Email { get; set; }
        public string AccountOwner { get; set; }
        public string PhoneNumber { get; set; }
        public string Comment { get; set; }
        public string SiteName { get; set; }
        public string LocationName { get; set; }
        public string Continent { get; set; }
        public string Country { get; set; }
        public string CBPSRegion { get; set; }
        public string State { get; set; }
        public string City { get; set; } 
        public string Campus { get; set; }
        public string Building { get; set; }
        public string Floor { get; set; }
        public string Area { get; set; }
        public string Office { get; set; }
        public string ServiceAreaName { get; set; }
        public bool ServiceAreaStatus { get; set; }
        public string ServiceAreaCategory { get; set; }
        public bool SiteStatus { get; set; }
        public bool LocStatus { get; set; }

    }
}
