import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { Link, useLocation, useNavigate } from "react-router-dom"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update active tab based on location
  useEffect(() => {
    const currentPath = location.pathname + location.hash
    const activeItem = items.find(item => item.url === currentPath || (item.url === '/' && currentPath === '/'))
    if (activeItem) {
      setActiveTab(activeItem.name)
    }
  }, [location, items])

  const handleNavClick = (e: React.MouseEvent, url: string, name: string) => {
    if (url.startsWith('/#')) {
      e.preventDefault()
      const targetId = url.replace('/#', '')
      
      if (location.pathname !== '/') {
        navigate('/')
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const element = document.getElementById(targetId)
          if (element) element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        const element = document.getElementById(targetId)
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (url === '/') {
      if (location.pathname === '/') {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    setActiveTab(name)
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 pointer-events-none",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-black/20 border border-white/10 backdrop-blur-lg py-1 px-1 rounded-full shadow-2xl pointer-events-auto">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={(e) => handleNavClick(e, item.url, item.name)}
              className={cn(
                "relative cursor-pointer text-xs font-bold px-6 py-2 rounded-full transition-all duration-300 uppercase tracking-widest",
                "text-white hover:text-white",
                isActive && "text-royal-gold",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-royal-gold/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-royal-gold rounded-t-full">
                    <div className="absolute w-12 h-6 bg-royal-gold/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-royal-gold/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-royal-gold/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
