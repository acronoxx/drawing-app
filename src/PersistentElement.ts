import type { CanvasItem } from "./canvas/CanvasItem";
import { HANDLES, HANDLE_SIZE, getHandlePosition } from "./canvas/handles";

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
 * Drawing model of the application.
 *
 * Stores every shape drawn on the canvas, the currently selected shape,
 * and the style applied to new shapes. The canvas itself only holds pixels:
 * this class is the source of truth, and `redraw()` renders it.
 */
export class PersistentElements {
    /** HTML canvas element the shapes are drawn on. */
    public canvas: HTMLCanvasElement;

    /** 2D rendering context used to draw on the canvas. */
    public ctx: CanvasRenderingContext2D;

    /**
     * Shapes on the canvas, in drawing order:
     * the first is drawn first (background), the last is on top.
     */
    public items: CanvasItem[];

    /** Currently selected shape, or null if nothing is selected. */
    public selectedItem: CanvasItem | null = null;

    /**
     * Fill color used for new shapes, as a hex string (e.g. "#0d00ff").
     * Not affected by editing the selected shape; restored in the
     * toolbar when the selection is cleared.
     */
    public fillColor: string;

    /** Outline color used for new shapes, as a hex string. */
    public strokeColor: string;

    /** Outline width used for new shapes, in pixels. */
    public lineWidth: number;

    /**
     * Called whenever the selection or the style shown in the toolbar changes,
     * so React can update the toolbar inputs. Set by App.
     */
    public onStyleChange: (() => void) | null = null;

    /**
     * @param canvas - Canvas element to draw on
     * @param ctx - 2D rendering context of the canvas
     * @param lineWidth - Initial outline width for new shapes, in pixels
     * @param fillColor - Initial fill color for new shapes, as a hex string
     * @param strokeColor - Initial outline color for new shapes, as a hex string
     */
    constructor(canvas:HTMLCanvasElement,
                ctx: CanvasRenderingContext2D,
                lineWidth: number,
                fillColor: string,
                strokeColor: string,
                ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.items = [];
        this.lineWidth = lineWidth;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
    }

    // Setters
    /**
     * Sets the selected shape, or clears the selection with null,
     * and notifies the toolbar.
     */
    setSelectedItem(selectedItem: CanvasItem | null){
        this.selectedItem = selectedItem;
        this.onStyleChange?.();
    }

    /** Sets the outline width used for new shapes, in pixels. */
    setLineWidth(lineWidth: number){
        this.lineWidth = lineWidth;
    }

    /** Sets the fill color used for new shapes (hex string). */
    setFillColor(fillColor: string){
        this.fillColor = fillColor;
    }

    /** Sets the outline color used for new shapes (hex string). */
    setStrokeColor(strokeColor: string){
        this.strokeColor = strokeColor;
    }

    // Style changes from the toolbar
    /**
     * Applies a fill color chosen in the toolbar: to the selected shape if
     * there is one (then redraws), otherwise to new shapes. Notifies the toolbar.
     * @param fillColor - New fill color (hex string)
     */
    applyFillColor(fillColor: string) {
        if (this.selectedItem) {
            this.selectedItem.fillColor = fillColor;
            this.redraw();
        } else {
            this.setFillColor(fillColor);
        }
        this.onStyleChange?.();
    }

    /**
     * Applies an outline color chosen in the toolbar: to the selected shape if
     * there is one (then redraws), otherwise to new shapes. Notifies the toolbar.
     * @param strokeColor - New outline color (hex string)
     */
    applyStrokeColor(strokeColor: string) {
        if (this.selectedItem) {
            this.selectedItem.strokeColor = strokeColor;
            this.redraw();
        } else {
            this.setStrokeColor(strokeColor);
        }
        this.onStyleChange?.();
    }

    /**
     * Applies an outline width chosen in the toolbar: to the selected shape if
     * there is one (then redraws), otherwise to new shapes. Notifies the toolbar.
     * @param lineWidth - New outline width, in pixels
     */
    applyLineWidth(lineWidth: number) {
        if (this.selectedItem) {
            this.selectedItem.lineWidth = lineWidth;
            this.redraw();
        } else {
            this.setLineWidth(lineWidth);
        }
        this.onStyleChange?.();
    }

    // Item management
    /**
     * Adds a shape on top of the others and selects it.
     * Does not redraw the canvas.
     * @param item - Shape to add
     */
    addItem(item: CanvasItem) {
        this.items.push(item);
        this.setSelectedItem(item);
    }

