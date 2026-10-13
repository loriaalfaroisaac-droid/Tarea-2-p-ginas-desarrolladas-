const columns = {
  propiedades: ['iden_propiedad', 'titulo', 'ubicacion', 'precio', 'disponible'],
  clientes: ['cedula', 'nombre', 'correo', 'telefono', 'nacionalidad', 'tipo'],
  reservas: ['iden_reserva', 'cedula_usuario', 'iden_propiedad', 'fecha_entrada', 'fecha_salida']
};
let data = {
    propiedades: [],
    clientes: [],
    reservas: []
  },
  view = 'propiedades',
  selectedIndex = null;
const $ = s => document.querySelector(s),
  modal = bootstrap.Modal.getOrCreateInstance($('#entry-modal'));

function render() {
  $('#view-title').textContent = {
    propiedades: 'Propiedades',
    clientes: 'Clientes',
    reservas: 'Reservas',
    graficos: 'Gráficos'
  } [view];
  const actions = {
    propiedades: [
      ['Agregar Propiedad', 'add'],
      ['Modificar Seleccionada', 'edit'],
      ['Eliminar Seleccionada', 'delete']
    ],
    clientes: [
      ['Agregar Cliente', 'add'],
      ['Modificar Seleccionado', 'edit'],
      ['Eliminar Seleccionado', 'delete']
    ],
    reservas: [
      ['Crear Reserva', 'add'],
      ['Cancelar Reserva Seleccionada', 'delete']
    ]
  };
  $('#actions').innerHTML = (actions[view] || []).map(([label, action]) => `<button class="btn btn-light btn-sm" data-action="${action}">${label}</button>`).join('');
  $('#actions').querySelectorAll('[data-action]').forEach(button => button.onclick = () => runAction(button.dataset.action));
  const graph = view === 'graficos';
  $('#graph-area').classList.toggle('d-none', !graph);
  $('.table-wrap').classList.toggle('d-none', graph);
  if (graph) {
    drawGraph();
    return
  }
  const cols = columns[view];
  $('#headers').innerHTML = cols.map(col => `<th>${col}</th>`).join('');
  $('#rows').innerHTML = data[view].map((row, index) => `<tr data-index="${index}" class="${selectedIndex===index?'selected-row':''}">${cols.map(col=>`<td>${escapeText(String(row[col]??''))}</td>`).join('')}</tr>`).join('');
  $('#rows').querySelectorAll('tr').forEach(row => row.onclick = () => {
    selectedIndex = Number(row.dataset.index);
    render()
  });
}

function runAction(action) {
  if (action === 'add') {
    openForm(view);
    return
  }
  if (action === 'edit') {
    if (!getSelected()) return;
    alert(`Funcionalidad modificar ${view==='clientes'?'cliente':'propiedad'}: Pendiente por falta de tiempo.`);
    return;
  }
  if (action === 'delete') {
    const row = getSelected();
    if (!row) return;
    const id = view === 'clientes' ? row.cedula : view === 'reservas' ? row.iden_reserva : row.iden_propiedad;
    const prompt = view === 'reservas' ? `Cancelar reserva ${id}?` : `Eliminar ${view==='clientes'?'cliente':'propiedad'} ${id}?`;
    if (confirm(prompt)) {
      data[view].splice(selectedIndex, 1);
      selectedIndex = null;
      render()
    }
  }
}

function getSelected() {
  if (selectedIndex === null || !data[view][selectedIndex]) {
    alert('Seleccione un elemento primero.');
    return null
  }
  return data[view][selectedIndex]
}

function openForm(type) {
  const specs = {
    propiedades: {
      title: 'Agregar Propiedad',
      fields: [
        ['iden_propiedad', 'ID'],
        ['titulo', 'Título'],
        ['ubicacion', 'Ubicación'],
        ['precio', 'Precio'],
        ['disponible', 'Disponible (1/0)']
      ]
    },
    clientes: {
      title: 'Agregar Cliente',
      fields: [
        ['cedula', 'Cédula'],
        ['nombre', 'Nombre'],
        ['correo', 'Correo'],
        ['telefono', 'Teléfono'],
        ['nacionalidad', 'Nacionalidad'],
        ['tipo', 'Tipo (1 Usuario / 2 Propietario)']
      ]
    },
    reservas: {
      title: 'Crear Reserva',
      fields: [
        ['iden_reserva', 'ID Reserva'],
        ['cedula_usuario', 'Cédula Usuario'],
        ['iden_propiedad', 'ID Propiedad'],
        ['fecha_entrada', 'Fecha Entrada'],
        ['fecha_salida', 'Fecha Salida']
      ]
    }
  } [type];
  $('#modal-title').textContent = specs.title;
  $('#entry-form').innerHTML = specs.fields.map(([name, label]) => `<div class="mb-2"><label class="form-label small" for="field-${name}">${label}:</label><input class="form-control form-control-sm" id="field-${name}" name="${name}" ${name.startsWith('fecha_')?'placeholder="AAAA-MM-DD"':''}></div>`).join('') + '<button class="btn btn-primary btn-sm mt-2">Guardar</button>';
  $('#entry-form').onsubmit = event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (type === 'propiedades') values.disponible = values.disponible.trim() === '0' ? '0' : '1';
    if (type === 'clientes') values.tipo = values.tipo.trim() === '1' ? 'Usuario' : 'Propietario';
    data[type].push(values);
    selectedIndex = null;
    modal.hide();
    render()
  };
  modal.show();
}

function drawGraph() {
  const counts = {};
  data.propiedades.forEach(property => {
    const location = property.ubicacion || 'Desconocida';
    counts[location] = (counts[location] || 0) + 1
  });
  $('#graph-area').innerHTML = '<b>Gráfico: propiedades por ubicación</b>' + Object.entries(counts).map(([location, count]) => `<div class="bar-row"><span>${escapeText(location)}</span><div class="bar" style="width:${Math.min(100,count*35)}%"></div>${count}</div>`).join('')
}

function escapeText(value) {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } [char]))
}
document.querySelectorAll('#air-nav .nav-link').forEach(button => button.onclick = () => {
  document.querySelector('#air-nav .active').classList.remove('active');
  button.classList.add('active');
  view = button.dataset.view;
  selectedIndex = null;
  render()
});
$('#load-sample').onclick = () => {
  alert('Carga inicial en segundo plano iniciada (si no hay propiedades, se cargará una de ejemplo).');
  setTimeout(() => {
    if (!data.propiedades.length) data.propiedades.push({
      iden_propiedad: 'P1',
      titulo: 'Casa Mar',
      ubicacion: 'Puntarenas',
      precio: '50',
      disponible: '1'
    });
    if (view === 'propiedades') render()
  }, 2000)
};
render();