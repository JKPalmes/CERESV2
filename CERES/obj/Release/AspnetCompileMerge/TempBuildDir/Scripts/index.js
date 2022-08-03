var fileSystem = [];
//var transView = "ShowPendingTransactions";
var transView = "ShowAllTransactions";

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
    //width: 1654px;  var bstyle = 'border: 1px solid #dfdfdf; padding: 5px 5px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAKQSURBVDhPhVNNS1VRFF373PvyO7MiSw2xlFREoxyUmBFmFFFBBA2ahbMoadbnIKJJ0A9oYrMGSYNQS4oKoUIssSB0EFKhZamolR/v3XfvPa39ns+XNWjBuZx97tnrrP0llgAxOBPi6YTF0E+L71FAD10DFGYANfmClkKD6tWiV1dAYkFoW3p9/IgD2S4Q4R3DpVeVJODH55rzgeIsQVejA0fSRHLiVdx+XbTIdP5l/xsLZCrJFnTs5ktLMA4//3dNg1GtgLla7SDHFUx7FlHq9UMLTUtqqb3I86mYxcZMwaUqfTIN2ffcs/coaSoGdIyFGJixGGNIiSRSWgnjri8QnCo1JARO9vnoa44kvQk59iJuP8xZ1DLTx4sN6tcKijKX/hKjC0A/STtGQwz/sqjIFXQ2pnMgg9OhbR3wE9nW+PRlql6GVkTNaACU5Qhu1Tmo+qOc5vpwgP5mFzdqHGxfI9AKpfxDLt03rBMMH4zg4R6X+Ur8WoYc6PXs2CJwtMgwBEEdSVaRJUi4CmuevHj+bYDOcVLy2KHUc+UGZ8odyMvJwLa+CdgHyYsqP6VgkokdOeTiyvsAT9ilZeyB1i0G14YCzLOxbtY6MO2fQgxR3ukygwK2oeZCH1WS8lwgi6V4ME5nxt+wXnCESmuYg80ku0Nf7GUZdzz27O0R305EQx0N67G9Z73k/vN8aLd2e/b+aJCwU2gbjNumZ56Vri+BbWN8+SytJk1DiDBGjUjt1/sjqOqJI5sH2/IEd3e5KO2OYxNLXUnbHKakniYXO9ksMXqofCXRAdIcvJu1uFjpYIFlVPvsoJ9w1v1lduXyOKegg6XjHCNLBpVsYPvqFD76FqL9Y4iJqGVuBBdIWpEn+A1mpC1o5C6TvwAAAABJRU5ErkJggg==); background-repeat: no-repeat; background-position: center left;';
    var pstyle = 'border: 1px solid #dfdfdf; padding: 5px 5px;';
    var hstyle = 'border: 1px solid #dfdfdf; padding: 5px; overflow: hidden; display: block; left: 0px; top: 800px; height: 60px;'
    $('#layout').w2layout({
        name: 'layout',
        panels: [
            { type: 'left', size: '12%', hidden: true, resizable: true, style: pstyle, title: 'SELECTORS' },
            {
                type: 'main', size: '55%', resizable: false, style: pstyle, title: 'PRODUCTION DATA - QUERY VIEW',
                toolbar: {
                    items: [
                        { type: 'button', id: 'btnSelectors', text: 'Hide Selectors', icon: 'fa fa-arrow-right', tooltip: 'Show/Hide Selectors' },
                        { type: 'break', id: 'break1', hidden: false },
                        {
                            type: 'menu-radio', id: 'item1', text: 'Transactions View', icon: 'fa fa-list-alt',
                            text: function (item) {
                                var text = item.selected;
                                var el = this.get('item1:' + item.selected);
                                return el.text + ' Transactions';
                            },
                            selected: 'All',
                            items: [
                                { id: 'All', text: 'All', icon: 'fa fa-camera' },
                                { id: 'Completed', text: 'Completed', icon: 'fa fa-check' },
                                { id: 'Pending', text: 'Pending', icon: 'fas fa-star-half-alt' }
                            ]
                        },
                        { type: 'spacer' },
                        { type: 'button', id: 'btnData', text: 'Show Details', icon: 'fa fa-arrow-left', tooltip: 'Show/Hide Production Details' }
                    ],
                    onClick: function (event) {
                        console.log(event);
                        if (event.item.id === 'btnSelectors') {
                            toggleShowSelectors();
                        } else {
                            if (event.item.id === 'btnData') {
                                toggleShowData();
                            } else {
                                if (event.subItem) {
                                    switch (event.subItem.id) {
                                        case "All":
                                            transView = "ShowAllTransactions";
                                            break;
                                        case "Completed":
                                            transView = "ShowCompletedTransactions";
                                            break;
                                        case "Pending":
                                            transView = "ShowPendingTransactions";
                                            break;
                                    }
                                    if (isFiltered) getSavedDataByServiceArea(localStorage.getItem('areaId'));
                                    else getRecentSavedData();
                                }
                            }
                        }

                    }
                }
            },
            {
                type: 'right', size: '45%', resizable: true, hidden: false, style: pstyle, content: 'ATTRIBUTES/DATA CAPTURE', title: 'PRODUCTION DATA - DETAILS',
                toolbar: {
                    items: [
                        { type: 'button', id: 'btnExpand', text: 'Expand Details', icon: 'fa fa-arrow-left', tooltip: 'Expand Metrics/Attributes' },
                        { type: 'spacer' },
                        { type: 'button', id: 'btnSave', text: 'Save', img: 'save-icon', tooltip: 'Save Current Transaction' },
                    ],
                    onClick: function (event) {
                        switch (event.target) {
                            case "btnSave":
                                isClone ? submitButtonType = 0 : submitButtonType = 2;
                                break;
                            case "btnExpand":
                                toggleExpandDetails();
                                return;
                            case "btnExport":
                                //exportToCsv(false);
                                exportToPdf();
                                return;
                            default:
                        }
                        var f = document.getElementById("submitButton");
                        f.click();
                    }
                }
            },
            {
                type: 'bottom', size: 60, hidden: false, resizable: false, style: hstyle, content: '',
            }
        ]
    });
    w2ui['layout'].load('main', 'prodlog.html');
    w2ui['layout'].load('right', 'datametrics.html');
    w2ui['layout'].load('bottom', 'footer.html');
});

