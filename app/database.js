const sqlite3 = require("sqlite3");
const knex = require("knex");

/***** Database Setup *****/

const database = knex({
  client: "sqlite3",
  connection: {
    filename: "./sewing-vault.sqlite",
  },
  useNullAsDefault: true,
});

database.schema.hasTable("patterns").then((exists) => {
  if (!exists) {
    return database.schema.createTable("patterns", (t) => {
      t.increments("id").primary();
      t.string("name", 500);
      t.binary("cover");
    });
  }
});

database.schema.hasTable("images").then((exists) => {
  if (!exists) {
    return database.schema.createTable("images", (t) => {
      t.increments("id").primary();
      t.binary("image");
      t.foreign("patternId").references("id").inTable("patterns");
    });
  }
});

/***** Database API Functions *****/

/**
 * Returns all the patterns in the database
 */
const getAllPatterns = (exports.getAllPatterns = () => {
  console.log("database - getting all patterns");
  return database("patterns")
    .select()
    .then((results) => results)
    .catch(console.error);
});

/**
 * This functions returns all sewing patterns that contain the argument
 * in the name. The name needs to be escaped to be processed correctly
 * as an SQL query.
 * @param {name} name
 * @returns All the sewing patterns containing the argument in the name
 */
const getSewingPatternsByName = (exports.getSewingPatternsByName = (name) => {
  console.log("database - getting sewing patterns named like " + name);
  return database("patterns")
    .where("name", "like", `%${name}%`)
    .select()
    .then((results) => results)
    .catch(console.error);
});

/**
 * Get the pattern matching the provided identifier.
 * @param {id} id
 * @returns The sewing pattern matching the id
 */
const getSewingPatternById = (exports.getSewingPatternById = (id) => {
  console.log("database - getting sewing pattern with id " + id);
  var pattern = null;
  return database("patterns")
    .where("id", id)
    .select()
    .then((result) => {
      pattern = result;
      return pattern;
    })
    .catch(console.error);
});

/**
 * Inserts a new sewing pattern into the database
 */
const addNewSewingPattern = (exports.addNewSewingPattern = (pattern) => {
  console.log("database - adding new sewing pattern named " + pattern.name);
  return database("patterns")
    .insert({ name: pattern.name, cover: pattern.cover })
    .then((insertedId) => insertedId)
    .catch(console.error);
});

/**
 * Updates a sewing pattern in the database
 */
const updateSewingPattern = (exports.updateSewingPattern = (pattern) => {
  console.log("database - updating sewing pattern named " + pattern.name);
  return database("patterns")
    .where("id", pattern.id)
    .update({ name: pattern.name })
    .catch(console.error);
});
