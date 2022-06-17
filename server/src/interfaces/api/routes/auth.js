const router = require("express").Router();
const authController = require("../controllers/auth");
const { disableCache } = require("../middlewares/cache");

router.use(disableCache);

/**
 * @openapi
 * /auth:
 *   post:
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     summary: Authentication Code Grant callback endpoint.
 *     operationId: auth
 *     responses:
 *       200:
 *         description: Authentication success
 *       403:
 *         description: Unable to authenticate
 */
router.post(`/`, authController.auth);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout, deleting all session cookies.
 *     operationId: logout
 *     responses:
 *       200:
 *         description: Logout sucess
 *       403:
 *         description: Unable to logout
 */
router.post(`/logout`, authController.logout);

module.exports = {
  path: "/auth",
  router,
};
