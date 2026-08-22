let me=null,works=[],filters={sort:'popular',status:'all',type:'all',genre:'all'};const $=s=>document.querySelector(s);
async function api(url,opt={}){let r=await fetch(url,opt),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'خطا');return d}
async function init(){let m=await api('/api/me');me=m.user;await load();renderProfile();routeFromUrl();}
async function load(q=''){let d=await api('/api/works?q='+encodeURIComponent(q));works=d.works;renderHome(works);applyFilters()}
function card(w){return `<article class="card" onclick="location.href='/novel/${w.id}'"><div class="cover">${w.cover?`<img src="${w.cover}" alt="">`:''}<b>${w.title}</b></div><div class="info"><b>${w.title}</b><br><small>${w.kind||'اثر'} • ${w.chapter_count||0} فصل</small><div class="card-stats"><span>◉ ${Number(w.views||0).toLocaleString('fa-IR')} بازدید</span>${w.favorite_count?`<span>♥ ${Number(w.favorite_count).toLocaleString('fa-IR')}</span>`:''}</div></div></article>`}
function renderHome(list){const latest=[...list].sort((a,b)=>b.id-a.id).slice(0,8);const popular=[...list].sort((a,b)=>(b.views||0)-(a.views||0)||(b.favorite_count||0)-(a.favorite_count||0)||b.id-a.id).slice(0,8);$('#latestWorks').innerHTML=latest.map(card).join('')||'<p>هنوز اثری ثبت نشده است.</p>';$('#popularWorks').innerHTML=popular.map(card).join('')||'<p>هنوز اثری ثبت نشده است.</p>'}
function renderExplore(list){$('#exploreWorks').innerHTML=list.map(card).join('')||'<p>چیزی پیدا نشد.</p>';$('#resultCount').textContent=`${list.length} اثر`}
function normalize(v){return String(v||'').trim().toLowerCase()}
function applyFilters(){let list=[...works];if(filters.status!=='all')list=list.filter(w=>normalize(w.status)===normalize(filters.status));if(filters.type!=='all')list=list.filter(w=>normalize(w.kind)===normalize(filters.type));if(filters.genre!=='all')list=list.filter(w=>String(w.genres||'').split(/[,،|]/).some(g=>normalize(g)===normalize(filters.genre)));const sort=filters.sort;if(sort==='oldest')list.sort((a,b)=>a.id-b.id);else if(sort==='chapters')list.sort((a,b)=>(b.chapter_count||0)-(a.chapter_count||0)||b.id-a.id);else list.sort((a,b)=>b.id-a.id);renderExplore(list)}
function bindFilterGroup(id,key){document.querySelectorAll('#'+id+' button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');filters[key]=btn.dataset.value;if(key!=='sort')applyFilters()}))}
function initFilters(){bindFilterGroup('sortFilters','sort');bindFilterGroup('statusFilters','status');bindFilterGroup('typeFilters','type');bindFilterGroup('genreFilters','genre')}
function toggleFilters(force){const p=$('#filterPanel');if(typeof force==='boolean')p.classList.toggle('show',force);else p.classList.toggle('show')}
function resetFilters(){filters={sort:'popular',status:'all',type:'all',genre:'all'};document.querySelectorAll('.filter-chips button').forEach(b=>b.classList.toggle('selected',b.dataset.value==='all'));document.querySelectorAll('#sortFilters button').forEach(b=>b.classList.toggle('selected',b.dataset.value==='popular'));applyFilters()}
function icon(name){const icons={
 grid:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1-1.7 2.9-.2-.1c-.7-.4-1.5-.4-2.2 0l-.2.1-1.7-1-.1.2c-.3.8-1 1.3-1.9 1.3H8.2c-.9 0-1.6-.5-1.9-1.3l-.1-.2-1.7 1-.2-.1-1.7-2.9.1-.1c.6-.5.9-1.2.9-2s-.3-1.5-.9-2l-.1-.1 1.7-2.9.2.1c.7.4 1.5.4 2.2 0l.2-.1 1.7 1 .1-.2c.3-.8 1-1.3 1.9-1.3h3.4c.9 0 1.6.5 1.9 1.3l.1.2 1.7-1 .2.1 1.7 2.9-.1.1c-.6.5-.9 1.2-.9 2s.3 1.5.9 2Z"/></svg>',
 bookmark:'<svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21z"/></svg>',
 review:'<svg viewBox="0 0 24 24"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M7 8h10M7 12h7"/></svg>',
 test:'<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 8 2 2 4-4M8 15h8"/></svg>',
 ticket:'<svg viewBox="0 0 24 24"><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M12 7v2m0 3v2m0 3v2"/></svg>',
 bell:'<svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
 logout:'<svg viewBox="0 0 24 24"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="m14 8 4 4-4 4M18 12H9"/></svg>'
};return icons[name]||''}
function profileNotice(title,text){openModal(`<div class="box profile-notice"><button class="close" onclick="closeModal()">×</button><div class="notice-icon">${icon('bell')}</div><h2>${title}</h2><p>${text}</p><button class="primary" onclick="closeModal()">باشه</button></div>`)}
function renderProfile(){const box=$('#profilePage');if(!me){box.innerHTML=`<div class="profile-login"><div class="profile-login-icon">${icon('grid')}</div><h1>پروفایل</h1><p>برای استفاده از کتابخانه و امکانات حساب کاربری وارد MangaNova شو.</p><button class="primary" onclick="auth()">ورود / ثبت‌نام</button></div>`;return}
const avatar=me.avatar?`<img src="${me.avatar}" alt="">`:me.username.slice(0,1).toUpperCase();
box.innerHTML=`<div class="profile-top"><div class="profile-title-row"><button class="profile-back" onclick="navigate('home')">‹</button><h1>پروفایل</h1><span></span></div><div class="profile-user"><div class="avatar-wrap"><div class="avatar">${avatar}</div><label class="avatar-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onchange="uploadAvatar(this)">ویرایش پروفایل</label></div><div class="profile-user-copy"><h2>${me.username}</h2><p>${me.role==='admin'?'مدیر MangaNova':'کاربر MangaNova'}</p></div></div></div>
<div class="profile-menu">
 <button class="profile-menu-item" onclick="profileNotice('تنظیمات','تنظیمات ظاهری و حساب کاربری از همین بخش در نسخه بعدی کامل‌تر می‌شود.');"><span class="menu-icon">${icon('settings')}</span><span>تنظیمات</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="navigate('bookmark')"><span class="menu-icon">${icon('bookmark')}</span><span>نشانک‌ها</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="profileNotice('نقد و بررسی','برای ثبت نقد و امتیاز، وارد صفحه هر اثر شو و از بخش نقد و امتیاز استفاده کن.');"><span class="menu-icon">${icon('review')}</span><span>نقد و بررسی</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="profileNotice('تست‌ها','بخش تست‌ها به‌زودی به MangaNova اضافه می‌شود.');"><span class="menu-icon">${icon('test')}</span><span>تست‌ها</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="profileNotice('تیکت‌ها','سیستم پشتیبانی و تیکت‌ها به‌زودی فعال می‌شود.');"><span class="menu-icon">${icon('ticket')}</span><span>تیکت‌ها</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="profileNotice('اعلانات','فعلاً اعلان جدیدی برای شما ثبت نشده است.');"><span class="menu-icon">${icon('bell')}</span><span>اعلانات</span><span class="menu-arrow">‹</span></button>
</div><div class="profile-logout"><button class="profile-menu-item danger" onclick="logout()"><span class="menu-icon">${icon('logout')}</span><span>خروج</span><span class="menu-arrow">‹</span></button></div>`}

