using CERES.Core.DAL;
using CERES.Core.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.Repository
{
    public class TransactionV2Repository:ITransactionV2Repository, IDisposable
    {
        private readonly BIDE_DbContext _context;

        public TransactionV2Repository()
        {
            _context = new BIDE_DbContext();
        }
        public TransactionV2Repository(BIDE_DbContext context)
        {
            _context = context;
        }

        public Transactions GetById(int id)
        {
            return _context.Transactions.Where(e => e.tID == id).FirstOrDefault();
        }

        public IEnumerable<Transactions> GetAllByUserName(string userName, int pageSize, int pageNumber)
        {
            return _context.Transactions.Where(e => e.userName == userName)
                .Take(pageSize);
        }

        public void Insert(Transactions data)
        {
            _context.Transactions.Add(data);            
        }

        public void Update(Transactions data)
        {
            _context.Entry(data).State = System.Data.Entity.EntityState.Modified;            
        }

        public void Save()
        {
            _context.SaveChanges();
        }

        private bool disposed = false;
        protected virtual void Dispose(bool disposing)
        {
            if (!this.disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
            }
            this.disposed = true;
        }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
