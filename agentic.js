/* TTRL website-scoped client agent. No server AI/API key is used. */
(()=>{
'use strict';
const chatForm=document.querySelector('.aiForm'),chatInput=document.querySelector('#aiInput');
const mic=document.querySelector('.aiMic'),imageButton=document.querySelector('.aiImage');
const fileInput=document.querySelector('.aiFile'),formButton=document.querySelector('.aiFormOpen');
if(!chatForm||!chatInput||typeof addMessage!=='function'||typeof ask!=='function')return;

const originalAsk=ask;
const EMPTY={active:false,stage:'',project_type:'',project_name:'',project_summary:'',target_users:'',features:[],budget:'',deadline:'',full_name:'',company:'',phone:'',email:'',services:[]};
let lead={...EMPTY};
try{lead={...EMPTY,...JSON.parse(sessionStorage.getItem('ttrl-agent-lead')||'{}')}}catch{}
const save=()=>{try{sessionStorage.setItem('ttrl-agent-lead',JSON.stringify(lead))}catch{}};
const clean=s=>String(s||'').trim();
const canon=s=>clean(s).toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/\s+/g,' ');
const isHindi=s=>/[\u0900-\u097f]/u.test(s);
const hinglish=s=>!isHindi(s)&&/\b(mujhe|hamare|banana|banwana|chahiye|mera|meri|kya|kaise|ke liye|wala|wali|hai)\b/i.test(s);
const saysYes=s=>/^(yes|haan|ha|ji|हां|हाँ|हो|होय|sure|ok|okay)\b/i.test(clean(s));
const startIntent=s=>/(start my project|start project|client form|form (bhar|fill)|project (banana|banwana|chahiye)|website (banana|banwana|chahiye)|software (banana|banwana|chahiye)|app (banana|banwana|chahiye)|मुझे.+(वेबसाइट|सॉफ्टवेयर|ऐप)|प्रोजेक्ट.+(बनाना|चाहिए))/iu.test(canon(s));
const whyIntent=s=>/(why (choose|ttrl)|different from|other developers|dusre developer|alag kyu|alag ky|हम.+अलग|क्यों चुनें|का निवड)/iu.test(canon(s));
const cancelIntent=s=>/(cancel|stop|restart|start over|बंद|रद्द|फिर से)/iu.test(canon(s));

function detectType(text){const s=canon(text);if(/e[ -]?commerce|online store|shop website/.test(s))return 'E-commerce';if(/billing|pos|medical shop|pharmacy/.test(s))return 'Billing/POS software';if(/mobile app|android|ios|apk/.test(s))return 'Mobile app';if(/desktop|windows software|\.exe/.test(s))return 'Desktop software';if(/website|web site|वेबसाइट|वेबसाईट/.test(s))return 'Website';if(/software|softwere|sofware|सॉफ्टवेयर/.test(s))return 'Custom software';if(/excel|vba|power bi|dashboard/.test(s))return 'Business automation';if(/ai agent|chatbot|agentic ai/.test(s))return 'AI agent/chatbot';return ''}
function extract(text){const s=clean(text),type=detectType(s);if(type){lead.project_type=type;const formService=type==='Custom software'?'Enterprise software':type==='Billing/POS software'?'Management system':type;if(!lead.services.includes(formService))lead.services.push(formService)}
 const money=s.match(/(?:budget|बजट|around|upto|up to|तक)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|thousand|lakh|lac)?/i);if(money&&/(budget|बजट|₹|rs\.?|inr|lakh|lac|thousand|\bk\b)/i.test(s))lead.budget=money[0].trim();
 const email=s.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);if(email)lead.email=email[0];
 const phone=s.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/);if(phone)lead.phone=phone[0];
 const deadline=s.match(/(?:deadline|within|in|तक|अंदर)\s+([^,.]{2,30})/i);if(deadline)lead.deadline=deadline[1].trim();
 save();return type}
