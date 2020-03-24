const notify = require('./notify.js')
exports.createBlog = async function (client, payload, res) {
    try {
        const sequenceName = "blogid"
        const id = await client.db("CUPartTime").collection("counters").findOne({
            _id: sequenceName
        });
        await client.db("CUPartTime").collection("counters").updateOne({
            _id: sequenceName
        }, {
            $inc: {
                sequence_value: 1
            }
        });

        payload._id = id.sequence_value
        payload.timestamp = Date.now()
        payload.comments = []
        payload.comment_seq = 0
        result = await client.db("CUPartTime").collection("Blogs").insertOne(payload)
        await client.db("CUPartTime").collection("Users").updateOne({
            email: payload.WriterEmail
        }, {
            $push: {
                blogOwn: id.sequence_value
            }
        })
        if (result) {
            console.log("blog created with id", id.sequence_value)
            res.json(`created one blog`)
        } else {
            console.log("fail to create blog")
            res.json(`fail to create blog`)
        }
    } catch (e) {
        console.error(e)
        res.json(`fail to create blog`)
    }
}
exports.getBlog = async function (client, id, res) {
    try {
        result = await client.db("CUPartTime").collection("Blogs").findOne({
            _id: id
        })
        if (result) {
            console.log("Blog", id, "found, returning blog")
            res.json(result)
        } else {
            console.log("fail to find blog")
            res.json(`fail to find blog ${id}`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.getAllBlog = async function (client, res) {
    try {
        result = await client.db("CUPartTime").collection("Blogs").find({}).toArray();
        if (result) {
            console.log("Blog", "found, returning all blog")
            res.json(result)
        } else {
            console.log("fail to find blog")
            res.json(`fail to find any blog`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.editBlog = async function (client, id, payload, res) {
    try {
        result = await client.db("CUPartTime").collection("Blogs").updateOne({
            _id: id
        }, {
            $set: payload
        })
        if (result) {
            console.log("job", id, "updated")
            res.json(`${result.modifiedCount} updated`)
        } else {
            console.log("fail to delete")
            res.json(`fail to edit blog ${id}`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.deleteBlog = async function (client, id, res) {
    try {
        result = await client.db("CUPartTime").collection("Blogs").deleteOne({
            _id: id
        })
        if (result) {
            console.log("job", id, "deleted")
            res.json(`deleted one job`)
        } else {
            console.log("fail to delete")
            res.json(`fail`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.comment = async function (client, id, payload, res) {
    try {
        blog = await client.db("CUPartTime").collection("Blogs").findOne({
            _id: id
        })
        cid = blog.comment_seq
        await client.db("CUPartTime").collection("Blogs").updateOne({
            _id: id
        }, {
            $inc: {
                comment_seq: 1
            }
        });

        payload.cid = cid
        payload.timestamp = Date.now()
        result = await client.db("CUPartTime").collection("Blogs").updateOne({
            _id: id
        }, {
            $push: {
                comments: payload
            }
        })
        if (result) {
            payload = {
                "timestamp": Date.now(),
                "string": "You have new comment",
                "status": 0,
                "BlogId": id

            }
            //console.log(cid)
            notify.notifyPayload(client, [blog.Employer], payload)
            console.log("comment", cid, "added")
            res.json(`${result.modifiedCount} commented`)
        } else {
            console.log("fail to comment")
            res.json(`fail to comment ${id}`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.editComment = async function (client, id, payload, cid, res) {
    try {

        result = await client.db("CUPartTime").collection("Blogs").updateOne({
            _id: id,
            "comments.cid": cid
        }, {
            $set: {
                "comments.$.msg": payload.msg
            }
        })
        if (result.modifiedCount > 0) {
            console.log("comment", cid, "edited")
            res.json(`${result.modifiedCount} edited`)
        } else {
            console.log("fail to edit comment")
            res.json(`fail to edit comment ${id}`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.deleteComment = async function (client, id, cid, res) {
    try {
        result = await client.db("CUPartTime").collection("Blogs").updateOne({
            _id: id
        }, {
            $pull: {
                comments: {
                    cid: cid
                }
            }
        })
        if (result.modifiedCount > 0) {
            console.log("comment", cid, "deleted")
            res.json(`${result.modifiedCount} deleted`)
        } else {
            console.log("fail to edit deleted")
            res.json(`fail to edit deleted ${id}`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.getAllComment = async function (client, id, res) {
    try {
        result = await client.db("CUPartTime").collection("Blogs").findOne({
            _id: id
        })
        if (result) {
            console.log("job", id, "found, returning comments")
            res.json(result.comments)
        } else {
            console.log("fail to find")
            res.json(`fail to find blog ${id}`)
        }
    } catch (e) {
        console.error(e)
    }
}
exports.getCommentByCid = async function (client, id, cid, res) {
    try {
        result = await client.db("CUPartTime").collection("Blogs").findOne({
            _id: id
        })
        result.comments.forEach(function (comment) {
            if (comment.cid == cid) {
                result_comment = comment
            }
        });
        if (result_comment) {
            console.log("job", id, "found, returning comment")
            res.json(result_comment)
        } else {
            console.log("fail to find")
            res.json(`fail to find blog ${id}`)
        }
    } catch (e) {
        console.error(e)
    }
}