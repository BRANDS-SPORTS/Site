(() => {
  'use strict';

  const config = window.BRANDS_CONFIG || {};
  const sourceCatalogItems = Array.isArray(window.BRANDS_CATALOG) ? window.BRANDS_CATALOG : [];
  const catalogItems = sourceCatalogItems.filter(isGarmentModel);
  const whatsappNumber = String(config.whatsapp || '5511990242977').replace(/\D/g, '');

  const categoryLabels = {
    '': 'Modelo Brands',
    Abada: 'Abadás',
    Agro: 'Agro',
    Formandos: 'Formandos',
    Interclasse: 'Interclasse',
    'Nono Ano': 'Nono ano',
    Pesca: 'Pesca',
    Professor: 'Professor',
    Profissao: 'Profissões',
    Religiao: 'Religiosos',
    Terceirao: 'Terceirão',
    'Time Amador': 'Times'
  };

  function normalizeText(value = '') {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function isGarmentModel(item = {}) {
    const title = normalizeText(item.name);
    const garmentWord = /\b(camisa|camiseta|polo|abada|regata|uniforme|conjunto|short|shorts|bermuda|calcao|jaqueta|moletom|blusa)\b/;
    const digitalArtifact = /\b(?:arquivo|download|png|dtf|cdr|pdf|psd|eps|svg|mock\s?up|molde|template|layout|design|digital|grafica|grafico|fonte|tipografia|gabarito|curso|aula|tutorial)\b/;
    const fileBundle = /\b(?:pack|pacote)\b.*\b(?:arquivo|arte|estampa|fonte|png|cdr|pdf|svg|eps|psd|dtf)\b/;
    const structuralTitle = title.replace(/^(?:(?:arte|vetor|estampa)\s+)+/, '');
    const garmentStart = /^(?:camisa|camiseta|polo|abada|regata|uniforme|conjunto|short|shorts|bermuda|calcao|jaqueta|moletom|blusa)\b/;
    const modelStart = /^(?:modelo(?: de)?|exclusiva)\s+(?:camisa|camiseta|polo|abada|regata|uniforme|conjunto|short|shorts|bermuda|calcao|jaqueta|moletom|blusa)\b/;

    return Boolean(title)
      && garmentWord.test(title)
      && !digitalArtifact.test(title)
      && !fileBundle.test(title)
      && (garmentStart.test(structuralTitle) || modelStart.test(structuralTitle));
  }

  function whatsappUrl(message) {
    const text = message || 'Olá! Acessei o site da Brands Sports e gostaria de saber mais sobre os uniformes personalizados.';
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }

  document.querySelectorAll('.js-whatsapp').forEach((link) => {
    link.href = whatsappUrl();
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  document.querySelectorAll('.js-year').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const menuButton = document.querySelector('.menu-button');
  const mainNav = document.querySelector('.main-nav');

  menuButton?.addEventListener('click', () => {
    const isOpen = mainNav?.classList.toggle('open');
    menuButton.classList.toggle('open', Boolean(isOpen));
    menuButton.setAttribute('aria-expanded', String(Boolean(isOpen)));
    document.body.classList.toggle('menu-open', Boolean(isOpen));
  });

  mainNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuButton?.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });

  const siteHeader = document.querySelector('.site-header');
  const updateHeader = () => siteHeader?.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 })
    : null;

  document.querySelectorAll('.reveal').forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add('visible');
  });

  function itemCategory(item) {
    const category = (item.categories || []).find(Boolean) || '';
    return categoryLabels[category] || category || 'Modelo Brands';
  }

  function displayName(name = '') {
    return String(name)
      .replace(/<[^>]*>/g, ' ')
      .replace(/^(?:(?:Arte|Vetor|Estampa)\s+)+/i, '')
      .replace(/^para\s+(?:de\s+)?(?=camisa|camiseta)/i, '')
      .replace(/^modelo\s+(?=camisa|camiseta)/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function createImage(item, className = '') {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = displayName(item.name);
    image.loading = 'lazy';
    image.decoding = 'async';
    if (className) image.className = className;
    image.addEventListener('error', () => {
      image.classList.add('image-error');
      image.alt = `Imagem indisponível — ${displayName(item.name)}`;
    });
    return image;
  }

  function findFeaturedItems() {
    const searches = [
      'modelo 881 tigre',
      'terceirao arara azul voando',
      'nono ano arara azul coroa',
      'camiseta pesca 001'
    ];
    const selected = searches
      .map((search) => catalogItems.find((item) => normalizeText(item.name).includes(normalizeText(search))))
      .filter(Boolean);

    if (selected.length >= 4) return selected.slice(0, 4);
    return catalogItems.filter((item) => item.image).slice(0, 4);
  }

  function renderFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid || !catalogItems.length) return;

    const fragment = document.createDocumentFragment();
    findFeaturedItems().forEach((item, index) => {
      const article = document.createElement('article');
      article.className = `featured-card reveal featured-card-${index + 1}`;

      const media = document.createElement('a');
      media.className = 'featured-media';
      media.href = `catalogo.html?busca=${encodeURIComponent(item.name)}`;
      media.append(createImage(item));

      const badge = document.createElement('span');
      badge.textContent = itemCategory(item);
      media.append(badge);

      const content = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = displayName(item.name);
      const meta = document.createElement('p');
      meta.textContent = item.code ? `Modelo #${item.code}` : 'Modelo personalizável';
      const link = document.createElement('a');
      link.href = whatsappUrl(`Olá! Vi o modelo ${displayName(item.name)}${item.code ? ` (#${item.code})` : ''} no site da Brands Sports e gostaria de saber mais.`);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Quero este modelo →';
      content.append(title, meta, link);
      article.append(media, content);
      fragment.append(article);
    });

    grid.append(fragment);
    grid.querySelectorAll('.reveal').forEach((element) => {
      if (revealObserver) revealObserver.observe(element);
      else element.classList.add('visible');
    });
  }

  renderFeatured();

  const homeCatalogTotal = document.getElementById('home-catalog-total');
  if (homeCatalogTotal) homeCatalogTotal.textContent = String(catalogItems.length);

  const catalogGrid = document.getElementById('catalog-grid');
  if (!catalogGrid) return;

  const pageSize = Number(config.catalogPageSize) || 24;
  const selected = new Set();
  let currentQuery = '';
  let currentCategory = '';
  let visibleLimit = pageSize;
  let filteredItems = catalogItems;
  let activeDialogItem = null;

  const searchForm = document.getElementById('catalog-search');
  const searchInput = document.getElementById('catalog-search-input');
  const resultCount = document.getElementById('catalog-result-count');
  const totalCount = document.getElementById('catalog-total');
  const emptyState = document.getElementById('catalog-empty');
  const loadMoreWrap = document.getElementById('catalog-load-more-wrap');
  const loadMoreButton = document.getElementById('catalog-load-more');
  const selectionBar = document.getElementById('selection-bar');
  const selectionCount = document.getElementById('selection-count');
  const selectionClear = document.getElementById('selection-clear');
  const selectionSend = document.getElementById('selection-send');
  const dialog = document.getElementById('product-dialog');
  const dialogImage = document.getElementById('dialog-image');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogCategory = document.getElementById('dialog-category');
  const dialogCode = document.getElementById('dialog-code');
  const dialogWhatsapp = document.getElementById('dialog-whatsapp');
  const dialogSelect = document.getElementById('dialog-select');

  if (totalCount) totalCount.textContent = String(catalogItems.length);

  function itemKey(item) {
    return `${item.code || ''}::${item.name}`;
  }

  function matchesCategory(item, category) {
    if (!category) return true;
    const normalizedCategory = normalizeText(category);
    return (item.categories || []).some((itemCategoryName) => normalizeText(itemCategoryName) === normalizedCategory)
      || normalizeText(item.name).includes(normalizedCategory);
  }

  function filterCatalog() {
    const query = normalizeText(currentQuery);
    filteredItems = catalogItems.filter((item) => {
      const searchable = normalizeText(`${item.name} ${(item.categories || []).join(' ')} ${item.code || ''}`);
      return matchesCategory(item, currentCategory) && (!query || searchable.includes(query));
    });
  }

  function createCatalogCard(item) {
    const key = itemKey(item);
    const article = document.createElement('article');
    article.className = 'catalog-card';
    article.dataset.key = key;
    article.classList.toggle('selected', selected.has(key));

    const mediaButton = document.createElement('button');
    mediaButton.type = 'button';
    mediaButton.className = 'catalog-card-media';
    mediaButton.setAttribute('aria-label', `Ver detalhes de ${displayName(item.name)}`);
    mediaButton.append(createImage(item));

    const category = document.createElement('span');
    category.className = 'catalog-card-category';
    category.textContent = itemCategory(item);
    mediaButton.append(category);

    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = 'catalog-card-select';
    selectButton.setAttribute('aria-label', `Selecionar ${displayName(item.name)}`);
    selectButton.setAttribute('aria-pressed', String(selected.has(key)));
    selectButton.innerHTML = '<svg aria-hidden="true"><use href="#icon-check"></use></svg>';

    const content = document.createElement('div');
    content.className = 'catalog-card-content';
    const meta = document.createElement('p');
    meta.textContent = item.code ? `MODELO #${item.code}` : 'MODELO PERSONALIZÁVEL';
    const title = document.createElement('h2');
    title.textContent = displayName(item.name);
    const action = document.createElement('a');
    action.href = whatsappUrl(`Olá! Vim pelo site da Brands Sports e quero saber mais sobre o modelo ${displayName(item.name)}${item.code ? ` (#${item.code})` : ''}.`);
    action.target = '_blank';
    action.rel = 'noopener noreferrer';
    action.textContent = 'Quero este modelo';
    const arrow = document.createElement('span');
    arrow.textContent = '→';
    action.append(arrow);
    content.append(meta, title, action);

    mediaButton.addEventListener('click', () => openDialog(item));
    selectButton.addEventListener('click', () => toggleSelection(item));

    article.append(mediaButton, selectButton, content);
    return article;
  }

  function renderCatalog({ reset = false } = {}) {
    if (reset) {
      visibleLimit = pageSize;
      filterCatalog();
    }

    const visibleItems = filteredItems.slice(0, visibleLimit);
    const fragment = document.createDocumentFragment();
    visibleItems.forEach((item) => fragment.append(createCatalogCard(item)));
    catalogGrid.replaceChildren(fragment);
    catalogGrid.setAttribute('aria-busy', 'false');

    if (resultCount) {
      const suffix = filteredItems.length === 1 ? 'modelo disponível' : 'modelos disponíveis';
      resultCount.textContent = `${filteredItems.length} ${suffix}`;
    }
    if (emptyState) emptyState.hidden = filteredItems.length > 0;
    if (loadMoreWrap) loadMoreWrap.hidden = visibleLimit >= filteredItems.length || filteredItems.length === 0;
    if (loadMoreButton) {
      const remaining = Math.max(0, filteredItems.length - visibleLimit);
      loadMoreButton.textContent = remaining > pageSize ? `Carregar mais ${pageSize} modelos` : `Carregar os últimos ${remaining} modelos`;
    }
  }

  function updateCardSelections() {
    catalogGrid.querySelectorAll('.catalog-card').forEach((card) => {
      const isSelected = selected.has(card.dataset.key);
      card.classList.toggle('selected', isSelected);
      const button = card.querySelector('.catalog-card-select');
      button?.setAttribute('aria-pressed', String(isSelected));
      const item = catalogItems.find((candidate) => itemKey(candidate) === card.dataset.key);
      if (button && item) button.setAttribute('aria-label', `${isSelected ? 'Remover' : 'Selecionar'} ${displayName(item.name)}`);
    });

    const count = selected.size;
    if (selectionBar) selectionBar.hidden = count === 0;
    if (selectionCount) selectionCount.textContent = `${count} ${count === 1 ? 'modelo selecionado' : 'modelos selecionados'}`;

    if (activeDialogItem && dialogSelect) {
      const isSelected = selected.has(itemKey(activeDialogItem));
      dialogSelect.classList.toggle('selected', isSelected);
      dialogSelect.textContent = isSelected ? 'Remover da minha seleção' : 'Adicionar à minha seleção';
    }
  }

  function toggleSelection(item) {
    const key = itemKey(item);
    if (selected.has(key)) selected.delete(key);
    else selected.add(key);
    updateCardSelections();
  }

  function openDialog(item) {
    if (!dialog) return;
    activeDialogItem = item;
    dialogImage.src = item.image;
    dialogImage.alt = displayName(item.name);
    dialogTitle.textContent = displayName(item.name);
    dialogCategory.textContent = itemCategory(item).toLocaleUpperCase('pt-BR');
    dialogCode.textContent = item.code ? `Modelo #${item.code}` : 'Modelo personalizável';
    dialogWhatsapp.href = whatsappUrl(`Olá! Vim pelo site da Brands Sports e quero saber mais sobre o modelo ${displayName(item.name)}${item.code ? ` (#${item.code})` : ''}.`);
    dialogWhatsapp.target = '_blank';
    dialogWhatsapp.rel = 'noopener noreferrer';
    updateCardSelections();
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }

  function closeDialog() {
    dialog?.close();
    document.body.classList.remove('dialog-open');
  }

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    currentQuery = searchInput?.value || '';
    currentCategory = '';
    document.querySelectorAll('.catalog-tab').forEach((tab) => tab.classList.toggle('active', !tab.dataset.catalogQuery));
    renderCatalog({ reset: true });
  });

  let searchTimer;
  searchInput?.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      currentQuery = searchInput.value;
      renderCatalog({ reset: true });
    }, 180);
  });

  document.querySelectorAll('.catalog-tab').forEach((button) => {
    button.addEventListener('click', () => {
      currentCategory = button.dataset.catalogQuery || '';
      currentQuery = '';
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('.catalog-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
      renderCatalog({ reset: true });
    });
  });

  loadMoreButton?.addEventListener('click', () => {
    visibleLimit += pageSize;
    renderCatalog();
  });

  selectionClear?.addEventListener('click', () => {
    selected.clear();
    updateCardSelections();
  });

  selectionSend?.addEventListener('click', () => {
    if (!selected.size) return;
    const selectedItems = catalogItems.filter((item) => selected.has(itemKey(item)));
    const list = selectedItems.map((item, index) => `${index + 1}. ${displayName(item.name)}${item.code ? ` (#${item.code})` : ''}`).join('\n');
    const message = `Olá! Selecionei estes modelos no catálogo da Brands Sports:\n\n${list}\n\nGostaria de conversar sobre a personalização e os valores.`;
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  });

  dialogSelect?.addEventListener('click', () => {
    if (activeDialogItem) toggleSelection(activeDialogItem);
  });

  dialog?.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', closeDialog));
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog?.open) closeDialog();
  });

  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('categoria') || '';
  const initialSearch = params.get('busca') || '';
  if (initialCategory) {
    const matchingTab = [...document.querySelectorAll('.catalog-tab')].find((tab) => normalizeText(tab.dataset.catalogQuery) === normalizeText(initialCategory));
    if (matchingTab) {
      currentCategory = matchingTab.dataset.catalogQuery || '';
      document.querySelectorAll('.catalog-tab').forEach((tab) => tab.classList.toggle('active', tab === matchingTab));
    }
  }
  if (initialSearch) {
    currentQuery = initialSearch;
    if (searchInput) searchInput.value = initialSearch;
  }

  filterCatalog();
  renderCatalog();
  updateCardSelections();
})();
