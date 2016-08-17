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
    || 'https://api.projectoxford.ai/luis/v1/application?id=225394b0-ada3-4069-94f9-40c105074bfd&subscription-key=c85419168d4a41c0bc83fe3710f1b8fe&q='
);
bot.dialog('/', dialog);
//=========================================================
// Bots Dialogs
//=========================================================
dialog.on('greetings', builder.DialogAction.send('hi to you too.' ));

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