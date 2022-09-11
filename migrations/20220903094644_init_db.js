/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return await Promise.all([
    knex.raw(`DROP TABLE IF EXISTS activities, todos`),
    knex.raw(
      `CREATE TABLE activities (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(250) NOT NULL DEFAULT '',
        title VARCHAR(100) NULL DEFAULT '',
        created_at TIMESTAMP NULL DEFAULT current_timestamp(),
        updated_at TIMESTAMP NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id) USING BTREE
    )
    ENGINE=MEMORY`,
    ),
    knex.raw(
      `CREATE TABLE todos (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NULL DEFAULT NULL,
  activity_group_id INT(10) UNSIGNED NULL DEFAULT '0',
  is_active TINYINT(1) UNSIGNED NULL DEFAULT '1',
  priority ENUM('very-high','high','normal','low','very-low') NULL DEFAULT 'very-high',
  PRIMARY KEY (id) USING BTREE,
  INDEX activity_group_id (activity_group_id) USING BTREE
)
ENGINE=MEMORY`,
    ),
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('activities').dropTable('todos');
};
