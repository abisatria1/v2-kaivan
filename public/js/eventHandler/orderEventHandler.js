$(document).ready(() => {
    $(document).ready( function () {
        $('#orderTable').DataTable();
    } );

    var editable = document.getElementById('coba');
    editable.addEventListener('input', function() {
        console.log(editable.textContent)
        console.log('Hey, somebody changed something in my text!');
    });
})