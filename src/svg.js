// Code from https://www.beyondjava.net/blog/how-to-connec]t-html-elements-with-an-arrow-using-svg/

function clearAnnotations() {
    var canvas = Array.from(document.getElementsByClassName('annotation'));
    canvas.forEach(function (x) { document.body.removeChild(x); });

    // console.log(canvas,canvas.length);
    // for(var i = 0; i < canvas.length; i++) {
    // 	console.log("Removing: " + canvas[i])
	
    // }
}

function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

function getHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight
  );
}

function createCentredSVG(x, y, radius) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 
                                       "svg");
    svg.setAttribute('id', 'svg-canvas');
    svg.setAttribute('style', 'position:absolute;top:'+ (y - radius) + 'px;left:'+ (x - radius) + 'px');
    svg.setAttribute('width', radius*2);
    svg.setAttribute('height', radius*2);
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", 
		       "xmlns:xlink", 
		       "http://www.w3.org/1999/xlink");
    document.body.appendChild(svg);
    return svg;
}

function createBoxSVG(x, y, width, height, step, frame) {
    // var svg = document.getElementById("svg-canvas");
    // if (null == svg) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 
                                       "svg");
    svg.setAttribute('class', 'annotation');
    svg.setAttribute('style', 'position:absolute;top:'+ y + 'px;left:'+ x + 'px');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", 
		       "xmlns:xlink", 
		       "http://www.w3.org/1999/xlink");
    svg.setAttribute('data-step', step);
    svg.setAttribute('data-frame', frame);
    document.body.appendChild(svg);
    return svg;
}


// function drawCircle(x, y, radius, color) {
//     var svg = createCentredSVG(x, y, radius);
//     var shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
//     shape.setAttributeNS(null, "cx", radius);
//     shape.setAttributeNS(null, "cy", radius);
//     shape.setAttributeNS(null, "r",  radius);
//     shape.setAttributeNS(null, "fill", color);
//     svg.appendChild(shape);
// }

function findAbsolutePosition(htmlElement) {
    var x = htmlElement.offsetLeft;
    var y = htmlElement.offsetTop;
    for (var x=0, y=0, el=htmlElement; 
	 el != null; 
	 el = el.offsetParent) {
        x += el.offsetLeft;
        y += el.offsetTop;
    }
    return {
	"x": x,
	"y": y
    };
}

function connectDivsTo(agent, network, color,  id, msg, step, frame) {
    connectDivs(agent, network, color,  id, msg, step, frame, false)
}



// Connect agent to  with an arrow Left to Right and a message on the bottom at a given step
function connectDivs(agent, network, color,  id, msg, step, frame, reverse) {
    agent = document.getElementById(agent);
    network = document.getElementById(network);

    let agentPos = findAbsolutePosition(agent);
    let x1 = agentPos.x;
    let y1 = agentPos.y;

    let networkPos = findAbsolutePosition(network);
    let x2 = networkPos.x;
    let y2 = networkPos.y;
    
    // We create a div for the message, the positioning will depend on the
    // positioning of the agent and network
    let box = document.createElement('div');
    // var text = document.createTextNode(msg);
    // FIXME: msg does not work in Docsy, due to div being stripped out
    box.innerHTML = '[' + id + ']';
    let box_style = 'position:absolute;padding-left:10px;padding-right:10px;font-color:red;background-color:white;font-size:14px;'

    // We assume here that only three configurations are possible:
    // 1. agents above the network (most recent approach)
    // 2. agents are on the left of the network
    // 3. some agents are on the right of the network (legacy).
    if (y1 < y2) { // agent is above of the network
        if (reverse)
            x1 += 85
        else
            x1 += 15
        y1 += agent.offsetHeight;

        if (reverse) {
            box.setAttribute('style', box_style + 'top:' + (y1 + 20) + 'px;left:' + (x1 + 20) + 'px');
            let svg = createBoxSVG(x1, y1 + 10, 20, y2 - y1 + 15, step, frame);
            drawUpArrow(svg, color);
        }
        else {
            box.setAttribute('style', box_style + 'top:' + (y1 + 20) + 'px;left:' + (x1 + 20) + 'px');
            let svg = createBoxSVG(x1, y1, 20, y2 - y1 + 5, step, frame);
            drawDownArrow(svg, color);
        }

    } else if (x1 < x2) { // agent is on the left of the network
	    x1 += agent.offsetWidth;
	    y1 += (agent.offsetHeight / 2) + 20;

	    box.setAttribute('style', 'position:absolute;padding-left:10px;padding-right:10px;font-color:red;background-color:white;font-size:14px;top:'+ (y1-10) + 'px;left:'+ (x1 + 20) + 'px');

	    // box.style.left = x1 + 20;
	    // box.style.top = y1 - 10;
	    let svg = createBoxSVG(x1, (y1 - 20), (x2 - x1), 40, step, frame);
	    if (reverse)
            drawLeftArrow(svg, color);
	    else
	        drawRightArrow(svg, color);
	
    } else {
        console.log("Legacy code: agents should normally not be positioned on the right of the network")
	    x2 += network.offsetWidth;
	    y1 += (agent.offsetHeight / 2) + 20;
	    let svg = createBoxSVG(x2, (y1 - 20), (x1 - x2), 40, step, frame);
	    drawLeftArrow(svg, color);
	    box.setAttribute('style', 'position:absolute;padding-left:10px;padding-right:10px;font-color:red;background-color:white;font-size:14px;top:'+ (y1-10) + 'px;left:'+ (x2 + 40) + 'px');
    }
    
    box.setAttribute('class', 'annotation');
    box.setAttribute('data-step', step);
    box.setAttribute('data-frame', frame);
    document.body.appendChild(box);
}

