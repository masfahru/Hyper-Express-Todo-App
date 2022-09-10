/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  return await Promise.all([
    knex.raw(
      `DROP TABLE IF EXISTS activities, todos`,
    ),
    knex.raw(
      `CREATE TABLE activities (
        id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(250) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
        title VARCHAR(100) NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
        created_at TIMESTAMP NULL DEFAULT current_timestamp(),
        updated_at TIMESTAMP NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id) USING BTREE,
        INDEX email (email) USING HASH
    )
    COLLATE='latin1_swedish_ci'
    ENGINE=MYISAM`,
    ),
    knex.raw(
      `CREATE TABLE todos (
  id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
  activity_group_id INT(10) UNSIGNED NULL DEFAULT '0',
  is_active TINYINT(1) UNSIGNED NULL DEFAULT '1',
  priority ENUM('very-high','high','normal','low','very-low') NULL DEFAULT 'very-high' COLLATE 'latin1_swedish_ci',
  PRIMARY KEY (id) USING BTREE,
  INDEX activity_group_id (activity_group_id) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=MyISAM`,
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
