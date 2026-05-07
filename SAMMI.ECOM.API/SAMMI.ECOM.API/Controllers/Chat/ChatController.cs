using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAMMI.ECOM.Domain.Commands.Chat;
using SAMMI.ECOM.Domain.DomainModels.Chat;

namespace SAMMI.ECOM.API.Controllers.Chat
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : CustomBaseController
    {
        public ChatController(
            IMediator mediator,
            ILogger<ChatController> logger) : base(mediator, logger)
        {
        }

        /// <summary>
        /// AI Chatbot endpoint using CQRS (MediatR)
        /// </summary>
        [AllowAnonymous]
        [HttpPost("message")]
        public async Task<IActionResult> PostMessage([FromBody] ChatMessageRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            var command = new ProcessChatMessageCommand(request.Message, request.ConversationId);
            var response = await _mediator.Send(command, cancellationToken);
            
            return Ok(response.Result);
        }

        [Authorize]
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory(CancellationToken cancellationToken)
        {
            var query = new GetChatHistoryQuery();
            var response = await _mediator.Send(query, cancellationToken);

            return Ok(response.Result);
        }
    }
}
