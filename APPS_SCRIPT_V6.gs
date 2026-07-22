const SPREADSHEET_ID = "1bsx9BCdf629FMaZoxrrAUlb221OsJffDjz5Q0Rgj_eU";

function doGet(e) {
  try {
    if (e.parameter && e.parameter.payload) {
      const data = JSON.parse(e.parameter.payload);
      const result = ejecutarAccion(data);
      return responderJsonp(e.parameter.callback, result);
    }
    return responderJsonp(e.parameter && e.parameter.callback, { ok: true, mensaje: "API Partes Montealina v6 activa" });
  } catch (err) {
    return responderJsonp(e.parameter && e.parameter.callback, { ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return responder(ejecutarAccion(data));
  } catch (err) {
    return responder({ ok: false, error: err.message });
  }
}

function ejecutarAccion(data) {
  prepararHojas();
  const accion = data.accion;
  if (accion === "leerTodo") return leerTodo();
  if (accion === "guardarParte") return guardarParte(data.parte);
  if (accion === "eliminarParte") return eliminarParte(data.id);
  if (accion === "guardarEmpleado") return guardarEmpleado(data.empleado);
  if (accion === "eliminarEmpleado") return eliminarEmpleado(data.id);
  if (accion === "prepararHojas") return prepararHojas();
  return { ok: false, error: "Acción no reconocida" };
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function responderJsonp(callback, obj) {
  const cb = callback || "callback";
  return ContentService.createTextOutput(cb + "(" + JSON.stringify(obj) + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function libro() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

function prepararHojas() {
  const ss = libro();
  asegurarHoja(ss, "Empleados", ["ID","Nombre","Activo","FechaAlta","FechaBaja"]);
  asegurarHoja(ss, "Partes", ["ID","Fecha","Empleado","Situacion","TipoZona","Zona","JM","TipoTrabajo","SubtipoTrabajo","Ordinarias","Peligrosidad","Extras"]);
  return { ok: true };
}

function asegurarHoja(ss, nombre, headers) {
  let sh = ss.getSheetByName(nombre);
  if (!sh) sh = ss.insertSheet(nombre);

  let lastColumn = Math.max(sh.getLastColumn(), 1);
  let actuales = sh.getRange(1, 1, 1, lastColumn).getValues()[0]
    .map(h => String(h || "").trim());

  if (actuales.every(h => !h)) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  headers.forEach(h => {
    if (actuales.indexOf(h) === -1) {
      actuales.push(h);
      sh.getRange(1, actuales.length).setValue(h);
    }
  });
}

function leerTodo() {
  const ss = libro();
  return { ok: true, version: "v6.10.24", empleados: leerHoja(ss, "Empleados"), partes: leerHoja(ss, "Partes") };
}

function leerHoja(ss, nombre) {
  const sh = ss.getSheetByName(nombre);
  if (!sh) throw new Error("No existe la pestaña: " + nombre);
  const values = sh.getDataRange().getDisplayValues();
  if (values.length === 0) return [];
  const headers = values.shift().map(h => String(h).trim());
  return values.filter(row => row.some(c => c !== "")).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function guardarParte(parte) {
  const ss = libro();
  const sh = ss.getSheetByName("Partes");
  const data = sh.getDataRange().getDisplayValues();
  const headers = data[0].map(h => String(h).trim());
  if (!parte.ID) parte.ID = Utilities.getUuid();
  parte.Fecha = normalizarFecha(parte.Fecha);
  parte.Ordinarias = redondearMediaHora(parte.Ordinarias);
  parte.Peligrosidad = redondearMediaHora(parte.Peligrosidad);
  parte.Extras = redondearMediaHora(parte.Extras);
  if (horasPositivas(parte.Extras)) parte.Ordinarias = "0,00";

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(parte.ID)) { rowIndex = i + 1; break; }
  }
  const row = headers.map(h => parte[h] ?? "");
  if (rowIndex > -1) sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row);
  return { ok: true, parte };
}

function eliminarParte(id) {
  const ss = libro();
  const sh = ss.getSheetByName("Partes");
  const data = sh.getDataRange().getDisplayValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { ok: false, error: "Parte no encontrado" };
}

function guardarEmpleado(empleado) {
  const ss = libro();
  const sh = ss.getSheetByName("Empleados");
  const data = sh.getDataRange().getDisplayValues();
  const headers = data[0].map(h => String(h).trim());
  const idCol = headers.indexOf("ID");
  if (idCol === -1) throw new Error("No se encuentra la columna ID en Empleados.");

  if (!empleado.ID) empleado.ID = Utilities.getUuid();
  if (empleado.Activo === undefined) empleado.Activo = true;

  empleado.FechaAlta = normalizarFecha(empleado.FechaAlta);
  empleado.FechaBaja = normalizarFecha(empleado.FechaBaja);
  if (!empleado.FechaAlta) empleado.FechaAlta = "2026-05-20";
  if (empleado.FechaBaja && empleado.FechaBaja < empleado.FechaAlta) {
    throw new Error("La fecha de baja no puede ser anterior a la fecha de alta.");
  }

  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(empleado.ID)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > -1) {
    const existente = {};
    headers.forEach((h, i) => existente[h] = data[rowIndex - 1][i]);
    headers.forEach(h => {
      if (empleado[h] === undefined) empleado[h] = existente[h] ?? "";
    });
  }

  const row = headers.map(h => empleado[h] ?? "");
  if (rowIndex > -1) {
    sh.getRange(rowIndex, 1, 1, row.length).setNumberFormat("@");
    sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sh.appendRow(row);
    sh.getRange(sh.getLastRow(), 1, 1, row.length).setNumberFormat("@");
  }

  return { ok: true, empleado: empleado };
}

function eliminarEmpleado(id) {
  const ss = libro();
  const sh = ss.getSheetByName("Empleados");
  const data = sh.getDataRange().getDisplayValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) { sh.deleteRow(i + 1); return { ok: true }; }
  }
  return { ok: false, error: "Empleado no encontrado" };
}

function normalizarFecha(v) {
  if (!v) return "";
  let s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const p = s.split("/");
    return p[2] + "-" + p[1].padStart(2,"0") + "-" + p[0].padStart(2,"0");
  }
  return s;
}

function normalizarNumero(v) {
  if (v === null || v === undefined) return "";
  let s = String(v).trim().replace(",", ".");
  if (/^\d{4}-\d{2}-\d{2}/.test(s) || s.indexOf("T") > -1) return "";
  return s;
}


function redondearMediaHora(v) {
  if (v === null || v === undefined) return "";
  let s = String(v).trim().replace(",", ".");
  if (/^\d{4}-\d{2}-\d{2}/.test(s) || s.indexOf("T") > -1) return "";
  let num = Number(s);
  if (isNaN(num)) return "";
  return (Math.round(num * 2) / 2).toFixed(2).replace(".", ",");
}

function horasPositivas(v) {
  return Number(String(v || "0").replace(",", ".")) > 0;
}
