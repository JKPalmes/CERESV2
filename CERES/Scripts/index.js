var fileSystem = [];
//var transView = "ShowPendingTransactions";
//var transView = "ShowAllTransactions";

//$(function () {
//    $("#tooltip1").dxTooltip({
//        target: ".cls",
//        showEvent: "mouseenter",
//        hideEvent: "mouseleave",
//    });
//});
$.validator.addMethod(
    "checkDateCompleted",
    function (value, element) {
        var check = false;
        var dayNow = new Date();
        var ddate = new Date(value);
        check = (ddate > dayNow) ? false : true;
        return this.optional(element) || check;
    },
    "Completed date cannot be greater than current date"
);

$.validator.addMethod(
    "checkDateCompletedIfStatusNotComplete",
    function (value, element) {
        var check = false;
        var status = +document.getElementById(sessionStorage.getItem('statusFieldId')).value;
        var completedStatus = +sessionStorage.getItem('completedStatusId');
        var dateCompletedId = sessionStorage.getItem('dateCompletedFieldId');
        var dateCompletedEl = document.getElementById(dateCompletedId);
        var dateCompleted = dateCompletedEl.value;

        check = (status !== completedStatus && dateCompleted != null) ? false : true;
        return this.optional(element) || check;
        //return check;
    },
    "This field should be null if status is not set to completed"
);

