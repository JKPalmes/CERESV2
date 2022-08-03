//using Microsoft.Extensions.Configuration;
using Microsoft.Win32.SafeHandles;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Text;

namespace CERES.Web.Api.Classes
{
    public class ImpersonateUser
    {
        [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        public static extern bool LogonUser(String Username, String Domain, String Password, int LogonType, int LogonProvider, out SafeAccessTokenHandle Token);

        //[DllImport("advapi32.dll")]
        //public static extern int LogonUserA(String lpszUserName,
        //    String lpszDomain,
        //    String lpszPassword,
        //    int dwLogonType,
        //    int dwLogonProvider,
        //    ref IntPtr phToken);
        //[DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        //public static extern int DuplicateToken(IntPtr hToken,
        //    int impersonationLevel,
        //    ref IntPtr hNewToken);

        //[DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        //public static extern bool RevertToSelf();

        //[DllImport("kernel32.dll", CharSet = CharSet.Auto)]
        //public static extern bool CloseHandle(IntPtr handle);

        ////WindowsImpersonationContext impersonationContext;

        public const int LOGON32_LOGON_INTERACTIVE = 2;
        //const int LOGON32_LOGON_NETWORK = 3;
        //const int LOGON32_LOGON_NEW_CREDENTIALS = 9;

        //const int LOGON32_PROVIDER_DEFAULT = 0;
        //This parameter causes LogonUser to create a primary token.     
        //const int LOGON32_LOGON_INTERACTIVE = 2;

        //// logon providers 
        const int LOGON32_PROVIDER_DEFAULT = 0;
        //const int LOGON32_PROVIDER_WINNT50 = 3;
        //const int LOGON32_PROVIDER_WINNT40 = 2;
        //const int LOGON32_PROVIDER_WINNT35 = 1;
        //private string p;
        //private string p_2;
        //private string p_3;


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

        ///// <summary>
        ///// Impersonates the user.
        ///// </summary>
        ///// <param name="userName">Name of the user.</param>
        ///// <param name="domain">The domain.</param>
        ///// <param name="password">The password.</param>
        public bool impersonateValidUser(string userName, string domain, string password)
        {
            UserName = userName;
            Domain = domain;
            Password = password;

            SafeAccessTokenHandle safeAccessTokenHandle;
            bool returnValue = LogonUser(UserName, Domain, Password, LOGON32_LOGON_INTERACTIVE, LOGON32_PROVIDER_DEFAULT, out safeAccessTokenHandle);
            WindowsIdentity.RunImpersonated(safeAccessTokenHandle, () => {
                var impersonatedUser = WindowsIdentity.GetCurrent().Name;
                //--- Call your Method here…….  
            });

            return true;
        }

        // Call LogonUser to obtain a handle to an access token.     
        /// <summary>
        /// Impersonates the valid user.
        /// </summary>
        /// <returns></returns>
        //public bool impersonateValidUser()
        //{
        //    WindowsIdentity tempWindowsIdentity;
        //    IntPtr token = IntPtr.Zero;
        //    IntPtr tokenDuplicate = IntPtr.Zero;

        //    if (RevertToSelf())
        //    {
        //        //if (LogonUserA(UserName, Domain, Password, LOGON32_LOGON_INTERACTIVE,
        //        //LOGON32_PROVIDER_DEFAULT, ref token) != 0)
        //        if (LogonUserA(UserName, Domain, Password, LOGON32_LOGON_NEW_CREDENTIALS,
        //                                LOGON32_PROVIDER_DEFAULT, ref token) != 0)
        //        {
        //            if (DuplicateToken(token, 2, ref tokenDuplicate) != 0)
        //            {
        //                tempWindowsIdentity = new WindowsIdentity(tokenDuplicate);
        //                impersonationContext = tempWindowsIdentity.Impersonate();
        //                if (impersonationContext != null)
        //                {
        //                    CloseHandle(token);
        //                    CloseHandle(tokenDuplicate);
        //                    return true;
        //                }
        //            }
        //        }
        //    }
        //    if (token != IntPtr.Zero)
        //        CloseHandle(token);
        //    if (tokenDuplicate != IntPtr.Zero)
        //        CloseHandle(tokenDuplicate);
        //    return false;
        //}

        ///// <summary>
        ///// Undoes the impersonation.
        ///// </summary>
        //public void undoImpersonation()
        //{
        //    impersonationContext.Undo();
        //}
    }


}