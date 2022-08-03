using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using System.Threading.Tasks;

namespace CERES.Core.Classes
{

    //[JsonConverter(typeof(TreeNodeConverter))]
    //public class TreeNode : IEnumerable<TreeNode>
    public class TreeNode
    {
        public int id { get; private set; }

        public string name { get; private set; }
        public string path { get; private set; }

        public bool isDirectory { get; private set; }

        public readonly Dictionary<int, TreeNode> items = new Dictionary<int, TreeNode>();

        [JsonIgnore]
        public TreeNode Parent { get; private set; }

        public TreeNode(
            int id,
            string text,
            bool isDirectory,
            string path
        )
        {
            this.id = id;
            this.name = text;
            this.isDirectory = isDirectory;
            this.path = path;
        }

        public TreeNode GetChild(int id)
        {
            var child = this.items[id];
            return child;
        }

        public void Add(TreeNode item)
        {
            if (item.items != null)
            {
                item.items.Remove(item.id);
            }

            item.Parent = this;
            this.items.Add(item.id, item);
        }
    }
    //    public readonly Dictionary<string, TreeNode> _children =
    //                                        new Dictionary<string, TreeNode>();

    //    public readonly string ID;
    //    public TreeNode Parent { get; private set; }

    //    public TreeNode(string id)
    //    {
    //        this.ID = id;
    //    }

    //    public TreeNode GetChild(string id)
    //    {
    //        return this._children[id];
    //    }

    //    public void Add(TreeNode item)
    //    {
    //        if (item.Parent != null)
    //        {
    //            item.Parent._children.Remove(item.ID);
    //        }

    //        item.Parent = this;
    //        this._children.Add(item.ID, item);
    //    }

    //    public IEnumerator<TreeNode> GetEnumerator()
    //    {
    //        return this._children.Values.GetEnumerator();
    //    }

    //    //System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
    //    //{
    //    //    return this.GetEnumerator();
    //    //}

    //    public int Count
    //    {
    //        get { return this._children.Count; }
    //    }

    //    public static TreeNode BuildTree(string tree)
    //    {
    //        var lines = tree.Split(new[] { Environment.NewLine },
    //                               StringSplitOptions.RemoveEmptyEntries);

    //        var result = new TreeNode("TreeRoot");
    //        var list = new List<TreeNode> { result };

    //        foreach (var line in lines)
    //        {
    //            var trimmedLine = line.Trim();
    //            var indent = line.Length - trimmedLine.Length;

    //            var child = new TreeNode(trimmedLine);
    //            list[indent].Add(child);

    //            if (indent + 1 < list.Count)
    //            {
    //                list[indent + 1] = child;
    //            }
    //            else
    //            {
    //                list.Add(child);
    //            }
    //        }

    //        return result;
    //    }

    //    public static string BuildString(TreeNode tree)
    //    {
    //        var sb = new StringBuilder();

    //        BuildString(sb, tree, 0);

    //        return sb.ToString();
    //    }

    //    private static void BuildString(StringBuilder sb, TreeNode node, int depth)
    //    {
    //        sb.AppendLine(node.ID.PadLeft(node.ID.Length + depth));

    //        foreach (var child in node)
    //        {
    //            BuildString(sb, child, depth + 1);
    //        }
    //    }


}
