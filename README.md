# Sentency

A web-based application for tracking sentence-based tasks, built with Node.js, Express, and MongoDB.

#Technologies
Backend:
Node.js
Express
MongoDB (Mongoose)
Frontend:
Pug

#Authentication:
Passport (passport-local)
Session Management:
express-session
Form Validation:
express-validator
Utilities:
bcryptjs
connect-flash
body-parser
bower

#Installation
Clone the repository:

sh
Copy code
git clone https://github.com/your-username/sentence-task-tracking-dashboard.git
cd sentence-task-tracking-dashboard
Install server dependencies:

sh
Copy code
npm install
Install frontend dependencies using Bower:

sh
Copy code
bower install
Set up MongoDB: Ensure MongoDB is running locally or use a cloud service.

Configure environment variables: Create a .env file with the following:

sh
Copy code
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
Start the application:

sh
Copy code
npm start
Open your browser: Go to http://localhost:3000

#Usage
Sign up / Log in: Create a new account or log in with an existing one.
Manage Tasks: Add, edit, or delete tasks.
View Task List: See all your tasks in a structured format.
