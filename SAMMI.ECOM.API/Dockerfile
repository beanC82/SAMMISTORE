#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

#Depending on the operating system of the host machines(s) that will build or run the containers, the image specified in the FROM statement may need to be changed.
#For more information, please see https://aka.ms/containercompat

#window
#FROM mcr.microsoft.com/dotnet/aspnet:8.0-nanoserver-1809 AS base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081


#window
#FROM mcr.microsoft.com/dotnet/sdk:8.0-nanoserver-1809 AS build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["SAMMI.ECOM.API/SAMMI.ECOM.API.csproj", "SAMMI.ECOM.API/"]
COPY ["SAMMI.ECOM.Core/SAMMI.ECOM.Core.csproj", "SAMMI.ECOM.Core/"]
COPY ["SAMMI.ECOM.I18N/SAMMI.ECOM.I18N.csproj", "SAMMI.ECOM.I18N/"]
COPY ["SAMMI.ECOM.Domain/SAMMI.ECOM.Domain.csproj", "SAMMI.ECOM.Domain/"]
COPY ["SAMMI.ECOM.Infrastructure/SAMMI.ECOM.Infrastructure.csproj", "SAMMI.ECOM.Infrastructure/"]
COPY ["SAMMI.ECOM.Repository/SAMMI.ECOM.Repository.csproj", "SAMMI.ECOM.Repository/"]
COPY ["SAMMI.ECOM.Utility/SAMMI.ECOM.Utility.csproj", "SAMMI.ECOM.Utility/"]
RUN dotnet restore "./SAMMI.ECOM.API/SAMMI.ECOM.API.csproj"
COPY . .
WORKDIR "/src/SAMMI.ECOM.API"
RUN dotnet build "./SAMMI.ECOM.API.csproj" -c %BUILD_CONFIGURATION% -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./SAMMI.ECOM.API.csproj" -c %BUILD_CONFIGURATION% -o /app/publish /p:UseAppHost=false

# FROM base AS final
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SAMMI.ECOM.API.dll"]