$(function () {
    $("#myform").validate({
        submitHandler: function (form) {
            submitForm();
        },
        rules: {
            "CentralPrint_StringField5": { //Status
                required: true,
            },
            "CentralPrint_StringField4": { //Intake Person
                required: true,
            },
            "CentralPrint_StringField6": { //Requester
                required: true,
            },
            "CentralPrint_StringField8": { //Time Received
                required: true,
            },
            "CentralPrint_StringField9": { //Date Received
                required: true,
            },
            "CentralPrint_StringField10": { //Job type
                required: true,
            },
            "CentralPrint_StringField19": { //Due Time
                required: true,
            },
            "CentralPrint_StringField20": { //Due Date
                required: true,
            },
            "CentralPrint_StringField32": { //CBPS Job Notes
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    console.log('statusid: ' + status);
                    if (+status >= 5) return true;
                    else return false;
                },
            },
            "CentralPrint_StringField28": { //Date Completed
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true,
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "CentralPrint_StringField25": { //Operator (s)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "CentralPrint_StringField26": { //QC Operator(s)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "CentralPrint_StringField27": { //Time Completed
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "CentralPrint_Field11": { //Time to Complete (minutes)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "CentralPrint_StringField13": { //Average Copy Type Grade 
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "CentralPrint_StringField31": { //Delivered by 
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                }
            },
            "CentralPrint_StringField23": { //Vendor Name
                required: function (element) {
                    var vended = $("#StringField22")[0].value;
                    if (vended == 1) return true;
                    else return false;
                }
            },
            "CentralPrint_Field24": { //Vended Cost
                required: function (element) {
                    var vended = $("#StringField22")[0].value;
                    if (vended == 1) return true;
                }
            },
            "Commentary_StringField4": { //Status
                required: true,
            },
            "Commentary_StringField5": { //Date Completed (Period End Date) 
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 2) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },            
            "Commentary_StringField6": { //Public (Displays in Dashboards) 
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 2) return true;
                }
            },
            "Commentary_StringField8": { //Subject
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 2) return true;
                    else return false;
                }
            },
            "Commentary_StringField9": { //Type
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 2) return true;
                    else return false;
                }
            },
            "Facilities_StringField4": { //Status
                required: true,
            },
            "Facilities_StringField6": { //Work Type
                required: true,
            },
            "Facilities_StringField7": { //Time Request Received/Scheduled
                required: true,
            },
            "Facilities_StringField8": { //Date Received/Scheduled
                required: true,
            },
            "Facilities_StringField9": { //Job Type
                required: true,
            },
            "Facilities_StringField10": { //Requester
                required: true,
            },
            "Facilities_StringField14": { //Due Date
                required: true,
            },
            "Facilities_StringField17": { //Date Completed
                required: function (element) {
                    var status = $("#StringField4")[0].value
                    if (status == 3) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true

            },
            "Facilities_Field1": { //Time to Complete
                required: function (element) {
                    var status = $("#StringField4")[0].value
                    if (status == 3) return true;
                    else return false;
                }
            },
            "Facilities_StringField18": { //Errors Reported
                required: function (element) {
                    var status = $("#StringField4")[0].value
                    if (status == 3) return true;
                    else return false;
                }
            },
            "Facilities_StringField20": { //Completed Late
                required: function (element) {
                    var status = $("#StringField4")[0].value
                    if (status == 3) return true;
                    else return false;
                }
            },
            "Facilities_StringField23": { //Job Comments
                required: function (element) {
                    var completedLate = $("#StringField20")[0].value;
                    if (completedLate == 1) return true; //1-yes
                    else return false;
                },
            },
            "Facilities_StringField19": { //Errors Comment
                required: function (element) {
                    var errorsReported = $("#StringField18")[0].value;
                    if (errorsReported == 1) return true; //1-yes
                    else return false;
                }
            },
            "Facilities_StringField21": { //On Hold Reason
                required: function (element) {
                    var status = $("#StringField4")[0].value
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Facilities_StringField22": { //Canceled Reason
                required: function (element) {
                    var status = $("#StringField4")[0].value
                    if (status == 5) return true;
                    else return false;
                }
            },
            "Facilities_StringField25": { //Work Type
                required: function (element) {
                    var subContractType = $("#StringField6")[0].value;
                    if (subContractType == 11) return true; //11-Sub-Contract
                    else return false;
                }
            },
            "Facilities_StringField15": { //Employee(s) Dispatched
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 3) return true;
                    else return false;
                }
            },
            "Hospitality_StringField6": { //Status
                required: true
            },
            "Hospitality_StringField5": { //Requester
                required: true,
            },
            "Hospitality_StringField8": { //Due Time
                required: true,
            },
            "Hospitality_StringField10": { //Job Type
                required: true,
            },
            "Hospitality_StringField9": { //Due Date
                required: true,
            },
            "Hospitality_Field1": { //# of Guests depending on conf rm setup
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType <= 2) return true;
                    else return false;
                },
            },
            "Hospitality_StringField15": { //Vendor Name depending on conf rm setup
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 2) return true;
                    else return false;
                },
            },
            "Hospitality_Field11": { //Breakdown Time to Complete (minutes)
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType < 3 && status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_Field10": { //Time to Complete (minutes)
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType <= 2 && status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_StringField14": { //Vendor Time Called 
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 2 && status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_StringField16": { //Was Catering Delivery on-time
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 2 && status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_StringField22": { //Completion notification sent to requestor 
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 2 && status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_StringField13": { //Conference Room Name/ID
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_StringField17": { //Employee(s) dispatched
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_StringField18": { //Time Completed
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Hospitality_StringField19": { //Date Completed
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    if (status == 4) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },
            "Hospitality_StringField20": { //Task completed On Time?
                required: function (element) {
                    var status = $("#StringField6")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_StringField5": { //Status
                required: true,
            },
            "Imaging_StringField4": { //Intake Person
                required: true,
            },
            "Imaging_StringField6": { //Requester
                required: true,
            },
            "Imaging_StringField8": { //Time Received
                required: true,
            },
            "Imaging_StringField9": { //Date Received
                required: true,
            },
            "Imaging_StringField11": { //Due Time
                required: true,
            },
            "Imaging_StringField12": { //Due Date
                required: true,
            },
            "Imaging_StringField26": { //CBPS Job Notes
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (+status >= 5) return true;
                    else return false;
                },
            },
            "Imaging_StringField10": { //Average Grade
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_StringField21": { //Date Completed
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },
            "Imaging_StringField18": { //Operator (s)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_StringField19": { //QC Operator(s)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_StringField20": { //Time Completed
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_StringField23": { //Delivered On-Time
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_Field5": { //Time to Complete QC
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_Field4": { //Time to Complete Scanning (minutes)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            //"Imaging_StringField": { //Average Copy Type Grade 
            //    required: function (element) {
            //        var status = +sessionStorage.getItem('Imaging_StringField5');
            //        if (status == 4) return true;
            //    }
            //},
            "Imaging_StringField25": { //Delivery Method 
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "Imaging_StringField15": { //Vendor Name
                required: function (element) {
                    var vended = $("#StringField14")[0].value;
                    if (vended == 1) return true;
                    else return false;
                }
            },
            "Imaging_StringField16": { //Vended Reason
                required: function (element) {
                    var vended = $("#StringField14")[0].value;
                    if (vended == 1) return true;
                    else return false;
                }
            },
            "Imaging_Field17": { //Vended Cost
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    var vended = $("#StringField14")[0].value;
                    if (vended == 1 && status == 4) return true;
                    else return false;
                }
            },
            //Mail e.g.4000721 format: [ServiceAreaCateogry]_(String)Field[ServiceFieldNumber]
            "Mail_StringField4": { //Status
                required: true,
            },
            "Mail_StringField7": { //Time Received
                required: true,
            },
            "Mail_StringField8": { //Date Received
                required: true,
            },
            "Mail_StringField10": { //Due Time
                required: true,
            },
            "Mail_StringField11": { //Due Date
                required: true,
            },
            "Mail_StringField12": { //Job type
                required: true,
            },
            "Mail_StringField8": { //Date Received
                required: true,
            },
            "Mail_Field16": { //Time to Complete (minutes) is required if status is complete
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 3) return true;
                    else return false;
                },
            },
            //"Mail_Field16": { //if fulfillment job, Time to Complete (minutes) is required if status is complete
            //    required: function (element) {
            //        var status = $("#StringField4")[0].value;
            //        var fulfillmentJob = $("#StringField13")[0].value;
            //        if (fulfillmentJob == 1 && status == 3) return true;
            //        else return false;
            //    },
            //},
            "Mail_StringField15": { //Date Completed
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 3) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },
            "ManagedPrint_StringField5": { //Status
                required: true,
            },
            "ManagedPrint_StringField10": { //Job Type
                required: true,
            },
            "ManagedPrint_Field12": { //Time to Complete (minutes)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField19": { //Time Completed
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType != 6 && status == 4) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField20": { //Date Completed
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 4) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },
            "ManagedPrint_StringField23": { //Completion notification sent to requestor  if job type = 1-Toner Replacement|2-Paper Jam|5-Quality Issue|9-User Training|8-Network Issue, and if status is complete
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if ((jobType == 1 || jobType == 2 || jobType == 5 || jobType == 8 || jobType == 9) && status == 4) return true;
                    else return false;
                },
            },
            "ManagedPrint_StringField21": { //Completed On Time if job type = 1-Toner Replacement|2-Paper Jam|5-Quality Issue|9-User Training|8-Network Issue, and if status is complete
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if ((jobType == 1 || jobType == 2 || jobType == 5 || jobType == 8 || jobType == 9) && status == 4) return true;
                    else return false;
                },
            },
            "ManagedPrint_StringField4": { //Intake Person if job type = 1-Toner Replacement|2-Paper Jam|3|4|5-Quality Issue|9-User Training|8-Network Issue regardless of status
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 || jobType == 2 || jobType == 3 || jobType == 4 || jobType == 5 || jobType == 8 || jobType == 9) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField6": { //Requester if job type = 1-Toner Replacement|2-Paper Jam|3|4|5-Quality Issue|9-User Training|8-Network Issue regardless of status
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 || jobType == 2 || jobType == 3 || jobType == 4 || jobType == 5 || jobType == 8 || jobType == 9) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField8": { //Time Received if job type = 1-Toner Replacement|2-Paper Jam|3|4|5-Quality Issue|9-User Training|8-Network Issue regardless of status
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 || jobType == 2 || jobType == 3 || jobType == 4 || jobType == 5 || jobType == 8 || jobType == 9) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField9": { //Date Received if job type = 1-Toner Replacement|2-Paper Jam|3|4|5-Quality Issue|9-User Training|8-Network Issue regardless of status
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 || jobType == 2 || jobType == 3 || jobType == 4 || jobType == 5 || jobType == 8 || jobType == 9) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField12": { //Due Date if job type = 1-Toner Replacement|2-Paper Jam|3|4|5-Quality Issue|9-User Training|8-Network Issue regardless of status
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 || jobType == 2 || jobType == 3 || jobType == 4 || jobType == 5 || jobType == 8 || jobType == 9) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField16": { //Equip Serial# if job type = 1-Toner Replacement|2-Paper Jam|3|4|5-Quality Issue|9-User Training|8-Network Issue regardless of status
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 || jobType == 2 || jobType == 3 || jobType == 4 || jobType == 5 || jobType == 8 || jobType == 9) return true;
                    else return false;
                }
            },
            "ManagedPrint_Field5": { //# Equip Key Ops Scheduled required if job type  is 7-Scheduled Key Op
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7) return true;
                    else return false;
                }
            },
            "ManagedPrint_Field6": { //# Equip Key Oped required if job type  is 7-Scheduled Key Op
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7) return true;
                    else return false;
                }
            },
            "ManagedPrint_Field7": { //# Equip Key Oped Late required if job type is 7-Scheduled Key Op
                required: function (element) {
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField14": { //Vendor Time Called required if serviced by = 2-Fleet Center or 3-3rd Party Vendor
                required: function (element) {
                    var servicedBy = $("#StringField13")[0].value;
                    if (servicedBy == 2 || servicedBy == 3) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField15": { //Vendor Name required if serviced by = 3-3rd Party Vendor
                required: function (element) {
                    var servicedBy = $("#StringField13")[0].value;
                    if (servicedBy == 3) return true;
                    else return false;
                }
            },
            "ManagedPrint_StringField22": { //Job Notes required if Completed On Time = 2-No
                required: function (element) {
                    var completedOnTime = $("#StringField21")[0].value;
                    if (completedOnTime == 2) return true;
                    else return false;
                }
            },
            "Records_StringField5": { //Status
                required: true,
            },
            "Records_StringField9": { //Date Received
                required: true,
            },
            "Records_StringField4": { //Intake Person
                required: true,
            },
            "Records_StringField6": { //Requester
                required: true,
            },
            "Records_StringField10": { //Work Type
                required: true,
            },
            "Records_StringField11": { //Job Type
                required: true,
            },
            "Records_StringField13": { //Date Completed
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 3) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },
            "Records_Field13": { //Time to Complete (minutes)
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status == 3) return true;
                    else return false;
                }
            },
            "ShippingReceiving_StringField4": { //Status
                required: true,
            },
            "ShippingReceiving_StringField9": { //Date Received
                required: true,
            },
            "ShippingReceiving_StringField10": { //Package Type A
                required: true,
            },
            "ShippingReceiving_Field2": { //SR # Error Reported/Mis-delivered
                required: true,
            },
            "ShippingReceiving_Field6": { //SR # Pick up Rounds Required 
                required: true,
            },
            "ShippingReceiving_Field7": { //SR # Pick up Rounds completed late
                required: true,
            },
            "ShippingReceiving_StringField19": { //Date Completed
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 4) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },
            "ShippingReceiving_Field1": { //SR # Accountable Packages
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    if (status == 4) return true; else return false;
                },
            },
            "ShippingReceiving_Field3": { //SR # Pkgs Delivered Late
                required: function (element) {
                    var pkgType = $("#StringField10")[0].value;
                    if (pkgType == 1) return true;
                    else return false;
                }
            },
            "Warehouse_StringField4": { //Status
                required: true,
            },
            "Warehouse_StringField10": { //Job Type
                required: true,
            },
            "Warehouse_Field11": { //# Pick SKUs
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (status == 4 && (jobType == 2 || jobType == 4 || jobType == 6)) return true;
                    else return false;
                }
            },
            "Warehouse_StringField8": { //Requester
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if ((jobType > 1 && jobType <= 6) && status == 4) return true;
                    else return false;
                },
            },
            "Warehouse_StringField9": { //GL Code / Charge Code
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if ((jobType > 1 && jobType <= 6) && status == 4) return true;
                    else return false;
                },
            },
            "Warehouse_StringField6": { //Time Received
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if ((jobType == 2 || jobType == 6 || jobType == 3 || jobType == 4) && status == 4) return true;
                    else return false;
                },
            },
            "Warehouse_StringField7": { //Date Received
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if ((jobType == 2 || jobType == 6 || jobType == 3 || jobType == 4) && status == 4) return true;
                    else return false;
                },
            },
            "Warehouse_StringField14": { //Return to Stock Reason Code
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 3 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field35": { //# SKUs Returned
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 3 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field1": { //# Shipments Received
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field3": { //# SKUs Received
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field5": { //# SKUs Stocked
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 1 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field25": { //# Cycle Counts
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 5 && status == 4) return true;
                }
            },
            "Warehouse_Field26": { //# Incorrect SKUs
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 5 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field27": { //# Inventory Adjustments (SKU Qty)
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 5 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field29": { //# SKU Location Adjustments
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 5 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field30": { //Kit # Jobs Completed
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 4 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field32": { //Kit # Jobs Late
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 4 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field33": { //# Kit SKUs
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 4 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field38": { //# SKUs Scrapped
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_Field41": { //Time to Complete  (HOURS)
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_StringField11": { //Time Completed
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7 && status == 4) return true;
                    else return false;
                }
            },
            "Warehouse_StringField12": { //Date Completed
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7 && status == 4) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },
            "Warehouse_StringField15": { //Scrap Reason Code
                required: function (element) {
                    var status = $("#StringField4")[0].value;
                    var jobType = $("#StringField10")[0].value;
                    if (jobType == 7 && status == 4) return true;
                    else return false;
                }
            },
            "Others_Status": { //status for all other category (others)
                required: true
            },
            "Others_Date_Completed": { //date completed for all other category (others)
                required: function (element) {
                    var status = $("[name='Others_Status']")[0].value;
                    var completedStatus = +sessionStorage.getItem('completedStatusId');
                    if (status == completedStatus) return true;
                    else return false;
                },
                checkDateCompleted: true,
                checkDateCompletedIfStatusNotComplete: true
            },

        },
        
        //onkeyup: false,
        //focusCleanup: true,
        //onfocusin: function (element, event) {
        //    this.lastActive = element;

        //    if (!$(element).hasClass("nocleanup")) {
        //        if (this.settings.focusCleanup && !this.blockFocusCleanup) {
        //            if (this.settings.unhighlight) {
        //                this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
        //            }
        //            this.addWrapper(this.errorsFor(element)).hide();
        //        }
        //    }
        //},
        messages: {
            "ShippingReceiving_Field1": "This should be greater than 0.",
        }
    });

});

