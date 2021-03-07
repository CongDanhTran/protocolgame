class Fact {
    constructor(str, step) {
	this.str = str;
	this.step = step;
    }
    
    createSpan() {
	var span = document.createElement('span');
	span.setAttribute('class', 'fact');
	span.setAttribute('data-step', this.step);
	span.innerHTML = this.str;
	return span;
    }

    encrypt(key) {
	return this.str.encrypt(key);
    }

    decrypt(key) {
	return this.str.decrypt(key);
    }
    
}