async function uploadAvatar(input){const file=input.files?.[0];if(!file)return;const f=new FormData();f.append('avatar',file);try{const d=await api('/api/profile/avatar',{method:'POST',body:f});me=d.user;renderProfile()}catch(e){alert(e.message)} }
function setTab(tab){document.querySelectorAll('.bottom-item').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab))}
function navigate(tab,replace=false){const valid=['home','explore','bookmark','profile'];if(!valid.includes(tab))tab='home';const path=tab==='home'?'/home':`/${tab==='bookmark'?'bookmarks':tab}`;(replace?history.replaceState:history.pushState).call(history,{},'',path);showPage(tab)}
function showPage(tab){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$('#page-'+tab).classList.add('active');setTab(tab);window.scrollTo({top:0,behavior:'smooth'});if(tab==='explore')setTimeout(()=>$('#search').focus(),180);if(tab==='bookmark')loadFavorites();if(tab==='profile')renderProfile()}
function routeFromUrl(){const p=location.pathname.replace(/\/$/,'');let tab=p==='/explore'?'explore':p==='/bookmarks'?'bookmark':p==='/profile'?'profile':'home';showPage(tab)}
window.addEventListener('popstate',routeFromUrl);
$('#search').oninput=e=>load(e.target.value);$('#searchOpen').onclick=()=>navigate('explore');initFilters();
$('#theme').onclick=()=>{document.body.classList.toggle('light');localStorage.theme=document.body.classList.contains('light')?'light':'dark'};if(localStorage.theme==='light')document.body.classList.add('light');
$('#loginOpen').onclick=()=>{if(me)navigate('profile');else auth()};
$('#profileOpen').onclick=()=>{if(me)navigate('profile');else auth()};
$('#notifyOpen').onclick=()=>profileNotice('اعلانات','فعلاً اعلان جدیدی برای شما ثبت نشده است.');
async function loadFavorites(){if(!me){$('#who').textContent='';$('#favorites').innerHTML='<div class="empty-page"><div class="empty-icon">🔖</div><h2>برای دیدن نشانک‌ها وارد شو</h2><p>بعد از ورود، هر اثری را که دوست داری با یک لمس ذخیره کن.</p><button class="primary" onclick="auth()">ورود / ثبت‌نام</button></div>';return}let d=await api('/api/me/favorites');$('#who').textContent=`${d.works.length} اثر ذخیره شده`;$('#favorites').innerHTML=d.works.map(card).join('')||'<div class="empty-page"><div class="empty-icon">🔖</div><h2>کتابخانه خالی است</h2><p>از صفحه کاوش، آثار موردعلاقه‌ات را به نشانک‌ها اضافه کن.</p><button class="primary" onclick="navigate(\'explore\')">رفتن به کاوش</button></div>'}
function profile(){navigate('profile')}
async function logout(){await api('/api/logout',{method:'POST'});location.href='/profile'}
async function auth(){openModal(`<div class="box"><button class="close" onclick="closeModal()">×</button><h2>ورود / ثبت‌نام</h2><div class="form"><input id="u" placeholder="نام کاربری"><input id="p" type="password" placeholder="رمز عبور"><button class="primary" onclick="login()">ورود</button><button onclick="register()">ساخت حساب جدید</button></div><p id="msg"></p></div>`)}
async function login(){try{await api('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('#u').value,password:$('#p').value})});location.href='/profile'}catch(e){$('#msg').textContent=e.message}}
async function register(){try{await api('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('#u').value,password:$('#p').value})});location.href='/profile'}catch(e){$('#msg').textContent=e.message}}
async function details(id){location.href='/novel/'+id;return;
let w=await api('/api/works/'+id);
openModal(`<div class="detail-page">
<button class="close" onclick="closeModal()">×</button>
<div class="detail-cover">${w.cover?`<img src="${w.cover}">`:''}</div>
<h1>${w.title}</h1>
<div class="tags">${(w.genres||'').split(/[,،|]/).map(x=>`<span>${x}</span>`).join('')}</div>
<div class="meta">
<p>نوع: <b>${w.kind||'-'}</b></p>
<p>سال انتشار: ${w.year||'-'}</p>
<p>نویسنده: ${w.author||'-'}</p>
<p>آخرین چپتر: ${w.chapter_count||0}</p>
</div>
<button class="primary" onclick="fav(${id})">${w.favorite?'حذف از کتابخانه':'افزودن به کتابخانه'}</button>
<h2>خلاصه داستان</h2>
<p class="description">${w.description||'توضیحی ثبت نشده است.'}</p>
<h2>فصل‌ها</h2>
<div>${w.chapters.map(c=>`<div class="chapter" onclick="reader(${c.id})">فصل ${c.number} — ${c.title}</div>`).join('')||'هنوز فصلی ثبت نشده.'}</div>
</div>`) }
async function fav(id){if(!me)return auth();await api('/api/works/'+id+'/favorite',{method:'POST'});if(location.pathname==='/bookmarks')loadFavorites();details(id)}
async function reader(id){location.href='/reader/'+id;return;let c=await api('/api/chapters/'+id);openModal(`<div class="reader"><div class="box"><button class="close" onclick="closeModal()">×</button><h2>${c.work_title} — فصل ${c.number}</h2><div class="pages">${c.pages.map((p,i)=>`<img src="${p.image}" loading="lazy" onload="track(${c.work_id},${c.id},${i+1})">`).join('')}</div><div style="display:flex;justify-content:space-between"><button onclick="${c.prev?`reader(${c.prev.id})`:'void(0)'}">← فصل قبل</button><button onclick="${c.next?`reader(${c.next.id})`:'void(0)'}">فصل بعد →</button></div></div></div>`)}
async function track(w,c,p){if(me&&p%3===0)api('/api/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({work_id:w,chapter_id:c,last_page:p})}).catch(()=>{})}
function openModal(h){$('#modal').innerHTML=h;$('#modal').classList.add('show')}function closeModal(){$('#modal').classList.remove('show')}window.onclick=e=>{if(e.target===$('#modal'))closeModal()}
init();

document.addEventListener("DOMContentLoaded",()=>{
 document.querySelectorAll(".accordion-title").forEach(t=>{
  t.addEventListener("click",()=>{
   const section=t.closest(".filter-section");
   document.querySelectorAll(".filter-section").forEach(x=>{if(x!==section)x.classList.add("collapsed")});
   section.classList.toggle("collapsed");
  });
 });
});