$(function () {
    $.idleHands({
        activityEvents: 'click',
        applicationId: 'bi_eds',
        dialogMessage: 'Your session is about to expire due to inactivity.',
        dialogTimeRemainingLabel: 'Time until logout',
        dialogTitle: 'Session Expiration Warning',
        documentTitle: 'Warning',
        heartbeatCallback: (function (data, textStatus, jqXHR) {
            console.log('pulse');
        }),
        heartbeatUrl: window.location.href,
        heartRate: 10,
        inactivityLogoutUrl: 'https://microstrategy.cbpsportal.com/eds/Login2.html',
        inactivityDialogDuration: 45,
        localStoragePrefix: 'bi_eds',
        logoutNowButtonText: "Logout Now",
        manualLogoutUrl: 'https://microstrategy.cbpsportal.com/eds/Login2.html',
        maxInactivitySeconds: 1800,//30 mins.
        //maxInactivitySeconds: 60,//1 min.
        stayLoggedInButtonText: "Stay Logged In"
    });
});

$(function () {
    $('#toolbarAdmin').w2toolbar({
        name: 'toolbarAdmin',
        items: [
            { type: 'button', id: 'uploadFiles', text: 'Upload Files', img: 'upload-icon', disabled: true, hidden: true },
            //{ type: 'break' },
            { type: 'button', id: 'goldReports', text: 'Professional Reports', img: 'reports-icon', disabled: true },
            { type: 'break' },
            { type: 'button', id: 'platinumReports', text: 'Enterprise Reports', img: 'microstrategy-icon', disabled: true },
            { type: 'spacer' },
            {
                type: 'menu', id: 'acctMenu', text: 'Account Info', icon: '', img: 'accounts-ico', hidden: false,
                items: [
                           { id: 'accountInfo', text: 'Client Info', icon: 'fa fa-star' }
                           //{ id: 'userInfo', text: 'Client Users', icon: 'fa fa-star' }
                ]
            },
            { type: 'break' },
            {
                type: 'menu', id: 'adminMenu', text: 'Administration', icon: '', img: 'admin-ico', hidden: false,
                items: [
                    { id: 'appSecurity', text: 'App Security', icon: 'fa fa-star' },
                    { id: 'appSettings', text: 'App Settings', icon: 'fa fa-star' },
                    /*{ id: 'appApprover', text: 'App Approvers', icon: 'fa fa-star' },*/
                    {
                        id: 'accountMaster', text: 'Account Maintenance', icon: 'fa fa-star', expanded: true,
                        items: [
                            { id: 'sm1_2', text: 'Client Info', icon: 'fa fa-picture-o' },
                            { id: 'sm1_3', text: 'Site Info', icon: 'fa fa-picture-o' },
                            { id: 'sm1_4', text: 'Location Info', icon: 'fa fa-picture-o' },
                            { id: 'sm1_5', text: 'Service Area Info', icon: 'fa fa-glass' },
                            { id: 'sm1_1', text: 'Approver Info', icon: 'fa fa-camera' },
                            { id: 'sm1_6', text: 'Client Setting', icon: 'fa fa-camera' }
                        ]
                    },
                    { id: 'userMaster', text: 'User Maintenance', icon: 'fa fa-star' },
                    {
                        id: 'metadataMaster', text: 'Account MetaData', icon: 'fa fa-star', expanded: true,
                        items: [
                            { id: 'sm3_1', text: 'Service Area Fields', icon: 'fa fa-camera' },
                            { id: 'sm3_2', text: 'Service Area Field LOV', icon: 'fa fa-picture-o' }
/*                            { id: 'sm3_3', text: 'EDS MetaData', icon: 'fa fa-glass' }*/
                        ]
                    },
                ]
            }
        ],
        onClick: function (event) {
            switch (event.target) {
                case "goldReports":
                    goldReports();
                    break;
                case "uploadFiles":
                    uploadFiles();
                    return;
                case "platinumReports":
                    window.open(
                        'https://bitest.cbpsportal.com/MicroStrategy/asp/Main.aspx',
                        //'https://bi.cbpsportal.com/MicroStrategy/asp/Main.aspx',
                        '_blank' 
                    );
                    return;
                case "adminMenu:appSecurity":
                    window.open(
                        'https://ceres.cbpsportal.com/admin-security/#/base/forms',
                        '_blank'
                    );
                    return;
                case "adminMenu:appApprover":
                    window.location.href = 'approvers.html';
                    return;
                case "adminMenu:appSettings":
                    popupAppSettingsForm();
                    return;
                case "adminMenu:userMaster":
                    window.location.href = 'userInfo.html';
                    return;
                case "acctMenu:accountInfo":
                    popupAccountInfoForm();
                    return;
                case "adminMenu:sm1_1":
                    //window.location.href = 'acctInfo.html';
                    window.location.href = 'approvers.html';
                    return;
                case "adminMenu:sm1_6":
                    window.location.href = 'clientsetting.html';
                    return;
                case "adminMenu:sm1_2":
                    window.location.href = 'clientInfo.html';
                    return;
                case "adminMenu:sm1_3":
                    window.location.href = 'siteInfo.html';
                    return;
                case "adminMenu:sm1_4":
                    window.location.href = 'locationInfo.html';
                    return;
                case "adminMenu:sm1_5":
                    window.location.href = 'serviceareainfo.html';
                    return;
                case "adminMenu:sm3_1":
                    window.location.href = 'serviceareafield.html';
                    return;
                case "adminMenu:sm3_2":
                    window.location.href = 'serviceareafieldLOV.html';
                    return;
                default:
                    console.log('Target: ' + event.target, event);    
            }
        }
    });
});

