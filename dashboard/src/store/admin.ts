import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const adminSlice = createSlice({
  name: "admin",
  initialState: {
    subscription: {
      owner: "",
      server: "",
      stripe: "",
      status: "All",
    },
  },
  reducers: {
    setSubscriptionOwner: (state, action: PayloadAction<string>) => {
      state.subscription.owner = action.payload;
    },
    setSubscriptionServer: (state, action: PayloadAction<string>) => {
      state.subscription.server = action.payload;
    },
    setSubscriptionStripe: (state, action: PayloadAction<string>) => {
      state.subscription.stripe = action.payload;
    },
    setSubscriptionStatus: (state, action: PayloadAction<string>) => {
      state.subscription.status = action.payload;
    },
  },
});

export const {
  setSubscriptionOwner,
  setSubscriptionServer,
  setSubscriptionStripe,
  setSubscriptionStatus,
} = adminSlice.actions;

export default adminSlice.reducer;
