import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "./api";

interface ToastMsg {
  id: string;
  theme: string;
  message: string;
}

const initialState: ToastMsg[] = [];

const uid = () =>
  String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );

export const toastSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    addToast: (
      state,
      { payload }: PayloadAction<{ theme: string; message: string }>
    ) => {
      state.push({ ...payload, id: uid() });
    },
    removeToast: (state, { payload }: PayloadAction<string>) => {
      return state.filter((toast) => toast.id !== payload);
    },
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.assignSubscription.matchRejected,
      (state) => {
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed to assign subscription. Please try again later.",
        });
      }
    );

    builder.addMatcher(api.endpoints.doLeaveServer.matchFulfilled, (state) => {
      state.push({ id: uid(), theme: "success", message: "Left server." });
    });
    builder.addMatcher(api.endpoints.doLeaveServer.matchRejected, (state) => {
      state.push({
        id: uid(),
        theme: "danger",
        message: "Failed to leave server. Please try again later.",
      });
    });

    builder.addMatcher(api.endpoints.updateSettings.matchFulfilled, (state) => {
      state.push({ id: uid(), theme: "success", message: "Settings saved." });
    });
    builder.addMatcher(api.endpoints.updateSettings.matchRejected, (state) => {
      state.push({
        id: uid(),
        theme: "danger",
        message: "Failed to save settings. Please try again later.",
      });
    });

    builder.addMatcher(api.endpoints.updateTrack.matchFulfilled, (state) => {
      state.push({ id: uid(), theme: "success", message: "Track list saved." });
    });
    builder.addMatcher(api.endpoints.updateTrack.matchRejected, (state) => {
      state.push({
        id: uid(),
        theme: "danger",
        message: "Failed to save track list. Please try again later.",
      });
    });

    builder.addMatcher(
      api.endpoints.updateSubscription.matchRejected,
      (state) => {
        state.push({
          id: uid(),
          theme: "danger",
          message:
            "Failed to update server subscription. Please try again later.",
        });
      }
    );
    builder.addMatcher(
      api.endpoints.deleteSubscription.matchRejected,
      (state) => {
        state.push({
          id: uid(),
          theme: "danger",
          message:
            "Failed to delete server subscription. Please try again later.",
        });
      }
    );
  },
});

export const { addToast, removeToast } = toastSlice.actions;

export default toastSlice;
