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
    if(!msg.content.startsWith("' ")) return
    if(!msg.member.voice.channelId) return msg.reply("Tolong join dahulu ke dalam voice channel ^^ (╯ ͡❛ ͜ʖ ͡❛)╯┻━┻")
    let text = msg.content.substring(2)
    if(text === 'stop ajg') return audioPlayer.stop(true)
    if(text.length > 200) {
        return
    }
    console.log(audioPlayer.state.status)
    if(audioPlayer.state.status==="idle")
    {
        console.log('audio is idle')
        try {
            const stream=discordTTS.getVoiceStream(text);
            const audioResource=createAudioResource(stream, {inputType: StreamType.Arbitrary, inlineVolume:true});
            
            if(voiceConnection) console.log(`vc.state.status: ${voiceConnection.state.status}`)
            if(!voiceConnection || voiceConnection?.status===VoiceConnectionStatus.Disconnected){
            voiceConnection = joinVoiceChannel({
                channelId: msg.member.voice.channelId,
                guildId: msg.guildId,
                adapterCreator: msg.guild.voiceAdapterCreator,
            });
            voiceConnection=await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
            console.log(voiceConnection.state)
        }
        if(voiceConnection.status===VoiceConnectionStatus.Connected){
            console.log(voiceConnection.status)
            //console.log(voiceConnection)
            console.log(msg.member.voice.channelId)
            voiceConnection.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }            
        } catch (error) {
            console.log(error)
            return audioPlayer.stop({force: true})
        }
    }
});