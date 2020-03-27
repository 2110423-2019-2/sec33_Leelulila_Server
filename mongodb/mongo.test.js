const assert = require('chai').assert;
const CryptoJS = require('crypto-js');
const fetch = require("node-fetch");
const expect = require('chai').expect;


describe('ApplyJob Test',function(){

    it('Success',async () =>{
    
        var email = "e2etest@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
       

        await fetch("http://localhost:9000/job/addemployee/173", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res, '1 document(s) matched the query criteria.');
        })
    })

    it('Wrong Job ID',async () =>{
    
        var email = "e2etest@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
       

        await fetch("http://localhost:9000/job/addemployee/99999", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res, 'No document(s) matched the query criteria.');
        })
    })


    it('Wrong Email',async () =>{
    
        var email = "onDemand@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
       

        await fetch("http://localhost:9000/job/addemployee/173", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res, 'No user with the email onDemand@hotmail.com');
        })
    })

    it('Check email in CurrentEmployee DB',async () =>{
    
        await fetch("http://localhost:9000/job/173", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            expect("e2etest@hotmail.com").to.be.oneOf(res['job']['CurrentEmployee']);
        })
    })
})


describe('Blog Test', function(){
    it('Get All Blog', async () =>{
    
        await fetch('http://localhost:9000/allblog', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            expect(res).to.be.an('array');

        })
    })

    it('Get Blog Success', async () =>{
    
        await fetch('http://localhost:9000/blog/14', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res['_id'],14);
        })
    })

    it('Get Blog Fail', async () =>{
    
        await fetch('http://localhost:9000/blog/9999999', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res,'fail to find blog 9999999');
        })
    })

    it('Get Comment Success', async () =>{
    
        await fetch('http://localhost:9000/blog/allcomment/14', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            expect(res).to.be.an('array');

        })
    })

    it('Get Comment Fail', async () =>{
    
        await fetch('http://localhost:9000/blog/allcomment/999999', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res,'fail to find blog 999999');

        })
    })

    var job_id = 0;

    it('Create&Edit&Delete Blog', async () =>{

        var data = {
            BlogName: 'unittest',
            BlogDetail: 'unittest',
            BlogTopic: 'unittest',
            BlogImage: 'unittest',
            Employer: 'e2etest@hotmail.com',
            Status: "Ready"
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
        
        await fetch('http://localhost:9000/newblog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            job_id = res.substring(22,24);
            assert.equal(res,'blog created with id: '+job_id);

        })

        //Edit Success
        await fetch('http://localhost:9000/blogUpdate/'+job_id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res,'0 updated');

        })

        //Delete
        await fetch('http://localhost:9000/blog/'+job_id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            assert.equal(res,'deleted one job');

        })
        
    })

    var notification_amount = 0;

    it('Notify Comment', async () =>{

        
    
        await fetch('http://localhost:9000/useremail/e2etest@hotmail.com', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            
            return res.json();
        })
        .then((res) => {
            console.log('############');
            console.log(res['notification']);
            notification_amount = res['notification'].length;
        })



        let comment = 'test';
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(comment), '123456').toString();
        let sending_data = {data: ciphertext};

        await fetch('http://localhost:9000/blog/newcomment/28', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)
        }).then((res) => {
            console.log('POST')
            return res.json();
        })
        .then((res) => {
            assert.equal(res,'1 commented');
            
        })
        
    })
    //Add Delay Please
    it('Check Notify Comment', async () =>{

        await fetch('http://localhost:9000/useremail/e2etest@hotmail.com', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((response) => {
            console.log('GET')
            return response.json();
        })
        .then((response) => {
            console.log('############');
            console.log(response);
            assert.equal(notification_amount+1,response['notification'].length);
        })



    })
    
})




describe('Create Job', function(){
    it('Response Success (200)', function(){
    
        fetch("http://localhost:9000/job/173", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.status;
        })
        .then((res) => {
            console.log('///////////////1')
            console.log(res);
            assert.equal(res, 200);
        })
    })

    it("Check ID", function(){
        // var id = 123;
        
        fetch("http://localhost:9000/job/173", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify(id)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log('///////////////2')
            console.log(res._id);
            assert.equal(res._id, 173);
        })
    })

    it("Add Job", async () =>{
        var email = "thus@hotmail.com";
        var data = { Email: email};
    
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {data: ciphertext};
        
        await fetch("http://localhost:9000/newjob", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sending_data)

        }).then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log('///////////////3')
            console.log(res);
            assert.equal(res, `New Job created with the following id: `);
        })
    })
})