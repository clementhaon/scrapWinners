const Router = require("express").Router;
const app = Router();
const {checkArray, returnLink, updateNameTeam, getPrincipalOdds, getOddsScore, twoGoals, getPickWithUrl, oddData} = require('../utils');
const {getRedisJsonAsync, setRedisJsonAsync} = require('../../redis');

const saveOdds = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;
        if (!returnLink(league)) return res.status(400).send({success: false});
        const urlink = returnLink(league);
        

        const result = await oddData(urlink);

        let arrayResult = [];

        //Get value on redis
        const resultRedis = await getRedisJsonAsync(league);

        let arrayDataPostman = Array.isArray(resultRedis) ? resultRedis : [];
        for (let i = 0; i < result.length; i++) {
            let resultFinalTmp = await getPickWithUrl(result[i].href);
            let resultFinal = resultFinalTmp.textContentFinal;
            let objectFinal = {
                key: result[i].href,
                homeTeam: resultFinalTmp.textNameFinal[0] ? resultFinalTmp.textNameFinal[0] : "erreur",
                awayTeam: resultFinalTmp.textNameFinal[1] ? resultFinalTmp.textNameFinal[1] : "erreur",
                value: []
            };

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
            let objectWinners = {};

            const principalOdds = getPrincipalOdds("Résultat", resultFinal);
            objectPrincipal.oddHome = principalOdds[0];
            objectPrincipal.oddDraw = principalOdds[1];
            objectPrincipal.oddAway = principalOdds[2];
            objectFinal.value.push(objectPrincipal)

            const doubleChanceOdds = getPrincipalOdds("Double chance", resultFinal)
            objectDoubleChance.homeOrDraw = doubleChanceOdds[0];
            objectDoubleChance.awayOrDraw = doubleChanceOdds[1]
            objectDoubleChance.awayOrHome = doubleChanceOdds[2]
            objectFinal.value.push(objectDoubleChance)
            const winnersOdds = getPrincipalOdds("Vainqueur", resultFinal)
            objectWinners.oddHome = winnersOdds[0];
            objectWinners.oddDraw = winnersOdds[1];

            objectFinal.value.push(objectWinners)

            const score = getOddsScore(resultFinal);
            let objectScore = {score: score};
            objectFinal.value.push(objectScore);

            const twoGoalsFinal = twoGoals(resultFinal);
            let objectTwoGoals = {twoGoals: twoGoalsFinal};
            objectFinal.value.push(objectTwoGoals);
            //check if the key exist in arrrayDataPostman
            let index = arrayDataPostman.findIndex(x => x.key === objectFinal.key);
            //if index exist delete this on arrayDataPostman
            if (index !== -1) {
                arrayDataPostman.splice(index, 1);
            }
            arrayDataPostman.push(objectFinal);
        }
        await setRedisJsonAsync(league, arrayDataPostman);
        return res.status(200).send(arrayDataPostman)
    } catch (e) {
        console.log(e);
        return res.status(500).send({success: false, message: e.message});
    }
}

app.get('/', saveOdds);

module.exports = app;