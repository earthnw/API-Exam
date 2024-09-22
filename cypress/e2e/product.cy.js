import cartPage from "../pageObjects/cartPage";

const productInfo = {
  productType: "smartphone",
  productName: "iPhone 14",
  productId: 12345,
};
const userInfo = {
  username: "niravit",
  password: "correctpass",
  userId: 12345,
};
describe("Product API Tests", () => {
  context("API - Search", () => {
    const urlSearch = "/api/products/search";
    it("Ex.1: Search by productType and verify the data in DB", () => {
      // get api by using product type
      cy.request({
        method: "GET",
        url: `${urlSearch}?product_type=${productInfo.productType}`,
      }).then((response) => {
        // check status 200
        checkResponseStatus(response, 200);

        // check all lists are smartphone
        response.body.products.forEach((product) => {
          expect(product.type).to.eq(productInfo.productType);
        });

        // query DB to check the product list
        selectProductByCondition(`product_type = '${productType}'`).then(
          (dbProducts) => {
            // compare the response and DB

            // check the length of list in API and DB
            expect(response.body.products.length).to.eq(dbProducts.length);

            // compare each product in API and DB
            for (let i = 0; i < response.body.products.length; i++) {
              const apiProduct = response.body.products[i]; // API
              const dbProduct = dbProducts[i]; // DB

              // compare id, name, price
              verifyProductInDB(apiProduct, dbProduct);
            }
          }
        );
      });
    });

    it("Ex.2: Search by productName and verify the data in DB", () => {
      // get api by using product name
      cy.request({
        method: "GET",
        url: `${urlSearch}?product_name=${productInfo.productName}`,
      }).then((response) => {
        // check status 200
        checkResponseStatus(response, 200);

        // check the product name
        const apiProduct = response.body.products[0];
        expect(apiProduct.name).to.eq(productName);

        selectProductByCondition(
          `product_name = '${productInfo.productName}'`
        ).then((dbProducts) => {
          // check the length of list in API and DB
          expect(response.body.products.length).to.eq(dbProducts.length);

          // compare id, name, price
          verifyProductInDB(apiProduct, dbProduct);
        });
      });
    });
  });

  context("API - Add/Delete product in cart", () => {
    // initial data by clear all items in user's cart
    before(() => {
      loginAndGetToken().then((token) => {
        apiClearCart(token).then((clearCartResponse) => {
          // check status 200
          checkResponseStatus(clearCartResponse, 200);
        });
      });
    });

    it("Ex.3-4: Add the product to the cart and verify the data in web and DB", () => {
      // login to get token
      loginAndGetToken().then((token) => {
        // post api to add product to cart
        cy.request({
          method: "POST",
          url: "/api/cart/add",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            product_id: productInfo.productId,
            quantity: 1,
          },
        }).then((cartResponse) => {
          // check status 200
          checkResponseStatus(cartResponse, 200);

          // check product id and quantity in response
          const addedItem = cartResponse.body.cart.items[0];
          expect(addedItem.product_id).to.eq(productInfo.productId);
          expect(addedItem.quantity).to.eq(quantity);

          // go to cart page
          cartPage.visit();

          // check title, product name, quantity in web
          cartPage.shouldShowTitle("ตระกร้าของคุณ");
          cartPage.shouldShowProductName(productInfo.productName);
          cartPage.shouldShowProductQuantity(quantity);

          // check product id, name, quantity of cart in DB
          selectCartItemOfUser(userInfo.userId).then((dbProducts) => {
            // compare id, name, price
            expect(dbProducts.product_id).to.eq(productInfo.productId);
            expect(dbProducts.product_name).to.eq(productInfo.productName);
            expect(dbProducts.quantity).to.eq(quantity);
          });
        });
      });
    });

    it("Ex.5: Delete the product from the cart and verify the data in web and DB", () => {
      // login to get token
      loginAndGetToken().then((token) => {
        // delete api to remove product from cart
        cy.request({
          method: "DELETE",
          url: "/api/cart/",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            product_id: productInfo.productId,
          },
        }).then((cartResponse) => {
          // check status 200
          checkResponseStatus(cartResponse, 200);

          // go to cart page
          cartPage.visit();

          // check title, product name, quantity in web
          cartPage.shouldShowTitle("ตระกร้าของคุณ");
          cartPage.shouldNotShowProductName();
          cartPage.shouldNotShowProductQuantity();

          // check product id, name, quantity of cart in DB
          selectCartItemOfUser(userInfo.userId).then((dbProducts) => {
            expect(dbProducts).to.be.empty;
          });
        });
      });
    });
  });
});

function checkResponseStatus(response, status) {
  expect(response.status).to.eq(status);
}

function verifyProductInDB(apiProduct, dbProduct) {
  expect(apiProduct.id).to.eq(dbProduct.product_id);
  expect(apiProduct.name).to.eq(dbProduct.product_name);
  expect(apiProduct.price).to.eq(dbProduct.price);
}

function loginAndGetToken() {
  return cy
    .request({
      method: "POST",
      url: "/api/login",
      body: {
        username: userInfo.username,
        password: userInfo.password,
      },
    })
    .then((response) => {
      checkResponseStatus(response, 200);
      return response.body.token;
    });
}

function selectCartItemOfUser(userId) {
  return cy.sqlServer(
    `SELECT product_id, product_name, quantity FROM cart WHERE user_id = ${userId}`
  );
}

function selectProductByCondition(condition) {
  cy.sqlServer(
    `SELECT product_id, product_name, price FROM products WHERE ${condition}`
  );
}

function apiClearCart(token) {
  return cy.request({
    method: "DELETE",
    url: "/api/cart/clearAllCart",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
