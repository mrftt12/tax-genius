import * as React from "react";
import { cn } from "@/utils";
import { Menu } from "lucide-react";

const SidebarContext = React.createContext({ open: true, setOpen: () => {} });

export function SidebarProvider({ children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ className, children, ...props }) {
  const { open } = React.useContext(SidebarContext);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        open ? "w-64" : "w-0 overflow-hidden",
        "md:w-64",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarContent({ className, children, ...props }) {
  return (
    <div className={cn("flex-1 overflow-auto", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroup({ className, children, ...props }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ className, children, ...props }) {
  return (
    <div className={cn("text-sm font-semibold text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupContent({ className, children, ...props }) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenu({ className, children, ...props }) {
  return (
    <nav className={cn("space-y-1", className)} {...props}>
      {children}
    </nav>
  );
}

export function SidebarMenuItem({ className, children, ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenuButton({
  className,
  children,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? React.Fragment : "button";

  if (asChild) {
    return <>{children}</>;
  }

  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function SidebarTrigger({ className, ...props }) {
  const { open, setOpen } = React.useContext(SidebarContext);

  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
