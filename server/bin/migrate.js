require("dotenv").config();
const path = require("node:path");
const fs = require("node:fs/promises");
const database = require("../src/ports/database");
const logger = require("../src/helpers/logger");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");
const STATE_FILE = "migration-state.json";
const INGORED_FILES = [".gitignore", STATE_FILE];

function getLastUpdate() {
  let lastUpdate = 0;

  try {
    const state = require(path.join(MIGRATIONS_DIR, STATE_FILE));
    if (state.lastUpdate) lastUpdate = state.lastUpdate;
  } catch (e) {
    if (!e.code == "MODULE_NOT_FOUND") throw e;
  }

  return lastUpdate;
}

async function setLastUpdate(lastUpdate) {
  const state = {
    lastUpdate,
  };

  await fs.writeFile(path.join(MIGRATIONS_DIR, STATE_FILE), JSON.stringify(state));
}

async function getMigrations() {
  const migrations = [];
  const lastUpdate = getLastUpdate();
  const migrationFiles = await fs.readdir(MIGRATIONS_DIR);

  for (const migrationFile of migrationFiles) {
    if (INGORED_FILES.indexOf(migrationFile) >= 0) continue;

    const migrationFileUpdate = migrationFile.match(/^(\d+)-.*\.js/);
    if (!migrationFileUpdate) continue;
    if (migrationFileUpdate[1] <= lastUpdate) continue;

    migrations.push({
      file: migrationFile,
      lastUpdate: migrationFileUpdate[1],
    });
  }

  return migrations;
}

async function runMigration(migration) {
  logger.info(`Running migration: ${migration.file}`);

  try {
    const { run } = require(path.join(MIGRATIONS_DIR, migration.file));
    await run();
  } catch (e) {
    // logger.error(e);
    logger.error(e.stack);
    logger.error(`An error ocurred while running ${migration.file}. Exiting...`);
    process.exit(1);
  }
}

async function run() {
  const migrations = await getMigrations();
  if (migrations.length == 0) return logger.info("Migrations already up-to-date.");

  await database.init();
  for (const migration of migrations) {
    await runMigration(migration);
  }
  await database.cleanup();
  await setLastUpdate(new Date().getTime());

  return logger.info("Migrations completed!");
}

if (require.main == module) {
  (async () => {
    try {
      await run();
      process.exit(0);
    } catch (e) {
      logger.error("Error in migrations:", e);
      process.exit(1);
    }
  })();
}
