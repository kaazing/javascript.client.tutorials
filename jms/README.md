# Kaazing JavaScript WebSocket JMS Tutorial

This tutorial shows how JavaScript application can communicate over the web with a JMS server via Kaazing WebSocket Gateway using Kaazing JavaScript WebSocket Client library. The application publishes text messages to the server and listens to the messages from the server over WebSocket.

## Minimum Requirements for Running or Building Kaazing JavaScript WebSocket JMS Tutorial

* Node.js version 4.4 and higher
* NPM v 3.9.5 and higher

    To update NPM to the latest version:
    `
        sudo npm install npm -g
    `

## Steps for building and running the project

* In a terminal, navigate to the folder for a tutorial, such as `javascript.client.tutorials/jms`.
* Enter `npm install` to build the tutorial.
* Enter `node server.js` to run the included Node.js server component (server.js).
* In a browser, open the URL `http://localhost:3000/`.

__Note:__ To test basic authentication for WebSocket connection in demo app use URL -  wss://sandbox.kaazing.net/jms-auth for location.

## Interact with Kaazing JavaScript WebSocket Client API

Checklist how to create Kaazing JavaScript WebSocket JMS application from scratch, to be able to send and receive messages over WebSocket, can be found [here] (http://kaazing.com/doc/5.0/jms_client_docs/dev-js/o_dev_js.html)

## API Documentation

API Documentation for Kaazing JavaScript WebSocket JMS Client library is available:

* [Javascript JMS Client API](https://kaazing.com/doc/jms/4.0/apidoc/client/javascript/jms/index.html?JmsConnectionFactory)
