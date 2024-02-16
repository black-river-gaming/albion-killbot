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
      providesTags: ["Admin", "Server"],
    }),
    doLeaveServer: builder.mutation<void, { serverId: string }>({
      query: ({ serverId }) => ({
        url: `/admin/servers/${serverId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin", "Server"],
    }),

    fetchAdminSubscriptions: builder.query<ISubscription[], IFindSubscriptions>(
      {
        query: (params) => ({
          url: `/admin/subscriptions`,
          params,
        }),
        providesTags: [{ type: "Subscription", id: "LIST" }],
      }
    ),
    getAdminSubscription: builder.query<ISubscription, IGetSubscription>({
      query: ({ id }) => ({
        url: `/admin/subscriptions/${id}`,
      }),
      providesTags: (subscription) => [
        { type: "Subscription", id: subscription?.id },
      ],
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
      invalidatesTags: [{ type: "Subscription", id: "LIST" }],
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
      invalidatesTags: (subscription) => [
        { type: "Subscription", id: "LIST" },
        { type: "Subscription", id: subscription?.id },
      ],
    }),
    deleteAdminSubscription: builder.mutation<void, IDeleteSubscription>({
      query: ({ id }) => ({
        url: `/admin/subscriptions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Subscription", id: "LIST" }],
    }),
  }),
});

export const {
  useFetchAdminServersQuery,
  useDoLeaveServerMutation,

  useLazyFetchAdminSubscriptionsQuery,
  useGetAdminSubscriptionQuery,
  useCreateAdminSubscriptionMutation,
  useUpdateAdminSubscriptionMutation,
  useDeleteAdminSubscriptionMutation,
} = admin;

export default admin;
