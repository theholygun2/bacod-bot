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

function chunkSubstr(str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size)
    }
    return chunks
}

function playNextResource(){
    if (audioStreams.length > 0) {return audioPlayer.play(createAudioResource(audioStreams.shift(), {inputType: StreamType.Arbitrary, inlineVolume:true}));}
      connection = getVoiceConnection(gameInfo.guild.id);
      connection.destroy();
  }

client.on("messageCreate", async (msg)=>{
    if(!msg.content.startsWith('` ')) return
    let text = msg.content.substring(2)
    if(text === 'stop ajg') return audioPlayer.stop(true)
    console.log(text)
    console.log(text.length)
    if(text.length > 200) {
        return
    }

    if(audioPlayer.state.status==="idle")
    {
        try {
            const stream=discordTTS.getVoiceStream(text);
            const audioResource=createAudioResource(stream, {inputType: StreamType.Arbitrary, inlineVolume:true});
        if(!voiceConnection || voiceConnection?.status===VoiceConnectionStatus.Disconnected){
            voiceConnection = joinVoiceChannel({
                channelId: msg.member.voice.channelId,
                guildId: msg.guildId,
                adapterCreator: msg.guild.voiceAdapterCreator,
            });
            voiceConnection=await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
        }
        
        if(voiceConnection.status===VoiceConnectionStatus.Connected){
            voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }            
        } catch (error) {
            console.log('error')
            return audioPlayer.stop({force: true})
        }
    }
});