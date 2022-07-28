
        const searcInput = document.getElementById('searchDesease');
        const dataResponseField = document.getElementById('dataResponseField');
        const better = document.getElementById('better');       
        const dField =  document.getElementById('dname');
        let searcInputValue= document.getElementById('searchDesease').value; 
        const proxy ="https://cors-anywhere.herokuapp.com/";
        const idSaveMeasurement =  document.getElementById('idSaveMeasurement');
        const FREQUENCY =  document.getElementById('FREQUENCY');
        const MEASUREMENT =  document.getElementById('MEASUREMENT');
        const ROUTES =  document.getElementById('ROUTES');
        const HOURS =  document.getElementById('HOURS');
        const DAYS =  document.getElementById('DAYS');
        const QUANTITY =  document.getElementById('QUANTITY');
        const INSTRUCTION =  document.getElementById('INSTRUCTION');       
        const BODYMEDICATION =  document.getElementById('ROWBODYMEDICATION'); 
        const PRINT =  document.getElementById('printClick');        
        const PRINTERVIEW =  document.getElementById('PRINTERVIEW');   
        const BOX ='NO';
        const measurementValue = '';
        const routesValue = '';
        var ICD10 ='';
        var formed = []; 
        var allItems = [];
        var item = {
            name:'',
            dosage:'',
            definer:'',
            inn:'',
            form:'',
            package:'',
            nikiCode: '',
            Avail : '',
            measure:{
                FREQUENCY :'', 
                MEASUREMENT :'',
                HOURS :'',
                DAYS :'',
                QUANTITY :'',
                INSTRUCTION :'',
                ROUTES :'',
                BOX :'',            
            },
            fullerror:[], 
        } 
        var global = {
            inezaid : '',
            ASSURANCE : '',
            VISIT_ID : ''
        };
        toastr.options = {
                        "preventDuplicates": true,
                        "preventOpenDuplicates": true
                        };

        function valueToset(valueToset ,place ,input = null){
          let SetInfo = document.getElementById(`${place}`); 
          let inputToSet = document.getElementById(`${input}`); 
           
          SetInfo != null ? SetInfo.innerHTML = valueToset : '';         
          input != null ? inputToSet.value = valueToset : '';
        }
        function valueTosetIcd10(valueToset ,place ,input = null , icd = null){
          let SetInfo = document.getElementById(`${place}`); 
          let inputToSet = document.getElementById(`${input}`); 
           
          SetInfo != null ? SetInfo.innerHTML = valueToset : '';         
          input != null ? inputToSet.value = valueToset : '';
          ICD10 = icd;
        }
        function getPatientInfo(id = null){
            const NUM  = document.getElementById('NUM');
            const assurance  = document.getElementById('INSURANCEFIELD');            
            $.ajax({
                method:'POST',
                url:`./components/searchD.php`,
                data:{
                    p:1,
                    ASSURANCE:assurance.value,
                    NUMAFFILIATION:NUM.value,
                    LTL:1
                },
                dataType:'json',
                success:(data)=>{ 
                    // console.log(data); 
                    global.inezaid =  data.GLOBAL_ID_INEZA; 
                    global.ASSURANCE =  data.ASSURANCE; 
                    global.VISIT_ID =  NUM.value; 
                    if(!data.RESPONSE){
                        valueToset(`<span  > ${data.NOM_CLIENT} </span>`,"FIRST_NAME");
                        valueToset(`<span  > ${data.PRENOM_CLIENT}</span>`,"SECOND_NAME");
                        valueToset(`<span  > ${data.SEXE} </span>`,"GENDER");
                        valueToset( `<span > ${data.AGE} </span>`,"DOB");
                        valueToset( `<span > ${data.ASSURANCE} </span>`,"INSURANCEPLACE");
                        valueToset( ` ${data.NOM_CLIENT}  `,"PRINTFIRST_NAME");
                        valueToset( ` ${data.PRENOM_CLIENT}`,"PRINTSECOND_NAME");
                        valueToset( ` ${data.AGE} `,"PRINTDOB");
                        valueToset( ` ${data.ASSURANCE} `,"PRINTINSURANCEPLACE");
                        valueToset( ` ${data.SEXE} `,"PRINTGENDER");
                        valueToset( ` . `,"PRINTALLEGIES");
                        valueToset( `  `,"PRINTPRISCRITIONNO");
                        valueToset( ` ${ NUM.value } `,"PRINTAFFILIATION");
                        
                    }else{
                        toastr.warning(`<span class="result-come"> ${data.RESPONSE} </span>`,`<span class="result-come">!</span>`,{timeOut: 3000});
                    }
                }
            })
        }
        let inputIdSeacr = document.getElementById('searchinputid');
        inputIdSeacr.addEventListener('click' , () => {
            let NUM = document.getElementById('NUM');
            getPatientInfo(NUM.value);            
        })
        function truncate(str, n){
            return (str.length > n) ? str.substr(0, n-1) + '...' : str;
         };
       
        
        function getItem(){ 
            $.ajax({
                method:'POST',
                url:`./components/searchD.php`,
                data:{
                    ITEM:1
                },
                dataType:'json',
                success:(data)=>{ 
                    // console.log(data);
                    // debugger;
                    console.log(data.LINE[0]);
                    // console.log(data.LINE.length);
                    // debugger;
                    var filter = '';
                    for(var i = 0 ; i < data.LINE.length ; i++){
                        
                        // debugger;
                        filter += `<tr style="cursor: pointer;"  onClick="setItem(\' ${data.LINE[i].item_commercial_name}\',\' ${data.LINE[i].item_dosage}\',\' ${data.LINE[i].niki_code}\',\' ${data.LINE[i].item_form}\',\' ${data.LINE[i].item_emballage}\',\' ${data.LINE[i].niki_code.trim() }\',\' ${data.LINE[i].item_inn.trim() }\', \' ${data.LINE[i].code_product.trim() }\' )" data-bs-toggle="modal" href="#define" role="button" >`;
                            filter += `<td class="result-come elep">${data.LINE[i].item_commercial_name}</td>`;
                            filter += `<td class="result-come elep">${data.LINE[i].item_dosage}</td>`;
                            filter += `<td class="result-come elep" title="${data.LINE[i].item_inn}">${truncate(data.LINE[i].item_inn ,15)}</td>`;
                            filter += `<td class="result-come eleps">${data.LINE[i].item_form.trim()}</td>`;
                            filter += `<td class="result-come elep">${data.LINE[i].item_emballage}</td>`;
                        filter += `</tr>`;                        
                    }
                    dataResponseField.innerHTML =filter;
                    oTable = $('#itemTable').DataTable({
                            pageLength : 4,
                            processing: true,
                            lengthMenu: [[5, 10, 20, -1], [5, 10, 20, ' ']]
                        });  
                    $('#drugInput').keyup(function(){
                        oTable.search($(this).val()).draw() ;
                    })
                }
            })
        }
        searcInput.addEventListener('keyup',() => {
            getDesease();
        });
        const getDesease  = () => {
            if(searcInput.value.trim().length > 3 ){
                $.ajax({
                    method:'POST',
                    url:`./components/searchD.php`,
                    data:{
                        d:1,
                        DESEASE:searcInput.value
                    },
                    dataType:'json',
                    success:(data)=>{
                        // console.log(data);
                        if(data.description != false){
                            for(let i = 0 ; i < data.description.length ; i++ ){
                                toastr.success(`${data.description[i]}`,`<span class="result-come" style="color:white !important">Select</span>`,{timeOut: 3000});
                            }                            
                        }else{
                            toastr.warning(`<span class="result-come">Not found</span>`,`<span style="color:white !important">!</span>`,{timeOut: 3000});
                        }                                               
                    }                  
                })
            }            
        }
        function setItem(name,dosage,cateId,form,packages,nikiCode,innName,code_product){
            item.name     = name;
            item.definer  = nikiCode;
            item.dosage   = dosage;
            item.form     = form;
            item.inn      = innName;
            item.package  = packages;     
            item.nikiCode = nikiCode;
            item.code_product = code_product;  
            $.ajax({
                method:'POST',
                url:`./components/searchD.php`,
                data:{
                    avItem:code_product
                },
                dataType:'json',
                success:(data)=>{ 
                    // console.log(data);
                    // debugger;
                    if(data.AVAILABILITY != "NOT FOUND"){
                        // console.log("yabonetse"+data.AVAILABILITY);
                        // debugger;
                       let AvailabilityDate =  new Date(data.AVAILABILITY);
                       let CurrentDate = new Date();
                       
                       let diffMs = (CurrentDate - AvailabilityDate); 
                       let Days = Math.floor(diffMs / 86400000); 
                       let Hrs = Math.floor…