/*
Template Name: Ceres - Admin & Dashboard Template
Author: Data Technology Group
Website: https://Data Technology Group.com/
Contact: Data Technology Group@gmail.com
File: Password addon Js File
*/

// password addon
if (document.getElementById('password-addon'))
	document.getElementById('password-addon').addEventListener('click', function () {
		var passwordInput = document.getElementById("password-input");
		if (passwordInput.type === "password") {
			passwordInput.type = "text";
		} else {
			passwordInput.type = "password";
		}
	});