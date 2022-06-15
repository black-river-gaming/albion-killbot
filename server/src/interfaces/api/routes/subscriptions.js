const router = require("express").Router();
const subscriptionsController = require("../controllers/subscriptions");
const { disableCache } = require("../middlewares/cache");
const { authenticated } = require("../middlewares/auth");

router.use(disableCache);

/**
 * @openapi
 * /prices:
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
router.get(`/subscriptions`, subscriptionsController.getSubscriptions);

/**
 * @openapi
 * /subscriptions/{priceId}:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Initiate a checkout session to buy a subcription
 *     operationId: buySubscription
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               propeties:
 *                 id:
 *                   type: string
 *                   description: Checkout session id
 *                   example: "cs_test_a1jlgCy5hgKatrMv8Qj3JiHdG327GR7NqxKH5WnVTa8bpPuaR8Lcc5NnfD"
 *                 url:
 *                   type: string
 *                   description: Full url to perform the checkout
 */
router.post(`/subscriptions/{priceId}`, subscriptionsController.buySubscription);

module.exports = router;
