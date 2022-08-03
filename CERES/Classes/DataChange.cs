namespace CERES.Web.Api.Classes
{
    public class DataChange
    {
        public object Data { get; set; }
        public int InsertBeforeKey { get; set; }
        public string Key { get; set; }
        public string Type { get; set; }
    }
}