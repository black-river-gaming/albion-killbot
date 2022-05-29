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
 *          readOnly: true
 *          example: "268473310986240001"
 *        username:
 *          type: string
 *          description: Discord user name.
 *          readOnly: true
 *          example: "Discord User"
 *        avatar:
 *          type: string
 *          description: Discord user avatar, to be used with the default avatar url.
 *          readOnly: true
 *          example: "268473310986240001"
 *        avatar_decoration:
 *          type: string
 *          description: Avatar overlay for Nitro users
 *          readOnly: true
 *          example: null
 *        discriminator:
 *          type: string
 *          description: Discord user tag.
 *          readOnly: true
 *          example: "0001"
 *        public_flags:
 *          type: number
 *          description: User public permissions
 *          readOnly: true
 *          example: 0
 *        flags:
 *          type: number
 *          description: User permissions
 *          readOnly: true
 *          example: 0
 *        banner:
 *          type: string
 *          description: User banner
 *          readOnly: true
 *          example: null
 *        banner_color:
 *          type: string
 *          description: User banner background color
 *          readOnly: true
 *          example: null
 *        accent_color:
 *          type: string
 *          description: User banner accent color
 *          readOnly: true
 *          example: null
 *        locale:
 *          type: string
 *          description: User locale
 *          readOnly: true
 *          example: "pt-BR"
 *        mfa_enabled:
 *          type: boolean
 *          description: User has multi-factor enabled
 *          readOnly: true
 *          example: false
 */

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Return user information
 *     operationId: getUserProfile
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Unable to authenticate
 */
router.get(`/users/me`, usersController.getUserProfile);

module.exports = router;
