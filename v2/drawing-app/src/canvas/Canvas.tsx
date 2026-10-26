import { useEffect, useRef, useState } from 'react';

import { dispatch } from '../stores/dispatcher';
import type { CanvasItem, Point } from './CanvasItem';
import { HANDLES, HANDLE_SIZE, getHandlePosition } from './handles';

import { useItemStore } from '../stores/useItemStore';
import { useToolStore } from '../stores/useToolStore';
import './Canvas.css';

/** Resizes the canvas so its drawing buffer matches its displayed size. */
function resizeCanvas(canvas: HTMLCanvasElement) {
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
}

/**
 * Draws the dashed bounding box of the selected shape and its 8 resize
 * handles (small squares centered on the handle positions).
 * @param ctx - 2D context to draw on
 * @param item - Selected shape
 */
function drawSelection(ctx: CanvasRenderingContext2D, item: CanvasItem): void {
    const box = item.getBoundingBox();
    ctx.save();
    ctx.strokeStyle = 'rgb(242, 255, 54)';
    ctx.lineWidth = 5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    for (const handle of HANDLES) {
        const pos = getHandlePosition(box, handle);
        const left = pos.x - HANDLE_SIZE / 2;
        const top = pos.y - HANDLE_SIZE / 2;
        ctx.fillRect(left, top, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeRect(left, top, HANDLE_SIZE, HANDLE_SIZE);
    }
    ctx.restore();
}

/**
 * Drawing area: draws the shapes of the item store, forwards the mouse events
 * to the current mode of the tool store, and uses the mouse wheel to change
 * the depth of the selected shape. Keeps its size matched to the window.
 */
function Canvas() {
    // --- Stores ---
    const items = useItemStore((s) => s.items)
    const selectedItem = useItemStore((s) => s.selectedItem)
    const mode = useToolStore((s) => s.mode)

    // --- State ---
    // Size of the drawing buffer. Not used in the render, but a resize clears
    // the canvas, so changing it must trigger a redraw like the stores do.
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // --- Refs ---
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // --- Effects ---
    // Once the canvas is created: keep its drawing buffer sized to its
    // displayed size, now and whenever the window is resized
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        function handleResize() {
            if (!canvas) return;
            resizeCanvas(canvas);
            setCanvasSize({ width: canvas.width, height: canvas.height });
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Redraw whenever the shapes, the selection or the size change: the canvas
    // only holds pixels, so a React render alone would not update it.
    // Clears the canvas, draws every shape from bottom to top, then the
    // selection (bounding box and handles) on top of everything.
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        items.forEach(item => item.draw(ctx));
        if (selectedItem) drawSelection(ctx, selectedItem);
    }, [items, selectedItem, canvasSize]);

    // --- Handlers ---
    /**
     * Converts a mouse event on the canvas to a position relative to the canvas,
     * then gives it to a mode handler with the 2D context of the canvas.
     * @param event - Mouse event on the canvas
     * @param handler - Mode method to call
     */
    function handleMouse(
        event: React.MouseEvent<HTMLCanvasElement>,
        handler: (point: Point, ctx: CanvasRenderingContext2D) => void
    ) {
        const ctx = event.currentTarget.getContext("2d");
        if (!ctx) return;
        const rect = event.currentTarget.getBoundingClientRect();
        handler({ x: event.clientX - rect.left, y: event.clientY - rect.top }, ctx);
    }

    /** Changes the depth of the selected shape with the mouse wheel. */
    function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
        if (e.deltaY < 0) dispatch({ type: 'bringForward' })
        else if (e.deltaY > 0) dispatch({ type: 'sendBackward' })
    }

    // --- Render ---
    return (
        <div id="div-canvas">
            <canvas
                id="canvas"
                ref={canvasRef}
                onMouseDown={(event) => handleMouse(event, (point, ctx) => mode.onMouseDown(point, ctx))}
                onMouseMove={(event) => handleMouse(event, (point, ctx) => mode.onMouseMove(point, ctx))}
                onMouseUp={(event) => handleMouse(event, (point, ctx) => mode.onMouseUp(point, ctx))}
                onWheel={(event) => handleWheel(event)}
            />
        </div>
    )
}

export default Canvas;
