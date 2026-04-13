'use client';
import { useState, useCallback, useRef } from 'react';

export interface NodePos { x: number; y: number; }

export function useCanvas() {
  const [pan, setPan] = useState<NodePos>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const lastMouse = useRef<NodePos>({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + scroll = zoom
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom(z => Math.min(Math.max(z * delta, 0.3), 2));
    } else {
      // Normal scroll = pan (up/down/left/right)
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  const resetView = useCallback(() => { setPan({ x: 0, y: 0 }); setZoom(1); }, []);

  return { pan, zoom, onMouseDown, onMouseMove, onMouseUp, onWheel, resetView };
}

export function useNodeDrag(onMove: (id: string, pos: NodePos) => void) {
  const dragging = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const startDrag = useCallback((id: string, origPos: NodePos, e: React.MouseEvent, zoom: number) => {
    e.stopPropagation();
    dragging.current = { id, startX: e.clientX, startY: e.clientY, origX: origPos.x, origY: origPos.y };

    const handleMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const dx = (ev.clientX - dragging.current.startX) / zoom;
      const dy = (ev.clientY - dragging.current.startY) / zoom;
      onMove(dragging.current.id, { x: dragging.current.origX + dx, y: dragging.current.origY + dy });
    };

    const handleUp = () => {
      dragging.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [onMove, ]);

  return { startDrag };
}
