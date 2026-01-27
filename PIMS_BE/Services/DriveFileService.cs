using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;

namespace PIMS_BE.Services.Interfaces
{
    public class DriveFileService : IDriveFileService
    {
        private readonly IConfiguration _config;
        private readonly string _applicationName = "PIMS_Project";

        public DriveFileService(IConfiguration config)
        {
            _config = config;
        }

        // Hàm lấy Service dùng OAuth 2.0 Refresh Token
        private async Task<DriveService> GetDriveServiceAsync()
        {
            // 1. Tạo đối tượng ClientSecrets từ cấu hình
            var secrets = new ClientSecrets
            {
                ClientId = _config["GoogleDrive:ClientId"],
                ClientSecret = _config["GoogleDrive:ClientSecret"]
            };

            // 2. Khởi tạo TokenResponse với RefreshToken hiện có
            var tokenResponse = new TokenResponse { RefreshToken = _config["GoogleDrive:RefreshToken"] };

            // 3. Quan trọng: Sử dụng UserCredential với đầy đủ Flow để có khả năng Refresh
            var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = secrets,
                Scopes = new[] { DriveService.Scope.DriveFile }
            });

            // Tạo Credential và buộc nó phải Refresh nếu hết hạn
            var credential = new UserCredential(flow, "user", tokenResponse);

            // Ép làm mới Token ngay lập tức nếu nó đã chết
            if (credential.Token.IsStale)
            {
                var refreshed = await credential.RefreshTokenAsync(CancellationToken.None);
                if (!refreshed) throw new Exception("Không thể làm mới Token. Hãy kiểm tra lại RefreshToken trong appsettings.json");
            }

            return new DriveService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = _applicationName
            });
        }

        public async Task<string> UploadFileAsync(IFormFile file, string folderId)
        {
            if (file == null || file.Length == 0) throw new ArgumentException("File is empty");

            // Lấy service mới nhất (đã có token hợp lệ)
            var service = await GetDriveServiceAsync();

            var fileMetadata = new Google.Apis.Drive.v3.Data.File()
            {
                Name = file.FileName,
                Parents = new List<string> { folderId }
            };

            using (var stream = file.OpenReadStream())
            {
                var request = service.Files.Create(fileMetadata, stream, file.ContentType);
                request.Fields = "id, webViewLink";

                var progress = await request.UploadAsync();

                if (progress.Status == Google.Apis.Upload.UploadStatus.Failed)
                {
                    throw new Exception($"Upload to Google Drive failed: {progress.Exception.Message}");
                }

                var uploadedFile = request.ResponseBody;

                // Với OAuth cá nhân, không cần set permission "anyone" nếu bạn chỉ muốn mình xem được.
                // Nhưng nếu muốn trả link cho Mentor xem, vẫn nên giữ đoạn này:
                var permission = new Google.Apis.Drive.v3.Data.Permission { Role = "reader", Type = "anyone" };
                await service.Permissions.Create(permission, uploadedFile.Id).ExecuteAsync();

                return uploadedFile.Id;
            }
        }

        public async Task<byte[]> DownloadFileAsync(string fileId)
        {
            var service = await GetDriveServiceAsync();
            var request = service.Files.Get(fileId);

            using (var stream = new MemoryStream())
            {
                await request.DownloadAsync(stream);
                return stream.ToArray();
            }
        }

        public async Task DeleteFileAsync(string fileId)
        {
            var service = await GetDriveServiceAsync();
            await service.Files.Delete(fileId).ExecuteAsync();
        }
    }
}