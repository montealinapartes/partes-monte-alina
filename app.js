const FECHA_INICIO_CONTROL="2026-05-20";
const API="https://script.google.com/macros/s/AKfycbyAmDTfuC8RMQXAytyn0VyfwwtP0IhZz_gujCJm7yX49W5Z0MaieoGk35w2nkia9h3d/exec";

const FESTIVOS_2026 = new Set([
 "2026-01-01","2026-01-06",
 "2026-04-02","2026-04-03",
 "2026-05-01","2026-05-02","2026-05-15",
 "2026-08-15",
 "2026-10-12",
 "2026-11-02","2026-11-09",
 "2026-12-07","2026-12-08","2026-12-25"
]);
function esFinDeSemana(fecha){
 let d=new Date(fecha+"T00:00:00");
 let dia=d.getDay();
 return dia===0 || dia===6;
}
function esFestivo(fecha){return FESTIVOS_2026.has(fecha)}
function esDiaLaborable(fecha){
 if(!fecha)return false;
 return !esFinDeSemana(fecha) && !esFestivo(fecha);
}
function motivoNoLaborable(fecha){
 if(esFestivo(fecha))return "Festivo";
 if(esFinDeSemana(fecha))return "Fin de semana";
 return "";
}

const ADMIN_PASS="admin", ENC_PASS="encargado";
const SITS=["Trabajo","Baja","Vacaciones","Moscoso","Cursos","Hospitalización familiar"];
const ZONAS={"A) COMUNES": ["01 Entrada", "02 Oficina de Gerencia/Administración", "03 Caseta de Vigilancia", "04 Sala de los vigilantes/conserjes", "05 Instalaciones mantenimiento/jardinería. Sólo almacén y cuartos mto-jardinería", "06 Depuradoras 1, 2 y3", "07 Parcela depósitos y grupo de presión+Pozos 1-4", "08 Parcela de la Central Térmica", "10 Pistas tenis y padel", "27 TODA LA URBANIZACIÓN"], "B) FASE I": ["11 Vial y mediana Avenida hasta transversal siete y transversal 1-7", "12 Vial Saliente hasta el 56", "13 Vial Poniente hasta el 76", "14 Zona verde Saliente", "15 Zona tira verde entre Transversal 2 y 3", "16 Zona H entre transversal 4 y 5 y tros Avda. 42", "17 Zona verde transversal 6", "18 Zona paso de la viga Monteclaro", "19 Instalación Central Térmica", "19 Bis Toda la fase I"], "C) FASE II": ["20 Vial y mediana Avda. desde Transv. 7 a 8", "21 Vial saliente desde el 64 hasta 124", "22 Vial Poniente desde el 78 al 188", "23 Plazas 1 a la 9 Zona Levitt", "24 Pasillo verde e intersticiales", "25 Rotonda Transversal Ocho", "26 Bosque de Boadilla", "26 Bis Toda la fase II"]};
const TRAB={"Mantenimiento": {"01. Distribución, control y revision de los trabajos": ["A. Revisión, control y distribución de los trabajos"], "02. Red de agua": ["F. Inspección red agua y detección fugas de agua", "G. Reparación fugas de agua en red agua", "GGBis. Obra nueva acometida agua", "H. Control y supervisión de los pozos, depósitos, etc.", "I. Reparación armarios de agua, limpieza filtros, etc.", "K. Revisión y lectura contadores de agua"], "03. Electricidad": ["L. Cambio de bombillas del alumbrado público", "M. Pequeñas reparaciones, arreglo y pintura farolas", "N. Colaboración con empresa electricidad"], "04. Red de saneamiento": ["O. Inspección de la red de saneamiento y detección de atascos", "P. Limpieza y reparación de arquetas y rejillas", "Q. Supervisión y colaboración con servicio limpieza y desatranco"], "05. Desinsectación y desratización": ["R. Inspección y control de posibles plagas", "S. Acompañamiento y supervisión empresa plagas"], "06. Limpieza": ["T. Limpieza viales y aceras", "U. Limpieza plazas", "V. Limpieza jardinería"], "07. Pintura": ["Y. Pintura Señalización y vallados", "Z. Pintura instalaciones de la Comunidad"], "08. Reparación baches": ["AA. Reparación pequeños baches", "BB. Zanjas abiertas para la reparación de averias", "Bbbis. Reparación de aceras sin avería previa"], "09. Protección contraincendios": ["CC. Mantenimiento extintores", "DD. Mantenimiento bocas de incendio"], "10. Mantenimiento maquinaria, herramienta y vehículos": ["Mantenimiento herramienta, maquinaria y vehículos"], "11. Inspección herramientas": ["EE. Reparación vallados", "FF. Otras reparaciones", "FFbis. Reparaciones instalaciones Comunidad"], "12. Limpieza y poda temporal nieve": ["TT. Limpieza y poda temporal nieve"]}, "Jardinería": {"1. Riego": ["Riego"], "2. Siega": ["Siega"], "3. Desbroce": ["desbroce"], "4. Entrecavado/rastrillado": ["Entrecavado/rastrillado/recorte/perfilado"], "5. Poda": ["Poda"], "6. Plantaciones": ["Plantaciones"], "7. Jabalies": ["Jabalíes"], "8. Tratamientos fitosanitarios": ["Tratamientos fitosanitarios"], "9. Mantenimiento maquinaria jardineria": ["Mantenimiento maquinaria, herramienta y accesorios jard."]}};
let emps=[], partes=[], partesTodas=[], rol=localStorage.rol||"", busy=false, editingId=null, partesSubtab="editando";

function today(){return new Date().toISOString().slice(0,10)}
function month(){return today().slice(0,8)+"01"}
function fechaControlActual(){
 if(editingId){
   let p=partes.find(x=>x.ID===editingId);
   if(p && p.Fecha) return p.Fecha;
 }
 return localStorage.ultimaFechaParte || desde.value || today();
}
function addDays(ymd,days){
 let d=ymd?new Date(ymd+"T00:00:00"):new Date();
 d.setDate(d.getDate()+days);
 return d.toISOString().slice(0,10);
}
function fechaParts(ymd){
 ymd=fechaYMD(ymd)||today();
 let p=ymd.split("-");
 return {y:p[0],m:p[1],d:p[2]};
}
function yearOptions(sel){
 let y=new Date().getFullYear(), out="";
 for(let yy=y-3; yy<=y+3; yy++) out+=`<option value="${yy}" ${String(yy)===String(sel)?"selected":""}>${yy}</option>`;
 return out;
}
function numOptions(max,sel){
 let out="";
 for(let i=1;i<=max;i++){
   let v=String(i).padStart(2,"0");
   out+=`<option value="${v}" ${v===String(sel).padStart(2,"0")?"selected":""}>${v}</option>`;
 }
 return out;
}
function setFechaPart(id,part,val){
 let p=partes.find(x=>x.ID===id); if(!p)return;
 let fp=fechaParts(p.Fecha);
 if(part==="d") fp.d=String(val).padStart(2,"0");
 if(part==="m") fp.m=String(val).padStart(2,"0");
 if(part==="y") fp.y=String(val);
 editF(id,"Fecha",`${fp.y}-${fp.m}-${fp.d}`);
}
function fechaQuick(id,mode){
 let p=partes.find(x=>x.ID===id); if(!p)return;
 let f=p.Fecha||today();
 if(mode==="hoy") f=today();
 if(mode==="ayer") f=addDays(today(),-1);
 if(mode==="menos") f=addDays(f,-1);
 if(mode==="mas") f=addDays(f,1);
 if(mode==="ultima"){
   let ult=localStorage.ultimaFechaParte || (partes.find(x=>x.Fecha)?.Fecha) || today();
   f=ult;
 }
 editF(id,"Fecha",f);
}
function n(v){return Number(String(v||"0").replace(",","."))||0}
function m(v){return Number(String(v||"0").replace(",",".")||0).toFixed(2)}
function mcoma(v){return Number(String(v||"0").replace(",",".")||0).toFixed(2).replace(".",",")}

