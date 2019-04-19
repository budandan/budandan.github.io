var currentRoster = [];
var lockedHeroes = [];
var showChangelog = false;
var showInstructions = false;
if (localStorage.getItem("Heroes") != null)
currentRoster = JSON.parse(localStorage.getItem("Heroes"));
$(document).ready(function () {
    for (var i = 0; i < allHeroes.length; i++) {
        document.getElementById('heroes-to-add').innerHTML += `
            <option value='${allHeroes[i].name}'>${allHeroes[i].name}</option>
        `;
    }
    updateRosterBox(currentRoster);
    checkForFourHeroes();
    
    // make select2
    $.fn.select2.defaults.set("width", null);
    $('#heroes-to-add').select2({
        placeholder: "Type your hero name",
        theme: "bootstrap"
    });
});

function toggleChangelog() {
    showChangelog = showChangelog == false ? true : false;
    if (showChangelog == true) {
        $("#changelog-wrapper").show(50);
        $("#changelog").html(`<i class="fas fa-caret-down"></i> Hide Changelog`);
    } else {
        $("#changelog").html(`<i class="fas fa-caret-right"></i> Show Changelog`);
        $("#changelog-wrapper").hide(50);
    }
}

function toggleInstructions() {
    showChangelog = showChangelog == false ? true : false;
    if (showChangelog == true) {
        $("#instructions-wrapper").show(50);
        $("#instructions").html(`<i class="fas fa-caret-down"></i> Hide Instructions`);
    } else {
        $("#instructions").html(`<i class="fas fa-caret-right"></i> Show Instructions`);
        $("#instructions-wrapper").hide(50);
    }
}

function setErrorMessage(message) {
    document.getElementById('error-message').innerHTML = message;
}

function setLockErrorMessage(message) {
    document.getElementById('lock-error-message').innerHTML = message;
}

function addHeroToRoster() {
    let newHeros = $('#heroes-to-add').select2('data');
    let roster = document.getElementById('roster-output');
    for (const newHero of newHeros) {
        if (currentRoster.includes(newHero.text)) {
            setErrorMessage("Hero already exists in roster.")
        } else {
            let sid = newHero.text.replace(/ /g, '_');
            roster.innerHTML += `
                <div class='row' id='${newHero.text}'>
                    <div class='col-xs-9'>${newHero.text}</div> 
                    <div class='col-xs-1 text-right' id='lock-${sid}'>
                            <i class="fas fa-lock-open" style='cursor: pointer; color: grey;' onclick='lockHero("${newHero.text}", "${sid}")'></i>
                        </div>    
                    <div class='col-xs-1 text-right'>
                        <i class="fas fa-times" style='cursor: pointer; color: red;' onclick='removeHeroFromRoster("${newHero.text}", ${sid})'></i>
                    </div>    
                </div>
            `;
            currentRoster.push(newHero.text);
            setErrorMessage("");
        }
    }
    checkForFourHeroes();
    localStorage.setItem("Heroes", JSON.stringify(currentRoster));

    // Clear value in select box
    $('#heroes-to-add').val(null).trigger("change");
}

function lockHero(hero, sid) {
    if (lockedHeroes.length >= 3) {
        setLockErrorMessage("You can only lock up to three heroes.");
    } else {
        $('#lock-' + sid).html(`<i class="fas fa-lock" style='cursor: pointer; color: #33E3FF;' onclick='unlockHero("${hero}", "${sid}")'></i>`);
        lockedHeroes.push(hero);
    }
    checkForThreeLockedHeroes();
}

function unlockHero(hero, sid) {
    $('#lock-' + sid).html(`<i class="fas fa-lock-open" style='cursor: pointer; color: grey;' onclick='lockHero("${hero}", "${sid}")'></i>`);
    lockedHeroes.splice(lockedHeroes.indexOf(hero), 1);
    checkForThreeLockedHeroes();
    setLockErrorMessage("<br>");
}

function updateRosterBox(currentRoster) {
    let roster = document.getElementById('roster-output');
    roster.innerHTML = "";
    if (currentRoster != null) {
        for (var i = 0; i < currentRoster.length; i++) {
            let sid = currentRoster[i].replace(/ /g, '_');
            roster.innerHTML += `
                <div class='row' id='${currentRoster[i]}'>
                    <div class='col-xs-9'>${currentRoster[i]}</div> 
                    <div class='col-xs-1 text-right' id='lock-${sid}'>
                        <i class="fas fa-lock-open" style='cursor: pointer; color: grey;' onclick='lockHero("${currentRoster[i]}", "${sid}")'></i>
                    </div>    
                    <div class='col-xs-1 text-right'>
                        <i class="fas fa-times" style='cursor: pointer; color: red;' onclick='removeHeroFromRoster("${currentRoster[i]}", "${sid}")'></i>
                    </div>    
                </div>
            `;
        }
    }
}

