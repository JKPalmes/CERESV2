//DataEntry 
var baseUrl = "http://localhost:55979/";
//var nullDefaultValueClientId = "1000001";   //LIBERTY MUTUAL CLIENT ID; CSV: e.g: "1000001,123" for multiple client IDs MUST BE EQUAL IN WEB.CONFIG APPSETTINGS.KEYS
var nullDefaultValueClientId = "";   //LIBERTY MUTUAL CLIENT ID; CSV: e.g: "1000001,123" for multiple client IDs MUST BE EQUAL IN WEB.CONFIG APPSETTINGS.KEYS
var transView = "ShowAllTransactions";
var windowInnerHeight;
var sessionEmail;
var sessionToken;
var sessionUserName;
var sessionAccountType;
var pattern = /[a-zA-Z]/;
var model = {
    GenericTransactions: [],
    lastSavedData: {},
    Transaction: {},
    ServiceAreaFields: []
};
var pageNumber = 0;
var headerToken;
var submitButtonType = -1;
var transactionId = 0;
var serviceAreaId = 0;
var clientId = 0;
var siteId = 0;
var locationId = 0;
var trIndex = 0;
var isClientWithDefaultValue = false;
var isUpdate = false;
const pageItems = 20;
var isLastPage = false;
var didRequestSavedData = false;
var isDifferentSvcId = false;
var productionDate = "";
var isFiltered = false;
var isNew = false;
var isPrevious = false;
var isConfirmDelete = false;
var itemCountInfo = " 0 item(s) ";
var isEditMode = false;
var origDataModel;
var searchPageNumber = 0;
var didSearch = false;
var isProductionMonthDidChange = false;
var totalRecords = 0;
var isPageChanged = false;
var isClone = false;
var serviceAreaName = "";
var locName = "";
var siteName = "";
var clientName = "";
var clientSettings = {
    ClientID: 1000002,
    EditPeriodMgr: 35,
    EditPeriodUser: 7
};
var userSettings = {
    PageSize: 15,
    ValidPeriod: 4,
    ViewablePeriod: 4
};
var appSettings = {
    ServerFolderPath: "",
    ReportsFolderLocation: "",
    UploadssFolderLocation: "",
    GridPageSize: "",
    ValidPeriodForEdit: "",
    ValidPeriodForView: ""
};
var gridTransactions = [];
var searchEntered = false;

//var userProfile = {
//    Id: 0,
//    Name: '',
//    Email: '',
//    AccountType: 'U',
//    ClientID: 0,
//    ManagerUserName: '',
//    ManagerFullName: '',
//    CompanyName: '',
//    ContactNo: ''
//};
var isAdmin = false;
var selectedItem = "";
var selectedItemPath = "";
var isNewServiceArea = false;
var isDelete = false;

var StandardServiceAreaCategories = [
    'CentralPrint',
    'Commentary',
    'Facilities',
    'Hospitality',
    'Imaging',
    'Mail',
    'ManagedPrint',
    'Records',
    'ShippingReceiving',
    'Warehouse'
]
var StatusOthers = ['Received', 'In Process', 'Completed', 'On Hold', 'Canceled'];

function stopDownloadCsv() {
    toastr.info("No data available to export.");
}

//window.jsPDF = window.jspdf.jsPDF;
//applyPlugin(window.jsPDF);
function exportToPdf() {
    const doc = new jsPDF();
    DevExpress.pdfExporter.exportDataGrid({
        jsPDFDocument: doc,
        component: $("#gridContainer").dxDataGrid("instance")
    }).then(function () {
        doc.save('trans.pdf');
    });
}

function exportToCsv(all) {
    var csvFile;
    var downloadLink;

    //var csv = all ? generateAllCsvData(true) : generateTranCsvData();
    var csv = all ? downloadAllCsvData() : generateAllCsvData(true);

    if (csv == "") return;

    csvFile = new Blob([csv], { type: "text/csv" });
    downloadLink = document.createElement("a");
    var model = JSON.parse(sessionStorage.getItem('model'));
    downloadLink.download = all ? [model.GenericTransactions[0].AccountName, "-", model.GenericTransactions[0].ServiceAreaName, ".tsv"].join('')
        : [model.GenericTransactions[0].AccountName, "-", model.GenericTransactions[0].ServiceAreaName, ".csv"].join('');
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function resetAction() {
    $(".glyphicon-remove-grid-item").addClass("hidden");
    $(".glyphicon-trash-grid-item").removeClass("hidden").show();

}

function getNewSequence() {
    var date = new Date();
    var locId = $("#ddlLocation option:selected").val();
    var dateStr =
        date.getFullYear() +
        ("00" + (date.getMonth() + 1)).slice(-2) +
        ("00" + date.getDate()).slice(-2) +
        ("00" + date.getHours()).slice(-2) +
        ("00" + date.getMinutes()).slice(-2) +
        ("00" + date.getSeconds()).slice(-2) +
        ("000" + date.getMilliseconds()).slice(-3) + locId;
    return dateStr;
}

function performDbSearch() {
    didSearch = true;
    var strSearch = $("#txtSearch").val();
    var svcId = $("#ddlServiceArea option:selected").val();
    var payload = { "pageNumber": searchPageNumber, "userName": sessionStorage.getItem("email"), "searchText": strSearch };
    try {
        if ($("#ddlServiceArea").val().match(pattern) != null)
            svcId = 0;

        if ($("#txtSearch").val().length < 3)
            return;

        if (svcId > 0)
            payload = { "pageNumber": searchPageNumber, "userName": sessionStorage.getItem("email"), "searchText": strSearch, "svcId": svcId };


        $.ajax({
            url: baseUrl + "api/client/SearchSavedData",
            method: "GET",
            headers: headerToken,
            data: payload,
            dataType: "json",
            success: handleSavedData,
            error: handleXHRError
        });
    }
    catch (e) {
        console.log(e);
    }
    searchPageNumber++;
}

function updateDataModel(flag, data) {
    dataModel.removeObserver(gridObs);
    dataModel.removeObserver(gridGenericObs);
    if (flag) {
        dataModel.addObserver(gridObs);

    } else {
        dataModel.addObserver(gridGenericObs);

    }
    dataModel.updateModel(data);
    dataModel.notifyObserver();
}

function setInputDate(target) {
    $(target).datepicker({
        autoclose: true,
        disableTouchKeyboard: true,
        orientation: 'bottom', showOnFocus: true, todayHighlight: true,
        zIndexOffset: 9
    });
}

//function setInputTime(target) {
//    $(target).timepicker();
//}

function requiredLabel() {
    return "<span class='required-label'>&nbsp;*</span>";
}

//function generateDateFormControl(e, svcFieldId) {
//    var target = "StringField" + e.svcFieldNumber;
//    var toolTip = e.Description_Txt;
//    var label = e.svcFieldName;
//    var toolTip = label.indexOf('Date Completed') > -1 ? "" : e.Description_Txt;
//    if (e.svcFieldName.indexOf("Date Completed") > -1) sessionStorage.setItem('dateCompletedFieldId', target);
//    return [
//        '<div class="form-group">',
//        '    <div class="divAttribLabel">', label, (e.IsMandatory == 1) ? requiredLabel() : "", '</div>',
//        '    <div class="input-group">',
//        '        <input type="text" onchange="getSelectedValue(this)" data-toggle="tooltip" data-trigger="hover" data-placement="top" title="', toolTip, '" class="nocleanup form-control pull-right date-', target, '" id="', target, '" name="', svcFieldId, '" placeholder="', label, '">',
//        '        <div class="input-group-addon calendar-icon" onclick="$(this).prev().focus()" >',
//        '            <i class="fa fa-calendar" onclick="$(this).parent().prev().focus()"></i>',
//        '        </div>',
//        '    </div>',
//        '</div>'].join('');
//}

function generateDateFormControl(e, svcFieldId) {
    var target = "StringField" + e.svcFieldNumber;
    var toolTip = e.Description_Txt;
    var label = e.svcFieldName;
    var toolTip = label.indexOf('Date Completed') > -1 ? "" : e.Description_Txt;
    if (e.svcFieldName.indexOf("Date Completed") > -1) sessionStorage.setItem('dateCompletedFieldId', target);
    return [
        '<div class="form-group">',
        '    <div class="form-label divAttribLabel">', label, (e.IsMandatory == 1) ? requiredLabel() : "", '</div>',
        '    <div class="input-group">',
        '       <input type="text" onchange="getSelectedValue(this)" placeholder="', label, '" title="', toolTip, '" class="flatpickr form-control pull-right date-', target, '" id="', target, '" name="', svcFieldId, '">',
        '    </div>',
        '</div>'].join('');
}

//function generateTimeFormControl(e, svcFieldId) {
//    var target = "StringField" + e.svcFieldNumber;
//    //var svcFieldId = serviceAreaCategory + "_" + target;
//    var label = e.svcFieldName;
//    var toolTip = e.Description_Txt;
//    return [
//        '<div class="form-group">',
//        '    <div class="divAttribLabel">', label, (e.IsMandatory == 1) ? requiredLabel() : "", '</div>',
//        '    <div class="input-group bootstrap-timepicker timepicker">',
//        '        <input type="text" data-toggle="tooltip" data-trigger="hover" data-placement="top" title="', toolTip, '" class="form-control pull-right time-', target, '" id="', target, '" name="', svcFieldId, '" placeholder="', label, '" >',
//        '        <div class="input-group-addon time-icon" onclick="$(this).prev().focus()" >',
//        '            <i class="glyphicon glyphicon-time" style="color: #337ABC;" onclick="$(this).parent().prev().focus()"></i>',
//        '        </div>',
//        '    </div>',
//        '</div>'].join('');
//}

function generateTimeFormControl(e, svcFieldId) {
    var target = "StringField" + e.svcFieldNumber;
    var label = e.svcFieldName;
    var toolTip = e.Description_Txt;
    return [
        '<div class="form-group">',
        '    <div class="form-label divAttribLabel">', label, (e.IsMandatory == 1) ? requiredLabel() : "", '</div>',
        '    <div class="mt-2">',  
        '       <input type="text" placeholder="', label, '" title="', toolTip, '" class="flatpickr form-control pull-right time-', target, '" id="', target, '" name="', svcFieldId, '">',
        '    </div>',  
        '</div>'].join('');
}

function getRecentSavedDataAll(clientId) {
    $(".div-signin-loading-attrib").show();

    localStorage.setItem('userMode', 'Query');
    sessionStorage.setItem('selectedArea', 'All');

    //will only be called if !isFiltered
    var payload = { "userId": +sessionStorage.getItem("userId"), "validPeriod": userSettings.ViewablePeriod, "viewData": transView, "userName": sessionStorage.getItem("email"), "accountType": sessionStorage.getItem("accountType"), "clientId": clientId };

    $.ajax({
        url: baseUrl + "api/client/GetSavedDataAll",
        method: "GET",
        headers: headerToken,
        data: payload,
        dataType: "json",
        //success: handleSavedData,
        success: handleRecentSavedData,
        error: handleXHRError
    });
}

function getRecentSavedData() {
    $(".div-signin-loading-attrib").show();

    let areaId = localStorage.getItem('areaId');
    //if (areaId) w2ui.sidebar.unselect(areaId);

    //initProductionDate();

    //getServiceAreaCategory($("#ddlServiceArea").val());
    let svcId = areaId.split('_')[0]
    getServiceAreaCategory(svcId);

    didSearch = false;
    didRequestSavedData = true;
    localStorage.setItem('userMode', 'Query');
    sessionStorage.setItem('selectedArea', svcId);

    //will only be called if !isFiltered
    var payload = { "userId": +sessionStorage.getItem("userId"), "validPeriod": userSettings.ViewablePeriod, "viewData": transView, "userName": sessionStorage.getItem("email"), "accountType": sessionStorage.getItem("accountType") };

    var transactions = JSON.parse(sessionStorage.getItem("savedData"));
    try {
        if (transactions != null) {
            if (isFiltered && isLastPage || transactions != null && didRequestSavedData ? transactions.length == 0 : false)
                return;
        }

    } catch (e) {
        console.log(e.message);
    }

    $.ajax({
        url: baseUrl + "api/client/GetSavedData",
        method: "GET",
        headers: headerToken,
        data: payload,
        dataType: "json",
        //success: handleSavedData,
        success: handleRecentSavedData,
        error: handleXHRError
    });
}

function getSavedDataByServiceArea(areaId) {
    if (areaId.indexOf('_') <= 0) {
        $(".div-signin-loading-attrib").hide();
        return;
    }
        

    $(".div-signin-loading-attrib").show();
    clientId = areaId.split('_')[1];
    serviceAreaId = areaId.split('_')[0];
    //w2ui.sidebar.select(areaId);
    $("#ddlServiceArea").val(serviceAreaId);
    getServiceAreaCategory(serviceAreaId);

    didSearch = false;

    //initProductionDate();

    didRequestSavedData = true;
    isFiltered = true;
    localStorage.setItem('userMode', 'Entry');

    var payload = { "userId": +sessionStorage.getItem("userId"), "validPeriod": userSettings.ValidPeriod, "viewData": transView, "userName": sessionStorage.getItem("email"), "accountType": sessionStorage.getItem("accountType"), "date": $("#txtProductionDate").val(), "clientId": clientId, "serviceAreaId": serviceAreaId };

    $.ajax({
        url: baseUrl + "api/client/GetSavedDataByServiceArea",
        method: "GET",
        headers: headerToken,
        data: payload,
        dataType: "json",
        success: handleSavedData,
        error: handleXHRError
    });
}

function showForm() {
    var svc = $("#ddlServiceArea");
    serviceAreaId = parseInt(svc.val());
    serviceAreaName = svc.find("option:selected").text();

    //brb 6/16/2022
    if (sessionStorage.getItem('selectedArea') == 'All') {
        var client = $("#ddlClient");
        clientName = client.find("option:selected").text();
        var site = $("#ddlSite");
        siteName = site.find("option:selected").text();
        var loc = $("#ddlLocation");
        locName = loc.find("option:selected").text();
        serviceAreaName = 'Select All';

        $("#ddlServiceArea").find('option').remove();
        var selData = [];
        selData.unshift('<option value="0">Select All</option>');
        $("#ddlServiceArea").append(selData.join(''));        
    }

    if (clientName == '--- Select Client ---') getClientName();

    //brb 6/16/2022
    let prodDetailsTextContent = "" + siteName + " | " + locName + " | " + serviceAreaName + "";
    let prodDataTextContent = "QUERY VIEW (" + clientName;
    if (isFiltered && clientName !== '') prodDataTextContent = "ENTRY VIEW (" + clientName + " | " + prodDetailsTextContent;
    prodDataTextContent += ")";


    $(".prod-data-text").text(" " + prodDataTextContent + " ");
    //$(".prod-details-text").text(" " + prodDetailsTextContent + " ");

    //var oldSrc = '../images/1000001.png';

    var newSrc = '../images/' + clientId + '.png';
    if (clientId == 1) newSrc = '../images/1000001.png';
    $('#company-logo').attr('src', newSrc);
    //$('img[src="' + oldSrc + '"]').attr('src', newSrc);

    //PLACE CSS-GRID STYLING
    //isEditMode = true;
    //$("#main-data-list").hide();
    //$("#main-attrib-capture, #main-metric-capture, .bide-content-attrib, .bide-content-metric").removeClass("hidden").show().children().removeClass("hidden").show();
    //var cssToUpdate = '"h h h h h h h h h h h u" "m m n n n o o o o o o o" "f f f f f f f f f f f lr"';
    //if (detectIEEdge() == false) {
    //    $("#grid-container").css("grid-template-areas", cssToUpdate);
    //}
    //else {
    //    $("#main-attrib-capture, #main-metric-capture").css("-ms-grid-row", "2");
    //    $("#main-attrib-capture").css("-ms-grid-column", "3").css("-ms-grid-column-span", "3");
    //    $("#main-metric-capture").css("-ms-grid-column", "6").css("-ms-grid-column-span", "7");
    //}
    ////$(".search-bar").addClass("hidden").hide();
    //readySubmitForm();
}

//function getRecentActivity() {
//    didRequestSavedData = false;
//    var d_data = sessionStorage.getItem("savedData");
//    var d_fields = sessionStorage.getItem("serviceAreaFields");
//    var data = { Transactions: JSON.parse(d_data), ServiceAreaFields: JSON.parse(d_fields), GenericTransactions: [] };
//    if (d_data != null && d_fields != null && (d_data != null ? d_data[0].ServiceAreaId == $("#ddlServiceArea").val() : false)) {
//        handleSavedData(data);
//    }
//    else {
//        pageNumber = 0;
//        sessionStorage.removeItem("pageNumber");
//        isFiltered = true;
//        getRecentSavedData();
//    }
//}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function performSearch() {
    if ($("#txtSearch").val().trim().length <= 2)
        return;

    if (origDataModel != null) {
        if (origDataModel.length == 0)
            origDataModel = dataModel.Model;
    }
    else
        origDataModel = dataModel.Model;

    var results = [];
    var toSearch = $("#txtSearch").val().trim().toLowerCase();
    var objects = origDataModel == null ? dataModel.Model : origDataModel;

    for (var i = 0; i < objects.length; i++) {
        for (key in objects[i]) {
            var v = ["'", objects[i][key], "'"].join('').replace(/\'/g, '');

            if (v.toLowerCase().indexOf(toSearch) != -1) {
                results.push(objects[i]);
            }
        }
    }
    var out = results.filter(onlyUnique);
    updateDataModel(isFiltered, out);
}

function handleSearch(e) {
    if (e.keyCode === 13) {
        e.preventDefault();

        performSearch();
    }
    if (e.keyCode === 46 || e.keyCode === 8) {
        if (origDataModel != null)
            updateDataModel(isFiltered, origDataModel);
    }
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

    //$("#btnUpdate, #btnSaveNew, #btnSave, #btnConfirmDelete").on("click", function () { $("#btnSubmit").click() });

    //$(".fa-sitemap, .fa-location-arrow, .fa-server").on("click", function () {
    //    if ($(this).prop("class").indexOf("site") >= 0)
    //        $("#ddlClient").change();
    //    else if ($(this).prop("class").indexOf("location") >= 0) {
    //        $("#ddlSite").change();
    //        $("#ddlServiceArea option").remove();
    //        $("#ddlServiceArea").append('<option value="--- Select ServiceArea---">--- Select ServiceArea ---</option>');
    //    }
    //    else
    //        $("#ddlLocation").change();

    //});

    //$(".fa-sitemap, .fa-location-arrow, .fa-server").on("mouseover", function () {
    //    $('#siteRefresh').w2tag();
    //    if ($(this).prop("class").indexOf("site") >= 0) {
    //        $('#siteRefresh').w2tag("Initialize/Select New Site", { position: "left", className: 'w2ui-dark' });
    //    }
    //    else if ($(this).prop("class").indexOf("location") >= 0) {
    //        $('#locationRefresh').w2tag("Initialize/Select New Location", { position: "left", className: 'w2ui-dark' });
    //    }
    //    else
    //        $('#serviceAreaRefresh').w2tag("Initialize/Select New Service Area", { position: "right", className: 'w2ui-dark' });
    //});

    //$(".fa-sitemap, .fa-location-arrow, .fa-server").on("mouseout", function () {
    //    $('#siteRefresh').w2tag();
    //    $('#locationRefresh').w2tag();
    //    $('#serviceAreaRefresh').w2tag();

    //});

    
    //$(".w2ui-sidebar-top").on("mouseover", function () {
    //    $('#sidebarLabel').w2tag("Entry View - User Saved Preferences [Client | Site | Location | Service Area]", { position: "right", className: 'w2ui-dark' });
    //});

    //$(".w2ui-sidebar-top").on("mouseout", function () {
    //    $('#sidebarLabel').w2tag();
    //});

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

function hideProductionDetails() {
    $("#tblAttribFields").addClass("hidden").hide();
    $("#tblMetricFields").addClass("hidden").hide();
}
function showProductionDetails() {
    $("#tblAttribFields").removeClass("hidden").show();
    $("#tblMetricFields").removeClass("hidden").show();
}

function addNew() {
    if ($("#ddlServiceArea").val() != null) {
        if ($("#ddlServiceArea").val().match(pattern) != null) {
            toastr.info("Kindly complete the selectors up to Service Area level");
            return;
        }
    }

    //showProductionDetails();

    $("#btnSave").removeClass("hidden").show();
    transactionId = 0;
    submitButtonType = 0;
    isUpdate = false;
    isConfirmDelete = false;
    $("#JOB_ID").val("Auto-Generated").attr("disabled", "disabled");

    let dDate = new Date($("#txtProductionDate").val());
    let pDate = ("00" + (dDate.getMonth() + 1).toString()).slice(-2) + "/01/" + dDate.getFullYear().toString();
    //var tmp_dt = new Date();
    //let prodDate = ("00" + (tmp_dt.getMonth() + 1).toString()).slice(-2) + "/01/" + tmp_dt.getFullYear().toString();

    //let newDate = ("00" + (tmp_dt.getMonth() + 1).toString()).slice(-2) + "/" + ("00" + (tmp_dt.getDate().toString())).slice(-2) + "/" + tmp_dt.getFullYear().toString();
    //if (pDate == prodDate) {
    //    $("#txtProductionDate").val(prodDate);
    //} else {
    //    $("#txtProductionDate").val(pDate).change();
    //    newDate = ("00" + (dDate.getMonth() + 1).toString()).slice(-2) + "/" + ("00" + (dDate.getDate().toString())).slice(-2) + "/" + dDate.getFullYear().toString();
    //}

    //initializeDateControl();
    //initializeTimeControl();

    model = JSON.parse(sessionStorage.getItem('model'));
    var maxID = +sessionStorage.getItem('maxTransactionID');

    if (model.GenericTransactions.length > 0) {
        //var clonedItem1 = $.extend({}, model.GenericTransactions[0], { TransactionId: ++maxID, ProductionDate: newDate });
        var clonedItem1 = $.extend({}, model.GenericTransactions[0], { TransactionId: ++maxID, ProductionDate: pDate });
        model.GenericTransactions.splice(0, 0, clonedItem1);
        var clonedItem2 = $.extend({}, model.Transactions[0], { TransactionId: maxID });
        //model.Transactions.splice(0, 0, clonedItem2);
    } else {
        isUpdate = true;
        var tranItem1 = {
            TransactionId: ++maxID,
            JOB_ID: "Auto-Generated",
            ProductionDate: $("#txtProductionDate").val(),
            AccountId: $("#ddlClient").val(),
            SiteId: $("#ddlSite").val(),
            LocationId: $("#ddlLocation").val(),
            ServiceAreaId: $("#ddlServiceArea").val(),
            AccountName: $("#ddlClient option:selected").text(),
            SiteName: $("#ddlSite option:selected").text(),
            LocationName: $("#ddlLocation option:selected").text(),
            ServiceAreaName: $("#ddlServiceArea option:selected").text()
        };
        model.GenericTransactions.push(tranItem1);
        var tranItem2 = $.extend({}, model.GenericTransactions[0], {
            TransactionId: maxID,
        });
        model.Transactions.push(tranItem2);
    }

    sessionStorage.setItem('model', JSON.stringify(model));
    isClone = true;
    isNew = true;
    populateGrid(model, true, maxID);
    var gridInstance = $("#gridContainer").dxDataGrid("instance");
    gridInstance.selectRows([++maxID], true);
    gridInstance.focusedRowKey = ++maxID;

    $.ajax({
        url: baseUrl + "api/client/GetServiceAreaFields",
        type: "POST",
        headers: headerToken,
        data: { Id: $("#ddlServiceArea").val(), email: sessionEmail },
        success: serviceAreaCallback,
        error: handleXHRError
    });
}

function initProductionDate() {
    //$("#txtProductionDate").datepicker({
    //    defaultDate: new Date(),
    //    autoclose: true,
    //    disableTouchKeyboard: true,
    //    orientation: 'bottom', showOnFocus: true, todayHighlight: true,
    //    zIndexOffset: 9,
    //    startDate: "-3m",
    //    endDate: "0d",
    //    immediateUpdates: true,
    //    startView: "months", minViewMode: "months"
    //});

    var tmp_dt = new Date();
    $("#txtProductionDate").val(("00" + (tmp_dt.getMonth() + 1).toString()).slice(-2) + "/01/" + tmp_dt.getFullYear().toString());

}

function initializeDateControl() {
    var now = new Date();
    if (isNew) $('*[class*="date-StringField"]').datepicker('update', null);
    //else $('*[class*="date-StringField"]').datepicker('update', new Date(now.getFullYear(), now.getMonth(), now.getDate()));
}

function getMaxTransactionId() {
    ajaxGetRequest("maxTransactionID", baseUrl + "api/Client/GetLatestTransactionId");
}

function getServiceAreaCategory(svcId) {
    $.ajax({
        url: baseUrl + "api/Client/GetServiceAreaCategory",
        method: "POST",
        data: { Id: svcId, email: sessionEmail },
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            sessionStorage.setItem('serviceAreaCategory', data);
        },
        error: handleXHRError
    });
}

function getServiceAreaCategories() {
    let url = baseUrl + "api/Client/GetServiceAreaCategories";
    ajaxGetRequest("serviceAreaCategories", url);
}

function getUserProfile(userEmail) {
    let url = baseUrl + "api/Client/SetUserProfile";
    //ajaxGetRequest("userProfile", url);
    $.ajax({
        url: url,
        type: "POST",
        data: { "email": userEmail },
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            sessionStorage.setItem('userProfile', JSON.stringify(data));
            sessionStorage.setItem("userId", data.Id);
            if (data.AccountType === 'M' || data.AccountType === 'A') {
                document.querySelector("#execDashboard").hidden = false;
                document.querySelector("#changeUserSetting").hidden = false;
                //document.querySelector("#adminMenu").hidden = false;
            }

            //if (data.AccessGoldReports == 1) w2ui['toolbarAdmin'].enable('goldReports');
            if (data.AccessGoldReports == 1) document.querySelector("#goldReports").hidden = false;
            //if (data.MstrUser == 1) w2ui['toolbarAdmin'].enable('platinumReports');
            if (data.MstrUser == 1) document.querySelector("#enterpriseReports").hidden = false;
            ////if (data.CanUpload == 1) w2ui['toolbarAdmin'].enable('uploadFiles');
            if (data.CanUpload == 1) document.querySelector("#uploadFiles").hidden = false;

            if (data.AccountType !== 'A') {
                w2ui['toolbarAdmin'].hide('adminMenu');
            } else {
                isAdmin = true;
                ////    w2ui['toolbarAdmin'].enable('uploadFiles');
                ////    w2ui['toolbarAdmin'].show('uploadFiles');
            }
        },
        error: handleXHRError
    });

}

