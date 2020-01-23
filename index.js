const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');
const url = require('url');
const db = require('./db.js');
const { QueryTypes } = require('sequelize');
/* const Sequelize = require('sequelize');
const connection = new Sequelize('dbwt19','root','root',{
    dialect: 'mysql',
    define: {
        timestamps: false
      },
      logging: false
}); */
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
/* const db = {};


db.Sequelize = Sequelize;
db.connection = connection;

db.osoblje = connection.import(__dirname+'/osoblje.js');
db.termin = connection.import(__dirname+'/termin.js');
db.rezervacija = connection.import(__dirname+'/Rezervacija.js');
db.sala = connection.import(__dirname+'/sala.js'); */

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(express.static('html'));
app.use(express.static('css'));
app.use(express.static('images'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/html/pocetna.html');
});


async function vratiZauzecaIzBaze() {
	var zauzeca = {
		'vanredna': [],
		'periodicna': []
	}
	// let zauzecaJSON = fs.readFileSync('zauzeca.json')
	const upit = 'select t.redovni, t.dan,t.datum,t.semestar,t.pocetak,t.kraj,o.ime,o.prezime,o.uloga, s.naziv FROM rezervacija as r, termin as t,osoblje as o, sala as s WHERE r.termin = t.id AND r.osoba = o.id AND r.sala = s.id'
	var rezervacije = await db.connection.query(upit, {
		type: db.connection.QueryTypes.SELECT
	});

	for (var i = 0; i < rezervacije.length; i++) {
		var rezervacija = {
			"pocetak": rezervacije[i].pocetak.slice(0,5),
			"kraj": rezervacije[i].kraj.slice(0,5),
			"naziv": rezervacije[i].naziv,
			"predavac": rezervacije[i].ime + ' ' + rezervacije[i].prezime + " " + rezervacije[i].uloga
		}
		if (rezervacije[i].redovni) {
			rezervacija["dan"] = rezervacije[i].dan;
			rezervacija["semestar"] = rezervacije[i].semestar;
			zauzeca.periodicna.push(rezervacija);
		}
		else {
			rezervacija["datum"] = rezervacije[i].datum;
			zauzeca.vanredna.push(rezervacija);
		}
	}
	return zauzeca;
}
app.get('/dajRezervacije', async function (req, res) {

	var zauzeca = await vratiZauzecaIzBaze();
	res.send(zauzeca);
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

function vratiSemestar(mjesec) {
	if (mjesec >= 2 && mjesec <= 6) return 'ljetni';
	if ((mjesec >= 10 || mjesec === 1)) return 'zimski';

}

/* function daLiJeTerminSlobodan(rezervacija, rezervacije) {
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

} */

function DaLiJeTerminSlobodan(rezervacija) {
	db.rezervacija.findAll({
		include: [
			{
				model: db.osoblje,
				as: 'rezOsoba'
			},
			{
				model: db.termin,
				as: 'rezervisaniTermin'
			},
			{
				model: db.sala,
				as: 'rezervisanaSala'
			}
		]
	}).then(function (rezervacije) {
		for (let i = 0; i < rezervacije.length; i++) {
			if (rezervacije[i].termin == rezervacija.termin && rezervacije[i].sala == rezervacija.sala) {
				return false;
			}
		}
	}).catch(function (error) {
		console.log(error);
	});

	return true;
}

function DaLiJeSalaVecUpisana(sala) {
	db.sala.findAll().then(result => {
		for (let i = 0; i < result.length; i++) {
			if (result[i].naziv == sala) {
				console.log("GRESKA");

			}
		}
	});

}

function funkcija(id) {
	db.sala.create(
		{
			naziv: rezervacija.naziv,
			zaduzenaOsoba: person

		}).then(db.sala.findOne({ where: { id: Math.max(id) } })).then(sala => {
			id = sala.id;
		});
	return id;
}

app.post('/kreirajRezervaciju', async function (req, res) {
	let rezervacija = req.body;
	var zauzeca = await vratiZauzecaIzBaze();
	var redovnii;
	if(rezervacija.periodicna){
		redovnii=1;
	}
	else{
		redovnii=0;
	}

	for (var i = 0; i < zauzeca.vanredna.length; i++) {
	
		if (zauzeca.vanredna[i].pocetak.slice(0,5) == rezervacija.pocetak &&
			zauzeca.vanredna[i].kraj.slice(0,5) == rezervacija.kraj &&
			zauzeca.vanredna[i].datum == rezervacija.datum &&
			zauzeca.vanredna[i].naziv == rezervacija.naziv
		) {
			res.send({ "message": zauzeca.vanredna[i].predavac })
		}
	}

	for (var i = 0; i < zauzeca.periodicna.length; i++) {
		if (zauzeca.periodicna[i].pocetak.slice(0,5) == rezervacija.pocetak &&
			zauzeca.periodicna[i].kraj.slice(0,5) == rezervacija.kraj &&
			zauzeca.periodicna[i].dan == rezervacija.dan &&
			zauzeca.periodicna[i].semestar == rezervacija.semestar &&
			zauzeca.periodicna[i].naziv == rezervacija.naziv
		) {
			res.send({ "message": zauzeca.periodicna[i].predavac })
		}
	}

	// var podaciOsobe = rezervacija.predavac.split(' ')
	// const [osoba, created] = await db.osoblje.findOrCreate({
	// 	where: { ime: podaciOsobe[0], prezime: podaciOsobe[1], uloga: podaciOsobe[2] },
	// });

	const [sala] = await db.sala.findOrCreate({
		where: { naziv: rezervacija.naziv },
		defaults: {
			zaduzenaOsoba: rezervacija.osoba
		}
	});
	var termin=null;
	if (rezervacija.periodicna) {

		 termin= await db.termin.create({
				redovni: redovnii,
				dan: rezervacija.dan,
				semestar: rezervacija.semestar,
				pocetak: rezervacija.pocetak,
				kraj: rezervacija.kraj,
		});

		zauzeca.periodicna.push({
			redovni: redovnii,
			dan: rezervacija.dan,
			semestar: rezervacija.semestar,
			pocetak: rezervacija.pocetak.slice(0,5),
			kraj: rezervacija.kraj.slice(0,5),
			naziv:rezervacija.naziv
		})

	}
	else {

		 termin = await db.termin.create({
				redovni: redovnii,
				datum: rezervacija.datum,
				pocetak: rezervacija.pocetak,
				kraj: rezervacija.kraj,
			});

		zauzeca.vanredna.push({
			redovni: redovnii,
				datum: rezervacija.datum,
				pocetak: rezervacija.pocetak.slice(0,5),
				kraj: rezervacija.kraj.slice(0,5),
				naziv:rezervacija.naziv
		})
	}

	const [rez] = await db.rezervacija.findOrCreate({
		where: {
			termin: termin.id,
			sala: sala.id,
			osoba: rezervacija.osoba

		}
	});

	res.send(zauzeca);

});







app.get('/slike/:stranica', function (req, res) {
	stranica = req.params.stranica;

	res.send({
		slike: images.slice((stranica - 1) * 3, stranica * 3),
		brojStranica: Math.ceil(images.length / 3)
	});
});

app.get('/dajOsoblje', function (req, res) {

	db.osoblje.findAll().then(osoblja => {
		res.send(osoblja);
	});

});


app.listen(8080, () => {
	console.log('Slušam http://localhost:8080 port!');
});
