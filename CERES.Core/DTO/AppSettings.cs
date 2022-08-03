using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CERES.Core.DTO
{
    public class AppSettings
    {
        public string ServerFolderPath { get; set; }

        public string ReportsFolderLocation { get; set; }

        public string UploadsFolderLocation { get; set; }
        public int MaxUploadFileSize { get; set; }
        public string AllowedFileExtensions { get; set; }
        public int GridPageSize { get; set; }
        public int ValidPeriodForEdit { get; set; }
        public int ValidPeriodForView { get; set; }


    }
}
