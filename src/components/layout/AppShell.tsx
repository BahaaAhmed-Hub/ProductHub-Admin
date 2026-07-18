import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-canvas">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto scroll-thin p-6 bg-canvas2/30">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
