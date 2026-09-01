const canvas = document.getElementById("magicRings");
const hero = document.querySelector(".hero-section");

if (canvas && hero) {
  const gl =
    canvas.getContext("webgl2", { alpha: true, antialias: true }) ||
    canvas.getContext("webgl", { alpha: true, antialias: true });

  if (gl) {
    const vertexShaderSource = `
      attribute vec2 aPosition;

      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;

      uniform float uTime, uAttenuation, uLineThickness;
      uniform float uBaseRadius, uRadiusStep, uScaleRate;
      uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
      uniform float uFadeIn, uFadeOut;
      uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
      uniform vec2 uResolution, uMouse;
      uniform vec3 uColor, uColorTwo;
      uniform int uRingCount;

      const float HP = 1.5707963;
      const float CYCLE = 3.45;

      float fade(float t) {
        return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
      }

      float ring(vec2 p, float ri, float cut, float t0, float px) {
        float t = mod(uTime + t0, CYCLE);
        float r = ri + t / CYCLE * uScaleRate;
        float d = abs(length(p) - r);
        float a = atan(abs(p.y), abs(p.x)) / HP;
        float th = max(1.0 - a, 0.5) * px * uLineThickness;
        float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
        d += pow(cut * a, 3.0) * r;
        return h * exp(-uAttenuation * d) * fade(t);
      }

      void main() {
        float px = 1.0 / min(uResolution.x, uResolution.y);
        vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
        float cr = cos(uRotation), sr = sin(uRotation);
        p = mat2(cr, -sr, sr, cr) * p;
        p -= uMouse * uMouseInfluence;
        float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
        p /= sc;
        vec3 c = vec3(0.0);
        float rcf = max(float(uRingCount) - 1.0, 1.0);

        for (int i = 0; i < 10; i++) {
          if (i >= uRingCount) break;
          float fi = float(i);
          vec2 pr = p - fi * uParallax * uMouse;
          vec3 rc = mix(uColor, uColorTwo, fi / rcf);
          c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
        }

        c *= 1.0 + uBurst * 2.0;
        float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
        c += (n - 0.5) * uNoiseAmount;
        gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
      }
    `;

    const settings = {
      color: "#E88C54",
      colorTwo: "#DEAD69",
      ringCount: 5,
      speed: 1,
      attenuation: 7,
      lineThickness: 3,
      baseRadius: 0.35,
      radiusStep: 0.1,
      scaleRate: 0.09,
      opacity: 1,
      noiseAmount: 0.05,
      rotation: 0,
      ringGap: 1.5,
      fadeIn: 0.7,
      fadeOut: 0.5,
      followMouse: false,
      mouseInfluence: 0.4,
      hoverScale: 1.2,
      parallax: 0.03,
      clickBurst: true,
    };

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const hexToRgb = (hex) => {
      const value = hex.replace("#", "");
      return [
        parseInt(value.slice(0, 2), 16) / 255,
        parseInt(value.slice(2, 4), 16) / 255,
        parseInt(value.slice(4, 6), 16) / 255,
      ];
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (vertexShader && fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const locations = {
          position: gl.getAttribLocation(program, "aPosition"),
          uTime: gl.getUniformLocation(program, "uTime"),
          uResolution: gl.getUniformLocation(program, "uResolution"),
          uAttenuation: gl.getUniformLocation(program, "uAttenuation"),
          uColor: gl.getUniformLocation(program, "uColor"),
          uColorTwo: gl.getUniformLocation(program, "uColorTwo"),
          uLineThickness: gl.getUniformLocation(program, "uLineThickness"),
          uBaseRadius: gl.getUniformLocation(program, "uBaseRadius"),
          uRadiusStep: gl.getUniformLocation(program, "uRadiusStep"),
          uScaleRate: gl.getUniformLocation(program, "uScaleRate"),
          uRingCount: gl.getUniformLocation(program, "uRingCount"),
          uOpacity: gl.getUniformLocation(program, "uOpacity"),
          uNoiseAmount: gl.getUniformLocation(program, "uNoiseAmount"),
          uRotation: gl.getUniformLocation(program, "uRotation"),
          uRingGap: gl.getUniformLocation(program, "uRingGap"),
          uFadeIn: gl.getUniformLocation(program, "uFadeIn"),
          uFadeOut: gl.getUniformLocation(program, "uFadeOut"),
          uMouse: gl.getUniformLocation(program, "uMouse"),
          uMouseInfluence: gl.getUniformLocation(program, "uMouseInfluence"),
          uHoverAmount: gl.getUniformLocation(program, "uHoverAmount"),
          uHoverScale: gl.getUniformLocation(program, "uHoverScale"),
          uParallax: gl.getUniformLocation(program, "uParallax"),
          uBurst: gl.getUniformLocation(program, "uBurst"),
        };

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 3, -1, -1, 3]),
          gl.STATIC_DRAW,
        );

        gl.useProgram(program);
        gl.enableVertexAttribArray(locations.position);
        gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const mouse = { x: 0, y: 0 };
        const smoothMouse = { x: 0, y: 0 };
        let hoverAmount = 0;
        let isHovered = false;
        let burst = 0;

        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
          const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
          }
        };

        const onPointerMove = (event) => {
          const rect = hero.getBoundingClientRect();
          mouse.x = (event.clientX - rect.left) / rect.width - 0.5;
          mouse.y = -((event.clientY - rect.top) / rect.height - 0.5);
        };

        hero.addEventListener("pointermove", onPointerMove);
        hero.addEventListener("pointerenter", () => {
          isHovered = true;
        });
        hero.addEventListener("pointerleave", () => {
          isHovered = false;
          mouse.x = 0;
          mouse.y = 0;
        });
        hero.addEventListener("click", () => {
          burst = 1;
        });

        const color = hexToRgb(settings.color);
        const colorTwo = hexToRgb(settings.colorTwo);

        const render = (time) => {
          requestAnimationFrame(render);
          resize();

          smoothMouse.x += (mouse.x - smoothMouse.x) * 0.08;
          smoothMouse.y += (mouse.y - smoothMouse.y) * 0.08;
          hoverAmount += ((isHovered ? 1 : 0) - hoverAmount) * 0.08;
          burst *= 0.95;
          if (burst < 0.001) burst = 0;

          gl.useProgram(program);
          gl.uniform1f(locations.uTime, time * 0.001 * settings.speed);
          gl.uniform2f(locations.uResolution, canvas.width, canvas.height);
          gl.uniform1f(locations.uAttenuation, settings.attenuation);
          gl.uniform3f(locations.uColor, color[0], color[1], color[2]);
          gl.uniform3f(locations.uColorTwo, colorTwo[0], colorTwo[1], colorTwo[2]);
          gl.uniform1f(locations.uLineThickness, settings.lineThickness);
          gl.uniform1f(locations.uBaseRadius, settings.baseRadius);
          gl.uniform1f(locations.uRadiusStep, settings.radiusStep);
          gl.uniform1f(locations.uScaleRate, settings.scaleRate);
          gl.uniform1i(locations.uRingCount, settings.ringCount);
          gl.uniform1f(locations.uOpacity, settings.opacity);
          gl.uniform1f(locations.uNoiseAmount, settings.noiseAmount);
          gl.uniform1f(locations.uRotation, (settings.rotation * Math.PI) / 180);
          gl.uniform1f(locations.uRingGap, settings.ringGap);
          gl.uniform1f(locations.uFadeIn, settings.fadeIn);
          gl.uniform1f(locations.uFadeOut, settings.fadeOut);
          gl.uniform2f(locations.uMouse, smoothMouse.x, smoothMouse.y);
          gl.uniform1f(
            locations.uMouseInfluence,
            settings.followMouse ? settings.mouseInfluence : 0,
          );
          gl.uniform1f(locations.uHoverAmount, hoverAmount);
          gl.uniform1f(locations.uHoverScale, settings.hoverScale);
          gl.uniform1f(locations.uParallax, settings.parallax);
          gl.uniform1f(locations.uBurst, settings.clickBurst ? burst : 0);

          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        resize();
        requestAnimationFrame(render);
        window.addEventListener("resize", resize);
      } else {
        console.error(gl.getProgramInfoLog(program));
      }
    }
  }
}
