"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type { ReactNode } from "react"

interface TimelineEntry {
  title: string
  content: ReactNode
}

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "end 0.5"],
  })

  const heightProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* Vertical line */}
      <div className="absolute left-8 md:left-8 top-0 bottom-0 w-[2px] bg-white/5">
        <motion.div
          className="w-full bg-gradient-to-b from-bright-blue via-cyan to-transparent"
          style={{ height: heightProgress }}
        />
      </div>

      <div className="space-y-16">
        {data.map((item, index) => (
          <TimelineItem key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({ item, index }: { item: { title: string; content: ReactNode }; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-20 md:pl-20"
    >
      {/* Dot */}
      <div className="absolute left-[25px] md:left-[25px] top-1 w-[10px] h-[10px] rounded-full bg-bright-blue border-2 border-bg z-10" />

      {/* Year/title */}
      <h3 className="font-display text-3xl md:text-4xl uppercase text-bright-blue mb-4">
        {item.title}
      </h3>

      {/* Content */}
      <div>{item.content}</div>
    </motion.div>
  )
}