var config = {
    tabs: {
        name: 'tabs',
        active: 'tab1',
        tabs: [
            { id: 'tab1', text: 'Cllient/Account' },
            { id: 'tab2', text: 'Site/Location' },
            { id: 'tab3', text: 'Service Area' },
        ],
        onClick: function (event) {
            $('#tab-example .tab').hide();
            $("#lblAccountInfoMsg")[0].textContent = "";
            $('#tab-example #' + event.target).show();
        }
    }
}

$(function () {
    $('#tabs').w2tabs(config.tabs);
});

// widget configuration
var configAcct = {
    layout: {
        name: 'layoutAcct',
        padding: 4,
        panels: [
            { type: 'left', size: '50%', resizable: true, minSize: 300 },
            { type: 'main', minSize: 300 }
        ]
    },
    grid: {
        name: 'grid',
        columns: [
            { field: 'fname', caption: 'First Name', size: '33%', sortable: true, searchable: true },
            { field: 'lname', caption: 'Last Name', size: '33%', sortable: true, searchable: true },
            { field: 'email', caption: 'Email', size: '33%' },
            { field: 'sdate', caption: 'Start Date', size: '120px', render: 'date' }
        ],
        records: [
            { recid: 1, fname: 'John', lname: 'Doe', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 2, fname: 'Stuart', lname: 'Motzart', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 3, fname: 'Jin', lname: 'Franson', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 4, fname: 'Susan', lname: 'Ottie', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 5, fname: 'Kelly', lname: 'Silver', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 6, fname: 'Francis', lname: 'Gatos', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 7, fname: 'Mark', lname: 'Welldo', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 8, fname: 'Thomas', lname: 'Bahh', email: 'jdoe@gmail.com', sdate: '4/3/2012' },
            { recid: 9, fname: 'Sergei', lname: 'Rachmaninov', email: 'jdoe@gmail.com', sdate: '4/3/2012' }
        ],
        onClick: function (event) {
            var grid = this;
            var form = w2ui.form;
            event.onComplete = function () {
                var sel = grid.getSelection();
                if (sel.length == 1) {
                    form.recid = sel[0];
                    form.record = $.extend(true, {}, grid.get(sel[0]));
                    form.refresh();
                } else {
                    form.clear();
                }
            }
        }
    },
    form: {
        header: 'Edit Record',
        name: 'form',
        fields: [
            { field: 'recid', type: 'text', html: { text: 'ID', attr: 'size="10" readonly' } },
            { field: 'fname', type: 'text', required: true, text: { caption: 'First Name', attr: 'size="40" maxlength="40"' } },
            { field: 'lname', type: 'text', required: true, text: { caption: 'Last Name', attr: 'size="40" maxlength="40"' } },
            { field: 'email', type: 'email', html: { text: 'Email', attr: 'size="30"' } },
            { field: 'sdate', type: 'date', html: { text: 'Date', attr: 'size="10"' } }
        ],
        actions: {
            Reset: function () {
                this.clear();
            },
            Save: function () {
                var errors = this.validate();
                if (errors.length > 0) return;
                if (this.recid == 0) {
                    w2ui.grid.add($.extend(true, { recid: w2ui.grid.records.length + 1 }, this.record));
                    w2ui.grid.selectNone();
                    this.clear();
                } else {
                    w2ui.grid.set(this.recid, this.record);
                    w2ui.grid.selectNone();
                    this.clear();
                }
            }
        }
    }
};

