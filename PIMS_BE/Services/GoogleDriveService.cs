using System;
using System.IO;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Drive.v3;
using Google.Apis.Services;

namespace PIMS_BE.Services
{
    public sealed class GoogleDriveService
    {
        public DriveService GetDriveService(string credentialPath = "client_secret.json")
        {
            if (string.IsNullOrWhiteSpace(credentialPath))
            {
                throw new ArgumentException("Credential path must not be null or empty.", nameof(credentialPath));
            }

            if (!File.Exists(credentialPath))
            {
                throw new FileNotFoundException($"Google credentials file not found: {credentialPath}", credentialPath);
            }

            // Sử dụng FromFile để thay thế cho FromStream(stream) đã bị cảnh báo lỗi thời
            // Phương thức này an toàn và được khuyên dùng cho các phiên bản thư viện mới
            GoogleCredential credential = GoogleCredential.FromFile(credentialPath)
                                         .CreateScoped(DriveService.ScopeConstants.Drive);

            return new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "Project Information Management System" // Tên dự án PIMS của bạn
            });
        }
    }
}