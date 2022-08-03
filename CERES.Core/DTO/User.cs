using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.DTO
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string AccountType { get; set; }
        public int ClientID { get; set; }
        public System.DateTime LastLogin { get; set; }

        public string ManagerUserName { get; set; }
        public string ManagerFullName { get; set; }
        public string CompanyName { get; set; }
        public string ContactNo { get; set; }
        public int CanUpload { get; set; }
        public int AccessGoldReports { get; set; }
        public int MstrUser { get; set; }


    }
}
