const forms = {
  PRODUCTOS: {
    title: 'MANTENIMIENTO DE PRODUCTOS',
    operation: ['Ingresar producto', 'Modificar producto'],
    fields: [
      ['Número de producto', 'number'],
      ['Nombre', 'text'],
      ['Precio', 'number']
    ],
    buttons: ['ENVIAR', 'LIMPIAR', 'VOLVER']
  },
  CLIENTES: {
    title: 'MANTENIMIENTO DE CLIENTES',
    operation: ['Ingresar cliente', 'Modificar cliente', 'Eliminar cliente'],
    fields: [
      ['Identificación', 'text'],
      ['Código de país', 'select:AF,AL,DE,AD,AO,AG,SA,DZ,AR,AM,AU,AT,AZ,BS,BD,BB,BH,BE,BZ,BJ,BY,BO,BA,BW,BR,BN,BG,BF,BI,BT,CV,KH,CM,CA,TD,CL,CN,CY,VA,CO,KM,KP,KR,CI,CR,HR,CU,DK,DM,EC,EG,SV,AE,ER,SK,SI,ES,US,EE,SZ,ET,PH,FI,FJ,FR,GA,GM,GE,GH,GD,GR,GT,GY,GN,GQ,GW,HT,HN,HU,IN,ID,IQ,IR,IE,IS,MH,SB,IL,IT,JM,JP,JO,KZ,KE,KG,KI,KW,LA,LS,LV,LB,LR,LY,LI,LT,LU,MK,MG,MY,MW,MV,ML,MT,MA,MU,MR,MX,FM,MD,MC,MN,ME,MZ,MM,NA,NR,NP,NI,NE,NG,NO,NZ,OM,NL,PK,PW,PA,PG,PY,PE,PL,PT,GB,QA,CF,CZ,CG,CD,DO,ZA,RW,RO,RU,WS,KN,SM,VC,LC,ST,SN,RS,SC,SL,SG,SY,SO,LK,SD,SS,SE,CH,SR,TH,TZ,TJ,TL,TG,TO,TT,TN,TM,TR,TV,UA,UG,UR,UZ,VU,VE,VN,YE,DJ,ZM,ZW'],
      ['Nombre', 'text'],
      ['Primer apellido', 'text'],
      ['Segundo apellido', 'text'],
      ['Correo electrónico', 'email'],
      ['Teléfono', 'tel'],
      ['Dirección', 'text']
    ],
    buttons: ['ENVIAR', 'LIMPIAR', 'VOLVER']
  },
  PROVEEDORES: {
    title: 'MANTENIMIENTO DE PROVEEDORES',
    operation: ['Ingresar proveedor', 'Modificar proveedor'],
    fields: [
      ['Cédula jurídica', 'text'],
      ['Nombre', 'text'],
      ['Contacto', 'text'],
      ['Teléfono', 'tel'],
      ['Correo electrónico', 'email'],
      ['Estado', 'select:Activo,Inactivo']
    ],
    buttons: ['ENVIAR', 'LIMPIAR', 'VOLVER']
  },
  COMPRAS: {
    title: 'REGISTRO DE COMPRAS',
    fields: [
      ['Número de compra', 'text'],
      ['Fecha', 'date'],
      ['Identificación del cliente', 'text'],
      ['Total', 'number'],
      ['Número de tarjeta', 'text'],
      ['Vencimiento', 'text'],
      ['Código de verificación', 'password']
    ],
    products: true,
    buttons: ['REGISTRAR COMPRA', 'LIMPIAR', 'VOLVER']
  },
  ENTRADA: {
    title: 'ENTRADA DE PRODUCTOS AL ALMACÉN',
    fields: [
      ['Número de Compra', 'text'],
      ['Fecha de compra', 'date'],
      ['Cédula jurídica del proveedor', 'text']
    ],
    products: true,
    buttons: ['REGISTRAR ENTRADA', 'LIMPIAR', 'VOLVER']
  }
};
let current = '';
let rows = [];
const $ = s => document.querySelector(s);

