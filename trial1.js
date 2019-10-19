function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function addRow(){
    var table = document.getElementById("table");
    var row = table.insertRow();
    var cell = row.insertCell();
    cell.innerHTML = document.getElementById("message").value;
}