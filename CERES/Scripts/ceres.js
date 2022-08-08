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
    //Global app variables
    var baseUrl = "http://localhost:55979/";
    var windowInnerHeight;
    var sessionEmail;
    var sessionToken;
    var sessionUserName;
    var sessionAccountType;
    var headerToken;

    function init() {
        getDefaultValues();

        initClientList();

        setup();
    }

    function getDefaultValues() {
        windowInnerHeight = window.innerHeight;
        sessionEmail = sessionStorage.getItem("email");
        sessionToken = sessionStorage.getItem("accessToken");
        sessionUserName = sessionStorage.getItem("userName");
        sessionAccountType = sessionStorage.getItem("accountType");
        let userType = 'User';
        //clientId = JSON.parse(sessionStorage.getItem("data")).clientId;
        switch (sessionAccountType) {
            case 'A':
                userType = 'Administrator';
                break;
            case 'M':
                userType = 'Manager';
                break;
            default:
        }

        headerToken = {
            "Authorization": "Bearer " + sessionToken
        };
        $("#divUserName, .full-name").text("  " + sessionUserName);
        $(".user-name-text").text(" " + sessionUserName + " ");
        $(".user-name-sub-text").text(" " + userType + " ");
        $(".user-email-text").text(" " + sessionEmail + " ");

        getUserFolders();
        getUserProfile(sessionEmail);

        let settings = JSON.parse(localStorage.getItem('userSettings'));
        if (settings == null) getUserSettings();
        else {
            userSettings.PageSize = +settings.PageSize;
            userSettings.ValidPeriod = +settings.ValidPeriod;
            userSettings.ViewablePeriod = +settings.ViewablePeriod;
        }

        getClientSettings();
        getAppSettings();
        getAccountInfos();
        getUserPreferences();
        saveUserPreferences();

    }

    function initClientList() {

        getMaxTransactionId();
        var now = new Date();
        var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        var d = formatDate(firstDay.toDateString().split('-'));
        var yyyy = d[0] + d[1] + d[2] + d[3];
        var mm = d[5] + d[6];
        var dd = "01"
        $("#txtProductionDate").val(mm + '/' + dd + '/' + yyyy);

        //POPULATE USERS CLIENT LIST
        if (sessionStorage.getItem("clientData") != null)
            handleClientData(JSON.parse(sessionStorage.getItem("clientData")), "#ddlClient");
        else
            ajaxRequest("#ddlClient", baseUrl + "api/client/GetClientByUserName", { Id: 0, email: sessionEmail });

        ajaxRequest("#ddlSite", baseUrl + "api/client/GetSiteByUserName", { Id: $("#ddlClient").val(), email: sessionEmail });
        ajaxRequest("#ddlLocation", baseUrl + "api/client/GetLocationById", { Id: $("#ddlSite").val(), email: sessionEmail });
        ajaxRequest("#ddlServiceArea", baseUrl + "api/client/GetServiceAreaById", { Id: $("#ddlLocation").val(), email: sessionEmail });

    }

    function setup() {
        getServiceAreaCategories();
        //EVENTS HANDLER
        $("#grid-container").css("grid-template-areas", '"h h h h h h h h h h h u" "m m p p p p p p p p p p" "f f f f f f f f f f f f"');
        //$(".bg-image").on("click", function () { toggleShowSelectors(); });
        $(".bg-image").on("click", function () { });

        $(document)
            .ajaxStart(function () {
                $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").removeClass("hidden").show()
            })
            .ajaxStop(function () {

                $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
            });

        $("#ddlClient").on("change", function () { ajaxRequest("#ddlSite", baseUrl + "api/client/GetSiteByUserName", { Id: $("#ddlClient").val(), email: sessionEmail }); clearProductionLog(); });
        $("#ddlSite").on("change", function () { ajaxRequest("#ddlLocation", baseUrl + "api/client/GetLocationById", { Id: $("#ddlSite").val(), email: sessionEmail }); clearProductionLog(); });
        $("#ddlLocation").on("change", function () { ajaxRequest("#ddlServiceArea", baseUrl + "api/client/GetServiceAreaById", { Id: $("#ddlLocation").val(), email: sessionEmail }); clearProductionLog(); });

        $("#ddlServiceArea").on("change", function () {
            isDelete = false;
            isClone = false;
            clientId = $("#ddlClient").val();
            serviceAreaId = $("#ddlServiceArea").val();

            //brb 6/3/2022
            //handle all service area request
            if (+serviceAreaId == 0) {
                isFiltered = false;
                getRecentSavedDataAll(clientId);
            }
            //brb 6/3/2022
            else {
                var areaId = serviceAreaId + '_' + clientId;
                localStorage.setItem('areaId', areaId);
                isFiltered = true;
                getSavedDataByServiceArea(areaId);

                $.ajax({
                    url: baseUrl + "api/client/GetServiceAreaFields",
                    type: "POST",
                    headers: headerToken,
                    data: { Id: $("#ddlServiceArea").val(), email: sessionEmail },
                    success: serviceAreaCallback,
                    error: handleXHRError
                });

                getServiceAreaCategory($("#ddlServiceArea").val());
            }
        });

        //bootstrap
        initProductionDate();

        $("#txtProductionDate").on("focus", function () {
            didChange = false;
            var element = document.querySelector('.datepicker-days');
            observer.observe(element, {
                attributes: true //configure it to listen to attribute changes
            });
        });

        $(".datepicker").removeAttr("style");

        $(".prod-date, .calendar-icon").on("click", function () {

            $("#txtProductionDate").focus()
        });

        $("#txtProductionDate").on("change", function () {
            isPrevious = false;
            isNew = false;
            isConfirmDelete = false;
            isUpdate = false;
            isProductionMonthDidChange = true;
            //$("#ddlServiceArea").change();
        });

        $("#btnUpdate, #btnSaveNew, #btnSave, #btnConfirmDelete").on("click", function () { $("#btnSubmit").click() });

        $(".fa-building").on("click", function () {
            popupAccountInfoForm();
        });

        $(".fa-sitemap, .fa-location-arrow, .fa-server").on("click", function () {
            if ($(this).prop("class").indexOf("site") >= 0)
                $("#ddlClient").change();
            else if ($(this).prop("class").indexOf("location") >= 0) {
                $("#ddlSite").change();
                $("#ddlServiceArea option").remove();
                $("#ddlServiceArea").append('<option value="--- Select ServiceArea---">--- Select ServiceArea ---</option>');
            }
            else
                $("#ddlLocation").change();

        });

        $(".fa-sitemap, .fa-location-arrow, .fa-server").on("mouseover", function () {
            $('#siteRefresh').w2tag();
            if ($(this).prop("class").indexOf("site") >= 0) {
                $('#siteRefresh').w2tag("Initialize/Select New Site", { position: "left", className: 'w2ui-dark' });
            }
            else if ($(this).prop("class").indexOf("location") >= 0) {
                $('#locationRefresh').w2tag("Initialize/Select New Location", { position: "left", className: 'w2ui-dark' });
            }
            else
                $('#serviceAreaRefresh').w2tag("Initialize/Select New Service Area", { position: "left", className: 'w2ui-dark' });
        });

        $(".fa-sitemap, .fa-location-arrow, .fa-server").on("mouseout", function () {
            $('#siteRefresh').w2tag();
            $('#locationRefresh').w2tag();
            $('#serviceAreaRefresh').w2tag();

        });

        $('#btnHide').on("mouseover", function () {
            $('#btnHide').w2tag("Hide Selector Panel", { position: "bottom", className: 'w2ui-dark' });
        });
        $("#btnHide").on("mouseout", function () {
            $('#btnHide').w2tag();
        });
            
        $('#btnShow').on("mouseover", function () {
            $('#btnShow').w2tag("Show Selector Panel", { position: "bottom", className: 'w2ui-dark' });
        });
        $("#btnShow").on("mouseout", function () {
            $('#btnShow').w2tag();
        });

        $('#btn1').on("mouseover", function () {
            $('#btn1').w2tag("Upload Report", { position: "left", className: 'w2ui-dark' });
        });
        $("#btn1").on("mouseout", function () {
            $('#btn1').w2tag();
        });

        $('#btnExpand').on("mouseover", function () {
            $('#btnExpand').w2tag("Expand/Collapse Production DataGrid", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnExpand").on("mouseout", function () {
            $('#btnExpand').w2tag();
        });

        $('#btnFullScreen').on("mouseover", function () {
            $('#btnFullScreen').w2tag("Show Production Data Full-Screen", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnFullScreen").on("mouseout", function () {
            $('#btnFullScreen').w2tag();
        });

        $('#btnFullScreenAttrib').on("mouseover", function () {
            $('#btnFullScreenAttrib').w2tag("Show Attributes Full-Screen", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnFullScreenAttrib").on("mouseout", function () {
            $('#btnFullScreenAttrib').w2tag();
        });

        $('#btnFullScreenMetrics').on("mouseover", function () {
            $('#btnFullScreenMetrics').w2tag("Show Metrics Full-Screen", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnFullScreenMetrics").on("mouseout", function () {
            $('#btnFullScreenMetrics').w2tag();
        });

        $('#btnAppFullScreen').on("mouseover", function () {
            $('#btnAppFullScreen').w2tag("Show App Full Screen", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnAppFullScreen").on("mouseout", function () {
            $('#btnAppFullScreen').w2tag();
        });

        $('#btnThemeSettings').on("mouseover", function () {
            $('#btnThemeSettings').w2tag("Theme Settings", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnThemeSettings").on("mouseout", function () {
            $('#btnThemeSettings').w2tag();
        });

        $('#btnSwitchMode').on("mouseover", function () {
            $('#btnSwitchMode').w2tag("Switch App Mode", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnSwitchMode").on("mouseout", function () {
            $('#btnSwitchMode').w2tag();
        });

        $('#btnSendReport').on("mouseover", function () {
            $('#btnSendReport').w2tag("Send Report", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnSendReport").on("mouseout", function () {
            $('#btnSendReport').w2tag();
        });

        $('#btnDownloadReports').on("mouseover", function () {
            $('#btnDownloadReports').w2tag("Download Reports", { position: "left", className: 'w2ui-dark' });
        });
        $("#btnDownloadReports").on("mouseout", function () {
            $('#btnDownloadReports').w2tag();
        });

        //POPULATE RECENT DATA
        let areaId = localStorage.getItem('areaId');
        if (areaId == null || areaId.indexOf('null') > -1) {
            let userSavedPref = localStorage.getItem('userSavedPreferences');
            if (userSavedPref) {
                areaId = JSON.parse(userSavedPref)[0].Id;
                localStorage.setItem('areaId', areaId);
            } else {
                areaId = "0_0";
                localStorage.setItem('areaId', areaId);
                return;
            }
        }
        //clientName = sessionStorage.getItem('clientData')[0].Value;
        let userMode = localStorage.getItem('userMode');
        if (userMode == 'Entry') {
            isFiltered = true;
            getSavedDataByServiceArea(areaId);
        } else {
            isFiltered = false;
            //initClientList();
            getRecentSavedData();
        }
    }

    //$("#btnSSO").on("click", function () {
    //    sso();
    //})

    //function sso() {
    //    const config = {
    //        auth: {
    //            clientId: '91be1c6c-891e-4bd6-b876-b67f5606020d',
    //            authority: 'https://login.microsoftonline.com/869c0d1d-42e3-4230-a045-be018a9ea361',
    //            redirectUri: 'http://localhost:55979'
    //            //redirectUri: 'https://localhost:44392'
    //            //redirectUri: 'https://microstrategy.cbpsportal.com/edsv2'
    //        },
    //        cache: {
    //            cacheLocation: "sessionStorage",
    //            storeAuthStateInCookie: false
    //        }
    //    }

    //    const myMSALObj = new Msal.UserAgentApplication(config);

    //    const loginRequest = {
    //        scopes: ["openid", "profile", "user.read"]
    //    }

    //    myMSALObj.loginPopup(loginRequest).then((loginResponse) => {

    //        console.log("Response => ", JSON.stringify(loginResponse));
    //        const accessTokenRequest = {
    //            //scopes: ["api://7af858ea-81ec-486e-b7b1-a34ba4db4730/.default"]
    //            scopes: ["api://210c9336-7d09-45d2-99f2-d6a55755831b/.default"]
    //        };

    //        myMSALObj.acquireTokenSilent(accessTokenRequest).then((accessTokenResponse) => {

    //            let accessToken = accessTokenResponse.accessToken;
    //            let bearer = "Bearer " + accessToken;
    //            var decoded = jwt_decode(accessToken);
    //            //console.log(decoded);
    //            //let userEmail = decoded.upn;
    //            let userEmail = decoded.preferred_username;
    //            //for testing
    //            //userEmail = "bbeltran@cbps.canon.com";

    //            //let apiEndPoint = "https://localhost:44326/hello";
    //            //let apiEndPoint = "https://localhost:44326/api/users/" + userEmail;
    //            //let apiEndPoint = "https://ceres.cbpsportal.com/birequests/nexus/api/Users/" + userEmail;

    //            let baseUrl = "http://localhost:55979/";
    //            let url = baseUrl + "api/Client/SetUserProfile";

    //            $.ajax({
    //                //url: apiEndPoint,
    //                url: url,
    //                type: "POST",
    //                data: { "email": userEmail },
    //                dataType: "json",
    //                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', bearer) }
    //            }).done((result) => {
    //                console.log('user: ' + result);
    //                if (result != undefined || result != null) {
    //                    $(".div-signin-loading img").addClass("hidden").hide();
    //                    $("#btnLogin").disabled = false;
    //                    $("footer").hide();
    //                    $("#divError").hide();
    //                    localStorage.setItem("accessToken", accessToken);
    //                    localStorage.setItem("email", userEmail);
    //                    sessionStorage.setItem("email", userEmail);
    //                    let user = result;
    //                    sessionStorage.setItem("userName", user.Name);
    //                    sessionStorage.setItem("userData", JSON.stringify(user));
    //                    sessionStorage.setItem("accountType", user.AccountType);
    //                    sessionStorage.setItem("userClientID", user.ClientID);
    //                    sessionStorage.setItem("userId", user.Id);

    //                    window.location.href = user.clientID == 0 ? "reset.html" : baseUrl + "/Dashboard/Index"

    //                    //window.location.href = 'https://localhost:44392/index3.html';
    //                    /*window.location.href = 'http://localhost:55979/dashboard/index';*/
    //                    //window.location.href = 'https://microstrategy.cbpsportal.com/edsv2/dashboard/index';
    //                    //window.location.href = '/dashboard/index';

    //                    //window.location.replace("http://localhost:55979/dashboard/index");
    //                    //window.location.replace("https://microstrategy.cbpsportal.com/edsv2/dashboard/index");
    //                }
    //                else {
    //                    $("#btnLogin").removeClass("disabled");
    //                    $("footer").hide();
    //                    $("#btnLogin").disabled = false;
    //                    $("#hModalTitle").text("ERROR");
    //                    $("#divErrorText").text("User is not registered/authorized to use the application.");
    //                    $("#btnLogin").removeClass("hidden").show();
    //                    $(".div-signin-loading img").addClass("hidden").hide();
    //                    $("#myModal").modal("show");
    //                }
    //                //sessionStorage.setItem("data", JSON.stringify(data));
    //                //sessionStorage.setItem("accessToken", data.access_token);
    //                //sessionStorage.setItem("accountType", data.accountType);
    //                //sessionStorage.setItem("accountType", "A");
    //                //window.location.href = data.clientId == 0 ? "reset.html" : home;

    //            }).fail((err) => {
    //                console.log("ERROR => ", err);
    //                $("#btnLogin").removeClass("disabled");
    //                $("footer").hide();
    //                $("#btnLogin").disabled = false;
    //                if (err.status == 500) {
    //                    $("#hModalTitle").text("ERROR");
    //                    $("#divErrorText").text("Oops! Something went wrong! Please contact your BI administrator.");
    //                }
    //                else {
    //                    //$("#hModalTitle").text(err.responseJSON.error);
    //                    //$("#divErrorText").text(err.responseJSON.error_description);
    //                }
    //                $("#btnLogin").removeClass("hidden").show();
    //                $(".div-signin-loading img").addClass("hidden").hide();
    //                $("#myModal").modal("show");
    //            })

    //        });
    //    });
    //}


    $(document).ready(function () {

        init();

        //$("input[type='text']").on("click", function () {
        //    $(this).select();
        //});
        //$("input").focus(function () {
        //    $(this).select();
        //});
        //$("input").focusin(function () {
        //    $(this).select();
        //});

        $('input[rel="txtTooltip"]').tooltip();

        $("[data-toggle=tooltip]").tooltip({
            placement: $(this).data("placement") || 'top'
        });

        // date range picker
        $('input[name="daterange"]').daterangepicker({
            opens: 'right'
        }, function (start, end, label) {
            console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
        });

        //// basic picker
        //flatpickr(".f-basic", {});
        //// date time picker
        //flatpickr(".f-datetime", {
        //    enableTime: true,
        //    dateFormat: "Y-m-d H:i",
        //});
        //// minDate and maxDate
        //flatpickr(".f-min-max", {
        //    minDate: "today",
        //    maxDate: new Date().fp_incr(14) // 14 days from now
        //});
        //// Selecting multiple dates
        //flatpickr(".f-multiple", {
        //    mode: "multiple",
        //    dateFormat: "Y-m-d"
        //});
        //// Preloading range dates
        //flatpickr(".f-range", {
        //    mode: "range",
        //    dateFormat: "Y-m-d",
        //    defaultDate: ["2016-10-10", "2016-10-20"]
        //});
        //// Time Picker
        ////flatpickr(".f-time", {
        ////    enableTime: true,
        ////    noCalendar: true,
        ////    dateFormat: "H:i",
        ////});

        //$('#flatpicker').flatpickr({
        //    //noCalendar: true,
        //    //enableTime: true,
        //    //dateFormat: 'h:i K'
        //});

    })


})(jQuery)	