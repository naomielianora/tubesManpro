import express from 'express';

const PORT = 8080;
const app = express();

app.listen(PORT, () => {
    console.log(`Server is ready, listening on port ${PORT}`);
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

//page yang pertama kali muncul (home)
app.get('/', (req, res)=>{
    res.render('home')
})

//saat "Add Data" di klik
app.get('/add_data', (req, res)=>{
    res.render('add_data')
})

//saat "See Report" di klik
app.get('/see_report', (req, res)=>{
    res.render('see_report')
})

app.get('/see_report2', (req, res)=>{
    res.render('see_report2')
})

//saat "Bar Chart" di klik
app.get('/bar_chart', (req, res)=>{
    res.render('bar_chart')
})

//saat "Scatter Plot" di klik
app.get('/scatter_plot', (req, res)=>{
    res.render('scatter_plot')
})

//server side rendering untuk scatter plot
app.post('/scatterPlot', (req, res) => {
    
    // const data = req.body; //data yang dikirim dari formulir di halaman HTML
   
    res.json({ message: 'Scatter plot data received successfully.' });
});