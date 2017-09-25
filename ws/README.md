# Kaazing JavaScript WebSocket Tutorial

This JavaScript application communicates with an `Echo` service hosted by Kaazing WebSocket Gateway. The application sends text and listens for messages with the `Echo` service over WebSocket.

## Minimum Requirements for Running or Building

* Node.js version 4.4 and higher
* NPM v 3.9.5 and higher

    To update NPM to the latest version:
    `
        sudo npm install npm -g
    `

## Steps for building and running the project

* In a terminal, navigate to the folder for a tutorial, such as `javascript.client.tutorials/ws`.
* Enter `npm install` to build the tutorial.
* Enter `node server.js` to run the included Node.js server component (server.js).
* In a browser, open the URL `http://localhost:3000/`.

__Note:__ To test basic authentication for the Gateway connection use the URL `wss://demos.kaazing.com/echo-auth` for location. </br>
username: tutorial </br>
password: tutorial 


## Interact with Kaazing JavaScript WebSocket Client API

Documentation on how to create Kaazing JavaScript WebSocket apps from scratch can be found [here](http://kaazing.com/doc/5.0/websocket_client_docs/dev-js/o_dev_js.html)

## API Documentation

API Documentation for Kaazing JavaScript WebSocket Client library is available:

* [Javascript Websocket Client API](http://kaazing.com/doc/5.0/websocket_client_docs/apidoc/client/javascript/gateway/index.html)

