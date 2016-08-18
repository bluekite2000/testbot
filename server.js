var restify = require('restify');
var builder = require('botbuilder');
var hintquestion_asked = false;

//=========================================================
// Bot Setup
//=========================================================

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
// Create LUIS Dialog that points at our model and add it as the root '/' dialog for our Cortana Bot.
var dialog = new builder.LuisDialog(
    process.env.model
    || 'https://api.projectoxford.ai/luis/v1/application?id=68bcc248-1443-42b3-95bf-406b672e0ace&subscription-key=3d935e5af02c42dbb81acd62f72a7c8b&q='
);
bot.dialog('/', dialog);
//=========================================================
// Bots Dialogs
//=========================================================
dialog.on('greetings', builder.DialogAction.send('hi there what should we do?' ));

dialog.on('gamestarted', [
function (session, args, next) {
    session.send('framedetected');
    session.send('Cool! Can you show me the puzzle tray?');    
}
]);

dialog.on('helpwanted', [
function (session, args, next) {
	hintquestion_asked = true;
    session.send('Do you need a hint?');    
}
]);

dialog.on('hintneeded', [
function (session, args, next) {
	if(hintquestion_asked){
		hintquestion_asked = false;
    	session.send('showHint');    
    	session.send('Try this');    

    }
    else{
    	session.send('I am sorry I do not understand.'); 
    }
}
]);

dialog.on('hintrefused', [
function (session, args, next) {
	if(hintquestion_asked){
		hintquestion_asked = false;
    	session.send('Ok cool guy');    
    }
    else{
    	session.send('I am sorry I do not understand.'); 
    }
}
]);

dialog.on('framedetected', [
function (session, args, next) {
	session.send('piecedetected');
	var num_ent = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity;
	if (num_ent == 0){
		session.send('I am still waiting for the puzzle frame');
	}
	else{
		session.send('Awesome. Lets see all the puzzle pieces')
	}
}
]);

dialog.on('piecesdetected', [
function (session, args, next) {
	var ord = builder.EntityRecognizer.findEntity(args.entities, 'builtin.ordinal').entity;
	var ord_to_num = ord.substring(0, ord.length-2); //hack for now
	var num = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity;
	if (ord_to_num < num){
		session.send('I now see ' + ord_to_num + ' out of ' + num + ' pieces');
	}
	else{
		session.send('Ok clock is starting. Lets see how fast you can solve the puzzle');
	}	
}
]);

dialog.on('correctplacement', [
function (session, args, next) {
	var ord = builder.EntityRecognizer.findEntity(args.entities, 'builtin.ordinal').entity;
	var ord_to_num = ord.substring(0, ord.length-2);
	var num = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number').entity;
    var elapsed_time = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.time').entity;
	if (ord_to_num == num){
		session.send('Congrats. You finished the puzzle ' + elapsed_time);
	}
	else{
		session.send('Keep playing. You are almost there');
	}	
}
]);

dialog.onDefault(builder.DialogAction.send("I am sorry I do not understand."));

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});