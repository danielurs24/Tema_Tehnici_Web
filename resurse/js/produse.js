window.addEventListener("DOMContentLoaded", function(){


    var btn=document.getElementById("filtrare");
    btn.onclick=function(){
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){

            art.style.display="none";

            /*
            v=art.getElementsByClassName("nume")
            nume=v[0]*/
            var nume=art.getElementsByClassName("val-nume")[0];//<span class="val-nume">aa</span>
            var nume_cautare = document.getElementById("inp-nume").value;
            console.log(art.getElementsByClassName("val-nume")[0].innerHTML);
            var conditie1 = false;
            if(nume_cautare.search("[*]") > 0)
            {   let n = 0
                console.log("a intrat")
                var nm = nume_cautare.split("*");
                
                console.log(nume.innerHTML.endsWith(nm[1]))
                if(nume.innerHTML.startsWith(nm[0]))
                    if(nume.innerHTML.endsWith(nm[1]))
                        conditie1 = true;


            }
            else{
                conditie1=nume.innerHTML.startsWith(document.getElementById("inp-nume").value);
            }
            
            console.log(nume.innerHTML)
            

            var pret=art.getElementsByClassName("val-pret")[0]
            var conditie2=parseInt(pret.innerHTML) > parseInt(document.getElementById("inp-pret-min").value);
            var conditie6=parseInt(pret.innerHTML) < parseInt(document.getElementById("inp-pret-max").value);

            var check1=document.getElementsByName("gr_check")[0];
            var check2=document.getElementsByName("gr_check")[1];
            var conditie5=false;
            if(check1.checked){
                var check = art.getElementsByClassName("val-stoc")[0].innerHTML;
                if (check == "Da")
                    conditie5=true;
            } else if(check2.checked){
                var check = art.getElementsByClassName("val-stoc")[0].innerHTML;
                if (check == "Nu")
                    conditie5=true;
            } else {
                    conditie5=true;
            }


            var checkbtns=document.getElementsByName("gr_rad");
            for (let rad of checkbtns){
                if (rad.checked){
                    var valculoare=rad.value;//poate fi 1, 2 sau 3
                    console.log(rad.value);
                    break;
                }
            }

            var culoareArt= art.getElementsByClassName("val-culoare")[0].innerHTML;
            var conditie3=false;

            switch (valculoare){
                case "1": conditie3= (culoareArt == "rosu"); break;
                case "2": conditie3= (culoareArt == "negru"); break;
                case "3": conditie3= (culoareArt == "albastru"); break;
                default: conditie3=true;

            }
            
            var selCateg=document.getElementById("inp-categorie");

            var conditie4 = (art.getElementsByClassName("val-nume")[0].innerHTML == selCateg.value ||  selCateg.value=="toate");


            if(conditie1 && conditie2 && conditie3 && conditie4 && conditie5 && conditie6)
                art.style.display="block";
            
        }
    }
    var rng_min=document.getElementById("inp-pret-min");
    rng_min.onchange=function(){
        var info = document.getElementById("infoRange-min");//returneaza null daca nu gaseste elementul
        if(!info){
            info=document.createElement("span");
            info.id="infoRange-min"
            this.parentNode.appendChild(info);
        }
        
        info.innerHTML="("+this.value+")";
    }

    var rng_max=document.getElementById("inp-pret-max");
    rng_max.onchange=function(){
        var info = document.getElementById("infoRange-max");//returneaza null daca nu gaseste elementul
        if(!info){
            info=document.createElement("span");
            info.id="infoRange-max"
            this.parentNode.appendChild(info);
        }
        
        info.innerHTML="("+this.value+")";
    }

    function sorteaza(semn){
        var articole=document.getElementsByClassName("produs");
        var v_articole=Array.from(articole);
        v_articole.sort(function(a,b){
            var nume_a=a.getElementsByClassName("val-nume")[0].innerHTML;
            var nume_b=b.getElementsByClassName("val-nume")[0].innerHTML;
            if(nume_a!=nume_b){
                return semn*nume_a.localeCompare(nume_b);
            }
            else{
                
                var pret_a=parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
                var pret_b=parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
                return semn*(pret_a-pret_b);
            }
        });
        for(let art of v_articole){
            art.parentNode.appendChild(art);
        }
    }

    var btn2=document.getElementById("sortCrescNume");
    btn2.onclick=function(){
        
        sorteaza(1)
    }

    var btn3=document.getElementById("sortDescrescNume");
    btn3.onclick=function(){
        sorteaza(-1)
    }


    document.getElementById("resetare").onclick=function(){
        //resetare inputuri
        document.getElementById("i_rad4").checked=true;
        document.getElementById("inp-pret-min").value=document.getElementById("inp-pret-min").min;
        document.getElementById("inp-pret-max").value=document.getElementById("inp-pret-max").max;
        document.getElementById("infoRange-min").innerHTML="("+document.getElementById("inp-pret-min").min+")";
        document.getElementById("infoRange-max").innerHTML="("+document.getElementById("inp-pret-max").max+")";
        //de completat...


        //resetare articole
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){

            art.style.display="block";
        }
    }
    
    // -------------------- selectare produse cos virtual----------------------------------
    /*
        indicatie pentru cand avem cantitati
        fara cantitati: "1,2,3,4" //1,2,3,4 sunt id-uri
        cu cantitati:"1:5,2:3,3:1,4:1" // 5 produse de tipul 1, 3 produse de tipul 2, 1 produs de tipul 3...
        putem memora: [[1,5],[2,3],[3,1],[4,1]]// un element: [id, cantitate]

    */
    ids_produse_init=localStorage.getItem("produse_selectate");
    if(ids_produse_init)
        ids_produse_init=ids_produse_init.split(",");//obtin vectorul de id-uri ale produselor selectate  (din cosul virtual)
    else
        ids_produse_init=[]

    var checkboxuri_cos = document.getElementsByClassName("select-cos");
    for (let ch of checkboxuri_cos){
        if (ids_produse_init.indexOf(ch.value)!=-1)
            ch.checked=true;
        ch.onchange=function(){
            ids_produse=localStorage.getItem("produse_selectate")
            if(ids_produse)
                ids_produse=ids_produse.split(",");
            else
                ids_produse=[]
            console.log("Selectie veche:", ids_produse);
            //ids_produse.map(function(elem){return parseInt(elem)});
            //console.log(ids_produse);
            if(ch.checked){
                ids_produse.push(ch.value);//adaug elementele noi, selectate (bifate)
            }
            else{
                ids_produse.splice(ids_produse.indexOf(ch.value), 1) //sterg elemente debifate
            }
            console.log("Selectie noua:",ids_produse);
            localStorage.setItem("produse_selectate",ids_produse.join(","))
        }
    }
 });


 window.onkeydown=function(e){
    console.log(e);
    if(e.key=="c" && e.altKey==true){
        var suma=0;
        var articole=document.getElementsByClassName("produs");
        for(let art of articole){
            if(art.style.display!="none")
                suma+=parseFloat(art.getElementsByClassName("val-pret")[0].innerHTML);
        }

        var spanSuma;
        spanSuma=document.getElementById("numar-suma");
        if(!spanSuma){
            spanSuma=document.createElement("span");
            spanSuma.innerHTML=" Suma:"+suma;//<span> Suma:...
            spanSuma.id="numar-suma";//<span id="..."
            document.getElementById("p-suma").appendChild(spanSuma);
            setTimeout(function(){document.getElementById("numar-suma").remove()}, 1500);
        }
    }


 }