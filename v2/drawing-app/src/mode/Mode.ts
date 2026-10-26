import type { Point } from "../canvas/CanvasItem";

/**
 * Interaction mode of the canvas (State design pattern).
 *
 * Each tool of the toolbar (select/move, rectangle, ellipse, line, pencil)
 * is a class implementing this interface. A mode turns the mouse events of
 * the canvas into actions; it never modifies the stores itself.
 *
 * The canvas converts the cursor position before calling the mode, so a mode
 * only works with canvas coordinates and knows nothing about the DOM events.
 */
export interface Mode {
    /**
     * Handles a mouse button press on the canvas.
     * @param point - Cursor position, in canvas coordinates
     * @param ctx - 2D context of the canvas, for hit tests
     */
    onMouseDown(point: Point, ctx: CanvasRenderingContext2D): void;

    /**
     * Handles a mouse move over the canvas.
     * @param point - Cursor position, in canvas coordinates
     * @param ctx - 2D context of the canvas, for hit tests
     */
    onMouseMove(point: Point, ctx: CanvasRenderingContext2D): void;

    /**
     * Handles a mouse button release on the canvas.
     * @param point - Cursor position, in canvas coordinates
     * @param ctx - 2D context of the canvas, for hit tests
     */
    onMouseUp(point: Point, ctx: CanvasRenderingContext2D): void;
}

/** Name of each mode, as sent in a `changeMode` action. */
export type ModeKind = "selectMove" | "pencil" | "line" | "rectangle" | "ellipse"
