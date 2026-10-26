import type { BoundingBox, CanvasItem, Point } from "./CanvasItem";
import { scalePoint } from "./handles";

/**
 * Ellipse shape, inscribed in the box drawn by the user.
 *
 * Stored like a rectangle (starting corner + size, possibly negative);
 * the center and radii are computed from this box when building the path.
 */
export class EllipseItem implements CanvasItem {
    /** 2D context the ellipse is drawn on. */
    public ctx: CanvasRenderingContext2D;
    /** Fill color, as a hex string. */
    public fillColor: string;
    /** Outline color, as a hex string. */
    public strokeColor: string;
    /** Outline width, in pixels. */
    public lineWidth: number;
    /** Path of the ellipse, used to draw it and to test hits. */
    public shape: Path2D;

    /** Corner of the bounding box where the drawing started, in canvas coordinates. */
    firstPoint: { x: number; y: number };
    /** Width (x) and height (y) of the bounding box from `firstPoint`, possibly negative. */
    wh: { x: number; y: number };

    /**
     * Creates an empty ellipse (size 0) at the given point.
     * @param ctx - 2D context to draw on
     * @param point - Starting corner of the bounding box, in canvas coordinates
     * @param fillColor - Fill color (hex string)
     * @param strokeColor - Outline color (hex string)
     * @param lineWidth - Outline width, in pixels
     */
    constructor(
        ctx: CanvasRenderingContext2D,
        point: { x: number; y: number },
        fillColor: string,
        strokeColor: string,
        lineWidth: number) {
        this.ctx = ctx;
        this.firstPoint = point;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.shape = new Path2D();
        this.wh = { x: 0, y: 0 };
    }

    /** Rebuilds the path and draws the filled, outlined ellipse. */
    draw(): void {
        this.ctx.fillStyle = this.fillColor;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;

        this.buildShape();
        this.ctx.fill(this.shape);
        this.ctx.stroke(this.shape);
    }

    /**
     * Tells whether a point is inside the ellipse.
     * @param x - X coordinate relative to the canvas
     * @param y - Y coordinate relative to the canvas
     */
    contains(x: number, y: number): boolean {
        return this.ctx.isPointInPath(this.shape, x, y);
    }
    
    /**
     * Translates the ellipse. Does not redraw the canvas.
     * @param dx - Horizontal offset, in pixels
     * @param dy - Vertical offset, in pixels
     */
    move(dx: number, dy: number): void {
        this.firstPoint = {x: this.firstPoint.x + dx, y: this.firstPoint.y + dy}
        this.buildShape();
    }

    /**
     * Resizes the bounding box so its opposite corner is at the given point.
     * Does not redraw the canvas.
     * @param x - X coordinate of the opposite corner, relative to the canvas
     * @param y - Y coordinate of the opposite corner, relative to the canvas
     */
    update(x: number, y: number): void {
        this.wh = { x: x - this.firstPoint.x, y: y - this.firstPoint.y};
        this.buildShape();
    }

    /**
     * Returns a new ellipse with the same position, size and style.
     * The copy is not added to the canvas.
     */
    duplicate(): CanvasItem {
        const item = new EllipseItem(this.ctx, this.firstPoint, this.fillColor, this.strokeColor, this.lineWidth);
        item.wh.x = this.wh.x;
        item.wh.y = this.wh.y;
        return item;
    }

    /**
     * Returns the smallest axis-aligned box containing the shape.
     * Uses `firstPoint` and `wh`, normalized since `wh` can be negative
     * (the ellipse may have been drawn to the left or upward).
     */
    getBoundingBox(): BoundingBox {
        return {
            x: Math.min(this.firstPoint.x, this.firstPoint.x + this.wh.x),
            y: Math.min(this.firstPoint.y, this.firstPoint.y + this.wh.y),
            width : Math.abs(this.wh.x),
            height: Math.abs(this.wh.y)
        }
    }

    /**
     * Scales the shape relative to a fixed point (negative factors flip it).
     * `firstPoint` is a position, so it is scaled relative to the fixed point;
     * `wh` is a size, so it is simply multiplied by the factors.
     * Does not redraw the canvas.
     * @param sx - Horizontal scale factor
     * @param sy - Vertical scale factor
     * @param fixed - Point that does not move, in canvas coordinates
     */
    scale(sx: number, sy: number, fixed: Point): void {
        this.firstPoint = scalePoint(this.firstPoint, sx, sy, fixed);
        this.wh = { x: this.wh.x * sx, y: this.wh.y * sy };
        this.buildShape();
    }

    // Private helpers
    /** Rebuilds the ellipse path from the bounding box (firstPoint + wh). */
    private buildShape(): void {
        const centerX = this.firstPoint.x + this.wh.x / 2;
        const centerY = this.firstPoint.y + this.wh.y / 2;
        // Force positive radius (width can be negative and a radius cannot)
        const radiusX = Math.abs(this.wh.x) / 2;
        const radiusY = Math.abs(this.wh.y) / 2;

        this.shape = new Path2D();
        this.shape.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }
}