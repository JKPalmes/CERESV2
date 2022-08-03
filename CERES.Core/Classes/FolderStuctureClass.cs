using GdPicture14;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;

namespace CERES.Core.Classes
{
    public class FolderStuctureClass
    {

        string _userName = "";
        public FolderStuctureClass(string userName)
        {
            _userName = userName;
        }

        public DirectoryInfo[] GetFolderStructure(string currentFolder, string folderPath, string loginUser)
        {

            //DirectoryInfo currentDirectoryInfo = new DirectoryInfo(currentFolder);
            DirectoryInfo currentDirectoryInfo = new DirectoryInfo(folderPath);
            DirectoryInfo[] folders = new DirectoryInfo[] { };
            SqlDataReader reader = null;
            List<FileSystemItem> gridItems = new List<FileSystemItem>();

            string selectStatement = String.Empty;
            int i = 0;
            List<string> folderList = new List<string>();
            // get the folder names from the table and check if they already exist on the current folder
            if (currentDirectoryInfo.Exists) //if there is a parent directory then continue
            {
                try
                {
                    //selectStatement = string.Format("SELECT Foldername FROM userTableConfig" +
                    //                                " INNER JOIN Users ON userTableConfig.userID=users.userID" +
                    //                                " Where users.userName LIKE '%{0}%'", loginUser.Trim());

                    selectStatement = string.Format("select distinct sitename FolderName  " +
                        " from dbo.vwBIWebUserFolderInfo  " +
                        " where userid = dbo.fnGetUserID('{0}') ", loginUser.Trim());//, currentFolder.Trim());
                    //--and lower(sitefoldername) like lower('{1}\\%)'

                    //selectStatement = "SELECT [siteFolderName] Foldername FROM [BIDataEntry_TEST].[dbo].[Site] where clientID in (select [ClientFolderName] "
                    //                + "FROM [BIDataEntry_TEST].[dbo].[Users] us WHERE userName LIKE case when '" + p_folderClick + "' = '' then '%" + loginUser.Trim() + "%' when '" + p_folderClick + "' = '..' then '%" + loginUser.Trim() + "%' else '$$' end) "
                    //                + "union all "
                    //                + "SELECT [locName] Foldername FROM [BIDataEntry_TEST].[dbo].[Location] "
                    //                + "where siteID = (SELECT top 1 [siteID] FROM [BIDataEntry_TEST].[dbo].[Site] "
                    //                + "                where siteFolderName like case when '" + p_folderClick + "' = '' then '$$' else '%" + p_folderClick + "' end) "
                    //                + "and [ParentDir] = '" + p_folderClick+ "'";

                    using (SqlConnection connection = new SqlConnection())
                    {
                        using (SqlCommand command = new SqlCommand())
                        {
                            connection.ConnectionString = Common.GetSqlConnectionString();
                            connection.Open();
                            command.CommandType = CommandType.Text;
                            command.CommandText = selectStatement;
                            command.Connection = connection;
                            reader = command.ExecuteReader();
                            if (!currentDirectoryInfo.Exists)

                                throw new DirectoryNotFoundException(
                                    String.Format(
                                        "The directory folder specified in the lookup table cannot be found in {0}",
                                        currentFolder));
                        }
                        while (reader.Read())
                        {
                            var folderVal = reader["FolderName"].ToString();
                            //add the new foldernames to the string array
                            folderList.Add(folderVal);
                        }

                        //use another loop to compare the folders from the table to what was clicked on the grid
                        //if the values in the grid don't match in the list then create a new Directory info
                        //int count = 0;
                        //foreach (var item in folderList)
                        //{
                        //    if (currentDirectoryInfo.FullName.Contains(item))
                        //    {
                        //        return folders;
                        //    }
                        //}

                        DirectoryInfo[] foldersAInfos = new DirectoryInfo[folderList.Count];
                        foreach (string check in folderList)
                        {
                            //foldersAInfos[i] = new DirectoryInfo(currentFolder + "\\" + check);
                            foldersAInfos[i] = new DirectoryInfo(check);
                            i += 1;
                        }
                        folders = foldersAInfos;
                    }
                }
                catch (DataException exception)
                {
                    System.Data.DataException dataException =
                        new System.Data.DataException(exception.InnerException.ToString());
                    throw dataException;
                }
            }
            else
            {

                HttpContext.Current.Session["Errors"] = new DirectoryNotFoundException("There is a directory missing from the file system that doesn't match the table directory structure.");
                HttpContext.Current.Response.Redirect("ErrorPages/Oops.aspx");
            }
            return folders;
        }

