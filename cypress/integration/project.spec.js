const API_URL = "https://api.mercadolibre.com/sites/MLB/search?q=$computador"
const PROJECT_URL = './index.html'

const LOADING = '.loading';
const ITEM_SELECTOR = '.item';
const ADD_CART_BUTTON = '.item__add'
const CART_ITEMS = '.cart__items'
const EMPTY_CART_BUTTON = '.empty-cart'
const TOTAL_PRICE = '.total-price'

const addToCart = (index) => {
  cy.get(ITEM_SELECTOR)
    .should('exist')
    .eq(index)
    .children(ADD_CART_BUTTON)
    .click();
}

const countCart = (amount) => {
  cy.get(CART_ITEMS)
      .children()
      .should('have.length', amount);
}

const checkPrice = (results, indexes) => {
  cy.wait(1000);
  let total = 0;
  indexes.forEach(index => total += results[index].price);
  cy.get(TOTAL_PRICE)
      .should('have.value', total.toString());
}

describe('Shopping Cart Project', () => {
  let results;
  before(() => {
    cy.visit(PROJECT_URL);
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        results = data.results
      })
  })

  beforeEach(() => {
    cy.get(EMPTY_CART_BUTTON)
      .click()
    cy.clearLocalStorage();
  });

  it('Listagem de produtos', () => {
    cy.get(ITEM_SELECTOR)
      .should('exist')
      .should('have.length', results.length);
  });

  it('Adicione o produto ao carrinho de compras',() => {
    cy.wait(1000);
    addToCart(36);
    countCart(1);
    cy.get(CART_ITEMS)
      .children()
      .first()
      .should('have.text', `SKU: ${results[36].id} | NAME: ${results[36].title} | PRICE: $${results[36].price}`)
  });

  it('Remova o item do carrinho de compras ao clicar nele', () => {
    addToCart(29);
    addToCart(31);
    addToCart(15);
    cy.get(CART_ITEMS)
      .children()
      .eq(1)
      .click()
    countCart(2);
    cy.get(CART_ITEMS)
      .children()
      .eq(1)
      .click()
    countCart(1);
    cy.get(CART_ITEMS)
      .children()
      .eq(0)
      .click()
    countCart(0);

  });

  it('Carregue o carrinho de compras através do **LocalStorage** ao iniciar a página', () => {
    let first = 36;
    let last = 29;
    cy.visit(PROJECT_URL);
    cy.wait(1000);
    addToCart(first);
    countCart(1);
    cy.get(CART_ITEMS)
      .children()
      .first()
      .should('have.text', `SKU: ${results[first].id} | NAME: ${results[first].title} | PRICE: $${results[first].price}`)

      addToCart(last);
    cy.get(CART_ITEMS)
      .children()
      .last()
      .should('have.text', `SKU: ${results[last].id} | NAME: ${results[last].title} | PRICE: $${results[last].price}`)

    cy.reload()
    cy.get(CART_ITEMS)
      .children()
      .first()
      .should('have.text', `SKU: ${results[first].id} | NAME: ${results[first].title} | PRICE: $${results[first].price}`)
    cy.get(CART_ITEMS)
      .children()
      .last()
      .should('have.text', `SKU: ${results[last].id} | NAME: ${results[last].title} | PRICE: $${results[last].price}`)
  });

  it('Some o valor total dos itens do carrinho de compras de forma assíncrona', () => {
    addToCart(5);
    checkPrice(results, [5]);
    addToCart(42);
    checkPrice(results, [5, 42]);
    addToCart(36);
    checkPrice(results, [5, 42, 36]);
    addToCart(15);
    checkPrice(results, [5, 42, 36, 15]);
    cy.get(CART_ITEMS)
      .children()
      .eq(1)
      .click()
    checkPrice(results, [5, 36, 15]);
  });

  it('Botão para limpar carrinho de compras', () => {
    addToCart(3);
    addToCart(0);
    addToCart(1);
    countCart(3);
    cy.get(EMPTY_CART_BUTTON)
      .click()
    countCart(0);
  });

  it('Adicionar um texto de "loading" durante uma requisição à API', () => {
    cy.visit(PROJECT_URL)
    cy.request(PROJECT_URL)
    cy.get(LOADING)
      .should('exist')
      .wait(3000)
      .should('not.exist');
  });
});
