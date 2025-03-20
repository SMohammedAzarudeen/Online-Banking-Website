const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");

mongoose.connect("mongodb://localhost:27017/BankManagement", {
}).then(() => {
    console.log("MongoDB Connected");
}).catch(() => {
    console.log("Failed To Connect");
});

const BankSchema = new mongoose.Schema({
    name: String,
    accnum: Number,
    phno: Number,
    ifsc: String,
    email: String,
    password: String,
    conformpassword: String,
    Bank_Amount:Number,
});
const BankAccounts = mongoose.model("BankAccounts", BankSchema);

const LoanSchema = new mongoose.Schema({
    name: String,
    accnum: Number,
    phno: Number,
    ifsc: String,
    email: String,
    loanamount: Number,
    loan_option: String,
});
const LoanAccounts = mongoose.model("LoanAccounts", LoanSchema);

const CustomerCareSchema = new mongoose.Schema({
    email:String,
    Account_Number:Number,
    Phone_Number:Number,
    Problem:String

});
const Customer_Care = mongoose.model("Customer_Care",CustomerCareSchema);


app.get("/",(req,res)=>{
    res.render("home")
})
app.get("/Login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.get("/accdashboard", (req, res) => {
    res.render('accdashboard');
});

app.get("/loan", (req, res) => {
    res.render("loan");
});
app.get("/customercare",(req,res)=>{
    res.render("customercare");
})
app.get("/depositamount",(req,res)=>{
    res.render('depositamount');
})
app.get("/withdrawamount",(req,res)=>{
    res.render("withdrawamount");
})
app.get("/transferamount",(req,res)=>{
    res.render("transferamount");
})
app.get("/features",(req,res)=>{
    res.render("features");
})
app.get("/security",(req,res)=>{
    res.render("security")
})
app.get("/accountsdetails", async (req, res) => {
    try {
        
        const accounts = await BankAccounts.find(); 
        res.render("accountsdetails", { accounts }); 
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { errorMessage: "Failed to fetch accounts" });
    }
});

app.post("/register", async (req, res) => {
    const data = {
        name: req.body.name,
        accnum: req.body.accnum,
        phno: req.body.phno,
        ifsc: req.body.ifsc,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        conformpassword: await bcrypt.hash(req.body.conformpassword, 10),

    };
    const exuser = await BankAccounts.findOne({name:data.name})
    const exaccnum = await BankAccounts.findOne({accnum:data.accnum})
    const exphno = await BankAccounts.findOne({phno:data.phno})
    const exifsc = await BankAccounts.findOne({ifsc:data.ifsc})
    const exemail = await BankAccounts.findOne({email:data.email})

    if(exuser){
        return res.status(400).render("register",{errorMessage:"Username Already Exits"});
    }
    if(exaccnum){
        return res.status(400).render("register",{errorMessage:"Account-Number Already Exits"});
    }
    if(exphno){
        return res.status(400).render("register",{errorMessage:"Phone-Number Already Exits"});
    }
    if(exifsc){
        return res.status(400).render("register",{errorMessage:"IFSC Already Exits"});
    }
    if(exemail){
        return res.status(400).send("register",{errorMessage:"Email Already Exits"});
    }


    await BankAccounts.insertMany(data);
    res.redirect("/Login");
});

app.post("/loan", async (req, res) => {
    const Loan_data = {
        name: req.body.name,
        accnum: req.body.accnum,
        phno: req.body.phno,
        ifsc: req.body.ifsc,
        email: req.body.email,
        loanamount: req.body.loanamount,
        loan_option: req.body.loan_option,
    };
    await LoanAccounts.create(Loan_data);
    res.redirect("accdashboard");
});

