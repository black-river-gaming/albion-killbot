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
  expires: string;
  server?: string;
  stripe?: any;
}

export interface SubscriptionPrice {
  id: string;
  currency: string;
  price: number;
  recurrence: {
    interval: string;
    count: number;
  };
}

export interface Checkout {
  id: string;
  url: string;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_API_URL,
  }),
  tagTypes: ["User"],
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
      buySubscription: builder.mutation<Checkout, string>({
        query: (priceId) => ({
          url: `/subscriptions/${priceId}`,
          method: "POST",
        }),
      }),
      fetchPrices: builder.query<SubscriptionPrice[], void>({
        query: () => `/subscriptions/prices`,
      }),
      fetchUser: builder.query<User, void>({
        query: () => `/users/me`,
      }),
      fetchUserServers: builder.query<ServerPartial[], void>({
        query: () => `/users/me/servers`,
      }),
      fetchServer: builder.query<Server, string>({
        query: (serverId) => `/servers/${serverId}`,
      }),
      fetchSubscriptions: builder.query<Subscription[], void>({
        query: () => `/subscriptions`,
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
  useUpdateSettingsMutation,
  useUpdateTrackMutation,
} = apiSlice;
