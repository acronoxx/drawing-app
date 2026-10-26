/** Point in canvas coordinates. */
export type Point = { x: number; y: number };

/**
 * Axis-aligned rectangle around a shape, in canvas coordinates.
 * `width` and `height` are never negative.
 */
export type BoundingBox = { x: number; y: number; width: number; height: number };

/** Kind of shape, as sent in an `add` action ("path" is drawn with the pencil). */
export type ShapeKind = "path" | "line" |"rectangle" | "ellipse"

/** Visual style of a shape: fill color, outline color and outline width. */
export type ShapeStyle = {
    /** Fill color, as a hex string. */
    fillColor: string;
    /** Outline color, as a hex string. */
    strokeColor: string;
    /** Outline width, in pixels. */
    lineWidth: number;
};

/**
 * Shape that can be drawn on the canvas.
 *
 * Every shape (rectangle, ellipse, line, path) implements this interface,
 * so the item store and the canvas can draw, pick, move and clone them
 * without knowing their concrete type.
 *
 * A shape does not keep a 2D context: the caller gives one to `draw` and
 * `contains`, so shapes can live in a store without any reference to the DOM.
 * Shapes in the store are never modified: change a copy from `duplicate()`.
 */
export interface CanvasItem {
    /** Fill color, as a hex string. */
    fillColor: string;
    /** Outline color, as a hex string. */
    strokeColor: string;
    /** Outline width, in pixels. */
    lineWidth: number;
    /** Path of the shape, used to draw it and to test hits. */
    shape: Path2D;

    /**
     * Draws the shape on the canvas with its own style.
     * @param ctx - 2D context to draw on
     */
    draw(ctx: CanvasRenderingContext2D): void;

    /**
     * Tells whether a point is inside the shape.
     * @param ctx - 2D context used for the hit test (any 2D context works)
     * @param x - X coordinate relative to the canvas
     * @param y - Y coordinate relative to the canvas
     */
    contains(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;

    /**
     * Translates the shape. Does not redraw the canvas.
     * @param dx - Horizontal offset, in pixels
     * @param dy - Vertical offset, in pixels
     */
    move(dx: number, dy: number): void;

    /**
     * Updates the shape while it is being drawn, from the current cursor
     * position. Does not redraw the canvas.
     * @param x - X coordinate of the cursor, relative to the canvas
     * @param y - Y coordinate of the cursor, relative to the canvas
     */
    update(x: number, y: number): void;

    /** Returns a copy of the shape with the same geometry and style. */
    duplicate(): CanvasItem;

    /**
     * Returns the smallest axis-aligned box containing the shape,
     * with a non-negative width and height.
     */
    getBoundingBox(): BoundingBox;

    /**
     * Scales the shape relative to a fixed point: each point p becomes
     * `fixed + (p - fixed) * scale`. A negative factor flips the shape across
     * the fixed point. The line width is not scaled. Does not redraw the canvas.
     * @param sx - Horizontal scale factor
     * @param sy - Vertical scale factor
     * @param fixed - Point that does not move, in canvas coordinates
     */
    scale(sx: number, sy: number, fixed: Point): void;
}
