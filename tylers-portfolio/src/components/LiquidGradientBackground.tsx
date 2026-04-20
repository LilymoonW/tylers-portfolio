'use client'

/**
 * Liquid animated WebGL gradient, ported from the Framer community module
 * `Liquid_Gradient_bg` (framer.com/m/Liquid-Gradient-bg-Oqul.js).
 *
 * Framer-specific `addPropertyControls`/`ControlType` bindings have been
 * stripped; the rest (TouchTexture, shader, uniforms) is the original work
 * of the Framer module author. Licensing: used as a reference implementation
 * of the shader technique. Replace or re-author if redistribution is a concern.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export type LiquidGradientBackgroundProps = {
  color1?: string
  color2?: string
  color3?: string
  color4?: string
  color5?: string
  color6?: string
  backgroundColor?: string
  animationSpeed?: number
  gradientIntensity?: number
  gradientSize?: number
  /** 6, 10, or 12 */
  gradientCount?: number
  /** 0..2 — how strongly the cursor trail distorts the gradient */
  touchStrength?: number
  /** 0..0.3 */
  grainIntensity?: number
  color1Weight?: number
  color2Weight?: number
  className?: string
  style?: React.CSSProperties
  /**
   * When true, skip the default 100×100 minimum and avoid falling back to
   * `window` dimensions when the node has no layout yet. Use under tight CSS
   * masks (e.g. portrait wordmark) so the WebGL plane cannot outgrow the
   * masked box and show a hard rectangular edge.
   */
  fillContainer?: boolean
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec3 pos = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform vec3 uColor5;
  uniform vec3 uColor6;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform sampler2D uTouchTexture;
  uniform float uGrainIntensity;
  uniform vec3 uDarkNavy;
  uniform float uGradientSize;
  uniform float uGradientCount;
  uniform float uColor1Weight;
  uniform float uColor2Weight;
  uniform float uTouchStrength;

  varying vec2 vUv;

  float grain(vec2 uv, float time) {
    vec2 grainUv = uv * uResolution * 0.5;
    float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
    return grainValue * 2.0 - 1.0;
  }

  vec3 getGradientColor(vec2 uv, float time) {
    float gradientRadius = uGradientSize;

    vec2 center1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
    vec2 center2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
    vec2 center3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
    vec2 center4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
    vec2 center5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
    vec2 center6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);
    vec2 center7 = vec2(0.5 + sin(time * uSpeed * 0.55) * 0.38, 0.5 + cos(time * uSpeed * 0.48) * 0.42);
    vec2 center8 = vec2(0.5 + cos(time * uSpeed * 0.65) * 0.36, 0.5 + sin(time * uSpeed * 0.52) * 0.44);
    vec2 center9 = vec2(0.5 + sin(time * uSpeed * 0.42) * 0.41, 0.5 + cos(time * uSpeed * 0.58) * 0.39);
    vec2 center10 = vec2(0.5 + cos(time * uSpeed * 0.48) * 0.37, 0.5 + sin(time * uSpeed * 0.62) * 0.43);
    vec2 center11 = vec2(0.5 + sin(time * uSpeed * 0.68) * 0.33, 0.5 + cos(time * uSpeed * 0.44) * 0.46);
    vec2 center12 = vec2(0.5 + cos(time * uSpeed * 0.38) * 0.39, 0.5 + sin(time * uSpeed * 0.56) * 0.41);

    float dist1 = length(uv - center1);
    float dist2 = length(uv - center2);
    float dist3 = length(uv - center3);
    float dist4 = length(uv - center4);
    float dist5 = length(uv - center5);
    float dist6 = length(uv - center6);
    float dist7 = length(uv - center7);
    float dist8 = length(uv - center8);
    float dist9 = length(uv - center9);
    float dist10 = length(uv - center10);
    float dist11 = length(uv - center11);
    float dist12 = length(uv - center12);

    float influence1 = 1.0 - smoothstep(0.0, gradientRadius, dist1);
    float influence2 = 1.0 - smoothstep(0.0, gradientRadius, dist2);
    float influence3 = 1.0 - smoothstep(0.0, gradientRadius, dist3);
    float influence4 = 1.0 - smoothstep(0.0, gradientRadius, dist4);
    float influence5 = 1.0 - smoothstep(0.0, gradientRadius, dist5);
    float influence6 = 1.0 - smoothstep(0.0, gradientRadius, dist6);
    float influence7 = 1.0 - smoothstep(0.0, gradientRadius, dist7);
    float influence8 = 1.0 - smoothstep(0.0, gradientRadius, dist8);
    float influence9 = 1.0 - smoothstep(0.0, gradientRadius, dist9);
    float influence10 = 1.0 - smoothstep(0.0, gradientRadius, dist10);
    float influence11 = 1.0 - smoothstep(0.0, gradientRadius, dist11);
    float influence12 = 1.0 - smoothstep(0.0, gradientRadius, dist12);

    vec2 rotatedUv1 = uv - 0.5;
    float angle1 = time * uSpeed * 0.15;
    rotatedUv1 = vec2(
      rotatedUv1.x * cos(angle1) - rotatedUv1.y * sin(angle1),
      rotatedUv1.x * sin(angle1) + rotatedUv1.y * cos(angle1)
    );
    rotatedUv1 += 0.5;

    vec2 rotatedUv2 = uv - 0.5;
    float angle2 = -time * uSpeed * 0.12;
    rotatedUv2 = vec2(
      rotatedUv2.x * cos(angle2) - rotatedUv2.y * sin(angle2),
      rotatedUv2.x * sin(angle2) + rotatedUv2.y * cos(angle2)
    );
    rotatedUv2 += 0.5;

    float radialGradient1 = length(rotatedUv1 - 0.5);
    float radialGradient2 = length(rotatedUv2 - 0.5);
    float radialInfluence1 = 1.0 - smoothstep(0.0, 0.8, radialGradient1);
    float radialInfluence2 = 1.0 - smoothstep(0.0, 0.8, radialGradient2);

    vec3 color = vec3(0.0);
    color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
    color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
    color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
    color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
    color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
    color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;

    if (uGradientCount > 6.0) {
      color += uColor1 * influence7 * (0.55 + 0.45 * sin(time * uSpeed * 1.4)) * uColor1Weight;
      color += uColor2 * influence8 * (0.55 + 0.45 * cos(time * uSpeed * 1.5)) * uColor2Weight;
      color += uColor3 * influence9 * (0.55 + 0.45 * sin(time * uSpeed * 1.6)) * uColor1Weight;
      color += uColor4 * influence10 * (0.55 + 0.45 * cos(time * uSpeed * 1.7)) * uColor2Weight;
    }
    if (uGradientCount > 10.0) {
      color += uColor5 * influence11 * (0.55 + 0.45 * sin(time * uSpeed * 1.8)) * uColor1Weight;
      color += uColor6 * influence12 * (0.55 + 0.45 * cos(time * uSpeed * 1.9)) * uColor2Weight;
    }

    color += mix(uColor1, uColor3, radialInfluence1) * 0.45 * uColor1Weight;
    color += mix(uColor2, uColor4, radialInfluence2) * 0.4 * uColor2Weight;

    color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;

    // Mixing toward raw luminance reads as muddy grey in the midtones; bias the
    // “neutral” toward light cyan so desaturated pockets stay airy cyan-blue.
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 coolNeutral = vec3(
      luminance * 0.68,
      min(luminance * 0.96, 1.0),
      min(luminance * 1.08, 1.0)
    );
    color = mix(coolNeutral, color, 1.52);
    color = pow(color, vec3(0.94));

    float brightness1 = length(color);
    float mixFactor1 = max(brightness1 * 1.2, 0.15);
    color = mix(uDarkNavy, color, mixFactor1);

    float maxBrightness = 1.0;
    float brightness = length(color);
    if (brightness > maxBrightness) {
      color = color * (maxBrightness / brightness);
    }

    return color;
  }

  void main() {
    vec2 uv = vUv;

    vec4 touchTex = texture2D(uTouchTexture, uv);
    float vx = -(touchTex.r * 2.0 - 1.0);
    float vy = -(touchTex.g * 2.0 - 1.0);
    float intensity = touchTex.b;
    uv.x += vx * 0.8 * intensity * uTouchStrength;
    uv.y += vy * 0.8 * intensity * uTouchStrength;

    vec2 center = vec2(0.5);
    float dist = length(uv - center);
    float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.04 * intensity * uTouchStrength;
    float wave = sin(dist * 15.0 - uTime * 2.0) * 0.03 * intensity * uTouchStrength;
    uv += vec2(ripple + wave);

    vec3 color = getGradientColor(uv, uTime);

    float grainValue = grain(uv, uTime);
    color += grainValue * uGrainIntensity;

    float timeShift = uTime * 0.5;
    color.r += sin(timeShift) * 0.02;
    color.g += cos(timeShift * 1.4) * 0.02;
    color.b += sin(timeShift * 1.2) * 0.02;

    color = clamp(color, vec3(0.0), vec3(1.0));

    gl_FragColor = vec4(color, 1.0);
  }
