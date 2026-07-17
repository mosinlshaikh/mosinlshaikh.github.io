const toggle=document.querySelector('.menuToggle');
const nav=document.querySelector('.navlinks');
if(toggle&&nav){
  const close=()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰'};
  toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰'});
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
  addEventListener('keydown',event=>{if(event.key==='Escape')close()});
}
