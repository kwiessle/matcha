function previewFile() {
    var preview = document.getElementById('photodisplay');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);
    if (file) {
        reader.readAsDataURL(file);
        document.getElementById("photo").setAttribute("style", "display:block; padding:0");
        document.getElementById("band").setAttribute("style", "display:none");

    }
}