function connectDivsBack(agent, network, color,  id, msg, step, frame) {
    console.log('Here')
    connectDivs(agent, network, color,  id, msg, step, frame, true)
}



function drawDownArrow(svg, color) {
    var shape = document.createElementNS("http://www.w3.org/2000/svg",
        "path");
    var width = svg.getAttribute('width');
    var height = svg.getAttribute('height');


    var path = "M 10 " + (width / 2 ) + " v " + (height - 45);
    shape.setAttributeNS(null, "d", path);
    shape.setAttributeNS(null, "fill", "none");
    shape.setAttributeNS(null, "stroke", color);
    shape.setAttributeNS(null, "stroke-width", 3);
    // shape.setAttributeNS(null, "marker-start", "url(#markerCircle)");
    shape.setAttributeNS(null, "marker-end", "url(#markerArrow)");
    svg.appendChild(shape);
}

function drawUpArrow(svg, color) {
    var shape = document.createElementNS("http://www.w3.org/2000/svg",
        "path");
    var width = svg.getAttribute('width');
    var height = svg.getAttribute('height');


    var path = "M 10 " + (width / 2 ) + " v " + (height - 45);
    shape.setAttributeNS(null, "d", path);
    shape.setAttributeNS(null, "fill", "none");
    shape.setAttributeNS(null, "stroke", color);
    shape.setAttributeNS(null, "stroke-width", 3);
    // shape.setAttributeNS(null, "marker-start", "url(#markerCircle)");
    shape.setAttributeNS(null, "marker-start", "url(#markerBackArrow)");
    svg.appendChild(shape);
}
// Draw an arrow with a 
function drawLeftArrow(svg, color) {
    var shape = document.createElementNS("http://www.w3.org/2000/svg", 
                                         "path");
    var width = svg.getAttribute('width');
    var height = svg.getAttribute('height');


    var path = "M 5 " + (height / 2) + " h " + (width-5);
    shape.setAttributeNS(null, "d", path);
    shape.setAttributeNS(null, "fill", "none");
    shape.setAttributeNS(null, "stroke", color);
    shape.setAttributeNS(null, "stroke-width", 3);
    // shape.setAttributeNS(null, "marker-end", "url(#markerCircle)");
    shape.setAttributeNS(null, "marker-start", "url(#markerBackArrow)");
    svg.appendChild(shape);    

}

// Draw an arrow with a 
function drawRightArrow(svg, color) {
    var shape = document.createElementNS("http://www.w3.org/2000/svg", 
                                         "path");
    var width = svg.getAttribute('width');
    var height = svg.getAttribute('height');


    var path = "M 0 " + (height / 2) + " h " + (width-25);
    shape.setAttributeNS(null, "d", path);
    shape.setAttributeNS(null, "fill", "none");
    shape.setAttributeNS(null, "stroke", color);
    shape.setAttributeNS(null, "stroke-width", 3);
    // shape.setAttributeNS(null, "marker-start", "url(#markerCircle)");
    shape.setAttributeNS(null, "marker-end", "url(#markerArrow)");
    svg.appendChild(shape);    

}

// function drawCurvedLine(svg, x1, y1, x2, y2, color, tension) {
//     var shape = document.createElementNS("http://www.w3.org/2000/svg", 
//                                          "path");
//     var delta = (x2-x1)*tension;
//     var hx1=x1+delta;
//     var hy1=y1;
//     var hx2=x2-delta;
//     var hy2=y2;
//     var path = "M "  + x1 + " " + y1 + 
// 	" C " + hx1 + " " + hy1 
// 	+ " "  + hx2 + " " + hy2 
//         + " " + x2 + " " + y2;
//     shape.setAttributeNS(null, "d", path);
//     shape.setAttributeNS(null, "fill", "none");
//     shape.setAttributeNS(null, "stroke", color);
//     shape.setAttributeNS(null, "marker-end", "url(#triangle)");
//     svg.appendChild(shape);
// }
    


// function connectDivs(leftId, rightId, color, tension) {
//     var left = document.getElementById(leftId);
//     var right = document.getElementById(rightId);
    
//     var leftPos = findAbsolutePosition(left);
//     console.log(leftPos, left.offsetWidth)
//     var x1 = leftPos.x;
//     var y1 = leftPos.y;
//     x1 += left.offsetWidth;
//     y1 += (left.offsetHeight / 2);
    
//     var rightPos = findAbsolutePosition(right);
//     console.log(rightPos);
//     var x2 = rightPos.x;
//     var y2 = rightPos.y;
//     y2 += (right.offsetHeight / 2);
    
//     var width=x2-x1;
//     var height = y2-y1;
    
//     drawCircle(x1, y1, 3, color);
//     //drawCircle(x2, y2, 3, color);
//     drawCurvedLine(x1, y1, x2, y2, color, tension);
// }

// markerInitialized = false;
 
// function createTriangleMarker() {
//   if (markerInitialized)
//     return;
//   markerInitialized = true;
//   var svg = createSVG();
//   var defs = document.createElementNS('http://www.w3.org/2000/svg',
//     'defs');
//   svg.appendChild(defs);
 
//   var marker = document.createElementNS('http://www.w3.org/2000/svg',
//     'marker');
//   marker.setAttribute('id', 'triangle');
//   marker.setAttribute('viewBox', '0 0 10 10');
//   marker.setAttribute('refX', '0');
//   marker.setAttribute('refY', '5');
//   marker.setAttribute('markerUnits', 'strokeWidth');
//   marker.setAttribute('markerWidth', '10');
//   marker.setAttribute('markerHeight', '8');
//   marker.setAttribute('orient', 'auto');
//   var path = document.createElementNS('http://www.w3.org/2000/svg',
//     'path');
//   marker.appendChild(path);
//   path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
//   defs.appendChild(marker);
// }

