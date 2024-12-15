'use client'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'

const ThemeChanger = () => {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      aria-label="Toggle Theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative h-[2rem] w-[2rem] overflow-hidden flex justify-center items-center"
    >
      <Sun
        className={`
          absolute h-[1.5rem] w-[1.5rem] transform transition-all duration-500
          ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
        `}
      />
      <Moon
        className={`
          absolute h-[1.5rem] w-[1.5rem] transform transition-all duration-500
          ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
        `}
      />
    </button>
  )
}

export default ThemeChanger