$(function () {
    // initialization in memory
    $().w2layout(configAcct.layoutAcct);
    $().w2grid(configAcct.grid);
    $().w2form(configAcct.form);
});

function popupAcctMaintenanceForm() {
    w2popup.open({
        title: 'Account Maintenance',
        width: 900,
        height: 600,
        showMax: true,
        body: '<div id="mainAcctMaintenance" style="position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px;"></div>',
        onOpen: function (event) {
            event.onComplete = function () {
                $('#w2ui-popup #mainAcctMaintenance').w2render('layout');
                w2ui.layout.html('left', w2ui.grid);
                w2ui.layout.html('main', w2ui.form);
            };
        },
        onToggle: function (event) {
            event.onComplete = function () {
                w2ui.layout.resize();
            }
        }
    });
}

const contextMenuItems = [
    //{
    //    text: 'Share',
    //    icon: 'dx-icon-globe',
    //    items: [
    //        { text: 'Facebook' },
    //        { text: 'Twitter' }],
    //},
    //{ text: 'Download', icon: 'dx-icon-download' },
    //{ text: 'Add Comment', icon: 'dx-icon-add' },
    { text: '  How To Access Help Videos', icon: 'info' },
    { text: '  How To Request Setup Of A New User', icon: 'info' },
    { text: '  How To Register A New User', icon: 'info' },
    { text: '  How To Reset Password', icon: 'info' },
    { text: '  How To Change Password', icon: 'info' },
];

