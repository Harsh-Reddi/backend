const adminModel = require('../models/adminModel')
const sellerModel = require('../models/sellerModel')
const sellerCustomerModel = require('../models/chat/sellerCustomerModel')
const { responseReturn } = require('../utils/response')
const {createToken} = require("../utils/createToken")
const bcrpty = require('bcrypt')
const formidable = require("formidable")
const cloudinary = require('cloudinary').v2


class authControllers{
    admin_login = async(req,res) => {
        const {email, password} = req.body
        try{
            const admin = await adminModel.findOne({email}).select('+password')
            if (admin) {
              const match = await bcrpty.compare(password, admin.password)
            //   console.log(match)
                if (match) {
                    const token = await createToken({
                        id: admin.id,
                        role: admin.role
                    })
                    const cookieOptions = {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        httpOnly: true,
                    };
                    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
                    res.setHeader("Set-Cookie", `accessToken=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`);
                    responseReturn(res,200,{token,message: 'Login Success'})
                } else {
                    responseReturn(res,404,{error: 'Password Wrong!'})
                }
            }
            else{
                responseReturn(res,404,{error: 'Email not Found'})
            }
        }
        catch (error) {
            responseReturn(res,500,{error: error.message})
        }
    }
    // End Method


    seller_register = async(req, res) => {
        const {email, name, password} = req.body
        try{
            const getUser = await sellerModel.findOne({email})
            if(getUser){
                responseReturn(res,404,{error: 'Email Already Exist!'})
            } else {
                const seller = await sellerModel.create({
                    name, email, password: await bcrpty.hash(password, 10), method: 'manually', shopInfo : {}
                })
                await sellerCustomerModel.create({
                    myId: seller.id
                })
                const token = await createToken({
                    id: seller.id, role: seller.role
                })
                // res.cookie('accessToken', token, {expires: new Date(Date.now() + 7*24*60*60*1000)})
                const cookieOptions = {

                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        httpOnly: true,
                    };
                    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
                    res.setHeader("Set-Cookie", `accessToken=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`);
                responseReturn(res,201,{token, message: 'Seller Registered Successfully!'})
            }
        }
        catch (error) {
            responseReturn(res,500,{error: 'Internal Server Error'})
        }
        
    }
    //End method

    seller_login = async(req,res) => {
        const {email, password} = req.body
        try{
            const seller = await sellerModel.findOne({email}).select('+password')
            if (seller) {
              const match = await bcrpty.compare(password, seller.password)
            //   console.log(match)
                if (match) {
                    const token = await createToken({
                        id: seller.id,
                        role: seller.role
                    })
                    // res.cookie('accessToken',token,{
                    //     expires: new Date(Date.now() + 7*24*60*60*1000)
                    // })
                    const cookieOptions = {
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        httpOnly: true,
                    };
                    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
                    res.setHeader("Set-Cookie", `accessToken=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`);
                    responseReturn(res,200,{token,message: 'Login Success'})
                } else {
                    responseReturn(res,404,{error: 'Password Wrong!'})
                }
            }
            else{
                responseReturn(res,404,{error: 'Email not Found'})
            }
        }
        catch (error) {
            responseReturn(res,500,{error: error.message})
        }
    }
    //End Method

    getUser = async(req,res) => {
        const {id,role} = req
        try {
            if (role === 'admin') {
                const user = await adminModel.findById(id)
                responseReturn(res,200,{userInfo : user})
            } else {
                const seller = await sellerModel.findById(id)
                responseReturn(res,200,{userInfo : seller})
            }
        } catch (error) {
            responseReturn(res,500,{error: 'Internal Server Error'})
        }
    }
    //End Method



    profile_image_upload = async(req, res) => {
        const {id} = req
        const form = formidable({multiples: true})
        form.parse(req, async(err,_,files) => {
            cloudinary.config({
                cloud_name: process.env.cloud_name,
                api_key: process.env.api_key,
                api_secret: process.env.api_secret,
                secure: true
            })
            const {image} = files
            try {
                const result = await cloudinary.uploader.upload(image.filepath, {folder: 'profile'})
                if (result) {
                    await sellerModel.findByIdAndUpdate(id, {
                        image: result.url
                    })
                    const userInfo = await sellerModel.findById(id)
                    responseReturn(res, 201, {message: 'Profile Image Upload Successfully', userInfo})
                } else {
                    responseReturn(res, 404, {error: 'Image Upload Fails'})
                }
            } catch (error) {
                responseReturn(res, 500, {error: error.message})
            }
        })
    }
    //end Method

    profile_info_add = async(req, res) => {
        const {id} = req
        const {division, district, shopName, sub_district} = req.body
        try {
            await sellerModel.findByIdAndUpdate(id, {
                shopInfo: {
                    shopName,
                    division,
                    district,
                    sub_district
                }
            })
            const userInfo = await sellerModel.findById(id)
            responseReturn(res, 201, {message: 'Profile Info Add Successfully', userInfo})
        } catch (error) {
            responseReturn(res, 500, {error: error.message})
        }
    }
    //End Method

    // logout = async (req, res) => {
    //     try {
    //         res.cookie('accessToken',null,{
    //             expires : new Date(Date.now()),
    //             httpOnly: true
    //         })
    //         responseReturn(res, 200,{ message : 'logout Success' })
    //     } catch (error) {
    //         responseReturn(res, 500,{ error : error.message })
    //     }
    //  }
    // End Method 

    logout = async (req, res) => {
    try {
        const cookieOptions = {
            expires: new Date(Date.now()),
            httpOnly: true,
        };
        if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

        // Clear the token by setting a null value with immediate expiration
        res.setHeader("Set-Cookie", `accessToken=null; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`);

        responseReturn(res, 200, { message: 'Logout Success' });
    } catch (error) {
        responseReturn(res, 500, { error: error.message });
    }
}
// End Method

}

module.exports = new authControllers()
