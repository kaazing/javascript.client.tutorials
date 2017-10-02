# Kaazing JavaScript JMS Tutorial

This JavaScript application communicates with a JMS server via Kaazing WebSocket Gateway. The application publishes text messages to the server and listens for the messages from the broker over WebSocket.

## Minimum Requirements for Running or Building

* Node.js version 4.4 and higher
* NPM v 3.9.5 and higher

To update NPM to the latest version:
`
sudo npm install npm -g
`

## Steps for Building and Running the Project

* In a terminal, navigate to the folder for a tutorial, such as `javascript.client.tutorials/jms`.
* Enter `npm install` to build the tutorial.
* Enter `node server.js` to run the included Node.js server component (server.js).
* In a browser, open the URL `http://localhost:3000/`.

If you want to run the demo without using npm, open `index.html` in a browser. It doesn't need to be hosted, you can open it from the filesystem.

__Note:__ To test basic authentication in the app use the URL `wss://demos.kaazing.com/jms-auth` for location.
</br>
username: tutorial</br>
password: tutorial


### If you don't have Kaazing WebSocket Gateway installed

Connect using the default URL, `wss://demos.kaazing.com/jms`, which will connect to a hosted Kaazing WebSocket Gateway for demo purposes.

### If you have Kaazing WebSocket Gateway installed

Change the connect URL to that of your installed gateway. For example: `ws://localhost:8000/jms`

## Interact with Kaazing JavaScript WebSocket Client API

Documentation on how to create Kaazing JavaScript JMS applications from scratch can be found [here](http://kaazing.com/doc/5.0/jms_client_docs/dev-js/o_dev_js.html)

## API Documentation

API Documentation for Kaazing JavaScript WebSocket JMS Client library is available:

* [Javascript JMS Client API](https://kaazing.com/doc/5.0/jms_client_docs/apidoc/client/javascript/jms/index.html?JmsConnectionFactory)
