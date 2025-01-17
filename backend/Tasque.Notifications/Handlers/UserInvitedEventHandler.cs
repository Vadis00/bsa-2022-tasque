﻿using Tasque.Core.Common.Entities.Notifications;
using Tasque.Core.Common.Models.Events;
using Tasque.Notifications.Data;
using Tasque.Notifications.Hubs;

namespace Tasque.Notifications.Handlers
{
    public class UserInvitedEventHandler : NotificationsEventHandler<UserInvitedNotification, UserInvitedEvent>
    {
        public UserInvitedEventHandler(NotificationsHub hub, IServiceProvider provider) : base(hub, provider)
        {
        }
    }
}
