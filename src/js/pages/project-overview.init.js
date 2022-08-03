/*
Template Name: Ceres - Admin & Dashboard Template
Author: Data Technology Group
Website: https://Data Technology Group.com/
Contact: Data Technology Group@gmail.com
File: Project overview init js
*/

// favourite btn
var favouriteBtn = document.querySelectorAll(".favourite-btn");
if (favouriteBtn) {
    document.querySelectorAll(".favourite-btn").forEach(function (item) {
        item.addEventListener("click", function (event) {
            this.classList.toggle("active");
        });
    });
}