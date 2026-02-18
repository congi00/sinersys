import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SiteState {
  menuVisible: Boolean,
  navigationState: Number,
  hasPlayed: Boolean,
}

const initialState: SiteState = {
    menuVisible: false,
    navigationState: 0,
    hasPlayed: false,
}

const siteSlice = createSlice({
  name: 'siteState',
  initialState,
  reducers: {
    setMenuVisible: (state) => {
      state.menuVisible = true
    },
    setMenuNotVisible: (state) => {
      state.menuVisible = false
    },
    setMenuVisibility: (state, action: PayloadAction<Boolean>) => {
      state.menuVisible = action.payload
    },
    setNavigationState: (state, action: PayloadAction<Number>) => {
        state.navigationState = action.payload
    },
    setPlayed: (state) => {
      state.hasPlayed = true;
    },
  },
})

export const { setMenuVisible, setMenuNotVisible, setMenuVisibility, setNavigationState, setPlayed } = siteSlice.actions
export default siteSlice.reducer
