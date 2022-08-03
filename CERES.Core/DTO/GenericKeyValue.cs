using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CERES.Core.DTO
{
    public class GenericKeyValue
    {
        public int Id { get; set; }
        public string Value { get; set; }
    }

    public class StringKeyValue
    {
        public string Id { get; set; }
        public string Value { get; set; }
    }

    public class GenericValueList
    {
        public string Value { get; set; }
    }
}