var restify = require('restify');
var builder = require('botbuilder');

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
dialog.on('gamestarted', builder.DialogAction.send('framedetected' ));
dialog.on('helpwanted', builder.DialogAction.send('do you need a hint?' ));
dialog.on('hintneeded', builder.DialogAction.send('showHint' ));
dialog.on('hintrefused', builder.DialogAction.send('Ok cool guy' ));

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