function getUserFolders(userEmail) {
    let url = baseUrl + "api/Client/SetUserFolders";
    $.ajax({
        url: url,
        type: "POST",
        data: { "email": userEmail },
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            sessionStorage.setItem('userFolders', JSON.stringify(data));
        },
        error: handleXHRError
    });

}

function getAccountInfos() {
    let url = baseUrl + "api/Client/GetAccountInfos";
    $.ajax({
        url: url,
        method: "POST",
        data: {},
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            sessionStorage.setItem('accountInfos', JSON.stringify(data));

        },
        error: handleXHRError
    });
}

function getClientInfo() {
    let url = baseUrl + "api/Client/GetClientInfo";
    let id = +JSON.parse(sessionStorage.getItem("data")).clientId;
    $.ajax({
        url: url,
        method: "POST",
        data: { Id: id, email: sessionEmail },
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            sessionStorage.setItem('clientInfo', JSON.stringify(data));

        },
        error: handleXHRError
    });
}

function saveClientInfo() {
    let url = baseUrl + "api/Client/SaveClientInfo";
    let id = +JSON.parse(sessionStorage.getItem("data")).clientId;
    $.ajax({
        url: url,
        method: "POST",
        data: { Id: id, email: sessionEmail },
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            sessionStorage.setItem('clientInfo', JSON.stringify(data));

        },
        error: handleXHRError
    });
}

function getUserSettings() {
    let url = baseUrl + "api/Client/GetUserSettings";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            localStorage.setItem('userSettings', JSON.stringify(data));
            userSettings = data;
        },
        error: handleXHRError
    });
}

function getClientSettings() {
    let url = baseUrl + "api/Client/GetClientSettings";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            localStorage.setItem('clientSettings', JSON.stringify(data));
            clientSettings = data;
        },
        error: handleXHRError
    });
}

function getAppSettings() {
    let url = baseUrl + "api/Client/GetAppSettings";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            appSettings = data;
            //document.getElementById("MaxUploadFileSize").textContent = appSettings.MaxUploadFileSize;
            //document.getElementById("AllowedFileExtensions").textContent = appSettings.AllowedFileExtensions;
            $(function () {
                $("#file-uploader-container").dxFileUploader({
                    uploadHeaders: headerToken,
                    accept: "*",
                    multiple: true,
                    uploadMode: "useButtons",
                    //uploadUrl: "https://microstrategy.cbpsportal.com/eds/UploadFilesAsync",
                    uploadUrl: baseUrl + "api/Client/UploadFilesAsync",
                    allowedFileExtensions: appSettings.AllowedFileExtensions.split(','),
                    maxFileSize: appSettings.MaxUploadFileSize
                });
            });
        },
        error: handleXHRError
    });
}

//function getUserFolders() {
//    let url = baseUrl + "api/Client/GetUserFolders";
//    ajaxGetRequest("userFolders", url);
//}

function getUserPreferences() {
    //ajaxPostRequest("#sidebar", baseUrl + "api/client/GetTop10ServiceAreasByUserName", { Id: $("#sidebar").val(), email: sessionEmail })
    $.ajax({
        url: baseUrl + "Authentication/SignInCover/",
        //url: baseUrl + "Dashboard/Index/",
        data: { email: sessionStorage.getItem('email') }
    }).done(function () {
        //alert('Added');
    });
}

function saveUserPreferences() {
    //ajaxPostRequest("#sidebar", baseUrl + "api/client/GetTop10ServiceAreasByUserName", { Id: $("#sidebar").val(), email: sessionEmail })
    $.ajax({
        url: baseUrl + "api/client/GetTop10ServiceAreasByUserName",
        method: "POST",
        data: { Id: 0, UserName: sessionStorage.getItem('email') },
        dataType: "json",
        headers: headerToken,
        success: function (data) {
                localStorage.setItem("userSavedPreferences", JSON.stringify(data));
                //insertItems(data);
        },
        error: handleXHRError
    });
}

function handleRecentSavedData(data) {
    localStorage.setItem('userMode', 'Query');
    isFiltered = false;
    isAddMode = false;
    isDifferentSvcId = false;
    var genericTransactions = data == "No data" || data.GenericTransactions == null || data.GenericTransactions.length == 0 ? [] : data.GenericTransactions;
    var transactions = [];

    //brb save model data
    model.GenericTransactions = genericTransactions;
    model.Transactions = transactions;
    sessionStorage.setItem('model', JSON.stringify(model));

    if (data == "No data") {
        clearProductionLog;
        //hideProductionDetails();
    } else {
        if (sessionStorage.getItem('selectedArea') != 'All') {
            setSelectors(localStorage.getItem('areaId'));
        }
        showProductionDetails();
        isUpdate = true;
        selectGridRow();
        showForm();
    }

    $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
    //try {
    //    if (svcFields != null) {
    //        if (svcId != svcFields.svcID) {
    //            isDifferentSvcId = true;
    //        }
    //    }
    //}
    //catch (e) {
    //    console.log(e.message);
    //}
    //} else {
    //hideProductionDetails();
    //isNewServiceArea = true;
    //}
    $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
    $(".div-signin-loading-attrib").hide();
}

function handleSavedData(data) {
    var client = $("#ddlClient");
    clientName = client.find("option:selected").text();
    if (clientName !== '') isFiltered = true; else isFiltered = false;

    isDifferentSvcId = false;
    var genericTransactions = data == "No data" || data.GenericTransactions == null || data.GenericTransactions.length == 0 ? [] : data.GenericTransactions;
    var transactions = data.Transactions == null || data.GenericTransactions.length == 0 ? [] : data.Transactions;
    var svcId = serviceAreaId;
    var svcFields = data.ServiceAreaFields;
    model.ServiceAreaFields = data.ServiceAreaFields;
    model.FieldLOV = data.FieldLOV;
    model.Transactions = [];

    if (data.Transactions != null) {
        totalRecords = data.Transactions.Count;
    }

    //brb save model data
    model.GenericTransactions = genericTransactions;
    if (transactions.length > 0) model.Transactions.push(transactions[0]);
    sessionStorage.setItem('model', JSON.stringify(model));
    model.Transactions = transactions;

    if (model.GenericTransactions.length == 0) {
        clearProductionLog();
        //hideProductionDetails();
        isNewServiceArea = true;
        if (!isClone && !isDelete) {
            addNew();
            showData();
            //isDelete = true;
        }
    } else {
        setSelectors(localStorage.getItem('areaId'));
        showProductionDetails();
        isUpdate = true;
        if (data.Transactions && data.Transactions.length == 0) {
            isUpdate = false;
            populateForms(data);
        }
        selectGridRow();
    }
    //selectGridRow();
    showForm();

    $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
    //try {
    //    if (svcFields != null) {
    //        if (svcId != svcFields.svcID) {
    //            isDifferentSvcId = true;
    //        }
    //    }
    //}
    //catch (e) {
    //    console.log(e.message);
    //}

    $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
    $(".div-signin-loading-attrib").hide();
}

