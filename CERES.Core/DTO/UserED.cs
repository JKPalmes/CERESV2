using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.DTO
{
    public class UserED : User
    {
        public string username { get; set; }
        public string displayName { get; set; }
        public string occupation { get; set; }
        public string avatar { get; set; }
        public string photoURL { get; set; }
        public string shortcuts { get; set; }

    }
}