app.post("/Login", async (req, res) => {
   try{
    const data = {
        name: req.body.name,
        password: req.body.password
    };
    const check = await BankAccounts.findOne({name:data.name});
    if(!check){
        return res.status(400).render("/Login",{errorMessage:"Username Not Exits"})
    }
    res.render("accdashboard");
    
    
   }
   catch(error){
    console.log(error);
   }
   
});
app.post("/customercare", async (req, res) => {
    try {
        const Customer_data = {
            email: req.body.email,
            accnum: req.body.accnum,
            phno: req.body.phno,
            pt: req.body.pt, 
        };

        
        const exemail = await BankAccounts.findOne({ email: Customer_data.email });
        // const exaccnum = await BankAccounts.findOne({ accnum: Customer_data.accnum });
        // const exphno = await BankAccounts.findOne({ phno: Customer_data.phno });

        if (!exemail) {
            return res.status(400).render("customercare", { errorMessage: "Email Not Found" });
        }
        // if (!exaccnum) {
        //     return res.status(400).render("customercare", { errorMessage: "Incorrect Account Number" });
        // }
        // if (!exphno) {
        //     return res.status(400).render("customercare", { errorMessage: "Phone Number Not Found" });
        // }
        if(exemail.accnum==Customer_data.accnum && exemail.phno==Customer_data.phno){
            await Customer_Care.create(Customer_data);
            res.render("accdashboard");
        }
        else{
            return res.status(400).render("customercare", { errorMessage: "Email Not Found" });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).render("customercare", { errorMessage: "Internal Server Error" });
    }
});
app.post('/depositamount', async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            amount: parseFloat(req.body.amount),
        };

        const exuser = await BankAccounts.findOne({ name: data.name });

        if (!exuser) {
            return res.status(404).render('depositamount', {
                errorMessage: 'Username Not Found',
                isSuccess: false,
            });
        }
        exuser.Bank_Amount = parseFloat(exuser.Bank_Amount) + data.amount;
        await exuser.save();

        res.status(200).render('depositamount', {
            errorMessage: 'Amount Deposited Successfully',
            isSuccess: true,
        });
    } catch (err) {
        res.status(500).render('depositamount', {
            errorMessage: 'Server Error: ' + err.message,
            isSuccess: false,
        });
    }
});
app.post('/withdrawamount',async (req,res)=>{
    try{
        const data={
            name:req.body.name,
            amount:req.body.amount,
        }
        const exuser = await BankAccounts.findOne({name:data.name})
        if(!exuser){
            res.status(400).render('withdrawamount',{errorMessage:"Username Not Found",isSuccess:false})
        }
        if(exuser.Bank_Amount<data.amount){
            res.status(400).render('withdrawamount',{errorMessage:'Insufficcient Bank Balance',isSuccess:false})
        }
        exuser.Bank_Amount-=data.amount;
        await exuser.save();
        return res.status(200).render('withdrawamount',{errorMessage:'Amount Withdraw Sucessfully'});
    }
    catch(err){
        console.log(err);
    }
    
});
app.post("/transferamount", async (req, res) => {
    try {
        const data = {
            yaccnum: req.body.yaccnum, 
            raccnum: req.body.raccnum, 
            amount: req.body.amount, 
        };
        const senderAccount = await BankAccounts.findOne({ accnum: data.yaccnum });
        if (!senderAccount) {
            return res.status(404).render('transferamount', {
                errorMessage: 'Sender Account Not Found',
                isSuccess: false,
            });
        }
        const receiverAccount = await BankAccounts.findOne({ accnum: data.raccnum });
        if (!receiverAccount) {
            return res.status(404).render('transferamount', {
                errorMessage: 'Receiver Account Not Found',
                isSuccess: false,
            });
        }

        if (senderAccount.Bank_Amount < data.amount) {
            return res.status(400).render('transferamount', {
                errorMessage: 'Insufficient Bank Balance',
                isSuccess: false,
            });
        }
        senderAccount.Bank_Amount = parseFloat(senderAccount.Bank_Amount)-data.amount;
        receiverAccount.Bank_Amount = parseFloat(receiverAccount.Bank_Amount)+data.amount;
        await senderAccount.save();
        await receiverAccount.save();

       
        return res.status(200).render('transferamount', {
            errorMessage: 'Amount Transferred Successfully',
            isSuccess: true,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).render('transferamount', {
            errorMessage: 'Server Error: ' + err.message,
            isSuccess: false,
        });
    }
});

app.listen(3000, () => {
    console.log("Server Running At http://localhost:3000");
});
