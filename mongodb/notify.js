exports.readNotify = async function(client, email, res){
    try{
    result = await client.db("CUPartTime").collection("Users").updateOne({email:email},{$set:{"notification.$[].status": 1}})
    if(result.modifiedCount >0){
        res.json(`successfull`)
    }else{
        res.json('fail')
    }
    }catch(e){
        console.error(e)
    }
}