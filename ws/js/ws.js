function setupSSO(factory) {
	/* Respond to authentication challenges with popup login dialog */
	var basicHandler = new BasicChallengeHandler();
	basicHandler.loginHandler = function (callback) {
		popupLoginDialog(callback);
	}
	factory.setChallengeHandler(basicHandler);
}

function popupLoginDialog(callback) {

	//popup dialog to get credentials
	var popup = document.getElementById("logindiv");
	$("#logindiv").slideToggle(300);
	var login = document.getElementById("login");
	var cancel = document.getElementById("cancel");

	$('#username').focus();

	// As a convenience, connect when the user presses Enter
	// in the location field.
	$('#password').keypress(function (e) {
		if (e.keyCode == 13) {
			e.stopImmediatePropagation(); // Prevent firing twice.
			login.click();
		}
	});

	//"OK" button was clicked, invoke callback function with credential to login
	login.onclick = function () {
		var username = document.getElementById("username");
		var password = document.getElementById("password");
		var credentials = new PasswordAuthentication(username.value, password.value);
		//clear user input
		username.value = "";
		password.value = "";
		//hide popup
		$("#logindiv").slideToggle(100);
		callback(credentials);
	}

	//"Cancel" button has been clicked, invoke callback function with null argument to cancel login
	cancel.onclick = function () {
		var username = document.getElementById("username");
		var password = document.getElementById("password");
		//clear user input
		username.value = "";
		password.value = "";
		//hide popup
		$("#logindiv").slideToggle(100);
		callback(null);
	}
}

function setup() {

	var locationURI = new URI("ws://sandbox.kaazing.net/echo");
	var websocket;

	var consoleLog = document.getElementById("consoleLog");
	var clear = document.getElementById("clear");
	var wsurl = document.getElementById("wsurl");
	var message = document.getElementById("message");
	var connect = document.getElementById("connect");
	var sendText = document.getElementById("sendText");
	var sendBlob = document.getElementById("sendBlob");
	var sendArrayBuffer = document.getElementById("sendArrayBuffer");
	var sendByteBuffer = document.getElementById("sendByteBuffer");
	var close = document.getElementById("close");

	// Enable or disable controls based on whether or not we are connected.
	// For example, disable the Connect button if we're connected.
	var setFormState = function (connected) {
		wsurl.disabled = connected;
		connect.disabled = connected;
		close.disabled = !connected;
		message.disabled = !connected;
		sendText.disabled = !connected;
		sendBlob.disabled = !connected;
		sendArrayBuffer.disabled = !connected || (typeof(Uint8Array) === "undefined");
		sendByteBuffer.disabled = !connected;
	}

	// As a convenience, connect when the user presses Enter
	// if no fields have focus, and we're not currently connected.
	$(window).keypress(function (e) {
		if (e.keyCode == 13) {
			if (e.target.nodeName == "BODY" && wsurl.disabled == false) {
				doConnect();
			}
		}
	});

	// As a convenience, connect when the user presses Enter
	// in the location field.
	$('#wsurl').keypress(function (e) {
		if (e.keyCode == 13) {
			doConnect();
		}
	});

	// As a convenience, send as text when the user presses Enter
	// in the message field.
	$('#message').keypress(function (e) {
		if (e.keyCode == 13) {
			doSendText();
		}
	});

	wsurl.value = locationURI.toString();
	setFormState(false);
	var log = function (message) {
		var pre = document.createElement("pre");
		pre.style.wordWrap = "break-word";
		pre.innerHTML = message;
		consoleLog.appendChild(pre);
		consoleLog.scrollTop = consoleLog.scrollHeight;
		while (consoleLog.childNodes.length > 25) {
			consoleLog.removeChild(consoleLog.firstChild);
		}
	};

	var logResponse = function (message) {
		log("<span style='color:blue'>" + message + "</span>");
	}

	// Takes a string and Returns an array of bytes decoded as UTF8
	var getBytes = function (str) {
		var buf = new ByteBuffer();
		Charset.UTF8.encode(str, buf);
		buf.flip();
		return buf.array;
	}

	var doSendText = function () {
		try {
			var text = message.value;
			log("SEND TEXT: " + text);
			websocket.send(text);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	};

	sendText.onclick = doSendText;

	sendBlob.onclick = function () {
		try {
			// BlobUtils is implemented for all supported platforms
			var blob = BlobUtils.fromString(message.value, "transparent");
			log("SEND BLOB: " + blob);
			websocket.binaryType = "blob";
			websocket.send(blob);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	}

	sendArrayBuffer.onclick = function () {
		try {
			// ArrayBuffer is only supported on modern browsers
			var bytes = getBytes(message.value);
			var array = new Uint8Array(bytes);
			log("SEND ARRAY BUFFER: " + array.buffer);
			websocket.binaryType = "arraybuffer";
			websocket.send(array.buffer);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	}

	sendByteBuffer.onclick = function () {
		try {
			// Convert ByteBuffer to
			var buf = new ByteBuffer();
			buf.putString(message.value, Charset.UTF8);
			buf.flip();

			log("SEND BYTE BUFFER: " + buf);
			websocket.binaryType = "bytebuffer";
			websocket.send(buf);
		} catch (e) {
			log("EXCEPTION: " + e);
		}
	}

	var doConnect = function () {
		log("CONNECT: " + wsurl.value);
		connect.disabled=true;
		try {
			var factory = new WebSocketFactory();
			setupSSO(factory);
			websocket = factory.createWebSocket(wsurl.value);
			//websocket = new WebSocket(wsurl.value);

			websocket.onopen = function (evt) {
				log("CONNECTED");
				setFormState(true);
				message.focus();
			}

			websocket.onmessage = function (evt) {
				var data = evt.data;
				if (typeof(data) == "string") {
					//text
					logResponse("RECEIVED TEXT: " + data);
				}
				else if (data.constructor == ByteBuffer) {
					//bytebuffer
					logResponse("RECEIVED BYTE BUFFER: " + data);
				}
				else if (data.byteLength) {
					//arraybuffer
					var u = new Uint8Array(data);
					var bytes = [];
					for (var i = 0; i < u.byteLength; i++) {
						bytes.push(u[i]);
					}
					logResponse("RECEIVED ARRAY BUFFER: " + bytes);
				}
				else if (data.size) {
					//blob
					var cb = function (result) {
						logResponse("RECEIVED BLOB: " + result);
					};
					BlobUtils.asNumberArray(cb, data);
				}
				else {
					logResponse("RECEIVED UNKNOWN TYPE: " + data);
				}
			}

			websocket.onclose = function (evt) {
				log("CLOSED: (" + evt.code + ") " + evt.reason);
				setFormState(false);
			}

		}
		catch (e) {
			connect.disabled=false;
			log("EXCEPTION: " + e);
			setFormState(true);
		}
	};

	connect.onclick = doConnect;

	close.onclick = function () {
		log("CLOSE");
		websocket.close();
	};

	clear.onclick = function () {
		while (consoleLog.childNodes.length > 0) {
			consoleLog.removeChild(consoleLog.lastChild);
		}
	};

}
$(document).ready(function () {
	setup();
});
