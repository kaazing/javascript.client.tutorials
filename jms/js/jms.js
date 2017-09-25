
var connection;
var session;

/* UI Elements */
var logConsole, url, username, password, connect, disconnect;
var destination, message, messageSelector, subscribe, send;
var txSend, txDestination, txMessage, commit, rollback, clear, binary, binaryTransaction;
var receivedMessageCount, receivedMessageCounter = 0;
var subscriptionsTable;
var destinationCounter = 1;
var toggleJmsHeadersCb;

function clearLog() {
	while (logConsole.childNodes.length > 0) {
		logConsole.removeChild(logConsole.lastChild);
	}
}

// Log a string message
function log(message) {
	var div = document.createElement("div");
	div.className = "logMessage"
	div.innerHTML = message;
	logDiv(div);
}

function logDiv(div) {
	logConsole.appendChild(div);
	toggleJmsHeaders(); // Hide the headers if that's what the user specified
	// Make sure the last line is visible.
	logConsole.scrollTop = logConsole.scrollHeight;
	while (logConsole.childNodes.length > 20) {
		// Delete two rows to preserved the alternate background colors.
		logConsole.removeChild(logConsole.firstChild);
		logConsole.removeChild(logConsole.firstChild);
	}
}

function updateConnectionButtons(connected) {
	connect.disabled = connected;
	disconnect.disabled = !connected;
	subscribe.disabled = !connected;
	send.disabled = !connected;
	txSend.disabled = commit.disabled = rollback.disabled = !connected;
}

function createDestination(name, session) {
	if (name.indexOf("/topic/") == 0) {
		return session.createTopic(name);
	}
	else if (name.indexOf("/queue/") == 0) {
		return session.createQueue(name);
	}
	else {
		throw new Error("Destination must start with /topic/ or /queue/");
	}
}

function handleConnect() {
	log("CONNECT: " + url.value + " " + username.value);

	var jmsConnectionFactory = new JmsConnectionFactory(url.value);
	connect.disabled=true;
	//setup challenge handler
	setupSSO(jmsConnectionFactory.getWebSocketFactory());
	try {
		var connectionFuture =
			jmsConnectionFactory.createConnection(username.value, password.value, function () {
				if (!connectionFuture.exception) {
					try {
						connection = connectionFuture.getValue();
						connection.setExceptionListener(handleException);

						log("CONNECTED");

						session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
						transactedSession = connection.createSession(true, Session.AUTO_ACKNOWLEDGE);

						connection.start(function () {
							updateConnectionButtons(true);
						});
					}
					catch (e) {
						connect.disabled=false;
						handleException(e);
					}
				}
				else {
					connect.disabled=false;
					handleException(connectionFuture.exception);
				}
			});
	}
	catch (e) {
		handleException(e);
	}
}

function handleException(e) {
	log("<span class='error'>EXCEPTION: " + e + "</span>");

	if (e.type == "ConnectionDisconnectedException") {
		updateConnectionButtons(false);
	}
}

function handleDisconnect() {
	disconnect.disabled = "disabled";

	// Clear any subscriptions.
	if (document.getElementsByClassName) {
		var subscriptions = document.getElementsByClassName("unsubscribeButton");
		while (subscriptions[0]) {
			subscriptions[0].click();
		}
	} else {
		// The IE way.
		var unsubscribeButtons = subscriptionsTable.getElementsByTagName("button");
		while (unsubscribeButtons.length > 0) {
			var b = unsubscribeButtons[0];
			if (b.className == "unsubscribeButton") {
				b.click();
			}
		}
	}

	log("CLOSE");
	try {
		connection.close(function () {
			log("CONNECTION CLOSED");
			updateConnectionButtons(false);
		});
	}
	catch (e) {
		handleException(e);
	}
}