$(() => {
    $('#context-menu-help').dxContextMenu({
        showEvent: 'dxclick',
        dataSource: contextMenuItems,
        width: 200,
        target: '#myinfo',
        //target: '.myClass .dx-icon-help',
        //itemTemplate(itemData) {
        //    const template = $('<div></div>');
        //    if (itemData.icon) {
        //        template.append(`<span class="${itemData.icon}"><span>`);
        //    }
        //    if (itemData.items) {
        //        template.append('<span class="dx-icon-spinright"><span>');
        //    }
        //    template.append(itemData.text);
        //    return template;
        //},
        onItemClick(e) {
            if (!e.itemData.items) {
                if (e.itemData.text.indexOf("Help Videos") > 0) window.open('https://canonbps.box.com/s/blan7toj8h8jiqj7dtpgibcnxmfyx0aj', '_blank');
                if (e.itemData.text.indexOf("Request Setup Of A New User") > 0) window.open('https://canonbps.box.com/s/80jjdpnrnbq0p18s0b06k82pypun60hr"', '_blank');
                if (e.itemData.text.indexOf("Register A New User") > 0) window.open('https://canonbps.box.com/s/u2njtduw5ms0jzxnkpzt1h6n1o3pq1qb', '_blank');
                if (e.itemData.text.indexOf("Reset Password") > 0) window.open('https://canonbps.box.com/s/rzk7joketvxkecotrxu52o9v2jhtmbad', '_blank');
                if (e.itemData.text.indexOf("Change Password") > 0) window.open('https://canonbps.box.com/s/3ydpbbq0pd9dl4141dv0hmkurq3gogp6', '_blank');
            }
        }
    });
});

