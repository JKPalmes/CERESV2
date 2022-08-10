using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CERES.API.Entities
{
    public partial class MstrOp
    {
        public string op { get; set; }
        public string path { get; set; }
        public string value { get; set; }
    }

}