        public TreeNode PopulateTree()
        {
            //TreeNode nodeUsers = new TreeNode(p_username, GetLoggedInPathFromUserName()); //"11"
            //TreeNode nodeUsers = new TreeNode(p_username, p_username);
            var i = 1;
            var tNodes = new TreeNode(i, _userName.ToString().Trim(), true, ""); ;
            string _ConnectionString = Common.GetSqlConnectionString();
            try
            {
                System.Data.SqlClient.SqlConnection conn = new System.Data.SqlClient.SqlConnection(_ConnectionString);
                conn.Open();
                System.Data.SqlClient.SqlCommand comm = new System.Data.SqlClient.SqlCommand();
                //comm.CommandText =
                //    string.Format("select clientName,siteFolderName from client where userid = (select userid from users WHERE userName LIKE '%{0}%') order by clientID", Session["userName"].ToString().Trim());
                comm.CommandText =
                    string.Format("select distinct cl.clientname, cl.sitefoldername from dbo.UserFolderConfig ufc INNER JOIN dbo.Users usr ON ufc.userid = usr.userid  INNER JOIN dbo.Client cl on ufc.clientid = cl.clientid where ufc.userid = dbo.fnGetUserID('{0}') order by cl.clientname", _userName.ToString().Trim());
                comm.CommandType = System.Data.CommandType.Text;
                comm.Connection = conn;
                //reader = new System.Data.SqlClient.SqlDataReader();
                System.Data.SqlClient.SqlDataReader reader = comm.ExecuteReader();

                while (reader.Read())
                {
                    //nodeUsers.ChildNodes.Add(new TreeNode(reader["clientName"].ToString(), reader["siteFolderName"].ToString()));
                    i++;
                    tNodes.Add(new TreeNode(i, reader["clientName"].ToString(), true, reader["siteFolderName"].ToString()));
                }
                conn.Close();
                comm.Dispose();
            }
            catch (System.Data.SqlClient.SqlException sqlException)
            {
                string mm = sqlException.Message;
            }
            //TreeView1.Nodes.Add(nodeUsers);
            //var t = tNodes;
            var treeNodes = GetTreeFor_Sites(tNodes);
            return treeNodes;
            //GetTreeFor_Locations();
        }

