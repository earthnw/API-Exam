class CartPage {
  visit() {
    cy.visit("/cart");
  }

  shouldShowTitle(title) {
    cy.get("[data-testid=titlePage]").should("have.text", title);
  }

  shouldShowProductName(productName) {
    cy.get("[data-testid=productName]").should("have.text", productName);
  }

  shouldShowProductQuantity(quantity) {
    cy.get("[data-testid=productQuantity]").should("have.text", quantity);
  }

  shouldNotShowProductName() {
    cy.get("[data-testid=productName]").should("not.exist");
  }

  shouldNotShowProductQuantity() {
    cy.get("[data-testid=productQuantity]").should("not.exist");
  }
}

export default new CartPage();
