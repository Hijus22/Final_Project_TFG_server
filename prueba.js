/**
 * Created by Hijus on 10/5/16.
 */
//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

//Setup twitter stream api
var twit = new twitter({
        consumer_key: 'RvTpLLMztv2whCp7MyyMP4tBO',
        consumer_secret: 'lZWfWbesYMfnLrACQQdKnUxgItR9HBpaXghsIWGrBgnf8LEpkU',
        access_token_key: '299960567-GokrSQcg7u7ltJiQtzeCIQyfmuqrjaa7KsEk4D25',
        access_token_secret: 'NMRSjohOVtWKovfFRiYTop5KnBSwXHEsXrgIl1QmIJbgm'
    }),
    stream = null;

//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup rotuing for app
app.use(express.static(__dirname + '/public'));

//Create web sockets connection.
io.sockets.on('connection', function (socket) {

    socket.on("start tweets", function() {

        if(stream === null) {
            //Connect to twitter stream passing in filter for entire world.
            twit.stream('statuses/filter', {'track':'zaragoza'}, function(stream) {
                stream.on('data', function(data) {
                    // Does the JSON result have track
                    if (data.text){
                        if (data.text !== null){
                            //If so then build up some nice json and send out to web sockets
                            console.log("IEEEEPA!! " + data.text + " POR " + data.id_str);
                            var outputMessage = {"message": data.text, 'name': data.id_str};
                            //var outputMessage = [data.text, data.name];

                            console.log("=>> twitter-streaming -- " + outputMessage);
                            socket.broadcast.emit("twitter-streaming", outputMessage);

                            //Send out to web sockets channel.
                            socket.emit('twitter-streaming', outputMessage);
                        }
                    } else {
                        console.log("NADA DE NAAA!!");
                    }
                    stream.on('limit', function(limitMessage) {
                        return console.log(limitMessage);
                    });

                    stream.on('warning', function(warning) {
                        return console.log(warning);
                    });

                    stream.on('disconnect', function(disconnectMessage) {
                        return console.log(disconnectMessage);
                    });
                });
            });
        }
    });

    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
    socket.emit("connected");
    console.log("connected");
});
