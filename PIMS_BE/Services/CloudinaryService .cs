namespace PIMS_BE.Services;
using PIMS_BE.Services.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
            throw new Exception("File is empty");

        using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            Transformation = new Transformation()
                .Width(500).Height(500).Crop("fill").Gravity("face")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        return result.SecureUrl.ToString();
    }
}
