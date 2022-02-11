class ProductManager {

}

class Product {
    constructor(id, name, image, description, shortdesc, price) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.price = price;
        this.description = description;
        this.shortdesc = shortdesc;
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            image: this.image,
            price: this.price,
            description: this.description,
            shortdesc: this.shortdesc
        };
    }
}

module.exports = { ProductManager, Product };