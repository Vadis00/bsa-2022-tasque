﻿using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using FluentValidation;
using Tasque.Core.BLL.Options;
using Tasque.Core.BLL.Services.Email;
using Tasque.Core.Common.Entities;
using Tasque.Core.Common.Enums;
using Tasque.Core.DAL;
using Tasque.Core.Identity.Services.AuxiliaryServices;
using Tasque.Core.Identity.Services.Extensions.Factory;

namespace Tasque.Core.Identity.Services.Extensions
{
    public class ConfirmationTokenExtension : ConfirmationTokenService
    {
        public ConfirmationTokenExtension(
            DataContext context,
            IEmailService emailService,
            IOptions<EmailConfirmationOptions> emailOptions,
            IConfiguration configuration) : base(context, emailService, emailOptions, configuration) { }

        public async Task<InvitationToken> CreateInvitationToken(
            double lifetimeFromSeconds, 
            TokenKind kind, 
            int entityId, 
            string userEmail,
            bool isUserExist)
        {
            var invitationToken = new InvitationToken()
            {
                EntityId = entityId,
                ExpiringAt = DateTime.UtcNow.AddSeconds(lifetimeFromSeconds),
                Kind = kind,
                IsUserExist = isUserExist,
                InvitedUserEmail = userEmail,
            };

            await _context.InvitationTokens.AddAsync(invitationToken);
            await _context.SaveChangesAsync();
            return invitationToken;
        }

        public async Task<bool> SendInvitationEmail(InvitationToken token)
        {
            var emailBuilder = new EmailFactory(_context, _emailOptions, _configuration)
                .GetEmailBuilder(token.Kind);

            var email = await emailBuilder.GetEmailMessage(token);

            if (email == null)
                throw new ValidationException("Invalid token kind");

            return await _emailService.SendEmailAsync(email);
        }

        public async Task<InvitationToken> ConfirmInvitationToken(Guid key)
        {
            var token = await  _context.InvitationTokens.FirstOrDefaultAsync(t => t.Token == key);

            if (token == null || !token.IsValid)
                throw new ValidationException("Expired token");

            return token;
        }
    }
}
