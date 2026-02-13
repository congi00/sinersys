import { configureStore } from '@reduxjs/toolkit'
import siteReducer from './features/counterSlice'

export const store = configureStore({
  reducer: {
    siteState: siteReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
