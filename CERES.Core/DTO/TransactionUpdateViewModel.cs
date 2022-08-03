using CERES.Core.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.DTO
{
    public class TransactionUpdateViewModel
    {
        public Transactions Transaction { get; set; }
        public IEnumerable<TransactionV2Response> GenericTransactions { get; set; }
        public IEnumerable<TransactionsResponseModel> Transactions { get; set; }
        public IEnumerable<ServiceAreaField> ServiceAreaFields { get; set; }    
        public IEnumerable<ServiceAreaFieldLOV> FieldLOV { get; set; }
    }
}
