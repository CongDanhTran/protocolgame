/**
 * Returns the text from a HTML string
 *
 * @param {html} String The html string
 */
function stripHtml(html){
    // Create a new div element
    var temporalDivElement = document.createElement("div");
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    {
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}


class Command {
    constructor(network, attacker, agent_list) {
        this.network = network;
        this.attacker = attacker;
        this.agent_list = agent_list;
        this.step = 1;
    }

    execute_cmd(str, viewAll) {
        //update_trace(str);
        if(this.step === 1 || !viewAll)
			clearAnnotations();

        if (str.trim() == '')
            return;

        const left_par = str.indexOf('(');
        const right_par = str.lastIndexOf(')');

        if (left_par == -1 || right_par == -1) {
            throw ('Syntax error for command: ' + str);
        } else {
            var name = str.substring(0, left_par).trim();
            var args = str.substring(left_par + 1, right_par);

            switch (name) {
                case 'new_session':
                    args = args.getFacts(',');
                    let init_sender = "A"
                    if (args.length > 0)
                        init_sender = args[0].trim()
                    for (var i = 0 ; i < this.agent_list.length; i++) {
                        let agent = this.agent_list[i];
                        if (agent.id == init_sender) {
                            let init_receiver = "S"
                            if (agent.id.default_receiver != null && agent.id.default_receiver != "")
                                init_receiver = agent.id.default_receiver
                            if (args.length > 1)
                                init_receiver = args[1].trim()
                            agent.init(init_receiver, this.step);
                        }
                    }
                    break;
                case 'block':
                    this.network.blockMessage(args, this.step);
                    break;
                case 'transmit':
                    this.network.transmitMessage(args, this.step);
                    break
                case 'intercept':
                    this.network.interceptMessage(args, this.step);
                    break;
                case 'decrypt':
                    args = args.getFacts(',');
                    this.attacker.decrypt(args[0].trim(), args[1].trim(), this.step);
                    break;
                case 'encrypt':
                    args = args.split(',');
                    let list = []
                    for (let i = 0; i < args.length - 1;  i++) {
                        list.push(args[i].trim())
                    }
                    this.attacker.encryptList(list, args[args.length - 1].trim(), this.step);
                    break;
                case 'inject':
                    this.network.injectMessage(this.attacker.id, create_message(args), this.step, 'w');
                    break;
                case 'compromise':
                    this.attacker.compromise(args, this.step);
                    break;
                default:
                    throw 'Error: Unrecognised command: ' + name;
            }
            this.network.refreshStack();
            for (var i = 0; i < this.agent_list.length; i++){
                this.agent_list[i].updateContent();
            }

            setCurrentStep(this.step);

        }
    }

    santitise_commands(cmds){
        return cmds.replace(/(?:\r\n|\r|\n)/g,"");
    }

    retrieve_cmds(){
        if(window.location.hash === ""){
            window.location.assign(window.location.href+"#0"); 
        }
        var commands_raw = localStorage.getItem(window.location.href);
        if (commands_raw == null)
            return;

        var commands = this.santitise_commands(commands_raw).split(';');

        var debug = inDebugMode();

        var error_found = [];
        var error_logs = [];
        for (var i = 0; i < commands.length; i++) {
            var cmd = commands[i] = commands[i].trim();
            if (cmd == '')
                continue;
            try {
                this.execute_cmd(cmd, debug);
                this.step++;
            } catch (err) {
                error_found.push(i);
                error_logs.push(err);
                console.log(err);            
            }
        }

        let commandbox = document.getElementById("commandbox")
        if (error_found.length > 0){
            commandbox.style.color = "red";
            this.store_errors(error_found);
            change_value('log', '[Command ' + commands[error_found[0]] + ']<br> ' + error_logs[0]);
        }
        change_value('commandbox', commands.join(";\r\n"));
        // To use for contentEditable
        setEndOfContenteditable(document.getElementById('commandbox'));
        commandbox.focus();
        commandbox.selectionStart = commandbox.selectionEnd = commandbox.value.length;

        if(debug == true){
            let stepper = document.getElementById("stepper");
            stepper.removeAttribute("disabled");
            stepper.setAttribute("max", error_found.length > 0 ? error_found[0] + 1 : commands.length -1);
        }
    }

    store_cmds(str,debug) {
        // var str_no_nbsp = str.replace(/(&nbsp;)*/g,"");
        localStorage.setItem(window.location.href, str);
        localStorage.setItem(window.location.href+"_debug", debug);
        localStorage.removeItem(window.location.href+"_errors");
    }

    store_errors(errorsArray) {
        localStorage.setItem(window.location.href+"_errors", errorsArray.join(","));
    }

    store_cmds_and_reload(str, debug = false) {
        this.store_cmds(str,debug);
        location.reload();
    }

    store_cmds_and_loadSession(str, sessionId = "") {
        this.store_cmds(str,inDebugMode());
        window.location.assign(window.location.origin + window.location.pathname+"#"+sessionId);
        location.reload();
    }
    
    // execute_cmds(str)
    // {
    // 	if (str == null || str == '') {
    // 	    // console.log('Trying to execute an empty command, ignored');
    // 	}
    // 	else {
    // 	    var array = str.split(';');
    // 	    // TODO: Do we need this check? 
    // 	    if (array.length==1) {
    // 		this.execute_cmd(str.trim());
    // 	    } 
    // 	    else {
    // 		for (var i = 0; i < array.length; i++) {x3
    // 		    this.execute_cmd(array[i].trim()); 
    // 		}
    // 	    }
    // 	}
    // 	refresh_state();
    // }
}
