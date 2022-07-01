import * as fs from 'fs';
import { stringify } from 'querystring';
import { ReadLine, createInterface } from 'readline';

type Gezeit = {
    date: Date,
    type: "H" | "T",
    height: number
}

async function convert() {
    const fileStream = fs.createReadStream('./vegesack.txt')
    const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    const gezeiten: Gezeit[] = [];
    
    let start = false;
    for await (const line of rl) {
        if(line === 'LLL#') {
            start = true
            continue
        }
        if(start) {
            if(line === 'EEE#') {
                start = false;
                continue
            }
            const data = line.split('#').map(s => s.trim())
            gezeiten.push({
                date: getDate(data[5], data[6]),
                type: data[3] as "H" | "T",
                height: parseFloat(data[7])
            });
        }
    }
    fs.writeFileSync('./vegesack.json', JSON.stringify(gezeiten));
}

function getDate(day: String, time: String): Date {
    const dayMatches = day.match(/([ \d]?\d)\.([ \d]\d)\.(\d{4})/);
    const timeMatches = time.match(/(\d{1,2}):(\d{2})/)
    return new Date(Date.UTC(parseInt(dayMatches[3]), parseInt(dayMatches[2])-1, parseInt(dayMatches[1]), parseInt(timeMatches[1])-1, parseInt(timeMatches[2])));
}

convert();