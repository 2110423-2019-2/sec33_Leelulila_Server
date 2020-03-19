exports.createTFvector = async function(client){
    try{
        TFvec = [0,0,0,0,0,0,0,0,0,0]
        await client.db("CUPartTime").collection("Users").updateMany({},{$set:{TFvector:TFvec}})
        console.log('done')
    }catch(e){
        console.error(e)
    }
}
exports.addTFvector = async function(client, email,addVector){
    try{
        find = await client.db("CUPartTime").collection("Users").findOne({email:email})
        if(find){
            TFvec = find.TFvector
            for(i = 0; i < TFvec.length; i++){
                TFvec[i] += addVector[i]
            }
        result = await client.db("CUPartTime").collection("Users").updateOne({email:email}, {$set:{TFvector:TFvec}})
        }else{
            console.log("cannot find the user by email ", email)
            //res.json(`error 404`)
        }
        
        
    }catch(e){
        
    }
}