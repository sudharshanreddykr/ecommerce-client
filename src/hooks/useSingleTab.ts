import { useEffect, useState } from 'react';

export const useSingleTab = () => {
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    const tabId = Math.random().toString(36).substring(2, 11);
    const channel = new BroadcastChannel('app_single_tab_enforcement');

    // On mount, ask if any other tab exists
    channel.postMessage({ type: 'CHECK_OTHER_TABS', id: tabId });

    const handleMessage = (event: MessageEvent) => {
      const { type, id } = event.data;

      if (type === 'CHECK_OTHER_TABS' && id !== tabId) {
        // Another tab is asking, tell them we are here
        channel.postMessage({ type: 'TAB_ACTIVE', id: tabId });
      }

      if (type === 'TAB_ACTIVE' && id !== tabId) {
        // Another tab responded that they are active
        setIsDuplicate(true);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, []);

  return isDuplicate;
};
