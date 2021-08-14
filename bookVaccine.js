var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.js';
document.getElementsByTagName('head')[0].appendChild(script);

var cList = ["ABC HOSPITAL", "PQR CENTER"]; //List of centers
var cRefID = ["12345678901234"];    // Reference ID, Login to see
var cVacc = "COVISHIELD";           // "COVAXIN" or  "COVISHIELD"
var cDate = tod(1);                 // 0 for today, 1 for tomorrow, and so on 
var cSlot = 1;                      // Slot 1 gives the first available slot, usually 9:00 to 11:00
var cDose = 1;                      // Dose 1 or 2
var cAge = 18;                      // Age
var cDist = 241;                    // District Code

runScript();

function tod(add = 0) {
    var dat = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * add);
    return String(dat.getDate()).padStart(2, '0') + '-' + String((dat.getMonth() + 1)).padStart(2, '0') + '-' + dat.getFullYear();
}

function runScript() {
    cList = cList.map(a => a.toUpperCase());
    if (window.$) {
        jQuery.noConflict();
        api = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + cDist + '&date=' + tod();
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
                        if (cAge < 45 && center[i].sessions[j].min_age_limit == 45) {
                            continue;
                        }
                        if (center[i].sessions[j].date === cDate && center[i].sessions[j].vaccine == cVacc && dose) {
                            bookSlot(center[i], j);
                            clearInterval(interval);
                            stop = true;
                            break;
                        }
                    }
                }
                if (stop) {
                    break;
                }
            }
        });
    }, 1000);
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
            window.location = "https://selfregistration.cowin.gov.in/dashboard";
        },
    });
}
