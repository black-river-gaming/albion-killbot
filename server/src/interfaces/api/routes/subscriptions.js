const router = require("express").Router();
const subscriptionsController = require("../controllers/subscriptions");
const { disableCache } = require("../middlewares/cache");
const { authenticated } = require("../middlewares/auth");

router.use(disableCache);
router.use(authenticated);

/**
 * @openapi
 * components:
 *   schemas:
 *     SubscriptionBase:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Subscription id
 *           readOnly: true
 *           example: "62a9afaa11269b2bc73c54e4"
 *         expires:
 *           description: Expiration date for a given subscription
 *           oneOf:
 *           - type: string
 *             format: date
 *             example: "2022-07-21"
 *           - type: string
 *             example: "never"
 *         limits:
 *           $ref: "#/components/schemas/Limits"
 *
 *     SubscriptionPartial:
 *       allOf:
 *         - $ref: '#components/schemas/SubscriptionBase'
 *         - type: object
 *           properties:
 *             owner:
 *               type: string
 *               description: Discord user id that owns the subscription
 *               example: "155377266568855552"
 *             server:
 *               type: string
 *               description: Discord server id
 *               example: "738365346855256107"
 *             stripe:
 *               type: string
 *               description: Stripe subscription id
 *               example: "sub_1LBsWDJDAy6upd5xtYnPln1B"
 *
 *     Subscription:
 *       allOf:
 *         - $ref: '#components/schemas/SubscriptionBase'
 *         - type: object
 *           properties:
 *             owner:
 *               $ref: '#/components/schemas/User'
 *             server:
 *               $ref: '#/components/schemas/ServerBase'
 *             stripe:
 *               type: object
 *               description: Stripe subscription information
 *               readOnly: true
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Stripe subscription id
 *                   example: "sub_1LBsWDJDAy6upd5xtYnPln1B"
 *                 cancel_at_period_end:
 *                   type: boolean
 *                   description: Cancel after subscription period end
 *                   example: false
 *                 current_period_end:
 *                   type: number
 *                   description: Timestamp in seconds for stripe subscription end
 *                   example: 1687059617
 *                 customer:
 *                   type: string
 *                   description: Stripe customer id
 *                   example: "cus_Lvvu9FF2ehwSBF"
 *                 price:
 *                   $ref: "#/components/schemas/SubscriptionPrice"
 *
 *     Limits:
 *       type: object
 *       properties:
 *         players:
 *           type: number
 *           default: 10
 *         guilds:
 *           type: number
 *           default: 1
 *         alliances:
 *           type: number
 *           default: 1
 *
 *     SubscriptionPrice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Id of the subscrption price
 *           example: "price_1LAjDiJDAy6upd5x99iDefpi"
 *         currency:
 *           type: string
 *           description: Price currency
 *           example: "usd"
 *         price:
 *           type: number
 *           description: Price for the subscription, inclusing decimal digits
 *           example: 500
 *         recurrence:
 *           type: object
 *           description: Recurrence for the subscription
 *           properties:
 *             interval:
 *               type: string
 *               description: Type of interval for the subscription (months, years)
 *               example: "month"
 *             count:
 *               type: number
 *               description: Number of intervals for the subscription
 *               example: 1
 *         metadata:
 *           type: object
 *           description: Price metadata
 *           additionalProperties: true
 *
 *     Checkout:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Checkout session id
 *           example: "cs_test_a1jlgCy5hgKatrMv8Qj3JiHdG327GR7NqxKH5WnVTa8bpPuaR8Lcc5NnfD"
 *         url:
 *           type: string
 *           description: Full url to perform the checkout
 *         status:
 *           type: string
 *           description: Checkout status
 *           example: "expired"
 */

/**
 * @openapi
 * /subscriptions:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Fetches a list of subscriptions for the authenticated user
 *     operationId: getSubscriptions
 *     responses:
 *       200:
 *         description: List of subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       403:
 *         description: Unable to authenticate
 */
router.get(`/`, subscriptionsController.getSubscriptions);

/**
 * @openapi
 * /subscriptions/prices:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Fetches a list of subscriptions prices
 *     operationId: getSubscriptionsPrices
 *     parameters:
 *     - name: currency
 *       in: query
 *       schema:
 *         type: string
 *         default: "usd"
 *     responses:
 *       200:
 *         description: List of subscriptions prices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currencies:
 *                   type: array
 *                   items:
 *                     type: string
 *                     minLength: 3
 *                     maxLength: 3
 *                     example: "usd"
 *                 prices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubscriptionPrice'
 */
router.get(`/prices`, subscriptionsController.getSubscriptionsPrices);

/**
 * @openapi
 * /subscriptions/checkout:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Initiate a checkout session to buy a subcription
 *     operationId: createSubscriptionCheckout
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceId:
 *                 type: string
 *                 required: true
 *                 description: Price id to buy
 *                 example: "price_1LAjDiJDAy6upd5x99iDefpi"
 *               server:
 *                 type: string
 *                 required: false
 *                 description: Discord server id to auto-assign after checkout
 *                 example: "738365346855256107"
 *     responses:
 *       201:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkout'
 *       403:
 *         $ref: "#/components/responses/Unauthorized"
 *       422:
 *         description: Missing required parameters
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post(`/checkout`, subscriptionsController.createSubscriptionCheckout);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/assign:
 *   post:
 *     tags: [Subscriptions]
 *     parameters:
 *     - name: subscriptionId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         description: Subscription id.
 *         example: "65d3d29d3cf1c9af00c2c3cb"
 *     summary: Assign a subscription to a server
 *     operationId: assignSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               server:
 *                 type: string
 *                 description: Discord server id, send null to unsassign
 *                 example: "738365346855256107"
 *     responses:
 *       200:
 *         description: Assigned subscription successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 */
router.post(`/:subscriptionId/assign`, subscriptionsController.assignSubscription);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/manage:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Get a link to manage your subscription in Stripe
 *     operationId: manageSubscription
 *     parameters:
 *     - name: subscriptionId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         description: Subscription id.
 *         example: "65d3d29d3cf1c9af00c2c3cb"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Stripe customer id to manage subscriptions
 *                 required: false
 *                 example: "cus_LtfrwncxjVCTTw"
 *               serverId:
 *                 type: string
 *                 required: false
 *                 description: Discord server id
 *                 example: "738365346855256107"
 *     responses:
 *       200:
 *         description: Manage session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Manage session id
 *                   example: "bps_1LE4UaJDAy6upd5xYxnTN3yw"
 *                 url:
 *                   type: string
 *                   description: Full url to perform the management
 */
router.post(`/:subscriptionId/manage`, subscriptionsController.manageSubscription);

module.exports = {
  path: "/subscriptions",
  router,
};
