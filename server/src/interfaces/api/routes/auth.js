const router = require("express").Router();
const authController = require("../controllers/auth");
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
 * /auth/discord:
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
router.post(`/auth/discord`, authController.auth);

/**
 * @openapi
 * /auth/discord/me:
 *   get:
 *     tags: [Auth]
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
router.get(`/auth/discord/me`, authController.getUserProfile);

module.exports = router;
