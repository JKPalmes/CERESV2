using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.StaticFiles;
using Owin;

namespace CERES.Web.Api
{

    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);

            //appBuilder.UseStaticFiles("/BI_Reports");
            // File Server
            //var options = new FileServerOptions
            //{
            //    EnableDirectoryBrowsing = true,
            //    EnableDefaultFiles = true,
            //    //DefaultFilesOptions = { DefaultFileNames = { "index.html" } },
            //    FileSystem = new PhysicalFileSystem("D:\\BI_Reports"),
            //};

            //app.UseFileServer(options);
        }
    }
    
}
