using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CERES.Core.Classes
{
    public partial class MstrUserTokenAccount
    {
        public int loginMode { get; set; }
        public string username { get; set; }
        public string password { get; set; }
    }
}
