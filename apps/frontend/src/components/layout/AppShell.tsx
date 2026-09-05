import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  currentView: string;
  activeRole: 'SUPER_ADMIN' | 'ADMIN_CLINIC' | 'PROFESIONAL' | 'RECEPCION' | 'PACIENTE';
  onNavigate: (view: string) => void;
  onRoleChange?: (role: 'SUPER_ADMIN' | 'ADMIN_CLINIC' | 'PROFESIONAL' | 'RECEPCION' | 'PACIENTE') => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  activeRole,
  onNavigate,
  onRoleChange,
  onLogout,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed/Collapsible Modern Sidebar (strictly filtered by activeRole) */}
      <Sidebar
        currentView={currentView}
        activeRole={activeRole}
        onNavigate={onNavigate}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          currentView={currentView}
          activeRole={activeRole}
          onRoleChange={onRoleChange}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onLogout={onLogout}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 sm:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