function selectGridRow() {
    var rowKey = +sessionStorage.getItem("rowKey");
    let userMode = localStorage.getItem('userMode');
    if (userMode == 'Query') {
        rowKey = -1;
    } else {
        if (rowKey == undefined || rowKey == null || rowKey == 0) {
            rowKey = Math.max.apply(Math, model.GenericTransactions.map(function (o) { return o.TransactionId; }))
        }
    }

    populateGrid(model, false, rowKey);
    var gridInstance = $("#gridContainer").dxDataGrid("instance");
    gridInstance.pageSize(+userSettings.PageSize);
    gridInstance.focusedRowKey = rowKey;
    gridInstance.selectRows([rowKey], false);

    //if (userMode == 'Query') {
    //    //hideSelectors();
    //    //toggleShowData();
    //    //hideData();
    //    //hideProductionDetails();
    //} else {
    //    showSelectors();
    //    showData();
    //}
}

function populateGrid(model, isAddMode, rowKey) {
    const rows = model.GenericTransactions.map(item => {
        const row = {};
        row.ProductionDate = item.ProductionDate;
        row.JOB_ID = item.JOB_ID;
        row.AccountName = item.AccountName;
        row.ServiceAreaName = item.ServiceAreaName;
        row.SiteName = item.SiteName;
        row.LocationName = item.LocationName;
        row.UserName = item.UserName;
        row.TransactionId = item.TransactionId;
        row.AccountId = item.AccountId;
        row.LocationId = item.LocationId;
        row.SiteId = item.SiteId;
        row.ServiceAreaId = item.ServiceAreaId;
        return row;
    })

    var oColumns = setupGenericColumns(model, isAddMode);

    if (!isAddMode && isFiltered) {
        var header = ['AccountName', 'JOB_ID', 'LocationName', 'ProductionDate', 'ServiceAreaName', 'SiteName', 'TransactionId', 'UserName', 'AccountId', 'LocationId', 'SiteId', 'ServiceAreaId'];

        var csv = generateCsvData(false).split('\n');
        var csvHeader = csv[0].split(',');
        var columns = header.concat(csvHeader.slice(11));

        var newArray = [], thing;
        for (var y = 0; y < rows.length; y++) {
            thing = {};
            for (var i = 0; i < columns.length; i++) {
                if (i < 12)
                    thing[columns[i]] = rows[y][columns[i]];
                else
                    thing[columns[i]] = csv[y + 1].split(',')[i - 1];
            }
            newArray.push(thing)
        }
        model.GenericTransactions = newArray;

        //setup additional column/fields
        for (var i = 12; i < columns.length; i++) {
            if (columns[i] !== "") {
                //brb 5/20/2022
                if (columns[i] == "Status") {
                    //oColumns.push({
                    oColumns.unshift({
                        "dataField": columns[i],
                        "caption": columns[i],
                        "showInColumnChooser": false,
                        "allowHiding": false,
                        "fixedPosition": "left",
                        "width": "100",
                        "cellTemplate": function (container, options) {
                            let color = 'red';
                            if (options.value == 'Completed') color = 'blue';
                            if (options.value.indexOf('Canceled') > -1) color = 'orange';
                            $("<div>").append(
                                $("<div>").innerHTML = "<span style='color:" + color + ";'>" + options.value + "</span>")
                                .appendTo(container);
                        }
                    });
                } else 
                oColumns.push({
                    "dataField": columns[i],
                    "caption": columns[i],
                    "width": "100"
                });
            }
        }
        //oColumns.splice(1, 1);
    }

    setupGrid(model, isAddMode, rowKey, oColumns);
    if (model.Transactions && model.Transactions.length > 0) {
        gridTransactions = model.Transactions;
        let trans = model.Transactions[0];
        model.Transactions = [];
        model.Transactions.push(trans);
    }
    sessionStorage.setItem('model', JSON.stringify(model));

    //show/hide save button
    //var x = document.getElementsByClassName('w2ui-button');
    //x[9].hidden = isFiltered ? false : true;

    if (isAddMode && !isPageChanged) {
        showData()
    } else {
        //if (submitButtonType != 2) hideData();
    }
}

function setupGenericColumns(model, isAddMode) {
    var oColumns = [];
    if (isAddMode) {
        oColumns.push({
            "type": "buttons",
            "width": "100",
            "buttons": [
                {
                    "hint": "Cancel",
                    "icon": "remove",
                    "visible": function (e) {
                        var maxID = +sessionStorage.getItem('maxTransactionID') + 1;
                        return isAddMode && e.row.key == maxID;;
                    },
                    "onClick": function (e) {
                        var maxID = +sessionStorage.getItem('maxTransactionID') + 1;
                        var rowIdx = e.row.key;
                        var dataIdx = model.GenericTransactions.findIndex(function (d) { return d.TransactionId == rowIdx });
                        model.GenericTransactions.splice(dataIdx, 1);
                        isClone = false;
                        e.component.refresh(true);
                        populateGrid(model, true, maxID);

                        getSavedDataByServiceArea(localStorage.getItem('areaId'));

                        --maxID;
                        e.event.preventDefault();
                        isDelete = true;
                    }
                }
            ]
        });
    }
    oColumns.push({
        "dataField": "TransactionId",
        "width": "70",
        "caption": "SEQNO",
        "showInColumnChooser": false,
        "allowHiding": false,
        "fixedPosition": "left",
        "alignment": "left",
        "dataType": "number",
        "visible": "true",
        "sortOrder": "asc",
        "sortIndex": "4",
        "cellTemplate": function (container, options) {
            var maxID = +sessionStorage.getItem('maxTransactionID') + 1;
            $("<div>").append(
                $("<div>").innerHTML = isFiltered && isClone && options.value == maxID ? "------" : options.value)
                .appendTo(container);
        }
    });
    oColumns.push({
        "dataField": "ProductionDate",
        "caption": "DATE",
        "width": "80",
        "showInColumnChooser": false,
        "allowHiding": false,
        "fixedPosition": "left",
        "format": "MM/dd/yyyy",
        "dataType": "date",
        "sortOrder": "asc",
        "sortIndex": "0"
    });
    oColumns.push({
        "dataField": "JOB_ID",
        "caption": "JOB ID",
        "width": "190",
        "showInColumnChooser": false,
        "allowHiding": false,
        "fixedPosition": "left",
        "alignment": "left",
        "dataType": "string",
        "sortOrder": "asc",
        "sortIndex": "6",
        "cellTemplate": function (container, options) {
            var maxID = +sessionStorage.getItem('maxTransactionID') + 1;
            $("<div>").append(
                $("<div>").innerHTML = isFiltered && isClone && options.key == maxID ? "Auto-Generated" : options.value)
                .appendTo(container);
        }
    });
    oColumns.push({
        "dataField": "AccountName",
        "caption": "CLIENT",
        "width": "100",
        "visible": true,
        "showInColumnChooser": false,
        "allowHiding": false,
        "fixedPosition": "left",
        "dataType": "string",
        "sortOrder": "asc",
        "sortIndex": "1"
    });
    oColumns.push({
        "dataField": "ServiceAreaName",
        "caption": "SERVICE AREA",
        "width": "120",
        "visible": true,
        "showInColumnChooser": false,
        "allowHiding": false,
        "fixedPosition": "left",
        "dataType": "string",
        "sortOrder": "asc",
        "sortIndex": "3"
    });
    oColumns.push({
        "dataField": "SiteName",
        "caption": "SITE",
        "width": "100",
        "visible": false,
        "dataType": "string",
        "sortOrder": "asc",
        "sortIndex": "2"
    });
    oColumns.push({
        "dataField": "LocationName",
        "caption": "LOCATION",
        "visible": false,
        "width": "100",
        "dataType": "string"
    });
    oColumns.push({
        "dataField": "UserName",
        "caption": "CREATED BY",
        "width": "80",
        "dataType": "string",
        "sortOrder": "asc",
        "sortIndex": "5"
    });
    if (!addNew || localStorage.getItem('userMode') != 'Entry') {
        oColumns.unshift({
            "dataField": "StatusCode",
            "caption": "Status",
            "showInColumnChooser": false,
            "allowHiding": false,
            "fixedPosition": "left",
            "width": "80",
            "cellTemplate": function (container, options) {
                let color = 'red';
                if (options.value == 'C' || options.value == 'Completed') {
                    color = 'blue';
                    options.value = 'Completed'
                    //} else if (options.value != '') options.value = 'Pending'
                } else if (options.value = 'P') options.value = 'Pending'
                $("<div>").append(
                    $("<div>").innerHTML = "<span style='color:" + color + ";'>" + options.value + "</span>")
                    .appendTo(container);
            }
        });
    }
    return oColumns;
}

//var ordersStore = new DevExpress.data.CustomStore({
//    key: "TransactionId",
//    remove: function (key) {
//        return sendRequest(baseUrl + "DeleteTran", "DELETE", {
//            key: key
//        });
//    }
//});

function setupGrid(model, isAddMode, rowKey, oColumns) {
    $("#gridContainer").dxDataGrid({
        elementAttr: {class: "myClass"},
        dataSource: model.GenericTransactions,
        keyExpr: "TransactionId",
        //loadPanel: {
        //    enabled: false
        //},
        columnChooser: {
            enabled: true,
            //mode: "dragAndDrop"
            mode: "select"
        },
        columnsAutoWidth: false,
        allowColumnResizing: true,
        columnResizingMode: "widget",
        showColumnLines: true,
        showRowLines: true,
        rowAlternationEnabled: true,
        columnFixing: {
            enabled: false
        },
        sorting: {
            //mode: "multiple"
            mode: "single"
        },
        showBorders: true,
        onContentReady: function (e) {
            //if (searchEntered == false) $('.dx-clear-button-area').trigger('click');  

            replaceHeaderClass();
            //if (e.component.__searchChanged) {
            //e.component.__searchChanged = false;
            //let selectedData = e.component.getSelectedRowsData();
            //if (selectedData.length == 0) hideProductionDetails();
            //}

            //brb 6/1/2022
            //if (searchEntered && e.component.getVisibleRows().length == 0) hideProductionDetails(); else showProductionDetails();
            //e.component.getVisibleRows().length == 0 ? hideProductionDetails() : showProductionDetails();
            //brb 6/1/2022

            let userMode = localStorage.getItem('userMode');
            if (userMode == 'Query') {
                //brb 6/16/2022
                if (sessionStorage.getItem('selectedArea') != 'All') initClientList();
                //localStorage.setItem('userMode', '');
                //brb 6/16/2022

                //hideProductionDetails();
            }

            //brb 5/13/2022
            let rowKeys = JSON.parse(localStorage.getItem('storage'))
            if (rowKeys && rowKeys.selectedRowKeys != null) {
                let rowKey = rowKeys.selectedRowKeys[0]
                e.component.selectRows(rowKey);
                focusedRowKey = rowKey;
            }
            //brb 5/13/2022
        },
        hoverStateEnabled: true,
        stateStoring: {
            enabled: true,
            type: "localStorage",
            storageKey: "storage"
        },
        onOptionChanged: function (args) {
        //    return;
            searchEntered = false;
        //    if (args.fullName === 'filterValue') {
        //        //var x = document.getElementsByClassName('w2ui-button');
        //        if (args.value === null) {
        //            localStorage.removeItem('filter');
        //            let storageFilter = JSON.parse(localStorage.getItem('storage'));
        //            if (storageFilter) {
        //                storageFilter.filterValue = "";
        //                localStorage.removeItem('storage');
        //                localStorage.setItem('storage', JSON.stringify(storageFilter));
        //                //x[9].hidden = true;
        //            }
        //        } else {
        //            if (args.value[0] === "ServiceAreaName" && args.value[1] === "=") {
        //                isFiltered = true;
        //                //x[9].hidden = false;
        //                let filter = args.value[2];
        //                localStorage.setItem('filter', filter);
        //                let storageFilter = JSON.parse(localStorage.getItem('storage'));
        //                if (storageFilter) {
        //                    storageFilter.filterValue = [['ServiceAreaName', '=', filter]];
        //                    localStorage.removeItem('storage');
        //                    localStorage.setItem('storage', JSON.stringify(storageFilter));
        //                }
        //            } else {
        //                if (args.value[1] === "=") {
        //                    let filter = args.value[2];
        //                    localStorage.setItem('filter', filter);
        //                } else {
        //                    if ((args.value[1] === "and" || args.value[1] === "or") && args.value[2].toString() !== args.value[0].toString()) {
        //                        let filter = args.value[0][3];
        //                        localStorage.setItem('filter', filter);
        //                    }
        //                }
        //            }
        //        }
        //    } else if (args.fullName === 'paging.pageIndex') {
        if (args.fullName === 'paging.pageIndex') {
                isPageChanged = true;
            } else if (args.fullName == "searchPanel.text") {
                //e.component.__searchChanged = true;
                searchEntered = true;
            }
        },
        searchPanel: {
            visible: true,
            width: 160,
            placeholder: "Search Grid Data..."
            
        },
        paging: {
            pageSize: userSettings.PageSize,
            enabled: true
        },
        pager: {
            //displayMode: "compact",
            visible: true,
            displayMode: "full",
            showPageSizeSelector: true,
            allowedPageSizes: [5, 10, 15, 20],
            showInfo: true,
            showNavigationButtons: true
        },
        export: {
            //enabled: isFiltered && !isAddMode,
            enabled: false,
            allowExportSelectedData: false
        },
        onExporting: function (e) {
            //exportToCsv(true);
            //e.cancel = true;

            let model = JSON.parse(sessionStorage.getItem('model'));
            let fileName = [model.GenericTransactions[0].AccountName, "-", model.GenericTransactions[0].ServiceAreaName].join('');

            let workbook = new ExcelJS.Workbook();
            let worksheet = workbook.addWorksheet(fileName);

            DevExpress.excelExporter.exportDataGrid({
                component: e.component,
                worksheet: worksheet,
                autoFilterEnabled: true
            }).then(function () {
                workbook.xlsx.writeBuffer().then(function (buffer) {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + '.xlsx');
                });
            });
            e.cancel = true;
        },
        onCellHoverChanged: function (e) {
            //alert(e);
            //if (e.rowType == "header") {
            //    popup.option("contentTemplate",
            //        function (contentElement) {
            //            $("<div/>")
            //                .append("Toolip for: " + e.column.caption)
            //                .appendTo(contentElement);
            //        });
            //    popup.option("target", e.cellElement);
            //    popup.show();
            //}
        },
        onContextMenuPreparing: function (e) {
            if (e.target == "headerPanel") {
                // e.items can be undefined
                if (!e.items) e.items = [];

                // Add a custom menu item
                e.items.push(
                    {
                        icon: "add-icon",
                        text: "  How To View Transaction Records",
                        onItemClick: function () {
                            //window.open('https://cbpsinc-my.sharepoint.com/:v:/g/personal/manuguid_cbps_canon_com/EVM0kBTfGLVGqcGcbuSeY50Bm-Ysu2IFYP8D-rIsD_WzfQ', '_blank');
                            window.open('https://canonbps.box.com/s/q5nkgbk99fepqlgwwan639ti17qr35ni', '_blank');
                        }
                    },
                    {
                        icon: "refresh-icon",
                        text: "  How To Change Transaction View",
                        onItemClick: function () {
                            //window.open('https://cbpsinc-my.sharepoint.com/:v:/g/personal/manuguid_cbps_canon_com/ESrJfrGDZIxHrsK_Pce2mr4BXc8mHhctej6OIMGk4Q1MBw', '_blank');
                            window.open('https://canonbps.box.com/s/owgvhx83x9tjfvqdzug23ch4v19xxsh0', '_blank');
                        }
                    },
                    {
                        icon: "add",
                        text: "  How To Add/Edit Transaction",
                        onItemClick: function () {
                            window.open('https://canonbps.box.com/s/yq2odjfbwe2gx8wue12p71qp7rv7sxg0', '_blank');
                        }
                    },
                    {
                        icon: "search",
                        text: "  How To Search Transaction Records",
                            onItemClick: function () {
                                //console.log(e.column.caption);
                                window.open('https://canonbps.box.com/s/wifb3i7d67ax7684elr9wl2mp6v9jo9h', '_blank');
                                //window.open('https://cbpsinc-my.sharepoint.com/:v:/g/personal/manuguid_cbps_canon_com/EcSBqYam6yJOu9A2jm1D-O8BWpP71FXloKLiGc0z6VXaoQ', '_blank');
                            }
                    },
                    {
                        icon: "xlsx-icon",
                        text: "  How To Export Transaction Records",
                        onItemClick: function () {
                            window.open('https://canonbps.app.box.com/s/ldcysyyp3mhq8qn82ugoi64ca8hllaxd', '_blank');
                        }
                    }
                );
            }
        },
        onToolbarPreparing: function (e) {
            e.toolbarOptions.items.unshift({
                location: "before",
                widget: "dxButton",
                options: {
                    //icon: "material-icons ic-client",
                    //text: "Set Client",
                    text: "Set Selectors",
                    showText: "always",
                    icon: "client-icon",
                    //hint: "Select New Client",
                    hint: "Set New Selectors",
                    cssClass: "cls",
                    onClick: function (e) {
                        $('#context-menu2').dxContextMenu("show");
                    }
                }
            }, {
                location: "before",
                widget: "dxButton",
                options: {
                    visible: true,
                    text: "Query View",
                    showText: "always",
                    icon: "refresh-icon",
                    hint: "Switch to Query View",
                    onClick: function () {
                        reloadAllUserTrans();
                    }
                }
            }, {
                location: "before",
                widget: "dxButton",
                options: {
                    elementAttr: { id: 'entryViewButton' },
                    //visible: !isFiltered && isEditMode,
                    visible: false,
                    text: "Entry View",
                    showText: "always",
                    icon: "fa fa-plus-circle",
                    hint: "Switch to Entry View",
                    onClick: function () {
                        if (clientId == undefined) {
                            let client = $("#ddlClient");
                            clientId = parseInt(client.val());
                        }
                        let areaId = "";
                        let svc = $("#ddlServiceArea");
                        if (svc.val() == "--- Select ServiceArea---" || svc.val() == "--- Select All---") { 
                            var userPref = JSON.parse(localStorage.getItem('userSavedPreferences'));
                            areaId = userPref[0].Id;
                        }
                        //else if (svc.val() == "--- Select All---") {
                        //    getFirstServiceArea(clientId);
                        //    areaId = serviceAreaId + '_' + clientId;
                        //}
                        else {
                            serviceAreaId = parseInt(svc.val());
                            areaId = serviceAreaId + '_' + clientId;
                        }
                        getSavedDataByServiceArea(areaId);
                    }
                }
            }, {
                location: "before",
                widget: "dxButton",
                options: {
                    visible: isAdmin,
                    //icon: "add-icon",
                    text: "Delete",
                    showText: "always",
                    icon: "fa fa-trash",
                    hint: "Delete Transaction",
                    onClick: function () {
                        isUpdate = false;
                        submitButtonType = 3;
                        submitForm();
                    }
                }
            }, {
                location: "before",
                widget: "dxButton",
                options: {
                    visible: isFiltered,
                    //icon: "add-icon",
                    text: "New Tran",
                    showText: "always",
                    icon: "fa fa-plus",
                    hint: "Add New Transaction (Entry View)",
                    onClick: function () {
                        addNew();
                    }
                }
            }, {
                location: 'center',
                template() {
                    return $('<div>')
                        .addClass('informer')
                        .append(
                            $('<h6>')
                                .addClass('count')
                                .text(getGroupCount('TransactionId')),
                            $('<span>')
                                .addClass('name')
                                .text('Total Count'),
                        );
                },
            });
        },
        editing: {
            refreshMode: "reshape",
            mode: "row",
            //allowAdding: true,
            allowUpdating: false,
            allowDeleting: function (e) {
                return false;
            },
            useIcons: false
        },
        repaintChangesOnly: false,
        selection: {
            mode: "single"
        },
        onSelectionChanged: function (selectedItems) {
            if (isFiltered) return;
            if (isAddMode) return;
            isEditMode = true;
            var data = selectedItems.selectedRowsData[0];
            if (data) {
                //show Entry View button
                if (!isFiltered) $("#entryViewButton").dxButton("instance").option("visible", true);  
                getTransactionData(data, false);
            }
        },
        onCellDblClick: function (e) {
            sessionStorage.setItem("rowKey", e.data.TransactionId);
            if (!isFiltered) {
                let areaId = e.data.ServiceAreaId + '_' + e.data.AccountId
                //let savedSelectorsArr = JSON.parse(localStorage.getItem('userSavedPreferences'));
                //if (savedSelectorsArr && savedSelectorsArr.length > 0) {
                    //let savedSelectors = savedSelectorsArr.filter(function (obj) { return obj.Id == areaId });
                    //if (savedSelectors.length > 0) w2ui.sidebar.click(areaId);
                    //else 
                    getSavedDataByServiceArea(areaId);
                //}
            }
        },
        hoverStateEnabled: true,
        autoNavigateToFocusedRow: true,
        focusedRowEnabled: isFiltered,
        focusedRowKey: rowKey,
        onFocusedRowChanging: function (e) {
            var rowsCount = e.component.getVisibleRows().length,
                pageCount = e.component.pageCount(),
                pageIndex = e.component.pageIndex(),
                key = e.event && e.event.key;

            if (key && e.prevRowIndex === e.newRowIndex) {
                if (e.newRowIndex === rowsCount - 1 && pageIndex < pageCount - 1) {
                    e.component.pageIndex(pageIndex + 1).done(function () {
                        e.component.option("focusedRowIndex", 0);
                    });
                } else if (e.newRowIndex === 0 && pageIndex > 0) {
                    e.component.pageIndex(pageIndex - 1).done(function () {
                        e.component.option("focusedRowIndex", rowsCount - 1);
                    });
                }
            }
        },
        //columnHidingEnabled: true,
        onFocusedRowChanged: function (e) {
            const focusedRowKey = e.component.option("focusedRowKey");
            if (focusedRowKey) {
                var keyIndex = model.GenericTransactions.findIndex(i => i.TransactionId == focusedRowKey)
                if (keyIndex > -1) getTransactionData(model.GenericTransactions[keyIndex], false);
            }
        },
        filterRow: { visible: true },
        filterPanel: { visible: true },
        headerFilter: { visible: true },
        filterBuilder: {},
        filterBuilderPopup: {
            position: { of: window, at: "top", my: "top", offset: { y: 10 } },
        },
        filterSyncEnabled: true,

        showBorders: true,
        columns: oColumns
    });
}

