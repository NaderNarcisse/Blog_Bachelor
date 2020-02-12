var express = require('express');
var exphbs = require('express-handlebars');
require("dotenv").config();
const session = require('express-session');
const mysql = require('mysql');
const {promisify} = require('util');
const bodyParser = require('body-parser');
const sanitize =require('xss');
var sha256 = require('js-sha256');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


// Connection BDD
const connection = mysql.createConnection({
    host        : "localhost",
    user        : process.env.DB_USUERNAME,
    password    : process.env.DB_PASSWORD,
    charset     : "utf8mb4"
});
connection.connect();
const query = promisify(connection.query).bind(connection);
//Fin de connection

app.use(session({
    secret: 's3Cur3',
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
}));





//Fonction d'attente !!!Ne fonctionne pas!!!
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Récupérer les id des articles publié
async function get_idarticle(){
    let id = await query("SELECT id FROM `article` WHERE `status` = 2;");
    let string=JSON.stringify(id);
    let json =  JSON.parse(string);
    var result=[];
    json.forEach(element => result.push(element["id"]));
    return await result;
}

//Récupérer les id des articles publié les plus vieux d'abord
async function get_idarticle_ASC(){
    let id = await query("SELECT id FROM `article` WHERE `status` = 2 ORDER BY date ASC;");
    let string=JSON.stringify(id);
    let json =  JSON.parse(string);
    var result=[];
    json.forEach(element => result.push(element["id"]));
    return await result;
}

//Récupérer les id des articles publié les plus récents d'abord
async function get_idarticle_DESC(){
    let id = await query("SELECT id FROM `article` WHERE `status` = 2 ORDER BY date DESC;");
    let string=JSON.stringify(id);
    let json =  JSON.parse(string);
    var result=[];
    json.forEach(element => result.push(element["id"]));
    return await result;
}

//Récupérer les id des articles publié
async function get_idnarticle(){
    let id = await query("SELECT id FROM `article` WHERE `status` = 1;");
    let string=JSON.stringify(id);
    let json =  JSON.parse(string);
    var result=[];
    json.forEach(element => result.push(element["id"]));
    return await result;
}

//Récupérer les id des articles publié
async function get_id_mes_article(id_art){
    let id = await query("SELECT id FROM `article` WHERE `id_authors` = ? and `status` != 3;",[id_art]);
    let string=JSON.stringify(id);
    let json =  JSON.parse(string);
    var result=[];
    json.forEach(element => result.push(element["id"]));
    return await result;
}

//Récupérer les id des users
async function get_idusers(){
    let id = await query("SELECT id FROM `users`;");
    let string=JSON.stringify(id);
    let json =  JSON.parse(string);
    var result=[];
    json.forEach(element => result.push(element["id"]));
    return await result;
}

//Changer la view de l'user
async function change_view(view,id){
    if(view==="article"){
        await query("UPDATE `users` SET `view` = '1' WHERE id = ?;",[id]);
    }else if(page === "NArt"){
        if(await get_role(id)>=2){
            await query("UPDATE `users` SET `view` = '2' WHERE id = ?;",[id]);
        }else{
            await query("UPDATE `users` SET `view` = '1' WHERE id = ?;",[id]);
        }
    }else if(page === "MesArt"){
        if(await get_role(id)>=1){
            await query("UPDATE `users` SET `view` = '3' WHERE id = ?;",[id]);}
        else{
            await query("UPDATE `users` SET `view` = '1' WHERE id = ?;",[id]);
        }
    }else if(page === "Voir_DESC"){
        await query("UPDATE `users` SET `view` = '4' WHERE id = ?;",[id]);
    }else if(page === "Voir_ASC"){
        await query("UPDATE `users` SET `view` = '5' WHERE id = ?;",[id]);
    }
}

