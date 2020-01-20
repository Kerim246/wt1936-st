let Pozivi = (function() {
    function dajRezervacije(fnCallback){
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let rez = JSON.parse(xhttp.responseText);
                fnCallback(rez);
              
            }
        };
    
        xhttp.open('GET', 'http://localhost:8080/dajRezervacije', true);
        xhttp.send();
    }


    function kreirajRezervaciju(rezervacija, fnCallback,errorCallback){
        var xhttp = new XMLHttpRequest();
        console.log(rezervacija)
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let rez = JSON.parse(xhttp.responseText);
                fnCallback(rez);
              
            }
            if (xhttp.readyState == 4 && xhttp.status == 400) {
                let rez = JSON.parse(xhttp.responseText);
                errorCallback(rez.message);
            }
        };
    
        xhttp.open('POST', 'http://localhost:8080/kreirajRezervaciju', true);

		xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(rezervacija));



    }


    function dajSlike(fnCallback,stranica){
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                let rez = JSON.parse(xhttp.responseText);
                fnCallback(rez);
              
            }
        };
    
        xhttp.open('GET', 'http://localhost:8080/slike/'+stranica, true);
        xhttp.send();
    }

    function dajOsoblje(fnCallback){
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200){
                let rez = osoblje.findAll(xhttp.responseText);
                fnCallback(rez);
            }
        }

        xhttp.open('GET','http://localhost:8080/dajOsoblje',true);
        xhttp.send();
    }


    return {
        dajRezervacije:dajRezervacije,
        kreirajRezervaciju:kreirajRezervaciju,
        dajSlike:dajSlike,
        dajOsoblje:dajOsoblje
    }
}());

export default Pozivi;