'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js'
import { CopyShader } from 'three/addons/shaders/CopyShader.js'

// Helpers
const Lerp = (a, b, t = 0.075) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 }

// Final composite pass shader with dynamic background uniform
const FinalPass = {
  uniforms: {
    iTime: { value: 0 },
    tDiffuse: { value: null },
    torusTexture: { value: null },
    bloomTexture: { value: null },
    haloTexture: { value: null },
    uBg: { value: hexToVec3('#050716') },
    iCornerBlue:   { value: hexToVec3('#ffcf2a') },   // gold
    iCornerOrange: { value: hexToVec3('#ff3b1f') }    // red
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float iTime;
    uniform sampler2D tDiffuse;
    uniform sampler2D bloomTexture;
    uniform sampler2D torusTexture;
    uniform sampler2D haloTexture;
    uniform vec3 uBg;
    uniform vec3 iCornerBlue;
    uniform vec3 iCornerOrange;
    varying vec2 vUv;

    vec3 warp3d(vec3 pos, float t) {
      float curv = .8, a = 1.9, b = 0.7; pos *= 2.;
      pos.x += curv * sin(t + a * pos.y) + t * b; pos.y += curv * cos(t + a * pos.x);
      pos.y += curv * sin(t + a * pos.z) + t * b; pos.z += curv * cos(t + a * pos.y);
      pos.z += curv * sin(t + a * pos.x) + t * b; pos.x += curv * cos(t + a * pos.z);
      return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
    }

    void main() {
      vec2 uv = 2. * vUv - 1.;
      vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));
      vec3 col = 1.5 * iCornerBlue * w.x; col *= w.y; col += iCornerOrange * w.z;
      col *= smoothstep(0.6, 1., abs(uv.y));
      col *= smoothstep(-.5, 1., -uv.y * uv.x); col *= smoothstep(-.5, 1., -uv.y * uv.x);
      vec3 halo = texture2D(haloTexture, vUv).xyz;
      vec3 atmoBg = uBg * (1.0 - 0.4 * length(uv));
      gl_FragColor = vec4(atmoBg + col * 0.2 + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
    }
  `
}

export default function TunnelBackground({ theme }) {
  const canvasRef = useRef(null)
  const themeUpdaterRef = useRef(null)

  // Listen to theme changes without rebuilding WebGL context
  useEffect(() => {
    if (themeUpdaterRef.current) {
      themeUpdaterRef.current(theme)
    }
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let width = window.innerWidth
    let height = window.innerHeight

    // 1. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height, false)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap

    // 2. Setup Scene & Camera & Fog
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    const fog = new THREE.Fog(0x000000, 0, 15)
    scene.fog = fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80)
    camera.position.set(0, 0, 14)
    camera.layers.enable(LAYERS.TORUS_SCENE)
    camera.layers.enable(LAYERS.BLOOM_SCENE)
    camera.layers.enable(LAYERS.ENTIRE_SCENE)
    scene.add(camera)

    // 3. Setup Scroll Target
    let scrollTarget = 0
    let scrollCurrent = 0

    const updateScrollTarget = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const innerHeight = window.innerHeight
      const totalScroll = scrollHeight - innerHeight
      scrollTarget = totalScroll <= 0 ? 0 : clamp(window.scrollY / totalScroll, 0, 1)
    }

    window.addEventListener('scroll', updateScrollTarget, { passive: true })
    window.addEventListener('resize', updateScrollTarget, { passive: true })
    updateScrollTarget()

    // 4. Galaxy Geometry Generator
    const R = 1.7
    const N = 90000
    const positions = new Float32Array(N * 3)
    const shells = new Float32Array(N)
    const sizes = new Float32Array(N)
    const ids = new Float32Array(N)
    const K = Math.max(1, Math.round(79))
    const SP = 13
    const frames = []
    
    for (let k = 0; k < K; k++) {
      frames.push({
        m: new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(
          Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)),
        size: 0.18 + 0.34 * Math.random(),
        ecc: 0.45 + 0.42 * Math.random(),
        thick: 0.06 + 0.05 * Math.random(),
        ox: (Math.random() - 0.5) * 2 * SP,
        oy: (Math.random() - 0.5) * 2 * SP,
        oz: (Math.random() - 0.5) * 2 * SP * 0.6
      })
    }
    
    const tmp = new THREE.Vector3()
    for (let i = 0; i < N; i++) {
      const f = frames[i % K]
      const th = Math.random() * 2 * Math.PI
      const rad = Math.pow(Math.random(), 1.4)
      const rx = f.size * R * rad
      const rz = f.size * R * f.ecc * rad
      const y = (Math.random() - 0.5) * 2 * f.thick * R * rad
      tmp.set(rx * Math.cos(th), y, rz * Math.sin(th)).applyMatrix4(f.m)
      tmp.x += f.ox; tmp.y += f.oy; tmp.z += f.oz
      positions[i * 3]     = tmp.x
      positions[i * 3 + 1] = tmp.y
      positions[i * 3 + 2] = tmp.z
      shells[i] = rad
      sizes[i]  = 6 + 9 * Math.random()
      ids[i]    = Math.random()
    }
    
    const galaxyGeo = new THREE.BufferGeometry()
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    galaxyGeo.setAttribute('shell',    new THREE.BufferAttribute(shells, 1))
    galaxyGeo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))
    galaxyGeo.setAttribute('id',       new THREE.BufferAttribute(ids, 1))

    // 5. Galaxy Points Material (Added size and brightness uniforms)
    const galaxyUniforms = {
      iTime: { value: 0 },
      iAnimate: { value: 0 },
      uOpacity: { value: 0 },
      uExpand: { value: 1 },
      uSize: { value: 1.0 },       // Point size multiplier
      uBrightness: { value: 1.0 }, // Star brightness multiplier
      uWobbleAmount: { value: 0.205 },
      uWobbleSpeed: { value: 0.35 },
      uCore: { value: hexToVec3('#fff3b0') },
      uMid: { value: hexToVec3('#ffb52a') },
      uRim: { value: hexToVec3('#3a1402') },
      uTwinkle: { value: hexToVec3('#ff5e8a') },
      uGradientPow: { value: 0.2 },
      uTwinkleAmount: { value: 0.71 },
      uTwinkleSpeed: { value: 2.45 }
    }

    const galaxyMaterial = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      uniforms: galaxyUniforms,
      vertexShader: `
        attribute float size; attribute float id; attribute float shell;
        uniform float iTime; uniform float iAnimate; uniform float uExpand; uniform float uSize;
        uniform float uWobbleAmount; uniform float uWobbleSpeed;
        varying float vShell; varying float vId;
        void main() {
          vShell = shell; vId = id;
          float ph = id * 6.2831853;
          vec3 wob = vec3(sin(iTime * uWobbleSpeed + ph),
                          cos(iTime * uWobbleSpeed * 1.3 + ph),
                          sin(iTime * uWobbleSpeed * 0.7 + ph)) * uWobbleAmount;
          vec3 p = (position + wob) * uExpand;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * uSize / -mv.z * (0.5 + 0.5 * iAnimate);
          vec4 res = projectionMatrix * mv;
          float a = pow(iAnimate, 0.6);
          res.xy *= clamp(2.0 * a + pow(id, 0.7) - 1.0, 0.0, 1.0);
          gl_Position = res;
        }
      `,
      fragmentShader: `
        uniform float iTime; uniform float uOpacity; uniform float uBrightness;
        uniform vec3 uCore; uniform vec3 uMid; uniform vec3 uRim; uniform vec3 uTwinkle;
        uniform float uGradientPow; uniform float uTwinkleAmount; uniform float uTwinkleSpeed;
        varying float vShell; varying float vId;
        vec3 grad3(vec3 a, vec3 b, vec3 c, float t) {
          return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, clamp((t - 0.5) * 2.0, 0.0, 1.0));
        }
        void main() {
          float t = pow(vShell, uGradientPow);
          vec3 col = grad3(uCore, uMid, uRim, t);
          float tw = 0.5 + 0.5 * sin(iTime * uTwinkleSpeed + vId * 100.0);
          col = mix(col, uTwinkle, tw * uTwinkleAmount * (1.0 - t));
          col *= (0.45 + 0.85 * (1.0 - t)) * uBrightness;
          float tex = 1.0 - smoothstep(0.5, 1.0, length(2.0 * gl_PointCoord - 1.0));
          // Correct alpha blending (Normal vs Additive) to prevent black border artifacts
          gl_FragColor = vec4(col, tex * uOpacity);
        }
      `
    })

    const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMaterial)
    galaxyPoints.position.set(0, 0, -0.8)
    
    // Cloud is enabled on LAYERS.ENTIRE_SCENE only to prevent flickering
    galaxyPoints.layers.set(LAYERS.ENTIRE_SCENE)

    const group = new THREE.Group()
    group.add(galaxyPoints)
    group.position.set(0, 0, -20)
    scene.add(group)

    // 6. Atmosphere Motes Geometry
    const atmoN = 350
    const atmoPositions = new Float32Array(atmoN * 3)
    const atmoSizes = new Float32Array(atmoN)
    const atmoSeeds = new Float32Array(atmoN)
    
    for (let i = 0; i < atmoN; i++) {
      atmoPositions[i * 3]     = 2 * Math.random() - 1
      atmoPositions[i * 3 + 1] = 2 * Math.random() - 1
      atmoPositions[i * 3 + 2] = 2 * Math.random() - 1
      atmoSizes[i] = 14 * (0.4 + Math.random())
      atmoSeeds[i] = Math.random()
    }
    
    const atmoGeo = new THREE.BufferGeometry()
    atmoGeo.setAttribute('position', new THREE.BufferAttribute(atmoPositions, 3))
    atmoGeo.setAttribute('size',     new THREE.BufferAttribute(atmoSizes, 1))
    atmoGeo.setAttribute('seed',     new THREE.BufferAttribute(atmoSeeds, 1))

    const atmoUniforms = {
      uTime: { value: 0 },
      uColor: { value: hexToVec3('#ffd9a0') }, // gold motes
      uRes: { value: new THREE.Vector2(width * window.devicePixelRatio, height * window.devicePixelRatio) }
    }

    const atmoMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: atmoUniforms,
      vertexShader: `
        attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes;
        varying float vA;
        vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
          p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
          p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
          return cos(p+vec3(1,2,4)); }
        void main(){
          vec3 v = position*4.0 + warp(position, uTime)*1.2;
          vec4 mv = modelViewMatrix * vec4(v, 1.0);
          float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
          vA = farF * nearF;
          gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor; varying float vA;
        void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
          float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor, tex * vA * 0.55); }
      `
    })

    const atmoPoints = new THREE.Points(atmoGeo, atmoMaterial)
    atmoPoints.frustumCulled = false
    atmoPoints.layers.set(LAYERS.ENTIRE_SCENE)
    scene.add(atmoPoints)

    // 7. Composers setup
    const renderScene = new RenderPass(scene, camera)

    // torus composer
    const torusComposer = new EffectComposer(renderer)
    torusComposer.renderToScreen = false
    torusComposer.addPass(renderScene)
    torusComposer.addPass(new ShaderPass(GammaCorrectionShader))
    const torusBloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.22, 0.2, 0)
    torusComposer.addPass(torusBloom)
    torusComposer.addPass(new ShaderPass(CopyShader))

    // bloom composer
    const bloomComposer = new EffectComposer(renderer)
    bloomComposer.renderToScreen = false
    bloomComposer.addPass(renderScene)
    const mainBloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.35, 0.5, 0)
    bloomComposer.addPass(mainBloom)
    bloomComposer.addPass(new ShaderPass(GammaCorrectionShader))

    // final composer
    const finalPass = new ShaderPass(FinalPass)
    finalPass.uniforms.bloomTexture.value = bloomComposer.readBuffer.texture
    finalPass.uniforms.torusTexture.value = torusComposer.readBuffer.texture

    const finalComposer = new EffectComposer(renderer)
    finalComposer.addPass(renderScene)
    finalComposer.addPass(finalPass)

    // 8. Dynamic Theme Switcher Function (Now modifies point sizes, opacities, and backgrounds dynamically)
    const updateThemeSettings = (currentTheme) => {
      const isDark = currentTheme !== 'light'

      // Scene backgrounds (Light: soft cool indigo, Dark: deep night black)
      const bgColorHex = isDark ? 0x000000 : 0xf0f2fa
      scene.background.setHex(bgColorHex)
      fog.color.setHex(bgColorHex)

      // Galaxy core, mid, rim and twinkle colors
      galaxyUniforms.uCore.value.copy(hexToVec3(isDark ? '#fff3b0' : '#1e1b4b'))     // Gold vs Deep Indigo Core
      galaxyUniforms.uMid.value.copy(hexToVec3(isDark ? '#ffb52a' : '#6d28d9'))      // Amber vs Deep Violet
      galaxyUniforms.uRim.value.copy(hexToVec3(isDark ? '#3a1402' : '#e0e7ff'))      // Deep Brown vs Slate Rim
      galaxyUniforms.uTwinkle.value.copy(hexToVec3(isDark ? '#ff5e8a' : '#be185d'))   // Rose Pink vs Fuchsia Twinkle

      // Galaxy Point Size & Brightness multipliers
      galaxyUniforms.uSize.value = isDark ? 1.0 : 1.35        // Scale up in light mode to stand out
      galaxyUniforms.uBrightness.value = isDark ? 1.0 : 1.6  // Boost point brightness in light mode
      galaxyUniforms.uOpacity.value = isDark ? 1.0 : 0.9     // Gentle opacity

      // Atmosphere motes (Dark: gold, Light: sapphire blue)
      atmoUniforms.uColor.value.copy(hexToVec3(isDark ? '#ffd9a0' : '#4338ca'))

      // FinalPass background and corner flames (Dark: deep indigo/yellow/red, Light: soft violet/sky-blue)
      finalPass.uniforms.uBg.value.copy(hexToVec3(isDark ? '#050716' : '#e8ebf7'))
      finalPass.uniforms.iCornerBlue.value.copy(hexToVec3(isDark ? '#ffcf2a' : '#d8b4fe')) // gold vs soft lavender
      finalPass.uniforms.iCornerOrange.value.copy(hexToVec3(isDark ? '#ff3b1f' : '#bfdbfe')) // red vs soft sky blue

      // Dynamic Blending: Additive in Dark (glows), Normal in Light (overlaid translucent points)
      const targetBlending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending
      
      if (galaxyMaterial.blending !== targetBlending) {
        galaxyMaterial.blending = targetBlending
        galaxyMaterial.needsUpdate = true
      }
      if (atmoMaterial.blending !== targetBlending) {
        atmoMaterial.blending = targetBlending
        atmoMaterial.needsUpdate = true
      }
    }

    themeUpdaterRef.current = updateThemeSettings
    updateThemeSettings(theme) // Run on mount

    // 9. Resize Handler
    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio, 2)

      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      torusComposer.setPixelRatio(dpr)
      torusComposer.setSize(width, height)
      torusBloom.setSize(width, height)

      bloomComposer.setPixelRatio(dpr)
      bloomComposer.setSize(width, height)
      mainBloom.setSize(width, height)

      finalComposer.setPixelRatio(dpr)
      finalComposer.setSize(width, height)

      atmoUniforms.uRes.value.set(width * dpr, height * dpr)
    }
    window.addEventListener('resize', onResize, { passive: true })

    // 10. Animation and Render loops
    const appearStart = performance.now()
    let lastT = performance.now() / 1000
    let animationFrameId = null

    const render = () => {
      animationFrameId = requestAnimationFrame(render)

      // Lerp scroll
      scrollCurrent = Lerp(scrollCurrent, scrollTarget, 0.08)

      // Update camera position based on scroll target dive
      camera.position.z = 14 - scrollCurrent * 4

      const now = performance.now()
      const elapsed = now - appearStart
      const t = now / 1000
      const dt = Math.min(0.05, t - lastT)
      lastT = t

      // Galaxy shader uniforms
      galaxyUniforms.iTime.value = t
      galaxyUniforms.uExpand.value = 1 + scrollCurrent

      // Rigid tumble rotation
      const spin = 0.2 * (1 + scrollCurrent * 2.62) * dt
      galaxyPoints.rotation.y += spin
      galaxyPoints.rotation.x += spin * 0.35

      // Slide in entry logic
      let tAnim = clamp(elapsed / 2000, 0, 1)
      const iAnimateVal = tAnim * tAnim * (3 - 2 * tAnim)
      galaxyUniforms.iAnimate.value = iAnimateVal

      if (elapsed >= 500) {
        let tSlide = clamp((elapsed - 500) / 1500, 0, 1)
        const slideFactor = 1 - Math.pow(1 - tSlide, 4)
        group.position.z = -20 + slideFactor * 20
        // Apply dynamic scale uOpacity based on slide factor
        galaxyMaterial.uniforms.uOpacity.value = slideFactor * (theme === 'light' ? 0.9 : 1.0)
      } else {
        group.position.z = -20
        galaxyUniforms.uOpacity.value = 0
      }

      if (elapsed >= 2000) {
        galaxyUniforms.iAnimate.value = 1
        group.position.z = 0
        galaxyUniforms.uOpacity.value = theme === 'light' ? 0.9 : 1.0
      }

      // Motes & final composer inputs
      atmoUniforms.uTime.value = t * 0.8 * 8.0 // atmoSpeed = 0.8
      atmoPoints.position.copy(camera.position)
      finalPass.uniforms.iTime.value = t

      // Make sure texture maps stay bound
      finalPass.uniforms.bloomTexture.value = bloomComposer.readBuffer.texture
      finalPass.uniforms.torusTexture.value = torusComposer.readBuffer.texture

      // Render 3 composer passes
      camera.layers.set(LAYERS.TORUS_SCENE)
      torusComposer.render()

      camera.layers.set(LAYERS.BLOOM_SCENE)
      bloomComposer.render()

      camera.layers.set(LAYERS.ENTIRE_SCENE)
      finalComposer.render()
    }

    render()

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('scroll', updateScrollTarget)
      window.removeEventListener('resize', updateScrollTarget)
      window.removeEventListener('resize', onResize)

      galaxyGeo.dispose()
      galaxyMaterial.dispose()
      atmoGeo.dispose()
      atmoMaterial.dispose()

      torusComposer.dispose()
      bloomComposer.dispose()
      finalComposer.dispose()
      renderer.dispose()
    }
  }, [theme]) // Re-run effect when theme shifts to update initial scaling state correctly

  return (
    <canvas
      ref={canvasRef}
      id="scene"
      className="fixed inset-0 w-full h-full pointer-events-none block z-0"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent', // Transparent to allow page background blending
      }}
    />
  )
}
