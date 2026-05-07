namespace SAMMI.ECOM.Utility
{
    public static class CollectionExtensions
    {
        public static int FindIndex<T>(this IEnumerable<T> items, Predicate<T> predicate)
        {
            int index = 0;
            foreach (var item in items)
            {
                if (predicate(item)) break;
                index++;
            }
            return index;
        }

        public static bool IsLastItem<T>(this IEnumerable<T> items, Predicate<T> predicate)
        {
            var lastItem = items.LastOrDefault();
            if (lastItem == null)
            {
                return false;
            }

            return predicate(lastItem);
        }

        public static bool ContainsKeyIgnoreCase<TValue>(this Dictionary<string, TValue>? dictionary, string key)
        {
            if (dictionary == null) return false;

            bool? keyExists;

            var keyString = key as string;
            if (keyString != null)
            {
                // Key is a string.
                // Using string.Equals to perform case insensitive comparison of the dictionary key.
                keyExists =
                    dictionary.Keys.Any(k => string.Equals(k, keyString, StringComparison.InvariantCultureIgnoreCase));
            }
            else
            {
                // Key is any other type, use default comparison.
                keyExists = dictionary.ContainsKey(key);
            }

            return keyExists ?? false;
        }
        public static bool AnyIgnoreCase(this IEnumerable<string>? array, string val)
        {
            if (array == null) return false;

            bool keyExists = false;
            if (val != null)
            {
                // Key is a string.
                // Using string.Equals to perform case insensitive comparison of the dictionary key.
                keyExists =
                    array.Any(k => string.Equals(k, val, StringComparison.InvariantCultureIgnoreCase));
            }

            return keyExists;
        }
    }
}
