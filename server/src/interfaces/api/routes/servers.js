const router = require("express").Router();
const serversController = require("../controllers/servers");
const { disableCache } = require("../middlewares/cache");
const { serverAdmin, authenticated } = require("../middlewares/auth");

router.use(disableCache);
router.use(authenticated);
router.use(`/:serverId`, serverAdmin);

/**
 * @openapi
 * components:
 *  schemas:
 *    ServerBase:
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
 *
 *    ServerPartial:
 *      allOf:
 *        - $ref: '#components/schemas/ServerBase'
 *        - type: object
 *          properties:
 *            owner:
 *              type: boolean
 *              description: If the current user is the server owner
 *              readOnly: true
 *              example: true
 *            admin:
 *              type: boolean
 *              description: If the current user is the server admin
 *              readOnly: true
 *              example: true
 *            bot:
 *              type: boolean
 *              description: If the current bot is present on the server
 *              readOnly: true
 *              example: true
 *
 *    Server:
 *      allOf:
 *        - $ref: '#components/schemas/ServerBase'
 *        - type: object
 *          properties:
 *            channels:
 *              type: array
 *              readOnly: true
 *              items:
 *                $ref: '#/components/schemas/Channel'
 *            limits:
 *              $ref: "#/components/schemas/Limits"
 *            settings:
 *              $ref: '#/components/schemas/Settings'
 *            subscription:
 *              $ref: '#/components/schemas/Subscription'
 *            track:
 *              $ref: '#/components/schemas/Track'
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
 *        general:
 *          type: object
 *          properties:
 *            locale:
 *              type: string
 *              description: Bot language
 *              default: "en"
 *            showAttunement:
 *              type: boolean
 *              description: Display awakened weapon stats
 *            guildTags:
 *              type: boolean
 *              description: Display guild tags in player's names
 *              default: false
 *            splitLootValue:
 *              type: boolean
 *              description: Split the loot value between gear and inventory
 *              default: false
 *        battles:
 *          allOf:
 *          - $ref: '#/components/schemas/Category'
 *          - type: object
 *            properties:
 *              threshold:
 *                type: object
 *                properties:
 *                  players:
 *                    type: number
 *                    description: Minimum number of players to show a battle
 *                  guilds:
 *                    type: number
 *                    description: Minimum number of guilds to show a battle
 *                  alliances:
 *                    type: number
 *                    description: Minimum number of alliances to show a battle
 *        kills:
 *          allOf:
 *          - $ref: '#/components/schemas/Category'
 *          - type: object
 *            properties:
 *              mode:
 *                type: string
 *                description: Notification style
 *                default: "image"
 *              provider:
 *                type: string
 *                description: Provider for links in the notifications
 *        deaths:
 *          allOf:
 *          - $ref: '#/components/schemas/Category'
 *          - type: object
 *            properties:
 *              mode:
 *                type: string
 *                description: Notification style
 *                default: "image"
 *              provider:
 *                type: string
 *                description: Provider for links in the notifications
 *        rankings:
 *          allOf:
 *          - $ref: '#/components/schemas/Category'
 *          - type: object
 *            properties:
 *              daily:
 *                $ref: '#/components/schemas/RankingFrequency'
 *              weekly:
 *                $ref: '#/components/schemas/RankingFrequency'
 *              monthly:
 *                $ref: '#/components/schemas/RankingFrequency'
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
 *    RankingFrequency:
 *      type: string
 *      description: Ranking frequency
 *      enum: ["off", "1hour", "6hour", "12hour", "1day", "7day", "15day", "1month"]
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
 *        server:
 *          type: string
 *          description: Albion server
 *          example: "Albion West"
 *        kills:
 *          type: object
 *          description: Custom settings for kills
 *          required: false
 *          properties:
 *            channel: Channel to send notifications
 *        deaths:
 *          type: object
 *          description: Custom settings for deaths
 *          required: false
 *          properties:
 *            channel: Channel to send notifications
 */

/**
 * @openapi
 * /servers:
 *   get:
 *     tags: [Servers]
 *     summary: Return list of servers for current user
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
 */
router.get(`/`, serversController.getServers);

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

/**
 * @openapi
 * /servers/{serverId}/test:
 *   post:
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
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [kills, deaths]
 *               mode:
 *                 type: string
 *                 enum: ["image", "text"]
 *               channelId:
 *                 type: string
 *                 required: false
 *                 example: 738365346855256107
 *     summary: Test the server notifications for a server.
 *     responses:
 *       200:
 *         description: Test initiated
 */
router.post(`/:serverId/test`, serversController.testServerSettings);

module.exports = {
  path: "/servers",
  router,
};