`

function hexToRgb(hex: string): THREE.Vector3 {
  if (hex.startsWith('rgb')) {
    const matches = hex.match(/\d+/g)
    if (matches && matches.length >= 3) {
      return new THREE.Vector3(
        parseInt(matches[0], 10) / 255,
        parseInt(matches[1], 10) / 255,
        parseInt(matches[2], 10) / 255,
      )
    }
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return new THREE.Vector3(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    )
  }
  return new THREE.Vector3(0.545, 0.361, 0.965)
}

type TrailPoint = {
  x: number
  y: number
  age: number
  force: number
  vx: number
  vy: number
}

class TouchTexture {
  size = 64
  width = 64
  height = 64
  maxAge = 64
  radius = 16
  speed = 1 / 64
  trail: TrailPoint[] = []
  last: { x: number; y: number } | null = null
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  texture!: THREE.Texture

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')!
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.texture = new THREE.Texture(this.canvas)
  }

  update() {
    this.clear()
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i]
      const f = point.force * this.speed * (1 - point.age / this.maxAge)
      point.x += point.vx * f
      point.y += point.vy * f
      point.age++
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1)
      } else {
        this.drawPoint(point)
      }
    }
    this.texture.needsUpdate = true
  }

  clear() {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0
    let vx = 0
    let vy = 0
    const last = this.last
    if (last) {
      const dx = point.x - last.x
      const dy = point.y - last.y
      if (dx === 0 && dy === 0) return
      const dd = dx * dx + dy * dy
      const d = Math.sqrt(dd)
      vx = dx / d
      vy = dy / d
      force = Math.min(dd * 2e4, 2)
    }
    this.last = { x: point.x, y: point.y }
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
  }

  drawPoint(point: TrailPoint) {
    const pos = { x: point.x * this.width, y: (1 - point.y) * this.height }
    let intensity = 1
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2))
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7)
      intensity = -t * (t - 2)
    }
    intensity *= point.force
    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`
    const offset = this.size * 5
    this.ctx.shadowOffsetX = offset
    this.ctx.shadowOffsetY = offset
    this.ctx.shadowBlur = this.radius
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`
    this.ctx.beginPath()
    this.ctx.fillStyle = 'rgba(255,0,0,1)'
    this.ctx.arc(pos.x - offset, pos.y - offset, this.radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}

export default function LiquidGradientBackground({
  color1 = '#627AA3',
  color2 = '#0033CC',
  color3 = '#0088AA',
  color4 = '#627AA3',
  color5 = '#8FB3DD',
  color6 = '#0033CC',
  backgroundColor = '#ffffff',
  animationSpeed = 1.3,
  gradientIntensity = 1.6,
  gradientSize = 0.5,
  gradientCount = 12,
  touchStrength = 1,
  grainIntensity = 0.07,
  color1Weight = 0.7,
  color2Weight = 1.4,
  className,
  style,
  fillContainer = false,
}: LiquidGradientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let width = container.clientWidth
    let height = container.clientHeight
    if (fillContainer) {
      width = Math.max(1, width)
      height = Math.max(1, height)
    } else {
      width = width || window.innerWidth
      height = height || window.innerHeight
    }

    const canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    container.appendChild(canvas)

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(backgroundColor)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1e4)
    camera.position.z = 50

    const clock = new THREE.Clock()
    const touchTexture = new TouchTexture()

    const fovRad = (camera.fov * Math.PI) / 180
    const viewHeight = Math.abs(camera.position.z * Math.tan(fovRad / 2) * 2)
    const viewWidth = viewHeight * camera.aspect
    let geometry = new THREE.PlaneGeometry(viewWidth, viewHeight, 1, 1)

    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uColor1: { value: hexToRgb(color1) },
      uColor2: { value: hexToRgb(color2) },
      uColor3: { value: hexToRgb(color3) },
      uColor4: { value: hexToRgb(color4) },
      uColor5: { value: hexToRgb(color5) },
      uColor6: { value: hexToRgb(color6) },
      uSpeed: { value: reducedMotion ? 0 : animationSpeed },
      uIntensity: { value: gradientIntensity },
      uTouchTexture: { value: touchTexture.texture },
      uGrainIntensity: { value: grainIntensity },
      uDarkNavy: { value: hexToRgb(backgroundColor) },
      uGradientSize: { value: gradientSize },
      uGradientCount: { value: gradientCount },
      uColor1Weight: { value: color1Weight },
      uColor2Weight: { value: color2Weight },
      uTouchStrength: { value: reducedMotion ? 0 : touchStrength },
    }
    uniformsRef.current = uniforms

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      const x = (clientX - rect.left) / rect.width
      const y = 1 - (clientY - rect.top) / rect.height
      if (x < 0 || x > 1 || y < 0 || y > 1) return
      touchTexture.addTouch({ x, y })
    }

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    renderer.render(scene, camera)

    let animationId = 0
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1)
      uniforms.uTime.value += delta
      touchTexture.update()
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      let w = container.clientWidth
      let h = container.clientHeight
      if (fillContainer) {
        w = Math.max(1, w)
        h = Math.max(1, h)
      } else {
        w = w || window.innerWidth
        h = h || window.innerHeight
      }
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      const fov = (camera.fov * Math.PI) / 180
      const vH = Math.abs(camera.position.z * Math.tan(fov / 2) * 2)
      const vW = vH * camera.aspect
      mesh.geometry.dispose()
      geometry = new THREE.PlaneGeometry(vW, vH, 1, 1)
      mesh.geometry = geometry
      uniforms.uResolution.value.set(w, h)
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      resizeObserver.disconnect()
      mesh.geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
      uniformsRef.current = null
      sceneRef.current = null
    }
    // Mount-only setup; prop changes go through the sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillContainer])

  useEffect(() => {
    const u = uniformsRef.current
    if (!u) return
    u.uColor1.value = hexToRgb(color1)
    u.uColor2.value = hexToRgb(color2)
    u.uColor3.value = hexToRgb(color3)
    u.uColor4.value = hexToRgb(color4)
    u.uColor5.value = hexToRgb(color5)
    u.uColor6.value = hexToRgb(color6)
    u.uDarkNavy.value = hexToRgb(backgroundColor)
    u.uSpeed.value = animationSpeed
    u.uIntensity.value = gradientIntensity
    u.uGradientSize.value = gradientSize
    u.uGradientCount.value = gradientCount
    u.uGrainIntensity.value = grainIntensity
    u.uColor1Weight.value = color1Weight
    u.uColor2Weight.value = color2Weight
    u.uTouchStrength.value = touchStrength
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(backgroundColor)
    }
  }, [
    color1,
    color2,
    color3,
    color4,
    color5,
    color6,
    backgroundColor,
    animationSpeed,
    gradientIntensity,
    gradientSize,
    gradientCount,
    grainIntensity,
    color1Weight,
    color2Weight,
    touchStrength,
  ])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minWidth: fillContainer ? 0 : 100,
        minHeight: fillContainer ? 0 : 100,
        position: 'relative',
        // Never clip the canvas — under CSS masks a hidden overflow often reads
        // as a hard rectangular edge behind letterforms.
        overflow: 'visible',
        ...style,
      }}
    />
  )
}