function redondearMediaHora(v){
 if(v===null||v===undefined||String(v).trim()==="")return "";
 let s=String(v).trim().replace(",",".");
 if(/^\d{4}-\d{2}-\d{2}/.test(s)||s.indexOf("T")>-1)return "";
 let num=Number(s);
 if(isNaN(num))return "";
 return (Math.round(num*2)/2).toFixed(2).replace(".",",");
}

function normalizarHora(v){
 if(v===null||v===undefined||String(v).trim()==="")return "";
 let s=String(v).trim().replace(",",".");
 if(/^\d{4}-\d{2}-\d{2}/.test(s)||s.indexOf("T")>-1)return "";
 let num=Number(s);
 if(isNaN(num))return "";
 return num.toFixed(2).replace(".",",");
}
function esc(s){return String(s??"").replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function isAdmin(){return rol==="admin"}
function msg(id,t,ok){let e=document.getElementById(id);e.className=ok?"succ":"err";e.textContent=t}
function setBusy(state,text){busy=state;syncState.textContent=text||(state?"Trabajando...":"Listo");document.querySelectorAll("button").forEach(b=>b.disabled=state)}

function fechaYMD(v){
 if(!v)return "";
 let s=String(v);
 if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);
 if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)){let p=s.split("/");return p[2]+"-"+p[1].padStart(2,"0")+"-"+p[0].padStart(2,"0");}
 let d=new Date(s); if(!isNaN(d.getTime()))return d.toISOString().slice(0,10);
 return s;
}
function normalizarNumero(v){
 if(v===null||v===undefined)return "";
 let s=String(v).trim().replace(",",".");
 if(/^\d{4}-\d{2}-\d{2}/.test(s)||s.includes("T"))return "";
 return s;
}
function normalizarParte(r){
 r.Fecha=fechaYMD(r.Fecha);
 r.Ordinarias=normalizarNumero(r.Ordinarias);
 r.Peligrosidad=normalizarNumero(r.Peligrosidad);
 r.Extras=normalizarNumero(r.Extras);
 if(r.SubtipoTrabajo==="Subtipo")r.SubtipoTrabajo="";
 return r;
}

function api(payload){
 return new Promise((resolve,reject)=>{
  const cb="cb_"+Date.now()+"_"+Math.random().toString(36).slice(2);
  const script=document.createElement("script");
  window[cb]=(j)=>{delete window[cb];script.remove();if(!j.ok)reject(new Error(j.error||"Error API"));else resolve(j);};
  script.onerror=()=>{delete window[cb];script.remove();reject(new Error("No se pudo conectar con Google Sheets"));};
  script.src=API+"?callback="+encodeURIComponent(cb)+"&payload="+encodeURIComponent(JSON.stringify(payload));
  document.body.appendChild(script);
 });
}

function init(){desde.value=localStorage.desde||month();hasta.value=localStorage.hasta||today();role();if(rol)loadAll()}
function login(){
 let p=perfil.value,c=clave.value;
 if(p==="admin"&&c!==ADMIN_PASS)return msg("loginMsg","Clave administrador incorrecta.",false);
 if(p==="encargado"&&c!==ENC_PASS)return msg("loginMsg","Clave encargado incorrecta.",false);
 rol=p;localStorage.rol=rol;role();msg("loginMsg","Acceso correcto.",true);loadAll();
}
function logout(){rol="";localStorage.removeItem("rol");emps=[];partes=[];role();render()}
function role(){
 user.textContent=rol?(rol==="admin"?"Administrador":"Encargado"):"Sin sesión";
 document.querySelectorAll(".adminOnly").forEach(x=>x.classList.toggle("hidden",!isAdmin()));
 if(!isAdmin()){["dash","inf","val","bak"].forEach(x=>document.getElementById(x).classList.add("hidden"));document.getElementById("partes").classList.remove("hidden");document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));document.querySelector(".tabs button").classList.add("active")}
}
function tab(s,b){if(!isAdmin()&&!(s==="partes"||s==="extras"||s==="ordinarias"))return alert("Solo administrador");["partes","dash","inf","val","extras","ordinarias","bak"].forEach(x=>document.getElementById(x).classList.toggle("hidden",x!==s)); if(s==="ordinarias") setTimeout(renderRevisionOrdinarias,50); if(s==="extras") setTimeout(renderRevisionExtras,50);document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()}
function subtabPartes(s,b){
 partesSubtab=s;
 document.getElementById("partesEditando").classList.toggle("hidden",s!=="editando");
 document.getElementById("partesGuardados").classList.toggle("hidden",s!=="guardados");
 document.querySelectorAll(".subTabs button").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");
 render();
}
function editarParte(id){
 editingId=id;
 partesSubtab="editando";

 ["partes","dash","inf","val","extras","ordinarias","bak"].forEach(x=>{
   let el=document.getElementById(x);
   if(el) el.classList.toggle("hidden",x!=="partes");
 });

 let pe=document.getElementById("partesEditando");
 let pg=document.getElementById("partesGuardados");
 if(pe) pe.classList.remove("hidden");
 if(pg) pg.classList.add("hidden");

 document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));
 let mainBtn=document.querySelector(".tabs button");
 if(mainBtn) mainBtn.classList.add("active");

 document.querySelectorAll(".subTabs button").forEach(x=>x.classList.remove("active"));
 let editBtn=document.getElementById("tabEditando");
 if(editBtn) editBtn.classList.add("active");

 render();
 window.scrollTo({top:0,behavior:"smooth"});
}

async function loadAll(){
 localStorage.desde=desde.value;localStorage.hasta=hasta.value;
 if(!rol)return msg("loginMsg","Inicia sesión.",false);
 try{
  setBusy(true,"Actualizando...");
  let j=await api({accion:"leerTodo"});
  emps=(j.empleados||[]).map(e=>{
    e.FechaAlta=fechaYMD(e.FechaAlta);
    e.FechaBaja=fechaYMD(e.FechaBaja);
    return e;
  });
  partesTodas=(j.partes||[]).map(normalizarParte);
  partes=partesTodas.filter(r=>!r.Fecha||(r.Fecha>=desde.value&&r.Fecha<=hasta.value));
  if(editingId && !partes.find(p=>p.ID===editingId)) editingId=null;
  if(editingId && !String(editingId).startsWith("tmp_")) editingId=null;
  setBusy(false,"Datos actualizados");
  render();
 }catch(e){setBusy(false,"Error");msg("loginMsg",e.message,false)}
}

async function addEmp(){
 if(!isAdmin())return;
 let nombre=newEmp.value.trim();
 let fechaAlta=newEmpAlta.value;
 if(!nombre)return alert("Escribe el nombre del empleado.");
 if(!fechaAlta)return alert("La fecha de alta es obligatoria.");
 try{
   setBusy(true,"Guardando empleado...");
   await api({accion:"guardarEmpleado",empleado:{
     Nombre:nombre,
     Activo:true,
     FechaAlta:fechaAlta,
     FechaBaja:""
   }});
   newEmp.value="";
   newEmpAlta.value=today();
   await loadAll();
 }catch(e){
   setBusy(false,"Error");
   msg("loginMsg",e.message,false);
 }
}

