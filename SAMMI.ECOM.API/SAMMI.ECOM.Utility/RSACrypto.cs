
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace SAMMI.ECOM.Utility
{
    public static class RSACrypto
    {
        //public static string GenerateSignature(string plainText)
        //{
        //    byte[] signedHash;
        //    byte[] data = Encoding.ASCII.GetBytes(plainText);
        //    using (RSA rsa = RSA.Create())
        //    {
        //        rsa.ImportFromPem(File.ReadAllText("./SHA256Keys/vietinbank_onebs_private_key.pem"));
        //        RSAParameters sharedParameters = rsa.ExportParameters(false);
        //        var alg = SHA256.Create();
        //        byte[] hash = alg.ComputeHash(data);

        //        RSAPKCS1SignatureFormatter rsaFormatter = new(rsa);
        //        rsaFormatter.SetHashAlgorithm(nameof(SHA256));

        //        signedHash = rsaFormatter.CreateSignature(hash);
        //    }
        //    return Convert.ToBase64String(signedHash);

        //}
        //public static bool VerifySignature(string cypherText, string plainText)
        //{
        //    try
        //    {
        //        byte[] signedHash = Convert.FromBase64String(cypherText);
        //        byte[] data = Encoding.ASCII.GetBytes(plainText);
        //        using (RSA rsa = RSA.Create())
        //        {
        //            rsa.ImportFromPem(File.ReadAllText("./SHA256Keys/vietinbank_onebs_public_key.cer"));
        //            RSAParameters sharedParameters = rsa.ExportParameters(false);
        //            var alg = SHA256.Create();
        //            byte[] hash = alg.ComputeHash(data);

        //            rsa.ImportParameters(sharedParameters);

        //            RSAPKCS1SignatureDeformatter rsaDeformatter = new(rsa);
        //            rsaDeformatter.SetHashAlgorithm(nameof(SHA256));

        //            if (rsaDeformatter.VerifySignature(hash, signedHash))
        //            {
        //                return true;
        //            }
        //            else
        //            {
        //                return false;
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return false;
        //    }

        //}

        //==========

        public static string GenerateSignature2(string plainText)
        {
            byte[] data = Encoding.ASCII.GetBytes(plainText);
            var provider = LoadPrivateKey().GetRSAPrivateKey();
            var rsByte = provider.SignData(data, 0, data.Length, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
            return Convert.ToBase64String(rsByte);
        }

        //public static bool VerifySignature2(string cypherText, string plainText)
        //{
        //    try
        //    {
        //        byte[] signedHash = Convert.FromBase64String(cypherText);
        //        byte[] data = Encoding.ASCII.GetBytes(plainText);

        //        var provider = LoadPublicKey().GetRSAPublicKey();
        //        return provider?.VerifyData(data, signedHash, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1) ?? false;
        //    }catch (Exception ex)
        //    {
        //        return false;
        //    }
        //}
        public static bool VerifySignatureGenQRVietin(string cypherText, string plainText) {
            return VerifySignatureWithKey(cypherText,plainText, LoadVietinGenQRPublicKey());
        }
        public static bool VerifySignatureConfirmPaidVietin(string cypherText, string plainText)
        {
            return VerifySignatureWithKey(cypherText, plainText, LoadVietinConfirmPaidPublicKey());
        }
        private static bool VerifySignatureWithKey(string cypherText, string plainText, X509Certificate2 publicKey)
        {
            try
            {
                byte[] signedHash = Convert.FromBase64String(cypherText);
                byte[] data = Encoding.ASCII.GetBytes(plainText);

                var provider = publicKey.GetRSAPublicKey();
                return provider?.VerifyData(data, signedHash, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1) ?? false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private static X509Certificate2 LoadPrivateKey()
        {
            return new X509Certificate2("./SHA256Keys/vietinbank_onebs_private_cerfiticate.pfx", "OneBS2024", X509KeyStorageFlags.MachineKeySet
                             | X509KeyStorageFlags.PersistKeySet
                             | X509KeyStorageFlags.Exportable);
        }
        private static X509Certificate2 LoadVietinGenQRPublicKey()
        {
            return new X509Certificate2("./SHA256Keys/VietinGenQRPublicKey.cer");
        }
        private static X509Certificate2 LoadVietinConfirmPaidPublicKey()
        {
            return new X509Certificate2("./SHA256Keys/VietinConfirmPaidPublicKey.cer");
        }
    }
}