function getGroupCount(groupField) {
    return DevExpress.data.query(model.GenericTransactions)
        .groupBy(groupField)
        .toArray().length;
}

function setNewSelectors(selector) {
    switch (selector) {
        case "Client":
            initClientList();
            showSelectorPanel();
            $("#ddlClient").focus();
            break;
        case "Site":
            showSelectorPanel();
            setSelectors();
            ajaxRequest("#ddlSite", baseUrl + "api/client/GetSiteByUserName", { Id: $("#ddlClient").val(), email: sessionEmail });
            populateSelectorOptions("#ddlSite");
            populateSelectorOptions("#ddlLocation");
            populateSelectorOptions("#ddlServiceArea");
            $("#ddlSite").focus();
            break;
        case "Location":
            showSelectorPanel();
            setSelectors();
            ajaxRequest("#ddlLocation", baseUrl + "api/client/GetLocationById", { Id: $("#ddlSite").val(), email: sessionEmail });
            populateSelectorOptions("#ddlLocation");
            populateSelectorOptions("#ddlServiceArea");
            $("#ddlLocation").focus();
            break;
        case "Service Area":
            showSelectorPanel();
            setSelectors();
            ajaxRequest("#ddlServiceArea", baseUrl + "api/client/GetServiceAreaById", { Id: $("#ddlLocation").val(), email: sessionEmail })
            populateSelectorOptions("#ddlServiceArea");
            $("#ddlServiceArea").focus();
            break;
    }

    clearProductionLog();
}

//brb get trans
function getTransactionData(e, isTr) {
    $(".div-signin-loading-attrib").show();
    //brb 6/16/2022
    sessionStorage.setItem('selectedArea', serviceAreaName)
    //brb 6/16/2022
    //toggleShowData();
    //showData();
    //hideSelectors();
    //showProductionDetails();
    console.log("row", isTr, e);

    if (!isClone) isNew = false;


    submitButtonType = 2;
    isPrevious = false;
    var tranId = isClone ? e.TransactionId - 1 : e.TransactionId;
    if (isTr) {
        trIndex = $(e).index();
    }
    else {
        trIndex = $(e).parent().parent().index();
        $(e).next().addClass("hidden");
        $(e).next().next().removeClass("hidden");
    }

    $("#tID").val(tranId);


    if (e.TransactionId == null) {
        toastr.error("Ïnvalid Data/Operation");
        return;
    }

    var payload = {
        "userId": +sessionStorage.getItem("userId"),
        "transactionId": tranId,
        "accountId": e.AccountId,
        "siteId": e.SiteId,
        "locId": e.LocationId,
        "svcId": e.ServiceAreaId
    };

    console.log("payload get tran by id", payload);
    transactionId = tranId;
    $.ajax({
        url: baseUrl + "api/client/GetTransactionById",
        method: "GET",
        data: payload,
        dataType: "json",
        headers: headerToken,
        success: function (data) { handleTransactionView(data, tranId) },
        error: handleXHRError
    });
}

function handleClientData(data, targetElement) {
    if (sessionStorage.getItem("clientData") == null)
        sessionStorage.setItem("clientData", JSON.stringify(data));

    populateClientHierarchyData(data, targetElement);
}

