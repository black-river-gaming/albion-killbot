import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface User {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  admin?: boolean;
  bot: boolean;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost/api",
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
      fetchUserServers: builder.query<Server[], void>({
        query: () => `/users/me/servers`,
      }),
    };
  },
});

export const {
  useAuthMutation,
  useFetchUserQuery,
  useFetchUserServersQuery,
  useLazyFetchUserQuery,
  useLogoutMutation,
} = apiSlice;
