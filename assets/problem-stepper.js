/**
 * 题目页“步骤推进器”
 * - 约定 DOM 结构：
 *   - .step-card：每个步骤卡片（带 data-step="1..n" 可选）
 *   - #btnPrev / #btnNext：上一/下一步按钮
 *   - #stepStatus：状态文本
 * - 交互行为：
 *   - 默认仅展示第 1 步；点击下一步逐步 reveal；点击卡片可直接跳转并高亮
 */
(function(){
  /** 更新“步骤 x / y” */
  function updateStatus(stepStatusEl, currentIndex, total){
    stepStatusEl.textContent = '步骤 ' + (currentIndex + 1) + ' / ' + total;
  }

  /** 切换当前步骤：高亮 + reveal */
  function setActiveStep(state, nextIndex){
    if(nextIndex < 0 || nextIndex >= state.stepCards.length) return;
    state.currentIndex = nextIndex;
    if(state.currentIndex > state.maxVisible) state.maxVisible = state.currentIndex;

    for(var i=0;i<state.stepCards.length;i++){
      var el = state.stepCards[i];
      if(i <= state.maxVisible) el.classList.add('visible'); else el.classList.remove('visible');
      if(i === state.currentIndex) el.classList.add('active'); else el.classList.remove('active');
    }

    state.btnPrev.disabled = state.currentIndex === 0;
    state.btnNext.disabled = state.currentIndex === state.stepCards.length - 1;
    updateStatus(state.stepStatus, state.currentIndex, state.stepCards.length);
  }

  /** 初始化步骤推进器（对外暴露） */
  function initProblemStepper(){
    // 防止重复绑定（例如页面脚本与自动初始化同时触发）
    if(window.__problemStepperInited) return;

    var stepCards = Array.prototype.slice.call(document.querySelectorAll('.step-card'));
    var btnPrev = document.getElementById('btnPrev');
    var btnNext = document.getElementById('btnNext');
    var stepStatus = document.getElementById('stepStatus');

    if(!stepCards.length || !btnPrev || !btnNext || !stepStatus) return;

    var state = { stepCards: stepCards, btnPrev: btnPrev, btnNext: btnNext, stepStatus: stepStatus, currentIndex: 0, maxVisible: 0 };

    btnPrev.addEventListener('click', function(){ setActiveStep(state, state.currentIndex - 1); });
    btnNext.addEventListener('click', function(){ setActiveStep(state, state.currentIndex + 1); });

    for(var i=0;i<stepCards.length;i++){
      (function(idx){
        stepCards[idx].addEventListener('click', function(){ setActiveStep(state, idx); });
      })(i);
    }

    setActiveStep(state, 0);

    window.__problemStepperInited = true;
  }

  window.initProblemStepper = initProblemStepper;

  /**
   * 自动初始化（解决：script 使用 defer 时，页面底部直接调用 initProblemStepper 可能早于脚本加载的问题）。
   */
  (function autoInit(){
    function run(){
      try{ initProblemStepper(); }catch(e){}
    }
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', run);
    }else{
      run();
    }
  })();
})();