        public TreeNode GetTreeFor_Sites(TreeNode tNodes)
        {
            string _ConnectionString = Common.GetSqlConnectionString();

            //foreach (TreeNode tUser in tNodes)
            //{
            var i = tNodes.items.Count;
            foreach (var tChild in tNodes.items)
            {
                try
                {
                    System.Data.SqlClient.SqlConnection conn = new System.Data.SqlClient.SqlConnection(_ConnectionString);
                    conn.Open();
                    System.Data.SqlClient.SqlCommand comm = new System.Data.SqlClient.SqlCommand();
                    //comm.CommandText = "select siteName,siteFolderName from Site "
                    //                 + "where clientID in (select clientID from client where userid = (select userID from Users where userName = '" + Session["userName"].ToString().Trim() + "')) "
                    //                 + "and clientID in (select clientID from client where siteFolderName = '" + tClients.Value + "')";

                    comm.CommandText = "select distinct sitename, SiteFolderName from dbo.vwBIWebUserFolderInfo " +
                        "where userid = dbo.fnGetUserID('" + _userName.Trim() + "') and clientname = '" + tChild.Value.name.Replace(@"D:\BI_REPORTS\", "") + "'";


                    //comm.CommandText = "select siteName,siteFolderName from Site "
                    //                  + "where SiteID in (select SiteID from userfolderconfig where userid = fnGetUserID('" + Session["userName"].ToString().Trim() + "')) ";
                    //"and clientID in (select clientID from client where siteFolderName = '" + tClients.Value + "')";
                    comm.CommandType = System.Data.CommandType.Text;
                    comm.Connection = conn;
                    System.Data.SqlClient.SqlDataReader reader = comm.ExecuteReader();

                    var tClient = tChild.Value;
                    while (reader.Read())
                    {
                        //tClients.ChildNodes.Add(new TreeNode(reader["siteName"].ToString(), reader["siteFolderName"].ToString()));
                        i++;
                        tClient.Add(new TreeNode(i, reader["siteName"].ToString(), true, reader["siteFolderName"].ToString()));
                    }
                    conn.Close();
                    comm.Dispose();
                }
                catch (System.Data.SqlClient.SqlException sqlException)
                {
                    string mm = sqlException.Message;
                }
            }
            var t = tNodes;
            return t;
            //}
        }

        public string GetFullyQualifiedFolderPath(string folderPath)
        {
            if (folderPath.StartsWith("~"))
                //return Server.MapPath(folderPath);
                return folderPath;
            else
                return folderPath;
        }

        public string ConvertTreeNodeToJson(TreeNode tNodes, string serverPath)
        {
            var sb = new System.Text.StringBuilder();
            var sw = new StringWriter(sb);
            using (var writer = new JsonTextWriter(sw))
            {
                //[
                //writer.WriteStartArray();
                //writer.WriteStartObject();
                //writer.WritePropertyName("id");
                //writer.WriteValue(1);
                //writer.WritePropertyName("name");
                //writer.WriteValue(_userName);
                //writer.WritePropertyName("path");
                //writer.WriteValue("");
                //writer.WritePropertyName("items");

                writer.WriteStartArray();
                foreach (var item in tNodes.items)
                {
                    writer.WriteStartObject();
                    writer.WritePropertyName("id");
                    writer.WriteValue(item.Key);
                    writer.WritePropertyName("name");
                    writer.WriteValue(item.Value.name);
                    writer.WritePropertyName("path");
                    writer.WriteValue(item.Value.path);
                    writer.WritePropertyName("isDirectory");
                    writer.WriteValue(true);
                    //sub-folders
                    writer.WritePropertyName("items");
                    writer.WriteStartArray();
                    var child = tNodes.items[item.Key];
                    foreach (var gChild in child.items)
                    {
                        writer.WriteStartObject();
                        writer.WritePropertyName("id");
                        writer.WriteValue(gChild.Key);
                        writer.WritePropertyName("name");
                        writer.WriteValue(gChild.Value.name);
                        writer.WritePropertyName("path");
                        writer.WriteValue(gChild.Value.path);
                        writer.WritePropertyName("isDirectory");
                        writer.WriteValue(true);
                            //files2
                            writer.WritePropertyName("items");
                            writer.WriteStartArray();
                            if (!string.IsNullOrEmpty(gChild.Value.path))
                            {
                                var currentFolderPath = gChild.Value.path.ToString().Replace("D:\\BI_REPORTS\\", "");
                                var folderPath = Path.Combine(serverPath, currentFolderPath);

                                DirectoryInfo currentDirectoryInfo = new DirectoryInfo(folderPath);
                                if (currentDirectoryInfo.Exists)
                                {
                                    var files2 = GetFileSystemItems(folderPath);
                                    foreach (var file in files2)
                                    {
                                        writer.WriteStartObject();
                                        writer.WritePropertyName("name");
                                        writer.WriteValue(file.Name);
                                        writer.WritePropertyName("path");
                                        writer.WriteValue(file.FullName);
                                        writer.WritePropertyName("isDirectory");
                                        writer.WriteValue(false);
                                        writer.WritePropertyName("size");
                                        writer.WriteValue(file.Size);
                                        writer.WriteEndObject();
                                    }
                                }
                            }
                        writer.WriteEndArray();
                        writer.WriteEndObject();
                    }
                    //files1
                    if (!string.IsNullOrEmpty(child.path))
                    {
                        var currentFolderPath = child.path.ToString().Replace("D:\\BI_REPORTS\\", "");
                        var folderPath = Path.Combine(serverPath, currentFolderPath);

                        DirectoryInfo currentDirectoryInfo = new DirectoryInfo(folderPath);
                        if (currentDirectoryInfo.Exists)
                        {
                            var files1 = GetFileSystemItems(folderPath);
                            foreach (var file in files1)
                            {
                                writer.WriteStartObject();
                                writer.WritePropertyName("name");
                                writer.WriteValue(file.Name);
                                writer.WritePropertyName("path");
                                writer.WriteValue(file.FullName);
                                writer.WritePropertyName("isDirectory");
                                writer.WriteValue(false);
                                writer.WritePropertyName("size");
                                writer.WriteValue(file.Size);
                                writer.WriteEndObject();
                            }
                        }
                    }
                    writer.WriteEndArray();
                    writer.WriteEndObject();
                }
                writer.WriteEndArray();
            }
            return sb.ToString();
        }

        public List<FileSystemItem> GetFileSystemItems (string currentFolderPath)
        {
            DirectoryInfo[] folders = new DirectoryInfo[] { };
            FileInfo[] files = new FileInfo[] { };
            List<FileSystemItem> fsItems = null;

            var currentDirInfo = new DirectoryInfo(currentFolderPath);
            if (currentDirInfo.Exists)
            {
                files = currentDirInfo.GetFiles();
                fsItems = new List<FileSystemItem>(folders.Length + files.Length);
                foreach (var file in files)
                    fsItems.Add(new FileSystemItem(file));
            }
            return fsItems;
        }
        public string ConvertFileSystemItemsToJson(List<FileSystemItem> fsItems)
        {
            var sb = new System.Text.StringBuilder();
            var sw = new StringWriter(sb);
            using (var writer = new JsonTextWriter(sw))
            {
                foreach (var item in fsItems)
                {

                    //        //[
                    writer.WriteStartArray();
                    writer.WriteStartObject();
                    writer.WritePropertyName("name");
                    writer.WriteValue(item.Name);
                    writer.WritePropertyName("path");
                    writer.WriteValue(item.FullName);

                    if (item.IsDirectory == true)
                    {
                        writer.WritePropertyName("items");
                        writer.WriteStartArray();

                    }
                    //    //foreach (var item in tNodes.items)
                    //    //{
                    //        writer.WriteStartObject();
                    //        writer.WritePropertyName("id");
                    //        writer.WriteValue(item.Key);
                    //        writer.WritePropertyName("name");
                    //        writer.WriteValue(item.Value.name);
                    //        writer.WritePropertyName("path");
                    //        writer.WriteValue(item.Value.path);
                    //        writer.WritePropertyName("items");
                    //        var child = tNodes.items[item.Key];
                    //        writer.WriteStartArray();
                    //        foreach (var gChild in child.items)
                    //        {
                    //            writer.WriteStartObject();
                    //            writer.WritePropertyName("id");
                    //            writer.WriteValue(gChild.Key);
                    //            writer.WritePropertyName("name");
                    //            writer.WriteValue(gChild.Value.name);
                    //            writer.WritePropertyName("path");
                    //            writer.WriteValue(gChild.Value.path);
                    //            writer.WriteEndObject();
                    //        }
                    //        writer.WriteEndArray();
                    //        writer.WriteEndObject();
                    //    }
                    //    writer.WriteEndArray();

                    //    writer.WriteEndObject();
                    //    writer.WriteEndArray();
                    //}
                }
            }           return sb.ToString();
        }

        public int GetTiffCount(string sourceFile)
        {
            string info;
            int tiffCount = 0;

            //Creating a License Manager object
            //var licenseKey = Environment.GetEnvironmentVariable("GDPictureLicenseKey");
            var licenseKey = "21186338893728774141313499646768131348";
            LicenseManager oLicenseManager = new LicenseManager();
            oLicenseManager.RegisterKEY(licenseKey);

            GdPictureImaging oGdPictureImaging = new GdPictureImaging();
            //Variable to hold the source image handle (source file).
            int sourceImageId = 0;
            //Variable to hold the destination image handle (destination file).
            int destImageId = 0;
            //Variable to hold the imageID for the extracted page.
            int imageId = 0;
            //The source file path and the destination file path.
            string source = sourceFile; 
            //Loading the source image file.
            sourceImageId = oGdPictureImaging.CreateGdPictureImageFromFile(source);
            if (oGdPictureImaging.GetStat() == GdPictureStatus.OK)
            {
                bool isMultiPage = oGdPictureImaging.TiffIsMultiPage(sourceImageId);
                GdPictureStatus status = oGdPictureImaging.GetStat();
                if ((status == GdPictureStatus.OK) && isMultiPage)
                {
                    tiffCount = oGdPictureImaging.TiffGetPageCount(sourceImageId);
                    if (status == GdPictureStatus.OK)
                        //MessageBox.Show("Done!", "Multipage TIFF Example", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        info = "Done!";
                        
                    else
                        //MessageBox.Show("Error: " + status.ToString(), "Multipage TIFF Example", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        info = "Error!";
                }
                else
                    //MessageBox.Show("Either the source file is not a multi-page tiff file or some other error occurred. Error: " + status.ToString(), "Multipage TIFF Example", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    info = "Either the source file is not a multi - page tiff file or some other error occurred.Error: " + status.ToString();
            }
            else
                //MessageBox.Show("The source file can't be loaded. Error: " + oGdPictureImaging.GetStat().ToString(), "Multipage TIFF Example", MessageBoxButtons.OK, MessageBoxIcon.Error);
                info = "The source file can't be loaded. Error: " + oGdPictureImaging.GetStat().ToString();

            //Releasing resources.
            oGdPictureImaging.TiffCloseMultiPageFile(destImageId);
            oGdPictureImaging.ReleaseGdPictureImage(destImageId);
            oGdPictureImaging.ReleaseGdPictureImage(sourceImageId);
            oGdPictureImaging.Dispose();

            return tiffCount;
        }
    }
}
