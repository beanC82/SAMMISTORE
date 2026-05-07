using Microsoft.EntityFrameworkCore.Metadata;

namespace SAMMI.ECOM.Repository.GenericRepositories
{
    public static class QueryRepositoryExtensions
    {
        public static string FindColumn(this Dictionary<string, IProperty> src, string? fieldName)
        {
            if (string.IsNullOrEmpty(fieldName)) return string.Empty;

            var columnName = src.FirstOrDefault(c => fieldName.Equals(c.Value.Name, StringComparison.InvariantCultureIgnoreCase));

            return columnName.Key;
        }



        public static bool ContainsFieldIgnoreCase(this Dictionary<string, IProperty>? dictionary, string field)
        {
            if (dictionary == null) return false;

            bool fieldExists = false;

            if (field != null)
            {
                // Key is a string.
                // Using string.Equals to perform case insensitive comparison of the dictionary key.
                fieldExists =
                    dictionary.Values.Any(k => string.Equals(k.Name, field, StringComparison.InvariantCultureIgnoreCase));
            }

            return fieldExists;
        }
    }
}
