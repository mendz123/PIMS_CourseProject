using Google.Apis.Drive.v3;

namespace PIMS_BE.Services.Interfaces
{
    public interface IDriveFileService
    {
        Task<string> UploadFileAsync(IFormFile file, string folderId);
        Task<byte[]> DownloadFileAsync(string fileId);
        Task DeleteFileAsync(string fileId);
    }
}
