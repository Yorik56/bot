//Bundles requis
const http = require('https');
const { join } = require('path');
const fsLibrary  = require('fs');

// Variables des wow
var nbrWow = 0;
var leswow = [];
var fakewow = [];
var bonjour;

//Variables Jours de stream
var live = ""; 
var contenu = fsLibrary.readFileSync('newfile.txt', 'utf-8');
var majDate;

function dayDiff(d1, d2)
{
  d1 = d1.getTime() / 86400000;
  d2 = d2.getTime() / 86400000;
  return new Number(d2 - d1).toFixed(0);
}

contenu = contenu.toString().split(';');
console.log(contenu);
var dernierSream = contenu[0];
var joursCons = contenu[1];
var record = contenu[2];
    
arrDernierStream = dernierSream.split('/');
JourDernierStream = arrDernierStream[0];
MoisDernierStream = arrDernierStream[1];
AnneeDernierStream = arrDernierStream[2];

dateFormat = JourDernierStream + " " + MoisDernierStream + " " + AnneeDernierStream;

affiche = "jour dernierSream: " + JourDernierStream + " et joursCons: "+ joursCons + " record: " + record;

var today = new Date();
var today_utc =new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
console.log("today: ");
console.log(today_utc);

let month = String(today_utc.getMonth() + 1);
let day = String(today_utc.getDate());
const year = String(today_utc.getFullYear());

console.log(month);
console.log(day);
console.log(year);

var olday = new Date(Date.UTC(AnneeDernierStream, (MoisDernierStream -1),JourDernierStream ));
console.log("olday: ");
console.log(new Date(olday));

diffDays = dayDiff(olday,new  Date(today_utc));

console.log(">" + diffDays);

if(diffDays == 0){
    // console.log("rien de nouveau..");
    majDate = day+"/"+month+"/"+year+";" + joursCons + ";" + record;
}
else if (diffDays == 1){
    joursCons++;
    if(joursCons > record){
        record = joursCons;
    }

    majDate = day+"/"+month+"/"+year+";" + joursCons + ";" + record;
}
else if (diffDays > 1){
    joursCons = 1;
    majDate = day+"/"+month+"/"+year+";" + joursCons + ";" + record;
    // console.log("majDate;jConsecutif = 1 ->" + majDate);
}



let req = http.get("https://tmi.twitch.tv/group/user/locklear/chatters", function(res) {
	let data = '',json_data;
	res.on('data', function(stream) {
		data += stream;
	});
	res.on('end', function() {
		json_data = JSON.parse(data);
		json_data.chatters.vips.forEach(function(item){
			var pos = item.indexOf('wow');
			// console.log(item);
			// console.log(pos);
			if (pos != -1){
				if (pos == (item.length - 3) || pos == 0){
					leswow.push('@'+item);
					nbrWow = nbrWow + 1;
				}
				
			}
		});
		json_data.chatters.viewers.forEach(function(item){
			var pos = item.indexOf('wow');
			if(item == 'keiichiwow'){
				fakewow.push('@' + item);
			}
			else if (pos == (item.length - 3) || pos == 0){
				leswow.push('@'+item);
				nbrWow = nbrWow + 1;				
			}
		});
		if(json_data.chatters.broadcaster.length == 0){
            live = 'lock n\'est pas connecté !';            
        }
        else{
            live = 'lock est en live !';
            // Write data in 'newfile.txt' . 
            fsLibrary.writeFileSync('newfile.txt', majDate, (error) => { 
				// In case of a error throw err exception. 
                if (error) throw err; 
            });
            // console.log("constat: " + majDate);
        }
		
	});
});
req.on('error', function(e) {
	console.log(e.message);
});


// Connexion à twitch
const tmi = require('tmi.js');
const options = {
    options: {
        debug: true,
    },
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
    identity: {
        username: 'username',
        password: 'oauth: pass',
    },
    channels: ['locklear'],
};
const client = new tmi.client(options);
// Connexion

if(nbrWow > 28 ){
	bonjour = 'En raison du succès de la secte wow, nous ne pouvous afficher tout les wow présents sur le chat, veuillez nous pardonner pour le désagrément WutFace WutFace'
}
else{
	bonjour = 'Comptage des effectifs WutFace WutFace'
}


client.on('connected', (adress, port, nbrWow) => {
	client.say('locklear', bonjour)
});
var block = false;

// Affichage du message contenant le nombre de wow sur le chat 
client.on('chat', (channel, user, message) => {
	if (message === '!comptewow'){
	    if(!block){
			if(fakewow.length){
				client.say('locklear',fakewow.join(' , ') + 'qui n\'est pas un wow ! et ' + nbrWow +' WOW sur le chat WutFace : '+ leswow.join(' , ') + '. ' );
			}
			else{
				client.say('locklear', 'Oh MEUUURDEUUUH il y à actuellement '+ nbrWow +' WOW sur le chat WutFace : '+ leswow.join(' , ') + '. ');
		 	}
		   
		    block = true;
		    setTimeout(() => {
			   block = false;
		    }, (300 * 1000));
	    }
    } 
    if (message === '!moi'){
		if(!block){
			client.say('locklear', 'moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi moi ');
			block = true;
			setTimeout(() => {
					block = false;
				}, (300 * 1000));		   
			}
	} 
	if (message === '!comptejours'){
		client.say('locklear', '@Locklear stream depuis: ' + joursCons + ' jours consécutifs. Son record personnel est de: ' + record + 'jours ! WutFace');
	} 
});

client.connect();