async function guardarFechasEmpleado(id){
 if(!isAdmin())return;
 let e=emps.find(x=>x.ID===id);
 if(!e)return;
 let alta=document.getElementById("alta_"+id)?.value||"";
 let baja=document.getElementById("baja_"+id)?.value||"";
 if(!alta)return alert("La fecha de alta es obligatoria.");
 if(baja && baja<alta)return alert("La fecha de baja no puede ser anterior a la fecha de alta.");
 try{
   setBusy(true,"Guardando fechas...");
   await api({accion:"guardarEmpleado",empleado:{
     ID:e.ID,
     Nombre:e.Nombre,
     Activo:baja?false:esEmpleadoActivo(e),
     FechaAlta:alta,
     FechaBaja:baja
   }});
   await loadAll();
   let actualizado=emps.find(x=>x.ID===id);
   if(!actualizado || fechaAltaEmpleado(actualizado)!==alta || fechaBajaEmpleado(actualizado)!==baja){
     throw new Error("Google Sheets no devolvió las fechas guardadas. Comprueba que hayas actualizado y vuelto a implementar APPS_SCRIPT_V6.gs.");
   }
   alert("Fechas de "+e.Nombre+" guardadas correctamente.");
 }catch(err){
   setBusy(false,"Error");
   msg("loginMsg",err.message,false);
 }
}

async function bajaEmpleado(id){
 if(!isAdmin())return;
 let e=emps.find(x=>x.ID===id);
 if(!e)return;
 let alta=document.getElementById("alta_"+id)?.value||fechaAltaEmpleado(e);
 let baja=document.getElementById("baja_"+id)?.value||today();
 if(baja<alta)return alert("La fecha de baja no puede ser anterior a la fecha de alta.");
 if(!confirm("¿Dar de baja a "+e.Nombre+" con fecha "+baja+"? Sus partes anteriores se conservarán."))return;
 try{
   setBusy(true,"Dando de baja...");
   await api({accion:"guardarEmpleado",empleado:{
     ID:e.ID,Nombre:e.Nombre,Activo:false,FechaAlta:alta,FechaBaja:baja
   }});
   await loadAll();
 }catch(err){
   setBusy(false,"Error");
   msg("loginMsg",err.message,false);
 }
}
async function reactivarEmpleado(id){
 if(!isAdmin())return;
 let e=emps.find(x=>x.ID===id);
 if(!e)return;
 let alta=document.getElementById("alta_"+id)?.value||fechaAltaEmpleado(e);
 try{
   setBusy(true,"Reactivando...");
   await api({accion:"guardarEmpleado",empleado:{
     ID:e.ID,Nombre:e.Nombre,Activo:true,FechaAlta:alta,FechaBaja:""
   }});
   await loadAll();
 }catch(err){
   setBusy(false,"Error");
   msg("loginMsg",err.message,false);
 }
}

async function delEmp(id){if(!isAdmin())return;if(!confirm("¿Eliminar empleado?"))return;try{setBusy(true,"Eliminando empleado...");await api({accion:"eliminarEmpleado",id});await loadAll();}catch(e){setBusy(false,"Error");msg("loginMsg",e.message,false)}}

function nuevoParteBlanco(fecha){
 let tmp="tmp_"+Date.now()+"_"+Math.random().toString(36).slice(2);
 return {ID:tmp,Fecha:fecha||today(),Empleado:trabajadorPendiente(fecha||today())||"",Situacion:"Trabajo",TipoZona:"",Zona:"",JM:"",TipoTrabajo:"",SubtipoTrabajo:"",Ordinarias:"",Peligrosidad:"",Extras:"",_dirty:true,_new:true};
}

function addRow(){
 if(!rol)return alert("Inicia sesión");
 let f=localStorage.ultimaFechaParte || today();
 let nuevo=nuevoParteBlanco(f);
 partes.unshift(nuevo);
 editingId=nuevo.ID;partesSubtab="editando";
 document.getElementById("partesEditando").classList.remove("hidden");
 document.getElementById("partesGuardados").classList.add("hidden");
 document.querySelectorAll(".subTabs button").forEach(x=>x.classList.remove("active"));
 document.getElementById("tabEditando").classList.add("active");
 render();
 setTimeout(()=>enfocarCampo(nuevo.ID,"Empleado"),350);
}

function ultimoParteGuardado(){
 return partes.find(p=>!String(p.ID||"").startsWith("tmp_") && p.Empleado);
}
function copiarEmpleadoAnterior(id){
 let idx=partes.findIndex(x=>x.ID===id);
 let p=partes[idx]; if(!p)return;
 let ant=null;
 for(let i=idx+1;i<partes.length;i++){
   if(partes[i].Empleado){ant=partes[i];break;}
 }
 if(!ant)return alert("No hay parte anterior con empleado para copiar.");
 p.Empleado=ant.Empleado;
 p._dirty=true;
 render();
}

function duplicarParte(id){
 let p=partes.find(x=>x.ID===id); if(!p)return;
 let tmp="tmp_"+Date.now()+"_"+Math.random().toString(36).slice(2);
 let nuevo=Object.assign({},p);
 nuevo.ID=tmp;
 nuevo._dirty=true;
 nuevo._new=true;
 partes.unshift(nuevo);
 editingId=tmp;
 partesSubtab="editando";
 document.getElementById("partesEditando").classList.remove("hidden");
 document.getElementById("partesGuardados").classList.add("hidden");
 document.querySelectorAll(".subTabs button").forEach(x=>x.classList.remove("active"));
 document.getElementById("tabEditando").classList.add("active");
 render();
}
function aplicarFiltroEmpleados(input,id){
 let q=String(input.value||"").toLowerCase();
 let sel=document.querySelector(`[data-id="${id}"][data-campo="Empleado"]`);
 if(!sel)return;
 Array.from(sel.options).forEach(opt=>{
   if(!opt.value){opt.hidden=false;return;}
   opt.hidden=!opt.textContent.toLowerCase().includes(q);
 });
 sel.focus();
}


function aplicarReglaSituacion(p){
 if(!p)return p;
 if(p.Situacion!=="Trabajo"){
   Object.assign(p,{
     TipoZona:"",
     Zona:"",
     JM:"",
     TipoTrabajo:"",
     SubtipoTrabajo:"",
     Ordinarias:7.5,
     Peligrosidad:0,
     Extras:0
   });
 }
 return p;
}

function editF(id,f,v){
 let p=partes.find(x=>x.ID===id); if(!p)return;

 // En situaciones distintas de Trabajo solo se permiten Fecha, Empleado y Situación.
 // Las horas ordinarias quedan fijadas automáticamente en 7,50.
 let bloqueadosNoTrabajo=["TipoZona","Zona","JM","TipoTrabajo","SubtipoTrabajo","Ordinarias","Peligrosidad","Extras"];
 if(p.Situacion!=="Trabajo" && bloqueadosNoTrabajo.includes(f))return;

 if(["Ordinarias","Peligrosidad","Extras"].includes(f))v=redondearMediaHora(v);
 p[f]=v;
 if(f==="Extras")aplicarReglaExtras(p);
 if(f==="Fecha"&&v)localStorage.ultimaFechaParte=v;
 p._dirty=true;

 if(f==="Situacion"){
   aplicarReglaSituacion(p);
 }
 if(f==="JM"){p.TipoTrabajo="";p.SubtipoTrabajo=""}
 if(f==="TipoTrabajo"){p.SubtipoTrabajo="";aplicarSubtipoAutomatico(p);}
 if(f==="TipoZona")p.Zona="";
 render();
}

function validarParte(p){
 aplicarReglaSituacion(p);
 if(p.Situacion==="Trabajo")aplicarSubtipoAutomatico(p);
 if(!p.Fecha)return "Fecha obligatoria";
 if(!p.Empleado)return "Empleado obligatorio";
 if(!p.Situacion)return "Situación obligatoria";
 if(p.Situacion==="Trabajo"){
  if(!p.TipoZona)return "Tipo zona obligatorio";
  if(!p.Zona)return "Zona obligatoria";
  if(!p.JM)return "Jardinería/Mantenimiento obligatorio";
  if(!p.TipoTrabajo)return "Tipo trabajo obligatorio";
  if(!p.SubtipoTrabajo)return "Subtipo trabajo obligatorio";
 }else{
  if(n(p.Ordinarias)!==7.5)return "En una situación distinta de Trabajo las horas ordinarias deben ser 7,50";
 }
 if(p.Ordinarias===""||isNaN(n(p.Ordinarias)))return "Horas ordinarias obligatorias";
 if(p.Peligrosidad!==""&&isNaN(n(p.Peligrosidad)))return "Peligrosidad debe ser numérica";
 if(p.Extras!==""&&isNaN(n(p.Extras)))return "Extras debe ser numérico";
 return "";
}

