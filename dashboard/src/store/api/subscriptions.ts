import api from "./index";
import {
  ICreateSubscriptionCheckoutRequest,
  ICreateSubscriptionCheckoutResponse,
  IDoSubscriptionAssignRequest,
  IDoSubscriptionAssignResponse,
  IDoSubscriptionManageRequest,
  IDoSubscriptionManageResponse,
  IFetchSubscriptionPricesRequest,
  IFetchSubscriptionPricesResponse,
  IFetchSubscriptionsRequest,
  IFetchSubscriptionsResponse,
} from "./types";

const subscription = api.injectEndpoints({
  endpoints: (builder) => ({
    fetchSubscriptions: builder.query<
      IFetchSubscriptionsResponse,
      IFetchSubscriptionsRequest
    >({
      query: () => `/subscriptions`,
      providesTags: [{ type: "Subscription", id: "LIST" }],
    }),

    fetchSubscriptionPrices: builder.query<
      IFetchSubscriptionPricesResponse,
      IFetchSubscriptionPricesRequest
    >({
      query: ({ currency }) => ({
        url: `/subscriptions/prices`,
        params: {
          currency,
        },
      }),
      providesTags: [{ type: "Subscription", id: "PRICES" }],
    }),

    createSubscriptionCheckout: builder.mutation<
      ICreateSubscriptionCheckoutResponse,
      ICreateSubscriptionCheckoutRequest
    >({
      query: ({ priceId, serverId }) => ({
        url: `/subscriptions/checkout`,
        method: "POST",
        body: {
          priceId,
          server: serverId,
        },
      }),
    }),

    doSubscriptionAssign: builder.mutation<
      IDoSubscriptionAssignResponse,
      IDoSubscriptionAssignRequest
    >({
      query: ({ subscriptionId, server }) => ({
        url: `/subscriptions/${subscriptionId}/assign`,
        method: "POST",
        body: {
          server,
        },
      }),
      invalidatesTags: (subscription) => [
        { type: "Server", id: subscription?.server?.id },
        { type: "Subscription", id: "LIST" },
        { type: "Subscription", id: subscription?.id },
      ],
    }),

    doSubscriptionManage: builder.mutation<
      IDoSubscriptionManageResponse,
      IDoSubscriptionManageRequest
    >({
      query: ({ subscriptionId, customerId }) => ({
        url: `/subscriptions/${subscriptionId}/manage`,
        method: "POST",
        body: {
          customerId,
        },
      }),
    }),
  }),
});

export const {
  useFetchSubscriptionsQuery,
  useFetchSubscriptionPricesQuery,
  useCreateSubscriptionCheckoutMutation,
  useDoSubscriptionAssignMutation,
  useDoSubscriptionManageMutation,
} = subscription;

export default subscription;
