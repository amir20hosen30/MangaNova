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
function renderProfile(){const box=$('#profilePage');if(!me){box.innerHTML=`<div class="empty-page"><div class="empty-icon">♙</div><h2>هنوز وارد نشده‌ای</h2><p>برای ذخیره نشانک‌ها و دیدن تاریخچه مطالعه وارد حساب خودت شو.</p><button class="primary" onclick="auth()">ورود / ثبت‌نام</button></div>`;return}box.innerHTML=`<div class="profile-panel"><div class="avatar-wrap"><div class="avatar">${me.avatar?`<img src="${me.avatar}" alt="">`:me.username.slice(0,1).toUpperCase()}</div><label class="avatar-upload">📷 تغییر عکس<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onchange="uploadAvatar(this)"></label></div><div><h2>${me.username}</h2><p class="muted">حساب ${me.role==='admin'?'مدیر':'کاربری'} MangaNova</p></div></div><div class="profile-actions"><button class="primary" onclick="navigate('bookmark')">نشانک‌های من</button>${me.role==='admin'?'<a class="primary" href="/admin">پنل مدیریت</a>':''}<button onclick="logout()">خروج از حساب</button></div>`}

async function uploadAvatar(input){const file=input.files?.[0];if(!file)return;const f=new FormData();f.append('avatar',file);try{const d=await api('/api/profile/avatar',{method:'POST',body:f});me=d.user;renderProfile()}catch(e){alert(e.message)} }
function setTab(tab){document.querySelectorAll('.bottom-item').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab))}
function navigate(tab,replace=false){const valid=['home','explore','bookmark','profile'];if(!valid.includes(tab))tab='home';const path=tab==='home'?'/home':`/${tab==='bookmark'?'bookmarks':tab}`;(replace?history.replaceState:history.pushState).call(history,{},'',path);showPage(tab)}
function showPage(tab){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$('#page-'+tab).classList.add('active');setTab(tab);window.scrollTo({top:0,behavior:'smooth'});if(tab==='explore')setTimeout(()=>$('#search').focus(),180);if(tab==='bookmark')loadFavorites();if(tab==='profile')renderProfile()}
function routeFromUrl(){const p=location.pathname.replace(/\/$/,'');let tab=p==='/explore'?'explore':p==='/bookmarks'?'bookmark':p==='/profile'?'profile':'home';showPage(tab)}
window.addEventListener('popstate',routeFromUrl);
$('#search').oninput=e=>load(e.target.value);$('#searchOpen').onclick=()=>navigate('explore');initFilters();
$('#theme').onclick=()=>{document.body.classList.toggle('light');localStorage.theme=document.body.classList.contains('light')?'light':'dark'};if(localStorage.theme==='light')document.body.classList.add('light');
$('#loginOpen').onclick=()=>{if(me)navigate('profile');else auth()};
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
