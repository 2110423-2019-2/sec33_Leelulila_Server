class Notification{
    constructor(text) {
        this.text = text;
        this.timestamp = Date.now();
        this.status = 0;
    }

    createMessage(){

        let message =  {
            "timestamp": this.timestamp,
            "string": this.text,
            "status": this.status
        }

        return message
    }

    async notify(client, email) {
        try {

            let payload = this.createMessage();

            const result = await client.db("CUPartTime").collection("Users").updateMany({
                email: {
                    $in: email
                }
            }, {
                $push: {
                    notification: payload
                }
            })
            if (result) {
                console.log("notified the users", result.modifiedCount, payload.string)
            } else {
                console.log("fail to notify the user")
            }
        } catch (e) {
            console.error(e)
        }
    }
}

exports.JobNotification = class extends Notification{
    constructor(type, jobId) {
        super();
        this.jobId = jobId
        console.log(jobId)
        this.type = type;
    }
    async getText(client){
        //console.log(this.jobId,"+++++++++++++++++++++++++++++++++++++++++++")
        this.jobName = await client.db("CUPartTime").collection("Job").findOne({
            _id: this.jobId
        })
        //console.log(this.jobName)
        this.jobName = this.jobName.job.JobName
        
        this.textType = [
            "Your job " + this.jobName + " has a new applicant", 
            "Sadly, your application for " + this.jobName + " has been refused, good luck next time!",
            "Congratulations you has been accepted to " + this.jobName
        ]
        return this.textType[this.type]
    }

    async createMessage(client){

        let message =  {
            "timestamp": this.timestamp,
            "string": await this.getText(client),
            "status": this.status
        }

        return message
    }

    async notify(client, email) {
        try {

            let payload = await this.createMessage(client);
            console.log(email)
            console.log(payload)
            const result = await client.db("CUPartTime").collection("Users").updateMany({
                email: {
                    $in: email
                }
            }, {
                $push: {
                    notification: payload
                }
            })
            if (result) {
                console.log("notified the users", result.modifiedCount, payload.string)
            } else {
                console.log("fail to notify the user")
            }
        } catch (e) {
            console.error(e)
        }
    }
}


exports.CommentNotification = class extends Notification{
    constructor(id) {
        super();
        this.BlogId = id;
        this.text = "You have new comment";
    }

    createMessage(){

        let message =  {
            "timestamp": this.timestamp,
            "string": this.text,
            "status": this.status,
            "BlogId": this.BlogId

        }

        return message
    }

}

exports.PaymentNotification = class extends Notification{
    constructor(amount, employer) {
        super();
        this.amount = amount;
        this.employer = employer;
        this.text = "You have been paid with the amount of "+ this.amount.toString() + " from " + this.employer;
    }

    createMessage(){

        let message =  {
            "timestamp": this.timestamp,
            "wage": this.amount,
            "email": this.employer,
            "string": this.text,
            "status": this.status

        }

        return message
    }

}

exports.ReviewNotification = class extends Notification{
    constructor(jobId, jobName) {
        super();
        this.jobName = jobName;
        this.jobId = jobId;
        this.text = "Review " + this.JobName +  "?";
        this.status = 2;
    }

    createMessage(){

        let message =  {
            "timestamp": this.timestamp,
            "jobId": this.jobId,
            "jobName": this.jobName,
            "string": this.text,
            "status": this.status

        }

        return message
    }
}

exports.Notification = class{
    constructor(text) {
        this.text = text;
        this.timestamp = Date.now();
        this.status = 0;
    }

    createMessage(){

        let message =  {
            "timestamp": this.timestamp,
            "string": this.text,
            "status": this.status
        }

        return message
    }

    async notify(client, email) {
        try {

            let payload = this.createMessage();

            const result = await client.db("CUPartTime").collection("Users").updateMany({
                email: {
                    $in: email
                }
            }, {
                $push: {
                    notification: payload
                }
            })
            if (result) {
                console.log("notified the users", result.modifiedCount, payload.string)
            } else {
                console.log("fail to notify the user")
            }
        } catch (e) {
            console.error(e)
        }
    }
}