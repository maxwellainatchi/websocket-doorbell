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
    socket.emit("ring");
}
var emitRing = function() {
    if (!bellMode) { return; }
    console.log("Bell Ring");
    let audio = document.getElementById("bellAudio");
    audio.pause();
    setTimeout(function() {
        changeFavicon(notificationEmptyIcon);
        audio.pause();
    }, 3000);
    audio.play();
    changeFavicon(notificationFullIcon);
    notifyBell();
}

var toggleBellMode = function() {
    let bellModeToggle = document.getElementById("bellModeToggle");
    bellMode = bellModeToggle.checked;
    setCookie("bellMode", bellMode);

    if (bellMode && Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}
  
function notifyBell() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        var notification = new Notification('Doorbell', {
            icon: notificationFullIcon,
            body: "Someone just rang the doorbell!",
        });
    }
}

window.onload = function() {
    bellMode = getCookie("bellMode") === "true" ? true : false;
    document.getElementById("bellModeToggle").checked = bellMode;

    if (bellMode && Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

socket.on("ring bell", emitRing);
changeFavicon(notificationEmptyIcon);