function openScreen(key) {
  current = key;
  rows = [];
  const cfg = forms[key];
  $('#nova-screen').classList.remove('d-none');
  $('#nova-title').textContent = cfg.title;
  $('#nova-status').textContent = 'Esperando operación...';
  $('#nova-status').className = '';
  let markup = '';
  if (cfg.operation) markup += `<div class="operation-row"><label for="operation">Operación:</label><select id="operation" class="form-select form-select-sm d-inline-block"><option value="">Seleccione...</option>${cfg.operation.map(x=>`<option>${x}</option>`).join('')}</select></div>`;
  markup += '<div class="field-grid">' + cfg.fields.map(([label, type]) => {
    const id = 'f' + label.replace(/[^a-z0-9]/gi, '');
    if (type.startsWith('select:')) return `<div><label for="${id}">${label}:</label><select class="form-select form-select-sm" id="${id}"><option value="">Seleccione...</option>${type.slice(7).split(',').map(x=>`<option>${x}</option>`).join('')}</select></div>`;
    return `<div><label for="${id}">${label}:</label><input class="form-control form-control-sm" id="${id}" type="${type}"></div>`
  }).join('') + '</div>';
  $('#nova-fields').innerHTML = markup;
  $('#nova-grid').classList.toggle('d-none', !cfg.products);
  if (cfg.products) renderGrid();
  $('#nova-buttons').innerHTML = cfg.buttons.map(b => `<button type="button" class="btn ${b==='ENVIAR'||b.startsWith('REGISTRAR')?'btn-primary':'btn-secondary'}" data-action="${b}">${b}</button>`).join('');
  $('#nova-buttons').querySelectorAll('button').forEach(b => b.onclick = () => action(b.dataset.action))
}

function renderGrid() {
  const purchase = current === 'COMPRAS';
  const code = purchase ? 'Código de producto' : 'Número de producto',
    qty = purchase ? 'Cantidad' : 'Cantidad';
  $('#nova-grid').innerHTML = `<strong>${purchase?'PRODUCTOS':'PRODUCTOS'}</strong><div class="product-entry"><div><label for="product-code">${code}:</label><input class="form-control form-control-sm" id="product-code"></div><div><label for="product-qty">${qty}:</label><input class="form-control form-control-sm" id="product-qty" type="number" min="1"></div><button type="button" class="btn btn-light btn-sm" id="add-product">${purchase?'AGREGAR':'AGREGAR PRODUCTO'}</button></div><table class="grid-table"><thead><tr><th>${code}</th><th>${qty}</th><th></th></tr></thead><tbody id="product-rows"></tbody></table><button type="button" class="btn btn-light btn-sm" id="remove-product">QUITAR SELECCIONADO</button>`;
  $('#add-product').onclick = () => {
    const code = $('#product-code').value.trim(),
      qty = $('#product-qty').value;
    if (!code || !qty || Number(qty) < 1) {
      status('Complete el código y una cantidad válida.', 'error');
      return
    }
    rows.push({
      code,
      qty
    });
    $('#product-code').value = '';
    $('#product-qty').value = '';
    renderRows()
  };
  $('#remove-product').onclick = () => {
    const selected = $('#product-rows input:checked');
    if (!selected) {
      status('Seleccione un producto para quitar.', 'error');
      return
    }
    rows.splice(Number(selected.dataset.i), 1);
    renderRows()
  };
  renderRows()
}

function renderRows() {
  const tbody = $('#product-rows');
  if (!tbody) return;
  tbody.innerHTML = rows.map((r, i) => `<tr><td>${escapeText(r.code)}</td><td>${escapeText(r.qty)}</td><td><input type="radio" name="row" data-i="${i}" aria-label="Seleccionar"></td></tr>`).join('') || '<tr><td colspan="3" class="table-empty">Sin productos agregados</td></tr>'
}

function action(name) {
  if (name === 'VOLVER') {
    $('#nova-screen').classList.add('d-none');
    return
  }
  if (name === 'LIMPIAR') {
    const form = $('#nova-form');
    form.reset();
    rows = [];
    if (forms[current].products) renderRows();
    status('Esperando operación...');
    return
  }
  if (name === 'ENVIAR' || name.startsWith('REGISTRAR')) {
    const op = $('#operation');
    if (op && !op.value) {
      status('Seleccione una operación.', 'error');
      return
    }
    if (forms[current].products && !rows.length) {
      status('Agregue al menos un producto.', 'error');
      return
    }
    status('Interfaz de demostración: no hay conexión con el servidor original.', 'ok')
  }
}

function status(text, kind = '') {
  const el = $('#nova-status');
  el.textContent = text;
  el.className = kind === 'ok' ? 'status-ok' : kind === 'error' ? 'status-error' : ''
}

function escapeText(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } [c]))
}
document.querySelectorAll('#nova-nav button').forEach(b => b.onclick = () => openScreen(b.dataset.view));