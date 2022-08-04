using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CERES.Core.DTO
{
    public class UserSelectorFilter
    {
        public int Id { get; set; }
        public string UserName { get; set; }
    }

    public class ClientSelectorFilter
    {
        public int ClientID { get; set; }
        public string AccountName { get; set; }
    }

    public class OptionSelectorFilter
    {
        public int Value { get; set; }
        public string Text { get; set; }
    }

    public class ClientSelector
    {
        public string AccountIdName { get; set; }
    }

}