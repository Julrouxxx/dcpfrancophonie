const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const fs = require('fs');
const express = require('express')
const app = express()
const port = 3055
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds
	]
});
let list1 = [];
let list2 = [];

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    c.user.setPresence({
        activities: [{name: " tes conversations", type: ActivityType.Watching}]
    })
});

client.on(Events.MessageCreate, m => {
    if(m.author.id === client.user.id) return;
    let message = " " + m.content.toUpperCase() + " ";
try{
    if(list2.some(v => message.includes(" " + v.trigger + " "))){
        const v = list2.find(v => message.includes(" " + v.trigger + " "));
        m.reply(`Attention au nom ! Tu ne diras pas **${v.trigger.toLowerCase()}**, tu diras **${v.replace}**. ☝️🫠`).catch(err =>{
            console.log(err)  
        })
        return;    
    }
    if(list1.some(v => message.includes(" " + v.trigger + " "))){
        const v = list1.find(v => message.includes(" " + v.trigger + " "));
        m.reply(`Attention aux anglicismes ! Tu ne diras pas **${v.trigger.toLowerCase()}**, tu diras **${v.replace}**. ☝️🤓`).catch(err =>{
            console.log(err)  
        })
        return;
    }
}catch(err){
	console.log(err)
}
});


try{
    let data = fs.readFileSync('liste1.json');
    let parsedData = JSON.parse(data);
    parsedData = parsedData.map(element => {
        return {trigger: element.trigger.toUpperCase(), replace: element.replace}
    });
    list1.push(...parsedData);
    data = fs.readFileSync('liste2.json');
    parsedData = JSON.parse(data);
    parsedData = parsedData.map(element => {
        return {trigger: element.trigger.toUpperCase(), replace: element.replace}
    });
    list2.push(...parsedData);
    console.log("Data loaded");
}catch(e){
        console.log('No data found', e);
}


client.login(process.env.BOT_TOKEN);

app.use(bodyParser.json());

app.get("/", (_, res)=> {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.get("/list1", (_, res)=> {
    res.send(list1)
})

app.get("/list2", (_, res)=> {
    res.send(list2)
})

app.post("/list1", (req, res)=>{
    console.log(req.body)
    const parsedData = (req.body).map(element => {
        return {trigger: element.trigger.toUpperCase(), replace: element.replace}
    });
    list1 = parsedData;
    console.log('Saving data list2');
	const data = JSON.stringify(list1);
	fs.writeFileSync('liste1.json', data);
    res.send("OK")
})

app.post("/list2", (req, res)=>{

    const parsedData = (req.body).map(element => {
        return {trigger: element.trigger.toUpperCase(), replace: element.replace}
    });
    list2 = parsedData;
    console.log('Saving data list2');
	const data = JSON.stringify(list2);
	fs.writeFileSync('liste2.json', data);
    res.send("OK")
})

app.post("/message", (req, res)=>{
    try{
    const channelId = req.body.channelId;
    const message = req.body.message;
    const channel = client.channels.cache.get(channelId);
    channel.send(message);
    res.send("OK")
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    }
})

app.listen(port, () => {
    console.log("Serveur web lancé sur ", port);
})
