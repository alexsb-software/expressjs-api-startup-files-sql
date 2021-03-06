module.exports = function (sequalize, DataTypes) {
    return sequalize.define('sessions', {
        start: {
            type: DataTypes.TIME,
            allowNull: false,
            get: function () {
                var start = this.getDataValue('start');
                return require('moment')(start, 'HH:mm').format('LT');
            }
        },
        end: {
            type: DataTypes.TIME,
            allowNull: false,
            get: function () {
                var end = this.getDataValue('end');
                return require('moment')(end, 'HH:mm').format('LT');
            }
        },
        day: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        report_link: {
            type: DataTypes.STRING
        },
        number_of_seats: {
            type: DataTypes.INTEGER
        },
        place: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
            hooks: {
                afterValidate: function (session, options) {
                    session.end > session.start;
                }
            }
        });
};