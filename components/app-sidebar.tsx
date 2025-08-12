"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  ShoppingCart,
  Store,
  MessageSquare,
  Heart,
  PlusCircle,
  FileText,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAdminNotification,
  setAdminNotification,
} from "@/lib/local-storage-utils";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const { user, isAuthenticated, isAdmin, isBuyer, isSeller, logout } =
    useAuth();
  const { state, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [hasAdminNotification, setHasAdminNotification] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const notificationStatus = getAdminNotification();
      setHasAdminNotification(notificationStatus);
      if (notificationStatus) {
        toast({
          title: "New Seller Application!",
          description:
            "A new user has applied to become a seller. Check the admin dashboard.",
          variant: "success",
          duration: 5000,
        });
        setAdminNotification(false); // Clear notification after showing
      }
    }
  }, [isAdmin, toast]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  const commonMenuItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Products", href: "/products", icon: ShoppingCart },
    { title: "Verified Sellers", href: "/verified-sellers", icon: Store },
    { title: "About", href: "/about", icon: FileText },
    { title: "Contact", href: "/contact", icon: MessageSquare },
  ];

  const authMenuItems = isAuthenticated
    ? [{ title: "Logout", onClick: logout, icon: LogOut }]
    : [
        { title: "Login", href: "/login", icon: LogIn },
        { title: "Register", href: "/register", icon: UserPlus },
      ];

  const dashboardMenuItems = isAuthenticated
    ? [
        isAdmin && {
          title: "Admin Dashboard",
          href: "/dashboard/admin",
          icon: LayoutDashboard,
        },
        isBuyer && {
          title: "Buyer Dashboard",
          href: "/dashboard/buyer",
          icon: LayoutDashboard,
        },
        isSeller && {
          title: "Seller Dashboard",
          href: "/dashboard/seller",
          icon: LayoutDashboard,
        },
      ].filter(Boolean)
    : [];

  const buyerSpecificItems = isBuyer
    ? [
        { title: "Wishlist", href: "/wishlist", icon: Heart },
        { title: "Apply to Sell", href: "/apply-seller", icon: PlusCircle },
        { title: "My Chats", href: "/chats", icon: MessageSquare },
      ]
    : [];

  const sellerSpecificItems = isSeller
    ? [
        { title: "Post Product", href: "/post-product", icon: PlusCircle },
        { title: "My Chats", href: "/chats", icon: MessageSquare },
      ]
    : [];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/harvestlink-logo.svg"
              alt="HarvestLink Logo"
              className="h-8 w-8"
            />
            <span className="text-lg font-bold text-agronetGreen">
              HarvestLink
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <ChevronDown className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        {isAuthenticated && user && (
          <div className="p-2 text-sm text-gray-600">
            <p>
              {getGreeting()}, {user.name}!
            </p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dashboardMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {isBuyer && buyerSpecificItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Buyer Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {buyerSpecificItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {isSeller && sellerSpecificItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Seller Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sellerSpecificItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Preferences</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          {authMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.href ? (
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton onClick={item.onClick}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
