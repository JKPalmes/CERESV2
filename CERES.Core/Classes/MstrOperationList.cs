using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CERES.API.Entities
{
    public partial class MstrOperationList
    {
        public List<MstrOp> operationList { get; set; }
    }

}
