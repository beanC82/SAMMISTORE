using Microsoft.AspNetCore.Http;
using System.IO.Compression;
using System.Security.Claims;
using System.Text;

namespace SAMMI.ECOM.Core.Authorizations
{
    public class UserIdentity
    {
        private readonly ClaimsIdentity? _claimsIdentity;
        public UserIdentity(IHttpContextAccessor httpContextAccessor)
        {
            _claimsIdentity = httpContextAccessor?.HttpContext?.User?.Identity as ClaimsIdentity;
            DecomposeRawPermissionClaims();
        }

        private void DecomposeRawPermissionClaims()
        {
            var permissionsOfUser = new HashSet<string>();
            var permissionClaims = _claimsIdentity?
                    .FindAll(GlobalClaimsTypes.Permissions)
                    ?.Select(v => v.Value)
                    ?.ToList();

            if (permissionClaims == null || permissionClaims.Count == 0) return;

            foreach (var permissions in permissionClaims)
            {
                var decompressPermissions = DecompressPermission(permissions).Split(',');
                Array.ForEach(decompressPermissions, c => permissionsOfUser.Add(c.ToUpper()));
            }

            Permissions = permissionsOfUser.ToArray();
        }
        public int Id => Convert.ToInt32(
            _claimsIdentity?.FindFirst(GlobalClaimsTypes.LocalId)?.Value
        );

        public string? UniversalId => _claimsIdentity?.FindFirst(GlobalClaimsTypes.UniversalId)?.Value;
        public string? UserName => _claimsIdentity?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        public string? FullName => _claimsIdentity?.FindFirst(ClaimTypes.Name)?.Value;
        public string FirstName
        {
            get
            {
                if (string.IsNullOrWhiteSpace(FullName))
                {
                    return string.Empty;
                }

                return FullName.Split(' ').Last();
            }
        }
        public string LastName
        {
            get
            {
                if (string.IsNullOrWhiteSpace(FullName))
                {
                    return string.Empty;
                }

                return FullName.Replace(FirstName, "");
            }
        }
        public string? MobilePhone => _claimsIdentity?.FindFirst(ClaimTypes.MobilePhone)?.Value;
        public string? Address => _claimsIdentity?.FindFirst(ClaimTypes.StreetAddress)?.Value;
        public string? Email => _claimsIdentity?.FindFirst(ClaimTypes.Email)?.Value;
        public string[]? Roles => _claimsIdentity?.FindAll(ClaimTypes.Role)?.Select(v => v.Value)?.ToArray();
        public string[] Permissions { get; set; }
        public string[]? OrganizationPaths => _claimsIdentity?.FindAll(GlobalClaimsTypes.OrganizationPath)?.Select(v => v.Value)?.ToArray();
        public string[]? Organizations => _claimsIdentity?.FindAll(GlobalClaimsTypes.Organization)?.Select(v => v.Value)?.ToArray();

        private string DecompressPermission(string compressedText)
        {
            byte[] gZipBuffer = Convert.FromBase64String(compressedText);
            using (var memoryStream = new MemoryStream())
            {
                int dataLength = BitConverter.ToInt32(gZipBuffer, 0);
                memoryStream.Write(gZipBuffer, 4, gZipBuffer.Length - 4);

                var buffer = new byte[dataLength];

                memoryStream.Position = 0;
                using (var gZipStream = new GZipStream(memoryStream, CompressionMode.Decompress))
                {
                    gZipStream.Read(buffer, 0, buffer.Length);
                }

                return Encoding.UTF8.GetString(buffer);
            }
        }
    }
}
