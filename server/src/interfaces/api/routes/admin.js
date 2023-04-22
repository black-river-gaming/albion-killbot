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
 * /admin/servers/{serverId}/subscription:
 *   put:
 *     tags: [Admin]
 *     summary: Edit a server subscription
 *     operationId: updateServerSubscription
 *     parameters:
 *     - in: path
 *       name: serverId
 *       schema:
 *         type: integer
 *       description: Server Id to leave
 *       required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subscription'
 *     responses:
 *       200:
 *         description: Updated server subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subscription'
 *       403:
 *         description: Unable to authenticate
 *       500:
 *         description: Internal error
 */
router.put(`/servers/:serverId/subscription`, adminController.setServerSubscription);

/**
 * @openapi
 * /admin/servers/{serverId}/subscription:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a server subscription
 *     operationId: removeServerSubscription
 *     parameters:
 *     - in: path
 *       name: serverId
 *       schema:
 *         type: integer
 *       description: Server Id to leave
 *       required: true
 *     responses:
 *       200:
 *         description: Subscription deleted
 *       403:
 *         description: Unable to authenticate
 *       500:
 *         description: Internal error
 */
router.delete(`/servers/:serverId/subscription`, adminController.removeServerSubscription);

/**
 * @openapi
 * /admin/subscriptions:
 *   get:
 *     tags: [Admin]
 *     summary: Get server subscriptions
 *     operationId:  getSubscriptions
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

module.exports = {
  path: "/admin",
  router,
};
