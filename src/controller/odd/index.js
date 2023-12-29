const Router = require("express").Router;
const app = Router();
const {checkArray, returnLink, updateNameTeam, getPrincipalOdds, getOddsScore, twoGoals, getPickWithUrl, oddData} = require('../utils');
const {getRedisJsonAsync, setRedisJsonAsync} = require('../../redis');
const League = require('../../model').Leagues;
const Sport = require('../../model').Sports;
const Events = require('../../model').Events;

const saveOdds = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;
        if (!returnLink(league)) return res.status(400).send({success: false});
        const urlink = returnLink(league);
        
        //get league on db
        const leagueDb = await League.findOne({
            where: {
                league: league
            }
        });

        if (!leagueDb) return res.status(400).send({success: false});
        const leagueId = leagueDb.id;
        const sportId = leagueDb.sportId;

        //return res.status(200).send(leagueDb);

        const result = await oddData(urlink);

        let arrayResult = [];
        let eventsArray = [];

        //Get value on redis
        // const resultRedis = await getRedisJsonAsync(league);

        // let arrayDataPostman = Array.isArray(resultRedis) ? resultRedis : [];

        for (let i = 0; i < result.length; i++) {
            let resultFinalTmp = await getPickWithUrl(result[i].href);
            let resultFinal = resultFinalTmp.textContentFinal;
            let objectFinal = {
                key: result[i].href,
                homeTeam: resultFinalTmp.textNameFinal[0] ? resultFinalTmp.textNameFinal[0] : "erreur",
                awayTeam: resultFinalTmp.textNameFinal[1] ? resultFinalTmp.textNameFinal[1] : "erreur",
                value: []
            };
            let objectEvent = {
                url: result[i].href,
                homeTeam: resultFinalTmp.textNameFinal[0] ? resultFinalTmp.textNameFinal[0] : "erreur",
                awayTeam: resultFinalTmp.textNameFinal[1] ? resultFinalTmp.textNameFinal[1] : "erreur",
                sportId: sportId,
                leagueId: leagueId
            }
            eventsArray.push(objectEvent);

            let indexDebut = resultFinal.indexOf("les plus joués");

            let indexFin = -1;
            for (let i = resultFinal.length - 1; i >= 0; i--) {
                if (resultFinal[i] === "Sélectionner") {
                    indexFin = i;
                    break;
                }
            }

            if (indexDebut !== -1 && indexFin !== -1) {
                resultFinal.splice(indexDebut + 1, indexFin - indexDebut - 1);
            }

            let objectPrincipal = {};
            let objectDoubleChance = {};
            // let objectWinners = {};

            const principalOdds = getPrincipalOdds("Résultat", resultFinal);
            objectPrincipal.oddHome = principalOdds[0];
            objectPrincipal.oddDraw = principalOdds[1];
            objectPrincipal.oddAway = principalOdds[2];
            objectFinal.value.push(objectPrincipal)

            const doubleChanceOdds = getPrincipalOdds("Double chance", resultFinal);
            objectDoubleChance.homeOrDraw = doubleChanceOdds[0];
            objectDoubleChance.awayOrDraw = doubleChanceOdds[1];
            objectDoubleChance.awayOrHome = doubleChanceOdds[2];
            objectFinal.value.push(objectDoubleChance);
            // const winnersOdds = getPrincipalOdds("Vainqueur", resultFinal);
            // objectWinners.oddHome = winnersOdds[0];
            // objectWinners.oddDraw = winnersOdds[1];

            // objectFinal.value.push(objectWinners);

            const score = getOddsScore(resultFinal);
            let objectScore = {score: score};
            objectFinal.value.push(objectScore);

            const twoGoalsFinal = twoGoals(resultFinal);
            let objectTwoGoals = {twoGoals: twoGoalsFinal};
            objectFinal.value.push(objectTwoGoals);
            //check if the key exist in arrrayDataPostman
            //let index = arrayDataPostman.findIndex(x => x.key === objectFinal.key);
            //if index exist delete this on arrayDataPostman
            // if (index !== -1) {
            //     arrayDataPostman.splice(index, 1);
            // }
            arrayResult.push(objectFinal);
        }
        if (eventsArray.length > 0) {
            const insertEvents = await Events.bulkCreate(eventsArray);
            console.log(insertEvents);
        }
        if (arrayResult.length > 0) {
            for (arrayResultObject of arrayResult) {
                const findEvent = await Events.findOne({
                    where: {
                        url: arrayResultObject.key
                    }
                });
                if (findEvent) {
                    const eventId = findEvent.id;
                    for (valueObject of arrayResultObject.value) {
                        const insertOdd = await Odd.create({
                            
                            oddHome: valueObject.oddHome,
                            oddDraw: valueObject.oddDraw,
                            oddAway: valueObject.oddAway,
                            homeOrDraw: valueObject.homeOrDraw,
                            awayOrDraw: valueObject.awayOrDraw,
                            awayOrHome: valueObject.awayOrHome,
                            score: valueObject.score,
                            twoGoals: valueObject.twoGoals
                        });
                        console.log(insertOdd);
                    }
                }
            
            }
        }
        //await setRedisJsonAsync(league, arrayDataPostman);
        return res.status(200).send({success: true});
    } catch (e) {
        console.log(e);
        return res.status(500).send({success: false, message: e.message});
    }
}

app.get('/', saveOdds);

module.exports = app;