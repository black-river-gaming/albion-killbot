import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  IConstants,
  ISearchResults,
  IServer,
  ISettings,
  ITrackList,
  ServerPartial,
  Session,
  Subscription,
  SubscriptionPartial,
  SubscriptionPricesResponse,
  UpdateSubscription,
  User,
} from "types";

const { REACT_APP_API_URL = "/api" } = process.env;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_API_URL,
  }),
  tagTypes: ["Admin", "User", "Subscription", "Server"],
  endpoints(builder) {
    return {
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
        Subscription,
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
      fetchAdminServers: builder.query<ServerPartial[], void>({
        query: () => `/admin/servers`,
        providesTags: ["Admin"],
      }),
      doLeaveServer: builder.mutation<void, { serverId: string }>({
        query: ({ serverId }) => ({
          url: `/admin/servers/${serverId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Admin"],
      }),
      updateSubscription: builder.mutation<
        Subscription,
        { serverId: string; subscription: UpdateSubscription }
      >({
        query: ({ serverId, subscription }) => ({
          url: `/admin/servers/${serverId}/subscription`,
          method: "PUT",
          body: {
            ...subscription,
          },
        }),
        invalidatesTags: ["Admin", "Server", "Subscription"],
      }),
      deleteSubscription: builder.mutation<void, { serverId: string }>({
        query: ({ serverId }) => ({
          url: `/admin/servers/${serverId}/subscription`,
          method: "DELETE",
        }),
        invalidatesTags: ["Admin", "Server", "Subscription"],
      }),
      fetchAdminSubscriptions: builder.query<
        SubscriptionPartial[],
        {
          server?: string;
          owner?: string;
          status?: "free" | "active" | "expired";
          stripe?: string;
        }
      >({
        query: (params) => ({
          url: `/admin/subscriptions`,
          params,
        }),
        providesTags: ["Subscription"],
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
      fetchSubscriptions: builder.query<Subscription[], void>({
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
    };
  },
});

export const {
  useAssignSubscriptionMutation,
  useAuthMutation,
  useBuySubscriptionMutation,
  useDeleteSubscriptionMutation,
  useDoLeaveServerMutation,
  useFetchAdminServersQuery,
  useFetchConstantsQuery,
  useFetchPricesQuery,
  useFetchServerQuery,
  useFetchServersQuery,
  useFetchSubscriptionsQuery,
  useFetchUserQuery,
  useLazyFetchAdminSubscriptionsQuery,
  useLazyFetchUserQuery,
  useLazySearchQuery,
  useLogoutMutation,
  useManageSubscriptionMutation,
  useSearchQuery,
  useUpdateSettingsMutation,
  useUpdateSubscriptionMutation,
  useUpdateTrackMutation,
} = api;
