import React, { memo } from 'react';

import { SwitchItem } from '@vizality/components/settings';

export default memo(({ getSetting, toggleSetting }) => {
  return (
    <div>
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
