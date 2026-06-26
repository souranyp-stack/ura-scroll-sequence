/* =======================================================================
   Scroll-driven image sequence (canvas)
   - Loads frames/0001.webp … frames/0120.webp
   - Maps scroll progress through .sequence to the current frame
   - Draws each frame "cover" style onto a full-screen canvas
   ======================================================================= */

const FRAME_COUNT = 120;                 // number of files in /frames
const FRAME_PATH  = i => `frames/${String(i).padStart(4,'0')}.webp`;

const canvas  = document.getElementById('seq');
const ctx     = canvas.getContext('2d');
const track   = document.getElementById('sequence');
const loader  = document.getElementById('loader');
const loadBar = loader.querySelector('span');

const images = [];
let loaded = 0;
let current = -1;
let ready = false;

/* ---- size the canvas to the viewport (retina aware) ---- */
function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (ready) drawFrame(current < 0 ? 0 : current);
}

/* ---- draw one frame, cropped to cover the canvas ---- */
function drawFrame(index){
  const img = images[index];
  if (!img || !img.complete || !img.naturalWidth) return;
  const cw = window.innerWidth, ch = window.innerHeight;
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = cw / ch;
  let w, h, x, y;
  if (ir > cr){ h = ch; w = ch * ir; x = (cw - w) / 2; y = 0; }
  else        { w = cw; h = cw / ir; x = 0; y = (ch - h) / 2; }
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, w, h);
  current = index;
}

/* ---- scroll -> frame index ---- */
function onScroll(){
  if (!ready) return;
  const rect = track.getBoundingClientRect();
  const total = track.offsetHeight - window.innerHeight;   // scrollable distance
  const progress = Math.min(1, Math.max(0, -rect.top / total));
  const frame = Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1)));
  if (frame !== current) requestAnimationFrame(() => drawFrame(frame));
}

/* ---- preload every frame, then start ---- */
function preload(){
  for (let i = 1; i <= FRAME_COUNT; i++){
    const img = new Image();
    img.onload = img.onerror = () => {
      loaded++;
      loadBar.style.width = (loaded / FRAME_COUNT * 100) + '%';
      if (loaded === FRAME_COUNT){
        ready = true;
        loader.classList.add('done');
        drawFrame(0);
        onScroll();
      }
    };
    img.src = FRAME_PATH(i);
    images[i - 1] = img;
  }
}

window.addEventListener('resize', resize, { passive:true });
window.addEventListener('scroll', onScroll, { passive:true });
resize();
preload();
