exports.createBlog = async function(client, payload, res){
    try{
        const sequenceName = "blogid"
        const id = await client.db("CUPartTime").collection("counters").findOne({ _id : sequenceName });
        await client.db("CUPartTime").collection("counters").updateOne({ _id : sequenceName }, { $inc: {sequence_value : 1 }});
        payload._id = id.sequence_value
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