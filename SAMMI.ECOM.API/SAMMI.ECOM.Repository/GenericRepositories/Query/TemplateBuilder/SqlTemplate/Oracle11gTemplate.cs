namespace SAMMI.ECOM.Repository.GenericRepositories.Query.TemplateBuilder
{
    public class Oracle11gTemplate : ISqlTemplate
    {
        public string TableName { get; set; } = null!;
        public string[]? TableColumns { get; set; }
        public string[]? GroupedColumns { get; set; }
        public string[]? PrimaryKeys { get; set; }

        private void ResetAfterBuild()
        {
            GroupedColumns = null;
        }
        public string GetTemplate()
        {
            return "SELECT\n/**select**/ " +
                $"FROM {TableName} t1 " +
                $"/**innerjoin**//**leftjoin**//**rightjoin**//**where**//**groupby**//**having**//**orderby**/";
        }
        public string GetPagingTemplate()
        {
            if (PrimaryKeys?.Any() ?? false)
            {
                return $"SELECT\n/**select**/\nFROM (\n" +
                        "\tSELECT s__.*, rownum r__ FROM (\n" +
                            $"\t\tSELECT DISTINCT\n\t\t/**innerselect**/\t\tFROM {TableName} t1" +
                            $"/**innerjoin**//**leftjoin**//**rightjoin**//**where**//**innergroupby**//**groupby**//**having**//**orderby**/" +
                        "\t) s__ /**take**/" +
                    ") s\n" +
                    $"INNER JOIN {TableName} t1 ON " +
                        (PrimaryKeys.Length == 1
                            ? $"t1.{PrimaryKeys.First()} = s.{PrimaryKeys.First()}\n"
                            : string.Join(" AND ", PrimaryKeys.Select((k) => $"t1.{k} = s.{k}"))) +
                    $"/**innerjoin**//**leftjoin**//**rightjoin**//**skip**//**groupby**//**having**//**orderby**/";
            }
            else
            {
                return GetTemplate();
            }
        }
        public string GetCountingTemplate()
        {
            if (GroupedColumns?.Any() ?? false)
            {
                var result = $"WITH source AS (SELECT COUNT(DISTINCT {string.Join(',', GroupedColumns)}) FROM {TableName} t1 /**innerjoin**//**leftjoin**//**rightjoin**//**where**//**groupby**//**having**/)"
                + $"SELECT COUNT(1) FROM source";
                ResetAfterBuild();
                return result;
            }
            else
            {
                if (PrimaryKeys?.Any() ?? false)
                {
                    return $"SELECT COUNT(DISTINCT {string.Join(',', PrimaryKeys.Select(k => $"t1.{k}"))}) FROM {TableName} t1 /**innerjoin**//**leftjoin**//**rightjoin**//**where**/";
                }

                return $"SELECT COUNT(1) FROM {TableName} t1 /**innerjoin**//**leftjoin**//**rightjoin**//**where**/";
            }
        }
    }
}
