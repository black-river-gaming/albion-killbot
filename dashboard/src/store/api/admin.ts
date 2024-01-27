import { ISubscriptionPartial, ServerPartial, Subscription } from "types";
import api from "./index";
import {
  ICreateSubscription,
  IFetchSubscriptions,
  IUpdateSubscription,
} from "./types";

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

    findAdminSubscriptions: builder.query<
      ISubscriptionPartial[],
      IFetchSubscriptions
    >({
      query: (params) => ({
        url: `/admin/subscriptions`,
        params,
      }),
      providesTags: ["Subscription"],
    }),

    createAdminSubscription: builder.mutation<
      Subscription,
      { subscription: ICreateSubscription }
    >({
      query: ({ subscription }) => ({
        url: `/admin/subscriptions`,
        method: "POST",
        body: subscription,
      }),
    }),
    updateAdminSubscription: builder.mutation<
      Subscription,
      { serverId: string; subscription: IUpdateSubscription }
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
    deleteAdminSubscription: builder.mutation<void, { serverId: string }>({
      query: ({ serverId }) => ({
        url: `/admin/servers/${serverId}/subscription`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin", "Server", "Subscription"],
    }),
  }),
});

export const {
  useFetchAdminServersQuery,
  useDoLeaveServerMutation,

  useLazyFindAdminSubscriptionsQuery,
  useCreateAdminSubscriptionMutation,
  useUpdateAdminSubscriptionMutation,
  useDeleteAdminSubscriptionMutation,
} = admin;

export default admin;