function checkForThreeLockedHeroes() {
    if (lockedHeroes.length >= 3) {
        $("#add-fourth-hero-prompt").html(`
            <p class='text-center'>
                You have three heroes locked. Would you like to find the best fourth hero out of all heroes?
                <br>
                <br>
                <button class='btn btn-primary btn-sm' data-toggle="modal" data-target="#find-fourth-modal" onclick='findFourth()'>Find My Fourth!</button>
            </p>
        `)
    } else {
        $("#add-fourth-hero-prompt").html("<br>")
    }
}

function checkForFourHeroes() {
    if (currentRoster.length >= 4) {
        $("#calc-btn").attr('disabled', false);
    } else {
        $("#calc-btn").attr('disabled', true);
    }
}

function removeHeroFromRoster(hero, sid) {
    document.getElementById(hero).remove();
    checkForFourHeroes();
    currentRoster.splice(currentRoster.indexOf(hero), 1);
    if (lockedHeroes.includes(hero)) {
        lockedHeroes.splice(lockedHeroes.indexOf(hero), 1);
    }
    checkForThreeLockedHeroes();
    localStorage.setItem("Heroes", JSON.stringify(currentRoster));
}

var arrOfPossibleTeams = [];
const TEAM_SIZE = 4;
let output = document.getElementById("results");
let findFourthOutput = document.getElementById("find-fourth-target");
let loader = $("#loader");
let outputWrapper = $("#results-wrapper");

function findFourth() {
    let arrOfPossibleTeamsContainingLockedHeroes = [];
    findFourthOutput.innerHTML = "";
    let arrOfOutcomes = [];
    let teams_to_output = document.getElementById("num-of-teams").value;
    let lockedHeroesPlaceholderArr = [];
    for (let a = 0; a < allHeroes.length; a++) {
        let fourthHeroName = allHeroes[a].name;
        lockedHeroesPlaceholderArr = [];
        lockedHeroesPlaceholderArr = lockedHeroes.slice();
        if (!lockedHeroesPlaceholderArr.includes(fourthHeroName)) {
            lockedHeroesPlaceholderArr.push(fourthHeroName);
            arrOfPossibleTeamsContainingLockedHeroes.push(lockedHeroesPlaceholderArr.slice());
        }
    }
    for (var i = 0; i < arrOfPossibleTeamsContainingLockedHeroes.length; i++) {
        let result = determineBestChatOptionsFromTeam(arrOfPossibleTeamsContainingLockedHeroes[i]);
        arrOfOutcomes.push(result);
    }
    arrOfOutcomes.sort(compareScores);
    for (var i = 0; i < arrOfOutcomes.length; i++) {
        let teamOutputString = "";
        for (var teamCounter = 0; teamCounter < arrOfOutcomes[i].team.length; teamCounter++) {
            if (lockedHeroes.includes(arrOfOutcomes[i].team[teamCounter])) {
                teamOutputString += `<b>${arrOfOutcomes[i].team[teamCounter]}</b>`;
            } else {
                teamOutputString += arrOfOutcomes[i].team[teamCounter]
            }
            if (teamCounter != arrOfOutcomes[i].team.length - 1) {
                teamOutputString += ", ";
            }
        }
        let bestChatOption1OutputString = arrOfOutcomes[i].bestChatOption1.hero.name + " - " + arrOfOutcomes[i].bestChatOption1.option.toString().replace('_', " ");
        let bestChatOption2OutputString = arrOfOutcomes[i].bestChatOption2.hero.name + " - " + arrOfOutcomes[i].bestChatOption2.option.toString().replace('_', " ");
        bestChatOption1OutputString = uppercaseWords(bestChatOption1OutputString);
        bestChatOption2OutputString = uppercaseWords(bestChatOption2OutputString);
        findFourthOutput.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${teamOutputString}</td>
                <td>
                    ${bestChatOption1OutputString}
                    <br>
                    ${bestChatOption2OutputString}
                </td>
                <td>${arrOfOutcomes[i].score}</td>
            </tr>
        `;
    }
}

function calculateOptimalTeam() {
    arrOfPossibleTeamsContainingLockedHeroes = [];
    output.innerHTML = "";
    loader.show();
    outputWrapper.hide();
    arrOfPossibleTeams = k_combinations(currentRoster, TEAM_SIZE);
    let arrOfOutcomes = [];
    let teams_to_output = document.getElementById("num-of-teams").value;
    if (lockedHeroes.length == 0) {
        for (var i = 0; i < arrOfPossibleTeams.length; i++) {
            let result = determineBestChatOptionsFromTeam(arrOfPossibleTeams[i]);
            arrOfOutcomes.push(result);
        }
    } else {
        var j = arrOfPossibleTeams.length;
        for (var j = 0; j < arrOfPossibleTeams.length; j++) {
            let containsAllHeroes = true;
            for (var k = 0; k < lockedHeroes.length; k++) {
                if (!arrOfPossibleTeams[j].includes(lockedHeroes[k])) {
                    containsAllHeroes = false;
                }
            }
            if (containsAllHeroes) {
                arrOfPossibleTeamsContainingLockedHeroes.push(arrOfPossibleTeams[j]);
            }
        }
        arrOfPossibleTeams = arrOfPossibleTeamsContainingLockedHeroes;
        for (var i = 0; i < arrOfPossibleTeams.length; i++) {
            let result = determineBestChatOptionsFromTeam(arrOfPossibleTeams[i]);
            arrOfOutcomes.push(result);
        }
    }
    arrOfOutcomes.sort(compareScores);
    if (arrOfOutcomes.length < teams_to_output) {
        teams_to_output = arrOfOutcomes.length;
    }
    for (var i = 0; i < teams_to_output; i++) {
        let teamOutputString = "";
        for (var teamCounter = 0; teamCounter < arrOfOutcomes[i].team.length; teamCounter++) {
            if (lockedHeroes.includes(arrOfOutcomes[i].team[teamCounter])) {
                teamOutputString += `<b>${arrOfOutcomes[i].team[teamCounter]}</b>`;
            } else {
                teamOutputString += arrOfOutcomes[i].team[teamCounter]
            }
            if (teamCounter != arrOfOutcomes[i].team.length - 1) {
                teamOutputString += ", ";
            }
        }
        let bestChatOption1OutputString = arrOfOutcomes[i].bestChatOption1.hero.name + " - " + arrOfOutcomes[i].bestChatOption1.option.toString().replace('_', " ");
        let bestChatOption2OutputString = arrOfOutcomes[i].bestChatOption2.hero.name + " - " + arrOfOutcomes[i].bestChatOption2.option.toString().replace('_', " ");
        bestChatOption1OutputString = uppercaseWords(bestChatOption1OutputString);
        bestChatOption2OutputString = uppercaseWords(bestChatOption2OutputString);
        output.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${teamOutputString}</td>
                <td>
                    ${bestChatOption1OutputString}
                    <br>
                    ${bestChatOption2OutputString}
                </td>
                <td>${arrOfOutcomes[i].score}</td>
            </tr>
        `;
    }
    loader.hide();
    outputWrapper.show();
}

