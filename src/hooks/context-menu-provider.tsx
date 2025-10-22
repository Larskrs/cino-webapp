"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
  type ReactNode,
} from "react";

export interface ContextMenuState<T = any> {
  isOpen: boolean;
  x: number;
  y: number;
  data: T | null;
  render?: (data: T, close: () => void) => ReactNode;
}

interface ContextMenuContextValue<T = any> {
  openContextMenu: (
    data: T,
    e: MouseEvent,
    render: (data: T, close: () => void) => ReactNode
  ) => void;
  closeContextMenu: () => void;
  contextMenu: ContextMenuState<T>;
}

const ContextMenuContext = createContext<ContextMenuContextValue<any> | null>(null);

/* -------------------------------------------------------------------------- */
/*                                   Provider                                 */
/* -------------------------------------------------------------------------- */

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    data: null,
    render: undefined,
  });

  const openContextMenu = useCallback(
    <T,>(
      data: T,
      e: MouseEvent,
      render: (data: T, close: () => void) => ReactNode
    ) => {
      e.preventDefault();
      e.stopPropagation();

      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        data,
        render,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Auto close on outside click or Escape
  useEffect(() => {
    if (!contextMenu.isOpen) return;

    const handleClick = () => closeContextMenu();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu();
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  return (
    <ContextMenuContext.Provider value={{ openContextMenu, closeContextMenu, contextMenu }}>
      {children}
      {contextMenu.isOpen && contextMenu.render && (
        <div
          className="absolute z-[9999]"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          {contextMenu.render(contextMenu.data, closeContextMenu)}
        </div>
      )}
    </ContextMenuContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Hook                                    */
/* -------------------------------------------------------------------------- */

export function useContextMenu<T = any>() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx)
    throw new Error("useContextMenu must be used inside a <ContextMenuProvider>");
  return ctx as ContextMenuContextValue<T>;
}
