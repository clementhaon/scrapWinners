const Router = require("express").Router;
const app = Router();
const {getRedisJsonAsync, setRedisJsonAsync, getAllKeys} = require('../../redis');
const {checkArray, returnLink, updateNameTeam, getPrincipalOdds, getOddsScore, twoGoals, getPickWithUrl, oddData, getDateAndName} = require('../utils');


const saveRedis = async (req, res) => {
    try {

        const keys = await getAllKeys();

        const data = [];
        if (checkArray(keys)) {
            for (const key of keys) {
                const datum = await getRedisJsonAsync(key);
                let object = {
                    key: key,
                    value: datum
                };
                data.push(object)
            }
        }
        return res.status(200).send({success: true,data});
    } catch (e) {
        console.log(e)
        return res.status(500).send({success: false, message: e?.message ? e.message : e});
    }
};

const getDate = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;
        //get league redis
        
        const dataTmp = await getRedisJsonAsync(league);
        let data = checkArray(dataTmp) ? dataTmp : [];
        const url = returnLink(league);
        const dataArray = await getDateAndName(url);
        if (dataArray) {
            if (checkArray(dataArray.times, 19) && checkArray(dataArray.homeTeams, 19) && checkArray(dataArray.awayTeams, 19) ) {
                const datArrayTimes = dataArray.times;
                let datArrayHomeTeams = dataArray.homeTeams;
                let datArrayAwayTeams = dataArray.awayTeams;

                for (let i = 0; i < datArrayTimes.length; i++) {
                    let homeTeam = updateNameTeam(datArrayHomeTeams[i]);
                    let awayTeam = updateNameTeam(datArrayAwayTeams[i]);
                    let object = {
                        times: datArrayTimes[i],
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                    }
                    //check if object exist withe homeTeam and awayTeam in data
                    let index = data.findIndex(x => x.homeTeam === homeTeam && x.awayTeam === awayTeam);
                    //if index not exist push object in data
                    if (index === -1) data.push(object)
                }
                await setRedisJsonAsync(league, data);
            }
        }
        return res.status(200).send(data);
    } catch (e) {
        console.log(e)
        return res.status(500).send({success: false, message: e});
    }
}

const insertDate = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;

        let data = [];
        
        let lengthOdds;
        let arrayError = [];
        const date = await getRedisJsonAsync(`${league} Date`);
        const odds = await getRedisJsonAsync(league);
        if (checkArray(date) && checkArray(odds)) {
            lengthOdds = odds.length;
            for (const odd of odds) {
                if (odd.homeTeam && odd.awayTeam) {
                    for (const dateElement of date) {
                        let homeTeamDate;
                        let awayTeamData;
                        if (dateElement.homeTeam && dateElement.awayTeam) {
                            homeTeamDate = updateNameTeam(dateElement.homeTeam);
                            awayTeamData = updateNameTeam(dateElement.awayTeam);
                            if (homeTeamDate === odd.homeTeam && awayTeamData === odd.awayTeam) {
                                odd.time = dateElement.times
                            }
                        }
                    }
                    if (!odd.time) {
                        arrayError.push(odd);
                    }
                }
                data.push(odd);
            }

            await setRedisJsonAsync(`${league} Final`, data);

        }

        return res.status(200).send({data: data, lengthOdds, error: arrayError});

    } catch (e) {
        console.log(e)
        return res.status(500).send({success: false, message: e});
    }
}

const getResult = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;
        let data = [];
        const url = returnLink(league);
        const dataArray = await getDateAndName(url, true);
        if (dataArray) {
            if (checkArray(dataArray.times, 19) && checkArray(dataArray.homeTeams, 19) &&
                checkArray(dataArray.awayTeams, 19) && checkArray(dataArray.homeScores, 19) &&
                checkArray(dataArray.homeScoresHalf, 19) && checkArray(dataArray.awayScores, 19) &&
                checkArray(dataArray.awayScoresHalf, 19)) {


                const datArrayTimes = dataArray.times;
                let datArrayHomeTeams = dataArray.homeTeams;
                let datArrayAwayTeams = dataArray.awayTeams;
                let dataArrayHomeScores = dataArray.homeScores;
                let dataArrayAwayScores = dataArray.awayScores;
                let dataArrayHomeScoresHalf = dataArray.homeScoresHalf;
                let dataArrayAwayScoresHalf = dataArray.awayScoresHalf;

                for (let i = 0; i < datArrayTimes.length; i++) {
                    let homeTeam = updateNameTeam(datArrayHomeTeams[i]);
                    let awayTeam = updateNameTeam(datArrayAwayTeams[i]);
                    let object = {
                        times: datArrayTimes[i],
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        homeScore: dataArrayHomeScores[i],
                        homeScoreHalf: dataArrayHomeScoresHalf[i].replace(/[()]/g, ''),
                        awayScore: dataArrayAwayScores[i],
                        awayScoreHalf: dataArrayAwayScoresHalf[i].replace(/[()]/g, '')

                    }
                    data.push(object)
                }
                await setRedisJsonAsync(`${league}`, data);
            }
        }
        return res.status(200).send(data);

    } catch (e) {
        console.log(e)
        return res.status(500).send({success: false});
    }
}

const insertResult = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;

        let data = [];
        let lengthOdds;
        let arrayError = [];
        const result = await getRedisJsonAsync(`${league} Result`);
        const odds = await getRedisJsonAsync(`${league} Final`);

        if (checkArray(result) && checkArray(odds)) {
            lengthOdds = odds.length;
            for (const odd of odds) {
                if (odd.homeTeam && odd.awayTeam && odd.time) {
                    for (const resultElement of result) {
                        let homeTeamDate;
                        let awayTeamData;
                        if (resultElement.homeTeam && resultElement.awayTeam && resultElement.times) {
                            homeTeamDate = updateNameTeam(resultElement.homeTeam);
                            awayTeamData = updateNameTeam(resultElement.awayTeam);
                            if (homeTeamDate === odd.homeTeam && awayTeamData === odd.awayTeam && odd.time === resultElement.times) {
                                odd.homeScore = resultElement.homeScore
                                odd.awayScore = resultElement.awayScore
                                odd.homeScoreHalf = resultElement.homeScoreHalf
                                odd.awayScoreHalf = resultElement.awayScoreHalf
                            }
                        }
                    }
                    if (!odd.time) {
                        arrayError.push(odd);
                    }
                }
                data.push(odd);
            }
            await setRedisJsonAsync(`${league} Final`, data);
        }

        return res.status(200).send({data: data, lengthOdds, error: arrayError});

    } catch (e) {
        return res.status(500).send({success: false});
    }
};

const saveOddResult = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;

        let data = [];
        let lengthOdds;
        let arrayError = [];
        const odds = await getRedisJsonAsync(`${league} Final`);
        if (checkArray(odds)) {
            lengthOdds = odds.length;
            for (const odd of odds) {
                if (odd.homeTeam && odd.awayTeam && odd.time && odd.homeScore && odd.awayScore) {
                    data.push(odd);
                }
            }
            await setRedisJsonAsync(`${league} Final Result`, data);
        }

        return res.status(200).send({data: data, lengthOdds, error: arrayError});

    } catch (e) {
        console.log(e)
        return res.status(500).send({success: false, message: e?.message ? e.message : e});
    }

};


app.get('/save-redis', saveRedis);
app.get('/get-date', getDate);
app.get('/insert-date', insertDate);
app.get('/result', getResult);
app.get('/insert-result', insertResult);
app.get('/save-odd-result', saveOddResult);

module.exports = app;