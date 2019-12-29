import Pozivi from './pozivi.js'

//<div class="grid-item"><img src="vuk.jpg" id="1" alt="vuk"></div>
function kreirajPrikazSlika(slike){
    let galerija = document.getElementById('galerija')
    galerija.innerHTML='';
    for(let i=0; i<slike.length;i++)
    {
        let div =  document.createElement('div')
        div.className='grid-item'
        let img  = document.createElement('img');
        img.setAttribute('src','/'+slike[i])
        img.setAttribute('alt',slike[i].split('.')[0])

        div.appendChild(img)
        galerija.appendChild(div)
    }   
  
}


function dohvatiSlike(stranica){

    let sljedeci = document.querySelector("#sljedeci")
    Pozivi.dajSlike(function(rez){
        kreirajPrikazSlika(rez.slike)

    if(stranica===rez.brojStranica){
        sljedeci.disabled=true;
    }
    else{
        sljedeci.disabled=false
    }
    },stranica);

}

window.onload = function(){

let trenutnaStranica=1
let prethodni = document.getElementById("prethodni")
prethodni.disabled=true;
let sljedeci = document.querySelector("#sljedeci")
dohvatiSlike(trenutnaStranica)

prethodni.addEventListener('click',function(event){
    trenutnaStranica--;
    dohvatiSlike(trenutnaStranica)
    if(trenutnaStranica===1){
        prethodni.disabled=true;
    }
  
})

sljedeci.addEventListener('click',function(event){
        trenutnaStranica++;
        if(trenutnaStranica!==1){
            prethodni.disabled=false;
        }
        dohvatiSlike(trenutnaStranica)    
})




}