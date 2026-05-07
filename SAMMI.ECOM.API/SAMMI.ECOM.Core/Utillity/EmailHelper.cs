using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MailKit.Net.Smtp;

namespace SAMMI.ECOM.Core.Utillity
{
    public class EmailHelper
    {
        private readonly IConfiguration _config;
        public static string RootLocation => Assembly.GetExecutingAssembly().Location;
        public static string DirPath => Path.GetDirectoryName(RootLocation);
        public static string EmailTemplatePath(string templateFile) => Path.GetFullPath(Path.Combine(DirPath, @"Utillity\EmailTemplate", templateFile));
        public EmailHelper(IConfiguration config)
        {
            _config = config.GetSection("EmailSettings");
        }

        public void SendEmailVerify(string sendTo, string customerName, string token)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_config["Username"]));
                email.To.Add(MailboxAddress.Parse(sendTo));
                email.Subject = "Xác thực email đăng ký Sammi Store";

                var emailTemplate = File.ReadAllText(EmailTemplatePath("CrmSendEmailVerify.html"));

                emailTemplate = Regex.Replace(emailTemplate, "{{customer_name}}", customerName);
                emailTemplate = Regex.Replace(emailTemplate, "{{verify_url}}", $"{_config["VerifyUrl"]}?token={token}");
                emailTemplate = Regex.Replace(emailTemplate, "{{re_verify_url}}", $"{_config["ReVerifyUrl"]}?email={sendTo}");

                email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = emailTemplate };

                using var smtp = new SmtpClient();

                smtp.Connect(_config["SmtpServer"], int.Parse(_config["Port"]), false);
                smtp.Authenticate(_config["Username"], _config["Password"]);
                smtp.Send(email);
                smtp.Disconnect(true);

            }
            catch(Exception ex)
            {
                Console.WriteLine($"Error send email: {ex.Message}");
            }
        }
    }
}
