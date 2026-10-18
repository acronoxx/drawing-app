import type { BoundingBox, CanvasItem, Point } from "./CanvasItem";
import { scalePoint } from "./handles";

/**
 * Straight line segment, defined by its two end points.
 *
 * A line has no inside: it is only stroked (never filled), and hit testing
 * is done on its stroke rather than its area.
 */
export class LineItem implements CanvasItem {
    /** 2D context the line is drawn on. */
    public ctx: CanvasRenderingContext2D;
    /** Fill color, as a hex string. Unused (a line is not filled), required by CanvasItem. */
    public fillColor: string;
    /** Line color, as a hex string. */
    public strokeColor: string;
    /** Line width, in pixels. */
    public lineWidth: number;
    /** Path of the line, used to draw it and to test hits. */
    public shape: Path2D;

    /** Point where the drawing started, in canvas coordinates. */
    startPoint: { x: number; y: number };
    /** Other end of the line, in canvas coordinates. */
    endPoint : { x: number; y: number };

    /**
     * Creates a line of length 0 at the given point.
     * @param ctx - 2D context to draw on
     * @param point - Starting point, in canvas coordinates
     * @param fillColor - Fill color (hex string), unused for a line
     * @param strokeColor - Line color (hex string)
     * @param lineWidth - Line width, in pixels
     */
    constructor(
        ctx: CanvasRenderingContext2D,
        point: { x: number; y: number },
        fillColor: string,
        strokeColor: string,
        lineWidth: number) {
        this.ctx = ctx;
        this.startPoint = point;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.shape = new Path2D();
        this.endPoint = point;
    }

    /** Rebuilds the path and strokes the line. */
    draw(): void {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;

        this.buildShape();
        this.ctx.stroke(this.shape);
    }

    /**
     * Tells whether a point is on the line.
     * Uses a stroke at least 10px wide so thin lines remain easy to click.
     * @param x - X coordinate relative to the canvas
     * @param y - Y coordinate relative to the canvas
     */
    contains(x: number, y: number): boolean {
        this.ctx.lineWidth = Math.max(this.lineWidth, 10);
        return this.ctx.isPointInStroke(this.shape, x, y);
    }
    
    /**
     * Translates both ends of the line. Does not redraw the canvas.
     * @param dx - Horizontal offset, in pixels
     * @param dy - Vertical offset, in pixels
     */
    move(dx: number, dy: number): void {
        this.startPoint = {x: this.startPoint.x + dx, y: this.startPoint.y + dy}
        this.endPoint = {x: this.endPoint.x + dx, y: this.endPoint.y + dy}
        this.buildShape();
    }

    /**
     * Moves the end point of the line to the given point.
     * Does not redraw the canvas.
     * @param x - X coordinate of the end point, relative to the canvas
     * @param y - Y coordinate of the end point, relative to the canvas
     */
    update(x: number, y: number): void {
        this.endPoint = { x: x, y: y};
        this.buildShape();
    }

    /**
     * Returns a new line with the same end points and style.
     * The copy is not added to the canvas.
     */
    duplicate(): CanvasItem {
        const item = new LineItem(this.ctx, this.startPoint, this.fillColor, this.strokeColor, this.lineWidth)
        item.endPoint = this.endPoint;
        return item;
    }

    /**
     * Returns the smallest axis-aligned box containing the shape.
     * Spans from the smallest to the largest coordinates of the two end points.
     */
    getBoundingBox(): BoundingBox {
        const x = Math.min(this.startPoint.x, this.endPoint.x);
        const y = Math.min(this.startPoint.y, this.endPoint.y);
        const width = Math.abs(this.endPoint.x - this.startPoint.x);
        const height = Math.abs(this.endPoint.y - this.startPoint.y);
        return {
            x: x,
            y: y,
            width : width,
            height: height
        }
    }

    /**
     * Scales the shape relative to a fixed point (negative factors flip it).
     * Scales both end points.
     * Does not redraw the canvas.
     * @param sx - Horizontal scale factor
     * @param sy - Vertical scale factor
     * @param fixed - Point that does not move, in canvas coordinates
     */
    scale(sx: number, sy: number, fixed: Point): void {
        this.startPoint = scalePoint(this.startPoint, sx, sy, fixed);
        this.endPoint = scalePoint(this.endPoint, sx, sy, fixed);
        this.buildShape();
    }

    // Private helpers
    /** Rebuilds the line path from its two end points. */
    private buildShape(): void {
        this.shape = new Path2D();
        this.shape.moveTo(this.startPoint.x, this.startPoint.y);
        this.shape.lineTo(this.endPoint.x, this.endPoint.y);
    }
}