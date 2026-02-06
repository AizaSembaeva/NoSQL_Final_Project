# Online Shop Web Application

## Project Description
Online Shop is a full-stack web application developed as a final project for the **Advanced Databases (NoSQL)** course. The application demonstrates practical usage of MongoDB in an e-commerce scenario, including data modeling, CRUD operations, aggregation queries, authentication, and RESTful API design.

The system allows users to browse products, place orders, and make payments, while administrators can manage products, categories, and orders.

---

## Technology Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **Frontend:** HTML, CSS, JavaScript  
- **Authentication:** JWT (JSON Web Tokens)  

---

## Main Features
- User registration and login  
- Role-based access control (user / admin)  
- Product and category management  
- Order creation and order history  
- Payment processing  
- MongoDB aggregation for order statistics  
- Filtering, sorting, and pagination  
- Centralized error handling  

---

## Project Structure
```text
NoSQL_FinalProject/
├── app.js
├── server.js
├── config/
│   └── db.js
├── models/
├── controllers/
├── routes/
├── middleware/
├── utils/
├── seed/
│   └── seedAdmin.js
├── public/
│   ├── assets/
│   └── *.html
└── README.md

```

##  Environment Variables
Create a `.env` file in the project root directory and define the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

##  How to run the project

- Install project dependencies:
` npm install express mongoose dotenv bcryptjs express-session ` 
- Start the development server:
` node server.js ` 
- Open the application in your browser:
` http://localhost:3000 `

##  Team Contribution
- Aizada Sembayeva 

Project initialization, authentication and authorization, product and payment CRUD endpoints, frontend pages, admin seed script, documentation and final report.

- Aiya Zhakupova

MongoDB connection setup, database models, controller layer, centralized error handling, order and category CRUD endpoints, frontend JavaScript logic and CSS styling.
