const Router = require("express").Router;
const app = Router();
const {checkArray, returnLink, updateNameTeam, getDateAndName} = require('../utils');
const Event = require('../../model').Events;
const League = require('../../model').Leagues;

const getDateByLeague = async (req, res) => {
    try {
        if (!req.query || !req.query.league) return res.status(400).send({success: false});
        const league = req.query.league;
        //get league redis
        const findLeague = await League.findOne({
            where: {
                league: league
            }, 
            include: {model: Event}
        });
        if (!findLeague) return res.status(400).send({success: false});
        const dataTmp = findLeague.events;
        // return res.status(200).send(dataTmp);
        // const dataTmp = await getRedisJsonAsync(league);
        let data = checkArray(dataTmp) ? dataTmp : [];
        const url = returnLink(league + " Date");
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
                    for (datum of data) {
                        if (datum.homeTeam === homeTeam && datum.awayTeam === awayTeam && datum.time === null) {
                            const updateEvent = await Event.update(
                                {
                                    time: datArrayTimes[i]
                                }, 
                                {
                                    where: {
                                        id: datum.id
                                    }
                                }
                            );
                            if (updateEvent == 0) {
                                return res.status(400).send({success: false, message : "update event fail", eventId: datum.id});
                            }
                            break;
                        }
                    }
                    //check if object exist withe homeTeam and awayTeam in data
                    // let index = data.findIndex(x => x.homeTeam === homeTeam && x.awayTeam === awayTeam);
                    //if index not exist push object in data
                    // if (index === -1) data.push(object)
                }
                //await setRedisJsonAsync(league, data);
            }
        }
        return res.status(200).send(data);
    } catch (e) {
        console.log(e)
        return res.status(500).send({success: false, message: e});
    }
}

app.get('/', getDateByLeague);

module.exports = app;