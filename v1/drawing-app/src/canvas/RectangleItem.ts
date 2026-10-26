import type { BoundingBox, CanvasItem, Point } from "./CanvasItem";
import { scalePoint } from "./handles";

/**
 * Rectangle shape, defined by a starting corner and a size.
 *
 * The size can be negative when the user drags to the left or upward:
 * the rectangle then extends from `firstPoint` in that direction.
 */
export class RectangleItem implements CanvasItem {
    /** 2D context the rectangle is drawn on. */
    public ctx: CanvasRenderingContext2D;
    /** Fill color, as a hex string. */
    public fillColor: string;
    /** Outline color, as a hex string. */
    public strokeColor: string;
    /** Outline width, in pixels. */
    public lineWidth: number;
    /** Path of the rectangle, used to draw it and to test hits. */
    public shape: Path2D;

    /** Corner where the drawing started, in canvas coordinates. */
    firstPoint: { x: number; y: number };
    /** Width (x) and height (y) from `firstPoint`, possibly negative. */
    wh: { x: number; y: number };

    /**
     * Creates an empty rectangle (size 0) at the given point.
     * @param ctx - 2D context to draw on
     * @param point - Starting corner, in canvas coordinates
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

    /** Rebuilds the path and draws the filled, outlined rectangle. */
    draw(): void {
        this.ctx.fillStyle = this.fillColor;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;

        this.buildShape();
        this.ctx.fill(this.shape);
        this.ctx.stroke(this.shape);
    }

    /**
     * Tells whether a point is inside the rectangle.
     * @param x - X coordinate relative to the canvas
     * @param y - Y coordinate relative to the canvas
     */
    contains(x: number, y: number): boolean {
        return this.ctx.isPointInPath(this.shape, x, y);
    }
    
    /**
     * Translates the rectangle. Does not redraw the canvas.
     * @param dx - Horizontal offset, in pixels
     * @param dy - Vertical offset, in pixels
     */
    move(dx: number, dy: number): void {
        this.firstPoint = {x: this.firstPoint.x + dx, y: this.firstPoint.y + dy}
        this.buildShape();
    }

    /**
     * Resizes the rectangle so its opposite corner is at the given point.
     * Does not redraw the canvas.
     * @param x - X coordinate of the opposite corner, relative to the canvas
     * @param y - Y coordinate of the opposite corner, relative to the canvas
     */
    update(x: number, y: number): void {
        this.wh = { x: x - this.firstPoint.x, y: y - this.firstPoint.y};
        this.buildShape();
    }

    /**
     * Returns a new rectangle with the same position, size and style.
     * The copy is not added to the canvas.
     */
    duplicate(): CanvasItem {
        const item= new RectangleItem(this.ctx, this.firstPoint, this.fillColor, this.strokeColor, this.lineWidth);
        item.wh.x = this.wh.x;
        item.wh.y = this.wh.y;
        return item;
    }

    /**
     * Returns the smallest axis-aligned box containing the shape.
     * Uses `firstPoint` and `wh`, normalized since `wh` can be negative
     * (the rectangle may have been drawn to the left or upward).
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
        this.wh = {x: this.wh.x * sx, y: this.wh.y * sy};
        this.buildShape();
    }

    // Private helpers
    /** Rebuilds the rectangle path from its corner and size (firstPoint + wh). */
    private buildShape(): void {
        this.shape = new Path2D();
        this.shape.rect(this.firstPoint.x, this.firstPoint.y, this.wh.x, this.wh.y);
    }
}