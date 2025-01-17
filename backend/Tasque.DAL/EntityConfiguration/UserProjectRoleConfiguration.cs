﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tasque.Core.Common.Entities;

namespace Tasque.Core.DAL.EntityConfiguration
{
    public class UserProjectRoleConfiguration : IEntityTypeConfiguration<UserProjectRole>
    {
        public void Configure(EntityTypeBuilder<UserProjectRole> builder)
        {
            builder
                .HasKey(userProjectRole => new { userProjectRole.ProjectId, userProjectRole.UserId });

            builder
                .HasOne(userProjectRole => userProjectRole.Project)
                .WithMany(project => project.UserRoles)
                .HasForeignKey(userProjectRole => userProjectRole.ProjectId);
        }
    }
}
