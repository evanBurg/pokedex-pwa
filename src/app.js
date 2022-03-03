let state = {
  navigator: null,
  elements: {},
};

const capitalizeText = (text, delim = ' ') =>
  text
    .toLowerCase()
    .split(delim)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const changePage = (page, data) => {
  state.navigator.pushPage(page, { data });
};

const renderPokemonList = (pokemon) => {
  const elements = pokemon.map((poke) => {
    const item = document.createElement('ons-list-item');
    item.setAttribute('modifier', 'chevron capital');
    item.setAttribute('tappable', true);
    const text = document.createTextNode(capitalizeText(poke.name));
    item.appendChild(text);
    item.addEventListener('click', () =>
      changePage('views/pokemon.html', {
        url: poke.url,
      })
    );
    return item;
  });
  state.elements.loader.remove();
  elements.forEach((el) => state.elements.list.appendChild(el));
};

const fetchPokemonList = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100');
    if (response.ok) {
      const pokemon = await response.json();
      renderPokemonList(pokemon.results);
    }
  } catch (e) {
    ons.notification.alert(`Error loading Pokemon List: ${e}`);
  }
};

const renderPokemon = (poke) => {
  state.elements.loader.remove();
  state.elements.pageTitle.innerHTML = capitalizeText(poke.name);
  state.elements.cardTitle.innerHTML = `${capitalizeText(poke.name)} #${poke.game_indices[0].game_index}`;
  state.elements.cardImage.src = poke.sprites.front_default;
  state.elements.loaderImg.remove();
  state.elements.cardImage.style.display = 'unset';
  const typeHeader = document.createElement('ons-list-header');
  typeHeader.appendChild(document.createTextNode('Types'));
  const typeEls = poke.types.map((t) => {
    const item = document.createElement('ons-list-item');
    item.classList.add(t.type.name);
    const name = document.createTextNode(capitalizeText(t.type.name));
    item.appendChild(name);
    return item;
  });
  state.elements.cardList.appendChild(typeHeader);
  typeEls.forEach((el) => state.elements.cardList.appendChild(el));

  const statsHeader = document.createElement('ons-list-header');
  statsHeader.appendChild(document.createTextNode('Stats'));
  const statsEls = poke.stats.map((stat) => {
    const item = document.createElement('ons-list-item');
    const name = document.createElement('span');
    name.appendChild(document.createTextNode(capitalizeText(stat.stat.name, '-')));
    item.appendChild(name);

    if (stat.effort !== undefined) {
      const eff = document.createElement('span');
      eff.classList.add('notification')
      eff.classList.add('effort');
      eff.appendChild(document.createTextNode(stat.effort));
      item.appendChild(eff);
    }

    if (stat.base_stat !== undefined) {
      const base = document.createElement('span');
      base.classList.add('notification');
      base.classList.add('base');
      base.appendChild(document.createTextNode(stat.base_stat));
      item.appendChild(base);
    }
    return item;
  });
  state.elements.cardList.appendChild(statsHeader);
  statsEls.forEach((el) => state.elements.cardList.appendChild(el));

  state.elements.cardList.style.display = 'unset';
};

const fetchPokemon = async (url) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const pokemon = await response.json();
      renderPokemon(pokemon);
    }
  } catch (e) {
    ons.notification.alert(`Error loading Pokemon: ${e}`);
  }
};

const setUpPage = (evt) => {
  console.log('start init', evt.target.id);
  if (evt.target.id === 'home') {
    state.navigator = document.querySelector('#navigator');
    state.elements.list = document.querySelector('#poke-list');
    state.elements.loader = document.querySelector('#loader'),
    fetchPokemonList();
  }

  if (evt.target.id === 'pokemon') {
    state.elements = {
      pageTitle: document.querySelector('#page-title'),
      cardTitle: document.querySelector('#card-title'),
      cardImage: document.querySelector('#card-image'),
      cardList: document.querySelector('#card-list'),
      loader: document.querySelector('#loader'),
      loaderImg: document.querySelector('#loader-img'),
    };
    fetchPokemon(state?.navigator?.topPage?.data?.url || undefined);
  }
};

document.addEventListener('init', setUpPage);
// Padd the history with an extra page so that we don't exit right away
window.addEventListener('load', () => window.history.pushState({ }, ''));
// When the browser goes back a page, if our navigator has more than one page we pop the page and prevent the back event by adding a new page
// Otherwise we trigger a second back event, because we padded the history we need to go back twice to exit the app.
window.addEventListener('popstate', () => {
  const { pages } = elements.navigator;
  if (pages && pages.length > 1) {
    state.navigator.popPage();
    window.history.pushState({ }, '');
  } else {
    window.history.back();
  }
});
