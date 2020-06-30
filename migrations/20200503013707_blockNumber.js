
exports.up = function(knex) {
    return knex.schema.createTable('blockNumber', function(t) {
        t.string('key').notNull();
        t.string('current').notNull();
    });  
};

exports.down = function(knex) {
    return knex.schema.dropTable('blockNumber');
};
