'use client';
import { useState, useCallback, useRef } from 'react';

export interface NodePos { x: number; y: number; }

export function useCanvas() {
  const [pan, setPan] = useState<NodePos>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const lastPos = useRef<NodePos>({ x: 0, y: 0 });

  // Mouse pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === e.currentTarget)) {
      isPanning.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  // Scroll = pan, Ctrl+scroll = zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom(z => Math.min(Math.max(z * delta, 0.3), 2));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  // Touch pan (mobile)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPanning.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const onTouchEnd = useCallback(() => { isPanning.current = false; }, []);

  const resetView = useCallback(() => { setPan({ x: 0, y: 0 }); setZoom(1); }, []);

  return { pan, zoom, onMouseDown, onMouseMove, onMouseUp, onWheel, onTouchStart, onTouchMove, onTouchEnd, resetView };
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
  }, [onMove]);

  return { startDrag };
}
