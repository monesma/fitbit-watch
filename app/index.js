import { Accelerometer } from "accelerometer";
import * as document from "document";
import { me as appbit } from "appbit";
import * as messaging from "messaging";
import { me as device } from "device";
import { HeartRateSensor } from "heart-rate";
import { Gyroscope } from "gyroscope";

let list = document.getElementById("myList");
let items = list.getElementsByClassName("list-item");
let mode = "repos"
let index = 0

function addDatas(datas) {
	// Vérifier si l'application Fitbit est en cours d'exécution sur un appareil compatible
	if(appbit.permissions.granted("access_internet")) {
	  if(device.screen){
		  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
		    messaging.peerSocket.send(JSON.stringify(datas));
		  } else {
		    console.error("La connexion avec le téléphone est fermée. Impossible d'envoyer la requête POST.");
		  }
	  } else {
	  	console.log("Requète ajax non supportée")
	  }
	} else {
	  console.error("Permission d'accès à Internet non accordée.");
	}
}

function runLoop(accel, gyro, hrm){
	for (index = 0; index < accel.readings.timestamp.length; index++) {
		let actif;
	  if(mode === "repos"){
	    actif = "657c7d68daa5400d3ff897fb"
	  } else {
	    actif = "657c7d85daa5400d3ff897fc"
	  }
	  const date = new Date()
	  if(accel.x[index] !== null){
	    const datas = {
	    	measures: {ts: date.toISOString(),
		    	accel: {
		    		x: (accel.readings.x[index]/9.81),
			    	y: (accel.readings.y[index]/9.81),
			    	z: (accel.readings.z[index]/9.81)
		    	},
		    	gyro: {
		    		x: gyro.x,
		       	y: gyro.y,
		       	z: gyro.z
		    	},
		    	hrm: hrm.heartRate
		    },
	    	activity: actif
	    }
	  	addDatas(datas)
	 	}
	  if (index === 100000) {
      setTimeout(()=>{
      	return;
      }, 0);
      
    }
	}
}
if (Accelerometer && Gyroscope && HeartRateSensor) {
  const accel = new Accelerometer({ frequency: 20, batch: 256 });
	const gyro = new Gyroscope({ frequency: 100, batch: 512 });
	const hrm = new HeartRateSensor({ frequency: 1 });
	gyro.addEventListener("reading", () => {
		console.log("gyro reading")
	})
	hrm.addEventListener("reading", ()=>{
		console.log("hrm reading")
	})
  accel.addEventListener("reading", () => {
  	runLoop(accel, gyro, hrm);
	});


	document.getElementById("button-1").addEventListener("click", () => {
    document.getElementById("marche").style.fill = "#006400";
    document.getElementById("marche").text = "En marche";
    index = 0
    addDatas({endOfMessages: false, startMessage: true})
    accel.start();
    gyro.start();
    hrm.start();
	});

	document.getElementById("button-2").addEventListener("click", () => {
	    document.getElementById("marche").style.fill = "#DC143C";
	    document.getElementById("marche").text = "A l'arrêt";
	    index = 100000
	    addDatas({endOfMessages: true, startMessage: false})
    	accel.stop();
    	gyro.stop();
    	hrm.stop();
	});

	items.forEach((element, i) => {
	  let touch = element.getElementById("touch");
	  touch.onclick = function(evt) {
	    if(i === 0){
	    	items[0].text = "REPOS *"
	    	items[1].text = "ACTIF"
	    	mode = "repos"
	    	index = 100000
	    	addDatas({endOfMessages: true})
	    	accel.stop();
	    	gyro.stop();
    		hrm.stop();
	    } else {
	    	items[0].text = "REPOS"
	    	items[1].text = "ACTIF *"
	    	mode = "actif"
	    	index = 100000
	    	addDatas({endOfMessages: true})
	    	accel.stop();
	    	gyro.stop();
    		hrm.stop();
	    }
	    document.getElementById("marche").style.fill = "#DC143C";
	    document.getElementById("marche").text = "A l'arrêt";
	  };
	});
	
}