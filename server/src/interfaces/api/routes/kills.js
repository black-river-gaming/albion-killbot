const router = require("express").Router();
const killsController = require("../controllers/kills");

/**
 * @openapi
 * components:
 *  schemas:
 *    Kill:
 *      type: object
 *      properties:
 *        EventId:
 *          type: number
 *          readOnly: true
 *          example: 471488943
 *        TimeStamp:
 *          type: string
 *          readOnly: true
 *          format: date-time
 *        Version:
 *          type: number
 *          example: 4
 *        Killer:
 *          $ref: '#/components/schemas/Player'
 *        Victim:
 *          $ref: '#/components/schemas/Player'
 *        TotalVictimKillFame:
 *          type: number
 *          readOnly: true
 *          example: 43650
 *        Location:
 *          type: string
 *          readOnly: true
 *          default: null
 *        groupMemberCount:
 *          type: number
 *          readOnly: true
 *          example: 2
 *        numberOfParticipants:
 *          type: number
 *          readOnly: true
 *          example: 3
 *        Participants:
 *          type: array
 *          readOnly: true
 *          items:
 *            $ref: '#/components/schemas/Player'
 *        GroupMembers:
 *          type: array
 *          readOnly: true
 *          items:
 *            $ref: '#/components/schemas/Player'
 *        GvGMatch:
 *          type: boolean
 *          readOnly: true
 *          example: false
 *        BattleId:
 *          type: number
 *          readOnly: true
 *          example: 471488798
 *        KillArea:
 *          type: string
 *          readOnly: true
 *          example: "OPEN_WORLD"
 *        Category:
 *          type: string
 *          readOnly: true
 *          example: null
 *        Type:
 *          type: string
 *          readOnly: true
 *          example: "KILL"
 *
 *    Player:
 *      type: object
 *      properties:
 *        Id:
 *          type: string
 *          example: "OKzipE_ORvyWCmuOhHJbyA"
 *        Name:
 *          type: string
 *          example: "Blaxkuncle"
 *        GuildId:
 *          type: string
 *          example: "-Cx4tJsPSQaWAIhS5Y6GoQ"
 *        GuildName:
 *          type: string
 *          example: "Garuda"
 *        AllianceId:
 *          type: string
 *          example: "LTuFiPKFRt67C2Sp6FIyjAOKzipE_ORvyWCmuOhHJbyALTuFiPKFRt67C2Sp6FIyjA"
 *        AllianceName:
 *          type: string
 *          example: "OKzipE_ORvyWCmuOhHJbyAOLOK"
 *        AllianceTag:
 *          type: string
 *          example: ""
 *        Avatar:
 *          type: string
 *          example: "AVATAR_01"
 *        AvatarRing:
 *          type: string
 *          example: "RING1"
 *        KillFame:
 *          type: number
 *          example: 120
 *        DeathFame:
 *          type: number
 *          example: 345
 *        FameRatio:
 *          type: number
 *          example: 1200.00
 *        LifetimeStatistics:
 *          type: object
 *          additionalProperties: true
 *        AverageItemPower:
 *          type: number
 *          example: 1351.69336
 *        Equipment:
 *          type: object
 *          properties:
 *            MainHand:
 *              $ref: '#/components/schemas/Item'
 *            OffHand:
 *              $ref: '#/components/schemas/Item'
 *            Head:
 *              $ref: '#/components/schemas/Item'
 *            Armor:
 *              $ref: '#/components/schemas/Item'
 *            Shoes:
 *              $ref: '#/components/schemas/Item'
 *            Bag:
 *              $ref: '#/components/schemas/Item'
 *            Cape:
 *              $ref: '#/components/schemas/Item'
 *            Mount:
 *              $ref: '#/components/schemas/Item'
 *            Foog:
 *              $ref: '#/components/schemas/Item'
 *            Potion:
 *              $ref: '#/components/schemas/Item'
 *        Inventory:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Item'
 *
 *    Item:
 *      type: object
 *      properties:
 *        Type:
 *          type: string
 *          example: "T4_HEAD_CLOTH_HELL@3"
 *        Count:
 *          type: number
 *          example: 1
 *        Quality:
 *          type: number
 *          example: 4
 *        ActiveSpells:
 *          type: array
 *          example: []
 *          items:
 *            type: object
 *            additionalProperties: true
 *        PassiveSpells:
 *          type: array
 *          example: []
 *          items:
 *            type: object
 *            additionalProperties: true
 */

/**
 * @openapi
 * /kills/{killId}:
 *   get:
 *     tags: [Kills]
 *     parameters:
 *     - name: killId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     summary: Get kill report.
 *     operationId: getKill
 *     responses:
 *       200:
 *         description: Kill report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Kill'
 *       404:
 *         description: Kill not found
 */
router.get(`/kills/:killId`, killsController.getKill);

module.exports = router;
