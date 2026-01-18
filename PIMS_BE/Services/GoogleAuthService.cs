using Google.Apis.Auth;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly string _clientId;
    public GoogleAuthService(IConfiguration configuration) {
        _clientId = configuration["GoogleAuth:ClientId"];
    }
    public async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenAsync(string token)
    {
        try {
            var setting = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new List<string> { _clientId }
            };
            var payload = await GoogleJsonWebSignature.ValidateAsync(token, setting);
            return payload;
        } catch (Exception) {
            return null;
        }
    }
}