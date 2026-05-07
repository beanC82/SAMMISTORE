using Dapper;
using SAMMI.ECOM.Core.Models;
using SAMMI.ECOM.Repository.GenericRepositories.Query.TemplateBuilder;
using System.Data;
using System.Dynamic;
using System.Text.RegularExpressions;

namespace SAMMI.ECOM.Repository.Extensions
{
    public static class QueryBuilderExtension
    {
        public static bool AppendPredicate(this SqlBuilder sqlBuilder, ref PropertyFilterModel filterProperty,
            string predicateSubject, DbType fieldType, bool isNullable, string localCollation = "Latin1_General_CI_AI")
        {
            switch (filterProperty.Operator)
            {
                case "exists":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} IN (@{predicateSubject})");
                    break;
                case "eq":
                    if (fieldType == DbType.Boolean)
                    {
                        if (isNullable && (bool?)filterProperty.FilterValue == false)
                        {
                            sqlBuilder.Where($"({filterProperty.FilterColumn} IS NULL OR {filterProperty.FilterColumn} = @{predicateSubject})");
                        }
                        else
                        {
                            sqlBuilder.Where($"{filterProperty.FilterColumn} = @{predicateSubject}");
                        }
                    }
                    else
                    {
                        sqlBuilder.Where(fieldType == DbType.String
                            //? $"{filterProperty.Field} LIKE @{predicateSubject} COLLATE {localCollation}"
                            ? $"{filterProperty.FilterColumn} LIKE @{predicateSubject}"
                            : $"{filterProperty.FilterColumn} = @{predicateSubject}");
                    }

                    break;
                case "startswith":
                    //sqlBuilder.Where($"{filterProperty.Field} LIKE @{predicateSubject} COLLATE {localCollation}");
                    sqlBuilder.Where($"{filterProperty.FilterColumn} LIKE @{predicateSubject}");
                    filterProperty.FilterValue = $"{filterProperty.FilterValue}%";
                    break;
                case "endswith":
                    //sqlBuilder.Where($"{filterProperty.Field} LIKE @{predicateSubject} COLLATE {localCollation}");
                    sqlBuilder.Where($"{filterProperty.FilterColumn} LIKE @{predicateSubject}");
                    filterProperty.FilterValue = $"%{filterProperty.FilterValue}";
                    break;
                case "contains":
                    //sqlBuilder.Where($"{filterProperty.Field} LIKE @{predicateSubject} COLLATE {localCollation}");
                    sqlBuilder.Where($"{filterProperty.FilterColumn} LIKE @{predicateSubject}");
                    filterProperty.FilterValue = $"%{filterProperty.FilterValue}%";
                    break;
                case "doesnotcontain":
                    //sqlBuilder.Where($"{filterProperty.Field} NOT LIKE @{predicateSubject} COLLATE {localCollation}");
                    sqlBuilder.Where($"{filterProperty.FilterColumn} NOT LIKE @{predicateSubject}");
                    filterProperty.FilterValue = $"%{filterProperty.FilterValue}%";
                    break;
                case "neq":
                    if (fieldType == DbType.Boolean)
                    {
                        if (isNullable && (bool?)filterProperty.FilterValue == false)
                        {
                            sqlBuilder.Where($"({filterProperty.FilterColumn} IS NOT NULL AND {filterProperty.Field} <> @{predicateSubject})");
                        }
                        else
                        {
                            sqlBuilder.Where($"{filterProperty.FilterColumn} <> @{predicateSubject}");
                        }
                    }
                    else
                    {
                        sqlBuilder.Where(fieldType == DbType.String
                            //? $"{filterProperty.Field} NOT LIKE @{predicateSubject} COLLATE {localCollation}"
                            ? $"{filterProperty.FilterColumn} NOT LIKE @{predicateSubject}"
                            : $"{filterProperty.FilterColumn} <> @{predicateSubject}");
                    }
                    break;
                case "gt":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} > @{predicateSubject}");
                    break;
                case "gte":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} >= @{predicateSubject}");
                    break;
                case "lt":
                case "lte":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} " +
                        $"{(filterProperty.Operator == "lt" ? "<" : "<=")} " +
                        $":{predicateSubject}");
                    if (filterProperty.FilterValue is DateTime ltCompareValue
                        &&
                        (fieldType == DbType.DateTime
                         || fieldType == DbType.DateTime2
                         || fieldType == DbType.Date)
                    )
                    {
                        filterProperty.FilterValue = new DateTime(
                            ltCompareValue.Year,
                            ltCompareValue.Month,
                            ltCompareValue.Day,
                            23,
                            59,
                            59,
                            999);
                    }
                    break;
                case "isnotnull":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} IS NOT NULL");
                    return false;
                case "isnull":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} IS NULL");
                    return false;
                case "isempty":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} LIKE N''");
                    return false;
                case "isnotempty":
                    sqlBuilder.Where($"{filterProperty.FilterColumn} NOT LIKE N''");
                    return false;
            }

            return true;
        }

        public static Func<string?, bool> IsNotEmpty = (string? source) =>
        {
            return !string.IsNullOrEmpty(source) && source.Trim().Length > 0;
        };


        private static readonly Regex Reg = new Regex("([a-z,0-9](?=[A-Z])|[A-Z](?=[A-Z][a-z]))", RegexOptions.Compiled);

        /// <summary>
        /// This splits up a string based on capital letters
        /// e.g. "MyAction" would become "My Action" and "My10Action" would become "My10 Action"
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string SplitPascalCase(this string str)
        {
            return Reg.Replace(str, "$1 ");
        }
        public static string ToUpperFirstLetter(this string src)
        {
            if (string.IsNullOrWhiteSpace(src)) return string.Empty;

            var chars = src
                .Select((c, i) => i == 0 ? c.ToString().ToUpper() : c.ToString())
                .ToArray();

            return string.Join("", chars);
        }

        public static string ResolveSqlParameter(this string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return string.Empty;
            }

            var result = str.ToLower().Trim();
            result = Regex.Replace(result, "[á|à|ả|ã|ạ|â|ă|ấ|ầ|ẩ|ẫ|ậ|ắ|ằ|ẳ|ẵ|ặ]", "a", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ]", "e", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự]", "u", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[í|ì|ỉ|ĩ|ị]", "i", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[ó|ò|ỏ|õ|ọ|ô|ơ|ố|ồ|ổ|ỗ|ộ|ớ|ờ|ở|ỡ|ợ]", "o", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[đ]", "d", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[ý|ỳ|ỷ|ỹ|ỵ]", "y", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[,|~|@|/|.|:|?|#|$|%|&|*|(|)|+|”|“|'|\"|!|`|–]", "", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"\s+", "_");
            result = Regex.Replace(result, @"-+", "_");

            return result;
        }

        public static void AppendPredicate<TField>(this SqlBuilder sqlBuilder, string predicateSubject, params PropertyFilterModel[] filterProperties)
        {
            for (int i = 0; i < filterProperties.Length; i++)
            {
                var filterProperty = filterProperties[i];
                var dynamicSqlParameterKey = $"{filterProperty.Field.ResolveSqlParameter()}__{i}";

                switch (filterProperty.Operator)
                {
                    case "exists":
                        sqlBuilder.Where($"{predicateSubject} IN (@{dynamicSqlParameterKey})");
                        break;
                    case "eq":
                        sqlBuilder.Where(Type.GetTypeCode(typeof(TField)) == TypeCode.String
                            ? $"{predicateSubject} LIKE @{dynamicSqlParameterKey}"
                            : $"{predicateSubject} = @{dynamicSqlParameterKey}");

                        break;
                    case "startswith":
                        sqlBuilder.Where($"{predicateSubject} LIKE @{dynamicSqlParameterKey}");
                        filterProperty.FilterValue = $"{filterProperty.FilterValue}%";
                        break;
                    case "endswith":
                        sqlBuilder.Where($"{predicateSubject} LIKE @{dynamicSqlParameterKey}");
                        filterProperty.FilterValue = $"%{filterProperty.FilterValue}";
                        break;
                    case "contains":
                        sqlBuilder.Where($"{predicateSubject} LIKE @{dynamicSqlParameterKey}");
                        filterProperty.FilterValue = $"%{filterProperty.FilterValue}%";
                        break;
                    case "doesnotcontain":
                        sqlBuilder.Where($"{predicateSubject} NOT LIKE @{dynamicSqlParameterKey}");
                        filterProperty.FilterValue = $"%{filterProperty.FilterValue}%";
                        break;
                    case "neq":
                        sqlBuilder.Where(Type.GetTypeCode(typeof(TField)) == TypeCode.String
                            ? $"{predicateSubject} NOT LIKE @{dynamicSqlParameterKey}"
                            : $"{predicateSubject} <> @{dynamicSqlParameterKey}");

                        break;
                    case "gt":
                        sqlBuilder.Where($"{predicateSubject} > @{dynamicSqlParameterKey}");
                        break;
                    case "gte":
                        sqlBuilder.Where($"{predicateSubject} >= @{dynamicSqlParameterKey}");
                        break;
                    case "lt":
                        sqlBuilder.Where($"{predicateSubject} < @{dynamicSqlParameterKey}");
                        break;
                    case "lte":
                        sqlBuilder.Where($"{predicateSubject} <= @{dynamicSqlParameterKey}");
                        if (filterProperty.FilterValue is DateTime valueAsDateTime &&
                            (typeof(TField) == typeof(DateTime)
                             || typeof(TField) == typeof(DateTime?)))
                        {
                            filterProperty.FilterValue = valueAsDateTime.AddDays(1);
                        }

                        break;
                    case "isnotnull":
                        sqlBuilder.Where($"{predicateSubject} IS NOT NULL");
                        break;
                    case "isnull":
                        sqlBuilder.Where($"{predicateSubject} IS NULL");
                        break;
                    case "isempty":
                        sqlBuilder.Where($"{predicateSubject} LIKE N''");
                        break;
                    case "isnotempty":
                        sqlBuilder.Where($"{predicateSubject} NOT LIKE N''");
                        break;
                }

                var sqlDynamicParameters = new DynamicParameters();
                sqlDynamicParameters.Add(dynamicSqlParameterKey, filterProperty.FilterValue);

                sqlBuilder.AddParameters(sqlDynamicParameters);
            }
        }
    }

    public class DynamicDictionary : DynamicObject
    {
        // The inner dictionary.
        Dictionary<string, object> dictionary
            = new Dictionary<string, object>();
        public void Add(string name, object val = null)
        {
            if (!dictionary.ContainsKey(name))
            {
                dictionary.Add(name, val);
            }
            else
            {
                dictionary[name] = val;
            }
        }

        // This property returns the number of elements
        // in the inner dictionary.
        public int Count
        {
            get
            {
                return dictionary.Count;
            }
        }

        // If you try to get a value of a property
        // not defined in the class, this method is called.
        public override bool TryGetMember(
            GetMemberBinder binder, out object result)
        {
            // Converting the property name to lowercase
            // so that property names become case-insensitive.
            string name = binder.Name.ToLower();

            // If the property name is found in a dictionary,
            // set the result parameter to the property value and return true.
            // Otherwise, return false.
            return dictionary.TryGetValue(name, out result);
        }

        // If you try to set a value of a property that is
        // not defined in the class, this method is called.
        public override bool TrySetMember(
            SetMemberBinder binder, object value)
        {
            // Converting the property name to lowercase
            // so that property names become case-insensitive.
            dictionary[binder.Name.ToLower()] = value;

            // You can always add a value to a dictionary,
            // so this method always returns true.
            return true;
        }
    }
}
