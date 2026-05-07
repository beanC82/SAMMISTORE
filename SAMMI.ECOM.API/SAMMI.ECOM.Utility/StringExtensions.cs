using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;

namespace SAMMI.ECOM.Utility
{
    public static class StringExtensions
    {
        public const string UniChars = "àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴÂĂĐÔƠƯ";

        public const string AsciiChars =
            //"aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAAEEEEEEEEEEEDIIIOOOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYAADOOU";
            "aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiiooooooooooooooooouuuuuuuuuuuyyyyyaaaaaaaaaaaaaaaaaeeeeeeeeeeediiiooooooooooooooooooouuuuuuuuuuuyyyyyaadoou";

        public const string KeyBoardChars = " `1234567890-=~!@#$%^&*()_+qwertyuiop[]{}|asdfghjkl;':zxcvbnm,./<>?*-+";
        /// <summary>
        /// Split string to an int array
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        public static List<int> SplitToArray(this string s, char seperator)
        {
            if (string.IsNullOrWhiteSpace(s))
            {
                return new List<int>();
            }

            var result = new List<int>();
            var strArr = s.Split(seperator);
            foreach (var numberAsStr in strArr)
            {
                if (int.TryParse(numberAsStr, out var number))
                {
                    result.Add(number);
                }
            }

            return result;
        }

        public static T DeserializeObject<T>(this string source) where T : class
        {
            if (string.IsNullOrWhiteSpace(source))
                return null;

            return JsonConvert.DeserializeObject<T>(source);
        }

        public static int? ToNullableInt(this string source)
        {
            if (string.IsNullOrWhiteSpace(source) || !int.TryParse(source, out var result))
            {
                return null;
            }

            return result;
        }

        public static string ToAscii(this string str)
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
            result = Regex.Replace(result, @"\s+", "-");
            result = Regex.Replace(result, @"-+", "-");

            return result;
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
        public static string GenerateRandomString(int length = 8)
        {
            var random = new Random();
            string characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            StringBuilder result = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                result.Append(characters[random.Next(characters.Length)]);
            }
            return result.ToString();
        }

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

