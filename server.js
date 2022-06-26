require("dotenv").config();
const mysql = require('mysql');
const express = require('express');
const session = require('cookie-session');
const path = require('path');
const multer = require('multer');
const { json } = require('express/lib/response');
const bodyParser = require('body-parser');


const connection = mysql.createConnection({
	host     : 'eu-cdbr-west-02.cleardb.net',
	user     : 'b47adab09e098c',
	password : '7a480c1d',
	database : 'heroku_3c8c520b5a07ad3',
	multipleStatements: true,
});


const app = express();
app.set('trust proxy', 1);

app.use(session({
secret: 'secret',
saveUninitialized: true,
resave: false,
maxAge: 1000 * 60 * 15,
cookie:{
    secure: true
       }
}));
app.set('view engine', 'ejs');



// app.use(session({
// 	secret: 'keyboard cat',
// 	resave: false,
// 	saveUninitialized: false,

// }));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(__dirname + '/public'));

//! Use of Multer
var storage = multer.diskStorage({
    destination: (request, file, callBack) => {
        callBack(null, './public/pdf/')     // './public/pdf/' directory name where save the file
    },
    filename: (request, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
		
    }
})
 
var upload = multer({
    storage: storage
});
//Email contact

const nodeMailer =  require('nodemailer');
const { request } = require('https');
const e = require('express');



async function mainMail(name, email, subject, message) {
	const transporter = await nodeMailer.createTransport({
		host: 'mail.privateemail.com',
		port: 587,
		auth: {
		  user: process.env.EMAIL_USER,
		  pass: process.env.PASSWORD,
		}
	  });
  const mailOption = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: subject,
    html: `You got a message from 
    Email : ${email}
    Name: ${name}
    Message: ${message}`,
  };
  try {
    await transporter.sendMail(mailOption);
    return Promise.resolve("Message Sent Successfully!");
  } catch (error) {
    console.log(error)
    return Promise.reject(error);
  }
}


app.get("/contactus", (request, response) => {
	
	if (request.session.loggedin) {
		
		response.render("contactus" , { data: { username: globaluserobj.name } });
	} else {
		// Not logged in
		response.redirect('login');
	}
});

app.post("/contacthome", async (request, response, next) => {
	const { yourname, youremail, yoursubject, yourmessage } = request.body;
	try {
	  await mainMail(yourname, youremail, yoursubject, yourmessage);
	  response.redirect("/");
	  
	} catch (error) {
	  console.log(error)
	  response.send("Message Could not be Sent");
	}
  });

app.post("/contact", async (request, response, next) => {
  const { yourname, youremail, yoursubject, yourmessage } = request.body;
  try {
    await mainMail(yourname, youremail, yoursubject, yourmessage);
    response.render("contactusdone" , { data: { username: globaluserobj.name } });
    
  } catch (error) {
	console.log(error)
    response.send("Message Could not be Sent");
  }
});
//End email contact

//Email office hours

async function ohMail(appointment, yourtopic, yourcomment, coursetitle, ohday,ohroom, email,useremail,name,id) {
	
	
	
	const transporter = await nodeMailer.createTransport({
		host: 'mail.privateemail.com',
		port: 587,
		auth: {
		  user: process.env.EMAIL_USER,
		  pass: process.env.PASSWORD,
		}
	  });
	 
  const mailOption = {
	  
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Office Hours for "+coursetitle,
    html: ` 
    <strong>Topic:</strong> ${yourtopic}
	<br>
    <strong>Appointment:</strong> ${appointment}
	<br>
	<strong>Day:</strong> ${ohday}
	<br>
	<strong>Room:</strong> ${ohroom}
	<br>
    <strong>Message:</strong> ${yourcomment}
	<br>
	<br>
    <strong>Name:</strong> ${name}
	<br>
	<strong>Student ID:</strong> ${id}
	<br>
    <strong>Email:</strong> ${useremail}`,
  };
  try {
    await transporter.sendMail(mailOption);
    return Promise.resolve("Message Sent Successfully!");
  } catch (error) {
    console.log(error)
    return Promise.reject(error);
  }

}


const forgotMail = async function(email, password) {
	
	
	
	const transporter = await nodeMailer.createTransport({
		host: 'mail.privateemail.com',
		port: 587,
		auth: {
		  user: process.env.EMAIL_USER,
		  pass: process.env.PASSWORD,
		}
	  });
	 
  const mailOption = {
	  
    from: process.env.EMAIL_USER,
    to: email,
    subject: "StudentHub Password",
    html: ` 
    <strong>Your Password:</strong> ${password}`,
  };
  try {
    await transporter.sendMail(mailOption);
    return Promise.resolve("Message Sent Successfully!");
  } catch (error) {
    console.log(error)
    return Promise.reject(error);
  }

}

