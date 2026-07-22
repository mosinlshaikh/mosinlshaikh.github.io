/* TTRL website-scoped client agent. No server AI/API key is used. */
(()=>{
'use strict';
const chatForm=document.querySelector('.aiForm'),chatInput=document.querySelector('#aiInput');
const mic=document.querySelector('.aiMic'),imageButton=document.querySelector('.aiImage');
const fileInput=document.querySelector('.aiFile'),formButton=document.querySelector('.aiFormOpen');
if(!chatForm||!chatInput||typeof addMessage!=='function'||typeof ask!=='function')return;

const originalAsk=ask;
const EMPTY={active:false,ready:false,language:'',stage:'',project_type:'',project_name:'',project_summary:'',target_users:'',features:[],budget:'',deadline:'',full_name:'',company:'',phone:'',email:'',services:[]};
let lead={...EMPTY};
try{lead={...EMPTY,...JSON.parse(sessionStorage.getItem('ttrl-agent-lead')||'{}')}}catch{}
const save=()=>{try{sessionStorage.setItem('ttrl-agent-lead',JSON.stringify(lead))}catch{}};
const clean=s=>String(s||'').trim();
const canon=s=>clean(s).toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/\s+/g,' ');
const isHindi=s=>/[\u0900-\u097f]/u.test(s);
const hinglish=s=>!isHindi(s)&&/\b(mujhe|hamare|banana|banwana|chahiye|mera|meri|kya|kaise|ke liye|wala|wali|hai)\b/i.test(s);
const saysYes=s=>/^(yes|haan|ha|ji|हां|हाँ|हो|होय|sure|ok|okay)\b/i.test(clean(s));
const startIntent=s=>{const q=canon(s);if(/(start my project|start project|client form|form (bhar|fill)|(?:i |we )?(?:need|want|would like|am looking for|are looking for).{0,45}(?:website|web site|software|softwere|app|system|automation|chatbot)|build (?:me|us|a) .{0,35}(?:website|software|app|system)|project (banana|banwana|chahiye)|website (banana|banwana|chahiye)|software (banana|banwana|chahiye)|app (banana|banwana|chahiye)|मुझे.+(वेबसाइट|सॉफ्टवेयर|ऐप)|प्रोजेक्ट.+(बनाना|चाहिए)|वेबसाइट.+(हवी|पाहिजे)|सॉफ्टवेअर.+(हवे|पाहिजे))/iu.test(q))return true;try{const lang=detectQueryLanguage(s),terms=lang&&MULTILINGUAL_TERMS[lang];return !!terms?.build?.some(term=>q.includes(String(term).toLowerCase()))}catch{return false}};
const whyIntent=s=>/(why (choose|ttrl)|different from|other developers|dusre developer|alag kyu|alag ky|हम.+अलग|क्यों चुनें|का निवड)/iu.test(canon(s));
const cancelIntent=s=>/(cancel|stop|restart|start over|बंद|रद्द|फिर से)/iu.test(canon(s));

function detectType(text){const s=canon(text);if(/e[ -]?commerce|online store|shop website/.test(s))return 'E-commerce';if(/billing|pos|medical shop|pharmacy|बिलिंग|मेडिकल दुकान|औषध दुकान/.test(s))return 'Billing/POS software';if(/mobile app|android|ios|apk|मोबाइल ऐप|मोबाईल अॅप/.test(s))return 'Mobile app';if(/desktop|windows software|\.exe|डेस्कटॉप/.test(s))return 'Desktop software';if(/website|web site|वेबसाइट|वेबसाईट/.test(s))return 'Website';if(/software|softwere|sofware|सॉफ्टवेयर|सॉफ्टवेअर/.test(s))return 'Custom software';if(/excel|vba|power bi|dashboard/.test(s))return 'Business automation';if(/ai agent|chatbot|agentic ai/.test(s))return 'AI agent/chatbot';return ''}
function extract(text){const s=clean(text),type=detectType(s);if(type){lead.project_type=type;const formService=type==='Custom software'?'Enterprise software':type==='Billing/POS software'?'Management system':type;if(!lead.services.includes(formService))lead.services.push(formService)}
 const money=s.match(/(?:budget|बजट|around|upto|up to|तक)?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)\s*(k|thousand|lakh|lac)?/i);if(money&&/(budget|बजट|₹|rs\.?|inr|lakh|lac|thousand|\bk\b)/i.test(s))lead.budget=money[0].trim();
 const email=s.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);if(email)lead.email=email[0];
 const phone=s.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/);if(phone)lead.phone=phone[0];
 const deadline=s.match(/(?:\bdeadline\b|\bwithin\b|\bin\b|तक|अंदर)\s+([^,.]{2,30})/i);if(deadline&&!lead.deadline)lead.deadline=deadline[1].trim();
 save();return type}
