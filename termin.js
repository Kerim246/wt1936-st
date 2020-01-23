const Sequelize = require('sequelize');

module.exports = function(sequelize,DataTypes){
var Termin = sequelize.define('termin', {
    redovni : Sequelize.BOOLEAN,
    dan : Sequelize.INTEGER,
    datum : Sequelize.STRING,
    semestar : Sequelize.STRING,
    pocetak : Sequelize.TIME,
    kraj : Sequelize.TIME
},{
    freezeTableName: true
},{
    timestamps: false
})
return Termin;
}