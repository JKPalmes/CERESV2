/*
Template Name: Ceres - Admin & Dashboard Template
Author: Data Technology Group
Website: https://Data Technology Group.com/
Contact: Data Technology Group@gmail.com
File: Two step verification Init Js File
*/

// move next
function moveToNext(elem, count) {
    if (elem.value.length > 0) {
        document.getElementById("digit" + count + "-input").focus();
    }
}