$(function () {
    $('#sidebar').w2sidebar({
        name: 'sidebar',
        flatButton: true,
        topHTML: '<div id="sidebarLabel" style="background-color: #eee; padding: 15px 5px; border-bottom: 1px solid silver"></div>',
        bottomHTML: '<div style="padding-bottom: 31px;"><a href="http://slcapoktaadmd2:83/" target="_blank">DTG</a></div> ',
        nodes: [
            {
                id: 'level-1', text: '[Client | Site | Location | Service Area]', img: 'icon-folder', expanded: true, group: true, groupShowHide: false
            },
        ],
        onCollapse(event) {
            event.preventDefault()
        },
        onFlat: function (event) {
            $('#sidebar').css('width', (event.goFlat ? '35px' : '300px'));
        }
    });
    w2ui.sidebar.on('click', function (event) {
        var grid = $("#gridContainer").dxDataGrid("instance");
        grid.clearFilter();

        localStorage.setItem('areaId', event.target);
        transView = "ShowAllTransactions";
        getSavedDataByServiceArea(event.target);
        //HACK: called 2x to prevent abnormal display of log/details
        w2ui.sidebar.goFlat();
        w2ui.sidebar.goFlat();
        //showData();
        //hideSelectors();
    });
    w2ui.sidebar.goFlat();
    //showData();
    toggleShowData();
    //hideSelectors();
});

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
            "CentralPrint_StringField31": { //CBPS Job Notes
                required: function (element) {
                    var status = $("#StringField5")[0].value;
                    if (status >= 5) return true;
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
            "CentralPrint_StringField32": { //Delivered by 
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
                    if (status >= 5) return true;
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
            { type: 'button', id: 'goldReports', text: 'Gold Reports', img: 'reports-icon', disabled: true },
            { type: 'break' },
            { type: 'button', id: 'platinumReports', text: 'Platinum Reports', img: 'microstrategy-icon', disabled: true },
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
                    { id: 'appSettings', text: 'App Settings', icon: 'fa fa-star' },
                    {
                        id: 'accountMaster', text: 'Account Maintenance', icon: 'fa fa-star', expanded: true,
                        items: [
                            { id: 'sm1_2', text: 'Client Info', icon: 'fa fa-picture-o' },
                            { id: 'sm1_3', text: 'Site Info', icon: 'fa fa-picture-o' },
                            { id: 'sm1_4', text: 'Location Info', icon: 'fa fa-picture-o' },
                            { id: 'sm1_5', text: 'Service Area Info', icon: 'fa fa-glass' },
                            { id: 'sm1_1', text: 'Approver Info', icon: 'fa fa-camera' }
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
                        'https://bi.cbpsportal.com/MicroStrategy/asp/Main.aspx',
                        '_blank' 
                    );
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
                    window.location.href = 'acctInfo.html';
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