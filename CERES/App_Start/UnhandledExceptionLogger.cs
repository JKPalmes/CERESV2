using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.ExceptionHandling;

namespace CERES.Web.Api.App_Start
{
    public class UnhandledExceptionLogger : ExceptionLogger
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public override void Log(ExceptionLoggerContext context)
        {
            log.Error(context.Exception.Message, context.Exception);
        }
    }
}