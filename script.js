let courses = {
    "Monday":[],
    "Tuesday":[],
    "Wednesday":[],
    "Thursday":[],
    "Friday":[]
};

// predicting end time based on start time
document.querySelector("#course-event-start-time").addEventListener("blur", () =>{
    predictTime();
});

// new course event form handling
let form = document.querySelector("form#new-course-event");
form.addEventListener("submit", (event) =>{
    event.preventDefault();

    //validate time strings
    let startTime = form.querySelector("#course-event-start-time");
    let endTime = form.querySelector("#course-event-end-time");

    if(!checkTimeString(startTime.value)){
        startTime.classList.add("border");
        startTime.classList.add("border-danger");
        return;
    }
    startTime.classList.remove("border");
    startTime.classList.remove("border-danger");

    if(!checkTimeString(endTime.value)){
        endTime.classList.add("border");
        endTime.classList.add("border-danger");
        return;
    }
    endTime.classList.remove("border");
    endTime.classList.remove("border-danger");
    
    let courseEvent = createCourseEvent();
    
    //assign row for weekdays
    assignRow(courseEvent);
    courses[courseEvent["weekday"]].push(courseEvent);
        
    vizualizeCourses();
});

function createCourseEvent(){
    let courseEvent = {};

    courseEvent["name"] = form.querySelector("#course-event-name").value;
    courseEvent["teacher"] = form.querySelector("#course-event-teacher").value;
    courseEvent["room"] = form.querySelector("#course-event-room").value;
    courseEvent["weekday"] = form.querySelector("#course-event-weekday").value;
    courseEvent["startTimeString"] = form.querySelector("#course-event-start-time").value;
    courseEvent["startTime"] = parseTimeString(courseEvent["startTimeString"]);
    courseEvent["endTimeString"] = form.querySelector("#course-event-end-time").value;
    courseEvent["endTime"] = parseTimeString(courseEvent["endTimeString"]);

    if(form.querySelector("#course-event-every-week").checked){
        courseEvent["weeks"] = "Every week";
    }else if(form.querySelector("#course-event-even-week").checked){
        courseEvent["weeks"] = "Even weeks";
    }else{
        courseEvent["weeks"] = "Odd weeks";
    }

    if(form.querySelector("#course-event-type-lecture").checked){
        courseEvent["type"] = "lecture";
    }else{
        courseEvent["type"] = "tutorial"
    }

    return courseEvent;
}

function checkTimeString(timeString){
    if(!timeString.includes(":")){
        return false;
    }

    let [hours,minutes] = timeString.split(":");

    if(isNaN(hours) || isNaN(minutes)){
        return false;
    }

    if(hours > 24 || hours < 0){
        return false;
    }

    if(minutes > 60 || minutes < 0){
        return false;
    }

    return true

}

function parseTimeString(timeString){
    let [hours,minutes] = timeString.split(":");
    let maxTime = 20.75;
    let minTime = 6.5;
    return Math.min(Math.max(Number(hours) + Number(minutes) / 60, minTime), maxTime);
    
}

function assignRow(courseEvent){
    courseEvent["row"] = 0; //default
    while(hasOverlap(courseEvent)){
        courseEvent["row"] += 1;
    }

}

function hasOverlap(courseEvent){
    let hasOverlap = false;
    courses[courseEvent["weekday"]].forEach(processedCourseEvent => {
        if(courseEvent["row"] == processedCourseEvent["row"]){
            let startTimeA = processedCourseEvent["startTime"];
            let endTimeA = processedCourseEvent["endTime"];
            let startTimeB = courseEvent["startTime"];
            let endTimeB = courseEvent["endTime"];

            if((startTimeA < endTimeB) && (startTimeB < endTimeA)){
                hasOverlap = true;
            }
        }
    });
    return hasOverlap;
}

