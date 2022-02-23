function imageFileToBase64(file) {
    return 'data:' + file.mimetype+';base64,' + file.buffer.toString("base64");
}

function registerProduct(app, req, res) {
    const pool = app.getPool();
    const info = req.body;
    const file = req.file;

    const name = info.name;
    const price = info.price;
    const keywords = info.keywords || '';
    const shortdesc = info.shortdesc || '';
    const description = info.description || '';
    const count = info.count;
    const image = imageFileToBase64(file);

    pool.query(
        'INSERT INTO '+this.schema+'.products (name, price, keywords, shortdesc, description, image, count) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, price, keywords, shortdesc, description, image, count],
        (err, result) => {
            err ? app.log(err) : app.log('Product `' + name + '`' + ' -> register');
            res.redirect('/admin');
        }
    );
}

function updateProduct(app, req, res, productId, oldImage) {
    const pool = app.getPool();
    const info = req.body;
    const file = req.file;

    const name = info.name;
    const price = info.price;
    const keywords = info.keywords || '';
    const shortdesc = info.shortdesc || '';
    const description = info.description || '';
    const count = info.count;
    const image = file ? imageFileToBase64(file) : oldImage;

    pool.query(
        'UPDATE ' + this.schema + '.products SET name=$1, price=$2, keywords=$3, shortdesc=$4, description=$5, image=$6, count=$7 WHERE productId=$8',
        [name, price, keywords, shortdesc, description, image, count, productId],
        (err, result) => {
            if (err) res.redirect('/admin');
            else {
                app.log('Product ' + name + ' -> update');
                res.render('admin/addproduct', {
                    product: {
                        id: productId,
                        name: name,
                        price: price,
                        keywords: keywords,
                        shortdesc: shortdesc,
                        description: description,
                        image: image,
                        count: count
                    }
                });
            }
        }
    );
}

module.exports = { registerProduct, updateProduct };