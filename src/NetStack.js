class NetStack {
	constructor(list) {
		this.list = document.getElementById(list);
		this.stack = {};
		this.agent_list = [];
		this.attacker = null;
		this.pastKeys = [];
	}

	registerAgents(list) {
		this.agent_list = list;
	}

	registerAttacker(e) {
		this.attacker = e;
	}

	getFreshId() {
		let max = -1;
		for (var key in this.stack) {
			if (key > max)
				max = key;
		}
		return parseInt(max) + 1;
	}

	injectMessage(source, msg, step, status, frame) {
		let i;
		console.log("injecting")
		var fid = this.getFreshId();
		var facts = msg.content.getFacts();
		for (i = 0; i < facts.length; i++) {
			var fact = this.attacker.knows(facts[i].trim());
			if (fact == null)
				throw 'Attacker does not know: ' + facts[i].trim();
		}

		this.stack[fid] = new Message(msg, step, status);
		for (i = 0; i < this.agent_list.length; i++){
			const agent = this.agent_list[i];
			if (agent.id == source.id){

				// connectDivsTo("agent" + agent.id, "bar", "blue",
				// 	      print_message(msg));
			    connectDivsTo("agent" + agent.id, "bar", "lightslategray", fid,
					"<div class='tooltip'>[" + fid + "] <span class='tooltiptext'> " + print_message(msg) + "</span></div>", step, frame);
			}
		}
	}

	addMessage (msg, step, status, frame) {
		var fid = this.getFreshId();
		this.stack[fid] = new Message(msg, step, status);
		for (var i = 0; i < this.agent_list.length; i++){
			var agent = this.agent_list[i];
			if (agent.id == msg.source){
				/// XXX
				// connectDivsTo("agent" + agent.id, "bar", "blue",
				// 	      print_message(msg));
			    connectDivsTo("agent" + agent.id, "bar", "lightslategray", fid,
					"<div class='tooltip'>[" + fid + "] <span class='tooltiptext'> " + print_message(msg) + "</span></div>", step, frame);
			}
		}
	}


	refreshStack() {
		// Remove all previous content
		while (this.list.firstChild) {
			this.list.removeChild(this.list.firstChild);
		}

		for (var key in this.stack) {
			var li = this.stack[key].createLi(key);
			this.list.appendChild(li);
		}


		var spans = Array.from(document.getElementsByClassName('message'));
		spans.forEach(
			function(x) {
				var s = x.getAttribute('data-msg-status');
				if (s.includes('w'))
					x.style.fontStyle ="italic";
				if (s.includes('i'))
					x.style.textDecoration = "underline";
				if (s.includes('b'))
					x.style.color = "red";
				if (s.includes('t'))
					x.style.color = "green";

			}
		);

		this.list.scrollTop = this.list.scrollHeight;
	}

	clearStack(step){
		for (var key in this.stack) {
			if (this.stack[key].step >= step)
				delete this.stack[key];
		}

	}



	interceptMessage(id, step, frame) {
		var new_status = '';
		switch (this.stack[id].status) {
			case 'w': new_status = 'wi'; break;
			default: throw ('Message ' + id + ' cannot be intercepted, current status: ' +
				this.stack[id].status);
		}
		this.stack[id].status = new_status;
		this.attacker.receive(this.stack[id].msg, step);
	    connectDivsBack("agent" + this.attacker.id, "bar", "lightslategray", id,
			"<div class='tooltip'>[" + id + "] <span class='tooltiptext'> " +
			print_message(this.stack[id].msg) + "</span></div>", step, frame);
		// connectDivsBack("agent" + this.attacker.id, 'bar', 'blue',
		// 		print_message(this.stack[id].msg));

	}

	transmitMessage(id, step, frame) {
		var new_status = '';
		switch (this.stack[id].status) {
			case 'w': new_status = 't'; break;
			case 'wi': new_status = 'it'; break;
			default: throw ('Message ' + id +
				' cannot be transmitted, current status: ' + this.stack[id].status);
		}
		this.stack[id].status = new_status;

		for (var i = 0; i < this.agent_list.length; i++){
			var agent = this.agent_list[i];
			if (agent.id == this.stack[id].msg.destination){
				agent.receive(this.stack[id].msg, step);
				// connectDivsBack("agent" + agent.id, "bar", "blue",
				// 		print_message(this.stack[id].msg));
			    connectDivsBack("agent" + agent.id, "bar", "lightslategray", id,
					"<div class='tooltip'>[" + id + "] <span class='tooltiptext'> " +
					print_message(this.stack[id].msg) + "</span></div>", step, frame);

			}
		}

		// connectDivsBack("agent" + this.stack[id].msg.destination,
		// 		"bar", "blue", print_message(this.stack[id].msg));
	}


	blockMessage(id, step) {
		var new_status = '';
		switch (this.stack[id].status) {
			case 'w': new_status = 'b'; break;
			case 'wi': new_status = 'ib'; break;
			default: throw ('Message ' + id + ' cannot be blocked, current status: ' + this.stack[id].status);
		}
		this.stack[id].status = new_status;
	}


	changeStatus(id, status) {
		this.stack[id].status = status;
	}


}

class Message {

	constructor(msg, step, status) {
		this.msg = msg;
		this.step = step;
		this.status = status;
	}

	createLi(key) {
		var li = document.createElement('li');
		li.setAttribute('class', 'message');
		li.setAttribute('data-step', this.step);
		li.setAttribute('data-msg-status', this.status);
		li.innerHTML = '[' + key + '] '  + print_message(this.msg) + ' /' + this.status;
		return li;

	}
}
