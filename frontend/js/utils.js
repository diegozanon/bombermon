var Bombermon = Bombermon || {};

Bombermon.create_prefab_from_pool = function (pool, prefab_constructor, game_state, prefab_name, prefab_position, prefab_properties) {
    "use strict";
    var prefab;
    // get the first dead prefab from the pool
    prefab = pool.getFirstDead();
    if (!prefab) {
        // if there is no dead prefab, create a new one
        prefab = new prefab_constructor(game_state, prefab_name, prefab_position, prefab_properties);
    } else {
        // if there is a dead prefab, reset it in the new position
        prefab.reset(prefab_position.x, prefab_position.y);
    }
};