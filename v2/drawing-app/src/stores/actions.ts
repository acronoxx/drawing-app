import type { Point, ShapeKind, ShapeStyle } from "../canvas/CanvasItem"
import type { Handle } from "../canvas/handles"
import type { ModeKind } from "../mode/Mode"

/**
 * Actions handled by the tool store: current mode and style of new shapes.
 * They never modify a shape already on the canvas.
 */
type ToolAction =
    /** Picks another tool in the toolbar. */
    { type: 'changeMode', mode: ModeKind } |
    /** Sets the fill color of new shapes (hex string). */
    { type: 'changeToolFillColor', color: string } |
    /** Sets the outline color of new shapes (hex string). */
    { type: 'changeToolStrokeColor', color: string } |
    /** Sets the outline width of new shapes, in pixels. */
    { type: 'changeToolLineWidth', lineWidth: number }

/**
 * Actions handled by the item store: shapes on the canvas and selection.
 * Unless stated otherwise, they apply to the selected shape and do nothing
 * if no shape is selected. Points are in canvas coordinates.
 */
type ItemAction =
    /** Creates a shape of the given kind at a point, adds it on top and selects it. */
    { type: 'add', kind: ShapeKind, point: Point, style: ShapeStyle } |
    /** Selects the shape at an index of the items (found by the mode), or clears the selection with -1. */
    { type: 'select', id : number } |
    /** Translates the selected shape, in pixels. */
    { type: 'move', dx: number, dy: number } |
    /** Updates the shape being drawn from the current cursor position. */
    { type: 'update', point: Point } |
    /** Moves the selected shape one step toward the foreground. */
    { type: 'bringForward' } |
    /** Moves the selected shape one step toward the background. */
    { type: 'sendBackward' } |
    /** Starts resizing the selected shape by dragging one of its handles. */
    { type: 'beginScale', handle: Handle } |
    /**
     * Resizes the shape so the dragged handle follows the cursor,
     * the opposite handle staying fixed. Only between `beginScale` and `endScale`.
     */
    { type: 'scale', point: Point } |
    /** Ends the resize started by `beginScale`. */
    { type: 'endScale' } |
    /** Removes the selected shape and clears the selection. */
    { type: 'delete' } |
    /** Clones the selected shape with a small offset, adds the clone on top and selects it. */
    { type: 'clone' } |
    /** Sets the fill color of the selected shape (hex string). */
    { type: 'changeSelectedFillColor', color: string } |
    /** Sets the outline color of the selected shape (hex string). */
    { type: 'changeSelectedStrokeColor', color: string } |
    /** Sets the outline width of the selected shape, in pixels. */
    { type: 'changeSelectedLineWidth', lineWidth: number }

/**
 * Every action of the application (Flux pattern).
 *
 * An action describes what the user did, as plain data. Views send it to the
 * dispatcher, which forwards it to every store: each store handles the
 * actions about its own state and ignores the others.
 */
export type Action = ToolAction | ItemAction
