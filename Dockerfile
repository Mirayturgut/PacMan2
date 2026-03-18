FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["PacMan2.csproj", "./"]
RUN dotnet restore "./PacMan2.csproj"

COPY . .
RUN find . -maxdepth 3 -type f | sort
RUN dotnet publish "./PacMan2.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "PacMan2.dll"]