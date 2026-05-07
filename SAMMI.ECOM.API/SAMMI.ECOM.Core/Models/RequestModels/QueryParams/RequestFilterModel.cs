using System.Data;
using System.Text;

namespace SAMMI.ECOM.Core.Models
{
    public class RequestFilterModel
    {
        public static class RequestFilterOperator
        {
            public static string Equal = "eq";
            public static string NotEqual = "neq";
            public static string IsNull = "isnull";
            public static string IsNotNull = "isnotnull";
            public static string GreaterThan = "gt";
            public static string GreaterThanOrEqual = "gte";
            public static string LessThan = "lt";
            public static string LessThanOrEqual = "lte";
            public static string StartsWith = "startswith";
            public static string EndsWith = "endswith";
            public static string Contains = "contains";
            public static string DoesNotContain = "doesnotcontain";
            public static string IsEmpty = "isempty";
            public static string IsNotEmpty = "isnotempty";
        }

        private string _orderBy;
        private string _dir;
        private int _skip;
        private int _take;

        public int Skip
        {
            get => _skip < 0 ? 0 : _skip;
            set => _skip = value;
        }

        public int Take
        {
            get => _take <= 0 ? 10 : _take;
            set => _take = value;
        }

        public string? Filters { get; set; }

        public virtual string? OrderBy
        {
            get => !string.IsNullOrWhiteSpace(_orderBy) ? _orderBy : "ID";

            set => _orderBy = value;
        }

        /// <summary>
        /// Order direction (asc|desc)
        /// </summary>
        public string? Dir
        {
            get => !string.IsNullOrWhiteSpace(_dir) ? _dir : "DESC";

            set => _dir = value;
        }

        /// <summary>
        /// Selection type
        /// </summary>
        public RequestType Type { get; set; } = RequestType.Grid;
        public bool? Paging { get; set; } = true;

        /// <summary>
        /// TRUE: Không cho phép sắp xếp với các trường đẩy lên ko tồn tại trong bảng t1
        /// </summary>
        public bool RestrictOrderBy { get; set; }
        public string Keywords { get; set; } = string.Empty;
        private List<PropertyFilterModel> _propertyFilterModels;
        public IReadOnlyList<PropertyFilterModel> PropertyFilterModels
        {
            get
            {
                if (_propertyFilterModels != null && _propertyFilterModels.Any())
                {
                    return _propertyFilterModels;
                }

                if (!string.IsNullOrWhiteSpace(Filters))
                {
                    DissectFilters();
                }

                return _propertyFilterModels;
            }
        }

        public RequestFilterModel()
        {
            _propertyFilterModels = new List<PropertyFilterModel>();
        }
        private void DissectFilters()
        {
            var conditions = Filters!.Split('|');
            foreach (var condition in conditions)
            {
                if (string.IsNullOrEmpty(condition)
                    || !condition.Contains("::", StringComparison.OrdinalIgnoreCase)) continue;

                var propertyFilter = new PropertyFilterModel();
                var conditionPaths = condition.Split("::");
                propertyFilter.Field = conditionPaths[0].Trim().ToUpperFirstLetter();
                propertyFilter.FilterValue = conditionPaths[1].Trim();
                propertyFilter.Operator = conditionPaths.Length > 2 ? conditionPaths[2].Trim() : RequestFilterOperator.Equal;
                _propertyFilterModels.Add(propertyFilter);
            }
        }

        public object Get(string field, string @operator = "")
        {
            if (PropertyFilterModels.Count == 0 || string.IsNullOrWhiteSpace(field)) return null;

            return PropertyFilterModels.FirstOrDefault(
                p => p.Field.Equals(field, StringComparison.OrdinalIgnoreCase) &&
                    (string.IsNullOrWhiteSpace(@operator) || @operator.Equals(p.Operator, StringComparison.OrdinalIgnoreCase)))
                    ?.FilterValue;

        }

        public PropertyFilterModel GetProperty(string field)
        {
            if (PropertyFilterModels.Count == 0 || string.IsNullOrWhiteSpace(field)) return null;

            return PropertyFilterModels.FirstOrDefault(
                p => p.Field.Equals(field, StringComparison.OrdinalIgnoreCase));
        }
        public PropertyFilterModel[] GetProperties(string field)
        {
            if (PropertyFilterModels.Count == 0 || string.IsNullOrWhiteSpace(field)) return null;

            return PropertyFilterModels.Where(
                p => p.Field.Equals(field, StringComparison.OrdinalIgnoreCase))
                .ToArray();
        }

        public TResult? Get<TResult>(string field, string @operator = "")
        {
            var result = Get(field, @operator);
            try
            {
                Type convertedType = Nullable.GetUnderlyingType(typeof(TResult)) ?? typeof(TResult);
                var convertedObject = Convert.ChangeType(result, convertedType);
                return (TResult)convertedObject;
            }
            catch (InvalidCastException)
            {
                return default;
            }
            catch (FormatException)
            {
                return default;
            }
            catch (ArgumentNullException)
            {
                return default;
            }
            catch (OverflowException)
            {
                return default;
            }
        }
        public bool Any(string field, string @operator = "")
        {
            if (PropertyFilterModels.Count == 0 || string.IsNullOrWhiteSpace(field)) return false;
            return PropertyFilterModels
                .Any(p => field.Equals(p.Field, StringComparison.OrdinalIgnoreCase) &&
                    (string.IsNullOrWhiteSpace(@operator) || @operator.Equals(p.Operator, StringComparison.OrdinalIgnoreCase)));

        }

