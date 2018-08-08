var socket = io();
var bellMode = false;
var notificationFullIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAAsklEQVR4AezUpwECURRE0fv6gAagAhyOYrCgWbueTFfkEli3kpxz/IkMZ/yVw2+LLIY7X2Yyw8dRTGbrEcdJchdKYi1KgWAXCigQxUKagcyOx4A0hjIyuzyyGEgwuRqakECT0JXZ9dFF0JKS2e2RQktVGaqhpaEMNdESKkMhOmSm3j/0DynktEKe/g8pRsY9o07JzGxc5RnuFXrzwb3xgjKD2uEGdVDqpjqGl0DYyDByAQBSWI79pT9USAAAAABJRU5ErkJggg==";
var notificationEmptyIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAQAAABLCVATAAAA6klEQVR4Ae3UgQYCQRSF4X8VCEAplACoJwiIENCLBFAAtYGKAgT1VFXYR2iAoAipXGsk07rbIKrvgN1757CW4beV78HfNLgGV6Z4qt1rJNTx0rRFTd5WYYGxRYYFFd7Q5RyX2HCmS0o9e/hCRMTFPvdJoYEcxNAhB0CODiYubqAUEMmRDXkeFVjL+4gAlbasn6jyrMpRZm1UlrI8x2UmsxUqW1lu4dKS2Q6VgyyXcCnK7IBG/JuzuGTiqUby6ncX/YuGqqJQfw+F7th5j+QaZZKrUtRIeClMmU/Y28/Y42VsiyZ4GmAwjPhdNy7Q4uT+8+fIAAAAAElFTkSuQmCC";

/*!
* Dynamically changing favicons with JavaScript
* Works in all A-grade browsers except Safari and Internet Explorer
* Demo: http://mathiasbynens.be/demo/dynamic-favicons
*/

// HTML5™, baby! http://mathiasbynens.be/notes/document-head
document.head = document.head || document.getElementsByTagName('head')[0];

function changeFavicon(src) {
    var link = document.createElement('link'),
        oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}

function setVisibleEl(el, visible, options, cb) {
    if (typeof el === "string") {
        el = document.querySelector(el);
    }
    if (typeof options === "function") {
        cb = options;
        options = {};
    }
    options = options || {};
    if (options.instant) {
        if (!visible) {
            el.classList.add("hidden");
        } else {
            el.classList.remove("hidden");
        }
        if (cb) cb();
    } else if (!visible) {
        hideEl(el, cb);
    } else {
        showEl(el, cb);
    }
}

function hideEl(el, cb) {
    el.classList.add("hide");
    setTimeout(() => {
        el.classList.add("hidden");
        setTimeout(() => {
            el.classList.remove("hide");
            if (cb) cb();
        }, 100);
    }, 1000);
}

function showEl(el, cb) {
    el.classList.remove("hidden");
    el.classList.add("show");
    setTimeout(() => {
        el.classList.remove("show");
        if (cb) cb();
    }, 1000);
}

var ring = function() {
    console.log("Ring");
    socket.emit("ring", { name });
}

var emitRing = function({ name, icon }) {
    if (!bellMode) { return; }
    console.log("Bell Ring by " + name);

    // Play audio
    let audio = document.getElementById("bellAudio");
    if (!audio.paused) { audio.currentTime = 0; }
    audio.play();
    audio.onended = () => {
         // TTS
        let msg = new SpeechSynthesisUtterance(name + " has arrived")
        window.speechSynthesis.speak(msg)
    };

    // Change favicon
    changeFavicon(notificationFullIcon);
    setTimeout(function() {
        changeFavicon(notificationEmptyIcon);
    }, 4000);

    // Send desktop notification
    notifyBell(name, icon);

   

    document.getElementById("lastRang").innerHTML = `${name} is a dead ringer.<br /> @${new Date().toLocaleTimeString()}`;
}

var toggleBellMode = function() {
    let bellModeToggle = document.getElementById("bellModeToggle");
    bellMode = bellModeToggle.checked;
    setCookie("bellMode", bellMode);
    setVisibleEl("#lastRang", bellMode);

    if (bellMode && Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}
  
function notifyBell(name, icon) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        var notification = new Notification('Doorbell rang', {
            icon: icon || notificationFullIcon,
            body: `${name} just rang the doorbell!`,
        });
    }
}

function addName() {
    let nameInput = document.getElementById("nameInput");
    name = nameInput.value;
    if (name) {
        setCookie("person_name", name);
        document.getElementById("name").innerHTML = name;
        setVisibleEl("#nameOverlay", false);
        setVisibleEl("#overlay", false);
    }
}

function changeName() {
    document.getElementById("nameInput").value = name;
    setVisibleEl("#nameOverlay", true);
    setVisibleEl("#overlay", true);
}

function passClickToChild(el) {
    let children = el.children;
    for (let c in children) {
        if (!children[c].classList.contains("hidden")) {
            eval(children[c].getAttribute("parentclick"));
            return;
        }
    }
}

window.onload = function() {
    bellMode = getCookie("bellMode") === "true" ? true : false;
    document.getElementById("bellModeToggle").checked = bellMode;

    if (bellMode && Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    if (!bellMode) {
        setVisibleEl("#lastRang", false)
    } else {
        setVisibleEl("#lastRang", true);
    }

    document.querySelector("#overlay").childNodes.forEach(el => {
        el.onclick = e => e.stopPropagation();
    })

    var name = getCookie("person_name");
    if (name) {
        document.getElementById("name").innerHTML = name;
        setVisibleEl("#loadingOverlay", false);
        setVisibleEl("#overlay", false);
    } else {
        setVisibleEl("#loadingOverlay", false, () => {
            setVisibleEl("#nameOverlay", true);
        });
    }
}

socket.on("ring", emitRing);
socket.on("reload", options => {
    options = options || {}
    if (options.onlyListeners) {
        if (!this.bellMode) { return }
    }
    if (options.reason && Notification && Notification.permission === "granted") {
        let title = "Doorbell reload"
        if (options.shortReason) {
            title += ": " + options.shortReason
        }
        var notification = new Notification(title, {
            icon: notificationFullIcon,
            body: options.reason,
            requireAction: true
        });
    }
    location.reload(true)
})
changeFavicon(notificationEmptyIcon);
