using CERES.Core.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.DTO
{
    public class ServiceAreaFieldExtended: ServiceAreaField
    {
        public string DisplaySvcFieldName { get; set; }
        public int SvcFieldRuleNumber { get; set; }

    }
}
