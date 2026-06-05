import { createSlice } from '@reduxjs/toolkit';

const getInitialLang = () => {
  if (typeof window !== 'undefined') return localStorage.getItem('mx_lang') || 'en';
  return 'en';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    lang: getInitialLang(),
    mobileMenuOpen: false,
    profileMenuOpen: false,
    globalLoading: false,
    searchQuery: '',
  },
  reducers: {
    setLang: (state, action) => {
      state.lang = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('mx_lang', action.payload);
    },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    toggleProfileMenu: (state) => { state.profileMenuOpen = !state.profileMenuOpen; },
    closeProfileMenu: (state) => { state.profileMenuOpen = false; },
    setGlobalLoading: (state, action) => { state.globalLoading = action.payload; },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
  },
});

export const {
  setLang, toggleMobileMenu, closeMobileMenu,
  toggleProfileMenu, closeProfileMenu,
  setGlobalLoading, setSearchQuery,
} = uiSlice.actions;

// Selectors
export const selectLang = (state) => state.ui.lang;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectProfileMenuOpen = (state) => state.ui.profileMenuOpen;
export const selectGlobalLoading = (state) => state.ui.globalLoading;

export default uiSlice.reducer;
