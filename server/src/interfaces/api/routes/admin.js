const router = require("express").Router();
const adminController = require("../controllers/admin");
const { disableCache } = require("../middlewares/cache");
const { admin } = require("../middlewares/auth");

router.use(disableCache);
router.use(admin);

/**
 * @openapi
 * /admin/servers:
 *   get:
 *     tags: [Admin]
 *     summary: Return list of servers for the bot
 *     operationId: getServers
 *     responses:
 *       200:
 *         description: List of servers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ServerPartial'
 *       403:
 *         description: Unable to authenticate
 *       500:
 *         description: Internal error
 */
router.get(`/servers`, adminController.getServers);

/**
 * @openapi
 * /admin/servers/{serverId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Leave a server
 *     operationId: leaveServer
 *     parameters:
 *     - in: path
 *       name: serverId
 *       schema:
 *         type: integer
 *       description: Server Id to leave
 *       required: true
 *     responses:
 *       200:
 *         description: Server left successfully
 *       403:
 *         description: Unable to authenticate
 *       500:
 *         description: Internal error
 */
router.delete(`/servers/:serverId`, adminController.leaveServer);

/**
 * @openapi
 * /admin/subscriptions:
 *   get:
 *     tags: [Admin]
 *     summary: Get subscriptions
 *     operationId: getSubscriptions
 *     parameters:
 *     - name: server
 *       in: query
 *       description: Filter by server id
 *       schema:
 *         type: string
 *     - name: owner
 *       in: query
 *       description: Filter by subscription owner
 *       schema:
 *         type: string
 *     - name: status
 *       in: query
 *       description: Filter by subscription status
 *       schema:
 *         type: string
 *         enum: ["Free", "Active", "Expired"]
 *     - name: stripe
 *       in: query
 *       description: Filter by stripe subscription id
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: List of subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubscriptionPartial'
 *       403:
 *         description: Unable to authenticate
 *       500:
 *         description: Internal error
 *
 */
router.get(`/subscriptions`, adminController.getSubscriptions);

/**
 * @openapi
 * /admin/subscriptions:
 *   post:
 *     tags: [Admin]
 *     summary: Create subscription
 *     operationId: createSubscription
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPartial'
 *     responses:
 *       201:
 *         description: "Subscription created"
 *       403:
 *         $ref: "#/components/responses/Unauthorized"
 *       422:
 *         description: "Invalid expire date"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post(`/subscriptions`, adminController.createSubscription);

/**
 * @openapi
 * /admin/subscriptions/{subscriptionId}:
 *   get:
 *     tags: [Admin]
 *     summary: Retrieve subscription details
 *     operationId: getSubscription
 *     parameters:
 *     - name: subscriptionId
 *       in: path
 *       description: Subscription id.
 *       schema:
 *         type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Subscription details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Subscription"
 *       403:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: Subscription not found
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get(`/subscriptions/:subscriptionId`, adminController.getSubscription);

/**
 * @openapi
 * /admin/subscriptions/{subscriptionId}:
 *   put:
 *     tags: [Admin]
 *     summary: Update subscription
 *     operationId: updateSubscription
 *     parameters:
 *     - name: subscriptionId
 *       in: path
 *       description: Subscription id.
 *       schema:
 *         type: string
 *       required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPartial'
 *     responses:
 *       200:
 *         description: Updated subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SubscriptionPartial"
 *       403:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: Subscription not found
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.put(`/subscriptions/:subscriptionId`, adminController.updateSubscription);

/**
 * @openapi
 * /admin/subscriptions/{subscriptionId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete subscription
 *     operationId: deleteSubscription
 *     parameters:
 *     - name: subscriptionId
 *       in: path
 *       description: Subscription id.
 *       schema:
 *         type: string
 *       required: true
 *     responses:
 *       200:
 *         description: Delete success
 *       403:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         description: Subscription not found
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.delete(`/subscriptions/:subscriptionId`, adminController.deleteSubscription);

module.exports = {
  path: "/admin",
  router,
};
