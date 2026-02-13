import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SiteState {
  menuVisible: Boolean,
  navigationState: Number
}

const initialState: SiteState = {
    menuVisible: false,
    navigationState: 0,
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
    }
  },
})

export const { setMenuVisible, setMenuNotVisible, setMenuVisibility, setNavigationState } = siteSlice.actions
export default siteSlice.reducer