const gridContextMenuItems = [
    { text: "    How To View Transaction Records", icon: 'add-icon' },
    { text: '    How To Change Transaction View', icon: 'refresh-icon' },
    { text: '    How To Add/Edit Transaction', icon: 'add' },
    { text: '    How To Search Transaction Records', icon: 'search' },
    { text: '    How To Export Transaction Records', icon: 'xlsx-icon' },
];

$(() => {
    $('#context-menu').dxContextMenu({
        showEvent: 'dxclick',
        dataSource: gridContextMenuItems ,
        width: 200,
        target: '.myClass .dx-icon-help',
        //itemTemplate(itemData) {
        //    const template = $('<div></div>');
        //    if (itemData.icon) {
        //        template.append(`<span class="${itemData.icon}"><span>`);
        //    }
        //    if (itemData.items) {
        //        template.append('<span class="dx-icon-spinright"><span>');
        //    }
        //    template.append(itemData.text);
        //    return template;
        //},
        onItemClick(e) {
            if (!e.itemData.items) {
                //DevExpress.ui.notify(`The "${e.itemData.text}" item was clicked`, 'success', 1500);
                if (e.itemData.text.indexOf("View Transaction Records") > 0) window.open('https://canonbps.box.com/s/q5nkgbk99fepqlgwwan639ti17qr35ni', '_blank');
                if (e.itemData.text.indexOf("Change Transaction View") > 0) window.open('https://canonbps.box.com/s/owgvhx83x9tjfvqdzug23ch4v19xxsh0', '_blank');
                if (e.itemData.text.indexOf("Add/Edit Transaction") > 0) window.open('https://canonbps.box.com/s/yq2odjfbwe2gx8wue12p71qp7rv7sxg0', '_blank');
                if (e.itemData.text.indexOf("Search Transaction Records") > 0) window.open('https://cbpsinc-my.sharepoint.com/:v:/g/personal/manuguid_cbps_canon_com/EcSBqYam6yJOu9A2jm1D-O8BWpP71FXloKLiGc0z6VXaoQ', '_blank');
                if (e.itemData.text.indexOf("Export Transaction Records") > 0) window.open('https://canonbps.app.box.com/s/ldcysyyp3mhq8qn82ugoi64ca8hllaxd', '_blank');
            }
        }
    });
});