function agentLanguage(text=lastUser){if(hinglish(text))return 'hinglish';try{return detectQueryLanguage(text)||'en'}catch{return isHindi(text)?'hi':'en'}}
const COPY={
 en:{type:'What would you like to build: a website, mobile app, desktop software, billing/POS system, AI agent, automation, or something else?',summary:t=>`Understood: ${t}. Please describe the business goal and the main problem it should solve.`,users:'Who will use it—for example customers, staff, admin, vendors, students, or the public?',features:'List the most important features. You may send them in one message or attach an image of your notes.',budget:'What is your approximate budget range? You may say “need advice” if undecided.',deadline:'Is there a preferred deadline or launch date?',name:'Please share your full name for the Client Form.'},
 hinglish:{type:'Aap kya banwana chahte hain—website, mobile app, desktop software, billing/POS system, AI agent, automation ya kuch aur?',summary:t=>`Samajh gaya: ${t}. Ab business goal aur ye system kaunsi main problem solve karega, batayein.`,users:'Isko kaun use karega—customers, staff, admin, vendors, students ya general public?',features:'Sabse important features ek message mein batayein, ya apne notes ki image attach karein.',budget:'Approximate budget range kya hai? Decide nahi hai to “need advice” likh sakte hain.',deadline:'Koi preferred deadline ya launch date hai?',name:'Client Form ke liye apna full name batayein.'},
 hi:{type:'आप क्या बनवाना चाहते हैं—वेबसाइट, मोबाइल ऐप, डेस्कटॉप सॉफ्टवेयर, बिलिंग/POS सिस्टम, AI एजेंट, ऑटोमेशन या कुछ और?',summary:t=>`समझ गया: ${t}। कृपया व्यवसाय का लक्ष्य और यह सिस्टम कौन-सी मुख्य समस्या हल करेगा, बताइए।`,users:'इसे कौन उपयोग करेगा—ग्राहक, कर्मचारी, एडमिन, विक्रेता, विद्यार्थी या आम लोग?',features:'सबसे महत्वपूर्ण फीचर्स एक संदेश में लिखें या अपने नोट्स की तस्वीर अपलोड करें।',budget:'आपकी अनुमानित बजट सीमा क्या है? तय नहीं है तो “सलाह चाहिए” लिख सकते हैं।',deadline:'क्या कोई पसंदीदा अंतिम तिथि या लॉन्च की तारीख है?',name:'Client Form के लिए अपना पूरा नाम बताइए।'},
 mr:{type:'तुम्हाला काय तयार करून घ्यायचे आहे—वेबसाइट, मोबाइल अॅप, डेस्कटॉप सॉफ्टवेअर, बिलिंग/POS प्रणाली, AI एजंट, ऑटोमेशन किंवा काही वेगळे?',summary:t=>`समजले: ${t}. व्यवसायाचे उद्दिष्ट आणि ही प्रणाली कोणती मुख्य समस्या सोडवेल ते सांगा.`,users:'ही प्रणाली कोण वापरेल—ग्राहक, कर्मचारी, अॅडमिन, विक्रेते, विद्यार्थी की सर्वसामान्य लोक?',features:'सर्वात महत्त्वाची फीचर्स एका संदेशात लिहा किंवा तुमच्या नोट्सची प्रतिमा अपलोड करा.',budget:'तुमची अंदाजे बजेट श्रेणी किती आहे? ठरलेली नसेल तर “सल्ला हवा” लिहा.',deadline:'तुमच्याकडे अपेक्षित अंतिम तारीख किंवा लॉन्चची तारीख आहे का?',name:'Client Form साठी तुमचे पूर्ण नाव सांगा.'}
};
function currentLanguage(){return (lead.active||lead.ready)&&lead.language?lead.language:agentLanguage()}
function copy(){return COPY[currentLanguage()]||COPY.en}
function reply(en,roman,hi=roman,mr=hi){const l=currentLanguage();return l==='hinglish'?roman:l==='hi'?hi:l==='mr'?mr:en}
let lastUser='';
function nextQuestion(){
 const c=copy();
 if(!lead.project_type)return c.type;
 if(!lead.project_summary)return c.summary(lead.project_type);
 if(!lead.target_users)return c.users;
 if(!lead.features.length)return c.features;
 if(!lead.budget)return c.budget;
 if(!lead.deadline)return c.deadline;
 if(!lead.full_name)return c.name;
 return completeMessage();
}
function completeMessage(){formButton.hidden=false;lead.active=false;lead.ready=true;save();return reply(`Your initial brief is ready: ${lead.project_type}; users: ${lead.target_users}; budget: ${lead.budget}; deadline: ${lead.deadline}. I can now prefill the Client Form. You will review every field before submitting or signing.`,`Aapka initial brief ready hai: ${lead.project_type}; users: ${lead.target_users}; budget: ${lead.budget}; deadline: ${lead.deadline}. Main Client Form prefill kar sakta hoon. Submit/sign karne se pehle aap har field review karenge.`,`आपका प्रारंभिक विवरण तैयार है: ${lead.project_type}; उपयोगकर्ता: ${lead.target_users}; बजट: ${lead.budget}; समय-सीमा: ${lead.deadline}। अब मैं Client Form पहले से भर सकता हूँ। जमा करने या हस्ताक्षर करने से पहले आप हर फ़ील्ड जाँचेंगे।`,`तुमचा प्राथमिक प्रकल्प तपशील तयार आहे: ${lead.project_type}; वापरकर्ते: ${lead.target_users}; बजेट: ${lead.budget}; अंतिम मुदत: ${lead.deadline}. आता Client Form पूर्वभरता येईल. सबमिट किंवा सही करण्यापूर्वी तुम्ही प्रत्येक फील्ड तपासाल.`)}
function handleActive(text){
 const s=clean(text),needed=!lead.project_type?'project_type':!lead.project_summary?'project_summary':!lead.target_users?'target_users':!lead.features.length?'features':!lead.budget?'budget':!lead.deadline?'deadline':!lead.full_name?'full_name':'complete';extract(text);
 if(cancelIntent(s)){lead={...EMPTY};save();formButton.hidden=true;return reply('Project intake cleared. Ask a TTRL question or say “start my project” whenever ready.','Project intake clear kar diya. Ready hone par “start my project” likhiye.');}
 if(needed==='project_summary'&&!saysYes(s))lead.project_summary=s;
 else if(needed==='target_users'&&!saysYes(s))lead.target_users=s;
 else if(needed==='features'&&!saysYes(s))lead.features=s.split(/[,;\n]|\band\b| aur | और | आणि /i).map(clean).filter(Boolean).slice(0,15);
 else if(needed==='budget'&&!saysYes(s)&&!lead.budget)lead.budget=s;
 else if(needed==='deadline'&&!saysYes(s)&&!lead.deadline)lead.deadline=s;
 else if(needed==='full_name'&&!saysYes(s))lead.full_name=s;
 save();return nextQuestion();
}
function difference(){return reply('TTRL is different because the work begins with requirement discovery and architecture—not a copied template. Scope, exclusions, acceptance criteria, security, responsive UX, testing, deployment, ownership and support are documented. We do not invent prices, deadlines or capabilities; the final proposal is based on the reviewed Client Form.','TTRL dusre developers se isliye alag hai kyunki kaam copied template se nahi, requirement discovery aur architecture se start hota hai. Scope, exclusions, acceptance criteria, security, responsive UX, testing, deployment, ownership aur support document kiye jaate hain. Hum price, deadline ya capability invent nahi karte; final proposal reviewed Client Form par based hota hai.','TTRL अलग है क्योंकि काम copied template से नहीं, requirement discovery और architecture से शुरू होता है। Scope, exclusions, acceptance criteria, security, responsive UX, testing, deployment, ownership और support लिखित रूप में तय किए जाते हैं। हम कीमत, समय-सीमा या capability गढ़ते नहीं; final proposal जाँचे हुए Client Form पर आधारित होता है।','TTRL वेगळे आहे कारण काम copied template पासून नव्हे तर requirement discovery आणि architecture पासून सुरू होते. Scope, exclusions, acceptance criteria, security, responsive UX, testing, deployment, ownership आणि support लिखित स्वरूपात ठरवले जातात. किंमत, वेळ किंवा capability बनवून सांगितली जात नाही; final proposal तपासलेल्या Client Form वर आधारित असतो.')}

