using Microsoft.AspNetCore.SignalR;
namespace PIMS_BE.Hubs
{
    public class ChatHub : Hub 
    {
        public  async Task sendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage",user, message);
        }

        public async Task SendPrivateMessage(string toUserId, string message) 
        {
            var senderUserId = Context.UserIdentifier;
            await Clients.User(toUserId).SendAsync("ReceivePrivateMessage", senderUserId,message);
        }
    }
}