using CERES.Core.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.Repository
{
    public interface ITransactionV2Repository
    {
        IEnumerable<Transactions> GetAllByUserName(string userName, int pageSize, int pageNumber);
        Transactions GetById(int id);
        void Insert(Transactions transaction);
        void Update(Transactions transaction);
        void Save();
    }
}
