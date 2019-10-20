function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function addRow(){
    var table = document.getElementById("table");
    var row = table.insertRow();
    var cell = row.insertCell();
    var cell2 = row.insertCell();
    cell.innerHTML = "";
    cell2.innerHTML = document.getElementById("message").value;
    document.getElementById("message").value = "";
    cell2.classList.add("mine");
}