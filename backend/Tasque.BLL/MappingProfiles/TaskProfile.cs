﻿using AutoMapper;
using Tasque.Core.Common.DTO;
using Tasque.Core.Common.DTO.PartialModels;
using Tasque.Core.Common.DTO.Task;
using Tasque.Core.Common.DTO.Task.PartialModels;
using Tasque.Core.Common.Entities;
using Task = Tasque.Core.Common.Entities.Task;

namespace Tasque.Core.BLL.MappingProfiles
{
    public class TaskProfile : Profile
    {
        public TaskProfile()
        {
            CreateMap<Task, TaskDto>().ReverseMap();
            CreateMap<TaskTypeDto, TaskType>().ReverseMap();
            CreateMap<TaskPriorityDto, TaskPriority>().ReverseMap();
            CreateMap<TaskState, TaskStateDto>().ReverseMap();
            CreateMap<Attachment, AttachmentDto>().ReverseMap();
            CreateMap<Label, LabelDto>().ReverseMap();
            CreateMap<TaskCustomFields, CosmosTaskFields>();

            CreateMap<Task, TaskInfoDto>()
                .ForMember(
                    x => x.AttachmentUrl,
                    opt => opt.MapFrom(t => (t.Attachments.FirstOrDefault() ?? new Attachment()).URL)
                );
            CreateMap<TaskInfoDto, Task>()
                .ForMember(x => x.Author, opt => opt.Ignore());
            CreateMap<Comment, CreateCommentDTO>().ReverseMap();
            CreateMap<Comment, CommentInfoDTO>();
        }
    }
}
