using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Text;
using System.Web;
using System.Web.Configuration;
using System.Web.UI;

namespace CERES.Core.Classes
{
    public static class Common
    {
        public static string GetSqlConnectionString()
        {
            //string sqlConnectionString = System.Web.Configuration.WebConfigurationManager.AppSettings["EDS"];
            string sqlConnectionString = System.Web.Configuration.WebConfigurationManager.ConnectionStrings["BIDataEntryConnectionString"].ToString();
            return sqlConnectionString;
        }

        public static bool CompareDirectories(string path1, string path2)
        {
            return string.CompareOrdinal(path1, path2) == 0;
        }

       public static bool TwoFoldersAreEquivalent(string folderPath1, string folderPath2)
        {
            // Chop off any trailing slashes...
            if (folderPath1.EndsWith("\\") || folderPath1.EndsWith("/"))
                folderPath1 = folderPath1.Substring(0, folderPath1.Length - 1);

            if (folderPath2.EndsWith("\\") || folderPath2.EndsWith("/"))
                folderPath2 = folderPath1.Substring(0, folderPath2.Length - 1);

            return string.CompareOrdinal(folderPath1, folderPath2) == 0;
        }

        public static void SyncMSTRPassword(string filename)
        {
            var p = new System.Diagnostics.Process();
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.RedirectStandardError = true;
            p.StartInfo.RedirectStandardInput = true;

            var fileName = filename;
            //var pathToFile = WebConfigurationManager.AppSettings["ProgramFiles"] + "PsExec.exe";
            var pathToFile = "PsExec64.exe";
            var mstrServer = WebConfigurationManager.AppSettings["MstrServer"];
            var folderLocation = WebConfigurationManager.AppSettings["MstrScriptFolderLocation"];
            var impUserName = mstrServer + @"\" + WebConfigurationManager.AppSettings["ImpersonateUserName"];
            var impPassword = WebConfigurationManager.AppSettings["ImpersonatePassword"];

            p.StartInfo.FileName = pathToFile;// @"D:\PSTools\PsExec.exe";
            p.StartInfo.Arguments = @"\\" + mstrServer + @" -u " + impUserName + " -p " + impPassword + @" d:\" + folderLocation + @"\" + fileName + ".bat"; ;
            p.Start();

            //string output = p.StandardOutput.ReadToEnd();
            //string errormessage = p.StandardError.ReadToEnd();

            p.WaitForExit();

        }

        public static string CreateChangePwdFiles(string password, string userName)
        {
            var guid = Guid.NewGuid().ToString("N");
            var fileName = "change_pwd_" + guid;
            var folderLocation = @"\\" + WebConfigurationManager.AppSettings["MstrServer"] + @"\" + WebConfigurationManager.AppSettings["MstrScriptFolderLocation"] + @"\";
            var local = Path.Combine(@"C:\Temp", fileName + ".scp");
            var remote = Path.Combine(folderLocation, fileName + ".scp");

            try
            {
                // Create a new scp file     
                using (FileStream fs = File.Create(local))
                {
                    // Add some text to file
                    var text = "ALTER USER " + "\"" + userName + "\"" + " PASSWORD " + "\"" + password + "\";";
                    Byte[] exp = new UTF8Encoding(true).GetBytes(text);
                    fs.Write(exp, 0, exp.Length);
                }

                var impUserName = WebConfigurationManager.AppSettings["ImpersonateUserName"];
                var impDomain = WebConfigurationManager.AppSettings["ImpersonateDomain"];
                var impPassword = WebConfigurationManager.AppSettings["ImpersonatePassword"];
                var imp = new ImpersonateUser(impUserName, impDomain, impPassword);
                if (imp.impersonateValidUser())
                {
                    File.Copy(local, remote, true);
                }
                else
                {
                    throw new Exception("Unable to impersonate for copying file.");
                }

                var batchLocal = Path.Combine(@"C:\Temp", fileName + ".bat");
                var batchRemote = Path.Combine(folderLocation, fileName + ".bat");

                // Create a new bat file     
                using (FileStream fs = File.Create(batchLocal))
                {
                    var text = "@echo OFF\r\n";
                    text += @"cmdmgr -n ""MicroStrategy Analytics Modules"" -u n52776 -f d:\scp-temp\" + fileName + @".scp -p Complex135$ -o d:\scp-temp\testout.txt";
                    Byte[] exp = new UTF8Encoding(true).GetBytes(text);
                    fs.Write(exp, 0, exp.Length);
                }
                File.Copy(batchLocal, batchRemote, true);
                imp.undoImpersonation();
                if (File.Exists(local))
                {
                    File.Delete(local);
                }
                if (File.Exists(batchLocal))
                {
                    File.Delete(batchLocal);
                }
                return fileName;
            }
            catch (Exception Ex)
            {
                Console.WriteLine(Ex.ToString());
                return "";
            }
        }

