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
      fetchUser: builder.query<User, void>({
        query: () => `/users/me`,
      }),
      fetchUserServers: builder.query<ServerPartial[], void>({
        query: () => `/users/me/servers`,
      }),
      fetchServer: builder.query<Server, string>({
        query: (serverId) => `/servers/${serverId}`,
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
  useFetchServerQuery,
  useFetchUserQuery,
  useFetchUserServersQuery,
  useLazyFetchUserQuery,
  useLogoutMutation,
  useUpdateSettingsMutation,
} = apiSlice;
