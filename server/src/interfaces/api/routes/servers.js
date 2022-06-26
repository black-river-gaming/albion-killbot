const router = require("express").Router();
const serversController = require("../controllers/servers");
const { disableCache } = require("../middlewares/cache");
const { authenticated } = require("../middlewares/auth");

router.use(disableCache);
router.use(authenticated);

/**
 * @openapi
 * components:
 *  schemas:
 *    Server:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: Discord server id.
 *          readOnly: true
 *          example: "159962941502783488"
 *        name:
 *          type: string
 *          description: Server name.
 *          readOnly: true
 *          example: "Discord Server Name"
 *        icon:
 *          type: string
 *          description: Discord server icon, to be used with the default icon url.
 *          readOnly: true
 *          example: "a_70cacbcd2ce03227ca160f18d250c868"
 *        channels:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Channel'
 *        settings:
 *          $ref: '#/components/schemas/Settings'
 *        limits:
 *          type: object
 *          properties:
 *            players:
 *              type: number
 *              default: 10
 *            guilds:
 *              type: number
 *              default: 1
 *            alliances:
 *              type: number
 *              default: 1
 *
 *    Channel:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: Discord channel id.
 *          readOnly: true
 *          example: "869662789713666099"
 *        name:
 *          type: string
 *          description: Channel name.
 *          readOnly: true
 *          example: "channel"
 *        type:
 *          type: number
 *          description: Type of channel, refer to external doc
 *          externalDocs:
 *            description: Official discord list of channel types
 *            url: https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 *          readOnly: true
 *          example: 0
 *        parentId:
 *          type: string
 *          description: Id of category if it's nested.
 *          readOnly: true
 *          example: "903291231612858378"
 *
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
 *          readOnly: true
 *          $ref: '#/components/schemas/Track'
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
 *      description: Tracking settings
 *      properties:
 *        players:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/TrackItem'
 *        guilds:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/TrackItem'
 *        alliances:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/TrackItem'
 *
 *    TrackItem:
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
 * /servers/{serverId}:
 *   get:
 *     tags: [Servers]
 *     parameters:
 *     - name: serverId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     summary: Get data for a given server, including a list of channels and settings.
 *     operationId: getServer
 *     responses:
 *       200:
 *         description: Server data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Server'
 */
router.get(`/:serverId`, serversController.getServer);

/**
 * @openapi
 * /servers/{serverId}/settings:
 *   put:
 *     tags: [Servers]
 *     parameters:
 *     - name: serverId
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
 *     operationId: setServerSettings
 *     responses:
 *       200:
 *         description: Server settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.put(`/:serverId/settings`, serversController.setServerSettings);

/**
 * @openapi
 * /servers/{serverId}/track:
 *   put:
 *     tags: [Servers]
 *     parameters:
 *     - name: serverId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Track'
 *     summary: Update track lists for a specific server.
 *     operationId: setServerTrack
 *     responses:
 *       200:
 *         description: Server track
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 */
router.put(`/:serverId/track`, serversController.setServerTrack);

module.exports = {
  path: "/servers",
  router,
};
