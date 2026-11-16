'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Metal líquido em WebGL (shader autoral, sem bibliotecas).
 * Inspirado no filme "A nova Grifo": dobras de metal em vinho e âmbar que reagem ao cursor.
 *
 * 2027 · Hero Signature (`sculpture`): sobre o metal líquido, uma escultura de ARCOS em metal vinho,
 * derivada da linguagem institucional da Grifo (os arcos do MICCA e do Grifo Core) — renderizada por
 * raymarching no mesmo shader, sem Three.js. O logotipo nunca é deformado: a escultura é um elemento próprio.
 *
 * Desempenho e acessibilidade:
 *  - resolução interna reduzida e DPR limitado (mais baixa em telas pequenas);
 *  - pausa fora da tela e com a aba oculta; libera o contexto WebGL ao desmontar;
 *  - prefers-reduced-motion → um único quadro estático;
 *  - Save-Data / conexão 2G / sem WebGL → imagem estática (poster) + fundo em CSS da mesma paleta.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const NOISE = `
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<4;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}
float H(vec2 p){
  vec2 q=vec2(fbm(p+vec2(0.,t*.05)),fbm(p+vec2(5.2,1.3)-t*.04));
  vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*.03),fbm(p+3.*q+vec2(8.3,2.8)));
  return fbm(p+2.6*w);
}
vec3 metal(vec2 uv){
  vec2 p=uv*vec2(r.x/r.y,1.)*1.6;
  p+=(m-.5)*.25;
  float e=.004;float h=H(p);
  float hx=H(p+vec2(e,0.))-h;float hy=H(p+vec2(0.,e))-h;
  vec3 N=normalize(vec3(-hx/e*.09,-hy/e*.09,1.));
  vec3 L=normalize(vec3(m.x-.35,m.y-.2,.75));
  vec3 Hh=normalize(L+vec3(0.,0.,1.));
  float diff=clamp(dot(N,L),0.,1.);
  float spec=pow(clamp(dot(N,Hh),0.,1.),48.);
  float fres=pow(1.-clamp(N.z,0.,1.),2.2);
  vec3 base=mix(c0,c1,smoothstep(.25,.85,h));
  base=mix(base,c2,smoothstep(.62,.95,h)*.55);
  vec3 col=base*(.35+.85*diff)+c3*spec*.9+c2*fres*.6;
  float vg=smoothstep(1.25,.25,length(uv-vec2(.62,.5)));
  col*=mix(.55,1.,vg);
  col=mix(col,c0*.6,smoothstep(.55,0.,uv.x)*.55);
  return col;
}`;

const HEAD = `precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;`;

/** Metal líquido original (preservado). */
const FRAG = `${HEAD}${NOISE}
void main(){vec2 uv=gl_FragCoord.xy/r.xy;gl_FragColor=vec4(pow(metal(uv),vec3(.95)),1.);}`;