const reportMail = async function(postid, email, name, id) {
	
	
	
	const transporter = await nodeMailer.createTransport({
		host: 'mail.privateemail.com',
		port: 587,
		auth: {
		  user: process.env.EMAIL_USER,
		  pass: process.env.PASSWORD,
		}
	  });
	 
  const mailOption = {
	  
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Report Post #"+postid,
    html: ` 
	<strong>My Name:</strong> ${name}
	<br>
	<strong>Student ID:</strong> ${id}
	<br>
	<strong>My Email:</strong> ${email}
	<br>
    <strong>I want to report post #</strong> ${postid}`,
  };
  try {
    await transporter.sendMail(mailOption);
    return Promise.resolve("Message Sent Successfully!");
  } catch (error) {
    console.log(error)
    return Promise.reject(error);
  }

}

app.get('/ohform', function(request, response) {
	
	if (request.session.loggedin) {
		
		connection.query('SELECT * FROM courses WHERE course_id = ?', [Number(request.query.course_id)], function(error, results, fields) {
		
			var resobjectstring= JSON.stringify(results[0]);
			fullobject = JSON.parse(resobjectstring);
			fullobjectglobal = global.fullobject;
			
			
			
			response.render("ohform" ,  { data: { courses: results, username: globaluserobj.name } });
			 
		
		});
	} else {
		// Not logged in
		response.redirect('login');
	}
});

app.post("/form", async (request, response, next) => {
	
	
	const { appointment, yourtopic, yourcomment} = request.body;
	
	try {
	  
		await ohMail(appointment, yourtopic, yourcomment, fullobjectglobal.course_title, fullobjectglobal.oh_day, fullobjectglobal.oh_room, fullobjectglobal.email, globaluserobj.email ,globaluserobj.name, globaluserobj.id);
		response.render("officehoursdone" ,  { data: { username: globaluserobj.name } });
		
	} catch (error) {
	  console.log(error)
	  response.send("Message Could not be Sent");
	}

  });


  app.get('/report/:postid', function(request, response, next){

	var postid = request.params.postid;


	try {
	  
		reportMail(postid,globaluserobj.email ,globaluserobj.name, globaluserobj.id);
		response.redirect(request.get('referer'));
		
	} catch (error) {
	  console.log(error)
	  response.send("Message Could not be Sent");
	}

});  

app.get('/delete/:postid', function(request, response, next){

	var postid = request.params.postid; 

	var sql = `
	DELETE FROM posts WHERE postid = "${postid}"
	`;

	connection.query(sql, function(error, data){

		if(error)
		{
			throw error;
		}
		else
		{
			response.redirect(request.get('referer'));
			//response.redirect("/Home");
		}

	});

});



app.get('/login', function(request, response) {
	if (request.session.loggedin) {
		
		response.redirect("Home");
	} else {
		response.render("login" );
	}
	
});


app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/sitemap.xml', function(request, response) {
	response.sendFile(path.join(__dirname + '/sitemap.xml'));
});
app.get('/FAQs', function(request, response) {	
	if (request.session.loggedin) {
		
		response.render("FAQs" , { data: { username: globaluserobj.name } });
	} else {
		// Not logged in
		response.redirect('login');
	}
});

app.get('/studyspace', function(request, response) {
	if (request.session.loggedin) {
		
		response.render("studyspace" , { data: { username: globaluserobj.name } });
	} else {
		// Not logged in
		response.redirect('login');
	}
});

app.get('/schedule', function(request, response) {
	
	if (request.session.loggedin) {
		
		connection.query('SELECT * FROM courses', [], function(error, results, fields) {
			response.render("schedule" , { data: { courses: results, username: globaluserobj.name } });
		});

	} else {
		// Not logged in
		response.redirect('login');
	}
	
});



app.get('/courses', function(request, response) {
	
	if (request.session.loggedin) {
		
		connection.query('SELECT * FROM courses WHERE course_dept = ?', [request.query.dept], function(error, results, fields) {
			response.render("courses" , { data: { courses: results, username: globaluserobj.name } });
			
		});

	} else {
		// Not logged in
		response.redirect('login');
	}
	
});

app.get('/courses_oh', function(request, response) {
	
	if (request.session.loggedin) {
		
		connection.query('SELECT * FROM courses WHERE course_dept = ?', [request.query.dept], function(error, results, fields) {
			response.render("courses_oh" , { data: { courses: results, username: globaluserobj.name } });
			
		});

	} else {
		// Not logged in
		response.redirect('login');
	}
});

app.get('/files', function(request, response) {
	
	
	if (request.session.loggedin) {
		
		connection.query(' SELECT * FROM posts WHERE course_id = ?;SELECT * FROM courses WHERE course_id = ?', [Number(request.query.course_id),Number(request.query.course_id)], function(error, results, fields) {
		
			courseid = global.Number(request.query.course_id);
			
			response.render("files" , { data: { posts: results[0], username: globaluserobj.name, studentid: globaluserobj.id, courses: results[1] } });
		});

	} else {
		// Not logged in
		response.redirect('login');
	}
	
});



