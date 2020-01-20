const Sequelize = require('sequelize');


const connection = new Sequelize('dbwt19','root','root',{
    dialect: 'mysql',
    define: {
        timestamps: false
      },
      logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.connection = connection;

db.osoblje = connection.import(__dirname+'/osoblje.js');
db.sala = connection.import(__dirname+'/sala.js');
db.termin = connection.import(__dirname+'/termin.js');
db.rezervacija = connection.import(__dirname+'/rezervacija.js');

db.osoblje.hasMany(db.rezervacija,{foreignKey:'osoba'});
db.termin.hasOne(db.rezervacija,{foreignKey:'termin'})
db.sala.hasMany(db.rezervacija, {foreignKey:'sala'});
db.osoblje.hasOne(db.sala,{foreignKey:'zaduzenaOsoba'});

db.connection.sync().then(function(){   // Napravi sve tabele odjednom,pa onda puni tabelu po tabelu
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


module.exports = db;