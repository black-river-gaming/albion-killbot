import { ISubscription, ISubscriptionExtended, ServerPartial } from "types";
import api from "./index";
import {
  ICreateSubscription,
  IDeleteSubscription,
  IFindSubscriptions,
  IGetSubscription,
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

    findAdminSubscriptions: builder.query<ISubscription[], IFindSubscriptions>({
      query: (params) => ({
        url: `/admin/subscriptions`,
        params,
      }),
      providesTags: ["Subscription"],
    }),
    getAdminSubscription: builder.query<ISubscription, IGetSubscription>({
      query: ({ id }) => ({
        url: `/admin/subscriptions/${id}`,
      }),
      providesTags: ["Subscription"],
    }),
    createAdminSubscription: builder.mutation<
      ISubscriptionExtended,
      ICreateSubscription
    >({
      query: ({ subscription }) => ({
        url: `/admin/subscriptions`,
        method: "POST",
        body: subscription,
      }),
      invalidatesTags: ["Admin", "Server", "Subscription"],
    }),
    updateAdminSubscription: builder.mutation<
      ISubscriptionExtended,
      IUpdateSubscription
    >({
      query: ({ subscription }) => ({
        url: `/admin/subscriptions/${subscription.id}`,
        method: "PUT",
        body: subscription,
      }),
      invalidatesTags: ["Admin", "Server", "Subscription"],
    }),
    deleteAdminSubscription: builder.mutation<void, IDeleteSubscription>({
      query: ({ id }) => ({
        url: `/admin/subscriptions/${id}`,
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
  useGetAdminSubscriptionQuery,
  useCreateAdminSubscriptionMutation,
  useUpdateAdminSubscriptionMutation,
  useDeleteAdminSubscriptionMutation,
} = admin;

export default admin;
