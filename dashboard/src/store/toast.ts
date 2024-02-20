import {
  createSlice,
  isRejectedWithValue,
  PayloadAction,
} from "@reduxjs/toolkit";
import admin from "./api/admin";
import api from "./api/index";
import subscription from "./api/subscriptions";

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
  name: "toast",
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
      api.endpoints.fetchServers.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed fetch servers. Please try again later.",
        });
      }
    );

    builder.addMatcher(
      admin.endpoints.doLeaveServer.matchFulfilled,
      (state) => {
        state.push({ id: uid(), theme: "success", message: "Left server." });
      }
    );
    builder.addMatcher(
      admin.endpoints.doLeaveServer.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed to leave server. Please try again later.",
        });
      }
    );

    builder.addMatcher(api.endpoints.updateSettings.matchFulfilled, (state) => {
      state.push({ id: uid(), theme: "success", message: "Settings saved." });
    });
    builder.addMatcher(
      api.endpoints.updateSettings.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed to save settings. Please try again later.",
        });
      }
    );

    builder.addMatcher(
      api.endpoints.testNotificationSettings.matchFulfilled,
      (state) => {
        state.push({
          id: uid(),
          theme: "success",
          message:
            "A test notification has been sent. Please verify on discord.",
        });
      }
    );
    builder.addMatcher(
      api.endpoints.testNotificationSettings.matchRejected,
      (state) => {
        state.push({
          id: uid(),
          theme: "danger",
          message:
            "Failed to send test notification. Please verify the bot permissions and try again later.",
        });
      }
    );

    builder.addMatcher(api.endpoints.updateTrack.matchFulfilled, (state) => {
      state.push({ id: uid(), theme: "success", message: "Track list saved." });
    });
    builder.addMatcher(
      api.endpoints.updateTrack.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed to save track list. Please try again later.",
        });
      }
    );

    builder.addMatcher(
      admin.endpoints.createAdminSubscription.matchFulfilled,
      (state) => {
        state.push({
          id: uid(),
          theme: "success",
          message: "Subscription created.",
        });
      }
    );
    builder.addMatcher(
      admin.endpoints.createAdminSubscription.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed to create subscription. Please try again later.",
        });
      }
    );
    builder.addMatcher(
      admin.endpoints.getAdminSubscription.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message:
            "Failed to retrieve subscription details. Please try again later.",
        });
      }
    );
    builder.addMatcher(
      admin.endpoints.updateAdminSubscription.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed to update subscription. Please try again later.",
        });
      }
    );
    builder.addMatcher(
      admin.endpoints.deleteAdminSubscription.matchFulfilled,
      (state) => {
        state.push({
          id: uid(),
          theme: "info",
          message: "Subscription deleted successfully.",
        });
      }
    );
    builder.addMatcher(
      admin.endpoints.deleteAdminSubscription.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message:
            "Failed to delete server subscription. Please try again later.",
        });
      }
    );

    builder.addMatcher(
      subscription.endpoints.doSubscriptionAssign.matchFulfilled,
      (state) => {
        state.push({
          id: uid(),
          theme: "success",
          message: "Subscription assigned succesfully.",
        });
      }
    );
    builder.addMatcher(
      subscription.endpoints.doSubscriptionAssign.matchRejected,
      (state, action) => {
        if (!isRejectedWithValue(action)) return;
        state.push({
          id: uid(),
          theme: "danger",
          message: "Failed to assign subscription. Please try again later.",
        });
      }
    );
  },
});

export const { addToast, removeToast } = toastSlice.actions;

export default toastSlice.reducer;
