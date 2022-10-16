const router = require("express").Router();
const usersController = require("../controllers/users");
const { disableCache } = require("../middlewares/cache");

router.use(disableCache);

/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: Discord user id.
 *          example: "268473310986240001"
 *        username:
 *          type: string
 *          description: Discord user name.
 *          example: "Discord User"
 *        avatar:
 *          type: string
 *          description: Discord user avatar, to be used with the default avatar url.
 *          example: "268473310986240001"
 *        discriminator:
 *          type: string
 *          description: Discord user tag.
 *          example: "0001"
 *        locale:
 *          type: string
 *          description: User locale
 *          example: "pt-BR"
 *        admin:
 *          type: string
 *          description: If the user is a community admin
 *          example: false
 */

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Return user information
 *     operationId: getUser
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unable to authenticate
 */
router.get(`/me`, usersController.getUser);

module.exports = {
  path: "/users",
  router,
};
