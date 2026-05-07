using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SAMMI.ECOM.API.Application;
using SAMMI.ECOM.API.Infrastructure.Configuration;
using SAMMI.ECOM.Core.Models.GlobalConfigs;
using SAMMI.ECOM.Domain.Enums;

namespace SAMMI.ECOM.API.Extensions.ServiceExtensions
{
    public static class AuthenticationExtensions
    {
        public static IServiceCollection AddAuthenticationConfig(this IServiceCollection services, IConfiguration config)
        {
            var tokenOptionSettings = config.GetSection("TokenProvideOptions").Get<AccessTokenProvideOptions>();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(options =>
            {
                options.Cookie.Name = "DataCookie";
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.ExpireTimeSpan = TimeSpan.FromDays(7);
            })
            .AddGoogle(options =>
            {
                IConfigurationSection googleSection = config.GetSection("Authentication:Google");
                options.ClientId = googleSection["ClientId"];
                options.ClientSecret = googleSection["ClientSecret"];
                options.Scope.Add("profile");
                options.Scope.Add("email");
                options.CallbackPath = "/api/auth/google-login";
                options.SaveTokens = true;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, x =>
            {
                x.SaveToken = true;
                x.RequireHttpsMetadata = false;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidIssuer = tokenOptionSettings!.JWTIssuer,
                    IssuerSigningKey = tokenOptionSettings!.SigningCredentials.Key
                };

                x.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            return services;
        }

        public static IServiceCollection AddAuthorizationConfig(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                foreach (var per in PermissionCodes.AllPermissionCodes)
                {
                    options.AddPolicy(per.ToPolicyName(), policy =>
                    {
                        policy.Requirements.Add(new PermissionRequirement(per));
                    });
                }
            });

            return services;
        }
    }
}
