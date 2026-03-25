import React, { useEffect, useRef } from "react"
import * as THREE from "three"

export const ShaderAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera | null
    scene: THREE.Scene | null
    renderer: THREE.WebGLRenderer | null
    uniforms: any
    animationId: number | null
  }>({
    camera: null,
    scene: null,
    renderer: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!containerRef.current) return

    // Check for WebGL support before doing anything
    const isWebGLAvailable = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    };

    if (!isWebGLAvailable()) {
      console.warn("WebGL is not available in this environment.");
      return;
    }

    const container = containerRef.current
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    }

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4( position, 1.0 );
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      varying vec2 vUv;
        
      float random (in float x) {
          return fract(sin(x) * 10000.0);
      }
      
      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        
        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256.0, 256.0);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);       
          
        float t = time * 0.06 + random(uv.x) * 0.4;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        
        // Unrolled outer loop to avoid non-constant indexing which causes issues on some drivers
        for(int i=0; i < 5; i++){
          float fi = float(i);
          float dist = length(uv);
          
          // Added max(..., 0.0001) to prevent division by zero
          color.r += lineWidth * (fi*fi) / max(abs(fract(t - 0.01 * 0.0 + fi * 0.01) - dist), 0.0001);
          color.g += lineWidth * (fi*fi) / max(abs(fract(t - 0.01 * 1.0 + fi * 0.01) - dist), 0.0001);
          color.b += lineWidth * (fi*fi) / max(abs(fract(t - 0.01 * 2.0 + fi * 0.01) - dist), 0.0001);
        }

        // Gold color palette
        vec3 gold = vec3(1.0, 0.84, 0.0);
        vec3 darkGold = vec3(0.6, 0.4, 0.1);
        
        float intensity = clamp((color.r + color.g + color.b) / 3.0, 0.0, 1.0);
        vec3 finalColor = mix(darkGold, gold, intensity);
        
        gl_FragColor = vec4(finalColor * intensity, 1.0);
      }
    `

    const material = new THREE.ShaderMaterial({
      name: "LineShaderMaterial",
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)
    } catch (e) {
      console.error("WebGL not supported or failed to initialize:", e);
      return;
    }

    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: null,
    }

    const resize = () => {
      if (!container || !renderer) return
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio())
    }

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)
    resize()

    const animate = () => {
      try {
        sceneRef.current.animationId = requestAnimationFrame(animate)
        uniforms.time.value += 0.05
        renderer.render(scene, camera)
      } catch (e) {
        console.error("ShaderAnimation animate error:", e);
      }
    }

    animate()

    return () => {
      try {
        resizeObserver.disconnect()
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId)
        }
        if (sceneRef.current.renderer) {
          sceneRef.current.renderer.dispose()
          if (container.contains(sceneRef.current.renderer.domElement)) {
            container.removeChild(sceneRef.current.renderer.domElement)
          }
        }
      } catch (e) {
        console.error("ShaderAnimation cleanup error:", e);
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0" 
    />
  )
}