async function savePart(id){
 let p=partes.find(x=>x.ID===id); if(!p)return;
 aplicarReglaSituacion(p);
 if(p.Situacion==="Trabajo")aplicarReglaExtras(p);
 let err=validarParte(p); if(err)return alert(err);

 let fechaGuardada=p.Fecha || today();
 if(fechaGuardada)localStorage.ultimaFechaParte=fechaGuardada;

 try{
  setBusy(true,"Guardando parte...");
  const payload=Object.assign({},p);
  delete payload._dirty;
  delete payload._new;
  if(String(payload.ID).startsWith("tmp_"))delete payload.ID;

  let res=await api({accion:"guardarParte",parte:payload});
  let parteGuardado=Object.assign({},payload,res.parte||{});
  let diaCompleto=estadoCompletoConParteGuardado(fechaGuardada,parteGuardado);

  await loadAll();

  let fechaNuevo=diaCompleto?siguienteDiaLaborable(fechaGuardada):fechaGuardada;
  localStorage.ultimaFechaParte=fechaNuevo;

  let nuevo=nuevoParteBlanco(fechaNuevo);
  partes.unshift(nuevo);
  editingId=nuevo.ID;
  partesSubtab="editando";

  document.getElementById("partesEditando").classList.remove("hidden");
  document.getElementById("partesGuardados").classList.add("hidden");
  document.querySelectorAll(".subTabs button").forEach(x=>x.classList.remove("active"));
  document.getElementById("tabEditando").classList.add("active");

  setBusy(false,diaCompleto?"Día completado":"Parte guardado");

  if(diaCompleto){
    msg("loginMsg","Día completado. Se abre el siguiente día laborable: "+fechaNuevo,true);
  }else{
    let sig=trabajadorPendiente(fechaGuardada);
    msg("loginMsg","Parte guardado. Siguiente trabajador: "+(sig||"ninguno"),true);
  }

  render();
 }catch(e){
  setBusy(false,"Error");
  msg("loginMsg",e.message,false);
 }
}
async function delRow(id){
 if(!confirm("¿Eliminar este parte?"))return;
 let p=partes.find(x=>x.ID===id); if(!p)return;
 if(String(id).startsWith("tmp_")){partes=partes.filter(x=>x.ID!==id);if(editingId===id)editingId=null;render();return;}
 try{setBusy(true,"Eliminando parte...");await api({accion:"eliminarParte",id});partes=partes.filter(x=>x.ID!==id);if(editingId===id)editingId=null;setBusy(false,"Parte eliminado");render();}catch(e){setBusy(false,"Error");msg("loginMsg",e.message,false)}
}

function opt(a,val,ph=""){return (ph?`<option value="">${ph}</option>`:"")+a.map(x=>`<option value="${esc(x)}" ${x===val?"selected":""}>${esc(x)}</option>`).join("")}
function enfocarCampo(id,campo){
 setTimeout(()=>{
  let el=document.querySelector(`[data-id="${id}"][data-campo="${campo}"]`);
  if(!el)return;
  el.scrollIntoView({behavior:"smooth",block:"center"});
  el.focus();
  if(el.select) el.select();

  // En Chrome/Android, showPicker abre el desplegable nativo.
  // Si no está disponible, intentamos click como respaldo.
  if(el.tagName==="SELECT"){
    try{
      if(typeof el.showPicker==="function") el.showPicker();
      else el.click();
    }catch(e){
      try{el.click();}catch(_){}
    }
  }
 },250);
}
function siguienteCampo(id,campo){
 let p=partes.find(x=>x.ID===id);
 let orden=["Empleado","Situacion","TipoZona","Zona","JM","TipoTrabajo","SubtipoTrabajo","Ordinarias","Peligrosidad","Extras","Guardar"];

 if(p && typeof subtiposDisponibles==="function"){
   let ss=subtiposDisponibles(p);
   if(ss.length===1){
     aplicarSubtipoAutomatico(p);
     orden=orden.filter(x=>x!=="SubtipoTrabajo");
   }
 }

 let i=orden.indexOf(campo);
 let destino=orden[i+1]||"Guardar";

 if(campo==="TipoTrabajo" && p && typeof subtiposDisponibles==="function"){
   let ss=subtiposDisponibles(p);
   if(ss.length===1) destino="Ordinarias";
 }

 enfocarCampo(id,destino);
}
function editFNext(id,f,v){
 editF(id,f,v);
 let p=partes.find(x=>x.ID===id);
 if(f==="Situacion" && p && p.Situacion!=="Trabajo"){
   setTimeout(()=>enfocarCampo(id,"Guardar"),350);
   return;
 }
 setTimeout(()=>siguienteCampo(id,f),350);
}
function avanzarEnter(e,id,campo){
 if(e.key==="Enter"){e.preventDefault();siguienteCampo(id,campo);}
}
function subtiposDisponibles(p){
 if(!p || !p.JM || !p.TipoTrabajo || !TRAB[p.JM] || !TRAB[p.JM][p.TipoTrabajo]) return [];
 return TRAB[p.JM][p.TipoTrabajo] || [];
}
function aplicarSubtipoAutomatico(p){
 let ss=subtiposDisponibles(p);
 if(ss.length===1) p.SubtipoTrabajo=ss[0];
 return p;
}


function horasPositivas(v){return n(v)>0}
function aplicarReglaExtras(p){
 if(!p)return p;
 if(horasPositivas(p.Extras)) p.Ordinarias="0,00";
 return p;
}

function fechaDentroRevision(p){
 if(!p || !p.Fecha)return false;
 let d=document.getElementById("revDesde") ? revDesde.value : "";
 let h=document.getElementById("revHasta") ? revHasta.value : "";
 if(d && p.Fecha<d)return false;
 if(h && p.Fecha>h)return false;
 return true;
}
function inicializarFechasRevision(){
 if(document.getElementById("revDesde") && !revDesde.value) revDesde.value=desde.value;
 if(document.getElementById("revHasta") && !revHasta.value) revHasta.value=hasta.value;
}

function empleadoRevisionSeleccionado(){
 return document.getElementById("revEmp") ? revEmp.value : "";
}
function partesEmpleadoRevision(){
 let emp=empleadoRevisionSeleccionado();
 return partesTodas.filter(p=>(!emp || p.Empleado===emp) && fechaDentroRevision(p));
}
function partesExtrasEmpleado(){
 return partesEmpleadoRevision().filter(p=>horasPositivas(p.Extras));
}

