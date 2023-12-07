const PORT = 8080;
const app = express();

app.listen(PORT, () => {
    console.log(`Server is ready, listening on port ${PORT}`);
  });

//page yang pertama kali muncul (home)
app.get('/', (req, res)=>{
    res.render('home')
})