function vizualizeCourses(){
    let rowTemplate = document.querySelector("#row-template");
    let courseEventTemplate = document.querySelector("#course-event-template");
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    days.forEach(day =>{
        let currentDayRowsWrapper = document.querySelector("#" + day + "-rows-wrapper");
        currentDayRowsWrapper.innerHTML = "";
        let numberOfRows = 0;
        courses[day].forEach(courseEvent =>{
            //get data into div
            let courseEventDiv = courseEventTemplate.cloneNode(true);

            courseEventDiv.removeAttribute("id");
            courseEventDiv.classList.add(courseEvent["type"]);
            courseEventDiv.classList.remove("d-none");

            courseEventDiv.querySelector(".course-name").innerText = courseEvent["name"];
            courseEventDiv.querySelector(".course-room").innerText = courseEvent["room"];
            courseEventDiv.querySelector(".course-teacher").innerText = courseEvent["teacher"];
            courseEventDiv.querySelector(".course-periodicity").innerText = courseEvent["weeks"];

            //set positioning
            let slotsNumber = 17;
            let startCollumn =  getCollumnCoordinates(courseEvent["startTime"]);
            let endCollumn = getCollumnCoordinates(courseEvent["endTime"]);
            let duration = endCollumn - startCollumn;

            courseEventDiv.style.width = (duration / slotsNumber * 100) + "%";
            courseEventDiv.style.left = (startCollumn / slotsNumber * 100) + "%";

            (numberOfRows <= courseEvent["row"])? numberOfRows = courseEvent["row"] + 1: null;
            
            //add to correct row
            let currentRow = currentDayRowsWrapper.querySelector("#row-" + courseEvent["row"]);

            if(currentRow == null){
                currentRow = rowTemplate.cloneNode(true);
                currentRow.setAttribute("id", "row-" + courseEvent["row"]);
                currentRow.classList.remove("d-none");

                currentDayRowsWrapper.append(currentRow);
            }

            currentRow.append(courseEventDiv);
        });

        let myCssRules = document.styleSheets[2].cssRules;
        let courseEventHeight = 6;

        for(let cssRule of myCssRules){
            if(cssRule.selectorText == "#" + day + " td"){
                cssRule.style.setProperty("height", (courseEventHeight * numberOfRows) + "rem");
            }
        }
    })
}

function getCollumnCoordinates(hours){
    const GRID_SLOTS = [
        {index:0, start: 6 + 30 / 60, end: 7 + 15 / 60},
        {index:1, start: 7 + 30 / 60, end: 8 + 15 / 60},
        {index:2, start: 8 + 20 / 60, end: 9 + 5 / 60},
        {index:3, start: 9 + 10 / 60, end: 9 + 55 / 60},
        {index:4, start: 10 + 0 / 60, end: 10 + 45 / 60},
        {index:5, start: 10 + 50 / 60, end: 11 + 35 / 60},
        {index:6, start: 11 + 40 / 60, end: 12 + 25 / 60},
        {index:7, start: 12 + 30 / 60, end: 13 + 15 / 60},
        {index:8, start: 13 + 20 / 60, end: 14 + 5 / 60},
        {index:9, start: 14 + 10 / 60, end: 14 + 55 / 60},
        {index:10, start: 15 + 0 / 60, end: 15 + 45 / 60},
        {index:11, start: 15 + 50 / 60, end: 16 + 35 / 60},
        {index:12, start: 16 + 40 / 60, end: 17 + 25 / 60},
        {index:13, start: 17 + 30 / 60, end: 18 + 15 / 60},
        {index:14, start: 18 + 20 / 60, end: 19 + 5 / 60},
        {index:15, start: 19 + 10 / 60, end: 19 + 55 / 60},
        {index:16, start: 20 + 0 / 60, end: 20 + 45 / 60}
    ];
    let result = 17;

    for(let slot of GRID_SLOTS){
        if(hours >= slot["start"] && hours <= slot["end"]){
            let slotDuration = slot["end"] - slot["start"];
            let progress = hours - slot["start"];
            let fraction = progress / slotDuration;
            
            result = slot["index"] + fraction;
            return result;
        }

        if(hours < slot["start"]){
            result = slot["index"];
            return result;
        }
    }

    return result;
}

//functions for manipulating course data
function erraseCourses(){
    courses = {
        "Monday":[],
        "Tuesday":[],
        "Wednesday":[],
        "Thursday":[],
        "Friday":[]
    };
    vizualizeCourses();
}
function alertCourses(){
    let jsonCourses = JSON.stringify(courses);
    alert(jsonCourses);
}
function showSave(){
    document.querySelector("#courses-save-displayer").value = JSON.stringify(courses);
}
function loadSave(){
    courses = JSON.parse(document.querySelector("#courses-save-displayer").value);

    /* let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    days.forEach(day =>{
        courses[day].forEach(course =>{
            assignRow(course);
        })
    }); */

    vizualizeCourses();
}

//predicting the end time based on start time
function predictTime(){
    let startTime = document.querySelector("#course-event-start-time");

    if(checkTimeString(startTime.value)){
        let [predictedHours, predictedMinutes] = startTime.value.split(":");

        let [addHours, addMinutes] = [1, 35];

        predictedHours = Number(predictedHours) + addHours;
        predictedMinutes = Number(predictedMinutes) + addMinutes

        if(predictedMinutes >= 60){// account for when minutes addup to more than hour
            predictedHours += 1;
            predictedMinutes -= 60;
        }

        //conversion to string
        if(predictedMinutes < 10){
            predictedMinutes = "0" + predictedMinutes;
        }else{
            predictedMinutes = "" + predictedMinutes;
        }

        document.querySelector("#course-event-end-time").value = predictedHours + ":" + predictedMinutes;
    }
}

//gray-out clicked course events
function grayOut(element){
    if(element.classList.contains("gray-out")){
        element.classList.remove("gray-out");
    }else{
        element.classList.add("gray-out");
    }
}