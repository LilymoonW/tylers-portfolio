'use client'

import { useEffect, useRef, useState } from 'react'

type ProjectVideoPlayerProps = {
  src: string
  poster?: string
  className?: string
}

export default function ProjectVideoPlayer({ src, poster, className }: ProjectVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || shouldLoadVideo) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setShouldLoadVideo(true)
        observer.disconnect()
      },
      { rootMargin: '220px 0px', threshold: 0.15 },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [shouldLoadVideo])

  useEffect(() => {
    if (!shouldLoadVideo) return
    const video = videoRef.current
    if (!video) return
    const run = async () => {
      try {
        await video.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
    }
    void run()
  }, [shouldLoadVideo, src])

  const togglePlay = async () => {
    if (!shouldLoadVideo) {
      setShouldLoadVideo(true)
      return
    }
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      try {
        await video.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
      return
    }
    video.pause()
    setIsPlaying(false)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await container.requestFullscreen()
  }

  return (
    <div ref={containerRef} className={`relative h-full w-full ${className ?? ''}`}>
      <video
        key={src}
        ref={videoRef}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload={shouldLoadVideo ? 'metadata' : 'none'}
        className="h-full w-full object-cover"
      >
        {shouldLoadVideo ? <source src={src} type="video/mp4" /> : null}
      </video>

      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className="rounded-md border border-white/35 bg-black/60 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.04em] text-white transition hover:bg-black/75 md:text-xs"
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="rounded-md border border-white/35 bg-black/60 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.04em] text-white transition hover:bg-black/75 md:text-xs"
        >
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-md border border-white/35 bg-black/60 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.04em] text-white transition hover:bg-black/75 md:text-xs"
        >
          {isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}
        </button>
      </div>
    </div>
  )
}