function inicializarFechasOrdinarias(){
 if(document.getElementById("ordDesde") && !ordDesde.value) ordDesde.value=desde.value;
 if(document.getElementById("ordHasta") && !ordHasta.value) ordHasta.value=hasta.value;
}
function fechaDentroOrdinarias(p){
 if(!p || !p.Fecha)return false;
 let d=document.getElementById("ordDesde") ? ordDesde.value : "";
 let h=document.getElementById("ordHasta") ? ordHasta.value : "";
 if(d && p.Fecha<d)return false;
 if(h && p.Fecha>h)return false;
 return true;
}
function empleadoOrdinariasSeleccionado(){
 return document.getElementById("ordEmp") ? ordEmp.value : "";
}
function fechasEntre(d,h){
 let out=[];
 if(!d || !h)return out;
 let cur=new Date(d+"T00:00:00");
 let end=new Date(h+"T00:00:00");
 while(cur<=end){
   let f=cur.toISOString().slice(0,10);
   if(esDiaLaborable(f)) out.push(f);
   cur.setDate(cur.getDate()+1);
 }
 return out;
}
function renderRevisionOrdinarias(){
 if(!document.getElementById("ordEmp"))return;
 inicializarFechasOrdinarias();
 let names=nombresHistoricos();
 ordEmp.innerHTML=opt(names,ordEmp.value,"Empleado");
 let emp=ordEmp.value;
 if(!emp){
   ordResumen.innerHTML='<p class="muted">Selecciona un empleado para revisar sus horas ordinarias.</p>';
   ordTabla.innerHTML='<tr><td colspan="6" class="muted">Sin empleado seleccionado.</td></tr>';
   return;
 }
 let empleadoObj=emps.find(e=>e.Nombre===emp);
 let alta=empleadoObj?fechaAltaEmpleado(empleadoObj):FECHA_INICIO_CONTROL;
 let baja=empleadoObj?fechaBajaEmpleado(empleadoObj):"";
 let inicioReal=ordDesde.value>alta?ordDesde.value:alta;
 let finReal=baja && baja<ordHasta.value?baja:ordHasta.value;
 let fechas=inicioReal<=finReal?fechasEntre(inicioReal,finReal):[];
 let totalOrd=0, correctos=0, avisos=0;
 let rows=fechas.map(f=>{
   let ps=partesTodas.filter(p=>p.Empleado===emp && p.Fecha===f);
   let ord=ps.reduce((a,p)=>a+n(p.Ordinarias),0);
   totalOrd+=ord;
   let estado="";
   if(ps.length===0){estado="⚠ Falta parte"; avisos++;}
   else if(ord<7.5){estado="⚠ Faltan "+(typeof mcoma==="function"?mcoma(7.5-ord):m(7.5-ord))+" h"; avisos++;}
   else if(ord>7.5){estado="⚠ Sobran "+(typeof mcoma==="function"?mcoma(ord-7.5):m(ord-7.5))+" h"; avisos++;}
   else {estado="✓ Correcto"; correctos++;}
   let acciones=ps.length?ps.map(p=>`<div style="margin:4px 0">${botonesRevisionParte(p.ID)}</div>`).join(""):"";
   return `<tr><td>${f}</td><td>${esc(emp)}</td><td><b>${typeof mcoma==="function"?mcoma(ord):m(ord)}</b></td><td>${estado}</td><td>${ps.length}</td><td>${acciones}</td></tr>`;
 }).join("");
 ordResumen.innerHTML=`<div class="stats"><div class="stat">Empleado<b>${esc(emp)}</b></div><div class="stat">Total ordinarias<b>${typeof mcoma==="function"?mcoma(totalOrd):m(totalOrd)}</b></div><div class="stat">Días laborables correctos<b>${correctos}</b></div><div class="stat">Avisos<b>${avisos}</b></div><div class="stat">Periodo revisado<b>${inicioReal || "-"} / ${finReal || "-"}</b></div><div class="stat">Alta / baja<b>${alta || "-"} / ${baja || "Continúa"}</b></div></div><p class="muted">Solo se revisan los días laborables comprendidos dentro del periodo de alta del empleado. Se excluyen sábados, domingos y festivos.</p>`;
 ordTabla.innerHTML=rows || '<tr><td colspan="6" class="muted">No hay fechas para revisar.</td></tr>';
}


async function eliminarParteRevision(id){
 if(!confirm("¿Eliminar este parte?"))return;
 await delRow(id);
 setTimeout(()=>{renderRevisionExtras();renderRevisionOrdinarias();},200);
}
function botonesRevisionParte(id){
 return `<button onclick="editarParte('${id}')">Editar</button> <button class="danger" onclick="eliminarParteRevision('${id}')">Eliminar</button>`;
}


function nombresHistoricos(){
 let set=new Set(emps.map(e=>e.Nombre).filter(Boolean));
 partesTodas.forEach(p=>{if(p.Empleado)set.add(p.Empleado);});
 return [...set].sort((a,b)=>String(a).localeCompare(String(b),"es"));
}

function renderRevisionExtras(){
 if(!document.getElementById("revEmp"))return;
 inicializarFechasRevision();
 let names=nombresHistoricos();
 revEmp.innerHTML=opt(names,revEmp.value,"Empleado");
 let emp=revEmp.value;
 let lista=partesExtrasEmpleado();
 let totalExt=lista.reduce((a,p)=>a+n(p.Extras),0);
 let totalOrd=partesEmpleadoRevision().reduce((a,p)=>a+n(p.Ordinarias),0);
 let totalPel=partesEmpleadoRevision().reduce((a,p)=>a+n(p.Peligrosidad),0);

 revResumen.innerHTML=emp
  ? `<div class="stats"><div class="stat">Empleado<b>${esc(emp)}</b></div><div class="stat">Extras<b>${typeof mcoma==="function"?mcoma(totalExt):m(totalExt)}</b></div><div class="stat">Ordinarias<b>${typeof mcoma==="function"?mcoma(totalOrd):m(totalOrd)}</b></div><div class="stat">Peligrosidad<b>${typeof mcoma==="function"?mcoma(totalPel):m(totalPel)}</b></div><div class="stat">Partes extras<b>${lista.length}</b></div></div><p class="muted">Periodo revisado: ${revDesde.value || "sin inicio"} a ${revHasta.value || "sin fin"}</p>`
  : `<p class="muted">Selecciona un empleado para revisar sus horas extras.</p>`;

 revTabla.innerHTML=lista.length?lista.map(p=>`
  <tr>
   <td>${esc(p.Fecha||"")}</td>
   <td>${esc(p.Empleado||"")}</td>
   <td>${esc(p.Zona||"")}</td>
   <td>${esc(p.TipoTrabajo||"")}</td>
   <td>${esc(p.SubtipoTrabajo||"")}</td>
   <td><b>${typeof mcoma==="function"?mcoma(p.Extras):m(p.Extras)}</b></td>
   <td>${typeof mcoma==="function"?mcoma(p.Ordinarias):m(p.Ordinarias)}</td>
   <td>${botonesRevisionParte(p.ID)}</td>
  </tr>`).join(""):`<tr><td colspan="8" class="muted">No hay horas extras para este empleado en el rango seleccionado.</td></tr>`;
}


const ORDEN_TRABAJADORES = ["ABDESLAM","ENRIQUE","SONIA","FERNANDO","ANTONIO","JOSE","MIGUEL","LUIS"];

function nombreOrdenClave(nombre){
 let normalizado=String(nombre||"")
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g,"")
   .trim()
   .toUpperCase();

 // Se usa la primera palabra del nombre para evitar coincidencias parciales
 // entre nombres compuestos, por ejemplo JOSE ANTONIO.
 let primerNombre=normalizado.split(/\s+/)[0];

 return ORDEN_TRABAJADORES.indexOf(primerNombre);
}

function fechaAltaEmpleado(e){
 return fechaYMD(e&&e.FechaAlta)||FECHA_INICIO_CONTROL;
}
function fechaBajaEmpleado(e){
 return fechaYMD(e&&e.FechaBaja)||"";
}
function esEmpleadoActivo(e){
 return String(e.Activo).toUpperCase()!=="FALSE" && !fechaBajaEmpleado(e);
}
function empleadoEnPlantillaFecha(e,fecha){
 if(!e||!fecha)return false;
 let alta=fechaAltaEmpleado(e);
 let baja=fechaBajaEmpleado(e);
 return fecha>=alta && (!baja || fecha<=baja);
}
function empleadosActivos(){
 return emps.filter(esEmpleadoActivo);
}
function empleadosDisponiblesFecha(fecha){
 return emps.filter(e=>empleadoEnPlantillaFecha(e,fecha));
}


function coincideNombreOrden(nombre,clave){
 let normalizado=String(nombre||"")
   .normalize("NFD")
   .replace(/[\u0300-\u036f]/g,"")
   .trim()
   .toUpperCase();
 return normalizado.split(/\s+/)[0]===clave;
}

