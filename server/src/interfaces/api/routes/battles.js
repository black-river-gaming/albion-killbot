const router = require("express").Router();
const battlesController = require("../controllers/battles");

/**
 * @openapi
 * components:
 *  schemas:
 *    Battle:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *          readOnly: true
 *          example: 470219088
 *        startTime:
 *          type: string
 *          readOnly: true
 *          format: date-time
 *        endTime:
 *          type: string
 *          readOnly: true
 *          format: date-time
 *        timeout:
 *          type: string
 *          readOnly: true
 *          format: date-time
 *        totalFame:
 *          type: number
 *          readOnly: true
 *          example: 328729885
 *        clusterName:
 *          type: string
 *          readOnly: true
 *          default: null
 *        players:
 *          type: object
 *          readOnly: true
 *          additionalProperties:
 *            $ref: '#/components/schemas/BattlePlayer'
 *        guilds:
 *          type: object
 *          readOnly: true
 *          additionalProperties:
 *            $ref: '#/components/schemas/BattleGuild'
 *        alliances:
 *          type: object
 *          readOnly: true
 *          additionalProperties:
 *            $ref: '#/components/schemas/BattleAlliance'
 *        battle_TIMEOUT:
 *          type: number
 *          default: 180
 *
 *    BattleAlliance:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          readOnly: true
 *          example: "Wd0NtWAcRGG6rWbrAzQ_IA"
 *        name:
 *          type: string
 *          readOnly: true
 *          example: "birdX"
 *        kills:
 *          type: number
 *          readOnly: true
 *          example: 0
 *        deaths:
 *          type: number
 *          readOnly: true
 *          example: 0
 *        killFame:
 *          type: number
 *          readOnly: true
 *          example: 0
 *
 *    BattleGuild:
 *      type: object
 *      allOf:
 *        - $ref: '#/components/schemas/BattleAlliance'
 *        - type: object
 *          properties:
 *            allianceName:
 *              type: string
 *              example: "1SET"
 *            allianceId:
 *              type: string
 *              example: "a8q896MfQgC7sETE_rACxg"
 *
 *    BattlePlayer:
 *      type: object
 *      allOf:
 *        - $ref: '#/components/schemas/BattleAlliance'
 *        - type: object
 *          properties:
 *            guildName:
 *              type: string
 *              example: "The Gringos"
 *            guildId:
 *              type: string
 *              example: "sUdD0Ky1RZCh4TRCuSAKBQ"
 *            alliance:
 *              type: string
 *              example: "JEWC"
 *            allianceId:
 *              type: string
 *              example: "1GbJQotgT9mKk0SbjXEKvw"
 */

/**
 * @openapi
 * /battles/{battleId}:
 *   get:
 *     tags: [Battles]
 *     parameters:
 *     - name: battleId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     summary: Get battle report.
 *     operationId: getBattle
 *     responses:
 *       200:
 *         description: Battle report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Battle'
 *       404:
 *         description: Battle not found
 */
router.get(`/battles/:battleId`, battlesController.getBattle);

module.exports = router;
