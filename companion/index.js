const messaging = require("messaging");
let dataToFetch = []

function sendSignal(status) {
  fetch('https://poc-api-2008b19885ca.herokuapp.com/signal/'+status,{
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin':'*'
    }
  }).then((response) =>{
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Erreur signal montre");
        }
      })
      .then((response) =>{
        console.log("Signal " + status)
      })
      .catch(function(error) {
        console.log("Erreur lors de la requête : " + error.message);
      });
}

messaging.peerSocket.onmessage = function (evt) {
 
  const data = evt.data;
  
  const gitan = JSON.parse(data)
  let myData;
  
  if(gitan.startMessage){
    sendSignal("connecté")
  }
  // Si le message indique la fin des messages
  if (gitan.endOfMessages) {
    dataToFetch = []
    sendSignal("déconnecté")
    return;
  } else {
    if(gitan.hasOwnProperty("measures")){

      dataToFetch.push(data)
    
      if(dataToFetch.length >= 256){

        const allData = dataToFetch.map((d) => {
          let newData = JSON.parse(d)
          return newData.measures
        })
        
        const myObj = {
          activity: JSON.parse(dataToFetch[0]).activity,
          allData: allData
        }
        fetch("https://poc-api-2008b19885ca.herokuapp.com/data/addData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin':'*'
          },
          body: JSON.stringify({dataset: myObj})
        }).then((response) =>{
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Réponse non valide", JSON.stringify(response.message));
          }
        })
        .then((response) =>{
          console.log("Enregistré", JSON.stringify(response))
        })
        .catch(function(error) {
          console.log("Erreur lors de la requête : " + error.message);
        });
        dataToFetch = []
      }
    }
    
  }
};