function empleadosOrdenados(fecha){
 let activos=fecha?empleadosDisponiblesFecha(fecha):empleadosActivos();
 let base=[];
 let nuevos=[];

 activos.forEach((e,indice)=>{
   let orden=nombreOrdenClave(e.Nombre);
   if(orden<0)orden=999;
   let item={nombre:e.Nombre,orden,indice};
   if(orden<999) base.push(item);
   else nuevos.push(item);
 });

 base.sort((a,b)=>{
   if(a.orden!==b.orden)return a.orden-b.orden;
   return a.indice-b.indice;
 });

 // Los empleados nuevos conservan el orden en que aparecen en Google Sheets,
 // por lo que siempre quedan detrás del último empleado configurado.
 nuevos.sort((a,b)=>a.indice-b.indice);

 return [...base,...nuevos].map(x=>x.nombre);
}
function totalOrdinariasEmpleadoFecha(nombre,fecha,excluirId=""){
 return partes.filter(p=>p.Empleado===nombre&&p.Fecha===fecha&&p.ID!==excluirId)
   .reduce((acc,p)=>acc+n(p.Ordinarias),0);
}
function trabajadorPendiente(fecha,excluirId=""){
 for(let nombre of empleadosOrdenados(fecha)){
   if(totalOrdinariasEmpleadoFecha(nombre,fecha,excluirId)<7.5)return nombre;
 }
 return "";
}
function todosCompletosFecha(fecha){
 return empleadosOrdenados(fecha).every(nombre=>totalOrdinariasEmpleadoFecha(nombre,fecha)>=7.5);
}
function estadoTrabajadoresDia(fecha){
 return empleadosOrdenados(fecha).map(nombre=>{
   let total=totalOrdinariasEmpleadoFecha(nombre,fecha);
   return {nombre,total,pendiente:Math.max(0,7.5-total),completo:total>=7.5};
 });
}


function estadoCompletoConParteGuardado(fecha,parteGuardado){
 let nombres=empleadosOrdenados(fecha);
 return nombres.every(nombre=>{
   let total=partes
     .filter(p=>p.Fecha===fecha && p.Empleado===nombre && p.ID!==parteGuardado.ID)
     .reduce((acc,p)=>acc+n(p.Ordinarias),0);

   if(parteGuardado.Fecha===fecha && parteGuardado.Empleado===nombre){
     total+=n(parteGuardado.Ordinarias);
   }
   return total>=7.5;
 });
}

function siguienteDiaLaborable(fecha){
 let d=new Date((fecha||today())+"T00:00:00");
 do{
   d.setDate(d.getDate()+1);
   fecha=d.toISOString().slice(0,10);
 }while(!esDiaLaborable(fecha));
 return fecha;
}

function renderProgresoDia(){
 let el=document.getElementById("progresoDia");
 if(!el)return;
 let actual=editingId?partes.find(p=>p.ID===editingId):null;
 let fecha=(actual&&actual.Fecha)||localStorage.ultimaFechaParte||today();
 if(!fecha){el.innerHTML="";return;}
 let estados=estadoTrabajadoresDia(fecha);
 el.innerHTML=`<div class="pill"><b>Orden del día ${fecha}</b></div>`+
 estados.map(e=>`<div class="pill ${e.completo?"ok":"warn"}"><b>${esc(e.nombre)}</b>: ${typeof mcoma==="function"?mcoma(e.total):m(e.total)} h ${e.completo?"✓":"· faltan "+(typeof mcoma==="function"?mcoma(e.pendiente):m(e.pendiente))+" h"}</div>`).join("");
}

function render(){
 let parteActual=editingId?partes.find(p=>p.ID===editingId):null;
 let fechaNombres=(parteActual&&parteActual.Fecha)||localStorage.ultimaFechaParte||today();
 let names=empleadosOrdenados(fechaNombres);
 if(document.getElementById("newEmpAlta")&&!newEmpAlta.value)newEmpAlta.value=today();
 filtroEmp.innerHTML=opt(names,filtroEmp.value||names[0]||"");
 empList.innerHTML=emps.map(e=>{
 let activo=esEmpleadoActivo(e);
 let alta=fechaAltaEmpleado(e);
 let baja=fechaBajaEmpleado(e);
 return `<div class="pill ${activo?"ok":"warn"}" style="display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin:7px 0">
   <b style="min-width:130px">${esc(e.Nombre)}</b>
   <label>Alta <input id="alta_${e.ID}" type="date" value="${esc(alta)}"></label>
   <label>Baja <input id="baja_${e.ID}" type="date" value="${esc(baja)}"></label>
   <span>${activo?"Activo":"Baja"}</span>
   <button class="secondary" onclick="guardarFechasEmpleado('${e.ID}')">Guardar fechas</button>
   ${activo?`<button class="danger" onclick="bajaEmpleado('${e.ID}')">Dar de baja</button>`:`<button class="secondary" onclick="reactivarEmpleado('${e.ID}')">Reactivar</button>`}
  </div>`;
}).join("");

 let editList = editingId ? partes.filter(r=>r.ID===editingId) : partes.filter(r=>r._dirty||r._new).slice(0,1);
 if(editList.length) editingId=editList[0].ID;

 editCards.innerHTML=editList.length?editList.map((r,i)=>cardHtml(r,i,names,false)).join(""):"<p class='muted'>No hay ningún parte en edición. Pulsa <b>Añadir parte</b> para empezar uno nuevo. Los partes guardados están en la pestaña <b>Partes ya rellenos</b>.</p>";
 savedCards.innerHTML=partes.length?partes.map((r,i)=>cardHtml(r,i,names,true)).join(""):"<p class='muted'>No hay partes guardados en el rango seleccionado.</p>";

 dashRender();nominaRender();valRender();renderProgresoDia();renderRevisionExtras();renderProgresoDia();renderRevisionOrdinarias();renderProgresoDia();
}
function cardHtml(r,i,names,compact=false){
 aplicarReglaSituacion(r);
 if(r.Situacion==="Trabajo")aplicarSubtipoAutomatico(r);
 let noTrabajo=r.Situacion!=="Trabajo";
 let zs=r.TipoZona?(ZONAS[r.TipoZona]||[]):[],ts=r.JM?Object.keys(TRAB[r.JM]||{}):[],ss=r.JM&&r.TipoTrabajo?(TRAB[r.JM][r.TipoTrabajo]||[]):[];
 let cls="parteCard"+(r._dirty?" dirty":"")+(compact?" compact":"");
 let estado=r._dirty?" · sin guardar":"";
 return `<div class="${cls}" id="card_${r.ID}"><h3>Parte ${i+1} · ${esc(r.Fecha||"Sin fecha")}${estado}</h3>${compact?`<div class="savedSummary"><b>${esc(r.Empleado||"Sin empleado")}</b><br>${esc(r.JM||"")} · ${esc(r.TipoTrabajo||"")} · ${esc(r.SubtipoTrabajo||"")}<br>Ord.: ${mcoma(r.Ordinarias)} · Pelig.: ${mcoma(r.Peligrosidad)} · Extras: ${mcoma(r.Extras)}</div>`:""}<div class="formGrid">
 <div class="field"><label>Fecha</label>
 <div class="fechaGrid">
  <select onchange="setFechaPart('${r.ID}','d',this.value)">${numOptions(31,fechaParts(r.Fecha).d)}</select>
  <select onchange="setFechaPart('${r.ID}','m',this.value)">${numOptions(12,fechaParts(r.Fecha).m)}</select>
  <select onchange="setFechaPart('${r.ID}','y',this.value)">${yearOptions(fechaParts(r.Fecha).y)}</select>
 </div>
 <div class="fechaBtns">
  <button type="button" class="secondary" onclick="fechaQuick('${r.ID}','hoy')">Hoy</button>
  <button type="button" class="secondary" onclick="fechaQuick('${r.ID}','ayer')">Ayer</button>
  <button type="button" class="secondary" onclick="fechaQuick('${r.ID}','menos')">-1 día</button>
  <button type="button" class="secondary" onclick="fechaQuick('${r.ID}','mas')">+1 día</button>
  <button type="button" class="secondary" onclick="fechaQuick('${r.ID}','ultima')">Última fecha</button>
 </div>
</div>
 <div class="field"><label>Empleado</label><div class="row"><input type="text" placeholder="Buscar empleado" oninput="aplicarFiltroEmpleados(this,'${r.ID}')" style="flex:1"></div><select data-id="${r.ID}" data-campo="Empleado" onchange="editFNext('${r.ID}','Empleado',this.value)">${opt(names,r.Empleado,"Empleado")}</select></div>
 <div class="field"><label>Situación</label><select data-id="${r.ID}" data-campo="Situacion" onchange="editFNext('${r.ID}','Situacion',this.value)">${opt(SITS,r.Situacion)}</select></div>
 <div class="field"><label>Tipo zona</label><select data-id="${r.ID}" data-campo="TipoZona" ${noTrabajo?"disabled":""} onchange="editFNext('${r.ID}','TipoZona',this.value)">${opt(Object.keys(ZONAS),r.TipoZona,"Tipo zona")}</select></div>
 <div class="field"><label>Zona</label><select data-id="${r.ID}" data-campo="Zona" ${noTrabajo?"disabled":""} onchange="editFNext('${r.ID}','Zona',this.value)">${opt(zs,r.Zona,"Zona")}</select></div>
 <div class="field"><label>Jardinería / Mantenimiento</label><select data-id="${r.ID}" data-campo="JM" ${noTrabajo?"disabled":""} onchange="editFNext('${r.ID}','JM',this.value)">${opt(["Jardinería","Mantenimiento"],r.JM,"J/M")}</select></div>
 <div class="field"><label>Tipo trabajo</label><select data-id="${r.ID}" data-campo="TipoTrabajo" ${noTrabajo?"disabled":""} onchange="editFNext('${r.ID}','TipoTrabajo',this.value)">${opt(ts,r.TipoTrabajo,"Tipo")}</select></div>
 ${ss.length===1?`<div class="field"><label>Subtipo trabajo</label><input data-id="${r.ID}" data-campo="SubtipoTrabajo" type="text" value="${esc(ss[0])}" disabled><div class="muted">Subtipo automático</div></div>`:`<div class="field"><label>Subtipo trabajo</label><select data-id="${r.ID}" data-campo="SubtipoTrabajo" ${noTrabajo?"disabled":""} onchange="editFNext('${r.ID}','SubtipoTrabajo',this.value)">${opt(ss,r.SubtipoTrabajo,"Subtipo")}</select></div>`}
 <div class="hoursGrid">
  <div class="field"><label>Horas ordinarias</label><input data-id="${r.ID}" data-campo="Ordinarias" type="text" inputmode="decimal" value="${r.Ordinarias!==undefined&&r.Ordinarias!==null&&r.Ordinarias!==""?mcoma(r.Ordinarias):""}" ${noTrabajo?"readonly":""} onchange="editF('${r.ID}','Ordinarias',this.value)">${noTrabajo?`<div class="muted">Fijadas automáticamente en 7,50</div>`:""}</div>
  <div class="field"><label>Peligrosidad</label><input type="text" inputmode="decimal" value="${r.Peligrosidad!==undefined&&r.Peligrosidad!==null&&r.Peligrosidad!==""?mcoma(r.Peligrosidad):""}" ${noTrabajo?"disabled":""} onchange="editF('${r.ID}','Peligrosidad',this.value)"></div>
  <div class="field"><label>Extras</label><input type="text" inputmode="decimal" value="${r.Extras!==undefined&&r.Extras!==null&&r.Extras!==""?mcoma(r.Extras):""}" ${noTrabajo?"disabled":""} onchange="editF('${r.ID}','Extras',this.value)"></div>
 </div></div><div class="actions">${compact?`<button onclick="editarParte('${r.ID}')">Editar</button><button type="button" class="secondary" onclick="duplicarParte('${r.ID}')">Duplicar</button>`:`<button data-id="${r.ID}" data-campo="Guardar" onclick="savePart('${r.ID}')">Guardar parte</button><button type="button" class="secondary" onclick="duplicarParte('${r.ID}')">Duplicar</button>`}<button class="danger" onclick="delRow('${r.ID}')">Eliminar parte</button></div></div>`;
}

