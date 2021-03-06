const assert = require('chai').assert;
const CryptoJS = require('crypto-js');
const fetch = require("node-fetch");
const expect = require('chai').expect;


describe('ApplyJob Test', function () {

    it('Success', async () => {

        var email = "e2etest@hotmail.com";
        var data = {
            Email: email
        };

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {
            data: ciphertext
        };

        await fetch("http://localhost:9000/job/addemployee/173", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)
            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res, '1 document(s) matched the query criteria.');
            })
    })

    it('Wrong Job ID', async () => {

        var email = "e2etest@hotmail.com";
        var data = {
            Email: email
        };

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {
            data: ciphertext
        };


        await fetch("http://localhost:9000/job/addemployee/99999", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)
            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res, 'No document(s) matched the query criteria.');
            })
    })


    it('Wrong Email', async () => {

        var email = "onDemand@hotmail.com";
        var data = {
            Email: email
        };

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {
            data: ciphertext
        };


        await fetch("http://localhost:9000/job/addemployee/173", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)
            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res, 'No user with the email onDemand@hotmail.com');
            })
    })

    it('Check email in CurrentEmployee DB', async () => {

        await fetch("http://localhost:9000/job/173", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                expect("e2etest@hotmail.com").to.be.oneOf(res['job']['CurrentEmployee']);
            })
    })
})


describe('Blog Test', function () {
    it('Get All Blog', async () => {

        await fetch('http://localhost:9000/allblog', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                expect(res).to.be.an('array');

            })
    })

    it('Get Blog Success', async () => {

        await fetch('http://localhost:9000/blog/14', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res['_id'], 14);
            })
    })

    it('Get Blog Fail', async () => {

        await fetch('http://localhost:9000/blog/9999999', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res, 'fail to find blog 9999999');
            })
    })

    it('Get Comment Success', async () => {

        await fetch('http://localhost:9000/blog/allcomment/14', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                expect(res).to.be.an('array');

            })
    })

    it('Get Comment Fail', async () => {

        await fetch('http://localhost:9000/blog/allcomment/999999', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res, 'fail to find blog 999999');

            })
    })

    var job_id = 0;

    it('Create&Edit&Delete Blog', async () => {

        var data = {
            BlogName: 'unittest',
            BlogDetail: 'unittest',
            BlogTopic: 'unittest',
            BlogImage: 'unittest',
            Employer: 'e2etest@hotmail.com',
            Status: "Ready"
        }

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {
            data: ciphertext
        };

        await fetch('http://localhost:9000/newblog', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                job_id = res.substring(22, 25);
                assert.equal(res, 'blog created with id: ' + job_id);

            })

        //Edit Success
        await fetch('http://localhost:9000/blogUpdate/' + job_id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res, '0 updated');

            })

        //Delete
        await fetch('http://localhost:9000/blog/' + job_id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                assert.equal(res, 'deleted one job');

            })

    })


    it('Notify Comment', async () => {

        await fetch('http://localhost:9000/useremail/e2etest@hotmail.com', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((response) => {
                return response.json();
            })
            .then((response) => {
                expect(response['notification']).to.be.an('array');
            })
    })

})
describe('Login', function () {

    it('Login Success', async () => {
        var email = 'e2etest@hotmail.com';
        var pass = '123456';
        let data = {
            email,
            pass
        };
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {
            data: ciphertext
        };

        await fetch("/userlogin", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)
            }).then((res) => {
                return res;
            })
            .then((res) => {
                console.log('///////////////1')
                console.log(res);
                assert.equal(res, 200);
            })
    })

})



describe('Create Job', function () {
    it('Response Success (200)', function () {

        fetch("http://localhost:9000/job/173", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((res) => {
                return res.status;
            })
            .then((res) => {
                // console.log('///////////////1')
                // console.log(res);
                assert.equal(res, 200);
            })
    })

    it("Check ID", function () {
        // var id = 123;

        fetch("http://localhost:9000/job/173", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify(id)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                // console.log('///////////////2')
                // console.log(res._id);
                assert.equal(res._id, 173);
            })
    })

    it("Add Job", async () => {
        var email = "thus@hotmail.com";
        var data = {
            Email: email
        };

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {
            data: ciphertext
        };

        await fetch("http://localhost:9000/newjob", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                // console.log('///////////////3')
                // console.log(res);
                assert.equal(res, `New Job created with the following id: `);
            })
    })
})

describe("Registration Unit test", function () {
    it("Create User Complete", () => {
        var name = "newusertest";
        var data = {
            Email: name
        };

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        let sending_data = {
            data: ciphertext
        };

        fetch("http://localhost:9000/newuser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)

            }).then((res) => {
                return res.json();
            })
            .then((res) => {
                console.log('///////////////4')
                console.log(res);
                assert.equal(res, `New User created success`);
            })
    })
})

//////TIME

