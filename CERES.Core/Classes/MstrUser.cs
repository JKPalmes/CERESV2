using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CERES.Core.Classes
{
    public partial class MstrUser
    {
        [Key]
        public string Id { get; set; }
        public string username { get; set; }
        public string fullName { get; set; }
        public string description { get; set; }
        public string password { get; set; }
        public int? enabled { get; set; }
        public int? passwordModifiable { get; set; }
        public int? standardAuth { get; set; }
        public List<string> memberships { get; set; }
    }
}