    /**
     * Replaces a shape by another one at the same position in `items`
     * (so at the same depth), and selects the new one.
     * Does nothing if `oldItem` is not on the canvas. Does not redraw the canvas.
     * @param oldItem - Shape currently on the canvas
     * @param newItem - Shape to put in its place
     */
    replaceItem(oldItem: CanvasItem, newItem: CanvasItem) {
        const index = this.items.indexOf(oldItem);
        if (index == -1) return;
        this.items[index] = newItem;
        this.setSelectedItem(newItem);
    }

    // Actions on the selected item
    /**
     * Removes the selected shape, clears the selection and redraws the canvas.
     * Does nothing if no shape is selected.
     */
    removeSelectedItem() {
        if (this.selectedItem) {
            const index = this.items.indexOf(this.selectedItem);
            if (index == -1) return;
            this.items.splice(index, 1);
            this.setSelectedItem(null);
            this.redraw();
        }
    }

    /**
     * Clones the selected shape with a small offset (10px right and down),
     * adds the clone on top, selects it and redraws the canvas.
     * Does nothing if no shape is selected.
     */
    duplicateSelectedItem() {
        if (this.selectedItem) {
            const item = this.selectedItem.duplicate();
            item.move(10, 10);
            this.addItem(item);
            this.redraw();
        }
    }

    /**
     * Moves the selected shape one step toward the background
     * (swaps it with the previous item in `items`) and redraws the canvas.
     * Does nothing if no shape is selected or if it is already at the bottom.
     */
    sendSelectedItemBackward() {
        if (this.selectedItem) {
            const index = this.items.indexOf(this.selectedItem);
            if (index <= 0) return;

            const precItem = this.items[index - 1];
            this.items[index - 1] = this.selectedItem;
            this.items[index] = precItem;
            this.redraw();
        }
    }

    /**
     * Moves the selected shape one step toward the foreground
     * (swaps it with the next item in `items`) and redraws the canvas.
     * Does nothing if no shape is selected or if it is already on top.
     */
    bringSelectedItemForward() {
        if (this.selectedItem) {
            const index = this.items.indexOf(this.selectedItem);
            if (index == -1 || index == this.items.length - 1) return;

            const nextItem = this.items[index + 1];
            this.items[index + 1] = this.selectedItem;
            this.items[index] = nextItem;
            this.redraw();
        }
    }

    // Queries
    /** Style to show in the toolbar: the selected shape's, or the defaults for new shapes. */
    getCurrentStyle(): ShapeStyle {
        // Both a shape and this model have fillColor, strokeColor and lineWidth
        const source = this.selectedItem ?? this;
        return { fillColor: source.fillColor, strokeColor: source.strokeColor, lineWidth: source.lineWidth };
    }

    /**
     * Returns the topmost shape containing the given point.
     * @param x - X coordinate relative to the canvas
     * @param y - Y coordinate relative to the canvas
     * @returns The shape under the point, or null if none
     */
    getItemAt(x: number, y: number): CanvasItem | null {
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].contains(x,y)) {
                return this.items[i]
            }
        }
        return null;
    }

    /**
     * Converts viewport coordinates to coordinates relative to the canvas.
     * @param x - X coordinate in the viewport (e.g. `event.clientX`)
     * @param y - Y coordinate in the viewport (e.g. `event.clientY`)
     * @returns The point relative to the top-left corner of the canvas
     */
    getMousePos(x: number, y: number) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: x - rect.left,
            y: y - rect.top
        };
    }

    // Rendering
    /**
     * Clears the canvas, draws every shape again from bottom to top,
     * then draws the selection (bounding box and handles) on top of everything.
     */
    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.items.forEach(item => item.draw());
        if (this.selectedItem) this.drawSelection(this.selectedItem);
    }

    /**
     * Draws the dashed bounding box of the selected shape and its 8 resize
     * handles (small squares centered on the handle positions).
     * @param item - Selected shape
     */
    private drawSelection(item: CanvasItem): void {
        const box = item.getBoundingBox();
        this.ctx.save();
        this.ctx.strokeStyle = 'rgb(242, 255, 54)';
        this.ctx.lineWidth = 5;
        this.ctx.setLineDash([6, 4]);
        this.ctx.strokeRect(box.x, box.y, box.width, box.height);
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        for (const handle of HANDLES) {
            const pos = getHandlePosition(box, handle);
            const left = pos.x - HANDLE_SIZE / 2;
            const top = pos.y - HANDLE_SIZE / 2;
            this.ctx.fillRect(left, top, HANDLE_SIZE, HANDLE_SIZE);
            this.ctx.strokeRect(left, top, HANDLE_SIZE, HANDLE_SIZE);
        }
        this.ctx.restore();
    }
}