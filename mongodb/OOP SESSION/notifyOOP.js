export class Notification {
    constructor(text) {
        this.text = text;
        this.timestamp = new Date();
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

            result = await client.db("CUPartTime").collection("Users").updateMany({
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

export class JobNotification extends Notification{
    async constructor(type, jobId) {
        super();
        this.jobId = jobId
        this.type = type;
        this.jobName = await client.db("CUPartTime").collection("Job").findOne({
            _id: this.jobId
        }).job.JobName;

        this.textType = [
            "Your job " + this.jobName + " has a new applicant", 
            "Sadly, your application for " + this.jobName + " has been refused, good luck next time!",
            "Congratulations you has been accepted to " + this.jobName
        ]

        this.text = this.textType[this.type];

    }
}


export class CommentNotification extends Notification{
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

export class PaymentNotification extends Notification{
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

export class ReviewNotification extends Notification{
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