app.post('/post', upload.single('pdf'), function(request, response) {

	if (!request.file) {
		console.log("No file upload");
	} else {
		console.log(request.file.filename)
		var pdfsrc = 'https://studenthub.space/pdf/' + request.file.filename
		
		var filename1 = request.file.originalname;
		
	}

	const { posttext } = request.body;
	let datetime ="\""+ new Date().toLocaleString() +  "\"";
	let filename2= "\""+ filename1+  "\"" ;
	let attach= "\""+ pdfsrc+  "\"" ;
	let posttextq= "\""+ posttext+  "\"" ;
	let studentname= "\""+ globaluserobj.name+  "\"" ;
	let studentid= "\""+ globaluserobj.id+  "\"" ;
	let sql = "INSERT INTO posts (course_id, posttext, attach,filename,datetime, name,studentid) VALUES ("+courseid+","+posttextq+","+attach+","+filename2+","+datetime+","+studentname+","+studentid+")";
	
	
	connection.query(sql, function (err, result) {
    if (err) throw err;
	response.redirect(request.get('referer'));
	
    
  });

  
	
});

app.get('/appointment', function(request, response) {
	if (request.session.loggedin) {
		
		response.render("appointment" , { data: { username: globaluserobj.name } });

		
	} else {
		// Not logged in
		response.redirect('login');
	}
});

app.get('/forgot-password', function(request, response) {
	if (request.session.loggedin) {
		
		response.redirect("Home");
	} else {
		response.render("forgot-password" );
	}
	
});

app.post('/forgotform', function(request, response) {
	let email = request.body.email;
	let studentid = request.body.studentid;
	if (typeof studentid != "string" || typeof email != "string"){
		response.send("Invalid parameters!");
		response.end();
		return;
	   } else if (studentid && email) {

		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT password FROM accounts WHERE id = ? AND email = ?', [studentid, email], function(error, results, fields) {
			
			
			if (results.length > 0) {
				
				let password = results[0].password; 
				try {
				 forgotMail(email,password);

				 response.redirect('login');
				//response.end();
				} catch (error) {
				  console.log(error)
				  response.end();
				}



			} else {
				
				response.render("forgot-password", { message: "Incorrect ID and/or Email!"  });
			}
		
		});
	}


	
});


app.get('/clubs', function(request, response) {
	

	if (request.session.loggedin) {
		
		connection.query('SELECT * FROM clubs', [], function(error, results, fields) {
			response.render("clubs" , { data: { clubs: results, username: globaluserobj.name } });
		});
		
	} else {
		// Not logged in
		response.redirect('login');
	}
	
});

app.get('/clubinfo', function(request, response) {
	
	
	if (request.session.loggedin) {
		
		connection.query('SELECT * FROM clubs WHERE id = ?', [request.query.id], function(error, results, fields) {
			response.render("clubinfo" , { data: { clubs: results, username: globaluserobj.name } });
		});
		
	} else {
		// Not logged in
		response.redirect('login');
	}	

});


app.post('/auth', function(request, response) {
	// Capture the input fields
	let studentid = request.body.studentid;
	let password = request.body.password;
	   
	// Reject different type
	if (typeof studentid != "string" || typeof password != "string"){
		response.render("login",  { message: "Invalid parameters!"  } );
		//response.send("Invalid parameters!");
		//response.end();
		//return;
	   } 
	  
	// Ensure the input fields exists and are not empty
	if (studentid && password) {

		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE id = ? AND password = ?', [studentid, password], function(error, results, fields) {
			
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.studentid = studentid;
				// Redirect to home page
					var userobject= JSON.stringify(results[0]);
					fulluserobject = JSON.parse(userobject);
					globaluserobj = global.fulluserobject;
					
				
				  response.redirect('Home');
			} else {
				
				response.render("login",  { message: "Incorrect Username and/or Password!"  } );
				//response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.render("login",  { message: "Please enter Username and Password!"  } );
		response.end();
	}
});

app.get('/Home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		
		response.render("Home", { data: { username: globaluserobj.name } } );
		
	} else {
		// Not logged in
		response.redirect('login');
		//response.send('Please login to view this page!');
	}
	
});

app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /");
});

app.get('/logout',  (request, response, next) => {
	request.session.loggedin = false;

	request.session = null;
	sessionStore.close();
	response.redirect('login');
 })

app.get('*', function(request, response){
	response.render('notfound');
  });
const PORT = process.env.PORT || 443;
app.listen(PORT);
console.log(`Server is listening on port ${PORT}...`);