exports.createBlog = async function(client, payload, res){
    try{
        const sequenceName = "blogid"
        const id = await client.db("CUPartTime").collection("counters").findOne({ _id : sequenceName });
        await client.db("CUPartTime").collection("counters").updateOne({ _id : sequenceName }, { $inc: {sequence_value : 1 }});
        payload._id = id.sequence_value
        payload.timestamp = Date.now()
        result = await client.db("CUPartTime").collection("Blogs").insertOne(payload)
        if(result){
            console.log("blog created with id", id.sequence_value)
            res.json(`created one blog`)
        }else{
            console.log("fail to create blog")
            res.json(`fail to create blog`)
        }
    }catch(e){
        console.error(e)
        res.json(`fail to create blog`)
    }
}
exports.getBlog = async function(client, id, res){
    try{
        result = await client.db("CUPartTime").collection("Blogs").findOne({_id:id})
        if(result){
            console.log("job",id,"deleted")
            res.json(result)
        }else{
            console.log("fail to delete")
            res.json(`fail to find blog ${id}`)
        }
    }catch(e){
        console.error(e)
    }
}
exports.editBlog = async function(client, payload, res){
    try{
        result = await client.db("CUPartTime").collection("Blogs").updateOne({_id:id},{$set:payload})
        if(result){
            console.log("job",id,"deleted")
            res.json(`${result.modifiedCount} updated`)
        }else{
            console.log("fail to delete")
            res.json(`fail to edit blog ${id}`)
        }
    }catch(e){
        console.error(e)
    }
}
exports.deleteBlog = async function(client, id, res){
    try{
        result = await client.db("CUPartTime").collection("Blogs").deleteOne({_id:id})
        if(result){
            console.log("job",id,"deleted")
            res.json(`deleted one job`)
        }else{
            console.log("fail to delete")
            res.json(`fail`)
        }
    }catch(e){
        console.error(e)
    }
}