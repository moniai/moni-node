/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file
module.exports = function(RED) {
    "use strict";
     var urllib = require("url");
     var http = require("follow-redirects").http;
     var https = require("follow-redirects").https;
     var querystring = require("querystring");
     //var url = "https://api.moni.ai";
     var url = "http://api.moni.ai/?squery=";
     //var url = "http://google.com";

    try {
        var globalkeys = RED.settings.email || require(process.env.NODE_RED_HOME+"/../emailkeys.js");
    } catch(err) {
    }


    // The main node definition - most things happen in here
    function moni(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.topic = n.topic;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        var msg = {};
        var username = this.credentials.username;
        var password = this.credentials.password;

        msg.topic = this.topic;
        msg.payload = null;
        // respond to inputs....
        this.on('input', function (msg) {
            //node.warn("I saw a payload: "+msg.payload);
            node.status({fill:"blue",shape:"dot",text:"requesting"});
            var opts = urllib.parse(url);
            opts.method = "GET";
            var payload = null;
            if (this.credentials && this.credentials.user) {
              //payload = "userid="+username+"&password="+password+"&platform=ios";
            }
            if(msg.payload){
              url = url + querystring.escape(msg.payload);
            }
            node.warn("RequestURL:"+url);
            var responseMsg = {};
            var req = ((/^https/.test(url))?https:http).request(opts,function(res) {
              res.on('data',function(chunk) {
                  node.status({fill:"blue",shape:"ring",text:"receing"});
                  node.warn("did recive response: "+chunk.toString);
                  node.warn("has server url: "+this.serverURL);
                  //msg.payload += chunk;
                  msg.payload = this.serverURL;
              });
              res.on('end',function() {
                node.send(msg);
                node.warn("end request: "+msg.payload);
                node.status({});
              });
            });
            req.on('error',function(err) {
                msg.payload = err.toString() + " : " + url;
                msg.statusCode = err.code;
                node.warn("error: "+msg.payload +"error code:"+err.code);
                node.send(msg);
                node.status({fill:"red",shape:"ring",text:err.code});
            });

            req.end();
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("moni",moni, {
      credentials: {
         username: {type:"text"},
         password: {type:"password"}
     }
    });

}