        public static void DeleteChangePwdFiles(string fileName)
        {
            // Check if file already exists. If yes, delete it.     
            var folderLocation = @"\\" + WebConfigurationManager.AppSettings["MstrServer"] + @"\" + WebConfigurationManager.AppSettings["MstrScriptFolderLocation"] + @"\";
            var scpRemote = Path.Combine(folderLocation, fileName + ".scp");
            var batchRemote = Path.Combine(folderLocation, fileName + ".bat");
            var impUserName = WebConfigurationManager.AppSettings["ImpersonateUserName"];
            var impDomain = WebConfigurationManager.AppSettings["ImpersonateDomain"];
            var impPassword = WebConfigurationManager.AppSettings["ImpersonatePassword"];
            var imp = new ImpersonateUser(impUserName, impDomain, impPassword);
            if (imp.impersonateValidUser())
            {
                if (File.Exists(scpRemote))
                {
                    File.Delete(scpRemote);
                }
                if (File.Exists(batchRemote))
                {
                    File.Delete(batchRemote);
                }
                imp.undoImpersonation();
            }
            else
            {
                throw new Exception("Unable to impersonate for copying file.");
            }

        }

        public class ImpersonateUser
        {
            [DllImport("advapi32.dll")]
            public static extern int LogonUserA(String lpszUserName,
                String lpszDomain,
                String lpszPassword,
                int dwLogonType,
                int dwLogonProvider,
                ref IntPtr phToken);
            [DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            public static extern int DuplicateToken(IntPtr hToken,
                int impersonationLevel,
                ref IntPtr hNewToken);

            [DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            public static extern bool RevertToSelf();

            [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
            public static extern bool CloseHandle(IntPtr handle);

            WindowsImpersonationContext impersonationContext;

            public const int LOGON32_LOGON_INTERACTIVE = 2;
            const int LOGON32_LOGON_NETWORK = 3;
            const int LOGON32_LOGON_NEW_CREDENTIALS = 9;

            // logon providers 
            const int LOGON32_PROVIDER_DEFAULT = 0;
            const int LOGON32_PROVIDER_WINNT50 = 3;
            const int LOGON32_PROVIDER_WINNT40 = 2;
            const int LOGON32_PROVIDER_WINNT35 = 1;
            private string p;
            private string p_2;
            private string p_3;


            private String UserName
            {
                set;
                get;
            }

            private String Domain
            {
                set;
                get;
            }

            private String Password
            {
                set;
                get;
            }

            /// <summary>
            /// Impersonates the user.
            /// </summary>
            /// <param name="userName">Name of the user.</param>
            /// <param name="domain">The domain.</param>
            /// <param name="password">The password.</param>
            public ImpersonateUser(string userName, string domain, string password)
            {
                UserName = userName;
                Domain = domain;
                Password = password;
            }

            /// <summary>
            /// Impersonates the valid user.
            /// </summary>
            /// <returns></returns>
            public bool impersonateValidUser()
            {
                WindowsIdentity tempWindowsIdentity;
                IntPtr token = IntPtr.Zero;
                IntPtr tokenDuplicate = IntPtr.Zero;

                if (RevertToSelf())
                {
                    //if (LogonUserA(UserName, Domain, Password, LOGON32_LOGON_INTERACTIVE,
                    //LOGON32_PROVIDER_DEFAULT, ref token) != 0)
                    if (LogonUserA(UserName, Domain, Password, LOGON32_LOGON_NEW_CREDENTIALS,
                                            LOGON32_PROVIDER_DEFAULT, ref token) != 0)
                    {
                        if (DuplicateToken(token, 2, ref tokenDuplicate) != 0)
                        {
                            tempWindowsIdentity = new WindowsIdentity(tokenDuplicate);
                            impersonationContext = tempWindowsIdentity.Impersonate();
                            if (impersonationContext != null)
                            {
                                CloseHandle(token);
                                CloseHandle(tokenDuplicate);
                                return true;
                            }
                        }
                    }
                }
                if (token != IntPtr.Zero)
                    CloseHandle(token);
                if (tokenDuplicate != IntPtr.Zero)
                    CloseHandle(tokenDuplicate);
                return false;
            }

            /// <summary>
            /// Undoes the impersonation.
            /// </summary>
            public void undoImpersonation()
            {
                impersonationContext.Undo();
            }
        }
    }
}
