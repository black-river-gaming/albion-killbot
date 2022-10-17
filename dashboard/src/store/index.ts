import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import settings from "./settings";
import track from "./track";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    settings,
    track,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
