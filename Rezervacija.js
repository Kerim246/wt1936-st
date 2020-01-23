const Sequelize = require('sequelize');

module.exports = function(sequelize,DataTypes){
var Rezervacija = sequelize.define('rezervacija', {
    termin : {
        type : Sequelize.INTEGER,
        references : {
        model : 'termin',   
        referencesKey: 'id',
        unique : true
        }
    },
    sala : {
        type : Sequelize.INTEGER,
        references : {
            model : 'sala',
            referencesKey: 'id'
        }
        },
    osoba : {
        type : Sequelize.INTEGER,
        references : {
            model : 'osoblje',
            referencesKey : 'id'
        }
    }

},{
    freezeTableName: true,
})
    return Rezervacija;
};