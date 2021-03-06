const sqlite3 = require("sqlite3");
const knex = require("knex");

/***** Database Setup *****/
/**
 * This SQL Relational Database implementation uses sqlite3 with Knex.js
 * https://knexjs.org/
 */
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
      t.increments("_id").primary();
      t.string("name", 500);
      t.binary("cover"); /*
      t.integer("year");
      t.enu("era", [
        "vintage",
        "pre-20th-century",
        "1900s",
        "1910s",
        "1920s",
        "1930s",
        "1940s",
        "1950s",
        "1960s",
        "1970s",
        "1980s",
        "1990s",
        "2000s",
        "2010s",
        "2020s",
        "contemporary",
      ]);
      t.string("company", 200);
      t.text("notes");*/
    });
  }
});
/*
database.schema.hasTable("images").then((exists) => {
  if (!exists) {
    return database.schema.createTable("images", (t) => {
      t.increments("id").primary();
      t.binary("image");
      t.foreign("patternId").references("id").inTable("patterns");
    });
  }
});
*/
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
 * @param {string} name The name to use in the query
 * @returns {Object[]} All the sewing patterns containing the argument in the name
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
 * @param {integer} id The id to use in the query
 * @returns {Object[]} The sewing patterns matching the id (caller methods should select the first element)
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
 * @param {Object} pattern The sewing pattern to insert into the database
 * @returns {integer} The id of the newly inserted pattern
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
 * @param {Object} pattern The sewing pattern object to update in the database
 * @returns {integer} The id of the updated pattern
 */
const updateSewingPattern = (exports.updateSewingPattern = (pattern) => {
  console.log("database - updating sewing pattern named " + pattern.name);
  return database("patterns")
    .where("id", pattern.id)
    .update({ name: pattern.name })
    .catch(console.error);
});
