let me=null,works=[],filters={sort:'popular',status:'all',type:'all',genre:'all'};const $=s=>document.querySelector(s);
async function api(url,opt={}){let r=await fetch(url,opt),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'خطا');return d}
async function init(){let m=await api('/api/me');me=m.user;renderHeaderProfile();await load();renderProfile();routeFromUrl();if(me)updateUserTicketBadge();}
async function load(q=''){let d=await api('/api/works?q='+encodeURIComponent(q));works=d.works;renderHome(works);applyFilters()}
function card(w,opts){opts=opts||{};const badge=opts.rank?`<span class="card-rank">${opts.rank}</span>`:'';return `<article class="card" onclick="location.href='/novel/${w.id}'"><div class="cover">${badge}${w.cover?`<img src="${w.cover}" alt="">`:''}<b>${w.title}</b></div><div class="info"><b>${w.title}</b><br><small>${w.kind||'اثر'} • ${w.chapter_count||0} فصل</small><div class="card-stats"><span>◉ ${Number(w.views||0).toLocaleString('fa-IR')} بازدید</span>${w.favorite_count?`<span>♥ ${Number(w.favorite_count).toLocaleString('fa-IR')}</span>`:''}${w.rating_avg?`<span>★ ${w.rating_avg}</span>`:''}</div></div></article>`}
function sideThumb(w){return w.cover?`<img src="${w.cover}" alt="">`:`<span>${(w.title||'؟').slice(0,1)}</span>`}
function sideRankItem(w,i){return `<div class="side-item" onclick="location.href='/novel/${w.id}'"><span class="side-rank">${i+1}</span><div class="side-thumb">${sideThumb(w)}</div><div class="side-info"><b>${w.title}</b><small>${w.chapter_count||0} فصل</small></div><span class="side-stat">★ ${w.rating_avg||0}</span></div>`}
function sideViewItem(w,i){return `<div class="side-item" onclick="location.href='/novel/${w.id}'"><span class="side-rank">${i+1}</span><div class="side-thumb">${sideThumb(w)}</div><div class="side-info"><b>${w.title}</b><small>${w.chapter_count||0} فصل</small></div><span class="side-stat">◉ ${Number(w.views||0).toLocaleString('fa-IR')}</span></div>`}
function renderHomeGenres(list){
  const box=$('#homeGenres');
  if(!box)return;
  const freq={};
  list.forEach(w=>String(w.genres||'').split(/[,،|]/).forEach(g=>{g=g.trim();if(g)freq[g]=(freq[g]||0)+1}));
  const icons=['⚔','◈','♛','☻','◇','♡','⌁','♜','◌','◉','☄','◍'];
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,14);
  box.innerHTML=top.length?top.map(([g,n],i)=>`<button type="button" class="home-genre-item" onclick="goGenre('${g.replace(/'/g,"\\'")}')"><span class="home-genre-index">${String(i+1).padStart(2,'0')}</span><span class="home-genre-icon">${icons[i%icons.length]}</span><span class="home-genre-name">${g}</span><span class="home-genre-count">${n} اثر</span><span class="home-genre-arrow">‹</span></button>`).join(''):'<p class="muted side-empty">هنوز ژانری ثبت نشده است.</p>';
}