function rowsR(){return partes}
function tot(r){return n(r.Ordinarias)+n(r.Peligrosidad)+n(r.Extras)}
function totals(){let r=rowsR();return{emp:new Set(r.map(x=>x.Empleado).filter(Boolean)).size,ord:r.reduce((a,x)=>a+n(x.Ordinarias),0),pel:r.reduce((a,x)=>a+n(x.Peligrosidad),0),ext:r.reduce((a,x)=>a+n(x.Extras),0)}}
function dashRender(){let t=totals();dEmp.textContent=t.emp;dOrd.textContent=mcoma(t.ord);dPel.textContent=mcoma(t.pel);dExt.textContent=mcoma(t.ext);dTot.textContent=mcoma(t.ord+t.pel+t.ext);bars("cEmp",gS(x=>x.Empleado||"Sin empleado"));bars("cZona",gS(x=>x.Zona||"Sin zona"));bars("cTrab",gS(x=>x.TipoTrabajo||"Sin tipo"));bars("cSub",gS(x=>x.SubtipoTrabajo||"Sin subtipo"))}
function gS(fn){let mp=new Map();rowsR().forEach(r=>mp.set(fn(r),(mp.get(fn(r))||0)+tot(r)));return[...mp.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12)}
function bars(id,d){let mx=Math.max(1,...d.map(x=>x[1]));document.getElementById(id).innerHTML=d.length?d.map(([l,v])=>`<div class="barrow"><div>${esc(l.length>28?l.slice(0,28)+"...":l)}</div><div class="bar"><div style="width:${Math.max(2,v/mx*100)}%"></div></div><b>${mcoma(v)}</b></div>`).join(""):"<p class='muted'>Sin datos.</p>"}
function group(key,fields){let mp=new Map();rowsR().forEach(r=>{let k=key(r),p=mp.get(k)||{campos:fields(r),reg:0,ord:0,pel:0,ext:0};p.reg++;p.ord+=n(r.Ordinarias);p.pel+=n(r.Peligrosidad);p.ext+=n(r.Extras);mp.set(k,p)});return[...mp.values()].sort((a,b)=>a.campos.join("|").localeCompare(b.campos.join("|")))}
function gEmp(){return group(r=>r.Empleado||"Sin empleado",r=>[r.Empleado||"Sin empleado"])}
function gTrab(){return group(r=>[r.JM||"Sin J/M",r.TipoTrabajo||"Sin tipo",r.SubtipoTrabajo||"Sin subtipo"].join("|"),r=>[r.JM||"Sin J/M",r.TipoTrabajo||"Sin tipo",r.SubtipoTrabajo||"Sin subtipo"])}
function gZona(){return group(r=>[r.TipoZona||"Sin tipo",r.Zona||"Sin zona"].join("|"),r=>[r.TipoZona||"Sin tipo",r.Zona||"Sin zona"])}
function nom(){return gEmp().map(v=>({empleado:v.campos[0],ord:v.ord,pel:v.pel,ext:v.ext}))}
function nominaRender(){nomina.innerHTML=nom().map(v=>`<tr><td>${esc(v.empleado)}</td><td>${mcoma(v.ord)}</td><td>${mcoma(v.pel)}</td><td>${mcoma(v.ext)}</td><td><b>${mcoma(v.ord+v.pel+v.ext)}</b></td></tr>`).join("")}

