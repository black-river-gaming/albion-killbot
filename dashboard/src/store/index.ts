import { configureStore } from "@reduxjs/toolkit";
import admin from "./admin";
import api from "./api";
import settings from "./settings";
import toast from "./toast";
import track from "./track";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    admin,
    settings,
    track,
    toast,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
