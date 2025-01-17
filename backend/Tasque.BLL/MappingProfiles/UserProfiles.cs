﻿using AutoMapper;
using Tasque.Core.Common.DTO.User;
using Tasque.Core.Common.DTO.User.UserRoles;
using Tasque.Core.Common.Entities;

namespace Tasque.Core.BLL.MappingProfiles
{
    public class UserProfiles : Profile
    {
        public UserProfiles()
        {
            CreateMap<UserProjectRole, UserInfoDto>()
                .ForMember(dest => dest.Id, act => act.MapFrom(src => src.User.Id))
                .ForMember(dest => dest.UserName, act => act.MapFrom(src => src.User.Name))
                .ForMember(dest => dest.Email, act => act.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.Role, act => act.MapFrom(src => src.Role.Name))
                .ForMember(dest => dest.AvatarURL, act => act.MapFrom(src => src.User.AvatarURL));

            CreateMap<UserProjectRole, UserProjectRoleDto>().ReverseMap();
        }
    }
}
