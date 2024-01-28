import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IConstants,
  ISearchResults,
  IServer,
  ISettings,
  ISubscription,
  ITrackList,
  ServerPartial,
  Session,
  SubscriptionPricesResponse,
  User,
} from "types";

const { REACT_APP_API_URL = "/api" } = process.env;

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_API_URL,
  }),
  tagTypes: ["Admin", "User", "Subscription", "Server"],
  endpoints: (builder) => ({
    fetchConstants: builder.query<IConstants, void>({
      query: () => `/constants`,
    }),
    auth: builder.mutation<void, string>({
      query: (code) => ({
        url: `/auth`,
        method: "POST",
        body: { code },
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: `/auth/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    assignSubscription: builder.mutation<
      ISubscription,
      { server: string; checkoutId?: string; subscriptionId?: string }
    >({
      query: (body) => ({
        url: `/subscriptions/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Server", "Subscription"],
    }),
    buySubscription: builder.mutation<Session, string>({
      query: (priceId) => ({
        url: `/subscriptions/checkout`,
        method: "POST",
        body: {
          priceId,
        },
      }),
    }),
    manageSubscription: builder.mutation<Session, string>({
      query: (customerId) => ({
        url: `/subscriptions/manage`,
        method: "POST",
        body: {
          customerId,
        },
      }),
    }),
    fetchPrices: builder.query<
      SubscriptionPricesResponse,
      { currency: string }
    >({
      query: ({ currency }) => ({
        url: `/subscriptions/prices`,
        params: {
          currency,
        },
      }),
    }),
    fetchUser: builder.query<User, void>({
      query: () => `/users/me`,
      providesTags: ["User"],
    }),
    fetchServers: builder.query<ServerPartial[], void>({
      query: () => `/servers`,
      providesTags: ["Server"],
    }),
    fetchServer: builder.query<IServer, string>({
      query: (serverId) => `/servers/${serverId}`,
      providesTags: ["Server"],
    }),
    fetchSubscriptions: builder.query<ISubscription[], void>({
      query: () => `/subscriptions`,
      providesTags: ["Subscription"],
    }),
    search: builder.query<ISearchResults, { server: string; query: string }>({
      query: ({ server, query }) => ({
        url: `/search/${query}`,
        params: {
          server,
        },
      }),
    }),
    updateTrack: builder.mutation<
      void,
      { serverId: string; track: ITrackList }
    >({
      query: ({ serverId, track }) => ({
        url: `/servers/${serverId}/track`,
        method: "PUT",
        body: track,
      }),
      invalidatesTags: ["Server"],
    }),
    updateSettings: builder.mutation<
      void,
      { serverId: string; settings: Partial<ISettings> }
    >({
      query: ({ serverId, settings }) => ({
        url: `/servers/${serverId}/settings`,
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["Server"],
    }),
    testNotificationSettings: builder.mutation<
      void,
      {
        serverId: string;
        type: string;
        mode?: string;
        channelId?: string;
      }
    >({
      query: ({ serverId, ...body }) => ({
        url: `/servers/${serverId}/test`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useAssignSubscriptionMutation,
  useAuthMutation,
  useBuySubscriptionMutation,
  useFetchConstantsQuery,
  useFetchPricesQuery,
  useFetchServerQuery,
  useFetchServersQuery,
  useFetchSubscriptionsQuery,
  useFetchUserQuery,
  useLazyFetchServerQuery,
  useLazyFetchUserQuery,
  useLazySearchQuery,
  useLogoutMutation,
  useManageSubscriptionMutation,
  useSearchQuery,
  useTestNotificationSettingsMutation,
  useUpdateSettingsMutation,
  useUpdateTrackMutation,
} = api;

export default api;
