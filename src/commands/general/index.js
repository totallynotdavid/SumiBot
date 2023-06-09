const { getAccessToken, searchTrack } = require('./spotify');

module.exports = {
    translate: {
        handler: async function(sock, message, messageObject, args) {
            const { translateText } = require('./translate');
            const text = args.join(' ');
            const translatedText = await translateText(text, 'en');
            await sock.sendMessage(messageObject.from, { 
                text: `${messageObject.botEmoji} ${translatedText}` 
            }, 
            { 
                quoted: message 
            });
        },
    },
    weather: {
        handler: async function(sock, message, messageObject, args) {
            const { getWeather } = require('./weather');
            const city = args.join(' ');
            const weather = await getWeather(city);
            if (weather) {
                await sock.sendMessage(messageObject.from, { 
                    text: `${messageObject.botEmoji} Temperatura actual en ${city}: ${weather}` 
                });
            } else {
                await sock.sendMessage(messageObject.from, { 
                    text: `${messageObject.botEmoji} Lo siento, no pudimos encontrar la temperatura en ${city}` 
                });
            }
        }
    },
    sticker: {
        handler: async function(sock, message, messageObject, args) {
            const { handler: makeSticker } = require('./sticker');
            await makeSticker(sock, message, messageObject, args);
            await sock.sendMessage(messageObject.from, { 
                text: `${messageObject.botEmoji} @${messageObject.senderNumber.split('@')[0]}, ya tenemos tu sticker.`, 
                mentions: [ messageObject.senderNumber ] 
            }, 
            { 
                quoted: message 
            });
        }
    },
    spot: {
        handler: async function(sock, message, messageObject, args) {
            const trackName = args.join(' ');
            const token = await getAccessToken();
            const { previewUrl, trackFoundName, artistFoundName } = await searchTrack(trackName, token);

            if (previewUrl) {
                await sock.sendMessage(
                    messageObject.from, 
                    { 
                        audio: { 
                            url: previewUrl 
                        },
                        ptt: true,
                    },
                    { 
                        quoted: message, 
                        mimetype: 'audio/mp4', 
                        filename: `${trackName}.mp3` 
                    }
                );
                await sock.sendMessage(messageObject.from, { 
                    text: `${messageObject.botEmoji} La canción que encontramos es: *${trackFoundName}* de *${artistFoundName}*` 
                });
            } else {
                await sock.sendMessage(
                    messageObject.from, 
                    { 
                        text: `${messageObject.botEmoji} Sorry, I couldn't find the track on Spotify.` 
                    }
                );
            }
        }
    },
};