        public RequestFilterModel ClearFilter()
        {
            Filters = string.Empty;
            _propertyFilterModels?.Clear();
            return this;
        }

        public RequestFilterModel ClearOrder()
        {
            _orderBy = "";
            return this;
        }

        public RequestFilterModel NoPaging()
        {
            Paging = false;
            return this;
        }

        public override string ToString()
        {
            var stringBuilder = new StringBuilder();
            stringBuilder.Append($"filter_model_");
            stringBuilder.Append($"{Type}{Take}{Skip}{Paging}{OrderBy}{Dir}{Keywords}_{Filters}");

            return stringBuilder.ToString();
        }

        public RequestFilterModel Copy()
        {
            var clone = (RequestFilterModel)MemberwiseClone();
            clone._propertyFilterModels = new List<PropertyFilterModel>();
            return clone;
        }

        public static string GetCommandFromPropertyFilterModel(PropertyFilterModel filterProperty)
        {
            string command = string.Empty;
            switch (filterProperty.Operator)
            {
                case "exists":
                    command = $"{filterProperty.FilterColumn} IN ({filterProperty.FilterValue})";
                    break;
                case "eq":
                    command = $"{filterProperty.FilterColumn} = '{filterProperty.FilterValue}'";

                    //sqlBuilder.Where(fieldType == DbType.String
                    //        //? $"{filterProperty.Field} LIKE @{filterProperty.FilterValue} COLLATE {localCollation}"
                    //        ? $"{filterProperty.FilterColumn} LIKE @{filterProperty.FilterValue}"
                    //        : $"{filterProperty.FilterColumn} = @{filterProperty.FilterValue}");
                    break;
                case "startswith":
                    command = $"{filterProperty.FilterColumn} LIKE '{filterProperty.FilterValue}%'";
                    break;
                case "endswith":
                    command = $"{filterProperty.FilterColumn} LIKE '%{filterProperty.FilterValue}'";
                    break;
                case "contains":
                    command = $"{filterProperty.FilterColumn} LIKE '%{filterProperty.FilterValue}%'";
                    break;
                case "doesnotcontain":
                    command = $"{filterProperty.FilterColumn} NOT LIKE '%{filterProperty.FilterValue}%'";
                    break;
                case "neq":
                    command = $"{filterProperty.FilterColumn} <> '{filterProperty.FilterValue}'";

                    //sqlBuilder.Where(fieldType == DbType.String
                    //    //? $"{filterProperty.Field} NOT LIKE @{filterProperty.FilterValue} COLLATE {localCollation}"
                    //    ? $"{filterProperty.FilterColumn} NOT LIKE @{filterProperty.FilterValue}"
                    //    : $"{filterProperty.FilterColumn} <> @{filterProperty.FilterValue}");
                    break;
                case "gt":
                    command = $"{filterProperty.FilterColumn} > '{filterProperty.FilterValue}'";
                    break;
                case "gte":
                    command = $"{filterProperty.FilterColumn} >= '{filterProperty.FilterValue}'";
                    break;
                case "lt":
                case "lte":
                    if (filterProperty.FilterValue is DateTime ltCompareValue)
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
                    //command = $"{filterProperty.FilterColumn} " +
                    //    $"{(filterProperty.Operator == "lt" ? "<" : "<=")} " +
                    //    $":{filterProperty.FilterValue}";

                    command = $"{filterProperty.FilterColumn} " +
                        $"{(filterProperty.Operator == "lt" ? "<" : "<=")} " +
                        $"'{filterProperty.FilterValue}'";
                    break;
                case "isnotnull":
                    command = $"{filterProperty.FilterColumn} IS NOT NULL";
                    break;
                case "isnull":
                    command = $"{filterProperty.FilterColumn} IS NULL";
                    break;
                case "isempty":
                    command = $"{filterProperty.FilterColumn} LIKE N''";
                    break;
                case "isnotempty":
                    command = $"{filterProperty.FilterColumn} NOT LIKE N''";
                    break;
            }
            return command;
        }
    }

    public enum RequestType
    {
        Grid = 1,
        Selection = 2,
        Hierarchical = 3,
        SimpleAll = 4,
        Autocomplete = 5,
        AutocompleteSimple = 6
    }

    internal static class Extensions
    {
        public static string ToUpperFirstLetter(this string src)
        {
            if (string.IsNullOrWhiteSpace(src)) return string.Empty;

            var chars = src
                .Select((c, i) => i == 0 ? c.ToString().ToUpper() : c.ToString())
                .ToArray();

            return string.Join("", chars);
        }
    }

    public class ReportFilterBase : RequestFilterModel
    {
        public string ContractCode { get; set; }
        public string CustomerCode { get; set; }
        public DateTime? TimelineSignedStart { get; set; }
        public DateTime? TimelineSignedEnd { get; set; }
        public int ServiceId { get; set; }
        public int ProjectId { get; set; }
        public int MarketAreaId { get; set; }
        public string ContractorFullName { get; set; }
        public DateTime? TimelineEffectiveStart { get; set; }
        public DateTime? TimelineEffectiveEnd { get; set; }
        public string CurrencyUnitCode { get; set; }
    }
}