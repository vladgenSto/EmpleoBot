// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const firebase = require('firebase-admin');

const request = require("request");
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');


const config = {
    'apiKey': 'AIzaSyDpiuPhUjJJ3t2Dgmtp3_RuKbPi4iQ8Hwo',
    'authDomain': 'hackathonbot-217411.firebaseapp.com',
    'databaseURL': 'https://hackathonbot-217411.firebaseio.com',
    'storageBucket': 'gs://hackathonbot-217411.appspot.com'
};

firebase.initializeApp(config);

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function presentacion(agent) {
    return response.json({
        'payload':{
            'telegram':{
                'text':'Bienvenido a EmpleoBot🤖.\n Esta hecho para ayudar a empresas a encontrar a empleados y también a personas que buscan trabajo.\n El bot ofrece las siguientes opciones: - 📝Listar: muestra un menu para elegir que quiere listar el usuario.\n - 🆕Registro usuario: solicita los datos personales de una persona para inscribirla en el sistema del bot.\n - 💼Crear oferta: Permite a las empresas crear ofertas en el bot.',
                'reply_markup':{
                    'inline_keyboard':[[
                        {
                            'text': '📝Listar',
                            'callback_data': 'listar'
                        },
                        {
                            'text': '🆕Registro usuario',
                            'callback_data': 'registro'
                        }],
                        [
                        {
                            'text': '💼Crear oferta',
                            'callback_data': 'Crear oferta'
                        }
                        ]]
                }
            }
        }
    });
  }
 
  function listar(agent){
     return response.json({
         "payload": {
             "telegram": {
                 "text": "Elige que quieres listar:\n - 🏢Empresas: lista las empresas que hay en el sistema.\n - 👨👩Usuarios: lista los usuarios que hay registrados.\n - 🔍Ofertas: muestra todas las ofertas disponibles.",
                 "reply_markup": {
                     "inline_keyboard": [[{
                         "text": "🏢Empresas",
                         "callback_data": "Listar Empresas"
                     },
                     {
                         "text": "👨👩Usuarios",
                         "callback_data": "Listar Usuarios"
                     }
                     ],
                     [{
                         "text": "🔍Ofertas",
                         "callback_data": "Menu ofertas"
                     },
                     {
                         "text": "🔍Solicitudes",
                         "callback_data": "Listar solicitudes"
                     }
                     ]]
                 }
             }
         }
     });
   }
   
   function ofertas(agent){
       return response.json({
           'payload':{
               'telegram':{
                   'text':'Opciones para listar las ofertas:\n-Todas las ofertas: lista todas las ofertas publicadas.\nOfertas empresa: Lista las ofertas de una empresa en concreto.\nOfertas por palabra clave: Lista las ofertas por una o varias palabras clave',
                   'reply_markup':{
                       "inline_keyboard": [[{
                         "text": "🏢Todas",
                         "callback_data": "Obtener todas las ofertas"
                     }
                     
                     ],[
                         {
                         "text": "👨👩Ofertas Empresas",
                         "callback_data": "Botones empresas"
                     }
                         ],
                     [{
                         "text": "🔍Ofertas por palabras clave",
                         "callback_data": "Dame una palabra clave"
                     }
                     ]]
                   }
                   
               }
           }
       });
   }
   function botonesEmpresas(agent){
       agent.add('Elige una empresa');
       return firebase.database().ref('Empresas').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var name = data.val().Nombre;
                agent.add(new Card({
                    'title':'🙌Eligeme',
                    'buttonText': name,
                    'buttonUrl': name
                }));
                
            });
            
        });
       
   }
   
   function ofertasPorEmpresa(agent){
       agent.add('Elige una empresa');
      var empresa = agent.parameters['Empresa'];
      
       return firebase.database().ref('Ofertas').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var emp = data.val().Empresa;
                var des = data.val().Descripcion;
                if(emp.toLowerCase().includes(empresa.toLowerCase())){
                    agent.add(new Card({
                    'title': emp,
                    'text': des,
                    'buttonText': '😋Me interesa',
                    'buttonUrl': 'Inscribir'
                }));    
                }
                
                 
            });
            
        });
   }
   
   function ofertasPorPalabrasClave(agent){
      var palabra = agent.parameters['PalabrasClave'];
      
       return firebase.database().ref('Ofertas').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var emp = data.val().Empresa;
                var des = data.val().Descripcion;
                var claves = data.val().Palabras_clave;
                if(claves.toLowerCase().indexOf(palabra.toLowerCase()) != -1){
                    agent.add(new Card({
                    'title': emp,
                    'text': des,
                    'buttonText': '😋Me interesa',
                    'buttonUrl': 'Inscribir'
                }));    
                }
                
                 
            });
            
        });
   }


  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
   
   // AÑADIR IMAGEN A CADA JURADO O PONER UN ENLACE A SU RED SOCAIL...
   function empresas(agent){
       agent.add('Estas son las empresas:');
       return firebase.database().ref('Empresas').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var name = data.val().Nombre;
                var des = data.val().Descripcion;
                agent.add(new Card({
                    'title': name,
                    'text':des
                }));
                
            });
            
        });
   }
   function todasOfertas(agent){
       agent.add('Estas son las ofertas:');
       return firebase.database().ref('Ofertas').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var emp = data.val().Empresa;
                var des = data.val().Descripcion;
                agent.add(new Card({
                    'title': emp,
                    'text': des,
                    'buttonText': '😋Me interesa',
                    'buttonUrl': 'Inscribir'
                }));
                 
            });
            
        });
   }
   function todosUsuarios(agent){
       agent.add('Estas son las usuarios:');
       
       return firebase.database().ref('Usuarios').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var name = data.val().Nombre;
                var skills = data.val().Habilidades;
                
                agent.add(new Card({
                    'title':name,
                    'text':'Hablididades: '+skills
                }));
            });
            
        });
   }
   
   function crearOferta(agent){
       //var nombre = request.body.message.chat.first_name;
       var nombre = 'Cuatroochenta - 480';
       var descripcion = agent.getContext('crearoferta-followup')['parameters']['description'];
       var palabras_clave = agent.parameters['keywords'];
       var dbRef=firebase.database().ref('ofertas');
       return dbRef.once('value').then(function(snapshot){
           var id = Object.keys(snapshot).length;
           firebase.database().ref('Ofertas/' + 'o'+(id+1)).set({
           'Empresa': nombre,
           'Descripcion': descripcion,
           'Palabras_clave': palabras_clave
            });
            agent.add('Tu oferta se ha creado con exito!');
            
            
       });
       
       
   }
   
   function inscribirse(agent){
       var username = 'Albert Jimenez';
       var number = '627 345 198';
       var email = 'albert_jimenez@gmail.com';
       var skills = 'Java, Python, NodeJS, HTML, CSS, PHP, Django';
       var offerDescription = 'Se busca programador de Aplicaciones Android en Kotlin.';
       firebase.database().ref('SolicitudEmpresa/se01').set({
           'Interesado': username,
           'Telefono': number,
           'Correo': email,
           'Habilidades': skills,
           'OfertaSolicitada': offerDescription
       });
       agent.add('Solicitud enviada');
   }
   
   function listarSolicitudes(agent){
       agent.add('Actualmente tienes estas solicitudes:');
       return firebase.database().ref('SolicitudEmpresa').once('value').then(function(snapshot){
           snapshot.forEach(function(data){
               var name = data.val().Interesado;
               var email = data.val().Correo;
               var tel = data.val().Telefono;
               var habilidades = data.val().Habilidades;
               var oferta= data.val().OfertaSolicitada;
               agent.add(name+'\nContacto:\nTeléfono: '+tel+' e-mail: '+email+'\nHabilidades: '+habilidades+'\nOferta solicitada: '+oferta);
           });
           
       });
   }
    
  let intentMap = new Map();
  intentMap.set('Presentacion', presentacion);
  intentMap.set('Listar', listar);
  intentMap.set('Listar Empresas',empresas);
  intentMap.set('Listar Ofertas',todasOfertas);
  intentMap.set('Listar Usuarios',todosUsuarios);
  intentMap.set('Ofertas',ofertas);
  intentMap.set('Botones empresas',botonesEmpresas);
  intentMap.set('Ofertas Empresas',ofertasPorEmpresa);
  intentMap.set('Oferas Palabras Clave',ofertasPorPalabrasClave);
  intentMap.set('Crear oferta - getDescription', crearOferta);
  intentMap.set('Realizar Solicitud Empresa', inscribirse);
  intentMap.set('Listar solicitudes', listarSolicitudes);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});