//brb 5/20/2022
const gridContextMenuItems1 = [
    { text: "    Download Transaction Records (For Upload Later)", icon: 'fa fa-download' },
    { text: '    Export Transaction Records To CSV', icon: 'xlsx-icon' },
];

$(() => {
    $('#context-menu1').dxContextMenu({
        showEvent: 'dxclick',
        dataSource: gridContextMenuItems1,
        width: 200,
        target: '.myClass .dx-icon-export',
        onItemClick(e) {
            if (!e.itemData.items) {
                if (e.itemData.text.indexOf("Download") > 0) exportToCsv(true);
                if (e.itemData.text.indexOf("Export") > 0) exportToCsv(false);
            }
        }
    });
});

//brb 5/23/2022
const gridContextMenuItems2 = [
    { text: "    Select New Client", icon: 'client-icon' },
    { text: "    Select New Site", icon: 'site-icon' },
    { text: "    Select New Location", icon: 'location-icon' },
    { text: "    Select New Service Area", icon: 'area1-icon' },
    { text: "    Select All Service Areas", icon: 'area1-icon' },
];

$(() => {
    $('#context-menu2').dxContextMenu({
        showEvent: 'dxclick',
        dataSource: gridContextMenuItems2,
        width: 200,
        target: '.myClass .dx-icon-client-icon',
        onItemClick(e) {
            if (!e.itemData.items) {
                if (e.itemData.text.indexOf("Client") > 0) setNewSelectors('Client');
                if (e.itemData.text.indexOf("Site") > 0) setNewSelectors('Site');
                if (e.itemData.text.indexOf("Location") > 0) setNewSelectors('Location');
                if (e.itemData.text.indexOf("Service Area") > 0) setNewSelectors('Service Area');
                //brb 6/6/2022
                //handle all service area request
                if (e.itemData.text.indexOf("All Service Areas") > 0) {
                    clientId = $("#ddlClient").val();
                    if (clientId == '--- Select Client---') toastr.warning('Please enter a client name first');
                    else {
                        isFiltered = false; getRecentSavedDataAll(clientId);
                        $("#ddlServiceArea").val('Select All');
                    }
                }
                //brb 6/6/2022
            }
        }
    });
});
