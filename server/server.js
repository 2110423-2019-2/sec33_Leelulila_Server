const express = require('express')
const app = express()





app.use(express.json())
const dummy = [{
    ID:001,
    CurrentJob: 'eiei',
    HistoryJob: ['chuck wow','eat somnukass'],
    Name: "Drive",
    Surname: "Chun o cha",
    Password: 1001
},{
    ID:002,                           
    CurrentJob: 'yedped',
    HistoryJob: ['chuck wow','eat somnukass'],
    Name: "Teemo",
    Surname: "Gupen Jek",
    Password: 1001
},{
    ID:003,
    CurrentJob: 'dude nom prayud',
    HistoryJob: ['chuck wow','eat somnukass'],
    Name: "somnuk",
    Surname: "Por drive" , 
    Password: 1001   
}

]

app.get('/dummy', (req, res) => { //get all list of db
    res.json(dummy)
  })    

app.get('/dummy/:ID', (req, res) => {//get unit by ID
    const { ID } = req.params
    const result = dummy.find(dummy => dummy.ID = ID)
    res.json(result)
  })
app.post('/dummy', (req, res) => {
    const payload = req.body
    res.json(payload)
  })
  
app.put('/dummy/:ID', (req, res) => {
    const { ID } = req.params
    res.json({ ID })
  })
  
app.delete('/dummy/:ID', (req, res) => {
    const { ID } = req.params
    res.json({ ID })
  })

app.get('/', (req, res) => {
    res.json({ message: 'Ahoy!' })
  })
  
app.get('/hello/:message', (req, res) => {
  const { params } = req
  res.json({ message: 'Ahoy!', params })
})

app.listen(9000, () => {
  console.log('Application is running on port 9000')
})