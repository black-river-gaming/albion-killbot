import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IConstants } from "types/constants";
import { IServer, ServerPartial } from "types/server";
import { ISettings } from "types/settings";
import { ISearchResults, ITrackList } from "types/track";
import { User } from "types/user";

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
  useAuthMutation,
  useFetchConstantsQuery,
  useFetchServerQuery,
  useFetchServersQuery,
  useFetchUserQuery,
  useLazyFetchServerQuery,
  useLazyFetchUserQuery,
  useLazySearchQuery,
  useLogoutMutation,
  useSearchQuery,
  useTestNotificationSettingsMutation,
  useUpdateSettingsMutation,
  useUpdateTrackMutation,
} = api;

export default api;
