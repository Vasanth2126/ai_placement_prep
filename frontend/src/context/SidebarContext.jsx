import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext({
  isOpen: true,
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
});

export const SidebarProvider = ({ children }) => {
  // Default to true (open), preserve user preference
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_open', String(next));
      return next;
    });
  };

  const openSidebar = () => {
    setIsOpen(true);
    localStorage.setItem('sidebar_open', 'true');
  };

  const closeSidebar = () => {
    setIsOpen(false);
    localStorage.setItem('sidebar_open', 'false');
  };

  // Keyboard shortcut: Ctrl + B or Cmd + B toggles sidebar (ChatGPT & VS Code standard)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
