// This file requires Agent.js to be loaded. 
// This file requires Network.js to be loaded. 


// Utility function to get a parameter from the URL, useful for debugging
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function change_value(id, value) {
    var object = document.getElementById(id);
    if (object == null)
        console.log('No object named: ' + id);
    else
        object.innerHTML = value;
}


function setCurrentStep(step) {
    var spans = Array.from(document.getElementsByClassName('fact'));
    spans.forEach(
        function(x) {
            var s = x.getAttribute('data-step');
            if (s == step)
                x.style.color="blue";
            else
                x.style.color = "black";

        }
    );

}


function clearBox(step, frame) {
    var canvas = Array.from(document.getElementsByClassName('annotation'));
    canvas.forEach(
        function (x) {
            var s = x.getAttribute('data-step');
            var f = x.getAttribute('data-frame');
            if (s > step && (f == frame || frame == null))
                document.body.removeChild(x);
        }
    );



}

function clearAll(step) {
    clearBox(step, null);
}

// Basic encryption techniques for Strings. 
String.prototype.isEncrypted = function() {
    return (this[0] == '{')
}


String.prototype.decrypt = function(key) {
    if (this.isEncrypted()) {
        var open_brace = this.indexOf('{');
        var close_brace = this.lastIndexOf('}');
        var enc_key = this.substring(close_brace + 1);
        // Two cases: public key first, and then symmetric key
        if (enc_key == key || (enc_key.startsWith("pK") && key.startsWith("sK") && enc_key.substring(2) == key.substring(2))) {
            var plain = this.substring(open_brace + 1, close_brace);
            return plain;

        } else
            throw 'Wrong encryption key';
    } else {
        console.log("Trying to decrypt non encrypted message")
    }
}

String.prototype.encrypt = function(key){
    var cipher =  '{' + this + '}' + key;
    return cipher;
}

// Return all the top level facts in a string of the form "X, Y, ..., Z". If X is encrypted, with inner facts, then only X is considered,
// NOT the inner facts (which prevents from using directly str.split(','))
// This function assumes the facts are well-formed. 
String.prototype.getFacts = function() {
    var index_commas = [-1];

    var ignore = 0;

    for (var i = 0; i < this.length; i++ ) {
        switch(this[i]) {
            case ',':
                if (ignore == 0)
                    index_commas.push(i)
                break;
            case '{': ignore++; break
            case '}': ignore--; break;
        }
    }

    var facts = [];
    for (var i = 0; i < index_commas.length; i++) {
        let f = this.substring(index_commas[i] + 1, index_commas[i+1]).trim();
        if (f != "")
            facts.push(f);
    }

    return facts;
}


function refresh_state(){
    for (var i = 0; i < agent_list.length; i++) {
        var agent  = agent_list[i];
        agent.refresh();
    }
    network.refresh();
    check_objective();
}



function display_agent(id) {
    var div_agent = document.getElementById('agent' + id + '_content' );

    var p_state = document.createElement('p');
    p_state.setAttribute('id', 'state' + id);
    p_state.setAttribute('class', 'state');
    p_state.innerHTML = '<b>State:</b> ';

    div_agent.appendChild(p_state);


    var p_facts = document.createElement('p')
    p_facts.setAttribute('id', 'facts' + id);
    p_facts.setAttribute('class', 'facts');
    p_facts.innerHTML = '<b>Facts: </b> ';

    div_agent.appendChild(p_facts);
}


function print_message(msg)
{
    // return msg.source + '&#8594;' + msg.destination + ":" + msg.content;
    return  msg.source + ' -> ' + msg.destination + ": " + msg.content;
}

function create_message(str)
{
    var array1 = str.split('->');
    var array2 = array1[1].split(':');
    return {source:array1[0].trim(), destination:array2[0].trim(), content:array2[1].trim()};
}


function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}