function daily(){
 let f=fechaControlActual();
 if(!f || f < FECHA_INICIO_CONTROL || !esDiaLaborable(f)) return [];

 let map=new Map();
 partes.forEach(r=>{
  if(!r.Fecha||!r.Empleado)return;
  if(r.Fecha!==f)return;
  let k=r.Fecha+"||"+r.Empleado;
  map.set(k,(map.get(k)||0)+n(r.Ordinarias));
 });

 let empleadosActivos=empleadosOrdenados();
 return empleadosActivos.map(emp=>{
  let k=f+"||"+emp;
  let total=map.get(k);
  if(total===undefined) return {fecha:f,empleado:emp,total:0,estado:"sinparte"};
  return {fecha:f,empleado:emp,total:total,estado:total<7.5?"menos":total>7.5?"mas":"ok"};
 }).sort((a,b)=>a.empleado.localeCompare(b.empleado));
}
function incomplete(){return partes.filter(r=>!r.Fecha||!r.Empleado||!r.Situacion||(r.Situacion==="Trabajo"&&(!r.JM||!r.TipoTrabajo||!r.SubtipoTrabajo))||r.Ordinarias===""||r.Ordinarias==null)}
function valRender(){
 let f=fechaControlActual();
 if(f && !esDiaLaborable(f)){ let html=`<div class="succ">Sin control: ${f} es ${motivoNoLaborable(f)}.</div>`; control.innerHTML=html; if(document.getElementById("controlPartes")) controlPartes.innerHTML=html; }
 else if(!f || f < FECHA_INICIO_CONTROL){
   let html=`<div class="succ">Sin control: la fecha seleccionada es anterior al inicio del sistema (${FECHA_INICIO_CONTROL}).</div>`;
   control.innerHTML=html;
   if(document.getElementById("controlPartes")) controlPartes.innerHTML=html;
 } else {
   let avisos=daily();
   let problem=avisos.filter(x=>x.estado!=="ok");
   let resumen=`<div class="pill"><b>Control del día ${f}</b></div>`;
   let controlHtml=resumen+(avisos.length?avisos.map(x=>{
    let cls=x.estado==="ok"?"ok":"warn";
    let txt="";
    if(x.estado==="ok") txt="✓ correcto";
    if(x.estado==="sinparte") txt="⚠ falta parte";
    if(x.estado==="menos") txt="⚠ faltan "+mcoma(7.5-x.total)+" h";
    if(x.estado==="mas") txt="⚠ sobran "+mcoma(x.total-7.5)+" h";
    return `<div class="pill ${cls}"><b>${esc(x.empleado)}</b>: ${mcoma(x.total)} h ${txt}</div>`;
   }).join(""):"<p class='muted'>Sin datos.</p>");

   control.innerHTML=controlHtml;
   if(document.getElementById("controlPartes")){
    controlPartes.innerHTML=problem.length
     ? `<div class="warn" style="padding:10px;border-radius:12px;margin-bottom:8px"><b>Control del día ${f}:</b> hay ${problem.length} aviso(s). Cada empleado debe tener parte y 7,50 h ordinarias.</div>`+problem.map(x=>{
       let txt=x.estado==="sinparte"?"falta parte":x.estado==="menos"?"faltan "+mcoma(7.5-x.total)+" h":"sobran "+mcoma(x.total-7.5)+" h";
       return `<div class="pill warn"><b>${esc(x.empleado)}</b>: ${txt}</div>`;
      }).join("")
     : `<div class='succ'>Control del día ${f}: todos los empleados tienen parte y 7,50 h ordinarias.</div>`;
   }
 }

 let inc=incomplete();
 incomp.innerHTML=inc.length?inc.map(r=>`<div class="pill warn"><b>${esc(r.Fecha||"Sin fecha")}</b> ${esc(r.Empleado||"Sin empleado")} - incompleto</div>`).join(""):"<div class='succ'>No hay registros incompletos.</div>";
}
const HEAD=["Fecha","Empleado","Situación","Tipo zona","Zona","J/M","Tipo trabajo","Subtipo","Ordinarias","Peligrosidad","Extras"];
function det(r){return[r.Fecha,r.Empleado,r.Situacion,r.TipoZona,r.Zona,r.JM,r.TipoTrabajo,r.SubtipoTrabajo,mcoma(r.Ordinarias),mcoma(r.Peligrosidad),mcoma(r.Extras)]}
function cesc(v){return '"'+String(v??"").replaceAll('"','""')+'"'}
function dlcsv(nm,head,rs){let lines=[head.map(cesc).join(";")];rs.forEach(r=>lines.push(r.map(cesc).join(";")));let blob=new Blob(["\uFEFF"+lines.join("\n")],{type:"text/csv;charset=utf-8;"});let u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=nm;a.click();URL.revokeObjectURL(u)}
function groupRows(g){return g.map(v=>[...v.campos,v.reg,m(v.ord),m(v.pel),m(v.ext),m(v.ord+v.pel+v.ext)])}
function csvDetalle(){dlcsv("detalle_por_fechas.csv",HEAD,rowsR().map(det))}
function csvEmpleados(){dlcsv("resumen_empleados.csv",["Empleado","Registros","Ordinarias","Peligrosidad","Extras","Total"],groupRows(gEmp()))}
function csvTrabajos(){dlcsv("resumen_trabajos.csv",["J/M","Tipo","Subtipo","Registros","Ordinarias","Peligrosidad","Extras","Total"],groupRows(gTrab()))}
function csvZonas(){dlcsv("resumen_zonas.csv",["Tipo zona","Zona","Registros","Ordinarias","Peligrosidad","Extras","Total"],groupRows(gZona()))}
function csvNomina(){dlcsv("resumen_nomina.csv",["Empleado","Ordinarias","Peligrosidad","Extras","Total"],nom().map(v=>[v.empleado,m(v.ord),m(v.pel),m(v.ext),m(v.ord+v.pel+v.ext)]))}
function xlsx(){if(typeof XLSX==="undefined")return alert("No se cargó la librería Excel.");let t=totals(),wb=XLSX.utils.book_new(),aoa=XLSX.utils.aoa_to_sheet;XLSX.utils.book_append_sheet(wb,aoa([["Resumen general"],["Desde",desde.value],["Hasta",hasta.value],["Empleados",t.emp],["Ordinarias",m(t.ord)],["Peligrosidad",m(t.pel)],["Extras",m(t.ext)],["Total",m(t.ord+t.pel+t.ext)]]),"Resumen General");XLSX.utils.book_append_sheet(wb,aoa([["Empleado","Ordinarias","Peligrosidad","Extras","Total"],...nom().map(v=>[v.empleado,+m(v.ord),+m(v.pel),+m(v.ext),+m(v.ord+v.pel+v.ext)])]),"Resumen Nomina");XLSX.utils.book_append_sheet(wb,aoa([["Empleado","Registros","Ordinarias","Peligrosidad","Extras","Total"],...groupRows(gEmp())]),"Por Empleado");XLSX.utils.book_append_sheet(wb,aoa([["J/M","Tipo","Subtipo","Registros","Ordinarias","Peligrosidad","Extras","Total"],...groupRows(gTrab())]),"Por Trabajo");XLSX.utils.book_append_sheet(wb,aoa([["Tipo zona","Zona","Registros","Ordinarias","Peligrosidad","Extras","Total"],...groupRows(gZona())]),"Por Zona");XLSX.utils.book_append_sheet(wb,aoa([HEAD,...rowsR().map(det)]),"Detalle");XLSX.writeFile(wb,`informe_partes_${desde.value}_${hasta.value}.xlsx`)}
function backup(){let blob=new Blob([JSON.stringify({version:"v6.10.24",fecha:new Date().toISOString(),empleados:emps,partes},null,2)],{type:"application/json"});let u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="copia_seguridad_partes.json";a.click();URL.revokeObjectURL(u);msg("bakMsg","Copia exportada.",true)}

desde.addEventListener("change",()=>{localStorage.desde=desde.value;loadAll()});
hasta.addEventListener("change",()=>{localStorage.hasta=hasta.value;loadAll()});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
init();
