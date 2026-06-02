import React, { createContext, useContext, useRef } from 'react';

const DrawerContext = createContext(null);

export function DrawerProvider({ children }) {
  const openRef = useRef(null);
  return (
    <DrawerContext.Provider value={openRef}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawerMenu() {
  return useContext(DrawerContext);
}
