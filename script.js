const toggle = document.getElementById('contact-toggle');
const options = document.getElementById('contact-options');
toggle.addEventListener('click', () => {
    const opening = options.classList.contains('d-none');
    options.classList.toggle('d-none');
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.innerHTML = opening ? 'Ocultar opciones <span>−</span>' : 'Mostrar opciones <span>＋</span>'
});
document.getElementById('year').textContent = new Date().getFullYear();