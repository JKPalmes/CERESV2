﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace CERES.Core.DAL
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class BIDE_DbContext : DbContext
    {
        public BIDE_DbContext()
            : base("name=BIDE_DbContext")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<ServiceAreaField> ServiceAreaFields { get; set; }
        public virtual DbSet<Transactions> Transactions { get; set; }
        public virtual DbSet<Client> Clients { get; set; }
        public virtual DbSet<location> locations { get; set; }
        public virtual DbSet<ServiceArea> ServiceAreas { get; set; }
        public virtual DbSet<vwGet_ClientList2> vwGet_ClientList2 { get; set; }
        public virtual DbSet<ServiceAreaFieldLOV> ServiceAreaFieldLOVs { get; set; }
        public virtual DbSet<user> User { get; set; }
        public virtual DbSet<site> sites { get; set; }
        public virtual DbSet<vwServiceAreaFieldLOV> vwServiceAreaFieldLOVs { get; set; }
        public virtual DbSet<ClientSetting> ClientSettings { get; set; }
        public virtual DbSet<REF_AccountInfo> REF_AccountInfo { get; set; }
    }
}