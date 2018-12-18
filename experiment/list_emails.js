const fs = require('fs');
const readline = require('readline');

const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ["https://mail.google.com/"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        return callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            return callback(oAuth2Client);
        });
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEmail(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    var res = await gmail.users.messages.list({ userId: 'me' });
    //console.log(res.data);
    var emails_data = [];
    //for cycle over returned messages, each message has dictionary with id in it
    for (var i = 0; i < res.data.messages.length; i++) {   //here we request for each message from the list of messages and get the message itself
        emails_data.push(await gmail.users.messages.get({ userId: 'me', id: res.data.messages[i]["id"] }));
    }
    var emails = [];
    emails_data.forEach(email => {
        var data = {};
        data["date"] = email["headers"]["date"];
        for (var i = 0; i < email["data"]["payload"]["headers"].length; i++) {

            if (email["data"]["payload"]["headers"][i]["name"] === "From") {
                data["From"] = email["data"]["payload"]["headers"][i]["value"];
            }
            if (email["data"]["payload"]["headers"][i]["name"] === "To") {
                data["To"] = email["data"]["payload"]["headers"][i]["value"];
            }
            if (email["data"]["payload"]["headers"][i]["name"] === "Subject") {
                data["Subject"] = email["data"]["payload"]["headers"][i]["value"];
            }
        }
        data["message"] = email["data"]["snippet"];
        emails.push(data);

    });
    return emails;
}
//auth is object containing the login to google api
async function sendEmailInsideFun(auth, from, to, message_in, subject) {
    // You can use UTF-8 encoding for the subject using the method below.
    // You can also just use a plain string if you don't need anything fancy.
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    //var from = "mr851837@gmail.com";
    //var to = "mr851837@gmail.com";
    const messageParts = [
        'From: <' + from + '>',
        'To: <' + to + '>',
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        message_in
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    //creating the google api object with auth being the authetication client
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    });
    console.log(res.data);
    return res.data;
}

async function GetEmails() {
    // Load client secrets from a local file.
    var credentials = fs.readFileSync('credentials.json', (err, content) => {
        // Authorize a client with credentials, then call the Gmail API. 
    });
    var ret = await authorize(JSON.parse(credentials), listEmail);
    return ret;
}

async function SendEmail(from, to, message, subject) {
    // Load client secrets from a local file.
    var credentials = fs.readFileSync('credentials.json', (err, content) => {
        // Authorize a client with credentials, then call the Gmail API. 
    });
    authorize(JSON.parse(credentials), function (auth) { sendEmailInsideFun(auth, from, to, message, subject); });
}
let emails = GetEmails().then(function (result){
    console.log(result);
}).then(function (result){
    console.log(result);
});
