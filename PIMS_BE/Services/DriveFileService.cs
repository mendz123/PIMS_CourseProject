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

        private async Task<DriveService> GetDriveServiceAsync()
        {
          
            var secrets = new ClientSecrets
            {
                ClientId = _config["GoogleDrive:ClientId"],
                ClientSecret = _config["GoogleDrive:ClientSecret"]
            };

            var tokenResponse = new TokenResponse { RefreshToken = _config["GoogleDrive:RefreshToken"] };

            var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
            {
                ClientSecrets = secrets,
                Scopes = new[] { DriveService.Scope.DriveFile }
            });

            var credential = new UserCredential(flow, "user", tokenResponse);

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