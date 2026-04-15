"use client"

import { useState, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PinContainerProps {
  children: ReactNode
  title?: string
  href?: string
  className?: string
  containerClassName?: string
}

export function PinContainer({
  children,
  title,
  href,
  className,
  containerClassName,
}: PinContainerProps) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className={cn("relative group/pin z-50 cursor-pointer", containerClassName)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          perspective: "1000px",
          transform: "rotateX(70deg) translateZ(0deg)",
        }}
        className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          style={{
            rotateX: hovered ? 0 : 40,
            scale: hovered ? 1 : 0.8,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 flex items-start justify-start -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.1] bg-black p-4 shadow-[0_8px_16px_rgb(0_0_0/0.4)] group-hover/pin:border-white/[0.2] overflow-hidden"
        >
          <div className={cn("relative z-50", className)}>{children}</div>
        </motion.div>
      </div>

      <PinPerspective title={title} href={href} hovered={hovered} />
    </div>
  )
}

function PinPerspective({
  title,
  href,
  hovered,
}: {
  title?: string
  href?: string
  hovered: boolean
}) {
  return (
    <motion.div
      className="pointer-events-none z-[60] flex h-80 w-96 items-center justify-center opacity-0 transition duration-500 group-hover/pin:opacity-100"
    >
      <div className="relative flex h-full w-full -mt-7 flex-col items-center justify-start">
        {title && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto relative z-10 flex items-center space-x-1 rounded-full bg-zinc-950 px-4 py-0.5 ring-1 ring-white/10"
          >
            <span className="relative z-20 inline-block text-xs font-bold text-white py-0.5">
              {title}
            </span>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-bright-blue/0 via-bright-blue/90 to-bright-blue/0 transition-opacity duration-500" />
          </a>
        )}

        <div className="relative flex w-full flex-1 items-center justify-center">
          {/* Animated circles */}
          {hovered && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                animate={{ opacity: [0, 1, 0.5, 0], scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="absolute left-1/2 top-1/2 h-20 w-20 rounded-full bg-bright-blue/[0.08] shadow-[0_8px_16px_rgb(0_102_255/0.2)]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                animate={{ opacity: [0, 1, 0.5, 0], scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                className="absolute left-1/2 top-1/2 h-20 w-20 rounded-full bg-bright-blue/[0.08] shadow-[0_8px_16px_rgb(0_102_255/0.2)]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                animate={{ opacity: [0, 1, 0.5, 0], scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                className="absolute left-1/2 top-1/2 h-20 w-20 rounded-full bg-bright-blue/[0.08] shadow-[0_8px_16px_rgb(0_102_255/0.2)]"
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
