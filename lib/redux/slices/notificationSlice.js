import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationAPI } from '@/lib/api';

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnread', async (_, { rejectWithValue }) => {
  try {
    const { data } = await notificationAPI.getUnreadCount();
    return data.count || 0;
  } catch (err) {
    return rejectWithValue(0);
  }
});

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (filter, { rejectWithValue }) => {
  try {
    const { data } = await notificationAPI.getAll(filter);
    return (data._list || data.notifications || data.data || []).map((item) => ({
      ...item,
      read: item.read ?? item.isRead ?? false,
    }));
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load notifications');
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await notificationAPI.markRead(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to mark as read');
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await notificationAPI.markAllRead();
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
    decrementUnread: (state) => { state.unreadCount = Math.max(0, state.unreadCount - 1); },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload; })
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.items.find(n => n.id === action.payload);
        if (item && !item.read) { item.read = true; item.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => { n.read = true; n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export const { setUnreadCount, decrementUnread, addNotification } = notificationSlice.actions;

// Selectors
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectNotifications = (state) => state.notifications.items;
export const selectNotificationsLoading = (state) => state.notifications.loading;

export default notificationSlice.reducer;
