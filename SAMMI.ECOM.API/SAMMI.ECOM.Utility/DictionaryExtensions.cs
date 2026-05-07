namespace SAMMI.ECOM.Utility
{
    public static class DictionaryExtensions
    {
        public static bool IsNullOrEmpty<TKey, TValue>(this Dictionary<TKey, TValue> dictionary)
        {
            return dictionary == null || dictionary.Count == 0;
        }
    }
}
