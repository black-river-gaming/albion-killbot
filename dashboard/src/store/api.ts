import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  SearchResults,
  Server,
  ServerPartial,
  Session,
  Settings,
  Subscription,
  SubscriptionPrice,
  TrackList,
  User,
} from "types";

const { REACT_APP_API_URL = "/api" } = process.env;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_API_URL,
  }),
  tagTypes: ["User", "Subscription"],
  endpoints(builder) {
    return {
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
        Subscription,
        { server: string; checkoutId?: string; subscriptionId?: string }
      >({
        query: (body) => ({
          url: `/subscriptions/assign`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["Subscription"],
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
      fetchAdminServers: builder.query<ServerPartial[], void>({
        query: () => `/admin/servers`,
      }),
      doLeaveServer: builder.mutation<void, { serverId: string }>({
        query: ({ serverId }) => ({
          url: `/admin/servers/${serverId}`,
          method: "DELETE",
        }),
      }),
      fetchPrices: builder.query<SubscriptionPrice[], void>({
        query: () => `/subscriptions/prices`,
      }),
      fetchUser: builder.query<User, void>({
        query: () => `/users/me`,
        providesTags: ["User"],
      }),
      fetchServers: builder.query<ServerPartial[], void>({
        query: () => `/servers`,
      }),
      fetchServer: builder.query<Server, string>({
        query: (serverId) => `/servers/${serverId}`,
      }),
      fetchSubscriptions: builder.query<Subscription[], void>({
        query: () => `/subscriptions`,
        providesTags: ["Subscription"],
      }),
      search: builder.query<SearchResults, string>({
        query: (query) => `/search/${query}`,
      }),
      updateTrack: builder.mutation<
        void,
        { serverId: string; track: TrackList }
      >({
        query: ({ serverId, track }) => ({
          url: `/servers/${serverId}/track`,
          method: "PUT",
          body: track,
        }),
      }),
      updateSettings: builder.mutation<
        void,
        { serverId: string; settings: Partial<Settings> }
      >({
        query: ({ serverId, settings }) => ({
          url: `/servers/${serverId}/settings`,
          method: "PUT",
          body: settings,
        }),
      }),
    };
  },
});

export const {
  useAssignSubscriptionMutation,
  useAuthMutation,
  useBuySubscriptionMutation,
  useDoLeaveServerMutation,
  useFetchAdminServersQuery,
  useFetchPricesQuery,
  useFetchServerQuery,
  useFetchServersQuery,
  useFetchSubscriptionsQuery,
  useFetchUserQuery,
  useLazyFetchUserQuery,
  useLazySearchQuery,
  useLogoutMutation,
  useManageSubscriptionMutation,
  useUpdateSettingsMutation,
  useUpdateTrackMutation,
} = api;
