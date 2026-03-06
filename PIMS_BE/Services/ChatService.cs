using PIMS_BE.DTOs.Chat;
using PIMS_BE.Models.Chat;
using PIMS_BE.Repositories;
using PIMS_BE.Services.Interfaces;

namespace PIMS_BE.Services
{
    public class ChatService : IChatService
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IConversationParticipantRepository _participantRepository;
        private readonly IUserRepository _userRepository;

        public ChatService(
            IConversationRepository conversationRepository,
            IMessageRepository messageRepository,
            IConversationParticipantRepository participantRepository,
            IUserRepository userRepository)
        {
            _conversationRepository = conversationRepository;
            _messageRepository = messageRepository;
            _participantRepository = participantRepository;
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(int userId)
        {
            var conversations = await _conversationRepository.GetUserConversationsAsync(userId);
            var result = new List<ConversationDto>();

            foreach (var conv in conversations)
            {
                var dto = new ConversationDto
                {
                    Id = conv.Id,
                    Type = conv.Type,
                    Name = conv.Name,
                    CreatedAt = conv.CreatedAt,
                    LastMessage = conv.Messages.Select(m => new MessageDto
                    {
                        Id = m.Id,
                        Content = m.Content,
                        CreatedAt = m.CreatedAt,
                        SenderId = m.SenderId
                    }).FirstOrDefault()
                };

                foreach (var part in conv.ConversationParticipants)
                {
                    var user = await _userRepository.GetByIdAsync(part.UserId);
                    dto.Participants.Add(new ParticipantDto
                    {
                        UserId = part.UserId,
                        FullName = user?.FullName ?? "Unknown",
                        Role = part.Role
                    });
                }

                result.Add(dto);
            }

            return result;
        }

        public async Task<IEnumerable<MessageDto>> GetConversationMessagesAsync(int conversationId, int count = 50)
        {
            var messages = await _messageRepository.GetConversationMessagesAsync(conversationId, count);
            var result = new List<MessageDto>();

            foreach (var m in messages)
            {
                var user = await _userRepository.GetByIdAsync(m.SenderId);
                result.Add(new MessageDto
                {
                    Id = m.Id,
                    ConversationId = m.ConversationId,
                    SenderId = m.SenderId,
                    SenderName = user?.FullName,
                    Content = m.Content,
                    MessageType = m.MessageType,
                    FileUrl = m.FileUrl,
                    CreatedAt = m.CreatedAt
                });
            }

            return result;
        }

        public async Task<MessageDto> SendMessageAsync(int senderId, SendMessageRequest request)
        {
            var message = new Message
            {
                ConversationId = request.ConversationId,
                SenderId = senderId,
                Content = request.Content,
                MessageType = request.MessageType,
                FileUrl = request.FileUrl,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _messageRepository.AddAsync(message);
            await _messageRepository.SaveChangesAsync();

            var user = await _userRepository.GetByIdAsync(senderId);

            return new MessageDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                SenderName = user?.FullName,
                Content = message.Content,
                MessageType = message.MessageType,
                FileUrl = message.FileUrl,
                CreatedAt = message.CreatedAt
            };
        }

        public async Task<ConversationDto> GetOrCreateDirectConversationAsync(int user1Id, int user2Id)
        {
            // Simplified: Check if any direct conversation exists between these two
            var conversations = await _conversationRepository.FindAsync(c => c.Type == 1);
            foreach (var conv in conversations)
            {
                var participants = await _participantRepository.GetConversationParticipantsAsync(conv.Id);
                var pIds = participants.Select(p => p.UserId).ToList();
                if (pIds.Count == 2 && pIds.Contains(user1Id) && pIds.Contains(user2Id))
                {
                    return await MapToDto(conv);
                }
            }

            // Create new
            var newConv = new Conversation
            {
                Type = 1,
                CreatedBy = user1Id,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _conversationRepository.AddAsync(newConv);
            await _conversationRepository.SaveChangesAsync();

            await _participantRepository.AddAsync(new ConversationParticipant { ConversationId = newConv.Id, UserId = user1Id, JoinedAt = DateTime.UtcNow });
            await _participantRepository.AddAsync(new ConversationParticipant { ConversationId = newConv.Id, UserId = user2Id, JoinedAt = DateTime.UtcNow });
            await _participantRepository.SaveChangesAsync();

            return await MapToDto(newConv);
        }

        public async Task<ConversationDto> CreateGroupConversationAsync(int creatorId, string name, List<int> participantIds)
        {
            var newConv = new Conversation
            {
                Type = 2,
                Name = name,
                CreatedBy = creatorId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _conversationRepository.AddAsync(newConv);
            await _conversationRepository.SaveChangesAsync();

            if (!participantIds.Contains(creatorId)) participantIds.Add(creatorId);

            foreach (var pId in participantIds)
            {
                await _participantRepository.AddAsync(new ConversationParticipant
                {
                    ConversationId = newConv.Id,
                    UserId = pId,
                    JoinedAt = DateTime.UtcNow,
                    Role = pId == creatorId ? 1 : 0 // 1 for Admin/Creator
                });
            }

            await _participantRepository.SaveChangesAsync();

            return await MapToDto(newConv);
        }

        private async Task<ConversationDto> MapToDto(Conversation conv)
        {
            var dto = new ConversationDto
            {
                Id = conv.Id,
                Type = conv.Type,
                Name = conv.Name,
                CreatedAt = conv.CreatedAt
            };

            var participants = await _participantRepository.GetConversationParticipantsAsync(conv.Id);
            foreach (var part in participants)
            {
                var user = await _userRepository.GetByIdAsync(part.UserId);
                dto.Participants.Add(new ParticipantDto
                {
                    UserId = part.UserId,
                    FullName = user?.FullName ?? "Unknown",
                    Role = part.Role
                });
            }

            return dto;
        }
    }
}
