namespace PIMS_BE.Services.Interfaces;
public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file, string folder);
}
