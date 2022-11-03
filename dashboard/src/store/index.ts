import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import settings from "./settings";
import toast from "./toast";
import track from "./track";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    settings,
    track,
    [toast.name]: toast.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
