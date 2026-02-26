import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SiteState {
  menuVisible: Boolean,
  navigationState: Number,
  hasPlayed: Boolean,
  openContact: Boolean,
}

const initialState: SiteState = {
    menuVisible: false,
    navigationState: 0,
    hasPlayed: false,
    openContact: false,
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
    setOpenContact: (state, action: PayloadAction<Boolean>) => {
      state.openContact = action.payload
    },
  },
})

export const { setMenuVisible, setMenuNotVisible, setMenuVisibility, setNavigationState, setPlayed, setOpenContact } = siteSlice.actions
export default siteSlice.reducer