function populateClientHierarchyData(data, targetElement) {
    var selData = [];
    var defaultOpt = '<option value="--- Select ' + targetElement + '---">--- Select ' + targetElement + ' ---</option>';
    $(targetElement).find('option').remove();

    if (targetElement == "#ddlSite") {
        $(targetElement + ", #ddlLocation, #ddlServiceArea").find('option').remove();
        $(["#ddlLocation", "#ddlServiceArea"]).each(function (i, e) {
            var replace = targetElement;
            var re = new RegExp(replace, "g");
            $(e).append(defaultOpt.replace(re, e).replace(/#ddl/g, ""));
        });
    }

    $.each(data, function (i, e) { selData.push(["<option value=", e.Id, ">", e.Value, "</option>"].join('')) });

    //brb 6/3/2022
    if (targetElement == "#ddlServiceArea" && selData.length > 0) {
        selData.unshift('<option value="0">Select All</option>');
    }
    //brb 6/3/2022

    selData.unshift(defaultOpt.replace(/#ddl/g, ""));
    $(targetElement).append(selData.join(''));

    localStorage.setItem('userMode', 'Entry');
}

function handleTransactionView(data, id) {
    var newSavedData = model.GenericTransactions.filter(function (obj) { return obj.TransactionId == id });

    if (newSavedData.length > 0) {
        //var d = formatDate(newSavedData[0].ProductionDate).split('-');                  //ProductionDate
        //var yyyy = d[0];
        //var mm = d[1];
        //var dd = d[2];
        //$("#txtProductionDate").val(mm + '/' + dd + '/' + yyyy);
        clientId = newSavedData[0].AccountId;
        $("#ddlSite, #ddlLocation, #ddlServiceArea").find('option').remove();   //exclude #ddlClient
        $("#ddlClient").val(newSavedData[0].AccountId);
        $("#ddlSite").append(["<option value=", newSavedData[0].SiteId, ">", newSavedData[0].SiteName, "</option>"].join(''));
        $("#ddlLocation").append(["<option value=", newSavedData[0].LocationId, ">", newSavedData[0].LocationName, "</option>"].join(''));
        $("#ddlServiceArea").append(["<option value=", newSavedData[0].ServiceAreaId, ">", newSavedData[0].ServiceAreaName, "</option>"].join(''));

        model.Transaction = data.Transactions[0];
        model.ServiceAreaFields = data.ServiceAreaFields;
        model.FieldLOV = data.FieldLOV;
        //model.Transactions = data.Transactions[0];
        model.Transactions = [];
        model.Transactions.push(data.Transactions[0]);
        model.lastSavedData = newSavedData;
        //brb save model data
        sessionStorage.setItem('model', JSON.stringify(model));
        model.Transactions = data.Transactions;

        isUpdate = true;
        pageNumber = 0;
        var x = document.getElementsByClassName('w2ui-button');

        var validPeriod = new Date();
        var currentDate = new Date(newSavedData[0].ProductionDate);
        //clientSettings supersede default 
        let settings = JSON.parse(localStorage.getItem('clientSettings'));
        let clientSetting = settings.filter(s => s.clientID == clientId)[0];
        if (clientSetting) {
            if (isFiltered) {
                let validPeriodForEditing = clientSetting.editPeriodUsr;//days, 7
                if (sessionAccountType != 'U') {
                    validPeriodForEditing = clientSetting.editPeriodMgr;//days, 35
                } 
                validPeriod.setDate(validPeriod.getDate() - validPeriodForEditing);
                //x[9].hidden = currentDate < new Date(validPeriod) ? true : false;
            } else {
                if (sessionAccountType != 'U') {
                    let validPeriodForViewing = clientSetting.editPeriodMgr;//days, 35
                    validPeriod.setDate(validPeriod.getDate() - validPeriodForViewing);
                    //x[9].hidden = currentDate < new Date(validPeriod) ? true : false;
                } //else x[9].hidden = true; //validPeriod.setDate(new Date(new Date(newSavedData[0].ProductionDate)-1));
            }
        //    if ( currentDate < new Date(validPeriod)) {//invalid date
        //        x[9].hidden = true;
        //    } else {
        //        x[9].hidden = false;
        //    }
        }
        else {
            if (isFiltered) {
                //if (model.Transaction.JOB_ID == null && model.Transaction.StatusCode == "C") x[9].hidden = true;
                //else x[9].hidden = false;
            } else {
                //var validPeriod = new Date();
                //hide save button for data prior to current - 4 periods (default)
                let validPeriodForEditing = +userSettings.ValidPeriod;
                validPeriod.setMonth(validPeriod.getMonth() - validPeriodForEditing);

                if (new Date(newSavedData[0].ProductionDate) < new Date(validPeriod)) {//invalid month
                   // x[9].hidden = true;
                } else {
                    //if (model.Transaction.JOB_ID == null && model.Transaction.StatusCode == "C") x[9].hidden = true;
                    //else x[9].hidden = false;
                }
            }
        }

        serviceAreaCallback(data.ServiceAreaFields);
        //updateDataModel(isFiltered, model.Transactions);
    }
}

function handleXHRError(err) {
    $("#div-signin-loading").hide();
    //$(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
    toastr.error("Oops! Something went wrong. Please contact BI administrator");
    if ((err.status >= 400 && err.status < 404) || err.status == 500 || err.status == 501) {
        //sessionStorage.clear();
        window.location.href = baseUrl + "Authentication/Errors500/";
    }
}

function submitForm(e) {
    if (searchEntered) {
        searchEntered = false;
        return;
    }

    if ($("#ddlClient").val().match(pattern) != null
        || $("#ddlSite").val().match(pattern) != null
        || $("#ddlLocation").val().match(pattern) != null
        || $("#ddlServiceArea").val().match(pattern) != null)
        return;

    inputData = {
        "userName": sessionStorage.getItem("email")
        , "tDate": $("#txtProductionDate").val()
        , "accountID": $("#ddlClient").val()
        , "siteID": $("#ddlSite").val()
        , "locID": $("#ddlLocation").val()
        , "svcID": $("#ddlServiceArea").val()
    };
    inputData["tID"] = transactionId;

    if (isUpdate) {
        inputData["userName"] = model.Transaction.userName;
        inputData["UserName"] = model.Transaction.userName;
    }

    if (isClientWithDefaultValue)   //LIBERTY MUTUAL CLIENT ID
        inputData["Remarks"] = $("#remarks").val();

    $.each($("input[id^=field]"), function (i, e) { inputData[e.id] = e.value });
    $.each($("input[id^=StringField]"), function (i, e) { inputData[e.id] = e.value });
    $.each($("select[id^=StringField]"), function (i, e) { inputData[e.id] = e.value });

    if (transactionId > 0)
        inputData.tID = transactionId;

    //submit data
    //0 = Save
    //1 = Save New
    //2 = Update
    //3 = Delete
    if (submitButtonType == 0) {
        //$("#JOB_ID").val(getNewSequence());
        inputData["tID"] = 0;
    }
    else if (submitButtonType == 3)
        inputData["StatusCode"] = "D";

    inputData["JOB_ID"] = $("#JOB_ID").val();

    var toastrMsg = ["New Record Saved", "Saved", "Record Updated", "Record Deleted"];
    var rowKey = 0;

    $.ajax({
        url: baseUrl + "api/client/SaveData",
        type: "POST",
        headers: headerToken,
        data: JSON.stringify(inputData),
        contentType: 'application/json',
        success: function (data) {
            toastr.success(toastrMsg[submitButtonType]);
            console.log("saved", data);

            isClone = false;

            transactionId = data[0].Value;
            inputData.tID = transactionId;
            inputData["TransactionId"] = transactionId;
            inputData["JOB_ID"] = data[1].Value;
            $("#JOB_ID").val(data[1].Value);

            //inputData[data[4].Key] = data[4].Value;
            //$("#" + data[4].Key).val(data[4].Value);

            inputData["ProductionDate"] = $("#txtProductionDate").val();

            inputData["AccountId"] = $("#ddlClient").val();
            inputData["SiteId"] = $("#ddlSite").val();
            inputData["LocationId"] = $("#ddlLocation").val();
            inputData["ServiceAreaId"] = $("#ddlServiceArea").val();

            inputData["AccountName"] = $("#ddlClient option:selected").text();
            inputData["SiteName"] = $("#ddlSite option:selected").text();
            inputData["LocationName"] = $("#ddlLocation option:selected").text();
            inputData["ServiceAreaName"] = $("#ddlServiceArea option:selected").text();

            rowKey = transactionId;

            if (submitButtonType == 0) {
                inputData["UserName"] = sessionStorage.getItem("email");
                inputData["userName"] = sessionStorage.getItem("email");
            }

            //UPDATE MODEL
            model.lastSavedData = inputData;

            var dataIdx = model.GenericTransactions.findIndex(function (e) { return e.TransactionId == transactionId });

            if (submitButtonType == 3) {    //DELETED
                //delete row from model
                model.GenericTransactions.splice(dataIdx, 1);
                //var index = 0;
                //model.GenericTransactions.splice(index, 1);
                isUpdate = false;
                isNew = false;
                rowKey = model.GenericTransactions[0].TransactionId;
                refreshGrid();
            }
            else if (submitButtonType == 2) { //update
                refreshGrid();
            }
            else {  //save/new                
                model.GenericTransactions.TransactionId = transactionId;
                if (model.GenericTransactions.length > 0) model.GenericTransactions[0].TransactionId = transactionId;
                model.Transaction.tID = transactionId;
                model.Transaction.ID = transactionId;
                rowKey = transactionId;
                sessionStorage.setItem('maxTransactionID', rowKey.toString());
                sessionStorage.setItem('rowKey', rowKey.toString());
                refreshGrid();
                return;
            }
            sessionStorage.setItem('rowKey', rowKey.toString());
            $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
        },
        error: handleXHRError
    });

}

function refreshGrid() {
    //if (submitButtonType != 2) hideData();
    var areaId = localStorage.getItem('areaId');
    var delayInMilliseconds = 0;
    //var userPref = JSON.parse(localStorage.getItem('userSavedPreferences'));
    //if (userPref.filter(u => u.Id === areaId).length == 0) {
        //getUserPreferences();//refresh sidebar
        //delayInMilliseconds = 1000; //1 second
    //}
    setTimeout(function () {
        getSavedDataByServiceArea(areaId);
    }, delayInMilliseconds);

    $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
}

function populateForms(data) {
    //if ($("#ddlServiceArea").val().match(pattern) != null)
        //return;

    scrollFunction();

    var client = $("#ddlClient");
    clientName = client.find("option:selected").text();
    var site = $("#ddlSite");
    siteId = $("#ddlSite").val();
    siteName = site.find("option:selected").text();
    var location = $("#ddlLocation");
    locationId = $("#ddlLocation").val();
    locName = location.find("option:selected").text();

    var svc = $("#ddlServiceArea");
    if (isProductionMonthDidChange || (serviceAreaId != parseInt(svc.val()))) {
        origDataModel = [];
        //getRecentActivity();
        isProductionMonthDidChange = false;
    }

    serviceAreaId = parseInt(svc.val());
    //POPULATE USERS SAVED DATA FIRST
    serviceAreaName = svc.find("option:selected").text();
    $("#txtSearch").attr("placeholder", "Search recently saved data for " + serviceAreaName);
    //$("#txtSearch").attr("placeholder", "Search recently saved data for " + svc.find("option:selected").text());

    clientId = $("#ddlClient").val();
    localStorage.setItem('areaId', serviceAreaId + '_' + clientId);
    let serviceAreaCategories = JSON.parse(sessionStorage.getItem('serviceAreaCategories'));
    var areaCategory = serviceAreaCategories.filter(f => f.Id == serviceAreaId)[0].Value;
    var serviceAreaCategory = 'Others';
    for (let x of StandardServiceAreaCategories) {
        if (areaCategory.toLowerCase() === x.toLowerCase()) {
            serviceAreaCategory = x;
            break;
        }
    }
    sessionStorage.setItem('serviceAreaCategory', serviceAreaCategory);


    var jobId = {
        svcFieldID: 0,
        svcID: serviceAreaId,
        svcFieldNumber: 0,
        svcFieldName: "JOB ID",
        CategoryCode: null,
        IsVisible: true,
        Shade: null,
        Description_Txt: null,
        ServiceAreaFieldGroup_SAID: null,
        FieldType: 0,
        DataType: "text",
        GroupName: null,
        MetricShortName: null,
        MetricFormat: null,
        DefaultValue: null,
    }
    var d_data = [jobId].concat(data);
    var metricData = [];
    var attribData = [];
    var tblDataAttrib = [];
    var tblDataMetric = [];
    var defaultVal = "";
    var required = ' required="required" ';
    var nullClientId = nullDefaultValueClientId.split(',');
    var noAttribSvcAreaSum = d_data.reduce(function (cnt, o) { return cnt + o.FieldType }, 0);
    var shade = "";
    isClientWithDefaultValue = $.inArray($("#ddlClient").val(), nullClientId) >= 0 ? true : false;

    //console.log("noAttribSvcAreaSum", noAttribSvcAreaSum);
    var tbAttrib = $("#tblAttribFields");
    var tbMetric = $("#tblMetricFields");
    var divAttrib = $(".bide-content-attrib");
    var divMetric = $(".bide-content-metric");
    var dataSize = d_data.length;

    if (noAttribSvcAreaSum == d_data.length) {    //METRIC ONLY
        if (isClientWithDefaultValue) { //DEFAULT NULL E.G: LIBERTY MUTUAL
            defaultVal = "";
            required = "";
        }
    } else {    //ATTRIB + METRIC
        //TODO: ADD STYLING
    }

    var attribIdx = 0;
    var metricIdx = 0;
    var isLast = false;
    var isJobId = false;
    var requiredAttr = " required='required' ";
    var seq = getNewSequence();
    var row = "";

    divAttrib.removeClass("hidden").show();
    divMetric.removeClass("hidden").show();

    attribData = [];
    metricData = [];
    tblDataAttrib = [];
    tblDataMetric = [];

    tbMetric.find("tbody tr").remove();
    tbAttrib.find("tbody tr").remove();

    var row = "";
    var label = "";
    var isMandatory = false;
    var attribCount = 0;
    var toolTip = "";
    $.each(d_data, function (i, e) {
        isMandatory = false;
        isLast = i == dataSize - 1 ? true : false;
        isJobId = e.svcFieldName === "JOB ID" ? true : false;
        var fieldId = isJobId ? "JOB_ID" : e.FieldType == 0 || e.FieldType == "0" ? "StringField" : "Field";
        if (fieldId != "JOB_ID") {
            fieldId += e.svcFieldNumber;
        }
        var svcFieldId = isJobId ? "JOB_ID" : serviceAreaCategory;
        if (!isJobId) {
            serviceAreaCategory == 'Others' ? svcFieldId += "_" + e.svcFieldName.replace(/ /g, "_") : svcFieldId += "_" + fieldId;
        }
        row = "";
        label = [e.svcFieldName, isJobId ? requiredLabel() : ""].join('');
        toolTip = e.Description_Txt;

        if (e.IsMandatory == 1) {
            isMandatory = true;
            e.required = true;
        }

        if (e.DataType !== null && e.DataType !== undefined) {
            if (e.DataType.toLowerCase() == "lov") {
                if (model.FieldLOV != null) {
                    var lstItems = model.FieldLOV.filter(function (o) { return o.svcFieldId == e.svcFieldID });
                    if (e.svcFieldName == "Status") sessionStorage.setItem('statusFieldId', fieldId);
                    var control = ["<select data-toggle='tooltip' data-trigger='hover' data-placement='top' title='", toolTip, "' class='form-control attrib-input select-", fieldId, "' onchange='getSelectedValue(this)' name='", svcFieldId, "' id='", fieldId, "' ", isMandatory ? requiredAttr : "", "> "];
                    if ((serviceAreaCategory == 'Others') && e.svcFieldName == 'Status') lstItems = StatusOthers;
                    $.each(lstItems, function (i, e) {
                        //if (e.FieldText == 'Completed') sessionStorage.setItem('completedStatusId', i + 1);
                        var id = e.FieldId;
                        var text = e.FieldText;
                        if (serviceAreaCategory == 'Others') {
                            id = i + 1;
                            text = lstItems[i];
                        }
                        //if (text == 'Completed') sessionStorage.setItem('completedStatusId', i + 1);
                        if (text == 'Completed') sessionStorage.setItem('completedStatusId', id);

                        //else control.push(["<option value='", e.FieldId, "'>", e.FieldText, "</option>"].join(''));
                        control.push(["<option value='", id, "'>", text, "</option>"].join(''));
                    });
                    row = ["<tr><td>", label, isMandatory ? requiredLabel() : "", control.join(''), "</td></tr>"].join('');
                }
            }
            else if (e.DataType.toLowerCase() == "date")
                row = ["<tr><td>", generateDateFormControl(e, svcFieldId)].join('');
            else if (e.DataType.toLowerCase() == "time")
                row = ["<tr><td>", generateTimeFormControl(e, svcFieldId)].join('');
            //else if (e.svcFieldName.toLowerCase().indexOf('commentary') > -1)
            //row = ["<tr><td colspan='4'>", label, isMandatory ? requiredLabel() : "", "<textarea class='form-control' height='4' name='", svcFieldId, "' id='", fieldId, "' placeholder='", e.svcFieldName, "' value='", isJobId ? seq : "", "'", isJobId ? " disabled=disabled " : " ", isJobId ? requiredAttr : "", "/></td></tr>"].join('');
            else
                row = ["<tr><td>", label, isMandatory ? requiredLabel() : "", "<input class='form-control attrib-input' type='text' rel='txtTooltip' title='", toolTip, "' data-toggle='tooltip' data-placement='bottom' name='", svcFieldId, "' id='", fieldId, "' placeholder='", e.svcFieldName, "' value='", isJobId ? seq : "", "'", isJobId ? " disabled=disabled " : " ", isJobId ? requiredAttr : "", "/></td></tr>"].join('');
        }

        if (e.Shade == "T")
            shade = " btn-info "
        else if (e.Shade == "A")
            shade = " btn-warning "
        else
            shade = "";

        if (e.FieldType == 0 || e.FieldType == "0") {
            attribCount++;
            tblDataAttrib.push(row);

        //    let colSpan = 1;//(isLast && (i % 2 == 0)) ? 2 : 1;
        //    attribData.push(
        //        [
        //            /*"<td width='32%' colspan=", colSpan, ">", e.svcFieldName, "</td>",*/
        //            "<td width='14%'>",
        //            row.replace("<tr><td>", "").replace("</td></tr>", ""),
        //            "</td>"].join(''));
        //    attribIdx++;
        //    if (attribIdx % 2 == 0 || (attribIdx % 2 > 0 && attribIdx >= noAttribSvcAreaSum)) {
        //        tblDataAttrib.push(["<tr>", attribData.join(''), "</tr>"].join(''));
        //        attribData = [];
        //    }
        }
        else {
            let colSpan = 1;//(isLast && (i % 2 == 0)) ? 2 : 1;
            metricData.push(
                ["<td width='32%' colspan=", colSpan, ">", e.svcFieldName, "</td>",
                    "<td width='14%'>",
                    "<input class='form-control", shade, "' type='text' name='" + svcFieldId, "' id='field", e.svcFieldNumber, "' title='", e.Description_Txt, "' value='", defaultVal, "' ", " onkeyup='checkNum(this,\"d\")' />",
                    "</td>"].join(''));
            metricIdx++;
            if (metricIdx % 2 == 0 || (metricIdx % 2 > 0 && metricIdx >= noAttribSvcAreaSum)) {
                tblDataMetric.push(["<tr>", metricData.join(''), "</tr>"].join(''));
                metricData = [];
            }
        }

    });

    if (isClientWithDefaultValue)
        tblDataMetric.push(["<tr>", "<td colspan='4'>Note:<br/><textarea class='form-control' height='4' id='remarks'  placeholder='Notes for ", $("#ddlServiceArea option:selected").text(), "' /></td>", "</tr>"].join(''));

    if (isUpdate) {
        tbMetric.find("tbody tr").remove();
        tbAttrib.find("tbody tr").remove();
    }

    tbMetric.find("tbody").append(tblDataMetric.join(''));
    tbAttrib.find("tbody").append(tblDataAttrib.join(''));

    $(".glyphicon-plus-btn, .glyphicon-home-btn").removeClass("hidden");
    if (isUpdate) {
        //$('*[class*="time-StringField"]').timepicker('setTime', null);

        //POPULATE VALUES
        var input = $("input[id^=StringField]");    //ATRIB
        var df = document.createDocumentFragment();
        //console.log(model.ServiceAreaFields);
        $.each(input, function (i, e) {
            var skip = false;
            var attribValue = model.Transaction[e.id];
            if (e.placeholder.toLowerCase().indexOf("time") >= 0) {
                try {
                    if (attribValue == "" || attribValue == null) {
                        attribValue = "";
                        skip = true;
                    }
                    //else if (isNaN(Date.parse(attribValue)))
                    //attribValue = attribValue.slice(-8);//.replace(/[AP]M/g, " $&");
                }
                catch (e) {
                    attribValue = "";
                }
            }
            else if (e.placeholder.toLowerCase().indexOf("date") >= 0) {
                if (isNaN(Date.parse(attribValue))) {
                    attribValue = attribValue == "" || attribValue == null ? "" : formatDate(attribValue.replace(attribValue.slice(-7), ""));	//formatDate(Date.parse(attribValue.replace(attribValue.slice(-7), "")));
                }
                else {
                    attribValue = attribValue == "" ? "" : formatDate(attribValue);
                }
            }

            if (!skip) $(e).val(attribValue);

        });

        input = $("select[id^=StringField]");    //ATRIB SELECT
        $.each(input, function (i, e) {
            $(e).val(model.Transaction[e.id]);
        });

        var input = $("input[id^=field]");          //METRIC
        $.each(input, function (i, e) { $(e).val(model.Transaction[e.id]) });

        $("#JOB_ID").val(model.Transaction.JOB_ID);

        showForm();

        //$("input:text").focus(function () { $(this).select(); });
    }

    if (isNew) {
        //POPULATE VALUES
        var input = $("input[id^=StringField]");    //ATRIB
        var df = document.createDocumentFragment();
        var currentDate = new Date().toLocaleDateString();
        var d_time = new Date().toLocaleTimeString();

        $.each(input, function (i, e) {
            var attribValue = "";
            if (e.placeholder.toLowerCase().indexOf("time") >= 0) {
                try {
                    if (e.title.toLowerCase().indexOf("must have data to save") > -1)
                        attribValue = d_time;
                        //attribValue = currentDate.slice(-8).replace(/[AP]M/g, " $&");
                        //attribValue = currentDate.slice(-8);//.replace(/[AP]M/g, " $&")
                //    if (attribValue == "" || attribValue == null)
                //        attribValue = "";
                //    else if (isNaN(Date.parse(attribValue)))
                //        attribValue = attribValue.slice(-8);//.replace(/[AP]M/g, " $&");
                }
                catch (e) {
                    attribValue = "";
                }
            }
            else if (e.placeholder.toLowerCase().indexOf("date") >= 0) {
                if (e.title.toLowerCase().indexOf("must have data to save") > -1)
                    //attribValue = (currentDate.slice(-10), "");
                    attribValue = currentDate;
                //if (isNaN(Date.parse(attribValue))) {
                //    attribValue = attribValue == "" || attribValue == null ? "" : formatDate(attribValue.replace(attribValue.slice(-7), ""));	//formatDate(Date.parse(attribValue.replace(attribValue.slice(-7), "")));
                //}
                //else {
                //    attribValue = attribValue == "" ? "" : formatDate(attribValue);
                //}
            }
            $(e).val(attribValue);
        });

        input = $("select[id^=StringField]");    //ATRIB SELECT
        $.each(input, function (i, e) {
            $(e).val(null);
        });

        input = $("input[id^=field]");          //METRIC
        $.each(input, function (i, e) { $(e).val(null) });

        input = $("textarea[id^=StringField]");          //METRIC
        $.each(input, function (i, e) { $(e).val(null) });

        $("#JOB_ID").val('Auto-Generated');

        showForm();

        //$("input:text").focus(function () { $(this).select(); });
    }
    ////APPLY flatpickr FIELD PROPERTIES
    $('*[class*="date-StringField"]').flatpickr({
    //$('#flatpicker').flatpickr({
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
    });

    $('*[class*="time-StringField"]').flatpickr({
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
    });

    //$('*[class*="date-StringField"]').datepicker({
    //    autoclose: true,
    //    startDate: "-3m",
    //    endDate: '+3m',
    //    immediateUpdates: true,
    //    maxViewMode: 0,
    //    disableTouchKeyboard: true,
    //    orientation: 'bottom', showOnFocus: true, todayHighlight: true,
    //    zIndexOffset: 9
    //});

    //initializeTimeControl();
    //initializeDateControl();

    if (isNew) { //initialize dropdown values
        $("select[id^=StringField]").val(-1);
    }

    var isEqual = attribCount == tbAttrib.find("tbody tr").length && 1 == ($("select[id^=StringField]").length > 0 ? $("select[id^=StringField]")[0].length > 0 ? 1 : 0 : 1);
    if (isEqual) {
        $(".div-signin-loading-attrib").hide();
    }
    return isEqual;
}


//POPULATE METRIC FIELDS
function serviceAreaCallback(data) {
    //if (data.length == 0) return;
    $(".div-signin-loading-attrib").show();
    //var i = 0;
    var to = setInterval(function () {
        result = populateForms(data);
        if (result) {
            $(".div-signin-loading-attrib").hide();
            clearInterval(to);
        }
        //i++;
    }, 100);
}

function initializeTimeControl() {
    var now = new Date();
    $('*[class*="time-StringField"]').timepicker({ disableMousewheel: false, template: 'dropdown', minuteStep: 5 });//, defaultTime: 'current' });
    if (isNew) {
        $('*[class*="time-StringField"]').val("");
        //$('*[class*="time-StringField"]').timepicker('setTime', null);
    }

    if (isUpdate)
        return;

    return;

    //$('*[class*="time-StringField"]').timepicker('setTime', now.getHours() + ":" + now.getMinutes());
}

function ajaxRequest(targetElement, url, parameter) {
    isUpdate = false;
    isConfirmDelete = false;
    defNavIcons = $(".glyphicon-plus-btn, .glyphicon-home-btn");
    defNavIcons.removeClass("hidden").show();
    if ($("ddlServiceArea").val() !== undefined) {
        if ($("#ddlServiceArea").val().match(pattern) != null)
            defNavIcons.addClass("hidden").hide();
    }

    $.ajax({
        url: url,
        method: "POST",
        data: { Id: parameter.Id, UserName: parameter.email },
        dataType: "json",
        headers: headerToken,
        //xhrFields: {withCredentials:true},
        success: function (data) {
            if (targetElement == "#ddlClient")
                sessionStorage.setItem("clientData", JSON.stringify(data));

            populateClientHierarchyData(data, targetElement);

            $(targetElement).focus();
        },
        error: handleXHRError
    });
}

function clearProductionLog() {
    //let oCols = setupGenericColumns(model, false);
    //setupGrid(model, false, 0, oCols);
    model.GenericTransactions = [];
    setupGrid(model, false, 0, []);
    //hideProductionDetails();
}

// FROM SO: Restricts input for the given textbox to the given inputFilter function.
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
        textbox.addEventListener(event, function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    });
}

function formatDate(date) {
    if (date == "" || date == null) return "";
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}


/**
 * detect IEEdge
 * returns version of IE/Edge or false, if browser is not a Microsoft browser
 */
function detectIEEdge() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

//IE 11 SUPPORT

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


var DataModel =
    /*#__PURE__*/
    function () {
        function DataModel() {
            _classCallCheck(this, DataModel);

            this.Model = [];
            this.observers = [];
        }

        _createClass(DataModel, [{
            key: "updateModel",
            value: function updateModel(data) {
                this.Model = data;
                this.notifyObserver(this.Model);
            }
        }, {
            key: "addObserver",
            value: function addObserver(o) {
                this.observers.push(o);
            }
        }, {
            key: "removeObserver",
            value: function removeObserver(o) {
                var idx = this.observers.indexOf(o);
                if (idx > -1) this.observers.splice(idx, 1);
            }
        }, {
            key: "notifyObserver",
            value: function notifyObserver() {
                for (var i = 0; i < this.observers.length; i++) {
                    this.observers[i].update(this.Model);
                }
            }
        }]);

        return DataModel;
    }();

var TransactionGridObserver =
    /*#__PURE__*/
    function () {
        function TransactionGridObserver(elementId) {
            _classCallCheck(this, TransactionGridObserver);

            this.elementId = elementId;
        }

        _createClass(TransactionGridObserver, [{
            key: "update",
            value: function update(data) {
                $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
            }
        }]);

        return TransactionGridObserver;
    }();


var GenericTransactionGridObserver =
    /*#__PURE__*/
    function () {
        function GenericTransactionGridObserver(elementId) {
            _classCallCheck(this, GenericTransactionGridObserver);

            this.elementId = elementId;
        }

        _createClass(GenericTransactionGridObserver, [{
            key: "update",
            value: function update(data) {
                $(".div-signin-loading, .div-signin-loading div, .div-signin-loading div img").addClass("hidden").hide();
            }
        }]);

        return GenericTransactionGridObserver;
    }();

//init
var dataModel = new DataModel();
var gridGenericObs = new GenericTransactionGridObserver('tblSavedData');
var gridObs = new TransactionGridObserver('tblSavedData');
var didChange = false;
var observer = new MutationObserver(function (mutations) {


    mutations.forEach(function (mutation) {
        if (mutation.type == "attributes") {
            didChange = true;
            $(".datepicker-days").hide();
            $(".datepicker").css("display", "");
            //$(".datepicker").hide();            
            //if ($(".datepicker-months").css("display") == "none")
            //    $(".prod-date").click();

            //    didChange = true;
            //    $("#ddlClient").focus();
            //    console.log("did change");
            //} 
            //console.log($(".datepicker-months").css("display"));
        }
    });




});

//brb layout manager
function hideData() {
    var x = document.getElementsByClassName("w2ui-tb-text w2ui-tb-caption");
    if (x[7]) {
        if (x[7].textContent === 'Hide Details') {
            w2ui['layout'].toggle('right', window.instant);
            x[7].textContent = 'Show Details';
            var i = document.getElementsByClassName("w2ui-tb-image");
            i[7].children[0].className = "fa fa-arrow-left";
        }
    }
}

function showData() {
    var x = document.getElementsByClassName("w2ui-tb-text w2ui-tb-caption");
    if (x[7]) {
        if (x[7].textContent === 'Show Details') {
            w2ui['layout'].toggle('right', window.instant);
            x[7].textContent = 'Hide Details';
            var i = document.getElementsByClassName("w2ui-tb-image");
            i[7].children[0].className = "fa fa-arrow-right";
        }
    }
}

function toggleShowData() {
    w2ui['layout'].toggle('right', window.instant);
    var x = document.getElementsByClassName("w2ui-tb-text w2ui-tb-caption");
    if (x[7]) {
        if (x[7].textContent === 'Show Details') {
            x[7].textContent = 'Hide Details';
        } else {
            x[7].textContent = "Show Details";
        }
        var i = document.getElementsByClassName("w2ui-tb-image");
        i[7].children[0].className = x[7].textContent === 'Show Details' ? "fa fa-arrow-left" : "fa fa-arrow-right"
    }
}

function hideSelectors() {
    $("#selector-panel").hide();
    var x = document.getElementsByClassName("w2ui-tb-text w2ui-tb-caption");
    if (x[5]) {
        x[5].textContent = "Show Selectors";
        var i = document.getElementsByClassName("w2ui-tb-image");
        if (i) i[5].children[0].className = "fa fa-arrow-right";
    }
}

//function showSelectors() {
//    var x = document.getElementsByClassName("w2ui-tb-text w2ui-tb-caption");
//    if (x[5]) {
//        x[5].textContent = "Hide Selectors";
//        $("#selector-panel").show();
//        var i = document.getElementsByClassName("w2ui-tb-image");
//        i[5].children[0].className = "fa fa-arrow-left";
//    }
//}

function toggleExpandDetails() {
    var x = document.getElementsByClassName("w2ui-tb-text w2ui-tb-caption");
    if (x[8].textContent === 'Expand Details') {
        x[8].textContent = 'Restore Details to Default Size';
        w2ui['layout'].sizeTo('right', 1000);
    } else {
        x[8].textContent = "Expand Details";
        w2ui['layout'].sizeTo('right', 700);
    }
    var i = document.getElementsByClassName("w2ui-tb-image");
    i[8].children[0].className = x[8].textContent === 'Expand Details' ? "fa fa-arrow-left" : "fa fa-arrow-right"
}

function toggleShowSelectors() {
    var x = document.getElementsByClassName("w2ui-tb-text w2ui-tb-caption");
    if (x[5].textContent === 'Show Selectors') {
        x[5].textContent = 'Hide Selectors';
        $("#selector-panel").show();
    } else {
        x[5].textContent = "Show Selectors";
        $("#selector-panel").hide();
        toggleExpandDetails();
    }
    var i = document.getElementsByClassName("w2ui-tb-image");
    i[5].children[0].className = x[5].textContent === 'Show Selectors' ? "fa fa-arrow-right" : "fa fa-arrow-left"
}

//brb new 
function ajaxGetRequest(targetElement, url) {
    sessionToken = localStorage.getItem("accessToken");
    headerToken = {
        "Authorization": "Bearer " + sessionToken
    };

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            if (targetElement === "userFolders") sessionStorage.setItem(targetElement.replace('#ddl', ''), data);
            else sessionStorage.setItem(targetElement.replace('#ddl', ''), JSON.stringify(data));

            if (targetElement == "userProfile") {
                if (data.AccountType === 'M' || data.AccountType === 'A') {
                    document.querySelector("#execDashboard").hidden = false;
                    document.querySelector("#changeUserSetting").hidden = false;
                    //document.querySelector("#adminMenu").hidden = false;
                }

                //if (data.AccessGoldReports == 1) w2ui['toolbarAdmin'].enable('goldReports');
                if (data.AccessGoldReports == 1) document.querySelector("#goldReports").hidden = false;
                //if (data.MstrUser == 1) w2ui['toolbarAdmin'].enable('platinumReports');
                if (data.MstrUser == 1) document.querySelector("#enterpriseReports").hidden = false;
                ////if (data.CanUpload == 1) w2ui['toolbarAdmin'].enable('uploadFiles');
                if (data.CanUpload == 1) document.querySelector("#uploadFiles").hidden = false;

                if (data.AccountType !== 'A') {
                    w2ui['toolbarAdmin'].hide('adminMenu');
                } else {
                    isAdmin = true;
                ////    w2ui['toolbarAdmin'].enable('uploadFiles');
                ////    w2ui['toolbarAdmin'].show('uploadFiles');
                }
            }
        },
        error: handleXHRError
    });
}

