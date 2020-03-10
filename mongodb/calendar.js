start_calendar = {
    "jan": [],
    "feb": [],
    "mar": [],
    "apr": [],
    "may": [],
    "june": [],
    "july": [],
    "aug": [],
    "sep": [],
    "oct": [],
    "nov": [],
    "dec": []
}

exports.createCalendar = async function (client, email){
    try{
        calendar = start_calendar
        calendar._id = email
        const result = await client.db("CUPartTime").collection("Calendars").insertOne(calendar);
    }catch(e){

    }
}
exports.addJob = async function (client, date, start, end){
    try{

    }catch(e){
        
    }
}