function goGenre(g){filters.genre=g;document.querySelectorAll('#genreFilters button').forEach(b=>b.classList.toggle('selected',normalize(b.dataset.value)===normalize(g)));applyFilters();navigate('explore')}
function heroStartReading(){const id=window.__heroWorkId;if(id)location.href='/novel/'+id;else navigate('explore')}
function renderHero(w){
  const img=$('#heroFeaturedCover'); const title=$('#heroFeaturedTitle'); const en=$('#heroFeaturedEnglish'); const rating=$('#heroFeaturedRating');
  if(!w)return;
  window.__heroWorkId=w.id;
  if(img){img.src=w.cover||'';img.style.display=w.cover?'block':'none'}
  if(title)title.textContent=w.title||'دنیای مانگا و مانهوا';
  if(en)en.textContent=w.english_title||'MANGA NOVA';
  if(rating)rating.textContent=w.rating_avg||'0';
}
function renderHome(list){
  const latest=[...list].sort((a,b)=>b.id-a.id).slice(0,8);
  const popular=[...list].sort((a,b)=>(b.views||0)-(a.views||0)||(b.favorite_count||0)-(a.favorite_count||0)||b.id-a.id).slice(0,5);
  renderHero(popular[0]||latest[0]);
  $('#latestWorks').innerHTML=latest.map(w=>card(w)).join('')||'<p>هنوز اثری ثبت نشده است.</p>';
  $('#popularWorks').innerHTML=popular.map((w,i)=>card(w,{rank:i+1})).join('')||'<p>هنوز اثری ثبت نشده است.</p>';
  const topRated=[...list].sort((a,b)=>(b.rating_avg||0)-(a.rating_avg||0)||(b.favorite_count||0)-(a.favorite_count||0)||b.id-a.id).slice(0,5);
  const rankBox=$('#topRatedList');if(rankBox)rankBox.innerHTML=topRated.map((w,i)=>sideRankItem(w,i)).join('')||'<p class="muted side-empty">هنوز اثری ثبت نشده است.</p>';
  const mostViewed=[...list].sort((a,b)=>(b.views||0)-(a.views||0)||b.id-a.id).slice(0,5);
  const viewBox=$('#mostViewedList');if(viewBox)viewBox.innerHTML=mostViewed.map((w,i)=>sideViewItem(w,i)).join('')||'<p class="muted side-empty">هنوز اثری ثبت نشده است.</p>';
  renderHomeGenres(list);
}
function renderExplore(list){$('#exploreWorks').innerHTML=list.map(card).join('')||'<p>چیزی پیدا نشد.</p>';$('#resultCount').textContent=`${list.length} اثر`}
function normalize(v){return String(v||'').trim().toLowerCase()}
function applyFilters(){let list=[...works];if(filters.status!=='all')list=list.filter(w=>normalize(w.status)===normalize(filters.status));if(filters.type!=='all')list=list.filter(w=>normalize(w.kind)===normalize(filters.type));if(filters.genre!=='all')list=list.filter(w=>String(w.genres||'').split(/[,،|]/).some(g=>normalize(g)===normalize(filters.genre)));const sort=filters.sort;if(sort==='oldest')list.sort((a,b)=>a.id-b.id);else if(sort==='chapters')list.sort((a,b)=>(b.chapter_count||0)-(a.chapter_count||0)||b.id-a.id);else list.sort((a,b)=>b.id-a.id);renderExplore(list)}
function bindFilterGroup(id,key){document.querySelectorAll('#'+id+' button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#'+id+' button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');filters[key]=btn.dataset.value;if(key!=='sort')applyFilters()}))}
function initFilters(){bindFilterGroup('sortFilters','sort');bindFilterGroup('statusFilters','status');bindFilterGroup('typeFilters','type');bindFilterGroup('genreFilters','genre')}
function toggleFilters(force){const p=$('#filterPanel');if(typeof force==='boolean')p.classList.toggle('show',force);else p.classList.toggle('show')}
function resetFilters(){filters={sort:'popular',status:'all',type:'all',genre:'all'};document.querySelectorAll('.filter-chips button').forEach(b=>b.classList.toggle('selected',b.dataset.value==='all'));document.querySelectorAll('#sortFilters button').forEach(b=>b.classList.toggle('selected',b.dataset.value==='popular'));applyFilters()}
function icon(name){const icons={
 grid:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2H11v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z"/></svg>',bookmark:'<svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21z"/></svg>',
 review:'<svg viewBox="0 0 24 24"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M7 8h10M7 12h7"/></svg>',
 test:'<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 8 2 2 4-4M8 15h8"/></svg>',
 ticket:'<svg viewBox="0 0 24 24"><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M12 7v2m0 3v2m0 3v2"/></svg>',
 info:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/></svg>',
 bell:'<svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
 logout:'<svg viewBox="0 0 24 24"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="m14 8 4 4-4 4M18 12H9"/></svg>'
};return icons[name]||''}
function profileNotice(title,text){openModal(`<div class="box profile-notice"><button class="close" onclick="closeModal()">×</button><div class="notice-icon">${icon('bell')}</div><h2>${title}</h2><p>${text}</p><button class="primary" onclick="closeModal()">باشه</button></div>`)}
function renderHeaderProfile(){const b=$('#profileOpen');if(!b)return;if(me?.avatar)b.innerHTML=`<img class="header-avatar" src="${me.avatar}" alt="پروفایل">`;else b.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6"/></svg>'}
function renderProfile(){const box=$('#profilePage');if(!me){box.innerHTML=`<div class="profile-login"><div class="profile-login-icon">${icon('grid')}</div><h1>پروفایل</h1><p>برای استفاده از کتابخانه و امکانات حساب کاربری وارد MangaNova شو.</p><button class="primary" onclick="auth()">ورود / ثبت‌نام</button></div>`;return}
const avatar=me.avatar?`<img src="${me.avatar}" alt="">`:me.username.slice(0,1).toUpperCase();
box.innerHTML=`<div class="profile-top"><div class="profile-title-row"><button class="profile-back" onclick="navigate('home')">‹</button><h1>پروفایل</h1><span></span></div><div class="profile-user"><div class="avatar-wrap"><div class="avatar">${avatar}</div><label class="avatar-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onchange="uploadAvatar(this)">ویرایش پروفایل</label></div><div class="profile-user-copy"><h2>${me.username}</h2><p>${me.role==='admin'?'مدیر MangaNova':'کاربر MangaNova'}</p></div></div></div>
<div class="profile-menu">
 <button class="profile-menu-item profile-menu-settings" onclick="openSettings()"><span class="menu-icon">${icon('settings')}</span><span><b>تنظیمات</b><small>حساب، اعلان‌ها و مطالعه</small></span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="navigate('bookmark')"><span class="menu-icon">${icon('bookmark')}</span><span>نشانک‌ها</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="profileNotice('نقد و بررسی','برای ثبت نقد و امتیاز، وارد صفحه هر اثر شو و از بخش نقد و امتیاز استفاده کن.');"><span class="menu-icon">${icon('review')}</span><span>نقد و بررسی</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="window.open('https://t.me/HoseinNoir','_blank')"><span class="menu-icon">${icon('test')}</span><span>تست‌ها</span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="openTickets()"><span class="menu-icon">${icon('ticket')}</span><span><b>تیکت‌ها</b><small id="ticketMenuStatus">پشتیبانی و ارتباط با مدیر</small></span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="openNotifications()"><span class="menu-icon">${icon('bell')}</span><span><b>اعلانات</b><small id="notifyMenuStatus">آخرین پاسخ‌ها و اطلاعیه‌ها</small></span><span class="menu-arrow">‹</span></button>
 <button class="profile-menu-item" onclick="profileNotice('درباره MangaNova','MangaNova یک پلتفرم مطالعه آنلاین مانگا و مانهوا با تمرکز بر تجربه سریع و حرفه‌ای است.');"><span class="menu-icon">${icon('info')}</span><span>درباره ما</span><span class="menu-arrow">‹</span></button>
</div><div class="profile-logout"><button class="profile-menu-item danger" onclick="logout()"><span class="menu-icon">${icon('logout')}</span><span>خروج</span><span class="menu-arrow">‹</span></button></div>`}

async function openTickets(){if(!me)return auth();try{const d=await api('/api/me/tickets');const rows=d.tickets.map(t=>`<div class="ticket-row ${t.user_unread?'is-unread':''}"><div class="ticket-row-top"><span class="ticket-status ${t.status}">${t.status==='answered'?'پاسخ داده شد':t.status==='closed'?'بسته شده':'باز'}</span><b>#${t.id} — ${t.subject}</b></div><small>${new Date(t.updated_at).toLocaleString('fa-IR')}</small><p>${t.message}</p>${t.reply?`<p class="ticket-reply"><b>پاسخ مدیر:</b> ${t.reply}</p>`:''}${t.user_unread?`<button class="ticket-read" onclick="markTicketRead(${t.id})">علامت‌گذاری به‌عنوان خوانده‌شده</button>`:''}</div>`).join('');openModal(`<div class="box ticket-box"><button class="close" onclick="closeModal()">×</button><div class="modal-heading"><div class="modal-heading-icon">${icon('ticket')}</div><div><h2>پشتیبانی و تیکت</h2><p>پیامت مستقیم در پنل مدیر MangaNova ثبت می‌شود.</p></div></div><form id="ticketForm" class="form ticket-form"><div class="form-grid"><input id="ticketSubject" placeholder="موضوع، مثل مشکل ورود یا گزارش خطا" maxlength="120" required><select id="ticketPriority"><option>عادی</option><option>مهم</option><option>فوری</option></select></div><textarea id="ticketMessage" rows="6" placeholder="مشکل یا درخواستت را کامل توضیح بده..." maxlength="2000" required></textarea><button class="primary ticket-submit">ارسال تیکت برای مدیر</button></form><div class="ticket-list">${rows||'<div class="empty-state">هنوز تیکتی ارسال نکرده‌ای.</div>'}</div></div>`);$('#ticketForm').onsubmit=async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;try{await api('/api/me/tickets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:$('#ticketSubject').value,message:`[اولویت: ${$('#ticketPriority').value}]\n${$('#ticketMessage').value}`})});openTickets()}catch(err){alert(err.message);btn.disabled=false}}}catch(e){alert(e.message)}}
async function markTicketRead(id){try{await api('/api/me/tickets/'+id+'/read',{method:'PATCH'});openTickets();updateUserTicketBadge()}catch(e){alert(e.message)}}
async function updateUserTicketBadge(){if(!me)return;try{const d=await api('/api/me/tickets');const el=$('#ticketMenuStatus');if(el)el.textContent=d.unread?`${d.unread} پاسخ جدید از مدیر`:'پشتیبانی و ارتباط با مدیر';const n=$('#notifyMenuStatus');if(n)n.textContent=d.unread?`${d.unread} اعلان خوانده‌نشده`:'آخرین پاسخ‌ها و اطلاعیه‌ها'}catch(e){}}
function openNotifications(){openModal(`<div class="box notifications-box"><button class="close" onclick="closeModal()">×</button><div class="modal-heading"><div class="modal-heading-icon">${icon('bell')}</div><div><h2>اعلانات</h2><p>اعلان‌های مربوط به حساب و تیکت‌ها</p></div></div><div class="notification-card"><div class="notification-card-icon">${icon('ticket')}</div><div><b>پشتیبانی</b><p>اگر مدیر به تیکتت پاسخ بدهد، پاسخ در همین بخش و داخل تیکت نمایش داده می‌شود.</p></div></div><button class="primary" onclick="closeModal();openTickets()">مشاهده تیکت‌ها</button></div>`)}
function settingsValue(key,fallback){const p=me?.preferences||{};const v=p[key];return v===undefined?fallback:v}
async function openSettings(){if(!me)return auth();const get=(k,d)=>settingsValue(k,d);openModal(`<div class="box settings-box"><button class="close" onclick="closeModal()">×</button><div class="modal-heading"><div class="modal-heading-icon">${icon('settings')}</div><div><h2>تنظیمات MangaNova</h2><p>تجربه سایت را مطابق سلیقه خودت تنظیم کن.</p></div></div><div class="settings-section"><h3>اعلان‌ها</h3><label class="setting-row"><span><b>پاسخ تیکت‌ها</b><small>وقتی مدیر پاسخ بدهد، اعلان داخل حساب نمایش داده شود.</small></span><input type="checkbox" id="setTicketNotifications" ${get('ticketNotifications',true)?'checked':''}></label><label class="setting-row"><span><b>اعلان‌های سایت</b><small>اطلاعیه‌های مهم MangaNova را دریافت کن.</small></span><input type="checkbox" id="setSiteNotifications" ${get('siteNotifications',true)?'checked':''}></label></div><div class="settings-section"><h3>مطالعه</h3><label class="setting-row"><span><b>ذخیره خودکار پیشرفت</b><small>آخرین فصل و صفحه مطالعه‌شده ذخیره شود.</small></span><input type="checkbox" id="setAutoSave" ${get('autoSaveProgress',true)?'checked':''}></label><label class="setting-control"><span><b>کیفیت تصاویر</b><small>برای سرعت یا کیفیت بیشتر انتخاب کن.</small></span><select id="setImageQuality"><option value="auto" ${get('imageQuality','auto')==='auto'?'selected':''}>خودکار</option><option value="high" ${get('imageQuality','auto')==='high'?'selected':''}>کیفیت بالا</option><option value="data" ${get('imageQuality','auto')==='data'?'selected':''}>مصرف اینترنت کمتر</option></select></label><label class="setting-control"><span><b>عرض مطالعه</b><small>اندازه نمایش صفحات در خواننده.</small></span><select id="setReaderWidth"><option value="normal" ${get('readerWidth','normal')==='normal'?'selected':''}>استاندارد</option><option value="wide" ${get('readerWidth','normal')==='wide'?'selected':''}>عریض</option><option value="full" ${get('readerWidth','normal')==='full'?'selected':''}>تمام‌عرض</option></select></label><label class="setting-row"><span><b>نمایش آمار آثار</b><small>بازدید و امتیاز روی کارت آثار نمایش داده شود.</small></span><input type="checkbox" id="setShowStats" ${get('showStats',true)?'checked':''}></label></div><div class="settings-section"><h3>حساب کاربری</h3><div class="account-mini"><span>${me.avatar?`<img src="${me.avatar}" alt="">`:me.username.slice(0,1).toUpperCase()}</span><div><b>${me.username}</b><small>${me.role==='admin'?'مدیر MangaNova':'حساب کاربری MangaNova'}</small></div></div></div><button class="primary settings-save" onclick="saveSettings()">ذخیره تنظیمات</button></div>`)}
async function saveSettings(){const preferences={ticketNotifications:$('#setTicketNotifications').checked,siteNotifications:$('#setSiteNotifications').checked,autoSaveProgress:$('#setAutoSave').checked,imageQuality:$('#setImageQuality').value,readerWidth:$('#setReaderWidth').value,showStats:$('#setShowStats').checked};try{const d=await api('/api/me/preferences',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(preferences)});me.preferences=d.preferences;closeModal();renderProfile();updateUserTicketBadge();profileNotice('ذخیره شد','تنظیمات حساب شما با موفقیت ذخیره شد.')}catch(e){alert(e.message)}}
async function uploadAvatar(input){const file=input.files?.[0];if(!file)return;const f=new FormData();f.append('avatar',file);try{const d=await api('/api/profile/avatar',{method:'POST',body:f});me=d.user;renderHeaderProfile();renderProfile()}catch(e){alert(e.message)} }
function setTab(tab){document.querySelectorAll('.bottom-item').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab))}
function navigate(tab,replace=false){const valid=['home','explore','bookmark','profile'];if(!valid.includes(tab))tab='home';const path=tab==='home'?'/home':`/${tab==='bookmark'?'bookmarks':tab}`;(replace?history.replaceState:history.pushState).call(history,{},'',path);showPage(tab)}
function showPage(tab){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$('#page-'+tab).classList.add('active');setTab(tab);window.scrollTo({top:0,behavior:'smooth'});if(tab==='explore')setTimeout(()=>$('#search').focus(),180);if(tab==='bookmark')loadFavorites();if(tab==='profile')renderProfile()}
function routeFromUrl(){const p=location.pathname.replace(/\/$/,'');let tab=p==='/explore'?'explore':p==='/bookmarks'?'bookmark':p==='/profile'?'profile':'home';showPage(tab)}
window.addEventListener('popstate',routeFromUrl);
$('#search').oninput=e=>load(e.target.value);$('#searchOpen').onclick=()=>navigate('explore');initFilters();
document.body.classList.remove('light');try{localStorage.removeItem('theme')}catch(e){}
$('#loginOpen').onclick=()=>{if(me)navigate('profile');else auth()};
$('#profileOpen').onclick=()=>{if(me)navigate('profile');else auth()};
$('#notifyOpen').onclick=()=>profileNotice('اعلانات','فعلاً اعلان جدیدی برای شما ثبت نشده است.');
async function loadFavorites(){const who=$('#who'),box=$('#favorites');if(!me){if(who)who.textContent='';if(box)box.innerHTML='';return}let d=await api('/api/me/favorites');if(who)who.textContent=`${d.works.length} اثر ذخیره شده`;if(box)box.innerHTML=d.works.map(card).join('')}
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
