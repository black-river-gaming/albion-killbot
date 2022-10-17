import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import settingsReducer from "./settings";
import trackReducer from "./track";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    settings: settingsReducer,
    track: trackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
