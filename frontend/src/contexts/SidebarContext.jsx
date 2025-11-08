import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	return (
		<SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
			{children}
		</SidebarContext.Provider>
	);
}

export function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error('useSidebar must be used within SidebarProvider');
	}
	return context;
}

