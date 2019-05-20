/*
* Copyright (c) 2019 Cybozu19卒
*
* Licensed under the MIT License
*/
(() => {
    "use strict";
    const answerObject = {
        "chapter1": [
            ["C"],
            ["B", "D"],
            ["C"],
            ["D"],
            ["A", "B"],
            ["B"],
            ["D"],
            ["D"],
            ["A", "B", "C"],
            ["A", "C"],
            ["A"],
            ["B"],
            ["A", "B", "C"],
            ["C", "D"],
            ["D"],
            ["B", "C"],
            ["A", "B"],
            ["A", "C", "D"],
            ["A", "B", "D"],
            ["D"],
            ["B", "D"],
            ["A"],
            ["A", "B"],
            ["A", "B"],
            ["A", "D"],
            ["C", "D"],
            ["A", "C"],
            ["A", "B"],
            ["A", "C"],
            ["A", "B"],
            ["D"]
        ],
        "chapter2": [
            ["D"],
            ["A"],
            ["B", "C", "D"],
            ["C", "D"],
            ["D"],
            ["B"],
            ["A", "B", "C"],
            ["B", "C"],
            ["B", "C"],
            ["B"],
            ["A"],
            ["C"],
            ["A", "B", "D"],
            ["A", "C", "D"],
            ["B"],
            ["A", "B", "D"]
        ],
        "chapter3": [
            ["C"],
            ["D"],
            ["A", "B", "C"],
            ["C", "D"],
            ["B"],
            ["B"],
            ["C"],
            ["C"],
            ["A", "B", "D"],
            ["A", "C", "D"],
            ["B"],
            ["A", "C", "D"],
            ["D"],
            ["B"],
            ["C", "D"],
            ["C"],
            ["A", "C", "D"]
        ],
        "chapter4": [
            ["A", "B", "D"],
            ["D"],
            ["D"],
            ["B"],
            ["B", "C", "D"],
            ["A", "C", "D"],
            ["A"],
            ["C", "D"],
            ["D"],
            ["B"],
            ["A", "B", "D"],
            ["D"],
            ["B"],
            ["D"],
            ["C"],
            ["B", "D"],
            ["A"],
            ["A", "C"],
            ["B"],
            ["A", "C"],
            ["A", "C"],
            ["A", "D"],
            ["B", "D"]
        ],
        "chapter5": [
            ["C"],
            ["B"],
            ["B"],
            ["A", "C", "D"],
            ["A"],
            ["B"],
            ["D"],
            ["A", "B", "D"],
            ["A"],
            ["D"],
            ["A", "C", "D"],
            ["A"],
            ["A", "C"],
            ["A", "B", "D"],
            ["A", "D"],
            ["A", "B", "C"],
            ["A", "B", "D"],
            ["A", "D"],
            ["A", "B", "C"]
        ],
        "chapter6": [
            ["A", "C", "D"],
            ["C"],
            ["D"],
            ["C", "D"],
            ["B", "C", "D"],
            ["D"],
            ["C"],
            ["A", "D"],
            ["A"],
            ["A", "B", "C"],
            ["C"],
            ["C", "D"],
            ["C"],
            ["C", "D"],
            ["D"],
            ["B"]
        ],
        "chapter7": [
            ["C"],
            ["A", "B", "C", "D"],
            ["B", "C"],
            ["A", "B", "C"],
            ["A"],
            ["D"],
            ["B"],
            ["C", "D"],
            ["C"],
            ["B", "C", "D"]
        ]
    };
    const SPACE_ID_CORRECT_ANSWERS = "correct_answers";
    const SPACE_ID_CORRECT_PERCENTAGE = "percentage";
    const SPACE_ID_ELAPSED_TIME = "elapsed_time";
    const incorrectFontColor = "#ff1744";
    const initTime = "00:00:00";

    let startDate = null;

    const isCorrect = (answer, myAnswer) => JSON.stringify(myAnswer) == JSON.stringify(answer);
    const isSelectCheckbox = answer => answer.length > 0;
    const addTextElementInSpace = (text, elementId) => {
        const answersElement = document.createElement("h1");
        answersElement.textContent = text;
        kintone.app.record.getSpaceElement(elementId).appendChild(answersElement);
    }
    const zeroPadding = (num, length) => String(num).length > length ? num : (Array(length).join("0") + num).slice(length * -1);
    const diffSecond = (startTime, currentTime) => Math.floor((currentTime - startTime) / 1000);
    const secondToHms = secondTime => {
        const hour = Math.floor(secondTime / 3600);
        const minute = Math.floor(secondTime / 60 % 60);
        const second = secondTime % 60;
        return `${zeroPadding(hour, 2)}:${zeroPadding(minute, 2)}:${zeroPadding(second, 2)}`;
    };
    const hmsToSecond = hms => {
        const hmsArray = hms.split(":");
        return parseInt(hmsArray[0]) * 3600 + parseInt(hmsArray[1]) * 60 + parseInt(hmsArray[2]);
    };

    kintone.events.on("app.record.detail.show", event => {
        const record = event.record;
        let numberOfAnswers = 0;
        const correct = Object.keys(answerObject).map((chapter, chapterIndex) => {
            // 章ごとの正解数を配列に格納する
            return answerObject[chapter].filter((answer, questionIndex) => {
                const fieldCode = `question${chapterIndex + 1}_${questionIndex + 1}`;
                const myAnswer = record[fieldCode].value;
                if (isSelectCheckbox(myAnswer)) {
                    numberOfAnswers++;
                    if (!isCorrect(answer, myAnswer)) {
                        kintone.app.record.getFieldElement(fieldCode).style.color = incorrectFontColor;;
                    }
                }
                return (isCorrect(answer, myAnswer) && isSelectCheckbox(myAnswer));
            }).length;
        }).reduce((sum, value) => sum + value);

        if (numberOfAnswers > 0) {
            addTextElementInSpace(`正解数: ${correct}/${numberOfAnswers}`, SPACE_ID_CORRECT_ANSWERS);
            addTextElementInSpace(`正解率: ${Math.round((correct / numberOfAnswers * 100 * 10) / 10)}%`, SPACE_ID_CORRECT_PERCENTAGE)
        }

        const elapsedTimeHms = localStorage.getItem(SPACE_ID_ELAPSED_TIME + event.recordId);
        if (elapsedTimeHms != null) {
            addTextElementInSpace(`経過時間: ${elapsedTimeHms}`, SPACE_ID_ELAPSED_TIME);
        }
    });

    kintone.events.on("app.record.create.show", event => {
        startDate = new Date();
    });

    kintone.events.on("app.record.create.submit.success", event => {
        if (startDate == null) {
            localStorage.setItem(SPACE_ID_ELAPSED_TIME + event.recordId, initTime);
            alert("エラー：経過時間を測定できませんでした");
            return;
        }
        const elapsedTimeHms = secondToHms(diffSecond(startDate.getTime(), new Date().getTime()));
        localStorage.setItem(SPACE_ID_ELAPSED_TIME + event.recordId, elapsedTimeHms);
    });

    kintone.events.on("app.record.edit.show", event => {
        startDate = new Date();
    });

    kintone.events.on("app.record.edit.submit.success", event => {
        const lastTimeHms = localStorage.getItem(SPACE_ID_ELAPSED_TIME + event.recordId);
        if (lastTimeHms == null || startDate == null) {
            localStorage.setItem(SPACE_ID_ELAPSED_TIME + event.recordId, initTime);
            alert("エラー：経過時間を測定できませんでした");
            return;
        }
        const elapsedTimeHms = secondToHms(hmsToSecond(lastTimeHms) + diffSecond(startDate.getTime(), new Date().getTime()));
        localStorage.setItem(SPACE_ID_ELAPSED_TIME + event.recordId, elapsedTimeHms);
    });

    kintone.events.on("app.record.detail.delete.submit", event => {
        localStorage.removeItem(SPACE_ID_ELAPSED_TIME + event.recordId);
    });

    kintone.events.on("app.record.index.delete.submit", event => {
        localStorage.removeItem(SPACE_ID_ELAPSED_TIME + event.recordId);
    });
})();


