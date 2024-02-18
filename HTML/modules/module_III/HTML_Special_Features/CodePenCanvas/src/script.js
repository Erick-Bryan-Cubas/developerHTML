let c = document.getElementById('canvas');
let ctx = c.getContext("2d");
let fps = 60;
let debug = false;
let dnaRadius = 5;
let amount = 1000;
let oldAmount = amount;
let dnaLineLength = 150;
let minScreenSize = 450;
console.log('%cIf you wanna change some vars, try changing "dnaRadius", "amount" or "dnaLineLength"! They\'re pretty cool!',
    'color: white;text-shadow:rgba(255,255,255,0.2) 0 0 8px;font-size: 24px; background: #000;background-image:radial-gradient(ellipse at top right, rgba(255, 69, 0, 0.2), transparent),radial-gradient(ellipse at bottom left, rgba(102, 51, 153, 0.2), transparent); padding: 48px 16px; border-left: solid 5px rebeccapurple;border-right: solid 5px orangered;');
console.log('%cYou need to move your mouse for all of these to work :D', 'font-size: 18px;background: black; padding: 24px 12px;text-shadow:rgba(255,255,255,0.3) 0 0 8px;border-left: solid 5px orangered;border-right: solid 5px rebeccapurple;background-image:radial-gradient(ellipse at top left, rgba(255, 69, 0, 0.18), transparent),radial-gradient(ellipse at bottom right, rgba(102, 51, 153, 0.18), transparent);');
let lastpos = {
    x: -100,
    y: -100
};
let dnaButtons = document.querySelectorAll('[dna]');
for (let i = 0; i < dnaButtons.length; i++){
    dnaButtons[i].classList.add('dna-effect');
}

let lineLength = dnaLineLength;
let dots = [];
let spliced = false;
let interval = '';
let radius = dnaRadius;

window.addEventListener('load', function () {
    mouseMove({clientY: window.innerHeight/2, clientX: window.innerWidth/2})
});

document.getElementById('main').addEventListener('mousemove', function (e) {
    mouseMove(e)
});

function mouseMove(e) {
    if (amount !== oldAmount){
        render();
        oldAmount = amount;
    }
    if (Math.min(window.innerWidth,window.innerHeight) < minScreenSize){
        setPhone();
    } else {
        spliced = false;
        lastpos = {
            x: e.clientX,
            y: e.clientY
        };
        radius = dnaRadius;
        c.classList.remove('phone')
        lineLength = dnaLineLength;
    }
    if (interval.length === 0) {
        document.body.classList.add('noMouse')
        interval = setInterval(frame, 1000 / fps);
    }
}


function setPhone() {
    lastpos = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
    radius = 1.5 * dnaRadius;
    c.classList.add('phone');
    if (!spliced) {
        spliced = true;
        dots = dots.splice(dots.length - dots.length / 5);
    }
    lineLength = 2 * dnaLineLength;
}

render();

window.addEventListener("resize", function () {
    render();
    if (Math.min(window.innerWidth,window.innerHeight) < minScreenSize) {
    setPhone()
    }
});

function render() {
    dots = [];
    c.width = window.innerWidth
    c.height = window.innerHeight
    let totalDots = amount * c.width * c.height / 1000;
    for (let i = 0; i < amount; i++){
        dots.push(newDot(false));
    }
}

function frame() {
    clear();
    drawDots();
    drawLine();
    drawMouse();
    calculateNudge();
    calculateDots();
}

