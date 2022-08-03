using CERES.Core.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.Repository
{
    public interface ITransactionV2: IUnitOfWork
    {
        IRepository<Transactions> TransactionV2Repository { get; }
    }

    public class TransactionV2 : ITransactionV2, IDisposable
    {
        private BIDE_DbContext _db = new BIDE_DbContext();

        private EFRepository<Transactions> _TransactionsRepository;


        public IRepository<Transactions> TransactionV2Repository
        {
            get
            {
                if (_TransactionsRepository == null)
                    _TransactionsRepository = new EFRepository<Transactions>(_db);
                return _TransactionsRepository;
            }
        }

        public void Save()
        {
            _db.SaveChanges();
        }
        
        private bool _disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!this._disposed)
            {
                if (disposing)
                {
                    _db.Dispose();
                }
            }
            this._disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

    }
}