/** Hero Signature: arcos esculpidos (raymarching) sobre o metal líquido. */
const FRAG_SCULPT = `${HEAD}uniform vec3 place;uniform float steps;${NOISE}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec3 LP;float ID;
float arch(vec3 p){
  float ring=abs(length(p.xy)-1.)-.15;
  ring=max(ring,-p.y);
  vec2 q=vec2(ring,abs(p.z)-.085);
  return length(max(q,0.))+min(max(q.x,q.y),0.)-.02;
}
float map(vec3 p){
  p.y+=.05;
  p.xz=rot(1.02+.07*sin(t*.12)+(m.x-.5)*.16)*p.xz;
  float s=.48;
  float k=clamp(floor(p.z/s+.5),-3.,2.);
  vec3 q=p;q.z-=k*s;
  float sc=1.+k*.035;
  q.xy/=sc;
  LP=q;ID=k;
  return arch(q)*sc;
}
vec3 nor(vec3 p){vec2 e=vec2(.0015,-.0015);
  return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
void main(){
  vec2 uv=gl_FragCoord.xy/r.xy;
  vec3 bg=metal(uv)*.62;bg*=mix(.55,1.,smoothstep(.0,.75,uv.x));
  vec2 sp=(gl_FragCoord.xy-.5*r.xy)/r.y;
  sp=(sp-place.xy)/place.z;
  vec3 ro=vec3(0.,.62,6.6);
  vec3 rd=normalize(vec3(sp.x,sp.y-.1,-2.4));
  float d=0.;float hit=0.;
  for(int i=0;i<84;i++){
    if(float(i)>=steps)break;
    vec3 p=ro+rd*d;float h=map(p);
    if(h<.0015){hit=1.;break;}
    d+=h*.85;if(d>12.)break;
  }
  vec3 col=bg;
  if(hit>.5){
    vec3 p=ro+rd*d;vec3 lp=LP;float id=ID;vec3 N=nor(p);
    vec3 L=normalize(vec3(-.55+(m.x-.5)*.7,.85,.55));
    vec3 V=-rd;vec3 Hh=normalize(L+V);
    float diff=clamp(dot(N,L),0.,1.);
    float spec=pow(clamp(dot(N,Hh),0.,1.),70.);
    float fres=pow(1.-clamp(dot(N,V),0.,1.),3.);
    vec3 R=reflect(rd,N);
    vec3 env=mix(c0*.35,mix(c1,c2,.35),smoothstep(-.25,.9,R.y));
    float ao=clamp(.55+.45*smoothstep(-.1,.8,p.y+.05),0.,1.);
    vec3 base=mix(c1*.32,c1*.82,smoothstep(.15,1.,diff));
    col=base*(.35+.55*diff)*ao+env*.3+c3*spec*.95+c1*fres*.55+c2*fres*.12;
    // filete âmbar na face frontal (como as bordas dos arcos do Grifo Core)
    float edge=smoothstep(.022,.0,abs(abs(length(lp.xy)-1.)-.15))*step(.06,abs(lp.z));
    col=mix(col,c2*1.1,edge*(id>1.5?.9:.18));
    col=mix(col,bg,smoothstep(7.5,11.5,d));
  } else if(rd.y<0.){
    // sombra de contato suave sob a escultura
    float fy=-(ro.y+.05)/rd.y;vec3 fp=ro+rd*fy;
    float o=clamp(map(fp+vec3(0.,.12,0.))*2.2,0.,1.);
    col*=mix(.55,1.,o);
  }
  gl_FragColor=vec4(pow(col,vec3(.95)),1.);
}`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export function LiquidMetal({
  className = '',
  palette = ['#2a0909', '#8d2525', '#e5a12e', '#ffe2b0'],
  scale = 0.55,
  sculpture = false,
  poster,
}: {
  className?: string;
  palette?: [string, string, string, string] | string[];
  scale?: number;
  /** Hero Signature: escultura de arcos sobre o metal. */
  sculpture?: boolean;
  /** Imagem estática usada quando WebGL não está disponível ou o visitante economiza dados. */
  poster?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    if (nav.connection?.saveData || /(^|-)2g/.test(nav.connection?.effectiveType || '')) {
      setFallback(true);
      return;
    }
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) {
      setFallback(true);
      return;
    }
    // Renderização por software (sem GPU) travaria a thread principal: usa a imagem estática.
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setFallback(true);
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, sculpture ? FRAG_SCULPT : FRAG);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFallback(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uR = U('r'), uT = U('t'), uM = U('m'), uPlace = U('place'), uSteps = U('steps');
    ['c0', 'c1', 'c2', 'c3'].forEach((n, i) => gl.uniform3fv(U(n), hex(palette[i])));

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0;
    let quality = 1; // reduzido automaticamente se o aparelho não sustentar a animação
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const small = rect.width < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
      const s = (sculpture ? (small ? 0.5 : scale * 0.9) : scale) * quality;
      w = Math.max(1, Math.round(rect.width * dpr * s));
      h = Math.max(1, Math.round(rect.height * dpr * s));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uR, w, h);
      if (uPlace) {
        // desktop: escultura à direita, título à esquerda; retrato: escultura acima do texto
        const aspect = rect.width / Math.max(1, rect.height);
        if (aspect > 1.15) gl.uniform3f(uPlace, Math.min(0.78, aspect * 0.34), 0.05, 0.95);
        else gl.uniform3f(uPlace, 0.12, 0.26, 0.55);
      }
      if (uSteps) gl.uniform1f(uSteps, small ? 56 : 84);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(18);
    });
    ro.observe(canvas);

    const mouse = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
    };
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

    const draw = (time: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform1f(uT, time);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let visible = true;
    let start = performance.now();
    let last = 0, slow = 0, frames = 0, stopped = false;
    const cap = canvas.getBoundingClientRect().width < 768 ? 1000 / 30 : 0; // 30 fps no celular
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = last ? now - last : 16;
      if (cap && dt < cap - 2) return;
      last = now;
      draw(18 + (now - start) / 1000);
      // Orçamento de quadro: se ficar lento, reduz a resolução; no limite, congela num quadro estático.
      frames++;
      if (dt > 48) slow++;
      if (frames >= 40) {
        if (slow > 16) {
          if (quality > 0.55) {
            quality = Math.max(0.55, quality * 0.75);
            resize();
          } else {
            stopped = true;
            pause();
          }
        }
        frames = 0;
        slow = 0;
      }
    };
    const play = () => {
      if (!raf && !stopped && visible && !document.hidden) {
        start = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const pause = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) play();
      else pause();
    });
    const onVis = () => (document.hidden ? pause() : play());

    if (reduce) draw(18);
    else {
      // começa depois do carregamento inicial (não disputa a thread com o LCP e a hidratação)
      draw(18);
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      const startAnim = () => {
        io.observe(canvas);
        document.addEventListener('visibilitychange', onVis);
        play();
      };
      if (ric) ric(startAnim, { timeout: 1500 });
      else setTimeout(startAnim, 600);
    }
    canvas.dataset.ready = '1';

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palette.join(','), scale, sculpture]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Fallback estático (também é o que aparece antes do primeiro quadro) */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 70% at 72% 40%, ${palette[1]} 0%, transparent 60%), radial-gradient(35% 40% at 82% 70%, ${palette[2]}66 0%, transparent 70%), linear-gradient(115deg, ${palette[0]} 30%, #1a0606 100%)`,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {fallback && poster && <img src={poster} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" data-poster />}
      {!fallback && <canvas ref={ref} className="fade-in absolute inset-0 h-full w-full" />}
    </div>
  );
}
