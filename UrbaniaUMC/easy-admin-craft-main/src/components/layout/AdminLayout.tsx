import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from './AdminSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
        <AdminSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/80 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-md">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 relative hover:bg-primary/10"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white">
                    <UserCircle className="h-5 w-5" />
                  </div>
                </Button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-card rounded-lg shadow-lg border animate-fade-in z-50">
                    <div className="px-4 py-2 text-sm border-b">
                      <p className="font-medium">{admin?.username || 'Admin User'}</p>
                      <p className="text-muted-foreground text-xs">{admin?.email || 'admin@example.com'}</p>
                    </div>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted text-left"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
