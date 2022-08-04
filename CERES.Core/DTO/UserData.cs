using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.DTO
{
    public class UserData
    {
        public UserED User { get; set; }

        public List<string> Role { get; set; }
        public string Access_Token { get; set; }


    }
}
