import Pozivi from './pozivi.js'

let Kalendar = (function() {
	var periodicna;
	var vanredna;

	function provjeriSemestar(semestar, mjesec) {
		if (semestar != 'ljetni' && semestar != 'zimski' && (mjesec <= 0 || mjesec > 12)) return false;
		if (semestar === 'ljetni' && mjesec >= 2 && mjesec <= 6) return true;
		if (semestar === 'zimski' && (mjesec >= 10 || mjesec === 1)) return true;
		return false;
	}

	function vratiSemestar(mjesec){
		if ( mjesec >= 2 && mjesec <= 6) return 'ljetni';
		if ( (mjesec >= 10 || mjesec === 0)) return 'zimski';
	}
	function formatirajDatum(date) {
		var day = date.getDate();
		var mjesec = date.getMonth()+1;
		var godina = date.getFullYear();
		if(day<10)day='0'+day;
		if(mjesec<10)mjesec='0'+mjesec;
		return day + '.' + mjesec + '.' + godina;
	  }
	function ValidanMjesec(privMjesec, mjesec) {
		if (mjesec <= 0 || mjesec > 12) return false;
		if (mjesec != 7 && mjesec != 8 && mjesec != 9 && privMjesec === mjesec) return true;
		return false;
	}

	function obojiUZelene(kalendarRef) {
		for (var i = 1; i < kalendarRef.rows.length; i++) {
			for (var j = 0; j <= 6; j++) {
				kalendarRef.rows[i].cells[j].className = 'slobodna';
			}
		}
	}
	
	function ValidnoVrijeme(pocetak, kraj) {
		if (pocetak === kraj || pocetak.length != 5 || kraj.length != 5) return false;
		var pocetakSati = parseInt(pocetak.substring(0, 2), 10);
		var krajSati = parseInt(kraj.substring(0, 2), 10);
		var pocetakMinuta = parseInt(pocetak.substring(3, 5), 10);
		var krajMinuta = parseInt(kraj.substring(3, 5), 10);
		var pocetakDvotacka = pocetak.substring(2, 3);
		var krajDvotacka = kraj.substring(2, 3);

		if (pocetakSati === krajSati) {
			if (pocetakMinute > krajMinute) return false;
		}
		if (pocetakSati > krajSati) return false;

		if (pocetakDvotacka != ':' ||krajDvotacka != ':' ||	pocetakSati < 0 || pocetakSati > 23 || 
			krajSati < 0 ||	krajSati > 23 ||pocetakMinuta < 0 ||
			pocetakMinuta > 59 ||
			krajMinuta < 0 ||
			krajMinuta > 59
		)
			return false;
		else
		return true;
	}

	function obojiStalne(kalendarRef, termin) {
		for (var i = 1; i < kalendarRef.rows.length; i++) {
			console.log("TERMIN DAN",termin.dan)
			kalendarRef.rows[i].cells[termin.dan].className = 'zauzeta';
		}
	}

	function provjeriInnerHtml(a, b) {
		var a = parseInt(a, 10);
		if (a === b) return true;
		return false;
	}

	function obojiPrivremene(kalendarRef, termin) {
		var dan = parseInt(termin.datum.substring(0, 2), 10);
		for (var i = 1; i < kalendarRef.rows.length; i++) {
			for (var j = 0; j <= 6; j++) {
				var innerHTML = kalendarRef.rows[i].cells[j].innerHTML;
				if (provjeriInnerHtml(innerHTML, dan)) 
				kalendarRef.rows[i].cells[j].className = 'zauzeta';
			}
		}
	}

	function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {

		console.log(periodicna)
		console.log(vanredna)
		obojiUZelene(kalendarRef);
		for (var i = 0; i < periodicna.length; i++) {
			if (
				ValidnoVrijeme(pocetak, kraj) &&
				ValidnoVrijeme(periodicna[i].pocetak, periodicna[i].kraj) &&
				sala === periodicna[i].naziv &&
				provjeriSemestar(periodicna[i].semestar, mjesec + 1) &&
				pocetak === periodicna[i].pocetak &&
				kraj === periodicna[i].kraj
			)
				obojiStalne(kalendarRef, periodicna[i]);
		}

		for (var i = 0; i < vanredna.length; i++) {
			var mjesecvanredna = parseInt(vanredna[i].datum.substring(3, 5), 10);
			if (
				ValidnoVrijeme(pocetak, kraj) &&
				sala === vanredna[i].naziv &&
				ValidanMjesec(mjesecvanredna, mjesec + 1) &&
				pocetak === vanredna[i].pocetak &&
				kraj === vanredna[i].kraj
			)
				obojiPrivremene(kalendarRef, vanredna[i]);
		}
	}
	

	function ucitajPodatkeImpl(per, van) {
		periodicna = per;
		vanredna = van;
	}

	function iscrtajKalendarImpl(kalendarRef, mjesec) {
		brisi(kalendarRef);
		var imeMjeseci = [
			'Januar',
			'Februar',
			'Mart',
			'April',
			'Maj',
			'Juni',
			'Juli',
			'August',
			'Septembar',
			'Oktobar',
			'Novembar',
			'Decembar'
		];
		var datum = new Date();
		var godina = datum.getFullYear();
		var brojDana = new Date(godina, mjesec + 1, 0).getDate();
		var temp = new Date(godina, mjesec).toDateString();
		var prviDan = temp.substring(0, 3);
		var imeDana = [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ];
		var danUSedmici = imeDana.indexOf(prviDan);
		kalendarRef.caption.innerHTML = imeMjeseci[mjesec];
		var ispisao = 1;
		var red = 1;
		for (var j = 1; j <= 7; j++) {
			var row = kalendarRef.insertRow(j);
			for (var i = 0; i < 7; i++) {
				var cell = row.insertCell(i);
				if ((i < danUSedmici && j === 1) || ispisao > brojDana) {
					cell.className = 'slobodna';
					cell.innerHTML = '';
				} else {
					cell.className = 'slobodna';
					cell.innerHTML = ispisao;

					cell.id = ispisao;
					ispisao++;

					cell.addEventListener('click',function(event){
						var datum  = new Date(godina,mjesec,this.id);  // id je dan
						var pocetakTermina = document.getElementById('pocetak').value;
						var krajTermina = document.getElementById('kraj').value;
					
						if(!pocetakTermina ||!krajTermina){
							alert("Unesi pocetak i kraj!")
						}
						
						else{
							var izbor = confirm("Da li zelite dodati termin?")
							if(izbor){
								var imeSale = document.getElementById('sale').value;

								var polje = document.getElementById("polje");
								var selektovanaOsoba = polje.options[polje.selectedIndex].id;

								var periodicnost = document.getElementById('periodicnost').checked;
								var rezervacija={}
								if(periodicnost){
									var dan = (datum.getDay()+6)%7;
								
									
									rezervacija['dan']=dan;
									rezervacija['semestar']=vratiSemestar(mjesec);
								}
								else{
									rezervacija['datum']=formatirajDatum(datum);
								}
								
								rezervacija['pocetak']=pocetakTermina;
								rezervacija['kraj']=krajTermina;
								rezervacija['naziv']=imeSale;
								rezervacija['predavac']='Samir Ribić';
								rezervacija['periodicna']=periodicnost;
								rezervacija['osoba']=selektovanaOsoba;

								Pozivi.kreirajRezervaciju(rezervacija,function(rez){
									if(rez.message){
										console.log("PREKLAPANJE:",rez.message)
									}
									if(rez.periodicna || rez.vanredna){
										Kalendar.ucitajPodatke(rez.periodicna, rez.vanredna);
										osvjeziSale();
									}
								},
								function(message){alert(message)})
							}

						
						}
						
					})
				}
			}
			if (ispisao > brojDana) break;
		}
	}


	return {
		obojiZauzeca: obojiZauzecaImpl,
		ucitajPodatke: ucitajPodatkeImpl,
		iscrtajKalendar: iscrtajKalendarImpl
	};
})();

