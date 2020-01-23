const Sequelize = require('sequelize');


const connection = new Sequelize('dbwt19','root','',{
    dialect: 'mysql',
    define: {
        timestamps: false
      },
      logging:false
});

const db = {};

db.Sequelize = Sequelize;
db.connection = connection;

db.osoblje = connection.import(__dirname+'/osoblje.js');
db.sala = connection.import(__dirname+'/sala.js');
db.termin = connection.import(__dirname+'/termin.js');
db.rezervacija = connection.import(__dirname+'/rezervacija.js');

/* db.osoblje.hasMany(db.rezervacija,{foreignKey:'osoba'});
db.termin.hasOne(db.rezervacija,{foreignKey:'termin'})
db.sala.hasMany(db.rezervacija, {foreignKey:'sala'});
db.osoblje.hasOne(db.sala,{foreignKey:'zaduzenaOsoba'}); */

db.rezervacija.belongsTo(db.termin,{foreignKey:'termin',targetKey:'id',as: 'rezervisaniTermin'});
db.termin.hasOne(db.rezervacija,{foreignKey:'termin',sourceKey:'id',as: 'rezervisaniTermin'});

db.sala.belongsTo(db.osoblje,{foreignKey:'zaduzenaOsoba',targetKey:'id',as:'OsobaZaduzena'});
db.osoblje.hasOne(db.sala,{foreignKey:'zaduzenaOsoba',sourceKey:'id',as:'OsobaZaduzena'});

db.sala.hasMany(db.rezervacija,{foreignKey:'sala',targetKey:'id',as:'rezervisanaSala'});
db.rezervacija.belongsTo(db.sala,{foreignKey:'sala',sourceKey:'id',as:'rezervisanaSala'});

db.osoblje.hasMany(db.rezervacija,{foreignKey:'osoba',targetKey:'id',as:'rezOsoba'});
db.rezervacija.belongsTo(db.osoblje,{foreignKey:'osoba',sourceKey:'id',as:'rezOsoba'});


/* db.sala.belongsTo(db.osoblje,{as:'osobaZaSalu',foreignKey: 'zaduzenaOsoba'});
db.rezervacija.belongsTo(db.termin,{as: 'rezervisaniTermin',foreignKey:'termin'});
db.osoblje.hasMany(db.rezervacija,{as:'osobljeRezervacije'});
db.rezervacija.belongsTo(db.osoblje,{foreignKey:'osoba',as:'rezervacijaOsoblja'});
db.sala.hasMany(db.rezervacija,{as:'rezervacijeSale'});
db.rezervacija.belongsTo(db.sala,{as:'salaRezervisana',foreignKey: 'sala'}); */

db.connection.sync({force:true}).then(function(){   // Napravi sve tabele odjednom,pa onda puni tabelu po tabelu
  db.osoblje.bulkCreate([
    {
        ime : 'Neko',
        prezime : 'Nekic',
        uloga : 'profesor'
    },
    {
        ime : 'Drugi',
        prezime : 'Neko',
        uloga : 'asistent'
    },
    {
        ime : 'Test',
        prezime : 'Test',
        uloga : 'asistent'
    }
  ])
  .then(function(){
    db.termin.bulkCreate([
      {
          redovni : 'false',
          dan : null,
          datum : '01.01.2020',
          semestar : null,
          pocetak : '12:00',
          kraj : '13:00'
      },
      {
          redovni : 'true',
          dan : 0,
          datum : null,
          semestar : "zimski",
          pocetak : '13:00',
          kraj : '14:00'
      }
    ]).then(function(){
      db.sala.bulkCreate([
        {
            naziv : '1-11',
            zaduzenaOsoba : 1
        },
        {
            naziv : '1-15',
            zaduzenaOsoba : 2
        }
      ]).then(function(){
        db.rezervacija.bulkCreate([
          {
              termin : 1,
              sala : 1,
              osoba : 1
          },
          {
              termin : 2,
              sala : 1,
              osoba : 3
          }
        ])

        })
      })
    })
  });



/*   connection.query('SELECT * FROM osoblje', db.osoblje).then(function(osobe){
    console.log(osobe);
  })

  connection.query('SELECT * FROM rezervacija', db.rezervacija).then(function(rez){
    console.log(rez);
  }) */


module.exports = db;