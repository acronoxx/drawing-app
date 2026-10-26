import type { Point } from "../canvas/CanvasItem";
import { getHandleAt } from "../canvas/handles";
import { dispatch } from "../stores/dispatcher";
import { useItemStore } from "../stores/useItemStore";
import type { Mode } from "./Mode";

/** What a drag on the canvas is doing: nothing, moving the selection, or resizing it. */
type DragState = 'none' | 'moving' | 'scaling';

/**
 * Mode to select, move and resize shapes.
 *
 * Pressing the mouse selects the topmost shape under the cursor (or clears
 * the selection on an empty area), dragging moves that shape, and releasing
 * ends the move. Pressing one of the 8 handles of the selected shape and
 * dragging resizes it instead, the opposite handle staying fixed. The
 * selection itself is stored in the item store, so it remains after the
 * mouse is released.
 *
 * The mode reads the item store to find what is under the cursor, and only
 * sends actions to change it. It keeps nothing but the drag in progress.
 */
export class SelectMoveMode implements Mode {
    /** X position of the cursor at the last mouse event (canvas coordinates). */
    public lastMouseX: number;
    /** Y position of the cursor at the last mouse event (canvas coordinates). */
    public lastMouseY: number;
    /**
     * Drag in progress, from mouse down to mouse up. The shape, the handle and
     * the original shape of a resize are kept by the item store, not here.
     */
    public drag: DragState;

    constructor() {
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.drag = 'none';
    }

    /**
     * If the cursor is on a handle of the selected shape, starts resizing it.
     * Otherwise, selects the topmost shape under the cursor and starts moving
     * it; clicking on an empty area clears the selection and starts nothing.
     * @param point - Cursor position, in canvas coordinates
     * @param ctx - 2D context of the canvas, for hit tests
     */
    onMouseDown(point: Point, ctx: CanvasRenderingContext2D) {
        let handle = null;
        this.lastMouseX = point.x;
        this.lastMouseY = point.y;
        const { x, y } = point;

        const selectedItem = useItemStore.getState().selectedItem;
        if (selectedItem) {
            handle = getHandleAt(selectedItem.getBoundingBox(), x, y);
            if (handle) {
                this.drag = 'scaling'
                dispatch({ type: 'beginScale', handle: handle })
            }
        }

        if (!handle) {
            // Topmost shape under the cursor: search from the last drawn, -1 if none
            const items = useItemStore.getState().items;
            let id = -1;
            for (let i = items.length - 1; i >= 0; i--) {
                if (items[i].contains(ctx, x, y)) {
                    id = i;
                    break;
                }
            }
            this.drag = id == -1 ? 'none' : 'moving'
            dispatch({ type: 'select', id })
        }
    }

    /**
     * While moving, moves the selected shape by the distance the cursor
     * travelled since the last mouse event. While resizing, sends the cursor
     * position: the item store computes the new size from the original shape.
     * Does nothing if no drag is in progress (mouse button released).
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseMove(point: Point) {
        if (this.drag == 'moving') {
            const dx = point.x - this.lastMouseX
            const dy = point.y - this.lastMouseY
            dispatch({ type: 'move', dx, dy })
            this.lastMouseX = point.x;
            this.lastMouseY = point.y;
        }
        else if (this.drag == 'scaling'){
            dispatch({ type: 'scale', point })
        }
    }

    /**
     * Ends the move or the resize. The shape stays selected.
     */
    onMouseUp() {
        if (this.drag == 'scaling') {
            dispatch({ type: 'endScale' })
        }
        this.drag = 'none'
    }
}