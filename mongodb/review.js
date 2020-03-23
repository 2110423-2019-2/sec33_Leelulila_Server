exports.createReview = async function(client, payload, res){
    try{
        const sequenceName = "reviewid"
        const id = await client.db("CUPartTime").collection("counters").findOne({ _id : sequenceName });
        await client.db("CUPartTime").collection("counters").updateOne({ _id : sequenceName }, { $inc: {sequence_value : 1 }});

        payload._id = id.sequence_value
        payload.timestamp = Date.now()
        result = await client.db("CUPartTime").collection("Reviews").insertOne(payload)
        await  client.db("CUPartTime").collection("Users").updateOne({email:payload.WriterEmail},{$push:{reviewOwn:id.sequence_value}})
        if(result){
            console.log("review created with id", id.sequence_value)
            res.json(`created one review`)
        }else{
            console.log("fail to create review")
            res.json(`fail to create review`)
        }
    }catch(e){
        console.error(e)
        res.json(`fail to create review`)
    }
}
exports.getReview = async function(client, id, res){
    try{
        result = await client.db("CUPartTime").collection("Reviews").findOne({_id:id})
        if(result){
            console.log("Review",id,"found, returning review")
            res.json(result)
        }else{
            console.log("fail to find review")
            res.json(`fail to find review ${id}`)
        }
    }catch(e){
        console.error(e)
    }
}
exports.getAllReview = async function(client, res){
    try{
        result = await client.db("CUPartTime").collection("Reviews").find({}).toArray();
        if(result){
            console.log("Reviews found, returning all reviews")
            res.json(result)
        }else{
            console.log("fail to find reviews")
            res.json(`fail to find any review`)
        }
    }catch(e){
        console.error(e)
    }
}
exports.editReview = async function(client, id,payload, res){
    try{
        result = await client.db("CUPartTime").collection("Reviews").updateOne({_id:id},{$set:payload})
        if(result){
            console.log("Reviews",id,"edited")
            res.json(`${result.modifiedCount} updated`)
        }else{
            console.log("fail to edit")
            res.json(`fail to edit review ${id}`)
        }
    }catch(e){
        console.error(e)
    }
}
exports.deleteReview = async function(client, id, res){
    try{
        result = await client.db("CUPartTime").collection("Reviews").deleteOne({_id:id})
        if(result){
            console.log("Review",id,"deleted")
            res.json(`deleted one job`)
        }else{
            console.log("fail to delete")
            res.json(`fail`)
        }
    }catch(e){
        console.error(e)
    }
}