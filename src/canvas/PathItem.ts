import type { BoundingBox, CanvasItem, Point } from "./CanvasItem";
import { scalePoint } from "./handles";

/**
 * Free-hand path drawn with the Pencil, defined by the list of points
 * the cursor went through.
 *
 * The points are joined by tiny straight segments in a single path, so the
 * whole stroke is one shape (selected, moved, cloned or deleted at once).
 * Like a line, a path has no inside: it is only stroked, never filled.
 */
export class PathItem implements CanvasItem {
    /** 2D context the path is drawn on. */
    public ctx: CanvasRenderingContext2D;
    /** Fill color, as a hex string. Unused (a path is not filled), required by CanvasItem. */
    public fillColor: string;
    /** Stroke color, as a hex string. */
    public strokeColor: string;
    /** Stroke width, in pixels. */
    public lineWidth: number;
    /** Path joining all the points, used to draw the stroke and to test hits. */
    public shape: Path2D;

    /** Points of the stroke in drawing order, in canvas coordinates. */
    points: { x: number; y: number }[];

    /**
     * Creates a path containing only its starting point.
     * @param ctx - 2D context to draw on
     * @param point - Starting point, in canvas coordinates
     * @param fillColor - Fill color (hex string), unused for a path
     * @param strokeColor - Stroke color (hex string)
     * @param lineWidth - Stroke width, in pixels
     */
    constructor(
        ctx: CanvasRenderingContext2D,
        point: { x: number; y: number },
        fillColor: string,
        strokeColor: string,
        lineWidth: number) {
        this.ctx = ctx;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.shape = new Path2D();
        this.points = [{ ...point }];
    }

    /** Rebuilds the path and strokes it. */
    draw(): void {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;

        this.buildShape();
        this.ctx.stroke(this.shape);
    }

    /**
     * Tells whether a point is on the stroke.
     * Uses a stroke at least 10px wide so thin paths remain easy to click.
     * @param x - X coordinate relative to the canvas
     * @param y - Y coordinate relative to the canvas
     */
    contains(x: number, y: number): boolean {
        this.ctx.lineWidth = Math.max(this.lineWidth, 10);
        return this.ctx.isPointInStroke(this.shape, x, y);
    }

    /**
     * Translates every point of the path. Does not redraw the canvas.
     * @param dx - Horizontal offset, in pixels
     * @param dy - Vertical offset, in pixels
     */
    move(dx: number, dy: number): void {
        this.points = this.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
        this.buildShape();
    }

    /**
     * Adds a point at the end of the path (the cursor moved while drawing).
     * Does not redraw the canvas.
     * @param x - X coordinate of the new point, relative to the canvas
     * @param y - Y coordinate of the new point, relative to the canvas
     */
    update(x: number, y: number): void {
        this.points.push({ x, y });
        this.buildShape();
    }

    /**
     * Returns a new path with the same points and style.
     * The points are copied, so moving the copy does not move the original.
     * The copy is not added to the canvas.
     */
    duplicate(): CanvasItem {
        const item = new PathItem(this.ctx, this.points[0], this.fillColor, this.strokeColor, this.lineWidth);
        item.points = this.points.map(p => ({ ...p }));
        return item;
    }

    /**
     * Returns the smallest axis-aligned box containing the shape.
     * Spans from the smallest to the largest coordinates of all the points.
     */
    getBoundingBox(): BoundingBox {
        const xArray = this.points.map(p => p.x);
        const yArray = this.points.map(p => p.y);
        const x = Math.min(...xArray);
        const y = Math.min(...yArray);
        const width = Math.max(...xArray) - x;
        const height = Math.max(...yArray) - y;
        return {
            x: x,
            y: y,
            width : width,
            height: height
        }
    }

    /**
     * Scales the shape relative to a fixed point (negative factors flip it).
     * Scales every point of the path.
     * Does not redraw the canvas.
     * @param sx - Horizontal scale factor
     * @param sy - Vertical scale factor
     * @param fixed - Point that does not move, in canvas coordinates
     */
    scale(sx: number, sy: number, fixed: Point): void {
        this.points = this.points.map(p => scalePoint(p, sx, sy, fixed));
        this.buildShape();
    }

    // Private helpers
    /** Rebuilds the path: moves to the first point, then draws a segment to each following point. */
    private buildShape(): void {
        this.shape = new Path2D();
        this.shape.moveTo(this.points[0].x, this.points[0].y);
        for (const p of this.points.slice(1)) {
            this.shape.lineTo(p.x, p.y);
        }
    }
}
