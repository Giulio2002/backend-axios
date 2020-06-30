
exports.up = function(knex) {
    return knex.schema.createTable('option_data', function(t) {
        t.string('origin').notNull();
        t.string('address').notNull();
        t.string('lock').notNull();
        t.string('origin_lock').notNull();
        t.string('expire').notNull();
        t.string('price_in').notNull();
        t.string('price_out').notNull();
        t.string('id').notNull();
        t.string('status').notNull();
        t.string('credit').notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('option_data');
};