        public static string ToLowerFirstLetter(this string src)
        {
            var chars = src
                .Select((c, i) => i == 0 ? c.ToString().ToLower() : c.ToString())
                .ToArray();

            return string.Join("", chars);
        }
        public static string ResolveUrl(this string path)
        {
            //var validUrl = Uri.EscapeDataString($"{path.ToLower().Replace(@"\", "/")}");
            var validUrl = $"{path.ToLower().Replace(@"\", "/")}";
            return validUrl;
        }
        public static string ResolveFileName(this string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
            {
                return string.Empty;
            }

            var result = fileName.ToLower().Trim();
            result = Regex.Replace(result, "[á|à|ả|ã|ạ|â|ă|ấ|ầ|ẩ|ẫ|ậ|ắ|ằ|ẳ|ẵ|ặ]", "a", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ]", "e", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự]", "u", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[í|ì|ỉ|ĩ|ị]", "i", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[ó|ò|ỏ|õ|ọ|ô|ơ|ố|ồ|ổ|ỗ|ộ|ớ|ờ|ở|ỡ|ợ]", "o", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[đ]", "d", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[ý|ỳ|ỷ|ỹ|ỵ]", "y", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, "[,|~|@|/|.|:|?|#|$|%|&|*|(|)|+|”|“|'|\"|!|`|–|\\^|\\[|\\]|\\{|\\}]", "", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"\s+", "-");
            result = Regex.Replace(result, @"-+", "-");
            return result;
        }

        //public static string GetPlainTextFromHtml(this string source)
        //{
        //    if (string.IsNullOrWhiteSpace(source)) return string.Empty;

        //    var doc = new HtmlDocument();
        //    doc.LoadHtml(source);
        //    return doc.DocumentNode.InnerText;
        //}

        public static string ResolveExcelValue(this object s)
        {
            if (s == null) return string.Empty;
            var result = s.ToString().Trim();

            if (string.IsNullOrEmpty(result)) return string.Empty;

            return Regex.Replace(result, @"\r\n?|\n|\t", string.Empty);
        }

        public static int[] SplitToInt(this string src, char splitter)
        {
            if (string.IsNullOrWhiteSpace(src))
            {
                return new int[0];
            }

            return src.Split(splitter).Select(int.Parse).ToArray();
        }

        public static string JoinUnique(this string src, string element, char splitter = ',')
        {
            if (string.IsNullOrWhiteSpace(element)) return src;
            if (string.IsNullOrEmpty(src))
            {
                src = element;
                return src;
            }

            var paths = src.Split(splitter).ToList();
            if (paths.Any(c => c.EqualsIgnoreCase(element))) return src;
            paths.Add(element);
            src = string.Join(splitter, paths);
            return src;
        }

        public static IEnumerable<string> SplitByLength(this string str, int chunkSize)
        {
            return Enumerable.Range(0, str.Length / chunkSize)
                .Select(i => str.Substring(i * chunkSize, chunkSize));
        }

        public static string DeepTrim(this string str)
        {
            if (string.IsNullOrEmpty(str))
            {
                return string.Empty;
            }

            str = str.Trim();
            str = Regex.Replace(str, @"\s+", " ", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            return str;
        }

        public static string RemoveSpace(this string str)
        {
            if (string.IsNullOrEmpty(str))
            {
                return string.Empty;
            }

            str = str.Trim();
            str = Regex.Replace(str, @"\s+", "", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            str = Regex.Replace(str, @"\n+", "", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            str = Regex.Replace(str, @"\r+", "", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            str = Regex.Replace(str, @"\t+", "", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            return str;
        }

        public static string ToAscii(this string str, string joiner = "-")
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
            result = Regex.Replace(result, "[,|~|@|/|.|:|?|#|$|%|&|*|(|)|+|”|“|'|\"|!|`|–|-]", "", RegexOptions.IgnoreCase);
            result = Regex.Replace(result, @"\s+", joiner);
            result = Regex.Replace(result, $@"{joiner}+", joiner);

            return result;
        }

        public static string GetAcronym(this string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "";

            var wordParts = Regex.Split(input, @"\b", RegexOptions.Multiline);
            return string.Join(string.Empty, wordParts.Where(c => !string.IsNullOrWhiteSpace(c))
                .Select(c => c.GetFirstLetter().ToAscii().ToUpper()));
        }

        public static string GetFirstLetter(this string src)
        {
            if (string.IsNullOrWhiteSpace(src)) return string.Empty;

            return src[0].ToString();
        }

        public static string ToUpperFirstLetterOnly(this string src)
        {
            if (string.IsNullOrWhiteSpace(src)) return string.Empty;

            return new string(src.Select((c, i) => i == 0 ? Char.ToUpper(c) : Char.ToLower(c)).ToArray());
        }

        public static bool EqualsIgnoreCase(this string src, string compareStr)
        {
            if (string.IsNullOrWhiteSpace(src) && string.IsNullOrWhiteSpace(compareStr)) return true;

            if (string.IsNullOrWhiteSpace(src) || string.IsNullOrWhiteSpace(compareStr)) return false;

            return src.Trim().Equals(compareStr.Trim(), StringComparison.InvariantCultureIgnoreCase);
        }

        public static bool ContainsIgnoreCase(this string src, string compareStr)
        {
            if (string.IsNullOrWhiteSpace(src) && string.IsNullOrWhiteSpace(compareStr)) return true;

            if (string.IsNullOrWhiteSpace(src) || string.IsNullOrWhiteSpace(compareStr)) return false;

            return src.Contains(compareStr, StringComparison.InvariantCultureIgnoreCase);
        }

        public static string Compress(this string text)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(text);
            MemoryStream ms = new MemoryStream();
            using (GZipStream zip = new GZipStream(ms, CompressionMode.Compress, true))
            {
                zip.Write(buffer, 0, buffer.Length);
            }

            ms.Position = 0;
            byte[] compressed = new byte[ms.Length];
            ms.Read(compressed, 0, compressed.Length);

            byte[] gzBuffer = new byte[compressed.Length + 4];
            System.Buffer.BlockCopy(compressed, 0, gzBuffer, 4, compressed.Length);
            System.Buffer.BlockCopy(BitConverter.GetBytes(buffer.Length), 0, gzBuffer, 0, 4);
            return Convert.ToBase64String(gzBuffer);
        }

        public static string GetExcelColumnName(int columnIndex)
        {
            const int alphabetLength = 26;
            string columnName = string.Empty;

            while (columnIndex > 0)
            {
                int modulo = (columnIndex - 1) % alphabetLength;
                columnName = Convert.ToChar('A' + modulo) + columnName;
                columnIndex = (columnIndex - modulo) / alphabetLength;
            }

            return columnName;
        }

        public static T DeserializeJson<T>(this string json)
        {
            return JsonConvert.DeserializeObject<T>(json, new JsonSerializerSettings
            {
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy() // Chấp nhận chữ thường
                }
            });
        }

        public static string FormatCurrency(this decimal currency)
        {
            return currency.ToString("N0") + "đ";
        }

        public static bool IsValidEmail(string email)
        {
            var trimmedEmail = email.Trim();

            if (trimmedEmail.EndsWith("."))
            {
                return false;
            }
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == trimmedEmail;
            }
            catch
            {
                return false;
            }
        }
    }
}