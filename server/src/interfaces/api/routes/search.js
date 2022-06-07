const router = require("express").Router();
const searchController = require("../controllers/search");

/**
 * @openapi
 * components:
 *   schemas:
 *     SearchResults:
 *       type: object
 *       properties:
 *         players:
 *           type: array
 *           description: Player List
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 description: Player id
 *                 type: string
 *                 example: "PMQEaTj7SEqCDozi6cIsJA"
 *               name:
 *                 description: Player name
 *                 type: string
 *                 example: "Awesome Player"
 *         guilds:
 *           type: array
 *           description: Guild list
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 description: Guild id
 *                 type: string
 *                 example: "W7eCg8IiSzu94gKprzqXlA"
 *               name:
 *                 description: Guild name
 *                 type: string
 *                 example: "Awesome Guild"
 *         alliances:
 *           type: array
 *           description: Alliance list
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 description: Alliance id
 *                 type: string
 *                 example: "-Ysq5eZ8R0y8gsMmJm-3NQ"
 *               name:
 *                 description: Alliance name
 *                 type: string
 *                 example: "Awesome Alliance"
 */

/**
 * @openapi
 * /search/{query}:
 *   get:
 *     tags: [Search]
 *     parameters:
 *     - name: query
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     summary: Search Albion Online entities (players, guilds and alliances)
 *     operationId: search
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResults'
 */
router.get("/search/:query", searchController.search);

module.exports = router;
