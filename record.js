import { exec }from "child_process";
import { schedule } from "node-cron";
import urlExist from "url-exist";
import * as fs from 'node:fs';

let FM_link = ["https://example.org/example.aac"]

console.log("Started.\n")

async function status(link_array, ind) {
    if (link_array.length == ind) return ind;
    if (await urlExist(link_array[ind])) return ind;
    ind++;
    return await status(link_array, ind)
}

async function StartRecording (FM_links, title, duration) {
    let now = new Date();
    let realdate = `${now.getFullYear()}`
    now.getMonth() < 9 ? realdate += `0${now.getMonth()+1}` : realdate += `${now.getMonth()+1}`
    now.getDate() < 10) ? realdate += `0${now.getDate()}` : realdate += `${now.getDate()}`
    let indic = await status(FM_links, 0)
    if (indic >= FM_links.length) {
        console.log(`⚠️ All links to record ${title} are unavailable ⚠️`)
    } else {
        console.log(`Ready to record from ${title.split("_")[0]} and save as ${title}.`)
        filename = `${realdate}_${title}`
        if (fs.existsSync(`${realdate}_${title}`)) {filename += `${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`}
        exec(`timeout ${duration} wget -O ${filename} ${FM_links[indic]}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    }
}

//Schedule recording here using cron format
schedule("0 0 0 * * *", async () => {
    StartRecording(FM_link, "Custom_title", "10s")
}, { timezone: "Europe/London" }); //https://github.com/node-cron/node-cron/issues/124
