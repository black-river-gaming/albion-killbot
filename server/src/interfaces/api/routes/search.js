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
 *           items:
 *             $ref: '#/components/schemas/TrackItem'
 *         guilds:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrackItem'
 *         alliances:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TrackItem'
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
 *     - name: server
 *       in: query
 *       schema:
 *         type: string
 *         enum: ["Albion West", "Albion East"]
 *         default: "Albion West"
 *     summary: Search Albion Online (players, guilds and alliances)
 *     operationId: search
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResults'
 */
router.get("/:query", searchController.search);

module.exports = {
  path: "/search",
  router,
};
