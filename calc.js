(function(){
  var cop=new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
  var fmt=function(n){return cop.format(Math.round(n))};
  var $=function(id){return document.getElementById(id)};
  function pd(s){if(!s)return null;var p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2])}
  function lastFeb(d){return d.getMonth()===1&&new Date(d.getFullYear(),2,0).getDate()===d.getDate()}
  // Días con base 30/360 (inclusive), como se liquida en nómina colombiana
  function d360(a,b){
    var d1=Math.min(a.getDate(),30),d2=Math.min(b.getDate(),30);
    if(lastFeb(a))d1=30; if(lastFeb(b))d2=30;
    return (b.getFullYear()-a.getFullYear())*360+(b.getMonth()-a.getMonth())*30+(d2-d1)+1;
  }
  function num(id){var v=parseFloat($(id).value);return isFinite(v)&&v>0?v:0}
  function row(l,v){return '<tr><td>'+l+'</td><td class="num">'+v+'</td></tr>'}

  function calcInd(){
    var o=$('o-ind'),ing=pd($('i-ing').value),ret=pd($('i-ret').value),sal=num('i-sal');
    if(!ing||!ret||ret<ing){o.innerHTML='<p class="err">La fecha de terminación debe ser posterior a la de ingreso.</p>';return}
    var dias=d360(ing,ret),anios=dias/360,b=$('i-tope').value==='a';
    var primero=b?30:20,extra=b?20:15;
    var dInd=anios<=1?primero:primero+(anios-1)*extra;
    var valor=sal/30*dInd;
    o.innerHTML='<div class="scroll"><table><tbody>'+
      row('Tiempo de servicio',Math.floor(anios)+' años y '+Math.round((anios-Math.floor(anios))*12)+' meses aprox. ('+dias+' días)')+
      row('Días de salario por indemnización',dInd.toFixed(1).replace('.',',')+' días')+
      row('Valor del día de salario',fmt(sal/30))+
      '</tbody></table></div><div class="total"><span>Indemnización estimada</span><strong>'+fmt(valor)+'</strong></div>';
  }

  function calcLiq(){
    var o=$('o-liq'),ing=pd($('l-ing').value),ret=pd($('l-ret').value),vac=pd($('l-vac').value);
    var sal=num('l-sal'),aux=num('l-aux'),pen=num('l-pen'),base=sal+aux;
    if(!ing||!ret||ret<ing){o.innerHTML='<p class="err">La fecha de terminación debe ser posterior a la de ingreso.</p>';return}
    var ini=new Date(ret.getFullYear(),0,1); if(ing>ini)ini=ing;
    var dC=d360(ini,ret);
    var ces=base*dC/360, inte=ces*dC*0.12/360;
    var sem=new Date(ret.getFullYear(),ret.getMonth()<=5?0:6,1); if(ing>sem)sem=ing;
    var dP=d360(sem,ret), prima=base*dP/360;
    var vs=vac&&vac>ing?vac:ing, dV=vs>ret?0:d360(vs,ret), vacs=sal*dV/720;
    var pend=sal/30*pen;
    var total=ces+inte+prima+vacs+pend;
    o.innerHTML='<div class="scroll"><table><thead><tr><th>Concepto</th><th class="num">Días</th><th class="num">Valor</th></tr></thead><tbody>'+
      '<tr><td>Cesantías</td><td class="num">'+dC+'</td><td class="num">'+fmt(ces)+'</td></tr>'+
      '<tr><td>Intereses de cesantías</td><td class="num">'+dC+'</td><td class="num">'+fmt(inte)+'</td></tr>'+
      '<tr><td>Prima de servicios</td><td class="num">'+dP+'</td><td class="num">'+fmt(prima)+'</td></tr>'+
      '<tr><td>Vacaciones</td><td class="num">'+dV+'</td><td class="num">'+fmt(vacs)+'</td></tr>'+
      '<tr><td>Salario sin pagar</td><td class="num">'+pen+'</td><td class="num">'+fmt(pend)+'</td></tr>'+
      '</tbody></table></div><div class="total"><span>Total estimado</span><strong>'+fmt(total)+'</strong></div>';
  }

  ['f-ind','f-liq'].forEach(function(id){
    var f=$(id); if(!f)return;
    f.addEventListener('submit',function(e){e.preventDefault()});
    f.addEventListener('input',function(){
      f.querySelector('.ex')&&(f.querySelector('.ex').hidden=true);
      id==='f-ind'?calcInd():calcLiq();
    });
  });
  if($('f-ind')&&$('f-liq')){calcInd();calcLiq();}

  if($('copy'))$('copy').addEventListener('click',function(){
    var msg=$('copy-msg');
    function fallback(){
      var r=document.createRange();r.selectNodeContents($('tel'));
      var s=getSelection();s.removeAllRanges();s.addRange(r);
      msg.textContent='Número seleccionado: cópialo.';
    }
    try{
      navigator.clipboard.writeText('3058852628').then(function(){msg.textContent='Número copiado.'},fallback);
    }catch(e){fallback()}
  });
})();
