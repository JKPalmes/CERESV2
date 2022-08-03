using System;
using System.IO;

namespace CERES.Core.Classes
{
    public class  FileSystemItem
    {
        public string Name { get; set; }
        public string FullName { get; set; }
        public long? Size { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime LastAccessTime { get; set; }
        public DateTime LastWriteTime { get; set; }
        public bool IsDirectory { get; set; }
     

        public FileSystemItem(FileInfo file)
        {
            
            Name = file.Name;
        FullName = file.FullName;
            Size = file.Length;
        CreationTime = file.CreationTime;
        LastAccessTime = file.LastAccessTime;
        LastWriteTime = file.LastWriteTime;
          
            
        IsDirectory = false;
        }

        public FileSystemItem(DirectoryInfo folder)
        {
            Name = folder.Name;
            FullName = folder.FullName;
            //Size = file.Length;
            CreationTime = folder.CreationTime;
            LastAccessTime = folder.LastAccessTime;
            LastWriteTime = folder.LastWriteTime;
            IsDirectory = true;
        }

        public FileSystemItem()
        {
        }

        public string FileSystemType
    {
        get
        {
            if (this.IsDirectory)
                return "File folder";
            else
            {
                var extension = Path.GetExtension(this.Name);

                if (IsMatch(extension, ".txt"))
                    return "Text file";
                else if (IsMatch(extension, ".pdf"))
                    return "PDF file";
                else if (IsMatch(extension, ".doc", ".docx"))
                    return "Microsoft Word document";
                else if (IsMatch(extension, ".xls", ".xlsx"))
                    return "Microsoft Excel document";
                else if (IsMatch(extension, ".jpg", ".jpeg"))
                    return "JPEG image file";
                else if (IsMatch(extension, ".gif"))
                    return "GIF image file";
                else if (IsMatch(extension, ".png"))
                    return "PNG image file";


                // If we reach here, return the name of the extension
                if (string.IsNullOrEmpty(extension))
                    return "Unknown file type";
                else
                    return extension.Substring(1).ToUpper() + " file";
            }
        }
    }
        private bool IsMatch(string extension, params string[] extensionsToCheck)
    {
        foreach (var str in extensionsToCheck)
            if (string.CompareOrdinal(extension, str) == 0)
                return true;

        // If we reach here, no match
        return false;
    }
    }

}