const secret = require('./secret.json'); //file with your bot credentials/token/etc
const discordTTS=require("./tts");
const {Client, Intents} = require("discord.js");
const {AudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, joinVoiceChannel, AudioPlayerStatus} = require("@discordjs/voice");

const intents=
[
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILDS
];

const client = new Client({intents:intents});
client.login(secret.token);

client.on("ready", () => console.log("Online"));

let voiceConnection;
let audioPlayer=new AudioPlayer();

client.on("messageCreate", async (msg)=>{
    if(!msg.content.startsWith("' ") || msg.author.bot ) return
    if(!msg.member.voice.channelId) return msg.reply("Tolong join dahulu ke dalam voice channel ^^ (╯ ͡❛ ͜ʖ ͡❛)╯┻━┻")
    const regex = /<@[0-9]+>/
    let text = msg.content.substring(2)
    text = text.replace(regex, " ")
    if(text.length > 200) {
        return
    }
    //console.log(audioPlayer.state.status)
    if(audioPlayer.state.status==="idle")
    {
        console.log('audio is idle')
        try {
            const stream=discordTTS.getVoiceStream(text);
            const audioResource=createAudioResource(stream, {inputType: StreamType.Arbitrary, inlineVolume:true});
            
            if(voiceConnection) console.log(`vc.state.status: not null and ${voiceConnection.state.status}`)
            if(!voiceConnection || voiceConnection?.status===VoiceConnectionStatus.Disconnected){
            voiceConnection = joinVoiceChannel({
                channelId: msg.member.voice.channelId,
                guildId: msg.guildId,
                adapterCreator: msg.guild.voiceAdapterCreator,
            });
            voiceConnection=await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
            //console.log(`voice connection status: ${voiceConnection.state.status}`)
        }
        if(voiceConnection.status===VoiceConnectionStatus.Connected){
            //console.log(voiceConnection?.status===VoiceConnectionStatus.Connected)
            voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }            
        } catch (error) {
            console.log(error)
            return audioPlayer.stop({force: true})
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  
    // Represents a mute/deafen update
    if(oldState.channelId === newState.chanelId) return console.log('Mute/Deafen Update');
  
    // Some connection
    if(!oldState.channelId && newState.channelId) return console.log('Connection Update');
  
    // Disconnection
    if(oldState.channelId && !newState.channelId){
      console.log('Disconnection Update');
      // Bot was disconnected?
      //console.log(newState.id)
      //console.log(oldState.id)
      if(newState.id === client.user.id) {
        voiceConnection = null 
        audioPlayer.stop({force: true})
        return 
      }

    //   if (newState.member.user !== newState.member.user) member.voice.setMute(false)

    }
});