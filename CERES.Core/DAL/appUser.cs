namespace CERES.Core.DAL
{
    using System;
    using System.Collections.Generic;
    
    public partial class AppUser
    {
        public int userID { get; set; }
        public string fullname { get; set; }
        public string userName { get; set; }
        public int clientID { get; set; }
        public string AccountType { get; set; }
        public byte? userStatus { get; set; }
        public DateTime? lastlogin_dttm { get; set; }

        public string managerusername { get; set; }
        public string managerfullname { get; set; }
        public string company_nm { get; set; }
        public string contact_phone_nbr { get; set; }

        public byte? Upload_ind { get; set; }
        public byte? GoldReports_ind { get; set; }
        public byte? MstrUser_ind { get; set; }

    }
}
