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

var ring = function() {
    console.log("Ring");
    socket.emit("ring", { name });
}

var emitRing = function({ name }) {
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
    notifyBell(name);

   

    document.getElementById("lastRang").innerHTML = `${name} is a dead ringer.<br /> @${new Date().toLocaleTimeString()}`;
}

var toggleBellMode = function() {
    let bellModeToggle = document.getElementById("bellModeToggle");
    bellMode = bellModeToggle.checked;
    setCookie("bellMode", bellMode);
    document.getElementById("lastRang").style.display = bellMode ? "block" : "none";

    if (bellMode && Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}
  
function notifyBell(name) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        var notification = new Notification('Doorbell', {
            icon: notificationFullIcon,
            body: `${name} just rang the doorbell!`,
        });
    }
}

function addName() {
    let nameInput = document.getElementById("nameInput");
    name = nameInput.value;
    console.log(nameInput.value);
    if (name) {
        setCookie("person_name", name);
        document.getElementById("nameOverlay").style.display = "none";
        document.getElementById("name").innerHTML = name;
    }
}

window.onload = function() {
    bellMode = getCookie("bellMode") === "true" ? true : false;
    document.getElementById("bellModeToggle").checked = bellMode;

    if (bellMode && Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    var name = getCookie("person_name");
    if (!name) {
        document.getElementById("nameOverlay").style.display = "block";
    } else {
        document.getElementById("name").innerHTML = name;
    }
    document.getElementById('loadingOverlay').style.display = "none";
}

socket.on("ring bell", emitRing);
changeFavicon(notificationEmptyIcon);
