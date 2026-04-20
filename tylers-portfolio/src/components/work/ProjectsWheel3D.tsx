'use client'

/**
 * 3D Image Wheel — Three.js port of the "CMS 3D Image Wheel" by
 * THE DESIGN FUTURIST (https://framer.com/m/CMS-3D-IMAGE-WHEEL-jQDJr0.js).
 *
 * What it does:
 *   • Renders a horizontal ring of rounded-plane meshes (one per project),
 *     each facing radially outward.
 *   • The perspective camera sits high and back (`cameraHeight` + `cameraZ`)
 *     looking at the ring's center, giving the signature bird's-eye view.
 *   • Mounts with a dramatic intro spin (4 rotations → 0, spring-eased).
 *   • Drag horizontally to spin the wheel; a `targetRot` lerps smoothly to
 *     `currentRot` each frame so throws feel weighted.
 *   • The pointer adds a subtle parallax offset to the camera, same as the
 *     original.
 *   • Desktop: raycast for hover → lifts the card 60 units + shows a
 *     title/brand/year preview overlay at `bottom-center`.
 *   • Mobile (touch): the front-center card auto-becomes the "preview" card.
 *   • Clicking a card fires `onSelect(project)` — wired to the app's video
 *     modal in `WorkPageClient`.
 *
 * What's different from the original:
 *   • Cards are portrait 9:16 (matches project thumbnails) instead of the
 *     original's generic 4:3.
 *   • Projects whose thumbnail is blank / `placeholder.svg` get a
 *     deterministic HSL canvas texture with the title baked in, so the wheel
 *     still looks varied before real artwork lands.
 *   • Page wheel/scroll is NOT hijacked — we only react to pointer drag.
 *   • Click opens the in-app modal instead of `window.open`.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, animate as framerAnimate } from 'framer-motion'
import * as THREE from 'three'
import type { Project } from '@/types'
import { bannerTypeBase, bannerTypeChip } from '@/config/scrollBanner'
import { cn, formatNumber } from '@/lib/utils'

interface ProjectsWheel3DProps {
  projects: Project[]
  onSelect: (project: Project) => void
  className?: string
}

interface WheelConfig {
  cardWidth: number
  cardHeight: number
  borderRadius: number
  padding: number
  cameraZ: number
  cameraY: number
  fov: number
  yPosition: number
  parallaxX: number
  parallaxY: number
  introRotations: number
}

// ---- Scroll-scrub config ----
// Total height of the outer track as a multiple of the viewport height. Pin
// distance = (SCRUB_VH - 1) * vh, so `SCRUB_VH = 3` gives ~2×vh of vertical
// scroll for the full rotation sequence.
const SCRUB_VH = 3
// Full rotations completed over the scrub range (start → end of track).
// 1.5 means the wheel makes a turn-and-a-half as the user scrolls past.
const SCROLL_ROTATIONS = 1.5
// Idle spin so the carousel keeps moving even when scroll is stationary.
// 0.01 = one full revolution every ~100 seconds.
const AUTO_ROTATIONS_PER_SECOND = 0.01

// Defaults tuned for portrait 9:16 thumbnails. Values are in the
// original component's coordinate units — large numbers because the camera
// sits ~2000 units away.
const CONFIG: WheelConfig = {
  cardWidth: 120,
  cardHeight: 213, // 9:16
  borderRadius: 12,
  // Higher padding = smaller ring relative to frustum. 0.18 leaves ~12% on
  // each side for the outermost cards to breathe without hitting the edge.
  padding: 0.18,
  cameraZ: 2000,
  cameraY: 1000,
  fov: 44,
  yPosition: 0,
  parallaxX: 70,
  parallaxY: 140,
  introRotations: 4,
}

function isPlaceholderThumbnail(src: string) {
  const s = src.trim()
  return s.length === 0 || s.endsWith('placeholder.svg')
}

function hashHue(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return ((h % 360) + 360) % 360
}

// Generates a 2D canvas tile used as a texture for placeholder projects.
// Deterministic per-project-id so every missing thumbnail has its own palette
// + title baked in. Returned as a Three.js CanvasTexture.
function createPlaceholderTexture(project: Project): THREE.Texture {
  const w = 360
  const h = 640
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const h1 = hashHue(project.id)
  const h2 = (h1 + 38) % 360
  const h3 = (h1 + 210) % 360

  const base = ctx.createLinearGradient(0, 0, w, h)
  base.addColorStop(0, `hsl(${h1}, 72%, 44%)`)
  base.addColorStop(1, `hsl(${(h1 + 320) % 360}, 60%, 16%)`)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  const blob1 = ctx.createRadialGradient(w * 0.25, h * 0.2, 0, w * 0.25, h * 0.2, w * 1.1)
  blob1.addColorStop(0, `hsla(${h2}, 90%, 62%, 0.65)`)
  blob1.addColorStop(1, 'transparent')
  ctx.fillStyle = blob1
  ctx.fillRect(0, 0, w, h)

  const blob2 = ctx.createRadialGradient(w * 0.85, h * 0.85, 0, w * 0.85, h * 0.85, w * 1.0)
  blob2.addColorStop(0, `hsla(${h3}, 70%, 50%, 0.5)`)
  blob2.addColorStop(1, 'transparent')
  ctx.fillStyle = blob2
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fillRect(0, h - 160, w, 160)

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = "italic 700 34px 'Bebas Neue', system-ui, sans-serif"
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'left'
  const title = project.title.toUpperCase()
  const maxChars = 22
  const line = title.length > maxChars ? `${title.slice(0, maxChars - 1)}…` : title
  ctx.fillText(line, 22, h - 60)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = "italic 600 18px 'Bebas Neue', system-ui, sans-serif"
  ctx.fillText('COMING SOON', 22, h - 28)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// Matches the original component's `createRoundedPlane`: a subdivided
// `PlaneGeometry` whose corner vertices are snapped onto a quarter-circle
// arc. Cheaper than using a rounded-rect shape extrusion and looks identical
// at our card size.
function createRoundedPlane(width: number, height: number, radius: number, segments = 32) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments)
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const r = Math.min(width / 2, height / 2, radius)
  const hW = width / 2
  const hH = height / 2
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const inTop = y > hH - r
    const inBot = y < -hH + r
    const inRight = x > hW - r
    const inLeft = x < -hW + r
    const applyCorner = (cx: number, cy: number) => {
      const dx = x - cx
      const dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > r) {
        const a = Math.atan2(dy, dx)
        pos.setXY(i, cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      }
    }
    if (inTop && inRight) applyCorner(hW - r, hH - r)
    else if (inTop && inLeft) applyCorner(-hW + r, hH - r)
    else if (inBot && inRight) applyCorner(hW - r, -hH + r)
    else if (inBot && inLeft) applyCorner(-hW + r, -hH + r)
  }
  pos.needsUpdate = true
  return geometry
}

function smoothLerp(current: number, target: number, damping: number) {
  return current + (target - current) * damping
}

export default function ProjectsWheel3D({ projects, onSelect, className }: ProjectsWheel3DProps) {
  // `trackRef` = tall outer scrub region used to compute scroll progress.
  // `containerRef` = sticky inner element where the <canvas> lives.
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  // Stable ref into the click/hover callbacks so the RAF loop doesn't need to
  // rebuild when the caller passes a new arrow function each render.
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Stable projects reference snapshot for the Three.js scene. Rebuilding
  // meshes is expensive, so we only do it when length or ids change.
  const projectKey = useMemo(() => projects.map((p) => p.id).join('|'), [projects])

  useEffect(() => {
    const container = containerRef.current
    if (!container || projects.length === 0) return
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // ---- Scene setup ----
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 10000)
    camera.position.set(0, CONFIG.cameraY, CONFIG.cameraZ)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Lock the canvas element to fill its container via CSS. We resize the
    // render buffer separately in `updateSizing`. Without this the canvas
    // stays at its default 300×150 and the WebGL output gets letterboxed /
    // scaled, which looked like "too big + not centered" on screen.
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

    // ---- Mesh construction ----
    const geometry = createRoundedPlane(CONFIG.cardWidth, CONFIG.cardHeight, CONFIG.borderRadius)
    const baseMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    })
    const loader = new THREE.TextureLoader()
    const createdTextures: THREE.Texture[] = []
    const meshes: THREE.Mesh[] = []

    projects.forEach((project, i) => {
      const angle = (i / projects.length) * Math.PI * 2
      const material = baseMaterial.clone()
      const mesh = new THREE.Mesh(geometry, material)
      // rotate so the card faces radially outward (front visible when the
      // card is on the near side of the ring).
      mesh.rotation.y = Math.PI / 2 + angle
      mesh.userData = {
        index: i,
        angle,
        sinA: Math.sin(angle),
        cosA: Math.cos(angle),
        lift: 0,
      }
      group.add(mesh)
      meshes.push(mesh)

      if (isPlaceholderThumbnail(project.thumbnail)) {
        const tex = createPlaceholderTexture(project)
        material.map = tex
        material.needsUpdate = true
        createdTextures.push(tex)
      } else {
        loader.load(
          project.thumbnail,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace
            tex.anisotropy = 4
            material.map = tex
            material.needsUpdate = true
            createdTextures.push(tex)
          },
          undefined,
          () => {
            // Image failed — fall back to generated placeholder so the slot
            // doesn't render as a solid color.
            const tex = createPlaceholderTexture(project)
            material.map = tex
            material.needsUpdate = true
            createdTextures.push(tex)
          },
        )
      }
    })

    // ---- Animation state ----
    // `scrollRot` is driven by the vertical scroll progress through the
    // outer track (absolute mapping). `dragOffset` accumulates from pointer
    // drags so users can still spin the wheel freely; the two add to form
    // the effective `targetRot` each frame.
    const engine = {
      scrollRot: 0,
      dragOffset: 0,
      autoRot: 0,
      targetRot: 0,
      currentRot: 0,
      introSpinOffset: 0,
      pointer: { x: 0, y: 0 },
      isDown: false,
      lastX: 0,
      hoveredIndex: -1,
      rectW: 0,
      rectH: 0,
    }

    // Dramatic intro: ring spins 4x and settles. Matches the original's
    // spring physics so the feel is identical.
    const introController = framerAnimate(Math.PI * 2 * CONFIG.introRotations, 0, {
      type: 'spring',
      stiffness: 30,
      damping: 20,
      mass: 1,
      onUpdate: (latest) => {
        engine.introSpinOffset = latest
      },
    })

    const raycaster = new THREE.Raycaster()
    const pointerNDC = new THREE.Vector2()
    let hoveredProject: number | null = null
    const setHover = (idx: number | null) => {
      if (hoveredProject === idx) return
      hoveredProject = idx
      setHoveredIndex(idx)
    }

    const updateSizing = () => {
      const cw = container.clientWidth
      const ch = container.clientHeight
      if (cw === 0 || ch === 0) return
      if (engine.rectW !== cw || engine.rectH !== ch) {
        engine.rectW = cw
        engine.rectH = ch
        renderer.setSize(cw, ch, false)
        camera.aspect = cw / ch
        camera.updateProjectionMatrix()
      }
    }

    let frameId = 0
    let lastTs = performance.now()
    const tick = () => {
      frameId = requestAnimationFrame(tick)
      const now = performance.now()
      const dt = Math.min((now - lastTs) / 1000, 0.05)
      lastTs = now
      updateSizing()

      // Ring radius is derived from the current frustum so the wheel always
      // fills the available area regardless of viewport size (same math as
      // the reference implementation).
      const cameraDist = Math.sqrt(CONFIG.cameraY ** 2 + CONFIG.cameraZ ** 2)
      const fovRad = (CONFIG.fov * Math.PI) / 180
      const frustumH = 2 * cameraDist * Math.tan(fovRad / 2)
      const frustumW = frustumH * camera.aspect
      const frustumS = Math.min(frustumW, frustumH)
      const refFrustumS = 2 * (400 * Math.sqrt(2)) * Math.tan((75 * Math.PI) / 180 / 2)
      const cardScale = frustumS / refFrustumS
      const radius = (frustumS / 2) * (1 - 2 * CONFIG.padding)

      if (!prefersReducedMotion && !engine.isDown) {
        engine.autoRot += dt * Math.PI * 2 * AUTO_ROTATIONS_PER_SECOND
      }
      engine.targetRot = engine.scrollRot + engine.dragOffset + engine.autoRot
      engine.currentRot = smoothLerp(engine.currentRot, engine.targetRot, 0.1)
      group.rotation.y = engine.currentRot + engine.introSpinOffset

      // Camera parallax toward pointer.
      const p = engine.pointer
      const targetX = -p.x * CONFIG.parallaxX
      const targetY = CONFIG.cameraY + p.y * CONFIG.parallaxY
      const targetZ = CONFIG.cameraZ + Math.abs(p.x) * CONFIG.parallaxX
      camera.position.x = smoothLerp(camera.position.x, targetX, 0.08)
      camera.position.y = smoothLerp(camera.position.y, targetY, 0.08)
      camera.position.z = smoothLerp(camera.position.z, targetZ, 0.08)
      camera.lookAt(0, 0, 0)

      // Hover detection — raycasting on desktop; front-center tracking on
      // touch (the original does the same so mobile always has a "current"
      // preview without needing a hover state).
      let hIndex = -1
      if (isTouchDevice) {
        let maxZ = -Infinity
        for (const mesh of meshes) {
          const worldAngle = mesh.userData.angle + engine.currentRot + engine.introSpinOffset
          const zProj = Math.cos(worldAngle)
          if (zProj > maxZ) {
            maxZ = zProj
            hIndex = mesh.userData.index
          }
        }
      } else {
        raycaster.setFromCamera(pointerNDC, camera)
        const hits = raycaster.intersectObjects(meshes)
        if (hits.length > 0) hIndex = (hits[0].object as THREE.Mesh).userData.index
      }
      if (hIndex !== engine.hoveredIndex) {
        engine.hoveredIndex = hIndex
        setHover(hIndex >= 0 ? hIndex : null)
      }
      renderer.domElement.style.cursor = hIndex >= 0 ? 'pointer' : 'grab'
      if (engine.isDown) renderer.domElement.style.cursor = 'grabbing'

      // Per-mesh placement + hover lift.
      for (const mesh of meshes) {
        const isHovered = mesh.userData.index === engine.hoveredIndex
        mesh.userData.lift = smoothLerp(mesh.userData.lift, isHovered ? 60 : 0, 0.12)
        mesh.position.set(
          mesh.userData.sinA * radius,
          CONFIG.yPosition + mesh.userData.lift,
          mesh.userData.cosA * radius,
        )
        mesh.scale.set(cardScale, cardScale, 1)
      }

      renderer.render(scene, camera)
    }
    tick()

    // ---- Pointer / drag wiring ----
    const resizeObserver = new ResizeObserver(updateSizing)
    resizeObserver.observe(container)

    const updatePointerFromEvent = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect()
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1
      engine.pointer.x = pointerNDC.x
      engine.pointer.y = pointerNDC.y
    }

    const onPointerDown = (e: PointerEvent) => {
      // Only start a drag when the pointer is actually over the wheel.
      const rect = container.getBoundingClientRect()
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return
      }
      engine.isDown = true
      engine.lastX = e.clientX
    }
    const onPointerMove = (e: PointerEvent) => {
      updatePointerFromEvent(e.clientX, e.clientY)
      if (engine.isDown) {
        const width = Math.max(container.clientWidth, 1)
        // Drag accumulates into `dragOffset` so it stacks on top of the
        // scroll-derived rotation instead of fighting it.
        engine.dragOffset += ((e.clientX - engine.lastX) / width) * Math.PI * 2
        engine.lastX = e.clientX
      }
    }
    const onPointerUp = () => {
      engine.isDown = false
    }
    const onTouchMove = (e: TouchEvent) => {
      if (engine.isDown && e.cancelable) e.preventDefault()
      if (e.touches[0]) updatePointerFromEvent(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onPointerLeave = () => {
      pointerNDC.set(0, 0)
      engine.pointer.x = 0
      engine.pointer.y = 0
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('pointerleave', onPointerLeave)

    // ---- Scroll scrub ----
    // Map the outer track's scroll progress (0 at top of track → 1 when the
    // sticky child reaches the end of its pin range) to a ring rotation,
    // so vertically scrolling the page rotates the wheel horizontally while
    // it's pinned in the middle of the viewport.
    const track = trackRef.current
    const onScroll = () => {
      if (!track) return
      const rect = track.getBoundingClientRect()
      const vh = window.innerHeight
      const pinDistance = Math.max(1, rect.height - vh)
      const raw = -rect.top / pinDistance
      const progress = Math.min(1, Math.max(0, raw))
      engine.scrollRot = progress * Math.PI * 2 * SCROLL_ROTATIONS
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    const onClick = (e: MouseEvent) => {
      if (isTouchDevice) return
      const rect = container.getBoundingClientRect()
      pointerNDC.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointerNDC, camera)
      const hits = raycaster.intersectObjects(meshes)
      if (hits.length > 0) {
        const idx = (hits[0].object as THREE.Mesh).userData.index as number
        const project = projects[idx % projects.length]
        if (project) onSelectRef.current(project)
      }
    }
    renderer.domElement.addEventListener('click', onClick)

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(frameId)
      introController.stop()
      resizeObserver.disconnect()
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
      container.removeEventListener('pointerleave', onPointerLeave)
      renderer.domElement.removeEventListener('click', onClick)

      for (const mesh of meshes) {
        ;(mesh.material as THREE.Material).dispose()
      }
      geometry.dispose()
      baseMaterial.dispose()
      for (const tex of createdTextures) tex.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [projectKey, projects])

  const hoveredProject = hoveredIndex != null ? projects[hoveredIndex % projects.length] : null

  // Layout:
  //   <trackRef>  — tall scrub region whose top→bottom maps to 0→1 progress.
  //     <containerRef>  — sticky, pinned at viewport top for the pin range.
  //        <canvas/>
  //        <hover overlay/>
  //
  // `margin-inline: calc(50% - 50vw)` on the track breaks out of the parent
  // section's `max-w-[1400px] px-6`, so the pinned wheel reads as full-bleed
  // and centered on the viewport regardless of the content column width.
  return (
    <div
      ref={trackRef}
      className={cn('relative w-auto', className)}
      style={{
        marginInline: 'calc(50% - 50vw)',
        height: `${SCRUB_VH * 100}vh`,
      }}
    >
      <div
        ref={containerRef}
        className="sticky top-0"
        style={{
          height: '100vh',
          // Horizontal drag rotates the wheel — keep vertical panning free
          // so the outer page scroll (which scrubs the wheel) still works.
          touchAction: 'pan-y',
        }}
      >
        <AnimatePresence>
          {hoveredProject && (
            <motion.div
              key={hoveredProject.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center"
            >
              <h3 className={cn(bannerTypeBase, 'text-xl md:text-2xl text-black')}>
                {hoveredProject.title}
              </h3>
              <p className={cn(bannerTypeChip, 'mt-1 text-black/60')}>
                {hoveredProject.brand} · {hoveredProject.year}
                {hoveredProject.viewCount > 0 && (
                  <> · {formatNumber(hoveredProject.viewCount, 'abbreviated')} views</>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
