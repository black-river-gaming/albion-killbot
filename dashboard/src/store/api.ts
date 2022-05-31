import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface User {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
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
    };
  },
});

export const {
  useFetchUserQuery,
  useLazyFetchUserQuery,
  useAuthMutation,
  useLogoutMutation,
} = apiSlice;
