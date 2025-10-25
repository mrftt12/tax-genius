import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calculator, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Home,
  Upload,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/AuthProvider.jsx";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Tax Interview",
    url: createPageUrl("Interview"),
    icon: FileText,
  },
  {
    title: "Review & Calculate",
    url: createPageUrl("Review"),
    icon: CheckSquare,
  },
  {
    title: "Tax Forms",
    url: createPageUrl("Forms"),
    icon: Calculator,
  },
  {
    title: "Documents",
    url: createPageUrl("Documents"),
    icon: Upload,
  },
  {
    title: "AI Assistant",
    url: createPageUrl("AIAssistant"),
    icon: MessageSquare,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary-green: #059669;
            --primary-green-light: #10b981;
            --primary-green-dark: #047857;
            --silver: #64748b;
            --silver-light: #94a3b8;
            --silver-dark: #475569;
            --background-gray: #f8fafc;
            --card-white: #ffffff;
          }
          
          .sidebar-gradient {
            background: linear-gradient(135deg, var(--card-white) 0%, #f1f5f9 100%);
          }
          
          .accent-gradient {
            background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-light) 100%);
          }
        `}
      </style>
      <div className="min-h-screen flex w-full" style={{backgroundColor: 'var(--background-gray)'}}>
        <Sidebar className="border-r border-gray-200 sidebar-gradient">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 accent-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{color: 'var(--primary-green-dark)'}}>TaxGenius</h2>
                <p className="text-sm" style={{color: 'var(--silver)'}}>AI Tax Preparation</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-3" 
                style={{color: 'var(--silver)'}}>
                Tax Preparation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl mb-1 transition-all duration-200 ${
                          location.pathname === item.url 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 border shadow-sm' 
                            : 'hover:bg-gray-50 text-gray-700 hover:text-emerald-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-3"
                style={{color: 'var(--silver)'}}>
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 pb-2">
                  <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">Logout</Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold" style={{color: 'var(--primary-green-dark)'}}>TaxGenius</h1>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            {children}
          </div>

          <footer className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600">
              <div>
                © {new Date().getFullYear()} TaxGenius. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <Link to={createPageUrl('Terms')} className="hover:text-emerald-700">Terms & Conditions</Link>
                <span className="text-gray-300">|</span>
                <Link to={createPageUrl('Privacy')} className="hover:text-emerald-700">Privacy Policy</Link>
                <span className="text-gray-300">|</span>
                <Link to={createPageUrl('Contact')} className="hover:text-emerald-700">Contact</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}