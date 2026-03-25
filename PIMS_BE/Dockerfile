FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Khôi phục file cấu hình (csproj)
COPY ["*.csproj", "./"]
RUN dotnet restore

# Copy toàn bộ code vào Docker và tiến hành Publish
COPY . ./
RUN dotnet publish -c Release -o /app/out

# Dùng image ASP.NET Runtime (bản nhẹ) để làm môi trường chạy cho sản phẩm cuối
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Backend thường cấu hình lắng nghe trong container ở port 8080
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "PIMS_BE.dll"]
