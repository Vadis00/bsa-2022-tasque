﻿using AutoMapper;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Tasque.Core.BLL.Exeptions;
using Tasque.Core.BLL.JWT;
using Tasque.Core.Common.DTO;
using Tasque.Core.Common.Entities;
using Tasque.Core.Common.Security;
using Tasque.Core.DAL;

namespace Tasque.Core.BLL.Services.Auth
{
    public class AuthService
    {
        private DataContext _context;
        private JwtFactory _jwtFactory;        
        private IMapper _mapper;
        private IValidator<User> _validator;
        private ConfirmationTokenService _tokenService;

        public AuthService(
            DataContext context,
            JwtFactory jwtFactory,
            IMapper mapper,
            IValidator<User> validator,
            ConfirmationTokenService tokenService)
        {
            _context = context;
            _mapper = mapper;
            _jwtFactory = jwtFactory;
            _validator = validator;
            _tokenService = tokenService;
        }

        public async Task<UserDto> Login(UserLoginDto loginInfo)
        {
            var userEntity = await _context.Users.FirstOrDefaultAsync(x => x.Email == loginInfo.Email)
                ?? throw new ValidationException("No user with given email");

            if (!userEntity.IsEmailConfirmed)
            {
                if (!_context.ConfirmationTokens.Any(x => x.UserId == userEntity.Id))
                {
                    var token = await _tokenService.CreateConfirmationToken(userEntity, TokenKind.EmailConfirmation);
                    await _tokenService.SendConfirmationEmail(token);
                }
                throw new EmailNotConfirmedException(userEntity.Email);
            }

            if (!SecurityHelper.ValidatePassword(loginInfo.Password, userEntity.Password, userEntity.Salt))
                throw new ValidationException("Invalid password");

            return _mapper.Map<UserDto>(userEntity);
        }

        public async Task<UserDto> Login(Guid emailToken)
        {
            var confToken = await _tokenService.ConfirmToken(emailToken, TokenKind.EmailConfirmation);
            confToken.User.IsEmailConfirmed = true;
            _context.ConfirmationTokens.Remove(confToken);
            await _context.SaveChangesAsync();
            return _mapper.Map<UserDto>(confToken.User);
        }

        public async Task<UserDto> Register(UserRegisterDto registerInfo)
        {
            var userEntity = _mapper.Map<User>(registerInfo);
            _validator.ValidateAndThrow(userEntity);

            if (_context.Users.Any(x => x.Email == userEntity.Email))
            {
                throw new ValidationException("User with given email already exists");
            }

            var salt = SecurityHelper.GetRandomBytes();
            userEntity.Salt = Convert.ToBase64String(salt);
            userEntity.Password = SecurityHelper.HashPassword(registerInfo.Password, salt);

            _context.Users.Add(userEntity);
            await _context.SaveChangesAsync();

            var token = await _tokenService.CreateConfirmationToken(userEntity, TokenKind.EmailConfirmation);
            await _tokenService.SendConfirmationEmail(token);
            return _mapper.Map<UserDto>(userEntity);
        }

        public AuthTokenDto GetAccessToken(int id, string username, string email)
        {
            return new()
            {
                AccessToken = _jwtFactory.GenerateToken(id, username, email)
            };
        }        
    }
}