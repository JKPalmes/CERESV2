/*
Template Name: Ceres - Admin & Dashboard Template
Author: Data Technology Group
Version: 1.5.0
Website: https://Data Technology Group.com/
Contact: Data Technology Group@gmail.com
File: Main Js File
*/

(function ($) {

    'use strict';
    var baseUrl = "http://localhost:55979/";

    $(document).ready(function () {
        $(".div-signin-loading img").addClass("hidden").hide();

        $("form").submit(function (e) {
            $("#btnLogin").hide();
            $(".div-signin-loading img").removeClass("hidden").show();
            e.preventDefault();

            $("#btnLogin").addClass("disabled").disabled = true;
            $.ajax({
                url: baseUrl + "token",
                //url: "token",
                method: "POST",
                data: {
                    username: $("#username").val(),
                    password: $("#password-input").val(),
                    grant_type: "password"
                },
                success: function (data, textStatus, xhr) {
                    if (xhr.status == 200) {
                        $("#btnLogin").disabled = false;
                        $("#divError").hide();
                        sessionStorage.setItem("data", JSON.stringify(data));
                        localStorage.setItem("accessToken", data.access_token);
                        sessionStorage.setItem("accessToken", data.access_token);
                        sessionStorage.setItem("userName", data.userName);
                        sessionStorage.setItem("email", data.email);
                        sessionStorage.setItem("accountType", data.accountType);

                        window.location.href = data.clientId == 0 ? "reset.html" : baseUrl + "/Dashboard/Index"
                    }
                },
                error: function (err) {
                    $("#btnLogin").removeClass("disabled");
                    $("#btnLogin").disabled = false;
                    console.log(err);
                    if (err.status == 500) {
                        $("#hModalTitle").text("ERROR");
                        $("#divErrorText").text("Oops! Something went wrong! Please contact your BI administrator.");
                    }
                    else {
                        $("#hModalTitle").text(err.responseJSON.error);
                        $("#divErrorText").text(err.responseJSON.error_description);
                    }
                    $("#btnLogin").removeClass("hidden").show();
                    $(".div-signin-loading img").addClass("hidden").hide();
                    $("#myModal").modal("show");
                }
            });
        });


        $("#linkClose").click(function () {
            $("#myModal").modal("hide").fadeOut();
        });

    })

})(jQuery)	