require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { Account, CustomerDetails } = require('../models/index');
const crypto = require('crypto');
const {token} = require('morgan');
const { OK, CREATED, SuccessResponse  } = require("../middlewares/success.response");
const { error } = require('console');


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass:  process.env.EMAIL_PASS,
    },
  });
  //cai này la register
const register = async (req, res) => {
    try {
        const { email, password, fullname, phone } = req.body;
        console.log('Request body:', req.body);
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+com+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({success: false, message: "Invalid email"})
        }

        const user = await Account.findOne({ where: { email: req.body.email } });
        console.log(user);
        if (user) {
           
          return res.status(400).json({ error: 'Email already exists' });
        }
        
        const verified = 0;
        const otpTime = new Date(Date.now() + 10 * 60 * 1000);
        const otp = crypto.randomInt(100000, 999999).toString();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã OTP xác nhận đăng ký',
            text: `Mã OTP của bạn là: ${otp}`,
          });
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

         const newAccount = await Account.create({
            email,
            password: hashedPassword,
            otp,
            otpTime: otpTime,
            verified,
        });
        const newCustomerDetails = await CustomerDetails.create({
            Fullname: fullname,
            Phone:  phone,
            IDAcc: newAccount.IDAcc
        });
      
          
          return res.status(200).json({ message: 'User created successfully' , newAccount, newCustomerDetails});
          
    } catch (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
const getCustomerDetails = async (req, res) => {
    try {
        const email = req.query.email;
        let customers;

        if (email) {
            console.log("Searching customer by email:", email);

            // Tìm khách hàng theo email với quan hệ CustomerDetails
            customers = await Account.findOne({
                where: { email },
                include: [{
                    model: CustomerDetails,
                    required: true,
                    as: 'CustomerDetail',
                    attributes: ['Fullname', 'Phone']
                }],
                attributes: ['IDAcc','password', 'email', 'Role', 'verified', 'createdAt']
            });
            
            if (!customers) {
                console.log("Customer not found for email:", email);
                return res.status(404).json({ message: 'Customer not found' });
            }

            console.log("Fetched customer data:", {
                IDAcc: customers.IDAcc,
                email: customers.email,
                password: customers.password,
                Role: customers.Role,
                fullname: customers.CustomerDetail.Fullname,
                phone: customers.CustomerDetail.Phone
            });
        } else {
            console.log("Fetching all customers with their details.");

            // Lấy tất cả khách hàng cùng thông tin chi tiết
            customers = await Account.findAll({
                include: [{
                    model: CustomerDetails,
                    required: true,
                    as: 'CustomerDetail',
                    attributes: ['Fullname', 'Phone']
                }],
                attributes: ['IDAcc','password', 'email', 'Role', 'verified', 'createdAt']
            });

            // Chỉ log các trường quan trọng của từng khách hàng
            const simplifiedCustomers = customers.map(customer => ({
                IDAcc: customer.IDAcc,
                email: customer.email,
                Role: customer.Role,
                password : customer.password,
                fullname: customer.CustomerDetail.Fullname,
                phone: customer.CustomerDetail.Phone,
            }));
            
            console.log("Fetched customer data:", simplifiedCustomers);
            customers = simplifiedCustomers; 
        }

        res.status(200).json(customers);
      
    } catch (error) {
        console.error("Error in getCustomerDetails:", error);
        res.status(500).json({ message: `Error fetching customer details: ${error.message}` });
    }
};


//login ở đây
const login = async (req, res) => {
    try {
        const { email, password} = req.body;

        // Kiểm tra xem email có tồn tại không
        const user = await Account.findOne({ where: { email:email }});
        const user1 = await CustomerDetails.findOne({ where: { IDAcc: user.IDAcc } });
        if (!user) {
            console.log("User not found:", email); // Ghi lại email không tìm thấy
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        console.log("Password from request:", password);
        console.log("Hashed password from DB:", user.password);
        if(user.verified===false){
            return res.status(401).json({error: 'You are not verify'})
        }
        else{ 
            const isMatch = await bcrypt.compare(password, user.password);
         if (isMatch) {
            const token = jwt.sign({
                userID: user.IDAcc ,
                role : user.Role,
                fullname: user1.Fullname,
            }, process.env.JWT_SECRET, { expiresIn: '10m' });
            const refreshToken = jwt.sign(
                {  userID: user.IDAcc ,
                    role : user.Role,
                    fullname: user1.Fullname,
                }, process.env.REFRESH_TOKEN_SECRET,{expiresIn:'1d'}
            );
            res.cookie('jwt', refreshToken,
                {
                    httpOnly:true,
                    samSite:'None',secure:true,
                    maxAge:24*60*60*1000
                }
            );
            return res.json({ token, role: user.Role , fullname: user1.Fullname});
        } else {
            console.log("Password mismatch");
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        }
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



const verify = async (req,res) =>{

    try {
        const { email, otp } = req.body;
        const user = await Account.findOne({ where: { email:req.body.email }});
       
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        if (otp !== user.otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }
        else {
            const currentTime = new Date();
            if (currentTime > user.otpTime) {
                return res.status(400).json({ error: 'OTP has expired' });
            }
        }
        await Account.update(
            { otp: null, otpTime: null, verified: '1' },
            { where: { email: email } }
        );
        return res.status(200).json({ message: 'OTP verified successfully' });

    } catch (err) {
        console.error('Error verifying OTP:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const handleRefreshToken = async (req, res, next) => {
  new SuccessResponse({
    message: 'Get token success!',
    metadata: await AuthJWTService.handleRefreshToken({
      refreshToken: req.refreshToken,
      user: req.user,
      keyStore: req.keyStore
    })
  }).send(res)
}



module.exports = {
    register,
    login,
    verify,
    getCustomerDetails,
};
