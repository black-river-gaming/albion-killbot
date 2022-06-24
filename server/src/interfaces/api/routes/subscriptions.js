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
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Subscription id
 *           readOnly: true
 *           example: "62a9afaa11269b2bc73c54e4"
 *         owner:
 *           type: string
 *           description: Discord user id that owns the subscription
 *           example: "155377266568855552"
 *         expires:
 *           description: Expiration date for a given subscription
 *           oneOf:
 *           - type: string
 *             format: date
 *             example: "2022-07-21"
 *           - type: string
 *             example: "never"
 *         stripe:
 *           description: Stripe subscription information
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Stripe subscription id
 *               example: "sub_1LBsWDJDAy6upd5xtYnPln1B"
 *             cancel_at_period_end:
 *               type: boolean
 *               description: Cancel after subscription period end
 *               example: false
 *             current_period_end:
 *               type: number
 *               description: Timestamp in seconds for stripe subscription end
 *               example: 1687059617
 *             customer:
 *               type: string
 *               description: Stripe customer id
 *               example: "cus_Lvvu9FF2ehwSBF"
 *             price:
 *               $ref: "#/components/schemas/SubscriptionPrice"
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
 * /subscriptions/assign:
 *   post:
 *     tags: [Subscriptions]
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
 *                 description: Discord server id
 *                 example: "738365346855256107"
 *               checkoutId:
 *                 type: string
 *                 description: Stripe checkout id to fetch subscription if subscription id is absent.
 *                 example: "cs_a1LPTqnv9fkhFmRNWgBWV18YzbZbZH3IXRkBXTbuxh0jyFvYpMitttI97o"
 *               subscriptionId:
 *                 type: string
 *                 description: Stripe subscription id to fetch subscription.
 *                 example: "sub_1LBsWDJDAy6upd5xtYnPln1B"
 *     responses:
 *       200:
 *         description: Assigned subscription successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 */
router.post(`/assign`, subscriptionsController.assignSubscription);

/**
 * @openapi
 * /subscriptions/checkout:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Initiate a checkout session to buy a subcription
 *     operationId: buySubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceId:
 *                 type: string
 *                 description: Price id to buy
 *                 example: "price_1LAjDiJDAy6upd5x99iDefpi"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkout'
 */
router.post(`/checkout`, subscriptionsController.buySubscription);

/**
 * @openapi
 * /subscriptions/checkout/{checkoutId}:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Retrieve a checkout session by id
 *     operationId: getBuySubscription
 *     parameters:
 *     - name: checkoutId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: Checkout session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkout'
 */
router.get(`/checkout/:checkoutId`, subscriptionsController.getBuySubscription);

/**
 * @openapi
 * /subscriptions/manage:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Get a link to manage your subscription in Stripe
 *     operationId: manageSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Stripe customer id to manage subscriptions
 *                 example: "cus_LtfrwncxjVCTTw"
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
router.post(`/manage`, subscriptionsController.manageSubscription);

/**
 * @openapi
 * /subscriptions/prices:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Fetches a list of subscriptions prices
 *     operationId: getSubscriptionsPrices
 *     responses:
 *       200:
 *         description: List of subscriptions prices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubscriptionPrice'
 */
router.get(`/prices`, subscriptionsController.getSubscriptionsPrices);

module.exports = {
  path: "/subscriptions",
  router,
};
