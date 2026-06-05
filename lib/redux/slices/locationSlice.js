import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  // Keep SSR/client first render aligned; hydrate from localStorage in provider.
  return { city: '', area: '' };
};

const locationSlice = createSlice({
  name: 'location',
  initialState: getInitialState(),
  reducers: {
    setLocation: (state, action) => {
      const { city, area } = action.payload;
      if (city) { state.city = city; if (typeof window !== 'undefined') localStorage.setItem('mx_city', city); }
      if (area !== undefined) { state.area = area; if (typeof window !== 'undefined') localStorage.setItem('mx_area', area); }
    },
    setCity: (state, action) => {
      state.city = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('mx_city', action.payload);
    },
    setArea: (state, action) => {
      state.area = action.payload;
      if (typeof window !== 'undefined') localStorage.setItem('mx_area', action.payload);
    },
  },
});

export const { setLocation, setCity, setArea } = locationSlice.actions;

// Selectors
export const selectCity = (state) => state.location.city;
export const selectArea = (state) => state.location.area;
export const selectLocation = (state) => state.location;

export default locationSlice.reducer;
