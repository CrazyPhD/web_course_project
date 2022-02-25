function apiConfig(app) {
    const pool = app.getPool();
    const schema = app.getSchema();
    const mail = app.getMailConfig();

    app.api('products', (req, res) => {
        const params = req.body;
        const fields = params.fields.join(',');
        let answer = { success: false };

        res.status(200).type('text/json');
        if ((params.asc && (params.orderby == null)) || (params.page && (params.limit == null)))
            return res.send(JSON.stringify(answer));
        pool.query(
            'SELECT ' + fields + ' FROM ' + schema + '.products ' +
            (params.where ? 'WHERE ' + params.where + ' ' : '') +
            (params.orderby ? 'ORDER BY ' + params.orderby + ' ' + (params.asc != null ? (params.asc === true ? 'ASC ' : 'DESC ') : '') : '') +
            ((params.limit && (params.limit > 0)) ? 'LIMIT ' + params.limit + ' ' : '') +
            ((params.page && (params.page > 0)) ? 'OFFSET ' + (params.limit * (params.page - 1)) : ''),
            (err, result) => {
                if (err) app.log(err);
                else {
                    answer.success = true;
                    answer.products = result.rows;
                    answer.products.forEach((product) => {
                        if (product.image)
                            product.image = Buffer.from(product.image, 'binary').toString('utf8');
                    });
                }
                res.send(JSON.stringify(answer));
            }
        );
    });

    app.api('send_confirmation', (req, res) => {
        const params = req.body;
        const origin = req.header('Origin');
        let answer = { success: false };
        res.status(200).type('text/json');
        pool.query('SELECT login, verification FROM '+schema+'.users WHERE userId=($1)', [params.id], (err, result) => {
            if (err) app.log(err);
            else if (result.rowCount === 0) app.log("User with id `" + params.id + "` not found.");
            else {
                const mailConfig = {
                    from: '"Магазин Софта" <' + mail.user + '>',
                    to: result.rows[0].login,
                    subject: 'Подтверждение профиля',
                    html: '<p>Добро пожаловать в Магазин Софта!</p><p>Подтвердите свой профиль, перейдя по <a href="'+origin+'/confirm/'+result.rows[0].verification+'">ссылке</a>.</p>'
                };
                mail.transporter.sendMail(mailConfig, (err, info) => {
                    if (err) app.log(err);
                    else {
                        answer.success = true;
                        app.log('Email sent: ' + info.response);
                    }
                    res.send(JSON.stringify(answer));
                });
            }
        });
    });
}

module.exports = { apiConfig }