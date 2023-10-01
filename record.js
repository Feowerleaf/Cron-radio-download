import { exec }from "child_process";
import { link } from "fs";
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
    if (now.getMonth() < 9) {
      realdate = realdate + `0${now.getMonth()+1}`
    } else {
      realdate = realdate + `${now.getMonth()+1}`
    }
    if (now.getDate() < 10) {
        realdate = realdate + `0${now.getDate()}`
    } else {
        realdate = realdate + `${now.getDate()}`
    }
    let indic = await status(FM_links, 0)
    if (indic >= FM_links.length) {
        console.log(`⚠️ All links to record ${title} are unavailable ⚠️`)
    } else {
        console.log(`Ready to record from ${title.split("_")[0]} and save as ${title}.`)
        let filename = ""
        if (!fs.existsSync(`${realdate}_${title}`)) {filename = `${realdate}_${title}`} else {
            filename = `${realdate}_${title}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`
        }
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

schedule("0 0 0 * * *", async () => {
    StartRecording(FM_link, "Custom_title", "10s")
}, { timezone: "Europe/London" }); //https://github.com/node-cron/node-cron/issues/124
