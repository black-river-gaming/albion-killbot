import { ISubscription, ISubscriptionPartial, ServerPartial } from "types";
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

    findAdminSubscriptions: builder.query<
      ISubscriptionPartial[],
      IFindSubscriptions
    >({
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
      ISubscription,
      { subscription: ICreateSubscription }
    >({
      query: ({ subscription }) => ({
        url: `/admin/subscriptions`,
        method: "POST",
        body: subscription,
      }),
    }),
    updateAdminSubscription: builder.mutation<
      ISubscription,
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