function calculateNudge() {
    for (let i = 0; i < dnaButtons.length; i++) {
        let x = dnaButtons[i].offsetLeft + (dnaButtons[i].offsetWidth/2) - parseFloat(dnaButtons[i].style.left + "x");
        let y = dnaButtons[i].offsetTop + (dnaButtons[i].offsetHeight/2) - parseFloat(dnaButtons[i].style.top + "x");
        let distance = distanceBetween(lastpos.x,lastpos.y,x,y);
        let xDiff = Math.abs(x - lastpos.x);
        let yDiff = Math.abs(y - lastpos.y);
        let quarterSin =Math.asin(xDiff / distance)* (180 / Math.PI)
        let angle = quarterSin;

        if (y < lastpos.y){
            angle = 90 + 90-quarterSin;
            if (x > lastpos.x){
                angle = 180 + quarterSin
            }
        } else {
            if (x > lastpos.x){
                angle = 270 + 90-quarterSin
            }
        }
        let xChange = 0;
        let yChange = 0;

        xChange = 0;
        yChange = 0;

        if(angle >= 270){
            yChange = (angle-270)/90;
            xChange = (360-angle)/90;
        } else if (angle >= 0 && angle < 90){
            yChange = (90-angle)/90;
            xChange = (-angle)/90;
        } else if (angle >= 90 && angle < 180){
            yChange = (90-angle)/90;
            xChange = (angle-180)/90;
        } else if (angle >= 180 && angle < 270){
            yChange = (angle-270)/90;
            xChange = (angle-180)/90;
        }
        if (!!distance){
            let difference = distance / 25;
            dnaButtons[i].style.top = yChange * difference * dnaButtons[i].getAttribute('dna') + 'px';
            dnaButtons[i].style.left = xChange * difference * dnaButtons[i].getAttribute('dna') + 'px';
        } else {
            dnaButtons[i].style.top = '0px';
            dnaButtons[i].style.left = '0px';
        }
    }
}

function newDot(respawn = true) {
    let x = 0;
    let y = 0;
    if (respawn) {
        if (Math.random() >= 0.5) {
            if (Math.random() >= 0.5) {
                x = Math.random() * c.offsetWidth;
                y = 0 - radius;
            } else {
                x = Math.random() * c.offsetWidth;
                y = c.offsetHeight + radius;
            }
        } else {
            if (Math.random() >= 0.5) {
                y = Math.random() * c.offsetHeight;
                x = 0 - radius;
            } else {
                y = Math.random() * c.offsetHeight;
                x = c.offsetWidth + radius;
            }
        }
    } else {
        y = Math.random() * c.offsetHeight;
        x = Math.random() * c.offsetWidth;
    }

    return {
        x: x,
        y: y,
        distanceFromMouse: distanceBetween(lastpos.x,lastpos.y,x,y),
        speed: 5,
        angle: Math.random() * 360
    };
}

function drawDots() {
    for (let i = 0; i < dots.length; i++){

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,' + ((lineLength - dots[i].distanceFromMouse) / lineLength) + ')';
        ctx.arc(dots[i].x, dots[i].y, radius, 0, 2 * Math.PI);
        ctx.fill();
        if (debug) {
            ctx.fillText('angle:' + dots[i].angle, dots[i].x + radius, dots[i].y);
            ctx.fillText('x:' + dots[i].x, dots[i].x + radius, dots[i].y + 10);
            ctx.fillText('y:' + dots[i].y, dots[i].x + radius, dots[i].y + 20);
            ctx.fillText('speed:' + dots[i].speed, dots[i].x + radius, dots[i].y + 30);
            ctx.fillText('fromMouse:' + dots[i].distanceFromMouse, dots[i].x + radius, dots[i].y + 40);
        }
    }
}

function drawMouse() {
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.arc(lastpos.x, lastpos.y, 5, 0, 2 * Math.PI)
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawLine() {

    for (let i = 0; i < dots.length; i++) {
        if (dots[i].distanceFromMouse < lineLength){
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,' + ((lineLength - dots[i].distanceFromMouse) / lineLength) + ')';
            ctx.moveTo(lastpos.x, lastpos.y);
            ctx.lineTo(dots[i].x, dots[i].y);
            ctx.stroke();
        }
    }
}


function calculateDots() {
    for (let i = 0; i < dots.length; i++){
        if (dots[i].x > c.offsetWidth + radius || dots[i].x < 0 - radius || dots[i].y > c.offsetHeight + radius || dots[i].y < 0 - radius) {
            dots[i] = newDot();
        }
        if (dots[i].angle < 180){
            dots[i].y += (dots[i].angle - 90)/90
            dots[i].x += (dots[i].angle)/90
        } else {
            dots[i].y += -(dots[i].angle - 270)/90
            dots[i].x += -(dots[i].angle - 180)/90
        }
        dots[i].distanceFromMouse = distanceBetween(lastpos.x,lastpos.y,dots[i].x,dots[i].y);
    }
}

function clear() {
    ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
}

function distanceBetween(x1,y1,x2,y2) {
    return Math.sqrt(
        Math.pow(x2 - x1, 2) +
        Math.pow(y2 - y1, 2)
    )
}