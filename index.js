import React from 'react';

import { getModule, getModuleByDisplayName, Flux } from '@vizality/webpack';
import { patch, unpatch } from '@vizality/patcher';
import { Plugin } from '@vizality/entities';

export default class StatusEverywhere extends Plugin {
  start () {
    this.injectStyles('styles/main.scss');
    this._patchAvatars();
    this._patchMessageHeaders();
  }

  stop () {
    unpatch('status-everywhere-avatars');
    unpatch('status-everywhere-chat-avatars');
  }

  _patchAvatars () {
    const AvatarModule = getModule('AnimatedAvatar');
    const StatusModule = getModule('getStatus', 'getState');
    const Avatar = AvatarModule.default;

    patch('status-everywhere-avatars', AvatarModule, 'default', ([ props ], res) => {
      const { status, size, userId, src } = props;
      if (status || size.includes('100')) return res;

      const id = userId || src.split('/')[4];
      const sz = props.size.includes('128') ? Avatar.Sizes.SIZE_120 : size;

      const fluxWrapper = Flux.connectStores([ StatusModule ], () =>
        ({ status: StatusModule.getStatus(id), isMobile: StatusModule.isMobileOnline(id) }));

      let AvatarWithStatus;
      this.settings.get('showMobileStatus', true)
        ? AvatarWithStatus = fluxWrapper(({ status, isMobile }) =>
          <Avatar {...props}
            status={status}
            isMobile={isMobile}
            size={sz}
            statusTooltip={true}
          />)
        : AvatarWithStatus = fluxWrapper(({ status }) =>
          <Avatar {...props}
            status={status}
            size={sz}
            statusTooltip={true}
          />);
      return <AvatarWithStatus />;
    });
  }

  _patchMessageHeaders () {
    const AvatarModule = getModule('AnimatedAvatar');
    const TypingModule = getModule('isTyping');
    const MessageHeader = getModule('MessageTimestamp');
    const Avatar = AvatarModule.default;

    patch('status-everywhere-chat-avatars', MessageHeader, 'default', ([ props ], res) => {
      const AvatarComponent = res.props?.children[0];
      if (!AvatarComponent?.props?.renderPopout) return res;

      const { message } = props;
      if (!message) return res;

      const renderer = AvatarComponent?.props?.children;
      if (!renderer || typeof (renderer) !== 'function' || renderer.__patched) return res;

      AvatarComponent.props.children = (...args) => {
        const res = renderer(args);
        if (res.type !== 'img') return res;

        const guildId = getModule('getLastSelectedGuildId').getGuildId();
        const currentUserId = getModule('getId').getId();

        if (this.settings.get('showTypingStatus', true)) {
          if (this.settings.get('showSelfTypingStatus', true) ||
             (!this.settings.get('showSelfTypingStatus', true) && message.author.id !== currentUserId)
          ) {
            const fluxWrapper = Flux.connectStores([ TypingModule ], () => ({ isTyping: TypingModule.isTyping(message.channel_id, message.author.id) }));

            const AvatarWithTyping = fluxWrapper(({ isTyping }) =>
              <Avatar {...res.props}
                isTyping={isTyping}
                userId={message.author.id}
                size={Avatar.Sizes.SIZE_40}
                onClick={e => this.openUserPopout(e, message.author.id, guildId)}
              />
            );

            return <AvatarWithTyping />;
          }
        }

        return <Avatar {...res.props}
          userId={message.author.id}
          size={Avatar.Sizes.SIZE_40}
          onClick={e => this.openUserPopout(e, message.author.id, guildId)}
        />;
      };

      AvatarComponent.props.children.__patched = true;

      return res;
    });
  }

  // @todo Make this a Discord utility or popout API thing in Vizality core.
  openUserPopout (e, userId, guildId) {
    const UserPopout = getModuleByDisplayName('ConnectedUserPopout');
    const PopoutDispatcher = getModule('openPopout');

    PopoutDispatcher.openPopout(e.target, {
      render: props => <UserPopout {...props} userId={userId} guildId={guildId} />,
      closeOnScroll: false,
      shadow: false,
      position: 'right'
    }, `user-popout-${userId}`);
  }
}
