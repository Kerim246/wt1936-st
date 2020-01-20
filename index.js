const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');
const url = require('url');
const Sequelize = require('sequelize');
const connection = new Sequelize('dbwt19','root','root',{
    dialect: 'mysql',
    define: {
        timestamps: false
      },
      logging: false
});
const images = [
	'ajfelov.jpg',
	'aurora.jpg',
	'aurora2.jpg',
	'jesen.png',
	'konj.jpg',
	'more.jpg',
	'more2.jpg',
	'nebo.jpg',
	'snijeg.jpg',
	'vuk.jpg'
];
const db = {};


db.Sequelize = Sequelize;
db.connection = connection;

db.osoblje = connection.import(__dirname+'/osoblje.js');
db.termin = connection.import(__dirname+'/termin.js');

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(express.static('html'));
app.use(express.static('css'));
app.use(express.static('images'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/html/pocetna.html');
});

// app.get('/rezervacija.html',function(req,res){
//     res.send(__dirname + '/html/rezervacija.html');
// });

// app.get('/sale.html',function(req,res) {
//     res.send(__dirname + '/html/sale.html');
// });

// app.get('/unos.html',function(req,res) {
//     res.send(__dirname + '/html/unos.html');
// });

// app.get('/unos.css',function(req,res) {
//     res.send(__dirname + '/css/unos.css');
// });
// app.get('/pocetna.css',function(req,res) {
//     res.send(__dirname + '/css/pocetna.css');
// });
// app.get('/sale.css',function(req,res) {
//     res.send(__dirname + '/css/sale.css');
// });
// app.get('/rezervacija.css',function(req,res) {
//     res.send(__dirname + '/css/rezervacija.css');
// });

// app.get('/kalendar.js',function(req,err){
//     res.send(__dirname + 'kalendar.js');
// });

app.get('/dajRezervacije', function(req, res) {
	// let zauzecaJSON = fs.readFileSync('zauzeca.json')

	res.sendFile(__dirname + '/zauzeca.json');
});

function ValidnoVrijeme(pocetak, kraj) {
	if (pocetak === kraj || pocetak.length != 5 || kraj.length != 5) return false;
	var pocetakSati = parseInt(pocetak.substring(0, 2), 10);
	var krajSati = parseInt(kraj.substring(0, 2), 10);
	var pocetakMinute = parseInt(pocetak.substring(3, 5), 10);
	var krajMinute = parseInt(kraj.substring(3, 5), 10);
	var pocetakDvotacka = pocetak.substring(2, 3);
	var krajDvotacka = kraj.substring(2, 3);

	if (pocetakSati > krajSati) return false;

	if (pocetakSati === krajSati) {
		if (pocetakMinute > krajMinute) return false;
	}

	if (
		pocetakDvotacka != ':' ||
		krajDvotacka != ':' ||
		pocetakSati < 0 ||
		pocetakSati > 23 ||
		krajSati < 0 ||
		krajSati > 23 ||
		pocetakMinute < 0 ||
		pocetakMinute > 59 ||
		krajMinute < 0 ||
		krajMinute > 59
	)
		return false;

	return true;
}

function vratiSemestar(mjesec){
	if ( mjesec >= 2 && mjesec <= 6) return 'ljetni';
	if ( (mjesec >= 10 || mjesec === 1)) return 'zimski';
	
}

function daLiJeTerminSlobodan(rezervacija, rezervacije) {
	let periodicna = rezervacije.periodicna;
	let vanredna = rezervacije.vanredna;

	if (rezervacija['periodicna']) {
		for (let i = 0; i < periodicna.length; i++) {
			if (
				ValidnoVrijeme(rezervacija.pocetak, rezervacija.kraj) &&
				ValidnoVrijeme(periodicna[i].pocetak, periodicna[i].kraj) &&
				rezervacija.naziv === periodicna[i].naziv &&
				rezervacija.semestar === periodicna[i].semestar &&
				rezervacija.dan === periodicna[i].dan &&
				rezervacija.pocetak === periodicna[i].pocetak &&
				rezervacija.kraj === periodicna[i].kraj
			)
				return false;
		}      

        for (let i = 0; i < vanredna.length; i++) {
            let datum = vanredna[i].datum;
			let dan = parseInt(datum.substring(0,2));
			let mjesec = parseInt(datum.substring(3,5));
			let semestar = vratiSemestar(mjesec);

			if (
				ValidnoVrijeme(rezervacija.pocetak, rezervacija.kraj) &&
				ValidnoVrijeme(vanredna[i].pocetak, vanredna[i].kraj) &&
				rezervacija.naziv === vanredna[i].naziv &&
                rezervacija.semestar === semestar &&
				rezervacija.dan === dan &&
				rezervacija.pocetak === vanredna[i].pocetak &&
				rezervacija.kraj === vanredna[i].kraj
			)
				return false;
		}
		return true;
	}
	 else {
		for (let i = 0; i < vanredna.length; i++) {
			if (
				ValidnoVrijeme(rezervacija.pocetak, rezervacija.kraj) &&
				ValidnoVrijeme(vanredna[i].pocetak, vanredna[i].kraj) &&
				rezervacija.naziv === vanredna[i].naziv &&
				vanredna[i].datum === rezervacija.datum &&
				rezervacija.pocetak === vanredna[i].pocetak &&
				rezervacija.kraj === vanredna[i].kraj
			)
				return false;
		}
		let danVanredan = parseInt(rezervacija.datum.substring(0,2));
		let mjesecVanredan = parseInt(rezervacija.datum.substring(3,5));
		let semestarVanredan = vratiSemestar(mjesecVanredan);

		for(let j=0 ; j<periodicna.length ; j++){
			if( ValidnoVrijeme(periodicna[j].pocetak, periodicna[j].kraj) &&
				ValidnoVrijeme(rezervacija.pocetak, rezervacija.kraj) &&
				danVanredan === periodicna[j].dan && 
				periodicna[j].semestar === semestarVanredan &&
				rezervacija.pocetak === periodicna[j].pocetak &&
				rezervacija.kraj === periodicna[j].kraj &&
				rezervacija.naziv === periodicna[j].naziv				
			)
			return false;
			
		}
		return true;
	}

}

