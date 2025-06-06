document.addEventListener('DOMContentLoaded', () => {
    // ======== MÓDULO DE BANCO DE DADOS (localStorage) ========
    const DB = {
        get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
        set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
        init: () => {
            if (!localStorage.getItem('c4_products')) {
                DB.set('c4_products', [
                    { id: 'prod1', name: 'Batom Matte Luxo', cost: 8.00, price: 25.00 },
                    { id: 'prod2', name: 'Base Alta Cobertura', cost: 22.00, price: 55.00 },
                    { id: 'prod3', name: 'Perfume Floral Intenso', cost: 35.00, price: 89.00 },
                    { id: 'prod4', name: 'Creme Hidratante Facial', cost: 18.00, price: 45.00 }
                ]);
            }
             if (!localStorage.getItem('c4_costs')) {
                 DB.set('c4_costs', {
                    fixed: 1299.00, // Ex: Aluguel, internet, etc.
                    variable: 4.75,  // Ex: Embalagem, taxa de cartão
                    unitsSoldMonthly: 150 // Estimativa para rateio de custo fixo
                });
            }
        }
    };
    DB.init();

    // ======== MÓDULO DE UTILIDADES ========
    const a = {
        qs: (selector, parent = document) => parent.querySelector(selector),
        qsa: (selector, parent = document) => parent.querySelectorAll(selector),
        formatCurrency: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        showToast: (message) => {
            const toast = a.qs('#toast-notification');
            if(!toast) return;
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        },
        populateSelect: (selectElement, items, textProp, valueProp) => {
            if (!selectElement) return;
            selectElement.innerHTML = '<option value="">-- Selecione --</option>';
            items.forEach(item => {
                const option = document.createElement('option');
                option.textContent = item[textProp];
                option.value = item[valueProp];
                selectElement.appendChild(option);
            });
        },
        getProductById: (id) => DB.get('c4_products').find(p => p.id === id),
        updateProduct: (updatedProduct) => {
            let products = DB.get('c4_products');
            products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            DB.set('c4_products', products);
        },
        // Calcula o custo total por unidade, somando custo de compra, rateio do fixo e custo variável
        getTotalCost: (productCost) => {
            const costs = DB.get('c4_costs');
            const fixedCostPerUnit = (costs.fixed || 0) / (costs.unitsSoldMonthly || 1);
            return (productCost || 0) + fixedCostPerUnit + (costs.variable || 0);
        }
    };

    // ======== MÓDULO DE NAVEGAÇÃO ========
    const AppNavigator = {
        init: () => {
            const links = a.qsa('.sidebar-nav-item');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    AppNavigator.setActivePage(link.dataset.page);
                    a.qs('.sidebar-nav').classList.remove('open');
                    a.qs('#app-overlay').classList.remove('active');
                });
            });

            a.qs('#menu-toggle-btn').addEventListener('click', () => { a.qs('.sidebar-nav').classList.add('open'); a.qs('#app-overlay').classList.add('active'); });
            a.qsa('.close-btn, #app-overlay').forEach(el => el.addEventListener('click', () => { a.qs('.sidebar-nav').classList.remove('open'); a.qs('#app-overlay').classList.remove('active'); }));
            
            AppNavigator.setActivePage('dashboard-page');
        },
        setActivePage: (pageId) => {
            a.qsa('.page-content').forEach(page => page.classList.remove('active'));
            a.qsa('.sidebar-nav-item').forEach(nav => nav.classList.remove('active'));

            const targetPage = a.qs(`#${pageId}`);
            const targetNav = a.qs(`.sidebar-nav-item[data-page="${pageId}"]`);

            if (targetPage) targetPage.classList.add('active');
            if (targetNav) targetNav.classList.add('active');

            if (pageId === 'calculadoras-page') {
                CalculatorPage.init();
            }
        }
    };

    // ======== MÓDULO DA CALCULADORA DE PREÇO ========
    const CalculatorPage = {
        init: () => {
            const productSelect = a.qs('#calc-pv-produto');
            const costInput = a.qs('#calc-pv-custo');
            const marginSlider = a.qs('#calc-pv-margem-slider');
            const marginDisplay = a.qs('#calc-pv-margem-display');
            const calcButton = a.qs('#btn-calc-pv');
            const saveButton = a.qs('#btn-save-pv');

            a.populateSelect(productSelect, DB.get('c4_products'), 'name', 'id');
            
            marginSlider.oninput = () => { marginDisplay.textContent = `${marginSlider.value}%`; };
            productSelect.onchange = () => {
                const selectedProduct = a.getProductById(productSelect.value);
                costInput.value = selectedProduct ? selectedProduct.cost.toFixed(2) : '';
                 a.qs('#calc-pv-results').style.display = 'none'; // Esconde resultados antigos
            };
            calcButton.onclick = CalculatorPage.handleCalculate;
            saveButton.onclick = CalculatorPage.handleSave;
        },

        validate: (fields) => {
            let isValid = true;
            fields.forEach(id => {
                const el = a.qs(id);
                el.classList.remove('invalid');
                if (el.value === '' || (el.type === 'number' && parseFloat(el.value) < 0)) {
                    el.classList.add('invalid');
                    isValid = false;
                }
            });
            if (!isValid) a.showToast("Por favor, preencha todos os campos obrigatórios.");
            return isValid;
        },
        
        handleCalculate: () => {
            if (!CalculatorPage.validate(['#calc-pv-produto', '#calc-pv-custo'])) return;
            
            const productCost = parseFloat(a.qs('#calc-pv-custo').value);
            const totalCost = a.getTotalCost(productCost);
            const marginPercentage = parseFloat(a.qs('#calc-pv-margem-slider').value);
            const margin = marginPercentage / 100;
            
            // Fórmula markup: Preço de Venda = Custo * (1 + Margem)
            const price = totalCost * (1 + margin);
            const profit = price - totalCost;

            a.qs('#calc-pv-results').style.display = 'block';
            a.qs('#calc-pv-preco-sugerido').textContent = a.formatCurrency(price);
            a.qs('#calc-pv-lucro-liquido').textContent = a.formatCurrency(profit);
            
            const alerta = a.qs('#calc-pv-alerta-margem');
            // Calcula a margem real sobre o preço de venda para o alerta
            const finalMarginOnPrice = price > 0 ? (profit / price) * 100 : 0;
            alerta.style.display = finalMarginOnPrice < 20 ? 'block' : 'none';
        },
        
        handleSave: () => {
            if (!CalculatorPage.validate(['#calc-pv-produto'])) return;
            
            const productId = a.qs('#calc-pv-produto').value;
            let product = a.getProductById(productId);
            
            const newPriceText = a.qs('#calc-pv-preco-sugerido').textContent;
            if (!newPriceText.includes("R$")) {
                a.showToast("Primeiro, calcule um preço para depois salvar.");
                return;
            }
            
            const newPrice = parseFloat(newPriceText.replace('R$', '').replace(/\./g, '').replace(',', '.'));
            product.price = newPrice;
            product.cost = parseFloat(a.qs('#calc-pv-custo').value);
            
            a.updateProduct(product);
            a.showToast(`Preço do produto "${product.name}" foi atualizado!`);
        }
    };
    
    // Inicia a aplicação e a navegação
    AppNavigator.init();

    // Define ano atual no rodapé
    const yearSpan = document.getElementById('current-year');
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();
});
