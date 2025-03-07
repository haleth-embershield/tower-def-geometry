// Simple Zig WASM Example for Zig v0.13
// Build target: WebAssembly
// Demonstrates basic interaction between Zig and HTML Canvas

// WASM imports for browser interaction
extern "env" fn consoleLog(ptr: [*]const u8, len: usize) void;
extern "env" fn drawRect(x: f32, y: f32, width: f32, height: f32, r: u8, g: u8, b: u8) void;
extern "env" fn clearCanvas() void;

// Global state
var frame_count: u32 = 0;
var position_x: f32 = 0;
var position_y: f32 = 0;
var direction_x: f32 = 1;
var direction_y: f32 = 1;
var canvas_width: f32 = 800;
var canvas_height: f32 = 600;

// Helper to log strings to browser console
fn logString(msg: []const u8) void {
    consoleLog(msg.ptr, msg.len);
}

// Initialize the WASM module
export fn init(width: f32, height: f32) void {
    canvas_width = width;
    canvas_height = height;
    position_x = width / 2;
    position_y = height / 2;

    logString("WASM module initialized");
}

// Update animation frame
export fn update(delta_time: f32) void {
    frame_count += 1;

    // Move rectangle
    const speed: f32 = 150.0 * delta_time;
    position_x += direction_x * speed;
    position_y += direction_y * speed;

    // Bounce off edges
    if (position_x < 0 or position_x > canvas_width - 50) {
        direction_x *= -1;
    }
    if (position_y < 0 or position_y > canvas_height - 50) {
        direction_y *= -1;
    }

    // Clear canvas
    clearCanvas();

    // Draw animated rectangle
    const r: u8 = @intCast((frame_count % 255));
    const g: u8 = @intCast(((frame_count + 85) % 255));
    const b: u8 = @intCast(((frame_count + 170) % 255));

    drawRect(position_x, position_y, 50, 50, r, g, b);

    // Log every 100 frames
    if (frame_count % 100 == 0) {
        var msg_buf: [64]u8 = undefined;
        var pos: usize = 0;

        const prefix = "Frame: ";
        for (prefix) |c| {
            msg_buf[pos] = c;
            pos += 1;
        }

        // Convert frame count to string (simple implementation)
        var count_copy = frame_count;
        var digits: [10]u8 = undefined;
        var digit_count: usize = 0;

        while (count_copy > 0) {
            digits[digit_count] = @intCast((count_copy % 10) + '0');
            count_copy /= 10;
            digit_count += 1;
        }

        // Handle zero case
        if (digit_count == 0) {
            msg_buf[pos] = '0';
            pos += 1;
        } else {
            // Copy digits in correct order
            var i: usize = digit_count;
            while (i > 0) {
                i -= 1;
                msg_buf[pos] = digits[i];
                pos += 1;
            }
        }

        logString(msg_buf[0..pos]);
    }
}

// Handle mouse click
export fn handleClick(x: f32, y: f32) void {
    position_x = x;
    position_y = y;

    // Log click position
    var msg_buf: [64]u8 = undefined;
    var pos: usize = 0;

    const prefix = "Click at: ";
    for (prefix) |c| {
        msg_buf[pos] = c;
        pos += 1;
    }

    // Add x coordinate (simplified)
    const x_str = "x=";
    for (x_str) |c| {
        msg_buf[pos] = c;
        pos += 1;
    }

    // Convert x to integer for simplicity
    const x_int = @as(u32, @intFromFloat(x));
    var x_copy = x_int;
    var digits: [10]u8 = undefined;
    var digit_count: usize = 0;

    if (x_int == 0) {
        msg_buf[pos] = '0';
        pos += 1;
    } else {
        while (x_copy > 0) {
            digits[digit_count] = @intCast((x_copy % 10) + '0');
            x_copy /= 10;
            digit_count += 1;
        }

        var i: usize = digit_count;
        while (i > 0) {
            i -= 1;
            msg_buf[pos] = digits[i];
            pos += 1;
        }
    }

    // Add separator
    msg_buf[pos] = ',';
    pos += 1;
    msg_buf[pos] = ' ';
    pos += 1;

    // Add y coordinate
    const y_str = "y=";
    for (y_str) |c| {
        msg_buf[pos] = c;
        pos += 1;
    }

    // Convert y to integer for simplicity
    const y_int = @as(u32, @intFromFloat(y));
    var y_copy = y_int;
    digit_count = 0;

    if (y_int == 0) {
        msg_buf[pos] = '0';
        pos += 1;
    } else {
        while (y_copy > 0) {
            digits[digit_count] = @intCast((y_copy % 10) + '0');
            y_copy /= 10;
            digit_count += 1;
        }

        var i: usize = digit_count;
        while (i > 0) {
            i -= 1;
            msg_buf[pos] = digits[i];
            pos += 1;
        }
    }

    logString(msg_buf[0..pos]);
}
