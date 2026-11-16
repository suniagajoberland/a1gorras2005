// Logica de la aplicacion A1 GORRAS 2005 C.A

const WHATSAPP_NUMBER = "584226382165";

let currentPage = 1;

        // 2. MAP REAL CATALOG -> INTERNAL STRUCTURE
        const products = productsData.map((p) => {
            const detal = Number(p.priceDetal) || 0;
            const mayor = Number(p.priceMayor) || Math.round(detal * 0.7 * 100) / 100;
            const granMayor = Math.round(mayor * 0.88 * 100) / 100;
            const colors = (p.colors && p.colors.length)
                ? p.colors.map((c) => ({ name: c.name || "Color", hex: c.hex || "#888888", image: c.image || "" }))
                : [{ name: "Estándar", hex: "#888888", image: "" }];
            return {
                id: p.id,
                name: p.title,
                category: p.category || "Gorras",
                prices: { detal, mayor, granMayor },
                colors,
            };
        });

        let currentFilter = "all";
        let selectedReviewStars = 5;
        let cart = [];

        const itemsPerPage = 20;
        let filteredProducts = [...products];

        const selectedColorState = {};
        const cardQtyState = {};
        products.forEach((p) => {
            selectedColorState[p.id] = 0;
            cardQtyState[p.id] = 1;
        });

        const CUSTOM_TYPES = [
            "Bordado 3D Relieve",
            "Bordado Plano Tradicional",
            "Sublimación Digital",
            "Parche de Cuero Grabado",
            "Gorra Lisa (Sin Personalizar)",
        ];
        const CUSTOM_POSITIONS = ["Frente Central", "Lado Izquierdo", "Lado Derecho", "Atrás (Sobre Cierre)"];

        // Initial Google Reviews
        let googleReviews = [
            {
                name: "Luis Alejandro Méndez",
                rating: 5,
                date: "Hace 3 días",
                comment: "Compré 12 gorras variadas para mi emprendimiento y me aplicaron el precio Gran Mayor de una vez. La calidad de las gorras es brutal, llegaron por MRW a Valencia al día siguiente."
            },
            {
                name: "Mariana Valentina Rojas",
                rating: 5,
                date: "Hace 1 semana",
                comment: "Súper práctico poder elegir los colores y ver el precio al detal, mayor y gran mayor en dólares a tasa BCV. Pedí 6 gorras bordadas para mi equipo de trabajo y el delivery en Caracas fue puntual."
            },
            {
                name: "José Gregorio Paredes",
                rating: 5,
                date: "Hace 2 semanas",
                comment: "Las mejores gorras calidad/precio del país. El bordado 3D quedó espectacular y los colores son tal cual se ven en la página. 100% recomendados."
            }
        ];

        // 3. HELPERS
        function formatUSD(amount) {
            return '$' + amount.toFixed(2);
        }

        // Dynamic accent helpers (per-card color theme)
        function hexToRgb(hex) {
            let h = String(hex || "").replace('#', '').trim();
            if (h.length === 3) h = h.split('').map((c) => c + c).join('');
            if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) h = '8B7CC7';
            const n = parseInt(h, 16);
            return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
        }

        function rgba(hex, a) {
            const { r, g, b } = hexToRgb(hex);
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        function isLight(hex) {
            const { r, g, b } = hexToRgb(hex);
            const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return l > 0.6;
        }

        function accentVars(hex) {
            const color = hex || '#8B7CC7';
            const contrast = isLight(color) ? '#0E0B1D' : '#FFFFFF';
            return `--accent:${color};--accent-contrast:${contrast};--accent-soft:${rgba(color, 0.18)};--accent-mid:${rgba(color, 0.55)};--accent-strong:${rgba(color, 0.85)};`;
        }

        function escapeHtml(str) {
            return String(str == null ? "" : str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function escapeAttr(str) {
            return escapeHtml(str).replace(/\n/g, " ");
        }

        function getCartTier(totalUnits) {
            if (totalUnits >= 12) {
                return { key: 'granMayor', label: 'Gran Mayor (12+)', badgeClass: 'text-[#0E0B1D] bg-[#8B7CC7] border-[#8B7CC7]' };
            } else if (totalUnits >= 6) {
                return { key: 'mayor', label: 'Al Mayor (6-11)', badgeClass: 'text-white bg-[#5A3B8C] border-[#8B7CC7]/50' };
            } else {
                return { key: 'detal', label: 'Al Detal (1-5)', badgeClass: 'text-[#C9C2E3] bg-[#2A1E4D] border-[#3A3A52]' };
            }
        }

        function imageWithFallback(url) {
            return url || "https://placehold.co/400x400/2A1E4D/C9C2E3?text=A1+GORRAS";
        }

        // 4. CATEGORY FILTERS
        function renderFilters() {
            const container = document.getElementById('category-filters');
            if (!container) return;
            const counts = {};
            products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
            const cats = Object.keys(counts).sort();

            const build = (filter, label, count) => {
                const active = filter === currentFilter;
                const cls = active
                    ? 'filter-btn active bg-[#5A3B8C] text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-[#5A3B8C]/30'
                    : 'filter-btn bg-[#2A1E4D] text-[#C9C2E3] hover:text-white border border-[#3A3A52] font-semibold px-4 py-2 rounded-xl text-xs transition';
                return `<button onclick="filterProducts('${filter}')" data-filter="${filter}" class="${cls}">${label} (${count})</button>`;
            };

            let html = build('all', 'Todas', products.length);
            cats.forEach((c) => { html += build(c, c, counts[c]); });
            container.innerHTML = html;
        }

        function filterProducts(category) {
            currentFilter = category;
            filteredProducts = category === 'all'
                ? [...products]
                : products.filter((p) => p.category === category);
            currentPage = 1;
            renderFilters();
            renderProducts();
        }

        // 5. RENDER CATALOG CARDS
        function renderProducts() {
            const grid = document.getElementById('products-grid');
            if (!grid) return;
            const start = (currentPage - 1) * itemsPerPage;
            const paginated = filteredProducts.slice(start, start + itemsPerPage);

            if (paginated.length === 0) {
                grid.innerHTML = `<div class="col-span-full text-center py-16 text-[#C9C2E3]/70">No se encontraron productos.</div>`;
                document.getElementById('pagination').innerHTML = '';
                return;
            }

            grid.innerHTML = paginated.map((product) => {
                const colorIdx = selectedColorState[product.id] || 0;
                const activeColor = product.colors[colorIdx];
                const qtyVal = cardQtyState[product.id] || 1;

                const swatches = product.colors.map((c, idx) => `
                    <button
                        type="button"
                        onclick="selectProductColor('${product.id}', ${idx})"
                        title="${escapeAttr(c.name)}"
                        aria-label="Color ${escapeAttr(c.name)}"
                        class="swatch-btn-${product.id} w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none ${idx === colorIdx ? 'border-[#8B7CC7] scale-110 ring-2 ring-[#8B7CC7]/50' : 'border-[#3A3A52]'}"
                        style="background-color:${c.hex};"></button>
                `).join('');

                const typeOptions = CUSTOM_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('');
                const posOptions = CUSTOM_POSITIONS.map((t) => `<option value="${t}">${t}</option>`).join('');

                return `
                <div id="card-${product.id}" class="flip-card perspective-1000 min-h-[600px]" style="${accentVars(activeColor.hex)}">
                    <div class="flip-card-inner">

                        <!-- FRONT -->
                        <div class="flip-card-front bg-[#2A1E4D]/75 border acc-card-front p-5 flex flex-col justify-between transition-colors">
                            <div class="flex items-center justify-between gap-2">
                                <span class="px-2.5 py-1 rounded-lg border acc-badge text-[11px] font-bold uppercase tracking-wider">
                                    ${escapeHtml(product.category)}
                                </span>
                                <button onclick="toggleCardFlip('${product.id}')" class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9C2E3] hover:text-white bg-[#0E0B1D]/70 hover:bg-[#5A3B8C] border border-[#3A3A52] px-3 py-1.5 rounded-xl transition">
                                    <i class="fa-solid fa-sliders"></i>
                                    <span>Personalizar</span>
                                </button>
                            </div>

                            <div class="relative my-3 flex flex-col items-center justify-center">
                                <div class="w-full aspect-square flex items-center justify-center overflow-hidden">
                                    <img id="img-${product.id}" src="${imageWithFallback(activeColor.image)}" alt="${escapeAttr(product.name)} color ${escapeAttr(activeColor.name)} - Gorras A1 GORRAS 2005 C.A Caracas"
                                         referrerpolicy="no-referrer" loading="lazy" decoding="async"
                                         onerror="this.onerror=null;this.src='https://placehold.co/400x400/2A1E4D/C9C2E3?text=A1+GORRAS'"
                                         class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
                                </div>
                                <span id="color-label-${product.id}" class="mt-2 text-xs font-medium text-[#C9C2E3] bg-[#0E0B1D]/80 px-3 py-0.5 rounded-full border border-[#3A3A52]">
                                    Color: <strong class="text-white">${escapeHtml(activeColor.name)}</strong>
                                </span>
                            </div>

                            <div class="mb-3">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="text-[11px] uppercase tracking-wider text-[#C9C2E3]/80 font-semibold">Elige un color:</span>
                                    <span class="text-[11px] text-[#8B7CC7]">${product.colors.length} tonos</span>
                                </div>
                                <div class="flex items-center gap-2 flex-wrap max-h-24 overflow-y-auto swatch-scroll pr-1">
                                    ${swatches}
                                </div>
                            </div>

                            <h3 class="font-display text-base font-bold text-white uppercase tracking-wide mb-2 line-clamp-2" title="${escapeAttr(product.name)}">
                                ${escapeHtml(product.name)}
                            </h3>

                            <div class="mb-3">
                                <div class="grid grid-cols-3 gap-1.5 bg-[#0E0B1D]/90 border border-[#3A3A52] rounded-xl p-2 text-center">
                                    <div class="p-1.5 rounded-lg bg-[#2A1E4D]/50">
                                        <div class="text-[10px] text-[#C9C2E3]/80 font-semibold uppercase">Detal (1-5)</div>
                                        <div class="text-sm sm:text-base font-extrabold text-white mt-0.5">${formatUSD(product.prices.detal)}</div>
                                        <div class="text-[9px] text-[#C9C2E3]/70">a tasa BCV</div>
                                    </div>
                                    <div class="p-1.5 rounded-lg bg-[#5A3B8C]/35 border border-[#5A3B8C]">
                                        <div class="text-[10px] text-[#C9C2E3] font-bold uppercase">Mayor (6+)</div>
                                        <div class="text-sm sm:text-base font-extrabold text-[#C9C2E3] mt-0.5">${formatUSD(product.prices.mayor)}</div>
                                        <div class="text-[9px] text-[#8B7CC7]">a tasa BCV</div>
                                    </div>
                                    <div class="p-1.5 rounded-lg bg-[#8B7CC7]/20 border border-[#8B7CC7]/60">
                                        <div class="text-[10px] text-[#8B7CC7] font-bold uppercase">G.Mayor (12+)</div>
                                        <div class="text-sm sm:text-base font-extrabold text-white mt-0.5">${formatUSD(product.prices.granMayor)}</div>
                                        <div class="text-[9px] text-[#C9C2E3]">a tasa BCV</div>
                                    </div>
                                </div>
                                <p class="text-[10px] text-center text-[#C9C2E3]/85 mt-1.5">
                                    <i class="fa-solid fa-circle-info text-[#8B7CC7] mr-1"></i>Montos en Dólares ($) a la tasa BCV del día de pago
                                </p>
                            </div>

                            <div class="space-y-2">
                                <div class="flex items-center gap-2">
                                    <div class="inline-flex items-center bg-[#0E0B1D] border border-[#3A3A52] rounded-xl h-10 px-1 shrink-0">
                                        <button type="button" onclick="changeCardQty('${product.id}', -1)" class="w-7 h-8 flex items-center justify-center text-[#C9C2E3] hover:text-white font-bold">-</button>
                                        <input type="number" id="qty-input-${product.id}" min="1" value="${qtyVal}" onchange="setCardQty('${product.id}', this.value)"
                                               aria-label="Cantidad"
                                               class="w-10 text-center bg-transparent text-xs font-bold text-white focus:outline-none">
                                        <button type="button" onclick="changeCardQty('${product.id}', 1)" class="w-7 h-8 flex items-center justify-center text-[#C9C2E3] hover:text-white font-bold">+</button>
                                    </div>

                                    <button onclick="addToCart('${product.id}')" class="flex-1 h-10 acc-btn font-bold px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md">
                                        <i class="fa-solid fa-cart-plus"></i>
                                        <span>Agregar</span>
                                    </button>

                                    <a id="wa-btn-${product.id}" href="${buildDirectProductWALink(product, activeColor, qtyVal)}" target="_blank" rel="noopener noreferrer"
                                       title="Consultar este modelo por WhatsApp"
                                       class="h-10 bg-[#25D366] hover:bg-[#128C7E] text-[#0E0B1D] font-bold px-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-md shrink-0">
                                        <i class="fa-brands fa-whatsapp text-base"></i>
                                        <span class="hidden sm:inline">WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- BACK: PERSONALIZATION FORM -->
                        <div class="flip-card-back bg-[#2A1E4D] border acc-card-back p-5 flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between border-b border-[#3A3A52] pb-3 mb-3">
                                    <div class="min-w-0">
                                        <span class="text-[11px] text-[#8B7CC7] font-bold uppercase">Personaliza tu pedido</span>
                                        <h4 class="font-display text-base font-bold text-white uppercase truncate" title="${escapeAttr(product.name)}">${escapeHtml(product.name)}</h4>
                                    </div>
                                    <button onclick="toggleCardFlip('${product.id}')" class="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#5A3B8C] hover:bg-[#8B7CC7] hover:text-[#0E0B1D] px-3 py-1.5 rounded-xl transition shrink-0">
                                        <i class="fa-solid fa-rotate-left"></i>
                                        <span>Volver</span>
                                    </button>
                                </div>

                                <p class="text-xs text-[#C9C2E3] mb-3">
                                    Color seleccionado: <strong id="back-color-${product.id}" class="text-white">${escapeHtml(activeColor.name)}</strong>
                                </p>

                                <form id="pform-${product.id}" onsubmit="addCustomToCart(event, '${product.id}')" class="space-y-3">
                                    <div>
                                        <label class="block text-[11px] text-[#C9C2E3] mb-1">Tipo de Trabajo</label>
                                        <select id="ptype-${product.id}" class="w-full bg-[#0E0B1D] border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                                            ${typeOptions}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-[11px] text-[#C9C2E3] mb-1">Ubicación</label>
                                        <select id="ppos-${product.id}" class="w-full bg-[#0E0B1D] border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                                            ${posOptions}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-[11px] text-[#C9C2E3] mb-1">Texto / Arte</label>
                                        <input type="text" id="ptext-${product.id}" placeholder="Ej. Mi Logo / Iniciales"
                                               class="w-full bg-[#0E0B1D] border border-[#3A3A52] focus:border-[#8B7CC7] rounded-xl px-3 py-2 text-sm text-white placeholder-[#C9C2E3]/40 focus:outline-none">
                                    </div>
                                    <button type="submit" class="w-full acc-btn font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-cart-plus"></i>
                                        <span>Agregar Personalizado</span>
                                    </button>
                                </form>
                            </div>

                            <a id="wa-back-btn-${product.id}" href="${buildDirectProductWALink(product, activeColor, qtyVal)}" target="_blank" rel="noopener noreferrer"
                               class="mt-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-[#0E0B1D] font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2">
                                <i class="fa-brands fa-whatsapp text-base"></i>
                                <span>Pedir directo por WhatsApp</span>
                            </a>
                        </div>

                    </div>
                </div>`;
            }).join('');

            renderPagination();
        }

        function renderPagination() {
            const container = document.getElementById('pagination');
            if (!container) return;
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
            if (totalPages <= 1) { container.innerHTML = ''; return; }

            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                const active = i === currentPage;
                const cls = active
                    ? 'bg-[#5A3B8C] text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md shadow-[#5A3B8C]/30'
                    : 'bg-[#2A1E4D] text-[#C9C2E3] hover:text-white border border-[#3A3A52] font-semibold px-4 py-2 rounded-xl text-sm transition';
                html += `<button onclick="goToPage(${i})" class="${cls}">${i}</button>`;
            }
            container.innerHTML = html;
        }

        function goToPage(page) {
            currentPage = page;
            renderProducts();
            const section = document.getElementById('catalogo');
            if (section) window.scrollTo({ top: section.offsetTop - 90, behavior: 'smooth' });
        }

        // 6. DIRECT WHATSAPP LINK
        function buildDirectProductWALink(product, colorObj, qty = 1) {
            const msg = `Hola *A1 GORRAS 2005 C.A* 👋, me interesa el modelo *${product.name}* en color *${colorObj.name}* (Cantidad: ${qty} unds).\n\n` +
                        `• Detal (1-5): ${formatUSD(product.prices.detal)} (en $ a tasa BCV)\n` +
                        `• Mayor (6+): ${formatUSD(product.prices.mayor)} (en $ a tasa BCV)\n` +
                        `• Gran Mayor (12+): ${formatUSD(product.prices.granMayor)} (en $ a tasa BCV)\n\n` +
                        `¿Tienen disponibilidad inmediata?`;
            return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
        }

        // 7. INTERACTIVE CARD ACTIONS
        function toggleCardFlip(productId) {
            const card = document.getElementById(`card-${productId}`);
            if (card) card.classList.toggle('is-flipped');
        }

        function changeCardQty(productId, delta) {
            const current = cardQtyState[productId] || 1;
            const next = Math.max(1, current + delta);
            cardQtyState[productId] = next;
            const input = document.getElementById(`qty-input-${productId}`);
            if (input) input.value = next;
            updateCardWALink(productId);
        }

        function setCardQty(productId, val) {
            const parsed = parseInt(val, 10);
            const next = isNaN(parsed) || parsed < 1 ? 1 : parsed;
            cardQtyState[productId] = next;
            const input = document.getElementById(`qty-input-${productId}`);
            if (input) input.value = next;
            updateCardWALink(productId);
        }

        function updateCardWALink(productId) {
            const product = products.find((p) => p.id === productId);
            if (!product) return;
            const colorIdx = selectedColorState[productId] || 0;
            const colorObj = product.colors[colorIdx];
            const qty = cardQtyState[productId] || 1;
            const link = buildDirectProductWALink(product, colorObj, qty);
            const waBtn = document.getElementById(`wa-btn-${productId}`);
            if (waBtn) waBtn.href = link;
            const waBack = document.getElementById(`wa-back-btn-${productId}`);
            if (waBack) waBack.href = link;
        }

        function selectProductColor(productId, colorIndex) {
            selectedColorState[productId] = colorIndex;
            const product = products.find((p) => p.id === productId);
            const colorObj = product.colors[colorIndex];

            const card = document.getElementById(`card-${productId}`);
            if (card) card.setAttribute('style', accentVars(colorObj.hex));

            const img = document.getElementById(`img-${productId}`);
            if (img) {
                img.src = imageWithFallback(colorObj.image);
                img.alt = `${product.name} color ${colorObj.name} - Gorras A1 GORRAS 2005 C.A Caracas`;
            }

            const labelEl = document.getElementById(`color-label-${productId}`);
            if (labelEl) labelEl.innerHTML = `Color: <strong class="text-white">${escapeHtml(colorObj.name)}</strong>`;

            const backColor = document.getElementById(`back-color-${productId}`);
            if (backColor) backColor.textContent = colorObj.name;

            const swatches = document.querySelectorAll(`.swatch-btn-${productId}`);
            swatches.forEach((btn, idx) => {
                if (idx === colorIndex) {
                    btn.classList.add('border-[#8B7CC7]', 'scale-110', 'ring-2', 'ring-[#8B7CC7]/50');
                    btn.classList.remove('border-[#3A3A52]');
                } else {
                    btn.classList.remove('border-[#8B7CC7]', 'scale-110', 'ring-2', 'ring-[#8B7CC7]/50');
                    btn.classList.add('border-[#3A3A52]');
                }
            });

            updateCardWALink(productId);
        }

        // 8. SHOPPING CART LOGIC (TIERED PRICING)
        function addToCart(productId, custom) {
            const product = products.find((p) => p.id === productId);
            if (!product) return;
            const colorIdx = selectedColorState[productId] || 0;
            const colorObj = product.colors[colorIdx];
            const qtyToAdd = cardQtyState[productId] || 1;
            const cust = custom || { type: "Gorra Lisa (Sin Personalizar)", pos: "", text: "" };
            const sig = `${cust.type}|${cust.pos}|${cust.text || ""}`;

            const existing = cart.find((item) => item.productId === productId && item.colorName === colorObj.name && item.sig === sig);
            if (existing) {
                existing.qty += qtyToAdd;
            } else {
                cart.push({
                    productId: product.id,
                    colorName: colorObj.name,
                    colorObj: colorObj,
                    qty: qtyToAdd,
                    sig: sig,
                    custom: cust,
                });
            }

            cardQtyState[productId] = 1;
            const input = document.getElementById(`qty-input-${productId}`);
            if (input) input.value = 1;
            updateCardWALink(productId);

            updateCartUI();
            showToast(`Agregado: <strong>${qtyToAdd}x ${escapeHtml(product.name)}</strong> (${escapeHtml(colorObj.name)})`, 'success');
        }

        function addCustomToCart(event, productId) {
            event.preventDefault();
            const type = document.getElementById(`ptype-${productId}`).value;
            const pos = document.getElementById(`ppos-${productId}`).value;
            const text = document.getElementById(`ptext-${productId}`).value.trim();
            addToCart(productId, { type, pos, text });
            const form = document.getElementById(`pform-${productId}`);
            if (form) form.reset();
            toggleCardFlip(productId);
        }

        function updateItemQty(index, delta) {
            if (!cart[index]) return;
            cart[index].qty += delta;
            if (cart[index].qty <= 0) cart.splice(index, 1);
            updateCartUI();
        }

        function setItemQty(index, value) {
            const parsed = parseInt(value, 10);
            if (isNaN(parsed) || parsed <= 0) cart.splice(index, 1);
            else cart[index].qty = parsed;
            updateCartUI();
        }

        function removeCartItem(index) {
            cart.splice(index, 1);
            updateCartUI();
        }

        function toggleCart(open) {
            const drawer = document.getElementById('cart-drawer');
            if (open) {
                drawer.classList.remove('hidden');
                updateCartUI();
            } else {
                drawer.classList.add('hidden');
            }
        }

        function updateCartUI() {
            const totalUnits = cart.reduce((sum, item) => sum + item.qty, 0);
            const badge = document.getElementById('cart-badge');
            if (badge) badge.textContent = totalUnits;

            const tier = getCartTier(totalUnits);
            const tierBanner = document.getElementById('cart-tier-banner');
            const itemsContainer = document.getElementById('cart-items-container');
            const checkoutForm = document.getElementById('checkout-form');

            if (totalUnits === 0) {
                tierBanner.innerHTML = `<span class="text-[#C9C2E3]/80">Agrega gorras para activar precios al Mayor (6+) o Gran Mayor (12+).</span>`;
            } else if (totalUnits < 6) {
                const missing = 6 - totalUnits;
                tierBanner.innerHTML = `
                    <div class="flex items-center justify-between text-[#C9C2E3]">
                        <span>Tarifa actual: <strong class="text-white">Al Detal</strong></span>
                        <span class="text-[#8B7CC7] font-semibold">¡Agrega ${missing} más para precio Al Mayor!</span>
                    </div>`;
            } else if (totalUnits < 12) {
                const missing = 12 - totalUnits;
                tierBanner.innerHTML = `
                    <div class="flex items-center justify-between text-[#C9C2E3]">
                        <span><i class="fa-solid fa-unlock text-[#8B7CC7] mr-1"></i> <strong class="text-white">Tarifa Al Mayor Activa</strong></span>
                        <span class="text-[#8B7CC7] font-semibold">¡+${missing} para Gran Mayor!</span>
                    </div>`;
            } else {
                tierBanner.innerHTML = `
                    <div class="flex items-center justify-between text-[#8B7CC7] font-semibold">
                        <span><i class="fa-solid fa-crown mr-1"></i> ¡Tarifa GRAN MAYOR Desbloqueada!</span>
                        <span class="text-white">Máximo ahorro</span>
                    </div>`;
            }

            if (cart.length === 0) {
                itemsContainer.innerHTML = `
                    <div class="text-center py-12 space-y-3">
                        <div class="w-16 h-16 rounded-full bg-[#2A1E4D] border border-[#3A3A52] mx-auto flex items-center justify-center text-[#8B7CC7] text-2xl">
                            <i class="fa-solid fa-hat-cowboy"></i>
                        </div>
                        <h4 class="text-white font-semibold">Tu carrito está vacío</h4>
                        <p class="text-xs text-[#C9C2E3]/80 max-w-xs mx-auto">Explora nuestro catálogo, elige tus colores favoritos y arma tu pedido al detal o al mayor.</p>
                        <button onclick="toggleCart(false)" class="mt-2 bg-[#5A3B8C] hover:bg-[#8B7CC7] text-white hover:text-[#0E0B1D] font-bold px-5 py-2 rounded-xl text-xs transition">
                            Ver Gorras
                        </button>
                    </div>`;
                checkoutForm.classList.add('hidden');
                return;
            }

            checkoutForm.classList.remove('hidden');
            let totalUSD = 0;
            let totalDetalUSD = 0;

            itemsContainer.innerHTML = cart.map((item, idx) => {
                const product = products.find((p) => p.id === item.productId);
                const unitPrice = product.prices[tier.key];
                const lineTotalUSD = unitPrice * item.qty;
                totalUSD += lineTotalUSD;
                totalDetalUSD += product.prices.detal * item.qty;

                const hasCustom = item.custom && (item.custom.type !== "Gorra Lisa (Sin Personalizar)" || item.custom.text);
                const customLine = hasCustom
                    ? `<div class="text-[11px] text-[#8B7CC7] mb-2"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i>${escapeHtml(item.custom.type)}${item.custom.pos ? ' • ' + escapeHtml(item.custom.pos) : ''}${item.custom.text ? ' • "' + escapeHtml(item.custom.text) + '"' : ''}</div>`
                    : '';

                return `
                <div class="bg-[#2A1E4D]/65 border border-[#3A3A52] rounded-2xl p-3.5 flex items-center gap-3">
                    <div class="w-16 h-14 bg-[#0E0B1D] border border-[#3A3A52] rounded-xl p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src="${imageWithFallback(item.colorObj.image)}" alt="${escapeAttr(product.name)}" referrerpolicy="no-referrer"
                             onerror="this.onerror=null;this.src='https://placehold.co/80x80/2A1E4D/C9C2E3?text=A1'"
                             class="max-h-full max-w-full object-contain">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <h5 class="text-sm font-bold text-white truncate" title="${escapeAttr(product.name)}">${escapeHtml(product.name)}</h5>
                            <button onclick="removeCartItem(${idx})" class="text-[#C9C2E3]/60 hover:text-red-400 text-xs p-1" title="Eliminar">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        <div class="text-xs text-[#C9C2E3]/80 mb-1">Color: <span class="text-white">${escapeHtml(item.colorName)}</span></div>
                        ${customLine}
                        <div class="flex items-center justify-between gap-2">
                            <div class="inline-flex items-center bg-[#0E0B1D] border border-[#3A3A52] rounded-lg">
                                <button type="button" onclick="updateItemQty(${idx}, -1)" class="w-7 h-7 flex items-center justify-center text-[#C9C2E3] hover:text-white font-bold">-</button>
                                <input type="number" min="1" value="${item.qty}" onchange="setItemQty(${idx}, this.value)"
                                       class="w-10 text-center bg-transparent text-xs font-bold text-white focus:outline-none">
                                <button type="button" onclick="updateItemQty(${idx}, 1)" class="w-7 h-7 flex items-center justify-center text-[#C9C2E3] hover:text-white font-bold">+</button>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-extrabold text-white">${formatUSD(lineTotalUSD)}</div>
                                <div class="text-[10px] text-[#8B7CC7] font-medium">a tasa BCV</div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');

            const savingsUSD = totalDetalUSD - totalUSD;
            document.getElementById('summary-total-units').textContent = `${totalUnits} ${totalUnits === 1 ? 'gorra' : 'gorras'}`;

            const tierBadgeEl = document.getElementById('summary-tier-badge');
            tierBadgeEl.textContent = tier.label;
            tierBadgeEl.className = `px-2 py-0.5 rounded-md text-xs font-bold border ${tier.badgeClass}`;

            const savingsRow = document.getElementById('summary-savings-row');
            if (savingsUSD > 0.01) {
                savingsRow.classList.remove('hidden');
                document.getElementById('summary-savings').textContent = `-${formatUSD(savingsUSD)}`;
            } else {
                savingsRow.classList.add('hidden');
            }

            document.getElementById('summary-total-usd').textContent = formatUSD(totalUSD);
        }

        // 9. SEND ORDER TO WHATSAPP
        function sendOrderToWhatsApp(event) {
            event.preventDefault();
            if (cart.length === 0) return;

            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const delivery = document.getElementById('cust-delivery').value;
            const payment = document.getElementById('cust-payment').value;
            const address = document.getElementById('cust-address').value.trim();

            const totalUnits = cart.reduce((sum, item) => sum + item.qty, 0);
            const tier = getCartTier(totalUnits);

            let totalUSD = 0;
            let itemsListText = '';

            cart.forEach((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                const unitPrice = product.prices[tier.key];
                const subUSD = unitPrice * item.qty;
                totalUSD += subUSD;
                let line = `${index + 1}. *${product.name}* (${item.colorName}) x${item.qty} unds — ${formatUSD(subUSD)}\n`;
                if (item.custom && (item.custom.type !== "Gorra Lisa (Sin Personalizar)" || item.custom.text)) {
                    line += `   ↳ Personalización: ${item.custom.type}${item.custom.pos ? ' / ' + item.custom.pos : ''}${item.custom.text ? ' / "' + item.custom.text + '"' : ''}\n`;
                }
                itemsListText += line;
            });

            const orderMessage =
                `🧢 *NUEVO PEDIDO - A1 GORRAS 2005 C.A* 🧢\n` +
                `----------------------------------\n` +
                `👤 *Cliente:* ${name}\n` +
                `📱 *Teléfono:* ${phone}\n` +
                `🚚 *Entrega:* ${delivery}\n` +
                (address ? `📍 *Ciudad/Agencia:* ${address}\n` : '') +
                `💳 *Método de Pago:* ${payment}\n` +
                `----------------------------------\n` +
                `📦 *DETALLE DEL PEDIDO (${totalUnits} unds):*\n` +
                `${itemsListText}` +
                `----------------------------------\n` +
                `🏷️ *Tarifa Aplicada:* ${tier.label}\n` +
                `💵 *TOTAL A PAGAR:* ${formatUSD(totalUSD)} *(Monto en $ a tasa BCV del día)*\n` +
                `----------------------------------\n` +
                `¡Hola! Envío mi pedido para confirmar disponibilidad y datos de pago.`;

            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage)}`;

            window.open(waUrl, '_blank', 'noopener,noreferrer');

            cart = [];
            document.getElementById('checkout-form').reset();
            updateCartUI();
            toggleCart(false);

            showToast('¡Pedido enviado a WhatsApp! Tu carrito y datos se han limpiado automáticamente.', 'success');
        }

        // 10. GOOGLE REVIEWS
        function renderReviews() {
            const grid = document.getElementById('reviews-grid');
            if (!grid) return;
            grid.innerHTML = googleReviews.map((rev) => {
                const starsHtml = Array.from({ length: 5 }, (_, i) =>
                    `<i class="fa-solid fa-star ${i < rev.rating ? 'text-[#8B7CC7]' : 'text-[#3A3A52]'}"></i>`
                ).join('');

                return `
                <div class="bg-[#0E0B1D] border border-[#3A3A52] hover:border-[#5A3B8C] rounded-2xl p-5 flex flex-col justify-between space-y-4 transition">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#5A3B8C] to-[#8B7CC7] text-[#0E0B1D] font-bold flex items-center justify-center text-sm">
                                    ${escapeHtml(rev.name.charAt(0).toUpperCase())}
                                </div>
                                <div>
                                    <div class="text-sm font-bold text-white">${escapeHtml(rev.name)}</div>
                                    <div class="text-[11px] text-[#C9C2E3]/60">${escapeHtml(rev.date)}</div>
                                </div>
                            </div>
                            <i class="fa-brands fa-google text-[#8B7CC7]"></i>
                        </div>
                        <div class="flex gap-1 text-xs mb-2.5">${starsHtml}</div>
                        <p class="text-xs sm:text-sm text-[#C9C2E3] leading-relaxed">"${escapeHtml(rev.comment)}"</p>
                    </div>
                    <div class="text-[11px] text-[#8B7CC7] flex items-center gap-1.5">
                        <i class="fa-solid fa-circle-check"></i> Compra verificada
                    </div>
                </div>`;
            }).join('');
        }

        function openReviewModal() {
            document.getElementById('review-modal').classList.remove('hidden');
            setReviewStars(5);
        }

        function closeReviewModal() {
            document.getElementById('review-modal').classList.add('hidden');
        }

        function setReviewStars(count) {
            selectedReviewStars = count;
            const buttons = document.querySelectorAll('#star-selector .star-btn');
            buttons.forEach((btn, idx) => {
                btn.classList.toggle('text-[#8B7CC7]', idx < count);
                btn.classList.toggle('text-[#3A3A52]', idx >= count);
            });
        }

        function submitGoogleReview(e) {
            e.preventDefault();
            const name = document.getElementById('rev-name').value.trim();
            const comment = document.getElementById('rev-comment').value.trim();

            googleReviews.unshift({ name, rating: selectedReviewStars, date: "Justo ahora", comment });

            const countEl = document.getElementById('total-reviews-count');
            countEl.textContent = parseInt(countEl.textContent, 10) + 1;

            document.getElementById('google-review-form').reset();
            closeReviewModal();
            renderReviews();
            showToast('¡Gracias! Tu reseña ha sido publicada exitosamente.', 'success');
        }

        // 11. PARALLAX & TOASTS
        window.addEventListener('scroll', () => {
            const parallaxLayer = document.getElementById('parallax-layer');
            if (parallaxLayer) {
                const scrolled = window.scrollY;
                if (scrolled < 800) parallaxLayer.style.transform = `translateY(${scrolled * 0.28}px)`;
            }
        }, { passive: true });

        function showToast(htmlMessage, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            const borderCol = type === 'success' ? 'border-[#8B7CC7]' : 'border-[#5A3B8C]';
            const icon = type === 'success'
                ? '<i class="fa-solid fa-circle-check text-[#8B7CC7] text-base"></i>'
                : '<i class="fa-solid fa-circle-info text-[#C9C2E3] text-base"></i>';

            toast.className = `pointer-events-auto bg-[#2A1E4D]/95 backdrop-blur-md border ${borderCol} text-[#C9C2E3] px-4 py-3 rounded-xl shadow-2xl shadow-[#0E0B1D] flex items-center gap-3 text-xs sm:text-sm transition-all duration-300`;
            toast.innerHTML = `${icon}<div class="flex-1">${htmlMessage}</div>`;

            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                setTimeout(() => toast.remove(), 300);
            }, 3200);
        }

        // 12. SEO DINAMICO (ItemList de productos + año del footer)
        function injectProductStructuredData() {
            try {
                const base = location.origin + location.pathname.replace(/index\.html$/, "");
                const items = products.map((p, i) => ({
                    "@type": "ListItem",
                    "position": i + 1,
                    "item": {
                        "@type": "Product",
                        "name": p.name,
                        "category": p.category,
                        "image": base + ((p.colors[0] && p.colors[0].image) ? p.colors[0].image : "og-image.jpg"),
                        "description": p.name + " al detal, al mayor y gran mayor. Personalizable con bordado 3D o sublimación. A1 GORRAS 2005 C.A, Caracas, Venezuela.",
                        "brand": { "@type": "Brand", "name": "A1 GORRAS 2005 C.A" },
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "USD",
                            "price": p.prices.detal.toFixed(2),
                            "availability": "https://schema.org/InStock",
                            "itemCondition": "https://schema.org/NewCondition",
                            "url": base,
                            "seller": { "@type": "Organization", "name": "A1 GORRAS 2005 C.A" }
                        }
                    }
                }));
                const ld = {
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": "Catálogo de gorras A1 GORRAS 2005 C.A",
                    "numberOfItems": products.length,
                    "itemListElement": items
                };
                const s = document.createElement('script');
                s.type = 'application/ld+json';
                s.textContent = JSON.stringify(ld);
                document.head.appendChild(s);
            } catch (e) {}
        }

        // 13. INIT
        window.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('category-filters')) renderFilters();
            if (document.getElementById('products-grid')) renderProducts();
            if (document.getElementById('reviews-grid')) renderReviews();
            updateCartUI();
            if (document.getElementById('products-grid')) injectProductStructuredData();
            const fy = document.getElementById('footer-year');
            if (fy) fy.textContent = new Date().getFullYear();
        });
