// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const axios = require('axios');
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to your agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function briefing(agent) {
  	return axios.get(`https://rest-api-ag.azurewebsites.net/api/brief`)
    .then((result) => {
      agent.add(`Greetings. There are currently ${result.data.elevators} elevators deployed in the ${result.data.buildings} buildings of your ${result.data.customers} customers. Currently, ${result.data.disabled_elevators} elevators are not in Running Status and are being serviced. ${result.data.batteries} Batteries are deployed across ${result.data.cities} cities. On another note you currently have ${result.data.quotes} quotes awaiting processing. You also have ${result.data.leads} leads in your contact requests`);
    });
  }
  
  
  function status(agent) {
    const id = agent.parameters.number;
  	return axios.get(`https://rest-api-ag.azurewebsites.net/api/elevators/status/${id}`)
    .then((result) => {
      agent.add(result.data);
    });
  }
  
  function maintenance(agent) {
  	return axios.get(`https://rest-api-ag.azurewebsites.net/api/brief`)
    .then((result) => {
      agent.add(`Currently, ${result.data.disabled_elevators} elevators are not in Running Status and are being serviced.`);
    });
  }
  
  function quotes(agent) {
  	return axios.get(`https://rest-api-ag.azurewebsites.net/api/brief`)
    .then((result) => {
      agent.add(`You currently have ${result.data.quotes} quotes awaiting processing.`);
    });
  }
  
  function batteries(agent) {
  	return axios.get(`https://rest-api-ag.azurewebsites.net/api/brief`)
    .then((result) => {
      agent.add(`${result.data.batteries} Batteries are deployed across ${result.data.cities} cities.`);
    });
  }
    

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('getBriefing', briefing);
  intentMap.set('getMaintenance', maintenance);
  intentMap.set('getBatteries', batteries);
  intentMap.set('getQuotes', quotes);
  intentMap.set('getStatus', status);
  agent.handleRequest(intentMap);
});