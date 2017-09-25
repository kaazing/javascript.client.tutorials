# Kaazing JavaScript JMS Tutorial

This JavaScript application communicates with a JMS server via Kaazing WebSocket Gateway. The application publishes text messages to the server and listens for the messages from the broker over WebSocket.

## Running the demo

Open `index.html` in a browser. It doesn't need to be hosted, you can open it from the filesystem.

### If you don't have Kaazing WebSocket Gateway installed

Connect using the default URL, `wss://demos.kaazing.com/jms`, which will connect to a hosted Kaazing WebSocket Gateway for demo purposes.

To test basic authentication for the connection to the Gateway use the URL `wss://demos.kaazing.com/jms-auth`. When prompted, use the following credentials:

Username: tutorial
Password: tutorial

### If you have Kaazing WebSocket Gateway installed

Change the connect URL to that of your installed gateway. For example: `ws://localhost:8000/jms`

## Interact with Kaazing JavaScript WebSocket Client API

Documentation on how to create Kaazing JavaScript JMS applications from scratch can be found [here](http://kaazing.com/doc/5.0/jms_client_docs/dev-js/o_dev_js.html)

## API Documentation

API Documentation for Kaazing JavaScript WebSocket JMS Client library is available:

* [Javascript JMS Client API](https://kaazing.com/doc/5.0/jms_client_docs/apidoc/client/javascript/jms/index.html?JmsConnectionFactory)
