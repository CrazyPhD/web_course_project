class ProductManager {

}

class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
        };
    }
}

module.exports = { ProductManager, Product };