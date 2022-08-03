/*
Template Name: Ceres - Admin & Dashboard Template
Author: Data Technology Group
Version: 1.5.0
Website: https://Data Technology Group.com/
Contact: Data Technology Group@gmail.com
File: Common Plugins Js File
*/

//Common plugins
if(document.querySelectorAll("[toast-list]") || document.querySelectorAll('[data-choices]') || document.querySelectorAll("[data-provider]")){ 
  document.writeln("<script type='text/javascript' src='https://cdn.jsdelivr.net/npm/toastify-js'></script>");
  document.writeln("<script type='text/javascript' src='/assets/libs/choices.js/public/assets/scripts/choices.min.js'></script>");
  document.writeln("<script type='text/javascript' src='/assets/libs/flatpickr/flatpickr.min.js'></script>");    
}