function handleSubscribe() {
	var name = destination.value;

	var destinationId = destinationCounter++;

	log("SUBSCRIBE: " + name + " <span class=\"subscriptionTag\">[#" + destinationId + "]</span>");

	var dest = createDestination(name, session);

	var consumer;

	if (messageSelector.value.length > 0) {
		consumer = session.createConsumer(dest, messageSelector.value);
	} else {
		consumer = session.createConsumer(dest);
	}

	consumer.setMessageListener(function (message) {
		handleMessage(name, destinationId, message);
	});

	// Add a row to the subscriptions table.
	//

	var tBody = subscriptionsTable.tBodies[0];

	var rowCount = tBody.rows.length;
	var row = tBody.insertRow(rowCount);

	var destinationCell = row.insertCell(0);
	destinationCell.className = "destination";
	destinationCell.appendChild(document.createTextNode(name + " "));
	var destNode = document.createElement("span");
	destNode.className = "subscriptionTag";
	destNode.innerHTML = "[#" + destinationId + "]";
	destinationCell.appendChild(destNode);

	var messageSelectorCell = row.insertCell(1);
	messageSelectorCell.className = "selector";
	messageSelectorCell.appendChild(document.createTextNode(messageSelector.value));

	var unsubscribeCell = row.insertCell(2);
	var unsubscribeButton = document.createElement("button");
	unsubscribeButton.className = "unsubscribeButton";
	unsubscribeButton.innerHTML = "Unsubscribe";
	unsubscribeButton.addEventListener('click', function (event) {
		var targ;
		if (event.target) {
			targ = event.target;
		} else {
			targ = event.srcElement; // The wonders of IE
		}
		log("UNSUBSCRIBE: " + name + " <span class=\"subscriptionTag\">[#" + destinationId + "]</span>");
		if (consumer) {
			consumer.close(null);
		}
		var rowIndex = targ.parentElement.parentElement.rowIndex
		subscriptionsTable.deleteRow(rowIndex);
	}, false);
	unsubscribeCell.appendChild(unsubscribeButton);
}

function handleMessage(destination, destinationId, message) {
	var content = "";

	if (message instanceof TextMessage) {
		content = "RECEIVED TextMessage: " + message.getText();
	}
	else if (message instanceof BytesMessage) {
		var body = [];
		message.readBytes(body);
		content = "RECEIVED BytesMessage: " + body;
	}
	else if (message instanceof MapMessage) {
		var keys = message.getMapNames();
		content = "RECEIVED MapMessage: <br/>";

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var value = message.getObject(key);
			var type;
			if (value == null) {
				type = "";
			}
			else if (value instanceof String) {
				type = "String";
			}
			else if (value instanceof Number) {
				type = "Number";
			}
			else if (value instanceof Boolean) {
				type = "Boolean";
			}
			else if (value instanceof Array) {
				type = "Array";
			}
			content += key + ": " + value;
			if (type != "") {
				content += " (" + type + ")"
			}
			content += "<br />";
		}
	}
	else {
		content = "RECEIVED UNKNOWN MESSAGE";
	}

	var div = document.createElement("div");
	div.className = "logMessage receiveMessage"
	div.innerHTML = content;

	div.appendChild(buildDestinationDiv("Subscription", destination));

	div.appendChild(buildPropertiesDiv(message));

	div.appendChild(buildJMSHeadersDiv(message, true));

	logDiv(div);

	receivedMessageCount.innerHTML = ++receivedMessageCounter;
}

var logMessageSend = function (classname, prefix, destination, messageStr, message) {
	var div = document.createElement("div");
	div.className = "logMessage " + classname
	div.innerHTML = prefix + messageStr;

	div.appendChild(buildPropertiesDiv(message));

	div.appendChild(buildJMSHeadersDiv(message, false));

	logDiv(div);
}

var buildDestinationDiv = function (label, destName, destId) {
	var destinationDiv = document.createElement("div");
	destinationDiv.className = "destination";
	var destIdStr = "";
	if (destId != undefined) {
		destIdStr = " [#" + destId + "]";
	}
	destinationDiv.innerHTML += label + ": " + destName + destIdStr;
	return destinationDiv;
}

