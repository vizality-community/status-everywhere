import React, { memo } from 'react';

import { SwitchItem, FormTitle } from '@vizality/components/settings';

export default memo(({ getSetting, toggleSetting }) => {
  return (
    <div>
      <FormTitle>Me</FormTitle>
      <SwitchItem
        note='Shows whether you are currently typing. Client-side only, meaning others who can see you typing normally still will.'
        value={getSetting('showSelfTypingStatus', true)}
        onChange={() => toggleSetting('showSelfTypingStatus')}
        disabled={!getSetting('showSelfStatus', true)}
      >
        Show My Typing Status
      </SwitchItem>
      <FormTitle>General</FormTitle>
      <SwitchItem
        note='Shows whether the user is currently typing. Multiple typing animations showing at once may cause performance issues.'
        value={getSetting('showTypingStatus', true)}
        onChange={() => toggleSetting('showTypingStatus')}
      >
        Show Typing Status
      </SwitchItem>
      <SwitchItem
        note='Shows a mobile status indicator when the user is currently online on a mobile device.'
        value={getSetting('showMobileStatus', true)}
        onChange={() => toggleSetting('showMobileStatus')}
      >
        Show Mobile Status
      </SwitchItem>
    </div>
  );
});
