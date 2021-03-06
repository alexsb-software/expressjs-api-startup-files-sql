var Session = require('../models/main')('session');
var Category = require('../models/main')('category');
var Speaker = require('../models/main')('speaker');
var User = require('../models/main')('user');

// GET /sessions
var index = function (req, res) {
    var page = req.params.page || 0;
    var limit = req.params.limit || 10;
    var offset = page * limit;

    Session.findAll({
        include: [{
            model: Category, as: 'categories',
            attributes: ['name'],
            through: { attributes: [] }
        },
        {
            model: Speaker, as: "speakers",
            through: { attributes: [] }
        }],
        order: [['start', 'ASC']]
    }).then(function (sessions) {
        res.status(200).send(sessions).end();
    }).catch(function (err) {
        res.status(400).send({ error: err }).end();
    });
};

// GET /sessions/:id
var show = function (req, res) {
    Session.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: Category, as: 'categories',
            attributes: ['name'],
            through: { attributes: ['name'] }
        },
        {
            model: Speaker, as: "speakers",
            through: { attributes: [] }
        }]
    }).then(function (session) {
        if (!session) {
            res.status(404).send({
                error: "Session not found"
            }).end();
        } else {
            res.send(session).end();
        }
    }).catch(function (err) {
        res.status(400).send({ error: err }).end();
    });
};

// POST /sessions
var create = function (req, res) {
    // type: "lecture", "workshop", "gallery"
    Session.create({
        name: req.body.name,
        start: req.body.start,
        end: req.body.end,
        day: req.body.day,
        type: req.body.type,
        report_link: req.body.req_link ? req.body.req_link : '',
        number_of_seats: req.body.number_of_seats
    }).then(function (session) {
        // insert categories
        var categories = req.body.categories;

        Category.findAll({
            where: { name: { $in: categories } }
        }).then(function (cats) {
            var cats_id = [];
            cats.forEach((item, index) => {
                cats_id.push(item.id);
            });

            session.setCategories(cats).then(function () {
                session.categories = cats;
                res.status(201).send(session).end();
            }).catch(function (err) {
                res.status(400).send({ error: err }).end();
            });
        }).catch(function (err) {
            res.status(400).send({ error: err }).end();
        });
    }).catch(function (err) {
        res.status(400).send({ error: err }).end();
    });
};

// PUT /sessions/:id
var update = function (req, res) {
    Session.update(req.body, {
        where: {
            id: req.params.id
        },
        fields: ['name', 'start', 'end', 'day', 'type', 'place',
            'report_link', 'number_of_seats'
        ]
    }).then(function (session) {
        if (!session) res.status(404).end();

        var categories = req.body.categories;
        if (categories) {
            Session.findById(req.params.id).then(function (session) {
                Category.findAll({
                    where: { name: { $in: categories } }
                }).then(function (cats) {
                    var cats_id = [];
                    cats.forEach((item, index) => {
                        cats_id.push(item.id);
                    });

                    session.setCategories(cats).then(function () {
                        session.categories = cats;
                        res.status(200).send(session).end();
                    }).catch(function (err) {
                        res.status(400).send({ error: err }).end();
                    });
                }).catch(function (err) {
                    res.status(400).send({ error: err }).end();
                });
            });
        }

    }).catch(function (err) {
        res.status(400).send({ error: err }).end();
    });
};

// DELETE /sessions/:id
var destroy = function (req, res) {
    Session.destroy({
        where: {
            id: req.params.id
        }
    }).then(function () {
        res.status(200).end();
    }).catch(function (err) {
        res.status(500).send({ error: err }).end();
    });
};

module.exports = {
    index: index,
    show: show,
    create: create,
    update: update,
    destroy: destroy
}