var buildPropertiesDiv = function (message) {
	var propsDiv = document.createElement("div");
	propsDiv.className = "properties";
	var props = message.getPropertyNames();
	while (props.hasMoreElements()) {
		var propName = props.nextElement();
		var propValue = message.getStringProperty(propName);
		propsDiv.innerHTML += "Property: " + propName + "=" + propValue + "<br>";
	}
	return propsDiv;
}

var buildJMSHeadersDiv = function (message, receive) {
	var headersDiv = document.createElement("div");
	headersDiv.className = "headers";
	var deliveryModeStr;
	switch (message.getJMSDeliveryMode()) {
		case DeliveryMode.NON_PERSISTENT:
			deliveryModeStr = "NON_PERSISTENT";
			break;
		case DeliveryMode.PERSISTENT:
			deliveryModeStr = "PERSISTENT";
			break;
		default:
			deliveryModeStr = "UNKNOWN";
	}

	var jmsDestination = message.getJMSDestination();
	var destinationName = (jmsDestination instanceof Queue) ? jmsDestination.getQueueName()
		: jmsDestination.getTopicName();
	headersDiv.innerHTML += "JMSDestination: " + destinationName + "<br>";

	if (receive) {
		headersDiv.innerHTML += "JMSRedelivered: " + message.getJMSRedelivered() + "<br>";
	}

	headersDiv.innerHTML += "JMSDeliveryMode: " + message.getJMSDeliveryMode() + " (" + deliveryModeStr + ")<br>";
	headersDiv.innerHTML += "JMSPriority: " + message.getJMSPriority() + "<br>";
	headersDiv.innerHTML += "JMSMessageID: " + message.getJMSMessageID() + "<br>";
	headersDiv.innerHTML += "JMSTimestamp: " + message.getJMSTimestamp() + "<br>";
	headersDiv.innerHTML += "JMSCorrelationID: " + message.getJMSCorrelationID() + "<br>";
	headersDiv.innerHTML += "JMSType: " + message.getJMSType() + "<br>";
	headersDiv.innerHTML += "JMSReplyTo: " + message.getJMSReplyTo() + "<br>";
	return headersDiv;
}

var addProperties = function (message) {
	var i = 1;
	var propName;
	while (propName = document.getElementById("propName" + i)) {
		if (propName.value.length > 0) {
			var propValue = document.getElementById("propValue" + i);
			message.setStringProperty(propName.value, propValue.value);
		}
		i++;
	}
}

function handleSend() {
	var name = destination.value;
	var dest = createDestination(name, session);
	var producer = session.createProducer(dest);

	if (!binary.checked) {
		var textMsg = session.createTextMessage(message.value);

		addProperties(textMsg);

		try {
			var future = producer.send(textMsg, function () {
				if (future.exception) {
					handleException(future.exception);
				}
			});
		} catch (e) {
			handleException(e);
		}

		logMessageSend("sendMessage", "SEND TextMessage: ", destination.value, message.value, textMsg);
	}
	else {
		var bytesMsg = session.createBytesMessage();
		bytesMsg.writeUTF(message.value);

		addProperties(bytesMsg);

		try {
			var future = producer.send(bytesMsg, function () {
				if (future.exception) {
					handleException(future.exception);
				}
			});
		} catch (e) {
			handleException(e);
		}

		logMessageSend("sendMessage", "SEND BytesMessage: ", destination.value, message.value, bytesMsg);
	}

	producer.close();
}

function handleTxSend() {
	var name = txDestination.value;
	var dest = createDestination(name, transactedSession);
	var producer = transactedSession.createProducer(dest);

	if (!binaryTransaction.checked) {
		var textMsg = transactedSession.createTextMessage(txMessage.value);

		try {
			var future = producer.send(textMsg, function () {
				if (future.exception) {
					handleException(future.exception);
				}
			});
		} catch (e) {
			handleException(e);
		}

		logMessageSend("txSendMessage", "SEND TextMessage: ", name, txMessage.value, textMsg);
	}
	else {
		var bytesMsg = transactedSession.createBytesMessage();
		bytesMsg.writeUTF(txMessage.value);

		try {
			var future = producer.send(bytesMsg, function () {
				if (future.exception) {
					handleException(future.exception);
				}
			});
		} catch (e) {
			handleException(e);
		}

		logMessageSend("txSendMessage", "SEND BytesMessage: ", name, txMessage.value, bytesMsg);
	}

	producer.close();
}

