(() => {
    'use strict';
    const $ = window.jQuery;
    // The original menu plugin and Bootstrap provide the same dropdown/mobile/modal behavior.
    document.querySelectorAll('[data-original]').forEach(image => { image.src = image.dataset.original; });
    document.querySelectorAll('.wow').forEach(el => { el.style.visibility = 'visible'; });
    document.querySelectorAll('.count-number[data-max]').forEach(el=>{el.textContent=el.dataset.max;});
    window.addEventListener('scroll',()=>document.querySelector('.topnav')?.classList.toggle('nav-scroll',window.scrollY>0),{passive:true});
    // Index quotes alternate as complete rows. The old rotated Owl carousel allowed
    // its outgoing and incoming slides to occupy the same visible space.
    const indexItems=[...document.querySelectorAll('.nifty_view_carousel > .item')];
    let activeIndex=0;
    const showIndex=()=>indexItems.forEach((item,index)=>{
        item.classList.toggle('is-index-active',index===activeIndex);
        item.setAttribute('aria-hidden',String(index!==activeIndex));
    });
    showIndex();
    if(indexItems.length>1)setInterval(()=>{activeIndex=(activeIndex+1)%indexItems.length;showIndex();},5000);
    if ($?.fn.owlCarousel) {
        $('.testimonial_carousel').owlCarousel({items:1,loop:true,autoplay:true,autoplayTimeout:6000,nav:false,dots:true});
        $('.who_we_are_carousel,.who_carousel,.leadership_carousel').each(function(){if(!$(this).hasClass('owl-loaded'))$(this).owlCarousel({items:1,loop:true,autoplay:true,dots:true});});
        $('.owl-carousel').not('.nifty_view_carousel').each(function(){if(!$(this).hasClass('owl-loaded'))$(this).owlCarousel({items:1,loop:$(this).children().length>1,autoplay:true,dots:true});});
    }
    if ($?.fn.particleground && document.querySelector('#particles')) $('#particles').particleground({dotColor:'#b79a59',lineColor:'#b79a59',particleRadius:4,density:14000});
    document.querySelectorAll('.popup-overlay').forEach(overlay => {
        const isAttention = overlay.id === 'AttentionOverlay';
        overlay.style.display = isAttention ? 'none' : 'flex';
        const container=overlay.querySelector('.popup-container');if(container){container.style.opacity='1';container.style.transform='scale(1)';}
        overlay.querySelectorAll('#close-popup,#close-popup-attention').forEach(button => button.addEventListener('click',()=>{overlay.style.display='none';sessionStorage.setItem('marwadi-notice-dismissed','1');}));
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.popup-overlay').forEach(overlay=>{overlay.style.display='none';sessionStorage.setItem('marwadi-notice-dismissed','1');});});
    window.warningPopupTranslate = language => {
        for(const locale of ['english','gujrati','hindi']) {
            document.querySelectorAll('.'+locale+'-alert,.'+locale+'-alert-title').forEach(el=>el.classList.toggle('d-none',locale!==language));
            document.querySelectorAll('.'+locale+'-alert-btn').forEach(el=>el.classList.toggle('d-none',locale===language));
        }
    };
    for(const language of ['english','gujrati','hindi'])document.querySelectorAll('.'+language+'-alert-btn').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();window.warningPopupTranslate(language);}));
    document.querySelector('#dropdownMenuLink')?.addEventListener('click', event => {
        event.preventDefault(); const button=event.currentTarget; const menu=button.parentElement.querySelector('.dropdown-menu');
        const shown=menu.classList.toggle('show');button.setAttribute('aria-expanded',String(shown));
    });
    document.addEventListener('click',event=>{if(!event.target.closest('.login_btn')){document.querySelector('.corporate_link_drop')?.classList.remove('show');document.querySelector('#dropdownMenuLink')?.setAttribute('aria-expanded','false');}});
    document.querySelectorAll('.progress-wrap').forEach(button=>button.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})));
    const notice=document.querySelector('#kyc_details');
    if(notice){notice.classList.add('replica-notice');const track=document.createElement('div');while(notice.firstChild)track.append(notice.firstChild);track.innerHTML+=track.innerHTML;notice.append(track);}
    const stateNode=document.querySelector('#local-page-state');const state=stateNode?JSON.parse(stateNode.textContent):{};
    const showStatus=message=>{const box=document.createElement('div');box.className='replica-status';box.setAttribute('role','status');const text=document.createElement('p');text.textContent=message;box.append(text);const close=document.createElement('button');close.className='main_btn';close.textContent='Close';close.onclick=()=>box.remove();box.append(close);document.body.append(box);};
    if(state.message)showStatus(state.message);
    if(state.modal){document.querySelectorAll('.popup-overlay').forEach(el=>el.style.display='none');const el=document.querySelector(state.modal);if(el&&window.bootstrap)window.bootstrap.Modal.getOrCreateInstance(el).show();}
    if(state.login)document.querySelector('#dropdownMenuLink')?.click();
    document.querySelectorAll('.renaissancemenu [data-target]').forEach(tab=>tab.addEventListener('click',()=>{
        document.querySelectorAll('.renaissancemenu li').forEach(item=>item.classList.toggle('active',item===tab));
        document.querySelectorAll('.content-section > .content').forEach(content=>content.classList.toggle('hidden',content.id!==tab.dataset.target));
    }));
    const videos=[...document.querySelectorAll('.home_banner video')];
    const syncVideo=()=>{const active=videos.find(v=>getComputedStyle(v).display!=='none');if(active&&!active.hasAttribute('data-original-motion')){active.play().catch(()=>{});const section=document.querySelector('.home_banner');if(active.offsetHeight)section.style.height=active.offsetHeight+'px';}};
    videos.forEach(video=>{video.muted=true;video.addEventListener('loadedmetadata',syncVideo);});window.addEventListener('resize',syncVideo);syncVideo();
    const ownVideo=document.querySelector('[data-original-motion]');
    if(ownVideo){
        if(matchMedia('(prefers-reduced-motion: reduce)').matches){ownVideo.autoplay=false;ownVideo.pause();ownVideo.addEventListener('loadeddata',()=>ownVideo.pause(),{once:true});}
    }
    const ticker=document.querySelector('#market-ticker');
    const tickerToggle=document.querySelector('#ticker-toggle');
    if(tickerToggle){
        let paused=false;
        const renderToggle=()=>{
            tickerToggle.setAttribute('aria-label',paused?'Resume market ticker':'Pause market ticker');
            tickerToggle.setAttribute('aria-pressed',String(paused));
            tickerToggle.title=paused?'Resume market ticker':'Pause market ticker';
            tickerToggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(paused?'<path d="M7 4v16l13-8z"/>':'<path d="M6 4h4v16H6zm8 0h4v16h-4z"/>')+'</svg>';
        };
        renderToggle();
        tickerToggle.addEventListener('click',()=>{paused=!paused;ticker?.classList.toggle('is-paused',paused);renderToggle();});
    }
    const safeText=(tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;};
    async function refreshMarket(){
        if(!ticker)return;
        try{
            const response=await fetch('/market-data',{headers:{Accept:'application/json'}});const data=await response.json();if(!response.ok||!data.status)throw Error('unavailable');
            data.indices.forEach((index,position)=>{document.querySelectorAll(position===0?'.nifty-value':'.sensex-value').forEach(target=>{target.classList.add('replica-index-row');target.replaceChildren(safeText('p',position===0?'NIFTY :':'SENSEX:'),safeText('h3',index.PRICE),safeText('span',`${index.PER_CHANGE} (${index.ChangePer}%)`,Number(index.ChangePer)<0?'down':''));target.title='Provider timestamp: '+index.UPD_TIME+' IST';});});
            const track=document.createElement('div');track.className='replica-market-track';const row=document.createElement('div');
            data.stocks.filter(stock=>stock.symbol!=='NIFTY').forEach(stock=>{const span=document.createElement('span');span.className='share-'+stock.symbol;span.title='Provider timestamp: '+stock.upd_time+' IST';const icon=document.createElement('i');icon.className='fas fa-angle-'+(Number(stock.change)>=0?'up':'down');span.append(icon,document.createTextNode(stock.s_name+' '+stock.Ltp));row.append(span);});
            track.append(row,row.cloneNode(true));ticker.replaceChildren(track);ticker.title='Market data may be delayed. Fetched '+data.fetched_at;
        }catch{if(!ticker.querySelector('.replica-market-track')){ticker.replaceChildren(safeText('span','Market feed temporarily unavailable','replica-market-error'));document.querySelectorAll('.nifty-value,.sensex-value').forEach(el=>el.replaceChildren(safeText('p','Market unavailable')));}}
    }
    refreshMarket();setInterval(refreshMarket,60000);
})();
