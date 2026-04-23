/**
 * 天堂里的游戏（图表同步脚本）
 * - 负责将“步骤卡”的当前步骤状态同步到六边形星图 SVG
 * - 依赖：页面存在 #btnPrev/#btnNext 与 .step-card.active（由 assets/problem-stepper.js 维护）
 */
(function(){
  'use strict';

  /**
   * 每一步对应的图注文案
   * @type {Record<number, string>}
   */
  var notes = {
    1: '每人的盲区 = 自己 + 对面 = 看不见的2顶帽子',
    2: '反设：G戴黑帽 → 外圈只剩2顶黑帽',
    3: '猜不出来 → 每人盲区必须含至少1顶外圈黑帽',
    4: '2顶黑帽最多覆盖4人盲区 ≠ 6人 → 矛盾！',
    5: '结论：G戴白帽 ✓'
  };

  /**
   * 设置某人的帽子显示状态
   * @param {string} id SVG 中帽子容器 id（如 hatG/hatA）
   * @param {string} state 状态：unk | blk | wht
   */
  function setHat(id, state){
    var hat = document.getElementById(id);
    if(!hat) return;
    var states = id === 'hatG' ? ['unk','blk','wht'] : ['unk','blk'];
    states.forEach(function(s){
      var g = document.getElementById(id + '_' + s);
      if(g) g.setAttribute('opacity', s === state ? '1' : '0');
    });
  }

  /**
   * 设置对面连线的显示模式
   * @param {string} mode default | highlight
   */
  function setOppLines(mode){
    ['oppAD','oppBE','oppCF'].forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      if(mode === 'highlight'){
        el.setAttribute('stroke-width', '2');
        el.setAttribute('stroke-dasharray', '6 4');
        el.setAttribute('opacity', '0.7');
        el.setAttribute('stroke', '#f0c94d');
      }else{
        el.setAttribute('stroke-width', '0.8');
        el.setAttribute('stroke-dasharray', '4 3');
        el.setAttribute('opacity', '0.35');
        el.setAttribute('stroke', '#8a6d1b');
      }
    });
  }

  /**
   * 标记人物圈的状态（覆盖/未覆盖/默认）
   * @param {string} id 人物标识（A..F）
   * @param {string} type default | covered | uncovered
   */
  function markCircle(id, type){
    var c = document.getElementById('circle' + id);
    if(!c) return;
    if(type === 'covered'){
      c.setAttribute('stroke', '#f0c94d');
      c.setAttribute('stroke-width', '3');
      c.setAttribute('stroke-dasharray', 'none');
    }else if(type === 'uncovered'){
      c.setAttribute('stroke', '#e74c3c');
      c.setAttribute('stroke-width', '2.5');
      c.setAttribute('stroke-dasharray', '5 3');
    }else{
      c.setAttribute('stroke', '#8a6d1b');
      c.setAttribute('stroke-width', '1.5');
      c.setAttribute('stroke-dasharray', 'none');
    }
  }

  /**
   * 触发“爆发环”动画，用于最终结论的强调
   */
  function animateBurst(){
    var configs = [
      { el: 'revealBurst1', startR: 26, endR: 120, dur: 1500, maxOp: 0.6 },
      { el: 'revealBurst2', startR: 26, endR: 85, dur: 1200, maxOp: 0.4, delay: 180 }
    ];
    var now = performance.now();
    configs.forEach(function(cfg){
      var el = document.getElementById(cfg.el);
      if(!el) return;
      var t0 = now + (cfg.delay || 0);
      function frame(ts){
        var p = (ts - t0) / cfg.dur;
        if(p < 0){ requestAnimationFrame(frame); return; }
        if(p > 1){ el.setAttribute('opacity','0'); return; }
        var r = cfg.startR + (cfg.endR - cfg.startR) * p;
        var op = cfg.maxOp * Math.pow(1 - p, 2);
        el.setAttribute('r', String(Math.max(1, r)));
        el.setAttribute('opacity', String(Math.max(0, op)));
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /**
   * 触发图表的“脉冲”动画（用于强调状态切换）
   */
  function pulseDiagram(){
    var d = document.getElementById('hexDiagram');
    if(!d) return;
    d.classList.remove('diagram-pulse');
    // 触发 reflow 以重新开始动画
    void d.offsetWidth;
    d.classList.add('diagram-pulse');
  }

  /**
   * 将当前激活的步骤（.step-card.active）同步到 SVG 状态
   */
  function syncDiagram(){
    var active = document.querySelector('.step-card.active');
    if(!active) return;
    var step = parseInt(active.getAttribute('data-step') || '1', 10);

    // 重置
    setHat('hatG','unk'); setHat('hatA','unk'); setHat('hatB','unk');
    setOppLines('default');
    ['A','B','C','D','E','F'].forEach(function(id){ markCircle(id,'default'); });

    var cov = document.getElementById('coverageGroup');
    if(cov) cov.setAttribute('opacity','0');
    var b1 = document.getElementById('revealBurst1');
    var b2 = document.getElementById('revealBurst2');
    if(b1) b1.setAttribute('opacity','0');
    if(b2) b2.setAttribute('opacity','0');

    // 步骤态
    switch(step){
      case 1:
        setOppLines('highlight');
        break;
      case 2:
        setHat('hatG','blk');
        break;
      case 3:
        setHat('hatG','blk');
        setOppLines('highlight');
        break;
      case 4:
        setHat('hatG','blk'); setHat('hatA','blk'); setHat('hatB','blk');
        if(cov) cov.setAttribute('opacity','1');
        ['A','B','D','E'].forEach(function(id){ markCircle(id,'covered'); });
        ['C','F'].forEach(function(id){ markCircle(id,'uncovered'); });
        break;
      case 5:
        setHat('hatG','wht');
        animateBurst();
        break;
      default:
        break;
    }

    // 图注
    var noteEl = document.getElementById('diagramNote');
    if(noteEl && notes[step]) noteEl.textContent = notes[step];

    pulseDiagram();
  }

  /**
   * 绑定交互事件：当步骤变化时同步图表
   */
  function initDiagramSync(){
    var btnPrev = document.getElementById('btnPrev');
    var btnNext = document.getElementById('btnNext');
    if(btnPrev) btnPrev.addEventListener('click', syncDiagram);
    if(btnNext) btnNext.addEventListener('click', syncDiagram);

    var cards = document.querySelectorAll('.step-card');
    for(var i = 0; i < cards.length; i++){
      cards[i].addEventListener('click', syncDiagram);
      cards[i].addEventListener('keydown', function(e){
        // 让键盘切换步骤时也能同步（problem-stepper.js 会改变 active）
        var key = e.key;
        if(key === 'Enter' || key === ' ' || key.indexOf('Arrow') === 0 || key === 'Home' || key === 'End'){
          setTimeout(syncDiagram, 0);
        }
      });
    }

    syncDiagram();
  }

  /**
   * 页面入口：在 DOM 就绪后初始化同步
   */
  function initPage(){
    function run(){
      try{ initDiagramSync(); }catch(e){}
    }
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', run);
    }else{
      run();
    }
  }

  initPage();
})();

