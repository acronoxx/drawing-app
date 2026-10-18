import type { BoundingBox, Point } from "./CanvasItem";

/**
 * Handle on the bounding box of the selected shape, described by its
 * relative position in the box: 0 = left/top, 0.5 = middle, 1 = right/bottom.
 *
 * Positioning handles with fractions of the box works the same way for
 * every type of shape, whatever its size.
 */
export type Handle = {
    /** Horizontal position in the box, from 0 (left) to 1 (right). */
    fx: number;
    /** Vertical position in the box, from 0 (top) to 1 (bottom). */
    fy: number;
};

/** The 8 handles: the 4 corners and the middle of the 4 sides. */
export const HANDLES: Handle[] = [
    { fx: 0, fy: 0 },   { fx: 0.5, fy: 0 },   { fx: 1, fy: 0 },
    { fx: 0, fy: 0.5 },                       { fx: 1, fy: 0.5 },
    { fx: 0, fy: 1 },   { fx: 0.5, fy: 1 },   { fx: 1, fy: 1 },
];

/** Side of a handle square, in pixels. Also the distance within which a click picks a handle. */
export const HANDLE_SIZE = 8;

/**
 * Returns the position of a handle on a bounding box.
 * @param box - Bounding box of the shape
 * @param handle - Handle to position
 * @returns Center of the handle, in canvas coordinates
 */
export function getHandlePosition(box: BoundingBox, handle: Handle): Point {
    return {
        x: box.x + handle.fx * box.width,
        y: box.y + handle.fy * box.height,
    };
}

/**
 * Returns the handle under a point, if any.
 * @param box - Bounding box of the selected shape
 * @param x - X coordinate relative to the canvas
 * @param y - Y coordinate relative to the canvas
 * @returns The handle within `HANDLE_SIZE` pixels of the point, or null if none
 */
export function getHandleAt(box: BoundingBox, x: number, y: number): Handle | null {
    for (const handle of HANDLES) {
        const pos = getHandlePosition(box, handle);
        if (Math.abs(x - pos.x) <= HANDLE_SIZE && Math.abs(y - pos.y) <= HANDLE_SIZE) {
            return handle;
        }
    }
    return null;
}

/**
 * Scales a point relative to a fixed point (negative factors mirror it).
 * @param p - Point to scale
 * @param sx - Horizontal scale factor
 * @param sy - Vertical scale factor
 * @param fixed - Point that does not move
 */
export function scalePoint(p: Point, sx: number, sy: number, fixed: Point): Point {
    return {
        x: fixed.x + (p.x - fixed.x) * sx,
        y: fixed.y + (p.y - fixed.y) * sy,
    };
}