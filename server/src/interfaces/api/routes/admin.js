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
 *     parameters:
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

module.exports = {
  path: "/admin",
  router,
};
