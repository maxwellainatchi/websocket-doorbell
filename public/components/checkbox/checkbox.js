var toggleCheckbox = function(el, callback) {
    callback();
    var verify = el.parentElement.lastElementChild;
    verify.style.display = "initial";
    verify.classList.add("disappearing");
    verify.innerHTML = el.checked ? "Enabled!" : "Disabled!";
    var listener = function(event) {
        verify.style.display = "none";
        verify.classList.remove("disappearing");
        verify.removeEventListener("transitionend", listener, false);
        verify.classList.add("disappearing--reset");
        var innerListener = function(event) {
            verify.classList.remove("disappearing--reset");
        }
        verify.addEventListener("transitionend", innerListener, false)
        
    };
    verify.addEventListener("transitionend", listener, false)
}