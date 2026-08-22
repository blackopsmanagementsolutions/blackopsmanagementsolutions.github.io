/* Lythous premium — motion.
   Ambient light + a beam that follows the pointer, a pinned step sequence,
   masked reveals, hero parallax, magnetic buttons. Reduced motion kills it all. */
(function () {
  'use strict';
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = mq.matches;
  var raf = window.requestAnimationFrame.bind(window);

  /* ------------------------------------------------ ambient + pointer beam */
  function light() {
    if (still) return;
    document.body.classList.add('has-ambient');

    var c = document.createElement('canvas'); c.className = 'ambient'; c.setAttribute('aria-hidden','true');
    var b = document.createElement('canvas'); b.className = 'beam';    b.setAttribute('aria-hidden','true');
    document.body.insertBefore(b, document.body.firstChild);
    document.body.insertBefore(c, document.body.firstChild);

    var cx = c.getContext('2d'), bx = b.getContext('2d');
    var w=0,h=0,dpr=1,motes=[],blooms=[],t=0,id=null;
    var px=-1, py=-1, tx=-1, ty=-1, hasPointer=false;

    function size(){
      dpr = Math.min(window.devicePixelRatio||1, 1.7);
      w = window.innerWidth; h = window.innerHeight;
      [c,b].forEach(function(el){
        el.width=Math.floor(w*dpr); el.height=Math.floor(h*dpr);
        el.style.width=w+'px'; el.style.height=h+'px';
      });
      cx.setTransform(dpr,0,0,dpr,0,0); bx.setTransform(dpr,0,0,dpr,0,0);
      seed();
    }
    function seed(){
      var n = Math.round(Math.min(Math.max((w*h)/22000, 30), 90));
      motes=[];
      for(var i=0;i<n;i++) motes.push({
        x:Math.random()*w, y:Math.random()*h, r:.5+Math.random()*2.1,
        vx:-.05+Math.random()*.2, vy:-.14-Math.random()*.2,
        a:.04+Math.random()*.2, ph:Math.random()*6.28, sp:.004+Math.random()*.009,
        z:.4+Math.random()*.6
      });
      blooms=[
        {x:.14,y:.08,r:.66,c:'201,153,88', a:.17,dx:.00006,dy:.00004},
        {x:.86,y:.28,r:.58,c:'171,187,152',a:.11,dx:-.00004,dy:.00007},
        {x:.50,y:.92,r:.74,c:'216,178,120',a:.11,dx:.00005,dy:-.00003},
        {x:.30,y:.55,r:.46,c:'226,196,150',a:.07,dx:-.00007,dy:-.00005}
      ];
    }
    function frame(){
      t++;
      cx.clearRect(0,0,w,h);
      for(var i=0;i<blooms.length;i++){
        var B=blooms[i];
        var X=(B.x+Math.sin(t*B.dx*60)*.05)*w, Y=(B.y+Math.cos(t*B.dy*60)*.05)*h;
        var R=B.r*Math.max(w,h)*.62;
        var g=cx.createRadialGradient(X,Y,0,X,Y,R);
        g.addColorStop(0,'rgba('+B.c+','+B.a+')'); g.addColorStop(1,'rgba('+B.c+',0)');
        cx.fillStyle=g; cx.fillRect(0,0,w,h);
      }
      for(var j=0;j<motes.length;j++){
        var m=motes[j];
        m.x+=m.vx*m.z; m.y+=m.vy*m.z; m.ph+=m.sp;
        if(m.y<-14){m.y=h+12;m.x=Math.random()*w;}
        if(m.x>w+14)m.x=-12; if(m.x<-14)m.x=w+12;
        var a=m.a*(.5+.5*Math.sin(m.ph))*m.z;
        cx.beginPath(); cx.arc(m.x,m.y,m.r,0,6.2832);
        cx.fillStyle='rgba(190,150,96,'+a.toFixed(3)+')'; cx.fill();
      }
      // the beam: a warm pool of light easing toward the pointer
      bx.clearRect(0,0,w,h);
      if(hasPointer){
        px += (tx-px)*.075; py += (ty-py)*.075;
        var rr=Math.min(w,h)*.55;
        var bg=bx.createRadialGradient(px,py,0,px,py,rr);
        bg.addColorStop(0,'rgba(255,255,255,0)');
        bg.addColorStop(.55,'rgba(238,222,196,.16)');
        bg.addColorStop(1,'rgba(150,120,80,.30)');
        bx.fillStyle=bg; bx.fillRect(0,0,w,h);
      }
      id=raf(frame);
    }
    function on(){ if(!id) id=raf(frame); }
    function off(){ if(id){cancelAnimationFrame(id); id=null;} }

    size(); on();
    var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,150);},{passive:true});
    document.addEventListener('visibilitychange',function(){document.hidden?off():on();});

    // pointer only: a finger has no hover, and the beam would fight the scroll
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('pointermove',function(e){
        tx=e.clientX; ty=e.clientY;
        if(!hasPointer){px=tx;py=ty;hasPointer=true;b.classList.add('on');}
      },{passive:true});
      window.addEventListener('pointerleave',function(){b.classList.remove('on');},{passive:true});
    }
  }

  /* ---------------------------------------------------------- hero entrance */
  function hero(){
    var el=document.querySelector('.hero-in');
    if(!el) return;
    // split the headline into word masks so it rises line by line
    var h1=el.querySelector('h1');
    if(h1 && !still){
      h1.innerHTML = h1.textContent.trim().split(/\s+/).map(function(word,i){
        return '<span class="wm"><span style="transition-delay:'+(90+i*52)+'ms">'+word+'</span></span>';
      }).join(' ');
    }
    ['.eyebrow','.lede','.hero-cta'].forEach(function(sel,i){
      var n=el.querySelector(sel);
      if(n){ n.classList.add('fade'); n.style.transitionDelay=(still?0:(560+i*130))+'ms'; }
    });
    setTimeout(function(){ el.classList.add('lit'); }, still?0:70);
  }

  /* ------------------------------------------------------------- reveals */
  function reveals(){
    var els=document.querySelectorAll('.rv,.stagger,.mask');
    if(still || !('IntersectionObserver' in window)){
      Array.prototype.forEach.call(els,function(e){e.classList.add('in');}); return;
    }
    document.querySelectorAll('.stagger').forEach(function(g){
      Array.prototype.forEach.call(g.children,function(ch,i){
        ch.style.transitionDelay=(i*80)+'ms';
      });
    });
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    },{rootMargin:'0px 0px -10% 0px',threshold:.08});
    Array.prototype.forEach.call(els,function(e){io.observe(e);});
  }

  /* ------------------------------------------------------ pinned sequence */
  function pinned(){
    var wrap=document.querySelector('.pin-wrap');
    if(!wrap) return;
    var steps=wrap.querySelectorAll('.pin-step');
    var bars=wrap.querySelectorAll('.pin-bars i');
    var count=wrap.querySelector('.pin-count');
    if(still || !steps.length){
      Array.prototype.forEach.call(steps,function(s){s.classList.add('on');}); return;
    }
    // give the sticky stage room to scroll through: one viewport per step
    wrap.style.height=(steps.length*78)+'vh';
    var cur=-1, ticking=false;
    function upd(){
      var r=wrap.getBoundingClientRect();
      var total=wrap.offsetHeight-window.innerHeight;
      var p=Math.min(Math.max(-r.top/(total||1),0),.9999);
      var i=Math.floor(p*steps.length);
      if(i!==cur){
        cur=i;
        Array.prototype.forEach.call(steps,function(s,k){s.classList.toggle('on',k===i);});
        Array.prototype.forEach.call(bars,function(bar,k){bar.classList.toggle('done',k<=i);});
        if(count) count.textContent=('0'+(i+1)).slice(-2);
      }
      ticking=false;
    }
    window.addEventListener('scroll',function(){
      if(!ticking){ticking=true;raf(upd);} },{passive:true});
    window.addEventListener('resize',upd,{passive:true});
    upd();
  }

  /* --------------------------------------------------- parallax + header */
  function scrollFx(){
    var head=document.querySelector('.site-head');
    var heroImg=document.querySelector('.hero-media img');
    var pars=document.querySelectorAll('[data-par]');
    var bar=document.createElement('div');
    bar.className='progress'; bar.setAttribute('aria-hidden','true');
    document.body.appendChild(bar);
    var ticking=false;
    function upd(){
      var y=window.pageYOffset||document.documentElement.scrollTop;
      var d=document.documentElement, max=d.scrollHeight-d.clientHeight;
      bar.style.transform='scaleX('+(max>0?y/max:0)+')';
      if(head) head.classList.toggle('stuck', y>40);
      if(!still){
        if(heroImg && y<window.innerHeight*1.2)
          heroImg.style.transform='translate3d(0,'+(y*.28).toFixed(1)+'px,0)';
        var vh=window.innerHeight;
        Array.prototype.forEach.call(pars,function(el){
          var r=el.getBoundingClientRect();
          if(r.bottom<-100||r.top>vh+100) return;
          var off=(r.top+r.height/2-vh/2)/vh;
          el.style.transform='translate3d(0,'+(-off*(parseFloat(el.dataset.par)||16)).toFixed(1)+'px,0)';
        });
      }
      ticking=false;
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;raf(upd);}},{passive:true});
    window.addEventListener('resize',upd,{passive:true});
    upd();
  }

  /* --------------------------------------------------------- magnetic btns */
  function magnetic(){
    if(still || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.btn-lg,.help-dock').forEach(function(el){
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect();
        var dx=(e.clientX-(r.left+r.width/2))/r.width;
        var dy=(e.clientY-(r.top+r.height/2))/r.height;
        el.style.transform='translate('+(dx*9).toFixed(1)+'px,'+(dy*7).toFixed(1)+'px)';
      });
      el.addEventListener('pointerleave',function(){el.style.transform='';});
    });
  }

  function init(){ light(); hero(); reveals(); pinned(); scrollFx(); magnetic(); }
  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',init) : init();
  (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))
    (function(){location.reload();});
})();
