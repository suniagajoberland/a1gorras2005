// Layout compartido A1 GORRAS 2005 C.A
// Inyecta header, footer, carrito, modal de resenas y toasts en cada pagina.
(function () {
    var page = (document.body && document.body.getAttribute('data-page')) || 'index';

    var NAV = [
        { id: 'index', label: 'Catálogo', href: 'index.html' },
        { id: 'servicios', label: 'Servicios', href: 'servicios.html' },
        { id: 'nosotros', label: 'Nosotros', href: 'nosotros.html' },
        { id: 'ubicacion', label: 'Ubicación', href: 'ubicacion.html' },
        { id: 'preguntas', label: 'Preguntas', href: 'preguntas.html' },
        { id: 'resenas', label: 'Reseñas', href: 'resenas.html' }
    ];

    var navLinks = NAV.map(function (n) {
        var active = n.id === page;
        var cls = active ? 'text-[#8B7CC7] font-semibold' : 'hover:text-[#8B7CC7] transition';
        var aria = active ? ' aria-current="page"' : '';
        return '<a href="' + n.href + '" class="' + cls + '"' + aria + '>' + n.label + '</a>';
    }).join('');

    var headerHtml =
        '<!-- TOP INFO BAR -->' +
        '<div class="bg-[#2A1E4D]/90 border-b border-[#3A3A52] text-xs sm:text-sm py-2 px-3 sm:px-6">' +
        '  <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">' +
        '    <div class="flex items-center gap-2">' +
        '      <span class="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#8B7CC7] animate-pulse"></span>' +
        '      <span class="text-[#C9C2E3] font-medium">Precios expresados en <strong class="text-[#8B7CC7]">Dólares ($) a tasa BCV</strong> del día de pago</span>' +
        '    </div>' +
        '    <div class="hidden md:flex items-center gap-4 text-[#C9C2E3]/80 text-xs">' +
        '      <span><i class="fa-solid fa-truck-fast text-[#8B7CC7] mr-1"></i> Envíos Nacionales MRW / Zoom</span>' +
        '      <span><i class="fa-solid fa-tags text-[#8B7CC7] mr-1"></i> Detal • Mayor (6+) • Gran Mayor (12+)</span>' +
        '    </div>' +
        '  </div>' +
        '</div>' +
        '<!-- MAIN NAVBAR -->' +
        '<header class="bg-[#0E0B1D]/90 backdrop-blur-md border-b border-[#3A3A52]/80 sticky top-0 z-40">' +
        '  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">' +
        '    <a href="index.html" class="flex items-center gap-2 shrink-0" aria-label="A1 GORRAS 2005 C.A - Inicio">' +
        '      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5A3B8C] to-[#8B7CC7] flex items-center justify-center text-[#0E0B1D] font-bold shadow-lg shadow-[#5A3B8C]/40">' +
        '        <i class="fa-solid fa-hat-cowboy-side text-base"></i>' +
        '      </div>' +
        '      <span class="font-display text-base sm:text-lg font-bold tracking-wider text-white whitespace-nowrap">A1 GORRAS <span class="text-[#8B7CC7]">2005 C.A</span></span>' +
        '    </a>' +
        '    <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-[#C9C2E3]" aria-label="Navegación principal">' + navLinks + '</nav>' +
        '    <div class="flex items-center gap-2 sm:gap-3">' +
        '      <a href="https://www.instagram.com/gorrasaunoca/" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram" class="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-xl bg-[#2A1E4D] hover:bg-[#3A3A52] text-[#C9C2E3] hover:text-[#E1306C] border border-[#5A3B8C] transition text-base"><i class="fa-brands fa-instagram"></i></a>' +
        '      <a href="https://listado.mercadolibre.com.ve/pagina/a1gorras2005ca/" target="_blank" rel="noopener noreferrer" title="Tienda MercadoLibre" aria-label="MercadoLibre" class="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-xl bg-[#2A1E4D] hover:bg-[#3A3A52] text-[#C9C2E3] hover:text-[#FFE600] border border-[#5A3B8C] transition text-base"><i class="fa-solid fa-store"></i></a>' +
        '      <a href="https://wa.me/584226382165?text=Hola%20A1%20GORRAS%202005%20C.A,%20quisiera%20informaci%C3%B3n%20sobre%20sus%20gorras." target="_blank" rel="noopener noreferrer" class="hidden sm:inline-flex items-center gap-2 bg-[#2A1E4D] hover:bg-[#3A3A52] text-[#C9C2E3] border border-[#5A3B8C] px-3.5 py-2 rounded-xl text-xs font-semibold transition"><i class="fa-brands fa-whatsapp text-base text-[#25D366]"></i><span>Asesoría</span></a>' +
        '      <button onclick="toggleCart(true)" class="relative inline-flex items-center gap-2 bg-[#5A3B8C] hover:bg-[#8B7CC7] text-white hover:text-[#0E0B1D] font-bold px-3.5 sm:px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-[#5A3B8C]/40">' +
        '        <i class="fa-solid fa-bag-shopping"></i><span class="hidden sm:inline">Carrito</span>' +
        '        <span id="cart-badge" class="bg-[#0E0B1D] text-[#C9C2E3] text-xs font-extrabold px-2 py-0.5 rounded-full border border-[#8B7CC7]/40">0</span>' +
        '      </button>' +
        '    </div>' +
        '  </div>' +
        '</header>';

    var footerHtml =
        '<footer class="bg-[#0E0B1D] border-t border-[#3A3A52] pt-12 pb-8 px-4 sm:px-6 text-sm text-[#C9C2E3]/80">' +
        '  <div class="max-w-7xl mx-auto">' +
        '    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#3A3A52]">' +
        '      <div>' +
        '        <div class="flex items-center gap-2 mb-3">' +
        '          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5A3B8C] to-[#8B7CC7] flex items-center justify-center text-[#0E0B1D] font-bold"><i class="fa-solid fa-hat-cowboy-side"></i></div>' +
        '          <span class="font-display text-base font-bold text-white tracking-wider whitespace-nowrap">A1 GORRAS <span class="text-[#8B7CC7]">2005 C.A</span></span>' +
        '        </div>' +
        '        <p class="text-xs leading-relaxed">Tienda venezolana de gorras, viseras, sombreros y pasamontañas al detal, al mayor y gran mayor. Bordado 3D, sublimación y personalización desde 2005.</p>' +
        '        <div class="flex items-center gap-4 text-lg mt-4">' +
        '          <a href="https://wa.me/584226382165" target="_blank" rel="noopener noreferrer" class="hover:text-[#25D366] transition" aria-label="WhatsApp A1 Gorras" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>' +
        '          <a href="https://www.instagram.com/gorrasaunoca/" target="_blank" rel="noopener noreferrer" class="hover:text-[#E1306C] transition" aria-label="Instagram A1 Gorras" title="Instagram"><i class="fa-brands fa-instagram"></i></a>' +
        '          <a href="https://listado.mercadolibre.com.ve/pagina/a1gorras2005ca/" target="_blank" rel="noopener noreferrer" class="hover:text-[#FFE600] transition" aria-label="Tienda MercadoLibre A1 Gorras" title="MercadoLibre"><i class="fa-solid fa-store"></i></a>' +
        '          <button onclick="openReviewModal()" class="hover:text-white transition" aria-label="Reseñas de Google" title="Reseñas Google"><i class="fa-brands fa-google"></i></button>' +
        '        </div>' +
        '      </div>' +
        '      <div>' +
        '        <h3 class="font-display text-sm font-bold text-white uppercase tracking-wider mb-3">Catálogo</h3>' +
        '        <ul class="space-y-2 text-xs">' +
        '          <li><a href="index.html" class="hover:text-[#8B7CC7] transition">Gorras al mayor y detal</a></li>' +
        '          <li><a href="servicios.html" class="hover:text-[#8B7CC7] transition">Bordado y sublimación</a></li>' +
        '          <li><a href="index.html" class="hover:text-[#8B7CC7] transition">Viseras y sombreros</a></li>' +
        '          <li><a href="index.html" class="hover:text-[#8B7CC7] transition">Pasamontañas</a></li>' +
        '        </ul>' +
        '      </div>' +
        '      <div>' +
        '        <h3 class="font-display text-sm font-bold text-white uppercase tracking-wider mb-3">Información</h3>' +
        '        <ul class="space-y-2 text-xs">' +
        '          <li><a href="nosotros.html" class="hover:text-[#8B7CC7] transition">Quiénes somos</a></li>' +
        '          <li><a href="servicios.html#envios" class="hover:text-[#8B7CC7] transition">Envíos y entregas</a></li>' +
        '          <li><a href="preguntas.html" class="hover:text-[#8B7CC7] transition">Preguntas frecuentes</a></li>' +
        '          <li><a href="resenas.html" class="hover:text-[#8B7CC7] transition">Reseñas de clientes</a></li>' +
        '        </ul>' +
        '      </div>' +
        '      <div>' +
        '        <h3 class="font-display text-sm font-bold text-white uppercase tracking-wider mb-3">Contacto</h3>' +
        '        <address class="not-italic text-xs space-y-2">' +
        '          <p><i class="fa-solid fa-location-dot text-[#8B7CC7] mr-1.5"></i>Esquina de Cují con Punceres, Edificio 8, Piso 1, frente a Almacenes Me Salve, Centro de Caracas, Distrito Capital, Venezuela.</p>' +
        '          <p><i class="fa-solid fa-phone text-[#8B7CC7] mr-1.5"></i><a href="https://wa.me/584226382165" target="_blank" rel="noopener noreferrer" class="hover:text-[#8B7CC7] transition">+58 422-6382165</a></p>' +
        '          <p><i class="fa-solid fa-clock text-[#8B7CC7] mr-1.5"></i>Lun-Vie 8:00 a.m. - 5:00 p.m. / Sáb 8:00 a.m. - 1:00 p.m.</p>' +
        '        </address>' +
        '      </div>' +
        '    </div>' +
        '    <div class="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-center">' +
        '      <p class="text-xs">© <span id="footer-year">2026</span> A1 GORRAS 2005 C.A — Caracas, Venezuela. Todos los derechos reservados.</p>' +
        '      <p class="text-[11px] text-[#C9C2E3]/60">Gorras al mayor, detal, bordado 3D, sublimación y personalización • Envíos nacionales • Montos en dólares ($) a tasa BCV del día de pago.</p>' +
        '    </div>' +
        '  </div>' +
        '</footer>';

    var cartHtml =
        '<div id="cart-drawer" class="fixed inset-0 z-50 hidden">' +
        '  <div onclick="toggleCart(false)" class="fixed inset-0 bg-[#0E0B1D]/80 backdrop-blur-sm transition-opacity"></div>' +
        '  <div class="fixed inset-y-0 right-0 max-w-full w-full sm:w-[460px] bg-[#0E0B1D] border-l border-[#3A3A52] shadow-2xl flex flex-col z-10">' +
        '    <div class="p-5 border-b border-[#3A3A52] flex items-center justify-between bg-[#2A1E4D]">' +
        '      <div class="flex items-center gap-2.5">' +
        '        <i class="fa-solid fa-bag-shopping text-[#8B7CC7] text-xl"></i>' +
        '        <div>' +
        '          <h3 class="font-display text-lg font-bold text-white uppercase tracking-wide">Tu Pedido</h3>' +
        '          <p class="text-xs text-[#C9C2E3]">Montos en <strong class="text-[#8B7CC7]">Dólares ($) a tasa BCV</strong> del día</p>' +
        '        </div>' +
        '      </div>' +
        '      <button onclick="toggleCart(false)" class="w-9 h-9 rounded-xl bg-[#0E0B1D]/70 hover:bg-[#3A3A52] text-[#C9C2E3] hover:text-white flex items-center justify-center transition border border-[#3A3A52]"><i class="fa-solid fa-xmark text-lg"></i></button>' +
        '    </div>' +
        '    <div id="cart-tier-banner" class="px-5 py-3 bg-[#2A1E4D]/50 border-b border-[#3A3A52] text-xs"></div>' +
        '    <div class="flex-1 overflow-y-auto p-5 space-y-6">' +
        '      <div id="cart-items-container" class="space-y-3"></div>' +
        '      <form id="checkout-form" onsubmit="sendOrderToWhatsApp(event)" class="hidden space-y-4 pt-4 border-t border-[#3A3A52]">' +
        '        <h4 class="font-display text-sm font-bold text-[#8B7CC7] uppercase tracking-wider">Datos para procesar tu pedido</h4>' +
        '        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        '          <div><label class="block text-xs text-[#C9C2E3] mb-1">Nombre y Apellido *</label><input type="text" id="cust-name" required placeholder="Ej. Carlos Pérez" class="w-full bg-[#2A1E4D]/60 border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#C9C2E3]/40 focus:outline-none"></div>' +
        '          <div><label class="block text-xs text-[#C9C2E3] mb-1">Teléfono WhatsApp *</label><input type="tel" id="cust-phone" required placeholder="Ej. 0412-1234567" class="w-full bg-[#2A1E4D]/60 border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#C9C2E3]/40 focus:outline-none"></div>' +
        '        </div>' +
        '        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        '          <div><label class="block text-xs text-[#C9C2E3] mb-1">Método de Entrega *</label><select id="cust-delivery" required class="w-full bg-[#2A1E4D] border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"><option value="Delivery en Caracas">Delivery Caracas</option><option value="Envío Nacional MRW">Envío Nacional MRW</option><option value="Envío Nacional Zoom">Envío Nacional Zoom</option><option value="Retiro en Tienda">Retiro en Tienda</option></select></div>' +
        '          <div><label class="block text-xs text-[#C9C2E3] mb-1">Método de Pago *</label><select id="cust-payment" required class="w-full bg-[#2A1E4D] border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"><option value="Pago Móvil (Tasa BCV del día)">Pago Móvil (Tasa BCV del día)</option><option value="Efectivo Divisas ($)">Efectivo Divisas ($)</option><option value="Zelle">Zelle ($)</option><option value="Transferencia Bancaria (Tasa BCV)">Transferencia (Tasa BCV)</option></select></div>' +
        '        </div>' +
        '        <div><label class="block text-xs text-[#C9C2E3] mb-1">Ciudad / Dirección o Agencia (Opcional)</label><input type="text" id="cust-address" placeholder="Ej. Caracas, Chacao / Agencia MRW..." class="w-full bg-[#2A1E4D]/60 border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#C9C2E3]/40 focus:outline-none"></div>' +
        '        <div class="bg-[#2A1E4D]/80 border border-[#5A3B8C]/60 rounded-2xl p-4 space-y-2">' +
        '          <div class="flex justify-between text-xs text-[#C9C2E3]"><span>Cantidad total de gorras:</span><span id="summary-total-units" class="text-white font-bold">0 unds</span></div>' +
        '          <div class="flex justify-between text-xs text-[#C9C2E3]"><span>Escala de precio aplicada:</span><span id="summary-tier-badge" class="font-bold text-[#8B7CC7]">Al Detal</span></div>' +
        '          <div id="summary-savings-row" class="hidden flex justify-between text-xs text-[#8B7CC7]"><span>Ahorro por compra al mayor:</span><span id="summary-savings" class="font-bold">-$0.00</span></div>' +
        '          <div class="border-t border-[#3A3A52] pt-2.5 flex justify-between items-center">' +
        '            <div><span class="block text-sm font-semibold text-white">Total a Pagar:</span><span class="block text-[11px] text-[#8B7CC7] font-medium">Monto en $ a tasa BCV del día</span></div>' +
        '            <span id="summary-total-usd" class="text-2xl font-extrabold text-white">$0.00</span>' +
        '          </div>' +
        '        </div>' +
        '        <button type="submit" class="w-full bg-[#25D366] hover:bg-[#128C7E] text-[#0E0B1D] font-extrabold py-3.5 px-5 rounded-xl text-sm sm:text-base transition shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2.5"><i class="fa-brands fa-whatsapp text-xl"></i><span>Enviar Pedido por WhatsApp</span></button>' +
        '      </form>' +
        '    </div>' +
        '  </div>' +
        '</div>';

    var modalHtml =
        '<div id="review-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4">' +
        '  <div onclick="closeReviewModal()" class="fixed inset-0 bg-[#0E0B1D]/85 backdrop-blur-sm"></div>' +
        '  <div class="relative z-10 bg-[#2A1E4D] border border-[#5A3B8C] rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-[#5A3B8C]/40 space-y-5">' +
        '    <div class="flex items-center justify-between">' +
        '      <div class="flex items-center gap-2.5"><i class="fa-brands fa-google text-[#8B7CC7] text-xl"></i><h3 class="font-display text-xl font-bold text-white uppercase">Reseña en Google</h3></div>' +
        '      <button onclick="closeReviewModal()" class="text-[#C9C2E3] hover:text-white p-1"><i class="fa-solid fa-xmark text-lg"></i></button>' +
        '    </div>' +
        '    <p class="text-xs text-[#C9C2E3]">Tu opinión nos ayuda a seguir trayendo las mejores gorras a Venezuela. Califica tu experiencia o abre nuestro perfil oficial en Google Maps.</p>' +
        '    <form id="google-review-form" onsubmit="submitGoogleReview(event)" class="space-y-4">' +
        '      <div><label class="block text-xs text-[#C9C2E3] mb-1.5">Tu Calificación</label><div class="flex gap-2 text-2xl text-[#8B7CC7]" id="star-selector">' +
        '        <button type="button" onclick="setReviewStars(1)" class="star-btn hover:scale-110 transition"><i class="fa-solid fa-star"></i></button>' +
        '        <button type="button" onclick="setReviewStars(2)" class="star-btn hover:scale-110 transition"><i class="fa-solid fa-star"></i></button>' +
        '        <button type="button" onclick="setReviewStars(3)" class="star-btn hover:scale-110 transition"><i class="fa-solid fa-star"></i></button>' +
        '        <button type="button" onclick="setReviewStars(4)" class="star-btn hover:scale-110 transition"><i class="fa-solid fa-star"></i></button>' +
        '        <button type="button" onclick="setReviewStars(5)" class="star-btn hover:scale-110 transition"><i class="fa-solid fa-star"></i></button>' +
        '      </div></div>' +
        '      <div><label class="block text-xs text-[#C9C2E3] mb-1">Tu Nombre *</label><input type="text" id="rev-name" required placeholder="Ej. Andrea Gómez" class="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#C9C2E3]/40 focus:border-[#8B7CC7] focus:outline-none"></div>' +
        '      <div><label class="block text-xs text-[#C9C2E3] mb-1">Tu Comentario *</label><textarea id="rev-comment" rows="3" required placeholder="Excelente calidad en las gorras al mayor y entrega súper rápida..." class="w-full bg-[#0E0B1D] border border-[#3A3A52] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#C9C2E3]/40 focus:border-[#8B7CC7] focus:outline-none"></textarea></div>' +
        '      <div class="flex flex-col sm:flex-row gap-2.5 pt-1">' +
        '        <button type="submit" class="flex-1 bg-[#5A3B8C] hover:bg-[#8B7CC7] text-white hover:text-[#0E0B1D] font-bold py-2.5 px-4 rounded-xl text-sm transition">Publicar Reseña</button>' +
        '        <a href="https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4" target="_blank" rel="noopener noreferrer" class="flex-1 bg-[#C9C2E3] hover:bg-white text-[#0E0B1D] font-bold py-2.5 px-4 rounded-xl text-sm transition text-center flex items-center justify-center gap-1.5"><i class="fa-solid fa-arrow-up-right-from-square text-xs"></i><span>Ir a Google Maps</span></a>' +
        '      </div>' +
        '    </form>' +
        '  </div>' +
        '</div>';

    var toastHtml = '<div id="toast-container" class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col gap-2 w-[92%] max-w-md"></div>';

    var headerMount = document.getElementById('site-header');
    if (headerMount) headerMount.innerHTML = headerHtml;
    var footerMount = document.getElementById('site-footer');
    if (footerMount) footerMount.innerHTML = footerHtml;

    document.body.insertAdjacentHTML('beforeend', cartHtml + modalHtml + toastHtml);
})();
