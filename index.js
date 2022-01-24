const express= require("express");
var app=express();
const fs=require('fs');
const sharp=require('sharp');
const ejs=require('ejs');
const path = require('path');
const sass=require('sass');
app.use("/resurse", express.static(__dirname+"/resurse"));
const {Client}= require("pg");

app.set("view engine", "ejs");

var client=new Client({ user: 'dan', password:'admin', database:'postgres', host:'localhost', port:5432 });
client.connect();

client.query("select * from unnest(enum_range(null::categ_produs))", function(errCateg, rezCateg){           
    v_optiuni=[];
    for(let elem of rezCateg.rows){
        v_optiuni.push(elem.unnest);
    }
});



function creeazaImagini(){
    var buf=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");
    obImagini=JSON.parse(buf);//global
    //console.log(obImagini);
    for (let imag of obImagini.imagini){
        let nume_imag, extensie;
        [nume_imag, extensie ]=imag.cale_imagine.split(".")// "abc.de".split(".") ---> ["abc","de"]
        let dim_mic=150
        let dim_mediu=300
        
        imag.mic=`${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`
        imag.med=`${obImagini.cale_galerie}/med/${nume_imag}-${dim_mediu}.webp` //nume-150.webp // "a10" b=10 "a"+b `a${b}`
        //console.log(imag.mic);
        imag.mare=`${obImagini.cale_galerie}/${imag.cale_imagine}`;
        if (!fs.existsSync(imag.mic))
            sharp(__dirname+"/"+imag.mare).resize(dim_mic).toFile(__dirname+"/"+imag.mic);
        if (!fs.existsSync(imag.med))
            sharp(__dirname+"/"+imag.mare).resize(dim_mediu).toFile(__dirname+"/"+imag.med);

        
    }

}
creeazaImagini();

app.get("*/galerie_animata.css",function(req, res){
    /*Atentie modul de rezolvare din acest app.get() este strict pentru a demonstra niste tehnici
    si nu pentru ca ar fi cel mai eficient mod de rezolvare*/
    res.setHeader("Content-Type","text/css");//pregatesc raspunsul de tip css
    let sirScss=fs.readFileSync("./resurse/scss/galerie_animata.scss").toString("utf-8");//citesc scss-ul cs string
    nr=["4","9","16"]
    let nrImag = nr[Math.floor(Math.random()*nr.length)];//iau o culoare aleatoare pentru border
	
    //let nrImag= 10+Math.floor(Math.random()*5)*2;  //Math.floor(Math.random()*10) 
    let rezScss=ejs.render(sirScss,{nr:nrImag});// transmit culoarea catre scss si obtin sirul cu scss-ul compilat
    //console.log(rezScss);
    //console.log(__dirname);
    fs.writeFileSync("./temp/galerie_animata.scss",rezScss);//scriu scss-ul intr-un fisier temporar

	let cale_css=path.join(__dirname,"temp","galerie_animata.css");//__dirname+"/temp/galerie-animata.css"
	let cale_scss=path.join(__dirname,"temp","galerie_animata.scss");
	sass.render({file: cale_scss, sourceMap:true}, function(err, rezCompilare) {
		//console.log(nrImag);
		if (err) {
            console.log(`eroare: ${err.message}`);
            //to do: css default
            res.end();//termin transmisiunea in caz de eroare
            return;
        }
		fs.writeFileSync(cale_css, rezCompilare.css, function(err){
			if(err){console.log(err);}
		});
		res.sendFile(cale_css);
	});
	//varianta cu pachetul sass

});

app.get("*/galerie_animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie_animata.css.map"));
});

app.get("/produse", function(req,res){
    //console.log(req.query)
    var conditie=""
    if(req.query.categorie)
        conditie+=` and categorie='${req.query.categorie}'`;
    client.query(`select * from produse where 1=1 ${conditie}`, function(err,rez){
    if (!err){

        res.render("pagini/produse",{produse:rez.rows, optiuni:v_optiuni});     
    }
    }) 
});


app.get("/produs", function(req, res){
    //console.log(req.query)
    client.query(`select * from produse where id=${req.query.id}`, function(err,rez){
        if (!err){
            //console.log(rez);
            res.render("pagini/produs",{prod:rez.rows[0], optiuni:v_optiuni});
        }
        else{//TO DO curs
        }
    })
})


app.get(["/","/index"], function(req,res){
    //console.log(req.ip);
    //res.render("./index");//calea relativa la folderul views
    //creeazaImagini();
    
    res.render("pagini/index",{ip:req.ip, imagini:obImagini.imagini, cale:obImagini.cale_galerie, optiuni:v_optiuni});
});
app.get("/galerie_statica", function(req,res){
    //console.log(req.ip);
    //res.render("./index");//calea relativa la folderul views
    //creeazaImagini();
    res.render("pagini/galerie_statica",{imagini:obImagini.imagini, cale:obImagini.cale_galerie, optiuni:v_optiuni});
});



app.get("/*", function(req,res){
        //console.log(req.url);
        res.render("pagini/" + req.url, function(err,rezultatRender){
            if (req.url.includes(".ejs"))
                {
                    res.render("pagini/403");
                    return;
                }
            //console.log(err);
            if (err){
                
               res.render("pagini/404");
                    return;
        
                
            }
            else
            {
                res.send(rezultatRender);
            }

        });

});

app.listen(8080);
console.log("Server pornit!");