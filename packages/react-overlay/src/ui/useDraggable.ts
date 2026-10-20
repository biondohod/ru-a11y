import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';

interface Offset {
  x: number;
  y: number;
}

interface DragStart {
  pointer: Offset;
  offset: Offset;
}

/**
 * Minimal drag-and-drop: attach `onMouseDown` to the drag handle and apply
 * `offset` as a translate transform. Presses on buttons inside the handle are ignored.
 */
export function useDraggable(initialOffset: Offset = { x: 0, y: 0 }) {
  const [offset, setOffset] = useState(initialOffset);
  const dragStart = useRef<DragStart | null>(null);

  const onMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      if ((event.target as HTMLElement).closest('button')) return;

      event.preventDefault();
      dragStart.current = { pointer: { x: event.clientX, y: event.clientY }, offset };
    },
    [offset],
  );

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const start = dragStart.current;
      if (!start) return;

      setOffset({
        x: start.offset.x + event.clientX - start.pointer.x,
        y: start.offset.y + event.clientY - start.pointer.y,
      });
    };

    const onMouseUp = () => {
      dragStart.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return { offset, onMouseDown };
}