function ajaxPostRequest(targetElement, url, parameter) {

    $.ajax({
        url: url,
        method: "POST",
        data: { Id: parameter.Id, UserName: parameter.email },
        dataType: "json",
        headers: headerToken,
        //xhrFields: {withCredentials:true},
        success: function (data) {
            if (targetElement == "#sidebar") {
                localStorage.setItem("userSavedPreferences", JSON.stringify(data));
                insertItems(data);
            }
        },
        error: handleXHRError
    });
}

function insertItems(data) {
    const nodes = data.map(item => {
        const node = {};
        node.id = item.Id;
        node.text = item.Value;
        //node.icon = 'material-icons ic-bookmark';
        node.img = 'been-here-icon';
        return node;
    })

    //w2ui.sidebar.insert('level-1', null, nodes);
    //w2ui.sidebar.expand('level-1');
}

function reloadData() {
    $("#gridContainer").dxDataGrid("instance").refresh();

}

function downloadAllCsvData() {
    var exportData = [];
    var header = ['"TransactionId"\t"ProductionDate"\t"CreatedBy"\t"CreatedDate"\t"UpdatedBy"\t"UpdatedDate"\t"Account"\t"Site"\t"Location"\t"ServiceArea"\t"JOB_ID"'];
    var attrKeys = {};
    var metricKeys = {};
    for (var c = 0; c < model.ServiceAreaFields.length; c++) {
        if (model.ServiceAreaFields[c].svcFieldName.indexOf('Status') == -1 && model.ServiceAreaFields[c].svcFieldName.indexOf('Date Completed') == -1 
            && model.ServiceAreaFields[c].svcFieldName.indexOf('Completed Date') == -1 && (model.ServiceAreaFields[c].isMandatory == 0 || model.ServiceAreaFields[c].isMandatory == undefined)
            && model.ServiceAreaFields[c].IsVisible == true && model.ServiceAreaFields[c].Description_Txt == null && model.ServiceAreaFields[c].Constraint_Txt == null
        ) {
            if (model.ServiceAreaFields[c].FieldType == "0" || model.ServiceAreaFields[c].FieldType == 0) {
                attrKeys[model.ServiceAreaFields[c].svcFieldNumber] = '"' + model.ServiceAreaFields[c].svcFieldName + '"';
            }
            else {
                metricKeys[model.ServiceAreaFields[c].svcFieldNumber] = '"' + model.ServiceAreaFields[c].svcFieldName + '"';
            }
        }
    }
    if (gridTransactions && gridTransactions.length > 0) {
        for (var i = 0; i < gridTransactions.length; i++) {
            var attrib = [];
            var metric = [];

            for (var a in attrKeys) {
                if (i == 0) header.push(attrKeys[a]);

                var val = gridTransactions[i]["StringField" + a];
                var lovObj = model.ServiceAreaFields.filter(function (o) { return o.svcFieldNumber == a && o.DataType.toLowerCase() == "lov" });

                if (lovObj.length > 0) {
                    val = model.FieldLOV.filter(function (o) { return o.svcFieldId == lovObj[0].svcFieldID && o.FieldId == val });
                    if (val.length > 0)
                        val = val[0].FieldText;
                    else
                        val = model.Transaction['StringField' + a];
                }

                //if (lovObj.length > 0) {
                //    val = model.FieldLOV.filter(function (o) { return o.svcFieldId == lovObj[0].svcFieldID && o.FieldId == val });
                //    if (val.length > 0)
                //        val = val[0].FieldText;
                //    else {
                //        val = gridTransactions[i]["StringField" + a];
                //        if (lovObj[0].svcFieldName == "Status" && !Number.isNaN(val)) val = StatusOthers[+val - 1];
                //    }
                //}
                val = '"' + val + '"';
                attrib.push(val);

            }
            for (var m in metricKeys) {
                if (i == 0) header.push(metricKeys[m]);

                metric.push('"' + gridTransactions[i]["field" + m] + '"');
            }

            if (i == 0) exportData.push(header.join("\t"));

            exportData.push('"' + [gridTransactions[i].TransactionId + '"',
            '"' + gridTransactions[i].ProductionDate + '"',
            '"' + gridTransactions[i].UserName + '"',
            '"' + gridTransactions[i].CreationDate + '"',
            '"' + gridTransactions[i].UpdateUserID + '"',
            '"' + gridTransactions[i].UpdateDate + '"',
            '"' + gridTransactions[i].AccountName + '"',
            '"' + gridTransactions[i].SiteName + '"',
            '"' + gridTransactions[i].LocationName + '"',
            '"' + gridTransactions[i].ServiceAreaName + '"',
            '"' + gridTransactions[i].JOB_ID + '"',
            attrib.join("\t"),
            metric.join("\t")
            ].join("\t"));
        }
    }

    return exportData.join('\n');
}

function generateTranCsvData() {
    //if (model.Transactions.Model == null) {
    //    stopDownloadCsv();
    //    return "";
    //}

    var exportData = [];
    var header = ["TransactionId", "ProductionDate", "CreatedBy", "CreatedDate", "UpdatedBy", "UpdatedDate", "Account", "Site", "Location", "ServiceArea", "JOB_ID"];
    var attrKeys = {};
    var metricKeys = {};
    for (var c = 0; c < model.ServiceAreaFields.length; c++) {

        if (model.ServiceAreaFields[c].IsVisible) {
            if (model.ServiceAreaFields[c].FieldType == "0" || model.ServiceAreaFields[c].FieldType == 0) {
                attrKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
            }
            else {
                metricKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
            }
        }
    }

    var attrib = [];
    var metric = [];

    for (var a in attrKeys) {
        //if (i == 0) header.push(attrKeys[a]);
        header.push(attrKeys[a]);

        var val = model.Transaction.StringField + a;
        var lovObj = model.ServiceAreaFields.filter(function (o) { return o.svcFieldNumber == a && o.DataType.toLowerCase() == "lov" });

        if (lovObj.length > 0) {
            val = model.FieldLOV.filter(function (o) { return o.svcFieldId == lovObj[0].svcFieldID && o.FieldId == val });
            if (val.length > 0)
                val = val[0].FieldText;
            else
                val = model.Transaction['StringField' + a];
        }
        //brb 6/3/2022
        if (val != undefined || val != null)
        attrib.push(val.replace(/,/g, ';'));
        //brb 6/3/2022
        //attrib.push(val);

    }
    for (var m in metricKeys) {
        //if (i == 0) header.push(metricKeys[m]);
        header.push(metricKeys[m]);

        metric.push(model.Transaction['field' + m]);
    }

    //if (i == 0) exportData.push(header.join(","));
    exportData.push(header.join(","));

    exportData.push([model.Transaction.TransactionId,
    model.Transaction.ProductionDate,
    model.Transaction.UserName,
    model.Transaction.CreationDate,
    model.Transaction.UpdateUserID,
    model.Transaction.UpdateDate,
    model.Transaction.AccountName,
    model.Transaction.SiteName,
    model.Transaction.LocationName,
    model.Transaction.ServiceAreaName,
    "" + model.Transaction.JOB_ID,
    attrib.join(","),
    metric.join(",")
    ].join(","));

    //}
    return exportData.join('\n');
}

