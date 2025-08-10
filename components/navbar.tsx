"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MenuIcon, UserCircle2 } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Verified Sellers", href: "/verified-sellers" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className='sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm'>
      <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            onClick={toggleSidebar}>
            <MenuIcon className='h-6 w-6' />
            <span className='sr-only'>Toggle navigation</span>
          </Button>
          <Link
            href='/'
            className='flex items-center gap-2 font-semibold text-agronetGreen'>
            <img
              src='/placeholder.svg?height=24&width=24'
              alt='AgroNet Logo'
              className='h-6 w-6'
            />
            <span>AgroNet</span>
          </Link>
        </div>
        <nav className='hidden md:flex gap-6'>
          {navItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-agronetGreen ${
                pathname === item.href ? 'text-agronetGreen' : 'text-gray-600'
              }`}>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className='flex items-center gap-4'>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src='/placeholder.svg?height=32&width=32'
                      alt={`${user?.firstname} ${user?.lastname}` || 'User'}
                    />
                    <AvatarFallback>
                      {user?.firstname?.charAt(0).toUpperCase() || (
                        <UserCircle2 />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium leading-none'>{`${user?.firstname} ${user?.lastname}`}</p>
                    <p className='text-xs leading-none text-muted-foreground'>
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/${
                      user?.role === 'farmer' ? 'seller' : user?.role
                    }`}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'buyer' && (
                  <DropdownMenuItem asChild>
                    <Link href='/wishlist'>Wishlist</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href='/chats'>My Chats</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className='flex gap-2'>
              <Button
                asChild
                variant='outline'
                className='border-agronetGreen text-agronetGreen hover:bg-agronetGreen hover:text-white bg-transparent'>
                <Link href='/login'>Login</Link>
              </Button>
              <Button
                asChild
                className='bg-agronetOrange hover:bg-agronetOrange/90 text-white'>
                <Link href='/register'>Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