//Récupérer la view d'un user en envoyant son id
async function get_view(UserID){
    let pseudo = await query("SELECT view FROM `users` where id = ?;",[UserID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await "unknown";
    }
    else{
        return await json[0]["view"];
    }}

//Récupérer le nom d'un user en envoyant son id
async function get_status_article(ArticleID){
    let pseudo = await query("SELECT status FROM `article` where id = ?;",[ArticleID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await 0;
    }
    else{
        return await json[0]["status"];
    }}

//Récupérer le dernier insert d'article
async function get_last_ins_article() {
    let cont_art = await query("SELECT LAST_INSERT_ID() FROM article;");
    let string = JSON.stringify(cont_art);
    let json =  JSON.parse(string);
    return await json[0]['LAST_INSERT_ID()'];
}

//Récupérer le contenu d'un article en envoyant son id
async function get_article(art) {
    let cont_art = await query("SELECT * FROM `article` where id = ?;",[art]);
    let string = JSON.stringify(cont_art);
    let json =  JSON.parse(string);
    return await json[0];
}

//Récupérer le nom d'un user en envoyant son id
async function get_nom(UserID){
    let pseudo = await query("SELECT nom FROM `users` where id = ?;",[UserID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await "unknown";
    }
    else{
        return await json[0]["nom"];
    }}

//Récupérer le prénom d'un user en envoyant son id
async function get_prenom(UserID){
    let pseudo = await query("SELECT prenom FROM `users` where id = ?;",[UserID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await "unknown";
    }
    else{
        return await json[0]["prenom"];
    }}

//Récupérer le pseudo d'un user en envoyant son id
async function get_pseudo(UserID){
    let pseudo = await query("SELECT pseudo FROM `users` where id = ?;",[UserID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await "unknown";
    }
    else{
        return await json[0]["pseudo"];
    }}

//Récupérer le mail d'un user en envoyant son id
async function get_mail(UserID){
    let pseudo = await query("SELECT mail FROM `users` where id = ?;",[UserID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await "unknown";
    }
    else{
        return await json[0]["mail"];
    }}

//Récupérer le mail d'un user en envoyant son id
async function get_annee(UserID){
    let pseudo = await query("SELECT AnneeBach FROM `users` where id = ?;",[UserID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await "unknown";
    }
    else{
        return await json[0]["AnneeBach"];
    }}

//Récupérer le role d'un user en envoyant son id
async function get_role(UserID){
    let pseudo = await query("SELECT role FROM `users` where id = ?;",[UserID]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await "unknown";
    }
    else{
        return await json[0]["role"];
    }}

async function get_user_id(mail, mdp){
    let pseudo = await query("SELECT id FROM `users` where mail = ? AND mdp = ?;",[mail, mdp]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return await 0;
    }
    else{
        return await json[0]["id"];
    }
}

async function get_if_mail(mail){
    let pseudo = await query("SELECT id FROM `users` where mail = ?",[mail]);
    let string=JSON.stringify(pseudo);
    let json =  JSON.parse(string);
    if(json.length===0){
        return 0;
    }
    return await json[0]["id"];
}

//Récupérer id users
async function Nb_user(){
    let id = await query("SELECT id FROM `users`");
    let string=JSON.stringify(id);
    let json =  JSON.parse(string);
    var result=[];
    json.forEach(element => result.push(element["id"]));
    return await result;
}







async function Voir_register(req, res, ctx){

    ctx["crea"] = 1;
    res.render('creationdecompte', ctx);

}

async function Voir_login(req, res, ctx){

    ctx["crea"] = 1;
    res.render('Login', ctx);

}

async function Voir_role(req, res, ctx){

    ctx["crea"] = 1;
    res.render('GestionRole', ctx);

}

async function Voir_profil(req, res, ctx){

    ctx["crea"] = 1;
    ctx["nom"] = await get_nom(req.session.id_name);
    ctx["prenom"] = await get_prenom(req.session.id_name);
    ctx["pseudo"] = await get_pseudo(req.session.id_name);
    ctx["annee"] = await get_annee(req.session.id_name);
    ctx["mail"] = await get_mail(req.session.id_name);
    res.render('UpdateCompte', ctx);

}


async function Voir_blog(req, res, ctx){

    if(await get_role(req.session.id_name)===3){
        ctx["admin"]=1;
    }
    if(await get_role(req.session.id_name)>=1){
        ctx["ecriture"]=1;
    }
    ctx["buton_Av_Ap"]=1;
    user_id=req.session.id_name;

// Ecriture de la page
    index=req.query.index;
    if(index===undefined){
        index=1;
    }
    if(index>0){pos=1;}
    else{pos=0;}
    index=index*10;
    index=index-10;

    if(await get_view(req.session.id_name)===1){
        var IdArticles=await get_idarticle();
    }else if(await get_view(req.session.id_name)===2){
        var IdArticles=await get_idnarticle();
    }else if(await get_view(req.session.id_name)===3){
        var IdArticles=await get_id_mes_article(req.session.id_name);
    }else if(await get_view(req.session.id_name)===4){
        var IdArticles=await get_idarticle_ASC();
    }else if(await get_view(req.session.id_name)===5){
        var IdArticles=await get_idarticle_DESC();
    }else{
        var IdArticles=[];
    }
    if(IdArticles.length>=index && pos===1){



        ctx["Nom"] = await get_pseudo(user_id);
        pos=((index+10)/10)-1;
        if(pos!==0){
            ctx["Av"] = pos;}
        if(IdArticles.length>index+10){
            ctx["Ap"] = ((index+10)/10)+1;}



        index=req.query.index;
        if(index===undefined){
            index=1;
        }
        index=index*10;
        index=index-10;
        for (let tour =0; tour < index; tour++){
            IdArticles.splice(0, 1);
        }
        if(IdArticles.length>10){
            max=10;
        }else{
            max=IdArticles.length;
        }

        for (let tour = 0; tour < max; tour++) {
            newArt=await get_article(IdArticles[tour]);
            newArt.id_authors=await get_pseudo(newArt.id_authors);
            if(newArt.Contenu.length>50){
                newArt.Contenu=newArt.Contenu.substr(0, 50)+" [...]";
            }
            newArt.Date=newArt.Date.substr(0, 10);
            newArt.possi=pos+1;
            ctx["Article"].push(newArt);
        }
// Fin de l'écriture


        res.render('blocarticle', ctx);
    }


    else{
        const ctx = {
            Nom : "Error",
            Article: [
                {
                    id: 2,
                    Titre: "Merci de ne pas toucher à l\'URL",
                    Image: '',
                    TitreDescription: "Merci de ne pas toucher à l\'URL",
                    Date: "Merci de ne pas toucher à l\'URL",
                    Contenu: "Merci de ne pas toucher à l\'URL",
                    id_authors: 2
                },
            ]};
        res.render('blocarticle', ctx);
    }



}

async function Voir_article(req, res, ctx){

    if(await get_role(req.session.id_name)===3){
        ctx["admin"]=1;
    }
    if(await get_role(req.session.id_name)>=1){
        ctx["ecriture"]=1;
    }
    
    user_id=req.session.id_name;

// Ecriture de la page
    index=req.query.index;
    if(index===undefined){
        index=1;
    }
    if(index==="addarticle"){console.log("Il faut rajouter des articles!!!")}
    if(index>0){pos=1;}
    else{pos=0;}
    index=index*10;
    index=index-10;
    let IdArticles=await get_idarticle();
    if(IdArticles.length>=index && pos===1){



        ctx["Nom"] = await get_pseudo(user_id);




        index=req.query.index;
        if(index===undefined){
            index=1;
        }
        index=index*10;
        index=index-10;
        for (let tour =0; tour < index; tour++){
            IdArticles.splice(0, 1);
        }
        if(IdArticles.length>10){
            max=10;
        }else{
            max=IdArticles.length;
        }

        newArt=await get_article(req.query.article);
        if(await get_role(req.session.id_name)>=2){
            newArt.writer="oui";
        }else if(await get_role(req.session.id_name)===1&&newArt.id_authors===req.session.id_name){
            newArt.writer="oui";
        }
        newArt.id_authors=await get_pseudo(newArt.id_authors);
        newArt.possi=req.query.index;
        newArt.Date=newArt.Date.substr(0, 10);
        if(await get_status_article(req.query.article)===2){
            //bouton "pubique coché"
            newArt.post=1;
            newArt.apost=1;
        }
        else {
            if(await get_role(req.session.id_name)>1){
                //Vois bouton publique
                newArt.apost=1;
                newArt.ppost=1;
            }
            //bouton "pubique PAS coché"
            newArt.ppost=1;
        }
        ctx["Article"].push(newArt);
// Fin de l'écriture


        if(req.query.edition==="True"&&await get_role(req.session.id_name)>=1){
            ctx["page_retour_art"]=req.query.index;
            ctx["page_retour_art_id"]=req.query.article;
            if(await get_status_article(newArt.id)!==3){
                ctx["statut_art"]=1;
            }
            res.render('articleEdition', ctx);
        }else if(req.query.edition==="Suprimmer"&&await get_role(req.session.id_name)>=1){
            if(await get_role(req.session.id_name)===1&&newArt.id_authors!==req.session.id_name){
                console.log("pas aut à suprimmer");
                ctx["page_retour"]=req.query.index;
                res.render('article', ctx);}
            else {
                const ctx = {
                Nom : "Unknown",
                Article: []};
                ctx["page_supr"]=newArt.Titre;
                await query("DELETE FROM `article` WHERE `article`.`id` = ?;",[req.query.article]);
                Voir_blog(req, res, ctx);
            }
        }
        else{
            ctx["page_retour"]=req.query.index;
            res.render('article', ctx);}
    }


    else{
        const ctx = {
            Nom : "Error",
            Article: [
                {
                    id: 2,
                    Titre: "Article inexistant",
                    Image: '',
                    TitreDescription: "Article inexistant",
                    Date: "Article inexistant",
                    Contenu: "Article inexistant",
                    id_authors: "Article inexistant"
                },
            ]};
        res.render('article', ctx);
    }

}



app.get('/',async function(req, res){
    await query("CREATE DATABASE IF NOT EXISTS blogbachelor;");
    await query("USE blogbachelor;");
    await query("CREATE TABLE IF NOT EXISTS `users` (`id` int(10) NOT NULL AUTO_INCREMENT,`mdp` varchar(255) NOT NULL,`nom` varchar(25) NOT NULL,`prenom` varchar(25) NOT NULL,`pseudo` varchar(25) NOT NULL,`mail` varchar(50) NOT NULL,`datenaiss` date NOT NULL,`AnneeBach` int(1) NOT NULL,`role` int(1) DEFAULT NULL,`view` int(2) NOT NULL,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=latin1;");
    await query("CREATE TABLE IF NOT EXISTS `article` (`id` int(10) NOT NULL AUTO_INCREMENT,`Titre` text,`Image` text,`TitreDescription` text,`Date` date NOT NULL,`Contenu` text,`id_authors` int(10) NOT NULL,`status` int(1) NOT NULL,PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=latin1;");



    const ctx = {
        Nom : "Unknown",
        Article: []};

    if(await get_role(req.session.id_name)>=1){
        ctx["writer"]="writer";
    }
    if(await get_role(req.session.id_name)>=2){
        ctx["publisher"]="publisher";
    }
    page = req.query.page;
    article=req.query.article;
    if(req.session.id_name){}else{req.session.id_name=0;}

    if(req.session.id_name !== 0 ){
        if(article!==undefined){
            Voir_article(req, res, ctx);
        }
        else if (page === "login") {
            Voir_login(req, res, ctx);
        } else if (page === "profil") {
            Voir_profil(req, res, ctx);
        } else if (page === "article"||page === "NArt"||page === "MesArt"||page === "Voir_ASC"||page === "Voir_DESC") {
            change_view(page,req.session.id_name);
            Voir_blog(req, res, ctx);
        } else if (page === "AddArt") {
            var time = new Date();
            time=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+(time.getDate()+1);
            await query("INSERT INTO `article` (`date`, `id_authors`, `status`) VALUES(?, ?, 3);",[time, req.session.id_name]);
            res.redirect('/?index=1&&article='+await get_last_ins_article()+'&&edition=True');
        } else if (page === "LogOut") {
            req.session.id_name=0;
            Voir_login(req, res, ctx);
        } else if (page === "role") {
            if(await get_role(req.session.id_name)===3){
                await query("DELETE FROM `article` WHERE `status` = 3;");
                Voir_role(req, res, ctx);
            }else{
                ctx["page_interdite"]=1;
                Voir_blog(req, res, ctx);
            }
        } else {
            Voir_blog(req, res, ctx);
        }
    }
    else{
        if (page === "register") {
            Voir_register(req, res, ctx);
        }else{
            Voir_login(req, res, ctx);
        }
    }
});



app.post('/', async function (req, res) {
    if(req.body.role){
        if(await get_role(req.session.id_name)===3){
            const mail = sanitize(req.body.mail);
            if(await get_if_mail(mail)===0){
                const ctx = {
                    Nom : "Unknown",
                    Article: []};

                ctx["error_no_mail"]=1;
                Voir_role(req, res, ctx);

            }
            else if(req.body.role==="aucun"){
                await query("UPDATE `users` SET `role` = NULL WHERE `users`.`mail` = ?;",[mail]);
                const ctx = {
                    Nom : "Unknown",
                    Article: []};
                ctx["maj_user"]=1;
                Voir_role(req, res, ctx);}
            else if(req.body.role==="writer"){
                await query("UPDATE `users` SET `role` = '1' WHERE `users`.`mail` = ?;",[mail]);
                const ctx = {
                    Nom : "Unknown",
                    Article: []};
                ctx["maj_user"]=1;
                Voir_role(req, res, ctx);}
            else if(req.body.role==="publisher"){
                await query("UPDATE `users` SET `role` = '2' WHERE `users`.`mail` = ?;",[mail]);
                const ctx = {
                    Nom : "Unknown",
                    Article: []};
                ctx["maj_user"]=1;
                Voir_role(req, res, ctx);}
            else if(req.body.role==="admin"){
                await query("UPDATE `users` SET `role` = '3' WHERE `users`.`mail` = ?;",[mail]);
                const ctx = {
                    Nom : "Unknown",
                    Article: []};
                ctx["maj_user"]=1;
                Voir_role(req, res, ctx);}
            else{
                const ctx = {
                    Nom : "Unknown",
                    Article: []};

                ctx["error_maj_user"]=1;
                Voir_role(req, res, ctx);
            }
        }else{
            const ctx = {
                Nom : "Unknown",
                Article: []};

            ctx["page_interdite"]=1;
            Voir_blog(req, res, ctx);
        }
    }
    else if(req.body.mdp2){
        const nom = sanitize(req.body.nom);
        const prenom = sanitize(req.body.prenom);
        const pseudo = sanitize(req.body.pseudo);
        const datnaiss = sanitize(req.body.datnaiss);
        const mail = sanitize(req.body.mail);
        let mdp1 = sanitize(req.body.mdp1);
        let mdp2 = sanitize(req.body.mdp2);
        const annee = sanitize(req.body.annee);

        if(mdp1 === mdp2){
            if(await get_if_mail(mail)===0){
                mdp1 = sha256(mdp1);
                var users=await get_idusers();
                if(users.length===0){
                    await query("INSERT INTO `users` (`id`, `mdp`, `nom`, `prenom`, `pseudo`, `mail`, `datenaiss`, `AnneeBach`, `role`, `view`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 3,1)",[mdp1, nom, prenom, pseudo, mail, datnaiss, annee]);
                }else{
                    await query("INSERT INTO `users` (`id`, `mdp`, `nom`, `prenom`, `pseudo`, `mail`, `datenaiss`, `AnneeBach`, `role`, `view`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, NULL,1)",[mdp1, nom, prenom, pseudo, mail, datnaiss, annee]);
                }
                const user_id = await get_user_id(mail, mdp1);
                req.session.id_name=user_id;
                res.redirect('/?page=article');}
            else{
                const ctx = {
                    Nom : "Unknown",
                    Article: []};
                ctx["error_mail"]=1;
                Voir_register(req, res, ctx);
            }
        }
        else{
            const ctx = {
                Nom : "Unknown",
                Article: []};
            ctx["error_mdp"]=1;
            Voir_register(req, res, ctx);
        }
        //let cont_art = await query("SELECT * FROM `article` where id = ?",[art]);
        //let string = JSON.stringify(cont_art);

    }
    else if(req.body.Unom) {
        await query("UPDATE `users` SET `nom` = ?, `prenom` = ?, `pseudo` = ?, `mail` = ?, `AnneeBach` = ? WHERE `users`.`id` = ?;",[req.body.Unom,req.body.Uprenom,req.body.Upseudo,req.body.Umail,req.body.Uannee,req.session.id_name]);
        const ctx = {
            Nom : "Unknown",
            Article: []};
        ctx["Maj_info"]=1;
        Voir_blog(req, res, ctx);
    }
    else if(req.body.Amdp) {
        let mdp = sanitize(req.body.Amdp);
        mdp = sha256(mdp);
        const user_id=await get_user_id(await get_mail(req.session.id_name), mdp);
        if(user_id===0){
            const ctx = {
                Nom : "Unknown",
                Article: []};
            ctx["error_mdp_change"]=1;
            Voir_profil(req, res, ctx);
        }
        else if(req.body.Nmdp1 === req.body.Nmdp2){
            let nmdp = sha256(req.body.Nmdp1);
            await query("UPDATE `users` SET `mdp` = ? WHERE `users`.`id` = ?;",[nmdp,req.session.id_name]);
        const ctx = {
            Nom : "Unknown",
            Article: []};
        ctx["Maj_mdp"]=1;
        Voir_blog(req, res, ctx);}
        else{
                const ctx = {
                    Nom : "Unknown",
                    Article: []};
                ctx["error_mdp"]=1;
                Voir_profil(req, res, ctx);
            }
    }
    else if(req.body.desctitreee){
        var time = new Date();
        time=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+(time.getDate()+1);
        if(req.body.publique==="on"){
            await query("UPDATE `article` SET `Titre` = ?, `TitreDescription` = ?, `Date` = ?,`Contenu` = ?,`status` = '2' WHERE `article`.`id` = ?;",[req.body.titre,req.body.desctitreee,time,req.body.article,req.query.article]);
        }else{
            await query("UPDATE `article` SET `Titre` = ?, `TitreDescription` = ?, `Date` = ?,`Contenu` = ?,`status` = '1' WHERE `article`.`id` = ?;",[req.body.titre,req.body.desctitreee,time,req.body.article,req.query.article]);
        }
        const ctx = {
            Nom : "Unknown",
            Article: []};
        res.redirect('/?index='+req.query.index+'&&article='+req.query.article);
    }
    else{
        const mail = sanitize(req.body.mail);
        let mdp1 = sanitize(req.body.mdp1);
        mdp1 = sha256(mdp1);
        const user_id=await get_user_id(mail, mdp1);
        if(user_id===0){
            const ctx = {
                Nom : "Unknown",
                Article: []};
            ctx["error_log"]=1;
            Voir_login(req, res, ctx);
        }
        else{
            req.session.id_name=user_id;
            res.redirect('/?page=pageprincipale');
        }

    }
});


app.listen(3000);
