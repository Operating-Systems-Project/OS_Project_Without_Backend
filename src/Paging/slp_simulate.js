var pgsize = null;
var no_pages = null;
var no_frames = null;
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

        const sm = document.getElementsByClassName("simulation");
        sm[0].style.visibility = "visible";
    }

}

const btn = document.querySelector("#simulate-btn");
btn.addEventListener("click",onCreateTable);

const prcreate = document.getElementById("process-create");

const newprocess = document.querySelector("#new-process");
newprocess.addEventListener("click",function createProcess(){
    prcreate.innerHTML = `
    <div>
        <label for="pr-no">Process no.: </label>
        <input type="number" id="pr-no" name="processno">
    </div>
    <div>
        <button type="button" class="btn btn-dark createbtn" id="create-btn">Create</button>
    </div>`;
});

var prno = null;
var process_page = [];
var frames = [];
var pgcount = 0;
var frcount = 0;
prcreate.addEventListener("click",function pgTableEntry(e){
    if (e.target.classList.contains("createbtn"))
    {
        prno = document.querySelector("#pr-no");
        if (prno.value.length == 0){
            alert("Please enter process number.");
        }
        else{
            prcreate.innerHTML = `
            <form id="page-table-form">
                <div>
                    <label for="pgno">Page no.:</label>
                    <input type="number" id="pgno" name="pgno">
                </div>
                <div>
                    <label for="frno">Frame no.:</label>
                    <input type="number" id="frno" name="frno">
                </div>
                <div>
                    <button type="button" class="btn btn-dark addbtn">Add</button>
                </div>
            </form>
            `
        }
    }
    else if(e.target.classList.contains("addbtn")){
        var form = document.querySelector("#page-table-form");
        var pgform = new FormData(form);
        var pgno = pgform.get("pgno");
        var frno = pgform.get("frno");

        if (pgno.length == 0 || frno.length == 0)
        {
            alert("Please enter the values correctly");
        }
        else{
            const pgtb = document.getElementById("page-table-body");
            if (pgno > no_pages){
                alert("Exceeding set no. of pages");
                form.reset();
                return;
            }
            if (frno > no_frames){
                alert("Frame no. must be less than "+no_frames);
                form.reset();
                return;
            }
            if (process_page.some(prpg => prpg.asid == prno.value && prpg.pgno == pgno))
            {
                alert("Page already added");
                form.reset();
                return;
            }
            if (frames.includes(frno)){
                alert("Frame already occupied");
                form.reset();
                return;
            }
            pgtb.innerHTML += `
                <tr>
                    <td>${prno.value}</td>
                    <td>${pgno}</td>
                    <td>${frno}</td>
                </tr>
            `;
            process_page[pgcount] = {asid: prno.value,pgno: pgno};
            pgcount += 1;
            frames[frcount] = frno;
            frcount += 1;
            form.reset();
        }
    }
});

const map = document.getElementById("map");
map.addEventListener("click",function map(){
    var pgtable = document.getElementById("pagetable");
    if (pgtable.rows.length == 1){
        alert("Page table empty!");
        return;
    }
    document.getElementsByClassName("generate")[0].style.visibility = "visible";
})

const generate = document.getElementById("generatebtn");
generate.addEventListener("click",function AddressMap(){
    var form = document.querySelector(".Pagemap");
    var formdata = new FormData(form);

    for (var [key, value] of formdata.entries()) { 
        if (value.length == 0){
            alert("Please set values correctly");
            form.reset();
            return;
        }
    }



    var pgtable = document.getElementById("pagetable");

    var entry = [formdata.get("processno"),formdata.get("pageno"),formdata.get("offset")]
    if (entry[2] >= pgsize)
    {
        alert("Offset has to be less than "+pgsize);
        form.reset();
        return;
    }

    var no_entries = pgtable.rows.length - 1;

    var frame = null;
    var phadd = null;

    for (var i = 1;i<=no_entries;i++)
    {
        if (pgtable.rows.item(i).cells[0].innerHTML == entry[0] && 
            pgtable.rows.item(i).cells[1].innerHTML == entry[1])
        {
            frame = pgtable.rows.item(i).cells[2].innerHTML;
            phadd = Number((frame - 1)*pgsize) + Number(entry[2]);
            var phdisplay = document.getElementById("phadd");
            phdisplay.innerHTML = `
                <h4>Physical address: ${phadd}</h4>
            `;
            return;
        }
    }
    alert("Incorrect request!");
    form.reset();
})