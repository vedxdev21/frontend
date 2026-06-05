// ============================================
// Backward-compatible Zustand-style hooks
// These now delegate to Redux store for state
// ============================================
'use client';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setLocation as setLocationAction } from '@/lib/redux/slices/locationSlice';
import { setUnreadCount as setUnreadAction, decrementUnread } from '@/lib/redux/slices/notificationSlice';
import { setLang as setLangAction } from '@/lib/redux/slices/uiSlice';

// Location store — backward compatible
export function useLocationStore() {
  const dispatch = useAppDispatch();
  const location = useAppSelector((state) => state.location);
  return {
    ...location,
    setLocation: (data) => dispatch(setLocationAction(data)),
  };
}

// Notification store — backward compatible
export function useNotificationStore() {
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  return {
    unreadCount,
    setUnreadCount: (count) => dispatch(setUnreadAction(count)),
    decrement: () => dispatch(decrementUnread()),
  };
}

// Language store — backward compatible
export function useLangStore() {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.ui.lang);
  return {
    lang,
    setLang: (l) => dispatch(setLangAction(l)),
  };
}
