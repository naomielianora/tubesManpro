import express from "express";
import csvParser from "csv-parser";
import multer from "multer";
import fs from "fs";
import bodyParser from "body-parser";

const PORT = 8080;
const app = express();
const upload = multer({ dest: "uploads/" });

app.listen(PORT, () => {
  console.log(`Server is ready, listening on port ${PORT}`);
});

app.set("view engine", "ejs");
//dipakai untuk page see report
app.use(express.urlencoded({ extended: true }));
//dipakai untuk routing path file css, assets
app.use(express.static("public"));
app.use(express.json());

//DATABASE CONNECTION--------------------------------------------------------------------------------
import mysql from "mysql";

//perlu dibuat terlebih dahulu database di phpmyadmin dengan nama "retaildash", lalu import file table structure.sql
const pool = mysql.createPool({
  user: "root",
  password: "",
  database: "retaildash",
  host: "localhost",
});

const dbConnect = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) {
        reject(err);
      } else {
        resolve(conn);
      }
    });
  });
};

const conn = await dbConnect(); // Connect to the database
//============================================================================================

//page yang pertama kali muncul (home)
app.get("/", (req, res) => {
  res.render("home");
});

//ADD DATA-----------------------------------------------------------------------

//saat "Add Data" di klik
app.get("/add_data", (req, res) => {
  res.render("add_data");
});

app.post("/uploadFile", upload.single("file_upload"), (req, res) => {
  const csvFile = req.file;

  pool.getConnection((err, conn) => {
    if (err) {
      console.error("Error connecting to database:", err);
      res.status(500).send("Error connecting to database");
      return;
    }

    fs.createReadStream(csvFile.path)
      .pipe(csvParser())
      .on("data", (row) => {
        const retailMarketing = {
          ID: row.ID,
          Year_Birth: row.Year_Birth,
          Education: row.Education,
          Marital_Status: row.Marital_Status,
          Income: row.Income,
          Kidhome: row.Kidhome,
          Teenhome: row.Teenhome,
          Dt_Customer: row.Dt_Customer,
          Recency: row.Recency,
          MntWines: row.MntWines,
          MntFruits: row.MntFruits,
          MntMeatProducts: row.MntMeatProducts,
          MntFishProducts: row.MntFishProducts,
          MntSweetProducts: row.MntSweetProducts,
          MntGoldProds: row.MntGoldProds,
          NumDealsPurchases: row.NumDealsPurchases,
          NumWebPurchases: row.NumWebPurchases,
          NumCatalogPurchases: row.NumCatalogPurchases,
          NumStorePurchases: row.NumStorePurchases,
          NumWebVisitsMonth: row.NumWebVisitsMonth,
          AcceptedCmp3: row.AcceptedCmp3,
          AcceptedCmp4: row.AcceptedCmp4,
          AcceptedCmp5: row.AcceptedCmp5,
          AcceptedCmp1: row.AcceptedCmp1,
          AcceptedCmp2: row.AcceptedCmp2,
          Complain: row.Complain,
          Z_CostContact: row.Z_CostContact,
          Z_Revenue: row.Z_Revenue,
          Response: row.Response,
        };

        const query = "INSERT INTO retail_marketing SET ?";
        conn.query(query, retailMarketing, (error, results, fields) => {
          if (error) {
            console.error("Error importing data to Retail Marketing table:", error);
          }
        });
      })
      .on("end", () => {
        conn.release();
        res.redirect("/add_data_conf");
      });
  });
});

//saat data dari csv sukses diinput ke database
app.get("/add_data_conf", (req, res) => {
  res.render("add_data_conf");
});
//========================================================================

//saat "See Report" di klik
app.get("/see_report", (req, res) => {
  res.render("see_report");
});

const getReport = (conn, agregat, kelompok, kolom) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ${kelompok} AS Kelompok, ${agregat}(${kolom}) AS Hasil FROM retail_marketing GROUP BY ${kelompok}`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

app.post("/searched_report", async (req, res) => {
  const conn = await dbConnect();
  const { kelompok, agregat, kolom } = req.body;
  const hasil = await getReport(conn, agregat, kelompok, kolom);
  res.render("searched_report", {
    kelompok: kelompok,
    agregat: agregat,
    kolom: kolom,
    rows: hasil,
  });
});

//saat "Bar Chart" di klik
app.get("/bar_chart", (req, res) => {
  res.render("bar_chart");
});

app.get("/getData", async (req, res) => {
  const kat = req.query.kategori;
  const conn = await dbConnect();
  const barData = await getBarData(conn, kat);
  res.json(barData);
});

const getBarData = (conn, kategori) => {
  return new Promise((resolve, reject) => {
    // Lakukan query ke database untuk mendapatkan data scatter plot
    const query = `SELECT ${kategori} as 'sbx', COUNT(${kategori}) as 'jumlah' FROM retail_marketing GROUP BY ${kategori}`;
    conn.query(query,(err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};


//saat "Scatter Plot" di klik
app.get("/scatter_plot", (req, res) => {
  res.render("scatter_plot");
});

//server side rendering untuk scatter plot
app.post("/scatterPlot", async (req, res) => {
  const { xAxis, yAxis } = req.body;

  console.log(req.body);

  console.log("xAxis:", xAxis);
  console.log("yAxis:", yAxis);

  const conn = await dbConnect();
  const scatterData = await getScatterData(conn, xAxis, yAxis);

  res.json({ scatterData, xAxis, yAxis });
});

const getScatterData = (conn, xAxis, yAxis) => {
  return new Promise((resolve, reject) => {
    // Lakukan query ke database untuk mendapatkan data scatter plot
    const query = `SELECT ${xAxis} AS x, ${yAxis} AS y FROM retail_marketing`;
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
