const Datastore = require("nedb");
/**
 * This implementation of NoSQL database uses NeDB
 * https://github.com/louischatriot/nedb/
 * https://stackabuse.com/nedb-a-lightweight-javascript-database/
 * https://stackoverflow.com/questions/38800493/nedb-how-to-get-docs-out-of-find-function
 */
const db = new Datastore({ filename: "./vault.db", autoload: true });

/**
 * Returns all the patterns in the database.
 * @returns {Promise} Promise that when resolved contains all patterns
 */
const getAllPatterns = (exports.getAllPatterns = () => {
  console.log("nosqldb - getting all sewing patterns");
  return new Promise((resolve, reject) => {
    db.find({}, (err, results) => {
      if (err) {
        reject(err);
      }
      console.log("nosqldb - found " + results.length + " results");
      resolve(results);
    });
  });
});

/**
 * This functions returns all sewing patterns that contain the argument
 * in the name. It will return all patterns whose name contains the string
 * ignoring the case.
 * @param {string} name The name to use in the query
 * @returns {Promise} Promise that when resolved returns all the sewing patterns containing the argument in the name
 */
const getSewingPatternsByName = (exports.getSewingPatternsByName = (name) => {
  console.log("nosqldb - getting sewing patterns named like " + name);
  return new Promise((resolve, reject) => {
    db.find({ name: new RegExp(name, "i") }, (err, results) => {
      if (err) {
        reject(err);
      }
      console.log("nosqldb - found " + results.length + " results");
      resolve(results);
    });
  });
});

/**
 * Get the pattern matching the provided identifier.
 * @param {string} id The id to use in the query
 * @returns {Promise} Promise that when resolved returns the sewing patterns matching the id (caller methods should select the first element)
 */
const getSewingPatternById = (exports.getSewingPatternById = (id) => {
  console.log("nosqldb - getting sewing pattern with id " + id);
  return new Promise((resolve, reject) => {
    db.find({ _id: id }, (err, results) => {
      if (err) {
        reject(err);
      }
      if (results !== null) {
        console.log("nosqldb - found " + results.length + " results");
      } else {
        console.log("nosqldb - didn't find any pattern matching id " + id);
      }
      resolve(results);
    });
  });
});

/**
 * Inserts a new sewing pattern into the database.
 * @param {Object} pattern The sewing pattern to insert into the database
 * @returns {Promise} Promise that when resolved contains the id of the newly inserted pattern
 */
const addNewSewingPattern = (exports.addNewSewingPattern = (pattern) => {
  return new Promise((resolve, reject) => {
    db.insert(pattern, (err, insertedObject) => {
      if (err) {
        reject(err);
      }
      console.log("nosqldb - inserted pattern with name " + pattern.name);
      resolve(insertedObject._id);
    });
  });
});

/**
 * Updates a sewing pattern in the database.
 * @param {Object} pattern The sewing pattern object to update in the database
 * @returns {Promise} Promise that when resolved returns the id of the updated pattern
 */
const updateSewingPattern = (exports.updateSewingPattern = (pattern) => {
  console.log("nosqldb - updating sewing pattern named " + pattern.name);
  return new Promise((resolve, reject) => {
    db.update(
      { _id: pattern.id },
      {
        $set: {
          name: pattern.name,
          cover: pattern.cover,
          additional_images: pattern.additional_images,
        },
      },
      { returnUpdatedDocs: true },
      (err, numAffected, updatedObject, upsert) => {
        if (err) {
          reject(err);
        }
        console.log("nosqldb - updated " + numAffected + " patterns");
        resolve(updatedObject._id);
      }
    );
  });
});

/**
 * Deletes a sewing pattern from the database.
 * @param {string} patternId The id of the pattern to delete
 * @returns {Promise} Promise that when resolved returns the id of the deleted pattern
 */
const deleteSewingPattern = (exports.deleteSewingPattern = (patternId) => {
  console.log("nosqldb - deleting sewing pattern with id " + patternId);
  return new Promise((resolve, reject) => {
    db.remove({ _id: patternId }, {}, (err, numberRemoved) => {
      if (err) {
        reject(err);
      }
      console.log("nosqldb - removed " + numberRemoved + " patterns");
      resolve(patternId);
    });
  });
});

/**
 * Deletes a specific image from the provided pattern.
 * @param {Object} pattern The sewing pattern to update
 * @param {integer} imageId The id of the image to remove
 * @returns {Promise} Promise that when resolved returns the updated pattern without the
 * removed image
 */
const deleteImageFromPattern = (exports.deleteImageFromPattern = (
  pattern,
  imageId
) => {
  console.log(
    "nosqldb - deleting image " + imageId + " from pattern " + pattern.name
  );

  // We modify the array of images contained in the pattern by finding the index of
  // the object and splicing the array
  let newImages = pattern.additional_images;
  const removeIndex = newImages.findIndex((item) => item.id === imageId);
  newImages.splice(removeIndex, 1);
  pattern.additional_images = newImages;

  return new Promise((resolve, reject) => {
    db.update(
      { _id: pattern._id },
      {
        $set: {
          name: pattern.name,
          cover: pattern.cover,
          additional_images: pattern.additional_images,
        },
      },
      { returnUpdatedDocs: true },
      (err, numAffected, updatedObject, upsert) => {
        if (err) {
          reject(err);
        }
        console.log("nosqldb - removed image from pattern");
        resolve(updatedObject);
      }
    );
  });
});
