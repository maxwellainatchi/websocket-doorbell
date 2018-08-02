var toggleCheckbox = function(el, callback) {
    callback();
    var verify = el.parentElement.lastElementChild;
    verify.innerHTML = el.checked ? "Enabled!" : "Disabled!";
    setVisibleEl(verify, true, {instant: true});
    setTimeout(() => {
        setVisibleEl(verify, false);
    }, 2000);
}
