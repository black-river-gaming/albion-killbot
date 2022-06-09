import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api";
import settingsReducer from "./settings";
import trackReducer from "./track";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    settings: settingsReducer,
    track: trackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
