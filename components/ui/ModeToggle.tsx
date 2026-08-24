"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
   const { setTheme, resolvedTheme } = useTheme()
   const [mounted, setMounted] = React.useState(false)

   React.useEffect(() => {
      setMounted(true)
   }, [])

   if (!mounted) {
      return (
         <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle theme</span>
         </Button>
      )
   }

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative z-50">
               <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${resolvedTheme === 'dark' ? 'scale-0 -rotate-90' : 'scale-100 rotate-0'
                  }`} />
               <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${resolvedTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
                  }`} />
               <span className="sr-only">Toggle theme</span>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" className="z-[100] min-w-[120px]">
            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
               <Sun className="mr-2 h-4 w-4" />
               Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
               <Moon className="mr-2 h-4 w-4" />
               Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
               <span className="mr-2 h-4 w-4">💻</span>
               System
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
