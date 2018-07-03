var http = require('http'),
    path = require('path'),
    fs = require('fs'),

//these are the only file types we will support for now
    extensions = {
        ".html" : "text/html",
        ".css" : "text/css",
        ".js" : "application/javascript",
        ".png" : "image/png",
        ".gif" : "image/gif",
        ".jpg" : "image/jpeg",
        ".json": "application/json",
    };

//helper function handles file verification
function getFile(filePath,res,page404,mimeType){
    //does the requested file exist?
    console.log({filePath, page404, mimeType});
    fs.exists(filePath,function(exists){
        //if it does...
        if(exists){
            //read the fiule, run the anonymous function
            fs.readFile(filePath,function(err,contents){
                if(!err){
                    //if there was no error
                    //send the contents with the default 200/ok header
                    res.writeHead(200,{
                        "Content-type" : mimeType,
                        "Content-Length" : contents.length
                    });
                    res.end(contents);
                } else {
                    //for our own troubleshooting
                    console.dir(err);
                };
            });
        } else {
            //if the requested file was not found
            //serve-up our custom 404 page
            fs.readFile(page404,function(err,contents){
                //if there was no error
                if(!err){
                    //send the contents with a 404/not found header
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(contents);
                } else {
                    //for our own troubleshooting
                    console.dir(err);
                };
            });
        };
    });
};

function getData(type){
    console.log('getData: '+type);
}

//a helper function to handle HTTP requests
function requestHandler(req, res) {
    var
        fileName = (path.basename(req.url)) ? req.url : '/index.html',
        ext = path.extname(fileName),
        localFolder = __dirname + '/public',
        page404 = localFolder + '/404.html';

    //call our helper function
    //pass in the path to the file we want,
    //the response object, and the 404 page path
    //in case the requestd file is not found
    getFile((localFolder + fileName),res,page404,extensions[ext]);
};

//step 2) create the server
http.createServer(requestHandler)

//step 3) listen for an HTTP request on port 8888
    .listen(8888, '127.0.0.1');

console.log('Server ready');