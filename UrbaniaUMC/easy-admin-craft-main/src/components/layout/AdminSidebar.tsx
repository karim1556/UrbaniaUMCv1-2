import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  Home,
  Calendar,
  Users,
  BookOpen,
  HandHelping,
  PhoneCall,
  IndianRupee,
  QrCode
} from 'lucide-react';

// Menu items based on the flow diagrams
const menuItems = [
  { title: "Dashboard", path: "/admin", icon: Home },
  { title: "User Management", path: "/admin/users", icon: Users },
  { title: "Events", path: "/admin/events", icon: Calendar },
  { title: "Event Check-in", path: "/admin/check-in", icon: QrCode },
  { title: "Services", path: "/admin/services", icon: HandHelping },
  { title: "Requests", path: "/admin/requests", icon: PhoneCall },
  { title: "Education", path: "/admin/education", icon: BookOpen },
  { title: "Volunteering", path: "/admin/volunteering", icon: HandHelping },
  { title: "Donations", path: "/admin/donations", icon: IndianRupee },
];

const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center justify-center border-b">
        <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `flex items-center space-x-3 ${isActive ? 'bg-sidebar-accent text-primary font-medium' : ''}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
