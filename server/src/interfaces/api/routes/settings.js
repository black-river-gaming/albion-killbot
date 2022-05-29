const router = require("express").Router();
const settingsController = require("../controllers/settings");
const { disableCache } = require("../middlewares/cache");

router.use(disableCache);

/**
 * @openapi
 * components:
 *  schemas:
 *    Settings:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *          description: Settings auto-generated id.
 *          readOnly: true
 *          example: "628a40f9f62f32079d57a3b2"
 *        guild:
 *          type: string
 *          description: Discord server id
 *          readOnly: true
 *          example: "738365346855256107"
 *        lang:
 *          type: string
 *          description: Bot language
 *          default: "en"
 *        battles:
 *          allOf:
 *          - $ref: '#/components/schemas/Category'
 *        kills:
 *          allOf:
 *          - $ref: '#/components/schemas/Category'
 *          - type: object
 *            properties:
 *              mode:
 *                type: string
 *                description: Notification style
 *                default: "image"
 *        rankings:
 *          allOf:
 *          - $ref: '#/components/schemas/Category'
 *          - type: object
 *            properties:
 *              pvpRanking:
 *                type: string
 *                description: Setting for PvP Rankings
 *                default: "daily"
 *              guildRanking:
 *                type: string
 *                description: Setting for Guild Rankings
 *                default: "daily"
 *        subscription:
 *          type: object
 *          readOnly: true
 *          properties:
 *            expires:
 *              type: string
 *              format: date-time
 *              description: Subscription expiration date
 *            owner:
 *              type: string
 *              description: Discord user id of the subscription owner
 *              example: "796813403200028682"
 *            patreon:
 *              type: string
 *              description: Patreon user id of the subscription owner
 *              example: "17225165"
 *        track:
 *          type: object
 *          description: Tracking settings
 *          readOnly: true
 *          properties:
 *            players:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Track'
 *            guilds:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Track'
 *            alliances:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Track'
 *
 *    Category:
 *      type: object
 *      properties:
 *        enabled:
 *          type: boolean
 *          description: Category enabled
 *          default: true
 *        channel:
 *          type: string
 *          description: Discord channel id
 *          example: "685197580094931020"
 *
 *    Track:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: Albion id
 *          example: "X9tW3tcZTIWamwcKxdEe5A"
 *        name:
 *          type: string
 *          description: Albion name
 *          example: "Gray Death"
 */

/**
 * @openapi
 * /settings/{guildId}:
 *   get:
 *     tags: [Settings]
 *     parameters:
 *     - name: guildId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     summary: Get settings for a specific server.
 *     operationId: getSettings
 *     responses:
 *       200:
 *         description: Server settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.get(`/settings/:guildId`, settingsController.getSettings);

/**
 * @openapi
 * /settings/{guildId}:
 *   put:
 *     tags: [Settings]
 *     parameters:
 *     - name: guildId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     summary: Update settings for a specific server.
 *     operationId: setSettings
 *     responses:
 *       200:
 *         description: Server settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.put(`/settings/:guildId`, settingsController.setSettings);

/**
 * @openapi
 * /settings/{guildId}:
 *   delete:
 *     tags: [Settings]
 *     parameters:
 *     - name: guildId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     summary: Delete settings for a server.
 *     operationId: deleteSettings
 *     responses:
 *       200:
 *         description: Operation success
 */
router.delete(`/settings/:guildId`, settingsController.deleteSettings);

module.exports = router;
