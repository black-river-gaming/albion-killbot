import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const { REACT_APP_API_URL = "/api" } = process.env;

export interface User {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
}

export interface ServerPartial {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  admin: boolean;
  bot: boolean;
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  channels: Channel[];
  settings: Settings;
  limits: {
    players: number;
    guilds: number;
    alliances: number;
  };
}

export interface Channel {
  id: string;
  name: string;
  type: number;
  parentId?: string;
}

export interface Settings {
  guild: string;
  lang: string;
  kills: {
    enabled: boolean;
    channel: string;
    mode: string;
  };
  battles: {
    enabled: boolean;
    channel: string;
  };
  rankings: {
    enabled: boolean;
    channel: string;
    pvpRanking: string;
    guildRanking: string;
  };
  track: TrackList;
}

export interface TrackList {
  players: {
    id: string;
    name: string;
  }[];
  guilds: {
    id: string;
    name: string;
  }[];
  alliances: {
    id: string;
    name: string;
  }[];
}

export type SearchResults = TrackList;

export interface Subscription {
  id: string;
  owner: string;
  expires: string | "never";
  server?: string;
  stripe?: {
    id: string;
    cancel_at_period_end: boolean;
    current_period_end: number;
    customer: string;
    price: SubscriptionPrice;
  };
}

export interface SubscriptionPrice {
  id: string;
  currency: string;
  price: number;
  recurrence: {
    interval: string;
    count: number;
  };
  metadata: {
    banner?: string;
  };
}

export interface Session {
  id: string;
  url: string;
}

export const apiSlice = createApi({
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
      fetchPrices: builder.query<SubscriptionPrice[], void>({
        query: () => `/subscriptions/prices`,
      }),
      fetchUser: builder.query<User, void>({
        query: () => `/users/me`,
        providesTags: ["User"],
      }),
      fetchUserServers: builder.query<ServerPartial[], void>({
        query: () => `/users/me/servers`,
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
  useFetchPricesQuery,
  useFetchServerQuery,
  useFetchSubscriptionsQuery,
  useFetchUserQuery,
  useFetchUserServersQuery,
  useLazyFetchUserQuery,
  useLazySearchQuery,
  useLogoutMutation,
  useManageSubscriptionMutation,
  useUpdateSettingsMutation,
  useUpdateTrackMutation,
} = apiSlice;
