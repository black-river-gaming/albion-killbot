import {
  ServerPartial,
  Subscription,
  SubscriptionPartial,
  UpdateSubscription,
} from "types";
import api from "./index";

const admin = api.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useFetchAdminServersQuery,
  useDeleteSubscriptionMutation,
  useDoLeaveServerMutation,
  useLazyFetchAdminSubscriptionsQuery,
  useUpdateSubscriptionMutation,
} = admin;

export default admin;
