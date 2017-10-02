# Kaazing JavaScript AMQP Tutorial

This JavaScript app can communicate over the Web with an AMQP server via Kaazing WebSocket Gateway. The app publishes text messages to the server and listens for messages from the AMQP server over WebSocket.

## Minimum Requirements for Running or Building

* Node.js version 4.4 and higher
* NPM v 3.9.5 and higher

To update NPM to the latest version:
`
sudo npm install npm -g
`

## Steps for Building and Running the Project

* In a terminal, navigate to the folder for a tutorial, such as `javascript.client.tutorials/amqp`.
* Enter `npm install` to build the tutorial.
* Enter `node server.js` to run the included Node.js server component (server.js).
* In a browser, open the URL `http://localhost:3000/`.
 
__Note:__ To test basic authentication in the app use the URL `wss://demos.kaazing.com/amqp-auth` for location.
</br>
username: tutorial</br>
password: tutorial

## Interact with Kaazing JavaScript AMQP Client API

Documentation on how to create a Kaazing JavaScript WebSocket AMQP app from scratch can be found [here](http://kaazing.com/doc/5.0/amqp_client_docs/dev-js/o_dev_js.html).

## API Documentation

API Documentation for Kaazing JavaScript WebSocket AMQP Client library is available:

* [Kaazing AMQP](http://kaazing.com/doc/5.0/amqp_client_docs/apidoc/client/javascript/amqp/index.html)
