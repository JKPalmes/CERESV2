using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.Repository
{
    public interface IRepository<TEntity> where TEntity : class
    {
        IEnumerable<TEntity> Get();

        IEnumerable<TEntity> Get(
           Expression<Func<TEntity, bool>> filter = null);

        IEnumerable<TEntity> Get(
           Expression<Func<TEntity, bool>> filter = null,
           string[] includePaths = null);

        IEnumerable<TEntity> Get(
           Expression<Func<TEntity, bool>> filter = null,
           string[] includePaths = null,
           int? page = 0,
           int? pageSize = null,
           params SortExpression<TEntity>[] sortExpressions);

        void Add(TEntity entity);

        void Alter(TEntity entity);

        void Remove(TEntity entity);
        
    }

    public class SortExpression<TEntity> where TEntity : class
    {
        public SortExpression(Expression<Func<TEntity, object>> sortBy, ListSortDirection sortDirection)
        {
            SortBy = sortBy;
            SortDirection = sortDirection;
        }

        public Expression<Func<TEntity, object>> SortBy { get; set; }
        public ListSortDirection SortDirection { get; set; }
    }

    public class EFRepository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        private DbContext db;
        private DbSet<TEntity> dbSet;

        public EFRepository(DbContext context)
        {
            this.db = context;
            this.dbSet = context.Set<TEntity>();
        }

        public IEnumerable<TEntity> Get()
        {
            return Get(null, null, null, null, null);
        }

        public IEnumerable<TEntity> Get(
            Expression<Func<TEntity, bool>> filter = null)
        {
            return Get(filter, null, null, null, null);
        }

        public IEnumerable<TEntity> Get(
            Expression<Func<TEntity, bool>> filter = null,
            string[] includePaths = null)
        {
            return Get(filter, includePaths, null, null, null);
        }

        public IEnumerable<TEntity> Get(
           Expression<Func<TEntity, bool>> filter = null,
           string[] includePaths = null,
           int? page = null,
           int? pageSize = null,
           params SortExpression<TEntity>[] sortExpressions)
        {
            IQueryable<TEntity> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            if (includePaths != null)
            {
                for (var i = 0; i < includePaths.Count(); i++)
                {
                    query = query.Include(includePaths[i]);
                }
            }

            if (sortExpressions != null)
            {
                IOrderedQueryable<TEntity> orderedQuery = null;
                for (var i = 0; i < sortExpressions.Count(); i++)
                {
                    if (i == 0)
                    {
                        if (sortExpressions[i].SortDirection == ListSortDirection.Ascending)
                        {
                            orderedQuery = query.OrderBy(sortExpressions[i].SortBy);
                        }
                        else
                        {
                            orderedQuery = query.OrderByDescending(sortExpressions[i].SortBy);
                        }
                    }
                    else
                    {
                        if (sortExpressions[i].SortDirection == ListSortDirection.Ascending)
                        {
                            orderedQuery = orderedQuery.ThenBy(sortExpressions[i].SortBy);
                        }
                        else
                        {
                            orderedQuery = orderedQuery.ThenByDescending(sortExpressions[i].SortBy);
                        }

                    }
                }

                if (page != null)
                {
                    query = orderedQuery.Skip(((int)page - 1) * (int)pageSize);
                }
            }

            if (pageSize != null)
            {
                query = query.Take((int)pageSize);
            }

            return query.ToList();
        }

        public virtual void Add(TEntity entity)
        {
            this.dbSet.Add(entity);
        }

        public virtual void Remove(TEntity entityToDelete)
        {
            if (this.db.Entry(entityToDelete).State == EntityState.Detached)
            {
                this.dbSet.Attach(entityToDelete);
            }
            this.dbSet.Remove(entityToDelete);
        }

        public virtual void Alter(TEntity entityToUpdate)
        {
            this.dbSet.Attach(entityToUpdate);
            this.db.Entry(entityToUpdate).State = EntityState.Modified;
        }

    }

    public interface IUnitOfWork
    {
        void Save();
    }


}