/* app.post('/kreirajRezervaciju', function(req, res) {
	let rezervacija = req.body;
	let rezervacijeJSON = fs.readFileSync('zauzeca.json');
	let rezervacije = JSON.parse(rezervacijeJSON);

	console.log(rezervacija);
	if (daLiJeTerminSlobodan(rezervacija, rezervacije)) {
		if (rezervacija['periodicna']) {
			delete rezervacija['periodicna'];
			rezervacije['periodicna'].push(rezervacija);
		} else {
			delete rezervacija['periodicna'];
			rezervacije['vanredna'].push(rezervacija);
		}
	} else {
		let datum = '';
		if (rezervacija['periodicna']) {
			let dan = rezervacija['dan'];
			datum = 'dan ' + dan + ' i semestar ' + rezervacija['semestar'];
		} else {
			datum = 'datum ' + rezervacija['datum'].split(".").join("/");
		}

		res.status(400).send({
			message:
				'“Nije moguće rezervisati salu ' +
				rezervacija['naziv'] +
				' za navedeni ' +
				datum +
				' i termin od ' +
				rezervacija['pocetak'] +
				' do ' +
				rezervacija['kraj'] +
				'!”'
		});
	}

	fs.writeFileSync('zauzeca.json', JSON.stringify(rezervacije));

	res.sendFile(__dirname + '/zauzeca.json');
}); */

 app.post('/kreirajRezervaciju', function(req, res) {
	let rezervacija = req.body;

	let redovnii = false; 

 	console.log(rezervacija); 
// 	 if (daLiJeTerminSlobodan(rezervacija, rezervacijee)) { 
	 	if (rezervacija['periodicna']) {
			delete rezervacija['periodicna']; 
//			rezervacije['periodicna'].push(rezervacija);
		 redovnii = true;

		 var listaRezervacija = [];
			
		 listaRezervacija.push(db.termin.create(
			 {	
				 redovni : redovnii,
				 dan: rezervacija.dan,
				 datum : 0,
				 semestar : rezervacija.semestar,
				 pocetak : rezervacija.pocetak,
				 kraj : rezervacija.kraj,

			 })
		 );
		} else {
			let dan = parseInt(rezervacija['datum'].split('.')[0]);
			let mjesec = parseInt(rezervacija.datum.substring(3,5));
		/* 	 console.log(mjesec);
			console.log(dan);
			console.log(rezervacija.datum);  */
			let semestaar = vratiSemestar(mjesec);
			/*  console.log(semestaar);
			console.log(rezervacija.pocetak);
			console.log(rezervacija.kraj);  */
			redovnii = false;
			
			var listaRezervacija = [];
			
			listaRezervacija.push(db.termin.create(
				{	
					redovni : redovnii,
					dan: rezervacija.dan,
					datum : rezervacija.datum,
					semestar : semestaar,
					pocetak : rezervacija.pocetak,
					kraj : rezervacija.kraj,

				})
			);

} 
 

		
		  /*  else {
			let datum = '';
			if (rezervacija['periodicna']) {
			let dan = rezervacija['dan'];
			datum = 'dan ' + dan + ' i semestar ' + rezervacija['semestar'];
		} else {
			datum = 'datum ' + rezervacija['datum'].split(".").join("/");
		}

		res.status(400).send({
			message:
				'“Nije moguće rezervisati salu ' +
				rezervacija['naziv'] +
				' za navedeni ' +
				datum +
				' i termin od ' +
				rezervacija['pocetak'] +
				' do ' +
				rezervacija['kraj'] +
				'!”'
		});
	}

	fs.writeFileSync('zauzeca.json', JSON.stringify(rezervacije));

	res.sendFile(__dirname + '/zauzeca.json');   */ 
});






app.get('/slike/:stranica', function(req, res) {
	stranica = req.params.stranica;

	res.send({
		slike: images.slice((stranica - 1) * 3, stranica * 3),
		brojStranica: Math.ceil(images.length / 3)
	});
});

app.get('/dajOsoblje',function(req,res){

	db.osoblje.findAll().then(osoblja => {res.send(osoblja); res.sendStatus(200)});
});

app.listen(8080, () => {
	console.log('Slušam http://localhost:8080 port!');
});