function reply(en,hi){return isHindi(lastUser)||hinglish(lastUser)?hi:en}
let lastUser='';
function nextQuestion(){
 if(!lead.project_type)return reply('What would you like to build: a website, mobile app, desktop software, billing/POS system, AI agent, automation, or something else?','Aap kya banwana chahte hain—website, mobile app, desktop software, billing/POS system, AI agent, automation ya kuch aur?');
 if(!lead.project_summary)return reply(`Understood: ${lead.project_type}. Please describe the business goal and the main problem it should solve.`,`Samajh gaya: ${lead.project_type}. Ab business goal aur ye system kaunsi main problem solve karega, batayein.`);
 if(!lead.target_users)return reply('Who will use it—for example customers, staff, admin, vendors, students, or the public?','Isko kaun use karega—customers, staff, admin, vendors, students ya general public?');
 if(!lead.features.length)return reply('List the most important features. You may send them in one message or attach an image of your notes.','Sabse important features ek message mein batayein, ya apne notes ki image attach karein.');
 if(!lead.budget)return reply('What is your approximate budget range? You may say “need advice” if undecided.','Approximate budget range kya hai? Decide nahi hai to “need advice” likh sakte hain.');
 if(!lead.deadline)return reply('Is there a preferred deadline or launch date?','Koi preferred deadline ya launch date hai?');
 if(!lead.full_name)return reply('Please share your full name for the Client Form.','Client Form ke liye apna full name batayein.');
 return completeMessage();
}
function completeMessage(){formButton.hidden=false;return reply(`Your initial brief is ready: ${lead.project_type}; users: ${lead.target_users}; budget: ${lead.budget}; deadline: ${lead.deadline}. I can now prefill the Client Form. You will review every field before submitting or signing.`,`Aapka initial brief ready hai: ${lead.project_type}; users: ${lead.target_users}; budget: ${lead.budget}; deadline: ${lead.deadline}. Main Client Form prefill kar sakta hoon. Submit/sign karne se pehle aap har field review karenge.`)}
function handleActive(text){
 extract(text);const s=clean(text);
 if(cancelIntent(s)){lead={...EMPTY};save();formButton.hidden=true;return reply('Project intake cleared. Ask a TTRL question or say “start my project” whenever ready.','Project intake clear kar diya. Ready hone par “start my project” likhiye.');}
 if(!lead.project_type){extract(s)}
 else if(!lead.project_summary&&!saysYes(s))lead.project_summary=s;
 else if(!lead.target_users&&!saysYes(s))lead.target_users=s;
 else if(!lead.features.length&&!saysYes(s))lead.features=s.split(/[,;\n]|\band\b| aur | और /i).map(clean).filter(Boolean).slice(0,15);
 else if(!lead.budget&&!saysYes(s))lead.budget=s;
 else if(!lead.deadline&&!saysYes(s))lead.deadline=s;
 else if(!lead.full_name&&!saysYes(s))lead.full_name=s;
 save();return nextQuestion();
}
function difference(){return reply('TTRL is different because the work begins with requirement discovery and architecture—not a copied template. Scope, exclusions, acceptance criteria, security, responsive UX, testing, deployment, ownership and support are documented. We do not invent prices, deadlines or capabilities; the final proposal is based on the reviewed Client Form.','TTRL dusre developers se isliye alag hai kyunki kaam copied template se nahi, requirement discovery aur architecture se start hota hai. Scope, exclusions, acceptance criteria, security, responsive UX, testing, deployment, ownership aur support document kiye jaate hain. Hum price, deadline ya capability invent nahi karte; final proposal reviewed Client Form par based hota hai.')}

ask=async function agentAsk(q){
 lastUser=clean(q);if(!lastUser)return;
 if(whyIntent(lastUser)){addMessage(lastUser,'user');chatInput.value='';addMessage(difference());return}
 if(startIntent(lastUser)&&!lead.active){addMessage(lastUser,'user');chatInput.value='';lead={...lead,active:true};extract(lastUser);addMessage(nextQuestion());return}
 if(lead.active){addMessage(lastUser,'user');chatInput.value='';document.querySelector('.aiPanel')?.classList.add('engaged');addMessage(handleActive(lastUser));return}
 return originalAsk(lastUser)
};

function handoff(){
 const draft={draft_saved_at:Date.now(),full_name:lead.full_name,company:lead.company,phone:lead.phone,email:lead.email,project_name:lead.project_name||`${lead.project_type} project`,project_summary:lead.project_summary,target_users:lead.target_users,budget:lead.budget,completion_date:lead.deadline,services:lead.services,service_notes:`Agent-assisted initial brief. Features: ${lead.features.join(', ')}`};
 try{localStorage.setItem('ttrl-agent-prefill',JSON.stringify(draft))}catch{}
 location.href='intake.html?source=agent';
}
formButton?.addEventListener('click',handoff);imageButton?.addEventListener('click',()=>fileInput?.click());
fileInput?.addEventListener('change',async()=>{const file=fileInput.files?.[0];if(!file)return;if(file.size>8*1024*1024){addMessage('Please choose an image smaller than 8 MB.');return}const wait=addMessage('Reading text locally from the image…','bot','thinking');imageButton.disabled=true;try{const {createWorker}=await import('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js');const worker=await createWorker('eng+hin+mar');const result=await worker.recognize(file);await worker.terminate();wait.remove();const text=clean(result.data.text);if(!text)throw new Error('No readable text');addMessage(`Image text found:\n${text}`);chatInput.value=text.slice(0,1000);chatInput.focus()}catch(e){wait.remove();addMessage('I could not read clear text from this image. Try a sharper, straight image with good lighting, or type the requirement.')}finally{imageButton.disabled=false;fileInput.value=''}});

const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!Recognition){mic.disabled=true;mic.title='Voice input is not supported by this browser'}else mic?.addEventListener('click',()=>{const rec=new Recognition();rec.lang=document.documentElement.lang||'en-IN';rec.interimResults=false;rec.maxAlternatives=1;mic.classList.add('listening');mic.querySelector('span').textContent='Listening…';rec.onresult=e=>{chatInput.value=e.results[0][0].transcript;chatInput.focus()};rec.onerror=()=>addMessage('Voice input could not start. Please allow microphone access or type your message.');rec.onend=()=>{mic.classList.remove('listening');mic.querySelector('span').textContent='Speak'};rec.start()});
})();