function handleCommit() {
	log("COMMIT");

	try {
		var future = transactedSession.commit(function () {
			if (!future.exception) {
				log("TRANSACTION COMMITTED");
			}
			else {
				handleException(future.exception);
			}
		});
	} catch (e) {
		handleException(e);
	}
}

function handleRollback() {
	log("ROLLBACK");
	transactedSession.rollback(function () {
		log("TRANSACTION ROLLED BACK");
	});
}

var toggleJmsHeaders = function (event) {
	$('div.headers').toggleClass('hidden', !toggleJmsHeadersCb.checked);
}

$(document).ready(function () {

	// Initialize UI elements
	url = document.getElementById("url");

	username = document.getElementById("username");
	password = document.getElementById("password");
	connect = document.getElementById("connect");
	disconnect = document.getElementById("disconnect");

	logConsole = document.getElementById("console")
	receivedMessageCount = document.getElementById("receivedMessageCount");
	toggleJmsHeadersCb = document.getElementById("toggleJmsHeadersCb");

	destination = document.getElementById("destination");
	messageSelector = document.getElementById("messageSelector");
	message = document.getElementById("message");
	subscribe = document.getElementById("subscribe");
	send = document.getElementById("send");

	txSend = document.getElementById("txSend");
	txDestination = document.getElementById("txDestination");
	txMessage = document.getElementById("txMessage");

	commit = document.getElementById("commit");
	rollback = document.getElementById("rollback");

	clear = document.getElementById("clear");
	binary = document.getElementById("binary");
	binaryTransaction = document.getElementById("binaryTransaction");

	subscriptionsTable = document.getElementById("subscriptions");

	// construct the WebSocket location
	var locationURI = new URI("wss://demos.kaazing.com/jms");
	// default the location
	url.value = locationURI.toString();

	updateConnectionButtons(false);

	connect.onclick = handleConnect;
	disconnect.onclick = handleDisconnect;
	subscribe.onclick = handleSubscribe;
	send.onclick = handleSend;

	txSend.onclick = handleTxSend;
	commit.onclick = handleCommit;
	rollback.onclick = handleRollback;

	clear.onclick = clearLog;
	toggleJmsHeadersCb.onclick = toggleJmsHeaders;

	// initialize the disabled states
	connect.disabled = null;
	disconnect.disabled = "disabled";
});

function setupSSO(webSocketFactory) {
	/* Respond to authentication challenges with popup login dialog */
	var basicHandler = new BasicChallengeHandler();
	basicHandler.loginHandler = function (callback) {
		popupLoginDialog(callback);
	}
	webSocketFactory.setChallengeHandler(basicHandler);
}


function popupLoginDialog(callback) {
	//popup dialog to get credentials
	var popup = document.getElementById("sso_logindiv");
	popup.style.display = "block";
	var login = document.getElementById("sso_login");
	var cancel = document.getElementById("sso_cancel");

	//"OK" button was clicked, invoke callback function with credential to login
	login.onclick = function () {
		var username = document.getElementById("sso_username");
		var password = document.getElementById("sso_password");
		var credentials = new PasswordAuthentication(username.value, password.value);
		//clear user input
		username.value = "";
		password.value = "";
		//hide popup
		popup.style.display = "none";
		callback(credentials);
	}
	//"Cancel" button has been clicked, invoke callback function with null argument to cancel login
	cancel.onclick = function () {
		var username = document.getElementById("sso_username");
		var password = document.getElementById("sso_password");
		//clear user input
		username.value = "";
		password.value = "";
		//hide popup
		popup.style.display = "none";
		callback(null);
	}
}
