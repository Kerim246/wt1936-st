const Sequelize = require('sequelize');

module.exports = function(sequelize,DataTypes){
var Sala = sequelize.define('sala', {
    naziv : Sequelize.STRING,
    zaduzenaOsoba : {
        type : Sequelize.INTEGER,
        references : {
        model : 'osoblje',   
        referencesKey: 'id'
        }
    }
},{
    freezeTableName: true
},{
    timestamps: false
});
return Sala;
}