ask=async function agentAsk(q){
 lastUser=clean(q);if(!lastUser)return;
 if(cancelIntent(lastUser)&&lead.ready){addMessage(lastUser,'user');chatInput.value='';const cleared=reply('Saved brief cleared.','Saved brief clear kar diya.','सहेजा गया विवरण हटा दिया गया है।','जतन केलेला तपशील हटवला आहे.');lead={...EMPTY};save();formButton.hidden=true;addMessage(cleared);return}
 if(whyIntent(lastUser)){addMessage(lastUser,'user');chatInput.value='';addMessage(difference());return}
 if(startIntent(lastUser)&&!lead.active){addMessage(lastUser,'user');chatInput.value='';const language=agentLanguage(lastUser);lead=lead.ready?{...EMPTY,active:true,language}:{...lead,active:true,language};formButton.hidden=true;extract(lastUser);addMessage(nextQuestion());return}
 if(lead.active){addMessage(lastUser,'user');chatInput.value='';document.querySelector('.aiPanel')?.classList.add('engaged');addMessage(handleActive(lastUser));return}
 return originalAsk(lastUser)
};

function handoff(){
 const draft={draft_saved_at:Date.now(),full_name:lead.full_name,company:lead.company,phone:lead.phone,email:lead.email,project_name:lead.project_name||`${lead.project_type} project`,project_summary:lead.project_summary,target_users:lead.target_users,budget:lead.budget,deadline_reason:lead.deadline,services:lead.services,service_notes:`Agent-assisted initial brief. Features: ${lead.features.join(', ')}`};
 try{localStorage.setItem('ttrl-agent-prefill',JSON.stringify(draft))}catch{}
}
formButton?.addEventListener('click',handoff);imageButton?.addEventListener('click',()=>fileInput?.click());
fileInput?.addEventListener('change',async()=>{const file=fileInput.files?.[0];if(!file)return;if(file.size>8*1024*1024){addMessage('Please choose an image smaller than 8 MB.');return}const wait=addMessage('Reading text locally from the image…','bot','thinking');imageButton.disabled=true;try{const {createWorker}=await import('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js');const worker=await createWorker('eng+hin+mar');const result=await worker.recognize(file);await worker.terminate();wait.remove();const text=clean(result.data.text);if(!text)throw new Error('No readable text');addMessage(`Image text found:\n${text}`);chatInput.value=text.slice(0,1000);chatInput.focus()}catch(e){wait.remove();addMessage('I could not read clear text from this image. Try a sharper, straight image with good lighting, or type the requirement.')}finally{imageButton.disabled=false;fileInput.value=''}});

const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!Recognition){mic.disabled=true;mic.title='Voice input is not supported by this browser'}else mic?.addEventListener('click',()=>{const rec=new Recognition();rec.lang=document.documentElement.lang||'en-IN';rec.interimResults=false;rec.maxAlternatives=1;mic.classList.add('listening');mic.querySelector('span').textContent='Listening…';rec.onresult=e=>{chatInput.value=e.results[0][0].transcript;chatInput.focus()};rec.onerror=()=>addMessage('Voice input could not start. Please allow microphone access or type your message.');rec.onend=()=>{mic.classList.remove('listening');mic.querySelector('span').textContent='Speak'};rec.start()});
if(lead.ready||(lead.project_type&&lead.project_summary&&lead.target_users&&lead.features.length&&lead.budget&&lead.deadline&&lead.full_name))formButton.hidden=false;
})();