describe('Payment Test', function () {

    it('Pay all with employer', async () => {
            //create job
            var emailEmployer = "thus2@hotmail.com";
            var emailEmployee = "thus2@gmail.com";
            var jobdata = {
                "JobName": "testPayment",
                "JobDetail": "None",
                "Wages": "50",
                "Amount": "999",
                "Location": "วิศวะ ฬ",
                "BeginTime": "08:00",
                "EndTime": "09:00",
                "Date": "2020-08-26",
                "CurrentEmployee": [],
                "CurrentAcceptedEmployee": [emailEmployee],
                "Employer": emailEmployer,
                "Status": "Ready"
            };

            let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(jobdata), '123456').toString();
            let sending_data = {
                data: ciphertext
            };
            await fetch("http://localhost:9000/newjob", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)
            })

            //get employer wallet
            employer = await fetch("http://localhost:9000/useremail/" + emailEmployer, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                //var walletEmployer = res.json().wallet
                return res.json();
            })
            thisJobId = employer.jobOwn[employer.jobOwn.length - 1]
            employerWallet = employer.wallet
            console.log(thisJobId)
            //get employee wallet
            employee = await fetch("http://localhost:9000/useremail/" + emailEmployee, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {

                return res.json();
            })
            employeeWallet = employee.wallet
            //do the payment

            await fetch("http://localhost:9000/wallet/job/" + thisJobId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            //get new employer wallet
            employer2 = await fetch("http://localhost:9000/useremail/" + emailEmployer, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {

                return res.json();
            })
            employerWallet2 = employer2.wallet

            //get new employee wallet
            employee2 = await fetch("http://localhost:9000/useremail/" + emailEmployee, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },

            }).then((res) => {
                return res.json();
            })
            employeeWallet2 = employee2.wallet
            assert.equal(employeeWallet2 - employeeWallet, jobdata.Wages, "employee check") //after - before equals wage
            // assert.equal(employerWallet - employerWallet2, jobdata.Wages*jobdata.CurrentAcceptedEmployee.length,"employee check")


        }),
        it('Pay all with employer but employer lack the money', async () => {
            //create job
            var emailEmployer = "test01@example.com"; // employer with no money
            var emailEmployee = "thus2@gmail.com";
            var jobdata = {
                "JobName": "testPayment",
                "JobDetail": "None",
                "Wages": "50",
                "Amount": "999",
                "Location": "วิศวะ ฬ",
                "BeginTime": "08:00",
                "EndTime": "09:00",
                "Date": "2020-08-26",
                "CurrentEmployee": [],
                "CurrentAcceptedEmployee": [emailEmployee],
                "Employer": emailEmployer,
                "Status": "Ready"
            };

            let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(jobdata), '123456').toString();
            let sending_data = {
                data: ciphertext
            };
            await fetch("http://localhost:9000/newjob", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sending_data)
            })

            //get employer wallet
            employer = await fetch("http://localhost:9000/useremail/" + emailEmployer, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {
                //var walletEmployer = res.json().wallet
                return res.json();
            })
            thisJobId = employer.jobOwn[employer.jobOwn.length - 1]
            employerWallet = employer.wallet
            console.log(thisJobId)
            //get employee wallet
            employee = await fetch("http://localhost:9000/useremail/" + emailEmployee, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {

                return res.json();
            })
            employeeWallet = employee.wallet
            //do the payment

            payment = await fetch("http://localhost:9000/wallet/job/" + thisJobId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((res) => {

                return res.json();
            })
            assert(payment, 'Employee has not enough money')

        })



})
describe("Job Request Unit test", async function () {
    it("Find all job", async () => {
        var emailEmployer = "thus2@hotmail.com";
        var emailEmployee = "thus2@gmail.com";
        var jobdata = {
            "JobName": "testJobRequest",
            "JobDetail": "None",
            "Wages": "50",
            "Amount": "999",
            "Location": "วิศวะ ฬ",
            "BeginTime": "08:00",
            "EndTime": "09:00",
            "Date": "2020-08-26",
            "CurrentEmployee": [],
            "CurrentAcceptedEmployee": [emailEmployee],
            "Employer": emailEmployer,
            "Status": "Ready"
        };

        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(jobdata), '123456').toString();
        let sending_data = {
            data: ciphertext
        };
        await fetch("http://localhost:9000/newjob", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sending_data)
        })

        alljob = await fetch("http://localhost:9000/getalljob", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }

        }).then((res) => {
            return res.json();
        })

        employer = await fetch("http://localhost:9000/useremail/" + emailEmployer, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            return res.json();
        })
        thisJobId = employer.jobOwn[employer.jobOwn.length - 1]

        findjob = await fetch("http://localhost:9000/job/" + thisJobId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }

        }).then((res) => {
            return res.json();
        })
        console.log(jobdata, findjob.job)
        assert(alljob.length > 0, "check all job")
        assert.equal(jobdata.JobName, findjob.job.JobName, "check find job")

    })
})