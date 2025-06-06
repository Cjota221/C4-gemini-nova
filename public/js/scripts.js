document.addEventListener('DOMContentLoaded', () => {
    // Declaração de todas as variáveis de elementos no início
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarNav = document.getElementById('sidebar-nav');
    const appOverlay = document.getElementById('app-overlay');
    const body = document.body;
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');
    const pageContents = document.querySelectorAll('.page-content');
    const currentYearSpan = document.getElementById('current-year');
    const quickActionButtons = document.querySelectorAll('.btn-action[data-target-page]');
    
    // ... (restante dos seletores como na versão anterior)
    
    // Funções e lógica principal
    function openSidebar() { /* ... */ }
    function closeSidebar() { /* ... */ }
    function setActivePage(pageId, data) { /* ... */ }

    // (Colar aqui o resto do seu código JavaScript, a partir de `let produtosCadastrados = [...]`
    //  e todas as funções de lógica para cada página, certificando-se de que não há
    //  novas declarações de `const` para elementos já selecionados no topo)
});
