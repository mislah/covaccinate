var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.js';
document.getElementsByTagName('head')[0].appendChild(script);

var tom = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
tom = String(tom.getDate()).padStart(2, '0') + '-' + String((tom.getMonth() + 1)).padStart(2, '0') + '-' + tom.getFullYear();

var cList = ["ABC HOSPITAL", "MNO PHC"]; //Should be in Capital letters
var cRefID = ["98765432109876"];    // Reference ID, Login to see
var cVacc = "COVISHIELD";           // "COVAXIN" or  "COVISHIELD"
var cDate = tom;                    // tom for tomorrow or the date in the format "12-08-2021" with "
var cSlot = 1;                      // Slot 1 for the first available slot
var cDose = 1;                      // Dose 1 or 2
var cMin = 18;                      // 45 if older than 45 else use 18
var cDist = 305;                    // District code

runScript();

function runScript() {
    if (window.$) {
        jQuery.noConflict();
        api = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + cDist + '&date=' + tom;
        isStarted(api);
        interval = setInterval(function Req0() {
            isStarted(api);
        }, 5000);
    }
    else {
        window.setTimeout(runScript, 2000);
    }
}

function isStarted(api) {
    jQuery.getJSON(api, function (data) {
        for (i in data.centers) {
            if (data.centers[i].fee_type === "Free") {
                clearInterval(interval);
                isAvailable(api);
            }
        }
    });
}

function isAvailable(api) {
    var stop = false;
    interval = setInterval(function Req1() {
        jQuery.getJSON(api, function (center) {
            center = center.centers;
            for (i in center) {
                if (cList.includes(center[i].name.toUpperCase())) {
                    for (j in center[i].sessions) {
                        if (cDose == 1) {
                            dose = center[i].sessions[j].available_capacity_dose1;
                        }
                        else if (cDose == 2) {
                            dose = center[i].sessions[j].available_capacity_dose2;
                        }
                        if (center[i].sessions[j].date === cDate && dose) {
                            if (center[i].sessions[j].min_age_limit >= cMin && center[i].sessions[j].vaccine == cVacc) {
                                bookSlot(center[i], j);
                                clearInterval(interval);
                                stop = true;
                                break;
                            }
                        }
                    }
                }
                if (stop) {
                    break;
                }
            }
        });
    }, 3000);
}

function bookSlot(data, j) {
    jQuery.ajax({
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/schedule',
        type: 'post',
        data: JSON.stringify({
            "center_id": data.center_id,
            "session_id": data.sessions[j].session_id,
            "beneficiaries": cRefID,
            "slot": data.sessions[j].slots[cSlot - 1],
            "dose": cDose
        }),
        headers: {
            "Authorization": "Bearer " + window.sessionStorage.userToken.slice(1, -1)
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            console.log("Success!");
            window.location = "https://selfregistration.cowin.gov.in/dashboard";
        },
    });
}
