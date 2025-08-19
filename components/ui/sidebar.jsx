"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return {
    ...context,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 768 : false,
  };
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, open, setOpen, animate }) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden md:flex md:flex-col bg-background border-r w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({ link, className, ...props }) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2  group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

export const SidebarHeader = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col gap-2", className)} {...props}>
    {children}
  </div>
);

export const SidebarContent = ({ className, children, ...props }) => (
  <div className={cn("flex flex-1 flex-col gap-2", className)} {...props}>
    {children}
  </div>
);

export const SidebarFooter = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col gap-2", className)} {...props}>
    {children}
  </div>
);

export const SidebarMenu = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col gap-1", className)} {...props}>
    {children}
  </div>
);

export const SidebarMenuItem = ({ className, children, ...props }) => (
  <div className={cn("flex items-center", className)} {...props}>
    {children}
  </div>
);

export const SidebarMenuButton = React.forwardRef(
  ({ className, asChild = false, children, tooltip, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(children, {
        className: cn(
          "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          className
        ),
        title: tooltip,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          className
        )}
        title={tooltip}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuAction = ({
  className,
  children,
  showOnHover,
  ...props
}) => (
  <button
    className={cn(
      "flex items-center justify-center rounded-sm px-2 py-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      showOnHover && "opacity-0 group-hover:opacity-100 transition-opacity",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const SidebarGroup = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col gap-4", className)} {...props}>
    {children}
  </div>
);

export const SidebarGroupContent = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col gap-2", className)} {...props}>
    {children}
  </div>
);

export const SidebarGroupLabel = ({ className, children, ...props }) => (
  <div
    className={cn(
      "text-xs font-semibold text-sidebar-foreground/70",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const SidebarInset = ({ className, children, ...props }) => (
  <div className={cn("flex flex-1 flex-col", className)} {...props}>
    {children}
  </div>
);

export const SidebarTrigger = ({ className, ...props }) => {
  const { setOpen } = useSidebar();
  return (
    <button
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => setOpen(true)}
      {...props}
    >
      <IconMenu2 className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
};
