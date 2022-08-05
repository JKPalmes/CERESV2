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

        getUserFolders();
        getUserProfile();

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

        $(".glyphicon-refresh-site, .glyphicon-refresh-location, .glyphicon-refresh-servicearea").on("click", function () {
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

        $(".glyphicon-refresh-site, .glyphicon-refresh-location, .glyphicon-refresh-servicearea").on("mouseover", function () {
            $('#siteRefresh').w2tag();
            if ($(this).prop("class").indexOf("site") >= 0) {
                $('#siteRefresh').w2tag("Initialize/Select New Site", { position: "right", className: 'w2ui-dark' });
            }
            else if ($(this).prop("class").indexOf("location") >= 0) {
                $('#locationRefresh').w2tag("Initialize/Select New Location", { position: "right", className: 'w2ui-dark' });
            }
            else
                $('#serviceAreaRefresh').w2tag("Initialize/Select New Service Area", { position: "right", className: 'w2ui-dark' });
        });

        $(".glyphicon-refresh-site, .glyphicon-refresh-location, .glyphicon-refresh-servicearea").on("mouseout", function () {
            $('#siteRefresh').w2tag();
            $('#locationRefresh').w2tag();
            $('#serviceAreaRefresh').w2tag();

        });

        $(".w2ui-sidebar-top").on("mouseover", function () {
            $('#sidebarLabel').w2tag("Entry View - User Saved Preferences [Client | Site | Location | Service Area]", { position: "right", className: 'w2ui-dark' });
        });

        $(".w2ui-sidebar-top").on("mouseout", function () {
            $('#sidebarLabel').w2tag();
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