function generateCsvData(allVisible) {

    var exportData = [];
    var header = ["TransactionId", "ProductionDate", "CreatedBy", "CreatedDate", "UpdatedBy", "UpdatedDate", "Account", "Site", "Location", "ServiceArea", "JOB_ID"];
    var attrKeys = {};
    var metricKeys = {};
    for (var c = 0; c < model.ServiceAreaFields.length; c++) {

        if (allVisible) {
            if (model.ServiceAreaFields[c].IsVisible) {
                if (model.ServiceAreaFields[c].FieldType == "0" || model.ServiceAreaFields[c].FieldType == 0) {
                    attrKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
                else {
                    metricKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
            }
        } else {
            if (model.ServiceAreaFields[c].IsLogVisible) {
                if (model.ServiceAreaFields[c].FieldType == "0" || model.ServiceAreaFields[c].FieldType == 0) {
                    attrKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
                else {
                    metricKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
            }
        }

    }

    if (model.Transactions && model.Transactions.length > 0) {
        for (var i = 0; i < model.Transactions.length; i++) {
            var attrib = [];
            var metric = [];

            for (var a in attrKeys) {
                if (i == 0) header.push(attrKeys[a]);

                var val = model.Transactions[i]["StringField" + a];
                var lovObj = model.ServiceAreaFields.filter(function (o) { return o.svcFieldNumber == a && o.DataType.toLowerCase() == "lov" });

                if (lovObj.length > 0) {
                    val = model.FieldLOV.filter(function (o) { return o.svcFieldId == lovObj[0].svcFieldID && o.FieldId == val });
                    if (val.length > 0)
                        val = val[0].FieldText;
                    else {
                        val = model.Transactions[i]["StringField" + a];
                        if (lovObj[0].svcFieldName == "Status" && !Number.isNaN(val)) val = StatusOthers[+val - 1];
                    }
                }
                //brb 6/3/2022
                if (val != undefined || val != null)
                attrib.push(val.replace(/,/g, ';'));
                //brb 6/3/2022

            }
            for (var m in metricKeys) {
                if (i == 0) header.push(metricKeys[m]);

                metric.push(model.Transactions[i]["field" + m]);
            }

            if (i == 0) exportData.push(header.join(","));

            exportData.push([model.Transactions[i].TransactionId,
            model.Transactions[i].ProductionDate,
            model.Transactions[i].UserName,
            model.Transactions[i].CreationDate,
            model.Transactions[i].UpdateUserID,
            model.Transactions[i].UpdateDate,
                model.Transactions[i].AccountName.replace(/,/g, ''),
                + model.Transactions[i].SiteName.replace(/,/g,''),
                model.Transactions[i].LocationName.replace(/,/g, ''),
                model.Transactions[i].ServiceAreaName.replace(/,/g, ''),
            "" + model.Transactions[i].JOB_ID,
            attrib.join(","),
            metric.join(",")
            ].join(","));
        }
    }

    return exportData.join('\n');


}

function generateAllCsvData(allVisible) {

    var exportData = [];
    var header = ["TransactionId", "ProductionDate", "CreatedBy", "CreatedDate", "UpdatedBy", "UpdatedDate", "Account", "Site", "Location", "ServiceArea", "JOB_ID"];
    var attrKeys = {};
    var metricKeys = {};
    for (var c = 0; c < model.ServiceAreaFields.length; c++) {

        if (allVisible) {
            if (model.ServiceAreaFields[c].IsVisible) {
                if (model.ServiceAreaFields[c].FieldType == "0" || model.ServiceAreaFields[c].FieldType == 0) {
                    attrKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
                else {
                    metricKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
            }
        } else {
            if (model.ServiceAreaFields[c].IsLogVisible) {
                if (model.ServiceAreaFields[c].FieldType == "0" || model.ServiceAreaFields[c].FieldType == 0) {
                    attrKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
                else {
                    metricKeys[model.ServiceAreaFields[c].svcFieldNumber] = model.ServiceAreaFields[c].svcFieldName;
                }
            }
        }

    }

    if (gridTransactions && gridTransactions.length > 0) {
        for (var i = 0; i < gridTransactions.length; i++) {
            var attrib = [];
            var metric = [];

            for (var a in attrKeys) {
                if (i == 0) header.push(attrKeys[a]);

                var val = gridTransactions[i]["StringField" + a];
                var lovObj = model.ServiceAreaFields.filter(function (o) { return o.svcFieldNumber == a && o.DataType.toLowerCase() == "lov" });

                if (lovObj.length > 0) {
                    val = model.FieldLOV.filter(function (o) { return o.svcFieldId == lovObj[0].svcFieldID && o.FieldId == val });
                    if (val.length > 0)
                        val = val[0].FieldText;
                    else {
                        val = gridTransactions[i]["StringField" + a];
                        if (lovObj[0].svcFieldName == "Status" && !Number.isNaN(val)) val = StatusOthers[+val - 1];
                    }
                }
                //brb 6/3/2022
                if (val != undefined || val != null)
                attrib.push(val.replace(/,/g, ';'));
                //brb 6/3/2022
            }
            for (var m in metricKeys) {
                if (i == 0) header.push(metricKeys[m]);

                metric.push(gridTransactions[i]["field" + m]);
            }

            if (i == 0) exportData.push(header.join(","));

            exportData.push('"' + [gridTransactions[i].TransactionId + '"',
                '"' + gridTransactions[i].ProductionDate + '"',
                '"' + gridTransactions[i].UserName + '"',
                '"' + gridTransactions[i].CreationDate + '"',
                '"' + gridTransactions[i].UpdateUserID + '"',
                '"' + gridTransactions[i].UpdateDate + '"',
                '"' + gridTransactions[i].AccountName + '"',
                '"' + gridTransactions[i].SiteName + '"',
                '"' + gridTransactions[i].LocationName + '"',
                '"' + gridTransactions[i].ServiceAreaName + '"',
                '"' + gridTransactions[i].JOB_ID + '"',
            attrib.join(","),
            metric.join(",")
            ].join(","));
        }
    }

    return exportData.join('\n');
}

function setSelectors(areaId) {
    if (areaId == null) return;
    if (areaId == undefined) areaId = localStorage.getItem('areaId');
    //if (isFiltered) w2ui.sidebar.select(areaId);
    serviceAreaId = areaId.split('_')[0];
    var newSavedData = model.GenericTransactions.filter(function (obj) { return obj.ServiceAreaId == serviceAreaId });

    $("#ddlSite, #ddlLocation, #ddlServiceArea").find('option').remove();   //exclude #ddlClient
    if (newSavedData.length == 0) {
        let savedSelectorsArr = JSON.parse(localStorage.getItem('userSavedPreferences'));
        if (savedSelectorsArr && savedSelectorsArr.length > 0) {
            let savedSelectors = savedSelectorsArr.filter(function (obj) { return obj.Id == areaId });
            if (savedSelectors.length == 0) savedSelectors = JSON.parse(localStorage.getItem('userSavedPreferences'));
            let siteName = savedSelectors[0].Value.split('|')[1];
            let locationName = savedSelectors[0].Value.split('|')[2];
            let serviceAreaName = savedSelectors[0].Value.split('|')[3];
            $("#ddlSite").append(["<option value=", serviceAreaId, ">", siteName, "</option>"].join(''));
            $("#ddlLocation").append(["<option value=", serviceAreaId, ">", locationName, "</option>"].join(''));
            $("#ddlServiceArea").append(["<option value=", serviceAreaId, ">", serviceAreaName, "</option>"].join(''));
        }
    } else {
        //var d = formatDate(newSavedData[0].ProductionDate).split('-');                  //ProductionDate
        //var yyyy = d[0];
        //var mm = d[1];
        //var dd = d[2];
        //$("#txtProductionDate").val(mm + '/' + dd + '/' + yyyy);
        $("#ddlClient").val(newSavedData[0].AccountId);
        $("#ddlSite").append(["<option value=", newSavedData[0].SiteId, ">", newSavedData[0].SiteName, "</option>"].join(''));
        $("#ddlLocation").append(["<option value=", newSavedData[0].LocationId, ">", newSavedData[0].LocationName, "</option>"].join(''));
        $("#ddlServiceArea").append(["<option value=", newSavedData[0].ServiceAreaId, ">", newSavedData[0].ServiceAreaName, "</option>"].join(''));
        //brb save model data
        //sessionStorage.setItem('model', JSON.stringify(model));

        pageNumber = 0;
    }

}

function populateSelectorOptions(targetElement) {
    //var selData = [];
    //var defaultOpt = '<option value="--- Select ' + targetElement + '---">--- Select ' + targetElement + ' ---</option>';
    //$(targetElement).find('option').remove();


    //if (targetElement == "#ddlSite") {
    //    $(targetElement + ", #ddlLocation, #ddlServiceArea").find('option').remove();
    //    $(["#ddlLocation", "#ddlServiceArea"]).each(function (i, e) {
    //        var replace = targetElement;
    //        var re = new RegExp(replace, "g");
    //        $(e).append(defaultOpt.replace(re, e).replace(/#ddl/g, ""));
    //    });

    //}

    var selData = [];
    var defaultOpt = '<option value="--- Select ' + targetElement + '---">--- Select ' + targetElement + ' ---</option>';
    $(targetElement).find('option').remove();

    selData.push(defaultOpt);
    selData.unshift(defaultOpt.replace(/#ddl/g, ""));
    $(targetElement).append(selData.join(''));


}

function getSelectedValue(selectObject) {
    sessionStorage.setItem(selectObject.name, selectObject.value);
    var completedStatus = +sessionStorage.getItem('completedStatusId');
    var statusField = sessionStorage.getItem('statusFieldId');

    //if (selectObject.name.indexOf(statusField) > -1 && selectObject.value != null && selectObject.value.indexOf(completedStatus) == -1 ) {
    //    var dateCompletedField = '#' + sessionStorage.getItem('dateCompletedFieldId');
    //    //$(dateCompletedField).val('').change();
    //    //$('*[class*="date-StringField"]').datepicker('update', null);
    //    $(dateCompletedField).datepicker('setDate', null);
    //}

    var status = $('#' + statusField).val();
    if (selectObject.placeholder && selectObject.placeholder.indexOf('Date Completed') > -1 && selectObject.value != null) {
        if (status != completedStatus) {
            $('#' + statusField).val(completedStatus);
        }
    }

}

function replaceHeaderClass() {
    // column caption  
    $(".dx-header-filter-indicator").css("font-weight", "bold");
    $(".dx-datagrid-text-content.dx-text-content-alignment-right.dx-header-filter-indicator").removeClass("dx-text-content-alignment-right").addClass("dx-text-content-alignment-left");
    // filter & sort icon  
    $(".dx-column-indicators").css("float", "right");
    $(".dx-sort").css("float", "right");
    // header cell text alignment  
    $('[role="columnheader"]').css("text-align", "left");
    $('.dx-icon.dx-icon-export-excel-button').removeClass('dx-icon-export-excel-button').addClass('dx-icon-xlsx-icon');
    //var excelButton = document.getElementsByClassName("dx-datagrid-toolbar-button dx-datagrid-export-button dx-button dx-button-normal dx-button-mode-contained dx-widget dx-button-has-icon");
    //excelButton[0].title = "Export grid data to excel";
    //excelButton[0].text = "Export";
}


function changePassword(action) {
    //validate
    if ($("#txtOld").val() === "" || $("#txtOld").val() === null) {
        $("#lblMsg").css("color", "red");
        $("#lblMsg")[0].textContent = "Old Password is required";
        return;
    }
    if ($("#txtNew1").val() === "" || $("#txtNew1").val() === null) {
        $("#lblMsg").css("color", "red");
        $("#lblMsg")[0].textContent = "New Password is required";
        return;
    }
    if ($("#txtNew2").val() === "" || $("#txtNew2").val() === null) {
        $("#lblMsg").css("color", "red");
        $("#lblMsg")[0].textContent = "Please retype your Password";
        return;
    }
    if ($("#txtNew1").val() !== $("#txtNew2").val()) {
        $("#lblMsg").css("color", "red");
        $("#lblMsg")[0].textContent = "Passwords do not match";
        return;
    }

    //enforce password rule 
    var decimal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    if (txtNew1.value.match(decimal)) {
        //reset password
        $("#lblMsg")[0].textContent = "";
        var inputData = {
            "UserName": sessionStorage.getItem("email")
            , "NewPassword": $("#txtNew1").val()
            , "OldPassword": $("#txtOld").val()
        };

        $.ajax({
            url: baseUrl + "api/client/ChangePassword",
            method: "POST",
            data: inputData,
            dataType: "json",
            headers: headerToken,
            //xhrFields: {withCredentials:true},
            success: function (data) {
                if (data === 0) {
                    $("#lblMsg").css("color", "red");
                    $("#lblMsg")[0].textContent = "Username and Password does not match!";
                } else {
                    $("#lblMsg").css("color", "green");
                    $("#lblMsg")[0].textContent = "Password successfully changed.";
                    if (action === "change") {
                        var delayInMilliseconds = 2000; //2 seconds
                        setTimeout(function () {
                            //window.location.href = "index3.html";
                            w2popup.close();
                        }, delayInMilliseconds);
                    }
                }
            },
            error: handleXHRError
        });
    } else {
        $("#lblMsg").css("color", "red");
        $("#lblMsg")[0].textContent = "Password is between 8 to 15 characters having at least one lowercase letter, one uppercase letter, one numeric digit, and one special character";
    }

}

function changeProfile() {
    //validate
    const phoneInputField = document.querySelector("#txtPhone");
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    if (phoneInputField.value.match(phoneno)) {
        $("#lblProfileMsg")[0].textContent = "";
        var inputData = {
            "ContactNo": $("#txtPhone").val()
        };

        $.ajax({
            url: baseUrl + "api/client/UpdateUserProfile",
            method: "POST",
            data: inputData,
            dataType: "json",
            headers: headerToken,
            //xhrFields: {withCredentials:true},
            success: function (data) {
                getUserProfile(sessionStorage.getItem("email"));
                $("#lblProfileMsg").css("color", "green");
                $("#lblProfileMsg")[0].textContent = "Profile successfully updated.";
            },
            error: handleXHRError
        });
    }
    else {
        $("#lblProfileMsg").css("color", "red");
        $("#lblProfileMsg")[0].textContent = "Invalid phone number.";
    }
}

function changeUserSettings() {
    //validate
    if ($("#txtPageSize").val() === "" || $("#txtPageSize").val() === 0) {
        $("#lblSettingsMsg").css("color", "red");
        $("#lblSettingsMsg")[0].textContent = "Page Size is required and cannot be 0";
        return;
    }
    if ($("#txtValidPeriodForEdit").val() === "" || $("#txtValidPeriodForEdit").val() === 0) {
        $("#lblSettingsMsg").css("color", "red");
        $("#lblSettingsMsg")[0].textContent = "Valid Period For Edit is required and cannot be 0";
        return;
    }
    if ($("#txtValidPeriodForView").val() === "" || $("#txtValidPeriodForView").val() === 0) {
        $("#lblSettingsMsg").css("color", "red");
        $("#lblSettingsMsg")[0].textContent = "Valid Period For Viewing is required and cannot be 0";
        return;
    }

    $("#lblSettingsMsg")[0].textContent = "";
    let settings = JSON.parse(localStorage.getItem("userSettings"));
    settings.PageSize = $("#txtPageSize").val();
    settings.ValidPeriod = $("#txtValidPeriodForEdit").val();
    settings.ViewablePeriod = $("#txtValidPeriodForView").val();
    localStorage.setItem('userSettings', JSON.stringify(settings));
    userSettings = settings;
    $("#lblSettingsMsg").css("color", "green");
    $("#lblSettingsMsg")[0].textContent = "User settings saved successfully";
    if (isFiltered) w2ui.sidebar.click(localStorage.getItem('areaId'));
    else reloadAllUserTrans();
}

function popupChangePasswordForm() {
    $('#popupChangePassword').w2popup();
    $("#lblMsg")[0].textContent = "";
}

function popupChangeProfileForm() {
    $('#popupProfile').w2popup();
    //$("#lblProfileMsg")[0].textContent = "";
    $("#lblProfileMsg").textContent = "";

    let profile = JSON.parse(sessionStorage.getItem("userProfile"));

    let d_datetime = new Date(profile.LastLogin);
    let formatted_date = (d_datetime.getMonth() + 1) + "-" + d_datetime.getDate() + "-" + d_datetime.getFullYear() + " "
        + d_datetime.getHours() + ":" + d_datetime.getMinutes() + ":" + d_datetime.getSeconds();

    $("#txtName").val(profile.Name).change();
    $("#txtEmail").val(profile.Email).change();
    $("#optRole").val(profile.AccountType).change();
    $("#txtCompanyName").val(profile.CompanyName).change();
    $("#txtPhone").val(profile.ContactNo).change();
    $("#txtLastLogin").val(formatted_date).change();
    $("#txtManagerFullName").val(profile.ManagerFullName).change();
    $("#txtManagerUserName").val(profile.ManagerUserName).change();

    $('#chkUploadFiles').attr('checked', profile.CanUpload == 1 ? true : false);
    $('#chkGoldReports').attr('checked', profile.AccessGoldReports == 1 ? true : false);
    $('#chkPlatinum').attr('checked', profile.MstrUser == 1 ? true : false);
}

function popupAccountInfoForm() {
    if (!isAdmin) $("#changeAccountInfo").css("display", "none");
    $('#popupAccountInfo').w2popup();
    $("#lblAccountInfoMsg")[0].textContent = "";

    let accountInfos = JSON.parse(sessionStorage.getItem('accountInfos'));
    let accountInfo = accountInfos.filter(a => a.ClientID === +clientId).filter(b => b.SiteID == +siteId).filter(c => c.LocationID == +locationId).filter(d => d.ServiceAreaID == +serviceAreaId)[0];
    $("#txtAccountName").val(accountInfo.AccountName).change();
    $("#txtAccountEmail").val(accountInfo.Email).change();
    $("#txtAccountOwner").val(accountInfo.AccountOwner).change();
    $("#txtAccountPhone").val(accountInfo.PhoneNumber).change();
    $("#txtAccountComment").val(accountInfo.Comment).change();
    $("#txtSiteName").val(accountInfo.SiteName).change();
    $("#txtLocationName").val(accountInfo.LocationName).change();
    $("#txtContinent").val(accountInfo.Continent).change();
    $("#txtCountry").val(accountInfo.Country).change();
    $("#txtCBPSRegion").val(accountInfo.CBPSRegion).change();
    $("#txtState").val(accountInfo.State).change();
    $("#txtCity").val(accountInfo.City).change();
    $("#txtCampus").val(accountInfo.Campus).change();
    $("#txtBuilding").val(accountInfo.Building).change();
    $("#txtFloor").val(accountInfo.Floor).change();
    $("#txtArea").val(accountInfo.Area).change();
    $("#txtOffice").val(accountInfo.Office).change();
    $("#txtServiceAreaName").val(accountInfo.ServiceAreaName).change();
    $("#txtServiceAreaStatus").val(accountInfo.ServiceAreaStatus == true ? "Active" : "Inactive").change();
    $("#txtServiceAreaCategory").val(accountInfo.ServiceAreaCategory).change();

    $('#tab1').show();

}

function popupSettingsForm() {
    $('#popupSettings').w2popup();
    $("#lblSettingsMsg").textContent = "";
    $("#txtPageSize").val(userSettings.PageSize).change();
    $("#txtValidPeriodForEdit").val(userSettings.ValidPeriod).change();
    $("#txtValidPeriodForView").val(userSettings.ViewablePeriod).change();
}

function popupAppSettingsForm() {
    $('#popupAppSettings').w2popup();
    $("#lblAppSettingsMsg").textContent = "";
    $("#txtServerFolderPath").val(appSettings.ServerFolderPath).change();
    $("#txtReportsFolderLocation").val(appSettings.ReportsFolderLocation).change();
    $("#txtUploadsFolderLocation").val(appSettings.UploadsFolderLocation).change();
    $("#txtMaxUploadFileSize").val(appSettings.MaxUploadFileSize).change();
    $("#txtAllowedFileExtensions").val(appSettings.AllowedFileExtensions).change();
    $("#txtGridPageSize").val(appSettings.GridPageSize).change();
    $("#txtValidPeriodForViewing").val(appSettings.ValidPeriodForView).change();
    $("#txtValidPeriodForEditing").val(appSettings.ValidPeriodForEdit).change();
}

function reloadAllUserTrans() {
    serviceAreaId = 0;
    //var x = document.getElementsByClassName('w2ui-button');
    //x[9].hidden = true;
    localStorage.setItem('filter', '');
    localStorage.setItem('userMode', 'Query');
    localStorage.removeItem('storage');
    var grid = $("#gridContainer").dxDataGrid("instance");
    grid.clearFilter();
    isFiltered = false;
    getRecentSavedData();
}

function helpContext() {
    $('#context-menu').dxContextMenu("show");
}

function checkNum(F, t) {
    var nv, fv = F.value;
    if (t.substring(0, 1) == 'i')
        nv = parseInt(fv, 10)
    else {
        nv = parseFloat(fv);
    }
    if (isNaN(nv))
        F.value = isClientWithDefaultValue ? '' : '0.0';
    else if (fv != nv)
        F.value = nv;
}

function openCredits() {
    $('#popupCredits').w2popup();
}

function uploadFiles() {
    $('#popupUpload').w2popup();
}

function goldReports() {
    fileSystem = JSON.parse(sessionStorage.getItem('userFolders'));
    setFileManager(fileSystem);
    $('#popupGoldReports').w2popup();
}

function setFileManager(fileSystemItems) {
    $("#file-manager").dxFileManager({
        name: "fileManager",
        fileSystemProvider: fileSystemItems,
        itemView: {
            details: {
                columns: [
                    "thumbnail", "name",
                    "dateModified",
                    //"size"
                    {
                        dataField: "size",
                        caption: "File Size",
                        width: 150,
                        alignment: 'center'
                    },
                ]
            }
        },
        height: 637,
        permissions: {
            create: false,
            copy: false,
            move: false,
            delete: false,
            rename: false,
            upload: false,
            download: false
        },
        selectionMode: "single",
        toolbar: {
            items: [
                {
                    name: "showNavPane",
                    visible: true
                },
                "separator",
                "refresh",
                {
                    name: "separator",
                    location: "after"
                },
                "switchView"
            ],
            fileSelectionItems: [
                {
                    widget: "dxButton",
                    options: {
                        text: "Download File",
                        icon: "download",
                    },
                    onClick: onItemClick
                },
                "clearSelection"
            ]
        },
        customizeThumbnail: function (fileSystemItem) {
            if (fileSystemItem.isDirectory)
                return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/folder.svg";

            const fileExtension = fileSystemItem.getFileExtension();
            switch (fileExtension) {
                case ".txt":
                    return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/doc-txt.svg";
                case ".rtf":
                    return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/doc-rtf.svg";
                case ".xml":
                    return "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/thumbnails/doc-xml.svg";
                case ".ppt":
                    return "fiv-viv fiv-icon-ppt";
                case ".pptx":
                    return "fiv-viv fiv-icon-pptx";
                case ".doc":
                    return "fiv-viv fiv-icon-doc";
                case ".docx":
                    return "fiv-viv fiv-icon-docx";
                case ".xls":
                    return "fiv-viv fiv-icon-xls";
                case ".xlsx":
                    return "fiv-viv fiv-icon-xlsx";
                case ".pdf":
                    return "fiv-viv fiv-icon-pdf";
            }
        },
        onCurrentDirectoryChanged: function (e) {
            //selectedItemPath = e.directory.dataItem.path;
            //getFileSystemItems(selectedItem, selectedItemPath);
        },
        onSelectionChanged: function (e) {
            if (e.selectedItems && e.selectedItems.length > 0) {
                selectedItem = e.selectedItems[0].dataItem.name;
                selectedItemPath = e.selectedItems[0].dataItem.path;
            }
        },
        onSelectedFileOpened: function (e) {
            getFileSystemItems(selectedItem, selectedItemPath);
        }
    });
}

function onItemClick(args) {
    if (args.itemData.options.text == "Download File") getFileSystemItems(selectedItem, selectedItemPath);

}

//function getFileSystemItems(selectedFolder, folderPath) {
//    $.ajax({
//        url: baseUrl + "api/Client/GetFileSystemItems",
//        method: "POST",
//        data: { folderName: selectedFolder, folderPath: folderPath, email: sessionEmail },
//        dataType: "json",
//        headers: headerToken,
//        success: function (data) {
//            sessionStorage.setItem('fileSystemItems', JSON.stringify(data));
//            let fileSystemCurrent = JSON.parse(localStorage.getItem('fileSystem'));
//            let index = fileSystemCurrent.findIndex(f => f.path == folderPath);
//            let userFolder = fileSystemCurrent[index]["items"];
//            for (const d of data) {
//                let item = {};
//                item.name = d.Name;
//                item.path = d.FullName;
//                item.size = d.Size;
//                item.isDirectory = d.IsDirectory;
//                let file = userFolder.find(f => f.path == d.FullName);
//                if (file == undefined) fileSystemCurrent[index]["items"].push(item);
//            }
//            //fileSystem = fileSystemCurrent;
//            //$("#file-manager").dxFileManager("instance").refresh();
//            //setFileManager(fileSystemCurrent);
//        },
//        error: handleXHRError
//    });
//}

function getFileSystemItems(selectedItem, folderPath) {
    $.ajax({
        async: false,
        url: baseUrl + "api/Client/GetFileSystemItems",
        method: "POST",
        data: { folderName: selectedItem, folderPath: folderPath, email: sessionEmail },
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            //sessionStorage.setItem('fileSystemItems', JSON.stringify(data));
            downloadFile(data, 'application/octet-stream', selectedItem);
        },
        error: handleXHRError
    });
}

function downloadFile(data, mime, filename) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    //const blob = new Blob([data], {
    //    type: mime || "application/octet-stream"
    //});
    var blob = base64ToBlob(data, mime);
    if (typeof window.navigator.msSaveBlob !== "undefined") {
        // IE doesn't allow using a blob object directly as link href.
        // Workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
        return;
    }
    // Other browsers
    // Create a link pointing to the ObjectURL containing the blob
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.style.display = "none";
    tempLink.href = blobURL;
    tempLink.setAttribute("download", filename);
    // Safari thinks _blank anchor are pop ups. We only want to set _blank
    // target if the browser does not support the HTML5 download attribute.
    // This allows you to download files in desktop safari if pop up blocking
    // is enabled.
    if (typeof tempLink.download === "undefined") {
        tempLink.setAttribute("target", "_blank");
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(blobURL);
    }, 100);
}

function base64ToBlob(base64, mimetype, slicesize) {
    if (!window.atob || !window.Uint8Array) {
        // The current browser doesn't have the atob function. Cannot continue
        return null;
    }
    mimetype = mimetype || '';
    slicesize = slicesize || 512;
    var bytechars = atob(base64);
    var bytearrays = [];
    for (var offset = 0; offset < bytechars.length; offset += slicesize) {
        var slice = bytechars.slice(offset, offset + slicesize);
        var bytenums = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            bytenums[i] = slice.charCodeAt(i);
        }
        var bytearray = new Uint8Array(bytenums);
        bytearrays[bytearrays.length] = bytearray;
    }
    return new Blob(bytearrays, { type: mimetype });
};

function changeAppSettings() {
    $("#lblAppSettingsMsg")[0].textContent = "";
    var inputData = {
        "ServerFolderPath": $("#txtServerFolderPath").val(),
        "ReportsFolderLocation": $("#txtReportsFolderLocation").val(),
        "UploadsFolderLocation": $("#txtUploadsFolderLocation").val(),
        "MaxUploadFileSize": $("#txtMaxUploadFileSize").val(),
        "AllowedFileExtensions": $("#txtAllowedFileExtensions").val(),
        "GridPageSize": $("#txtGridPageSize").val(),
        "ValidPeriodForEdit": $("#txtValidPeriodForEditing").val(),
        "ValidPeriodForView": $("#txtValidPeriodForViewing").val()
    };

    $.ajax({
        url: baseUrl + "api/client/UpdateAppSettings",
        method: "POST",
        data: inputData,
        dataType: "json",
        headers: headerToken,
        //xhrFields: {withCredentials:true},
        success: function (data) {
            $("#lblAppSettingsMsg").css("color", "green");
            $("#lblAppSettingsMsg")[0].textContent = "App Settings successfully updated.";
            getAppSettings();
        },
        error: handleXHRError
    });
}

function clearCache() {
    w2confirm('This will log you out of the current session. Do you still want to continue?')
        .yes(() => {
            //console.log('Yes')
            localStorage.clear();
            sessionStorage.clear();
            //history.go(0);
            //window.location.href = baseUrl + 'Authentication/SignInBasic/';
            redirectTo('login');
        })
        .no(() => {
            //console.log('No')
        })
}

//function sso() {
//    alert("sso!");
//}

function execDashboard() {
    let userprofile = JSON.parse(sessionStorage.getItem('userProfile'));

    var client = $("#ddlClient");
    clientId = client.val();
    if (clientId == "--- Select Client---") {
        let clientData = JSON.parse(sessionStorage.getItem('accountInfos'));
        clientId = userprofile.ClientID;
        clientName = clientData.find(n => n.ClientID == userprofile.ClientID).AccountName;
    } else {
        clientName = client.find("option:selected").text();
    }
    //loginExecutiveDashboard(clientName, userprofile.ClientID, userprofile.AccountType);
    loginExecutiveDashboard(clientName, clientId, userprofile.AccountType);
}

function loginExecutiveDashboard(clientName, clientId, accountType) {
    var form = document.createElement("form");
    //form.action = 'http://localhost:55978/Token/Index';
    form.action = baseUrl + '/Token/Index';
    form.method = 'POST';
    form.target = "_blank";

    var input1 = document.createElement("input");
    input1.name = 'username';
    input1.value = sessionStorage.getItem('email');
    form.appendChild(input1);
    var input2 = document.createElement("input");
    input2.name = 'userrole';
    input2.value = accountType;
    form.appendChild(input2);
    var input3 = document.createElement("input");
    input3.name = 'clientid';
    input3.value = clientId;
    form.appendChild(input3);
    var input4 = document.createElement("input");
    input4.name = 'clientname';
    input4.value = clientName;
    form.appendChild(input4);

    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function loginMstr(pwd) {
    var form = document.createElement("form");
    form.action = 'https://microstrategy.cbpsportal.com/MicroStrategy/asp/Main.aspx';
    //form.action = 'https://microstrategy.cbpsportal.com:8080/MicroStrategy/servlet/mstrWeb';
    form.method = 'POST';
    form.target = "_blank";

    var input1 = document.createElement("input");
    input1.name = 'Uid';
    input1.value = sessionStorage.getItem('email');
    form.appendChild(input1);
    var input2 = document.createElement("input");
    input2.name = 'Pwd';
    input2.value = pwd;
    form.appendChild(input2);

    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function getUserPassword() {
    let url = baseUrl + "api/Client/GetUserPassword";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        headers: headerToken,
        success: function (data) {
            loginMstr(data);
        },
        error: handleXHRError
    });
}

function filterByStatus() {
    if (isFiltered) getSavedDataByServiceArea(localStorage.getItem('areaId'));
    else getRecentSavedData();
}

var mybutton = document.getElementById("back-to-top");
function scrollFunction() {
        mybutton.style.display = "block";
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.getElementById('page-title').scrollIntoView();
}

//Common plugins
//if (document.querySelectorAll("[toast-list]") || document.querySelectorAll('[data-choices]') || document.querySelectorAll("[data-provider]")) {
//if (document.querySelectorAll("[data-provider]")) {
//    document.writeln("<script type='text/javascript' src='https://cdn.jsdelivr.net/npm/toastify-js'></script>");
//    document.writeln("<script type='text/javascript' src='assets/libs/choices.js/public/assets/scripts/choices.min.js'></script>");
//    document.writeln("<script type='text/javascript' src='assets/libs/flatpickr/flatpickr.min.js'></script>");
//}

function getClientName() {
    let areaId = localStorage.getItem('areaId');
    clientId = areaId.split('_')[1];
    let clients = JSON.parse(sessionStorage.getItem('clientData'));
    clientName = clients.filter(c => c.Id == clientId).Value;
}

function redirectTo(route) {
    switch (route) {
        case "login":
            window.location.href = baseUrl + 'authentication/signinbasic';
            break;
        case "dashboard":
            window.location.href = baseUrl + 'dashboard/index';
            break;
        case "approvers":
            window.location.href = baseUrl + 'approvers.html';
            break;
    }
}

function init() {
    let delayInMilliseconds = 3000;

    getDefaultValues();

    setTimeout(function () {
        initClientList();
        setup();
    }, delayInMilliseconds);

    //setTimeout(function () {
    //setup();
    //}, delayInMilliseconds);
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

    //getUserFolders();
    //getUserProfile(sessionEmail);
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
    getUserFolders(sessionEmail);

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
    if (areaId == null || areaId.indexOf('null') > -1 || areaId.indexOf('Select Client' > -1)) {
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
