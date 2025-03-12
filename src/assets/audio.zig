// audio.zig
// Embeds audio assets into the WASM binary

// Embed audio files as byte arrays
pub const enemy_hit = @embedFile("audio/enemy-hit.ogg");
pub const level_complete = @embedFile("audio/level-complete.ogg");
pub const level_fail = @embedFile("audio/level-fail.ogg");
pub const tower_shoot = @embedFile("audio/tower-shoot.ogg");
pub const enemy_explosion = @embedFile("audio/enemy-explosion.ogg");

// Export functions to get audio data
export fn getEnemyHitAudioPtr() [*]const u8 {
    return enemy_hit.ptr;
}

export fn getEnemyHitAudioLen() usize {
    return enemy_hit.len;
}

export fn getLevelCompleteAudioPtr() [*]const u8 {
    return level_complete.ptr;
}

export fn getLevelCompleteAudioLen() usize {
    return level_complete.len;
}

export fn getLevelFailAudioPtr() [*]const u8 {
    return level_fail.ptr;
}

export fn getLevelFailAudioLen() usize {
    return level_fail.len;
}

export fn getTowerShootAudioPtr() [*]const u8 {
    return tower_shoot.ptr;
}

export fn getTowerShootAudioLen() usize {
    return tower_shoot.len;
}

export fn getEnemyExplosionAudioPtr() [*]const u8 {
    return enemy_explosion.ptr;
}

export fn getEnemyExplosionAudioLen() usize {
    return enemy_explosion.len;
}