function determineBestChatOptionsFromTeam(team) {
    let hero1 = allHeroes.filter(function (hero){
        return hero.name === team[0];
    });
    let hero2 = allHeroes.filter(function (hero){
        return hero.name === team[1];
    });
    let hero3 = allHeroes.filter(function (hero){
        return hero.name === team[2];
    });
    let hero4 = allHeroes.filter(function (hero){
        return hero.name === team[3];
    });

    let arrOfScoreObj = [];
    let scoreObjA1 = {
        option: hero1[0].chat1,
        hero: hero1[0],
        score: 0
    };
    let scoreObjA2 = {
        option: hero1[0].chat2,
        hero: hero1[0],
        score: 0
    };
    let scoreObjB1 = {
        option: hero2[0].chat1,
        hero: hero2[0],
        score: 0
    };
    let scoreObjB2 = {
        option: hero2[0].chat2,
        hero: hero2[0],
        score: 0
    };
    let scoreObjC1 = {
        option: hero3[0].chat1,
        hero: hero3[0],
        score: 0
    };
    let scoreObjC2 = {
        option: hero3[0].chat2,
        hero: hero3[0],
        score: 0
    };
    let scoreObjD1 = {
        option: hero4[0].chat1,
        hero: hero4[0],
        score: 0
    };
    let scoreObjD2 = {
        option: hero4[0].chat2,
        hero: hero4[0],
        score: 0
    };
    arrOfScoreObj.push(scoreObjA1);
    arrOfScoreObj.push(scoreObjA2);
    arrOfScoreObj.push(scoreObjB1);
    arrOfScoreObj.push(scoreObjB2);
    arrOfScoreObj.push(scoreObjC1);
    arrOfScoreObj.push(scoreObjC2);
    arrOfScoreObj.push(scoreObjD1);
    arrOfScoreObj.push(scoreObjD2);

    arrOfScoreObj.forEach(function(optionObj) {
        let score = 0;
        score += hero1[0][optionObj.option];
        score += hero2[0][optionObj.option];
        score += hero3[0][optionObj.option];
        score += hero4[0][optionObj.option];
        score -= optionObj.hero[optionObj.option];
        optionObj.score = score;
    });

    arrOfScoreObj.sort(compareScores);

    while (arrOfScoreObj[0].option == arrOfScoreObj[1].option) {
        arrOfScoreObj.splice(1, 1);
    }

    let optimalCampForTeam = {
        team: team,
        bestChatOption1: arrOfScoreObj[0],
        bestChatOption2: arrOfScoreObj[1],
        score: arrOfScoreObj[0].score + arrOfScoreObj[1].score
    };

    return optimalCampForTeam;
}

function compareScores(a,b) {
    if (a.score > b.score)
        return -1;
    if (a.score < b.score)
        return 1;
    return 0;
}

function uppercaseWords(str)
{
    var array1 = str.split(' ');
    var newarray1 = [];
        
    for(var x = 0; x < array1.length; x++){
        newarray1.push(array1[x].charAt(0).toUpperCase()+array1[x].slice(1));
    }
    return newarray1.join(' ');
}
    