const menuButton=document.querySelector('.menu-button');const menu=document.querySelector('.primary-menu');
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menu?.classList.toggle('open',!open)});
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menuButton?.setAttribute('aria-expanded','false');menu.classList.remove('open')}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -40px'});
document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
const root=document.documentElement;const themeButton=document.querySelector('.theme-toggle');const savedTheme=localStorage.getItem('ttrl-theme');if(savedTheme==='light'||savedTheme==='dark')root.dataset.theme=savedTheme;const syncThemeLabel=()=>{const light=root.dataset.theme==='light';themeButton?.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode')};syncThemeLabel();themeButton?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';localStorage.setItem('ttrl-theme',root.dataset.theme);syncThemeLabel()});
const glowTargets=document.querySelectorAll('.primary-menu a,.capability,.project-card,.featured-project,.contact-panel,.process-list li');glowTargets.forEach(target=>target.addEventListener('pointermove',event=>{const rect=target.getBoundingClientRect();target.style.setProperty('--mx',`${event.clientX-rect.left}px`);target.style.setProperty('--my',`${event.clientY-rect.top}px`)}));if(matchMedia('(pointer:fine)').matches){document.body.classList.add('pointer-active');window.addEventListener('pointermove',event=>{document.body.style.setProperty('--cursor-x',`${event.clientX}px`);document.body.style.setProperty('--cursor-y',`${event.clientY}px`)},{passive:true})}
document.querySelector('#project-form')?.addEventListener('submit',event=>{event.preventDefault();const form=new FormData(event.currentTarget);const message=['Hello TTRL, I would like to discuss a project.','',`Name: ${form.get('name')}`,`Mobile: ${form.get('phone')}`,`Requirement: ${form.get('need')}`,`Business problem: ${form.get('problem')}`,`Budget: ${form.get('budget')}`,`Timeline: ${form.get('timeline')}`].join('\n');window.open(`https://wa.me/918976099500?text=${encodeURIComponent(message)}`,'_blank','noopener,noreferrer')});

// Render the equirectangular Earth texture as a real rotating sphere instead of a flat CSS slide.
const globe=document.querySelector('.earth-natural');
if(globe instanceof HTMLCanvasElement){
  const ctx=globe.getContext('2d',{alpha:true});const texture=new Image();texture.src='assets/earth-texture.webp';
  texture.addEventListener('load',()=>{
    const source=document.createElement('canvas');source.width=1024;source.height=512;
    const sourceCtx=source.getContext('2d',{willReadFrequently:true});sourceCtx.drawImage(texture,0,0,source.width,source.height);
    const pixels=sourceCtx.getImageData(0,0,source.width,source.height).data;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const resolution=280;
    globe.width=resolution;globe.height=resolution;const frame=ctx.createImageData(resolution,resolution);let last=0;
    const render=time=>{
      if(!reduced&&time-last<41){requestAnimationFrame(render);return}last=time;
      const turn=reduced ? .5 : (time*.00016)%(Math.PI*2);
      for(let y=0;y<resolution;y++){const py=(y/(resolution-1))*2-1;for(let x=0;x<resolution;x++){const px=(x/(resolution-1))*2-1;const radius=px*px+py*py;const out=(y*resolution+x)*4;if(radius>1){frame.data[out+3]=0;continue}const z=Math.sqrt(1-radius);const longitude=Math.atan2(px,z)+turn;const latitude=Math.asin(-py);const u=((longitude/(Math.PI*2))+1)%1;const v=.5-latitude/Math.PI;const sx=Math.min(source.width-1,Math.floor(u*source.width));const sy=Math.min(source.height-1,Math.floor(v*source.height));const input=(sy*source.width+sx)*4;const light=.2+.8*Math.max(0,.35*(-px)+.18*(-py)+.92*z);frame.data[out]=pixels[input]*light;frame.data[out+1]=pixels[input+1]*light;frame.data[out+2]=pixels[input+2]*light;frame.data[out+3]=255}}
      ctx.putImageData(frame,0,0);if(!reduced)requestAnimationFrame(render)
    };requestAnimationFrame(render)
  })
}
