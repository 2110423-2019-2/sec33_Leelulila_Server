const axios = require('../../sec33_Leelulila/node_modules/axios').default;
// const cryptojs = require('../../../../../../../thusk/Library/Caches/typescript/3.7/node_modules/')
const assert = require('chai').assert;

describe('createUser',function(){
    it('Should Response',function(){
        assert.equal(1,1);

        axios.get('http://localhost:9000/getalljob')
            .then(response => {
                console.log(response)
            })

        // var data = { Email: "e2etest@hotmail.com" };

        // // let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), '123456').toString();
        // // let sending_data = {data: ciphertext};

        // axios("/job/addemployee/" + "173", {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // }).then(function (response) {
        //     if (response.status >= 400) {
        //     throw new Error("Bad response from server");
        //     }
        
        //     // console.log(response);
        // })


    })

    

})