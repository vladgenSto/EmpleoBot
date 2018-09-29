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
                   'text':'Opciones para listar las ofertas:\n-Todas las ofertas: lista todas las ofertas publicadas.\nOfertas empresa: Lista las ofertas de una empresa en concreto.\nOfertas por palabra clave: Lista las ofertas por ...',
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
                         "callback_data": "Palabras clave"
                     }
                     ]]
                   }
                   
               }
           }
       });
   }
   function botonesEmpresas(agent){
       return firebase.database().ref('Empresas').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var name = data.val().Nombre;
                agent.add(new Card({
                    'title':'Eligeme',
                    'buttonText': name,
                    'buttonUrl': name
                }));
                
            });
            
        });
       
   }
   
   function ofertasPorEmpresa(agent){
      var empresa = agent.parameters['Empresa'];
      
       return firebase.database().ref('Ofertas').once('value').then(function(snapshot) {
            snapshot.forEach(function(data){
                var emp = data.val().Empresa;
                var des = data.val().Descripcion;
                if(emp.toLowerCase().includes(empresa.toLowerCase())){
                    agent.add(new Card({
                    'title': emp,
                    'text': des,
                    'buttonText': 'Me interesa',
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
                    'buttonText': 'Me interesa',
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
 //------------------------------------------------------------------------------------
 
 
   function organizadores(agent){
       agent.add('Buscando en la base de datos...');
       return firebase.database().ref('organizadores').once('value').then(function(snapshot){
           snapshot.forEach(function(data){
               var name = data.val().name;
               var img = data.val().img;
               var url = data.val().url;
               agent.add(new Card({
    				title: name,
    				text: url,
    				imageUrl: img
			    }));
           });
       });
   }
   
   function retos(agent) {
       agent.add('Estos son los retos de este año');
       return firebase.database().ref('retos').once('value').then(function(snapshot){
           snapshot.forEach(function(reto){
               var name = reto.val().name;
               var img = reto.val().img;
               agent.add(new Card({
                'title':name,
                'imageUrl':img
               }));
               });
          
       });
   }
   
   function eventos(agent){
       return response.json({
           'payload':{
            'telegram':{
                'text':'Bienvenido al Bot de Hackathon.\n Puedes preguntarme por la siguiente información:\n - \*Listar:\* muestra un menu para elegir que quiere listar el usuario.\n - \*Registro:\* solicita los datos para inscribirse en el evento.\n - \*Info evento:\* muestra un menu para ver los detalles del evento.',
                'reply_markup':{
                    'inline_keyboard':[[
                        {
                            'text': 'Todos los eventos',
                            'callback_data': 'todos los eventos'
                        }],
                        [
                        {
                            'text': 'Elegir dia',
                            'callback_data': 'elegir dia'
                        }
                        ]]
                }
            }
        }
       })
   }
   
   function todos_eventos(agent){
       agent.add('Buscando en la base de datos...');
       return firebase.database().ref('horarios').once('value').then(function(snapshot){
           snapshot.forEach(function(day){
               var dia = day.key;
               day.forEach(function(event){
                   var hora = event.val().hora;
                   var concepto = event.val().concepto;
                   var lugar = event.val().lugar;
                   agent.add(new Card({
                       title: concepto,
                       text: 'El '+dia+' a las '+hora+' en '+lugar
                   }));
               });
           });
       });
   }
   
   function elegir_dia(agent) {
       return response.json({
           'payload':{
            'telegram':{
                'text':'Escoge día:',
                'reply_markup':{
                    'inline_keyboard':[[
                        {
                            'text': 'Viernes',
                            'callback_data': 'viernes'
                        }],
                        [
                        {
                            'text': 'Sábado',
                            'callback_data': 'sabado'
                        }],
                        [{
                            'text': 'Domingo',
                            'callback_data': 'domingo'
                        }]
                        ]
                }
            }
        }
       })
   }
   
   function eventosDia(agent){
       agent.add('Buscando en la base de datos');
       var dia = agent.parameters['day'];
       return firebase.database().ref('horarios/' + dia).once('value').then(function(snapshot){
           snapshot.forEach(function(event){
               var hora = event.val().hora;
                   var concepto = event.val().concepto;
                   var lugar = event.val().lugar;
                   agent.add(new Card({
                       title: concepto,
                       text: 'A las '+hora+' en '+lugar
                   }));
           });
       });
   }
   
   function registro(agent) {
       agent.add(`Elige la categoria en la que quieres participar.`); 
       agent.add(new Suggestion('Infantil'));
       agent.add(new Suggestion('Adulto'));
       /*var nombre = agent.getContext('registro-followup')['parameters']['given-name'];
       var correo = agent.parameters['email'];
       agent.add('Gracias por tus datos ' + nombre + ' con correo ' + correo);
       firebase.database().ref('users/' + nombre).set({
           username: nombre,
           email: correo
       });
       agent.add('Hecho!');*/
   }
   
   function info(agent) {
       return response.json({
           "payload": {
             "telegram": {
                 "text": "Hackathon es un evento para programadores. Puedes averiguar las siguientes cosas del evento:\n - \*Localización:\* muestra la ubicación del evento.\n - \*Fecha:\* muestra la fecha del evento.\n - \*Página:\* enlace a la página de Hackathon.",
                 "reply_markup": {
                     "inline_keyboard": [[{
                         "text": "Localización",
                         "callback_data": "ubicacion"
                     },
                     {
                         "text": "Fecha",
                         "callback_data": "fecha"
                     }
                     ],
                     [{
                         "text": "Página",
                         "callback_data": "pagina"
                     }
                     ]]
                 }
             }
         }
       })
   }
   
   function ubicacion(agent){
       var options = { 
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            qs: { 
                address: 'Pabellón polideportivo, Camino de la Enramada, 12071 Castellón de la Plana, España',
                key: 'AIzaSyBLrP-J3_TpICAzBZjlgGGIn24gGV8qURM' // Need to get API Key From Google
              },
            };
        
 
            request(options, function (error, response, body) {
              if (error) throw new Error(error);
              return response.json({
                   'fulfillmentMessages':body
               });
            });
       
   }


  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Presentacion', presentacion);
  intentMap.set('Listar', listar);
  intentMap.set('Listar Empresas',empresas);
  intentMap.set('Listar Ofertas',todasOfertas);
  intentMap.set('Listar Usuarios',todosUsuarios);
  intentMap.set('Ofertas',ofertas);
  intentMap.set('Botones empresas',botonesEmpresas);
  intentMap.set('Ofertas Empresas',ofertasPorEmpresa);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});