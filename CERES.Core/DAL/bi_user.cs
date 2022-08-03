namespace BIDE_GOLD.Core.DAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class bi_user
    {
        public int UserID { get; set; }
        public string fullname { get; set; }
        public string userName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string AccountType { get; set; }
        public int ClientID { get; set; }
        public System.DateTime LastLogin { get; set; }

        public string ManagerUserName { get; set; }
        public string ManagerFullName { get; set; }
        public string CompanyName { get; set; }
        public string ContactNo { get; set; }

        public byte Upload_Ind { get; set; }
        public byte GoldReports_Ind { get; set; }
        public byte MstrUser_Ind { get; set; }

    }
}