var kalendar = document.getElementById('tabela');
var datum = new Date();
var mjesec = datum.getMonth();

window.onload = function() {
	this.document.querySelector('#prethodni').addEventListener('click',Prethodni)
	this.document.querySelector('#sljedeci').addEventListener('click',Sljedeci)
	Pozivi.dajRezervacije(function(rez){
		Kalendar.ucitajPodatke(rez.periodicna, rez.vanredna);
		osvjeziSale();
	})
	Kalendar.iscrtajKalendar(kalendar, mjesec);
	var pocetakTermina = document.getElementById('pocetak');
	var krajTermina = document.getElementById('kraj');

	pocetakTermina.onchange = function(event){
		if(Boolean(pocetakTermina.value) && Boolean(krajTermina.value)){
			osvjeziSale()
		}
	};


	krajTermina.onchange = function(event){
		if(Boolean(pocetakTermina.value) && Boolean(krajTermina.value)){
			osvjeziSale()
		}
	}

	selectPolje();


};

function brisi(kalendar) {
	var brojRedova = kalendar.rows.length;
	for (var i = 0; i < brojRedova - 1; i++) kalendar.deleteRow(1);
}

function Prethodni() {
	if (mjesec > 0 && mjesec <12) {
		mjesec--;
		Kalendar.iscrtajKalendar(kalendar, mjesec);
		osvjeziSale();
	}
	document.getElementById('prethodni').disabled = true;
}
function Sljedeci() {
	if (mjesec >= 0 && mjesec < 11) {
		mjesec++;
		Kalendar.iscrtajKalendar(kalendar, mjesec);
		osvjeziSale();
	}
	document.getElementById('sljedeci').disabled = true;
}

function osvjeziSale() {
	var imeSale = document.getElementById('sale').value;
	var pocetakTermina = document.getElementById('pocetak').value;
	var krajTermina = document.getElementById('kraj').value;
	Kalendar.obojiZauzeca(kalendar, mjesec, imeSale, pocetakTermina, krajTermina);
}

function selectPolje(){
	var polje = document.getElementById("polje");
	Pozivi.dajOsoblje(function(rez){
		for(let i = 0 ; i<rez.length ; i++){
		let option = document.createElement("option");
		option.id = rez[i].id;
		option.value = rez[i].ime + ' ' + rez[i].prezime;
		option.text = rez[i].ime + ' ' + rez[i].prezime;
		polje.appendChild(option);
	}
	});
}

