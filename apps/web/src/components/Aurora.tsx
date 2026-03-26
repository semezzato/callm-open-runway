import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const VERT = `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
    const vec4 C = vec4(
        0.211324865405187, 0.366025403784439,
        -0.577350269189626, 0.024390243902439
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float noise = snoise(uv * uAmplitude + uTime);
    vec3 color = mix(uColorStops[0], uColorStops[1], smoothstep(0.0, uBlend, noise));
    color = mix(color, uColorStops[2], smoothstep(uBlend, 1.0, noise));
    fragColor = vec4(color, 1.0);
}
`;

interface AuroraProps {
    colorStops?: string[];
    amplitude?: number;
    speed?: number;
    blend?: number;
}

const Aurora = ({ 
    colorStops = ["#000428", "#004e92", "#000000"], // Estilo CaLLM Elite
    amplitude = 1.0, 
    speed = 0.5,
    blend = 0.5 
}: AuroraProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const renderer = new Renderer({ canvas: canvasRef.current, antialias: true });
        const gl = renderer.gl;

        const program = new Program(gl, {
            vertex: VERT,
            fragment: FRAG,
            uniforms: {
                uTime: { value: 0 },
                uAmplitude: { value: amplitude },
                uColorStops: { value: colorStops.map(c => new Color(c)) },
                uResolution: { value: [gl.canvas.width, gl.canvas.height] },
                uBlend: { value: blend }
            }
        });

        const geometry = new Triangle(gl);
        const mesh = new Mesh(gl, { geometry, program });

        let animationFrameId: number;
        const update = (t: number) => {
            animationFrameId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001 * speed;
            renderer.render({ scene: mesh });
        };
        animationFrameId = requestAnimationFrame(update);

        const handleResize = () => {
          if (!canvasRef.current) return;
          const width = window.innerWidth;
          const height = window.innerHeight;
          renderer.setSize(width, height);
          program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [colorStops, amplitude, speed, blend]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block -z-10" />;
};

export default Aurora;
