'use strict';
{

    const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
    //const GITHUB_ACCESS_TOKEN = process.argv[2];
    const getOptions = {
        'method': 'get',
        'contentType': 'application/json',
        'headers': {
          'Authorization': 'Bearer ' + GITHUB_ACCESS_TOKEN,
          'User-Agent': 'request'
        }
    };
    const express =require('express');
    const app = express();
    const http = require('http').Server(app);
    const io = require('socket.io')(http);
    const PORT = process.env.PORT || 7000;
    const fetch = require('node-fetch');

    let code;
    let lang;

    function getPublicGists() {
        const url = 'https://api.github.com/gists/public?page=' + Math.floor(Math.random() * 10) +'&per_page=100';
        fetch(url, getOptions)
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                let filename = '';
                let selectedGists = [];
                let langList = [];
                let language;

                for (let i = 0; i < json.length; i++) {
                    let gists = json[i].files;
                    for (let value in gists) {
                        filename = value;
                    }
                    language = json[i].files[filename].language;

                    if ((language !== 'Markdown') && (language !== 'null') && (language !== 'Text') && (language !== 'JSON') && (language !== 'Jupyter Notebook')&& (language !== 'TeX') && (language !== undefined) && (language !== null)){
                        selectedGists.push(json[i].files[filename].raw_url);
                        langList.push(language);
                    }
                }
                let index = Math.floor(Math.random() * selectedGists.length);
                lang = langList[index].toLowerCase();
                return selectedGists[index];
            })
            .then(function(rawUrl) {
                fetch(rawUrl)
                    .then((response) => response.text())
                    .then((text) => code = text);
            });
    }

    app.use(express.static(__dirname + '/public'));
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/index.html');
    });


    io.on('connection', function(socket) {
        //console.log('connected');
        getPublicGists();
        setTimeout(function() {
            socket.emit('getCode', code);
            socket.emit('getLang', lang);
        }, 3500);
        
    });

    http.listen(PORT, function() {
        console.log('server listening. Port:' + PORT);
    });
}