const Sequelize = require('sequelize');

module.exports = function(sequelize,DataTypes){
  const Osoblje = sequelize.define('osoblje', {
    ime : Sequelize.STRING,
    prezime : Sequelize.STRING,
    uloga : Sequelize.STRING
},{
    freezeTableName: true
},{
    timestamps: false
});
    
    return Osoblje;
}
