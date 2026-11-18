// quiz.mjs — quiz de 5 alternativas (A–E) com explicação, usado pelas páginas e artefatos.
// Q = [[enunciado, [a,b,c,d,e], 'letra', 'explicação'], ...]. Estilo em styles/labs.css (.qz).
const L = 'abcde';
export function quizHtml(Q) {
  const ans = Q.map(q => q[2]).join('');
  return `
<div class="qz-score"><div><b id="qzScore">0</b> <span style="color:var(--label-2)">de ${Q.length} · <span id="qzDone">0</span> respondidas</span></div><button class="lbtn" type="button" id="qzReset">↺ Recomeçar</button></div>
<div id="qzList">
${Q.map(([stem, opts, a, why], i) => `<div class="qz" data-a="${a}">
  <div class="qz-q"><span class="qz-n">${i + 1}</span><span>${stem}</span></div>
  <div class="qz-opts">
${opts.map((o, j) => `    <button type="button" class="qz-opt" data-l="${L[j]}"><span class="l">${L[j].toUpperCase()}</span><span>${o}</span></button>`).join('\n')}
  </div>
  <div class="qz-fb"><span class="pre"></span>${why}</div>
</div>`).join('\n')}
</div>
<script>
(function(){
  var list=document.getElementById('qzList'),sc=0,dn=0;
  list.addEventListener('click',function(e){
    var b=e.target.closest('.qz-opt'); if(!b) return;
    var q=b.closest('.qz'); if(q.dataset.done) return; q.dataset.done=1; dn++;
    var ok=b.dataset.l===q.dataset.a, fb=q.querySelector('.qz-fb');
    q.querySelectorAll('.qz-opt').forEach(function(o){o.classList.add('dis'); if(o.dataset.l===q.dataset.a) o.classList.add('ok');});
    if(ok){sc++;} else b.classList.add('no');
    fb.classList.add(ok?'ok':'no'); fb.querySelector('.pre').innerHTML=ok?'✅ <b>Isso!</b> ':'❌ <b>Não.</b> Resposta: '+q.dataset.a.toUpperCase()+'. ';
    document.getElementById('qzScore').textContent=sc; document.getElementById('qzDone').textContent=dn;
  });
  document.getElementById('qzReset').onclick=function(){
    sc=dn=0; document.getElementById('qzScore').textContent=0; document.getElementById('qzDone').textContent=0;
    list.querySelectorAll('.qz').forEach(function(q){delete q.dataset.done; var f=q.querySelector('.qz-fb'); f.className='qz-fb'; f.querySelector('.pre').innerHTML='';});
    list.querySelectorAll('.qz-opt').forEach(function(o){o.className='qz-opt';});
  };
})();
</script>
<!-- gabarito: ${ans} -->`;
}
