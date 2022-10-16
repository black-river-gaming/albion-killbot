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
 *     - in: query
 *       name: limit
 *       schema:
 *         type: integer
 *       description: Number of servers to lookup
 *       required: false
 *       default: 200
 *     - in: query
 *       name: after
 *       schema:
 *         type: string
 *       description: Server id to paginate after
 *       required: false
 *     - in: query
 *       name: before
 *       schema:
 *         type: string
 *       description: Server id to paginate before
 *       required: false
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
 */
router.get(`/servers`, adminController.getServers);

module.exports = {
  path: "/admin",
  router,
};
