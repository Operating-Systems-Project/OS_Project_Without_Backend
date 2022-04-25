var pgsize = null;
var no_pages = null;
var no_frames = null;
var pgtabentry = null;
var pgtabsize = null;
var no_pg_tables = null;
var no_levels = 0;

var lv = 1;
var pg = 1;
var en = 1;

function onCreateTable(){
    var form = document.querySelector('#paging-data');
    var formData = new FormData(form);


    var check = 1;
    for (var [key, value] of formData.entries()) { 
        if (value.length == 0){
            alert("Please set values correctly");
            check = 0;
            form.reset();
            break;
        }
    }

    if (check == 1){
        pgsize = formData.get("pgsize");
        no_pages = formData.get("logaddspc")/pgsize;
        no_frames = formData.get("phyaddspc")/pgsize;
        pgtabentry = formData.get("pgtabentry");
        pgtabsize = formData.get("pgtabsize");

        if (pgtabsize <= pgtabentry)
        {
            alert("Page table size must be less than page table entry size");
            return;
        }
        
        var pg_left = no_pages;
        no_pg_tables = [];
        while(true){
            if (pg_left*pgtabentry <= pgtabsize){
                no_pg_tables[no_levels++] = 1;
                break;
            }
            pg_left = Math.ceil((pgtabentry*pg_left)/pgtabsize);
           
            no_pg_tables[no_levels++] = pg_left;
        }

        
        //Reversing the array
        var temp = 0;
        for (var i = 0;i<Math.floor(no_levels/2);i++)
        {
            temp = no_pg_tables[i];
            no_pg_tables[i] = no_pg_tables[no_levels - i -1];
            no_pg_tables[no_levels - i - 1] = temp;
        }
        no_pg_tables[no_levels] = no_pages;
        document.getElementsByClassName("multiple-tables")[0].style.visibility = "visible";
    }
}

var pgtable = [];
var index = 0;
var check = 1;
var done = 0;
var table = document.getElementById("tbody");
function EnterData()
{
    var labels = document.getElementById("labels");
    if(done == 1)
    {
        labels.innerHTML = '';
        document.getElementById("addressgenerate").style.visibility = 'visible';
        return;
    }
    document.getElementById("tableinput").style.visibility = 'visible';
    document.getElementById("pgtable").style.visibility = 'visible';
    if (check == 1)
    {
        labels.innerHTML = `
            <h3 style="margin: 5px;">Level ${lv}</h3>
            <h3 style="margin: 5px;">Page ${pg}</h3>
            <h3 style="margin: 5px;">Entry ${en}</h3>
        `;
    }
    var inputbox = document.querySelector("#pg-table-entry");
    if (inputbox.value.length == 0){
        if (check == 1)
        {
            check = 0;
            return;
        }
        else{
            alert("Please Enter value");
            return;
        }
    }
    if ((lv == no_levels && inputbox.value > no_frames) 
        || (lv < no_levels && inputbox.value > no_pg_tables[lv]))
    {
        alert("Please enter correct page no.");
        inputbox.value = '';
        return;
    }
    if (pgtable.some(entry => entry.level == lv && entry.index == inputbox.value))
    {
        alert("Location occupied. Try again");
        inputbox.value = '';
        return;
    }


    pgtable[index++] = {level: lv,offset: pg,index: inputbox.value};
    table.innerHTML +=`
        <tr>
            <td>${lv}</td>
            <td>${pg}</td>
            <td>${inputbox.value}</td>
        </tr>
    `;
    inputbox.value = '';
    
    if (en < pgtabsize && (pg - 1)*pgtabsize + pg < no_pg_tables[lv])
    {
        en++;
    }
    else
    {
        if (pg < no_pg_tables[lv - 1])
        {
            pg++;
            en = 1;
        }
        else if (lv < no_levels)
        {
            lv++;
            pg = 1;
            en = 1;
        }
        else
        {
            document.getElementById("nextbtn").innerHTML = "Finish";
            done = 1;  
        }
    }
    if (check == 0){
        labels.innerHTML = `
        <h3 style="margin: 5px;">Level ${lv}</h3>
        <h3 style="margin: 5px;">Page ${pg}</h3>
        <h3 style="margin: 5px;">Entry ${en}</h3>
    `;
    }
}

var level_val = [];
var levindex = 0;
var lindex = 0;
var done2 = 0;
function generatePhyAdd()
{
    var logadd = document.getElementById("logadd");
    if (logadd.value == '')
    {
        alert("Please enter a value");
        return;
    }
    if (done2 == 1)
    {
        if (logadd.value > pgsize){
            alert("Incorrect offset")
            return;
        }
        var phyadd = (level_val[no_levels - 1] - 1)*pgsize + Number(logadd.value);
        document.getElementById("address-display").innerHTML = `
            <h3>Physical Address: ${phyadd}</h3>
        `;
        return;
    }

    
    
    
    
    if (level_val.length == 0){
        if (logadd.value >= no_pg_tables[levindex + 1]){
            alert("Incorrect entry");
            return;
        }
        level_val[levindex++] = pgtable[logadd.value].index;
    }
    else{
        if ((level_val[levindex - 1] == no_pg_tables[levindex]) && (logadd.value >= no_pg_tables[levindex + 1]%pgtabsize)){
            alert("Incorrect offset");
            return;
        }
        if (level_val[levindex - 1] != no_pg_tables[levindex] && logadd.value >= pgtabsize)
        {
            alert("Incorrect offset");
            return;
        }
        var ind = (level_val[levindex - 1] - 1)*pgtabsize + Number(logadd.value);
        level_val[levindex++] = pgtable[lindex + ind].index;
        
    }
    console.log(level_val);
    if (levindex == no_levels)
    {
        btn4.innerHTML = "Generate";
        document.getElementById("logicaloffset").innerHTML = "Offset";
        done2 = 1;

    }
    lindex += no_pg_tables[levindex];
    console.log(lindex);
    if (levindex == no_levels)
    {
        document.getElementById("level-address").innerHTML = '';
    }
    else
    {
        document.getElementById("level-address").innerHTML = `
            <h4>Level ${levindex + 1}</h4>
        `;
    }


}



var btn = document.querySelector("#simulate-btn");
btn.addEventListener("click",onCreateTable);

var btn2 = document.querySelector("#startbtn");
btn2.addEventListener("click",EnterData);


var btn3 = document.querySelector("#nextbtn");
btn3.addEventListener("click",EnterData);

var btn4 = document.querySelector("#generatebtn");
btn4.addEventListener("click",generatePhyAdd);




