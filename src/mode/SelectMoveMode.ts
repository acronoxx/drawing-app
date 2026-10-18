import type { PersistentElements } from "../PersistentElement";
import type { CanvasItem } from "../canvas/CanvasItem";
import type { Handle } from "../canvas/handles";
import { getHandleAt, getHandlePosition } from "../canvas/handles";
import type { Mode } from "./Mode";

/**
 * Mode to select, move and resize shapes.
 *
 * Pressing the mouse selects the topmost shape under the cursor (or clears
 * the selection on an empty area), dragging moves that shape, and releasing
 * ends the move. Pressing one of the 8 handles of the selected shape and
 * dragging resizes it instead, the opposite handle staying fixed. The
 * selection itself is stored in the drawing model, so it remains after the
 * mouse is released.
 */
export class SelectMoveMode implements Mode {
    /** Drawing model holding the shapes and the selection. */
    public persistentElements: PersistentElements;
    /** X position of the cursor at the last mouse event (viewport coordinates). */
    public lastMouseX: number;
    /** Y position of the cursor at the last mouse event (viewport coordinates). */
    public lastMouseY: number;
    /** Shape being dragged (moved or resized), or null when no drag is in progress. */
    public item: CanvasItem | null;

    /** Handle being dragged to resize the shape, or null when moving it. */
    public handle: Handle | null;

    /**
     * Shape as it was when the resize started. Never modified: each mouse move
     * scales a new copy of it, so the resize does not accumulate errors.
     */
    public originalItem : CanvasItem | null;
    
    /**
     * @param persistentElements - Drawing model holding the shapes and the selection
     */
    constructor(persistentElements: PersistentElements){
        this.persistentElements = persistentElements;
        this.item = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.handle = null;
        this.originalItem = this.item;
    }

    /**
     * If the cursor is on a handle of the selected shape, starts resizing it.
     * Otherwise, selects the topmost shape under the cursor (clicking on an
     * empty area clears the selection), starts moving it, and redraws.
     * @param event - Mouse event on the canvas
     */
    onMouseDown(event: React.MouseEvent){
        this.handle = null;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);

        const selectedItem = this.persistentElements.selectedItem;
        if (selectedItem) {
            this.handle = getHandleAt(selectedItem.getBoundingBox(), x, y);
            if (this.handle) {
                this.item = selectedItem;
                this.originalItem = selectedItem.duplicate();
            }
        }

        if (!this.handle){
            this.item = this.persistentElements.getItemAt(x,y);
            this.persistentElements.setSelectedItem(this.item);
            this.persistentElements.redraw();
        }
    }

    /**
     * Moves the dragged shape by the distance the cursor travelled since
     * the last mouse event, or, when a handle is dragged, resizes it so the
     * handle follows the cursor while the opposite handle stays fixed
     * (dragging past the fixed handle flips the shape). Then redraws.
     * Does nothing if no shape is being dragged.
     * @param event - Mouse event on the canvas
     */
    onMouseMove(event: React.MouseEvent){
        if (!this.item) return;

        if (!this.handle) {
            this.item.move(event.clientX - this.lastMouseX, event.clientY - this.lastMouseY);
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            this.persistentElements.redraw();
        }
        else {
            if (!this.originalItem) return;
            const box = this.originalItem.getBoundingBox();
            const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
            const start = getHandlePosition(box, this.handle);
            const fixed = getHandlePosition(box, { fx: 1 - this.handle.fx, fy: 1 - this.handle.fy });
            const scaleFactor = {
                x : (start.x === fixed.x) ? 1 : (x - fixed.x) / (start.x - fixed.x),
                y: (start.y === fixed.y) ? 1 : (y - fixed.y) / (start.y - fixed.y)
            }
            const resizedItem = this.originalItem.duplicate();
            resizedItem.scale(scaleFactor.x, scaleFactor.y, fixed);
            this.persistentElements.replaceItem(this.item, resizedItem);
            this.item = resizedItem;
            this.persistentElements.redraw();
        }
    }

    /**
     * Ends the move or the resize. The shape stays selected.
     */
    onMouseUp(){
        if (!this.item) return;
        this.item = null;
        this.handle = null;
        this.originalItem = null;
    }
}