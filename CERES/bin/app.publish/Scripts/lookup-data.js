const statuses = [{
    id: 1, name: 'Not Started',
}, {
    id: 2, name: 'In Progress',
}, {
    id: 3, name: 'Deferred',
}, {
    id: 4, name: 'Need Assistance',
}, {
    id: 5, name: 'Completed',
},
];

const clientStatus = [{
    id: 'Active', name: 'Active',
}, {
    id: 'Closed', name: 'Closed',
},
];

//let baseUrl = "";
//let sessionEmail = sessionStorage.getItem("email");
//let sessionToken = sessionStorage.getItem("accessToken");
//let headerToken = {
//    "Authorization": "Bearer " + sessionToken
//};
//const url = baseUrl + "api/Client";

//const clients = DevExpress.data.AspNet.createStore({
//    key: 'Value',
//    loadUrl: `${url}/ClientLookup`,
//    onBeforeSend(method, ajaxOptions) {
//        ajaxOptions.headerToken = headerToken;
//        ajaxOptions.xhrFields = { withCredentials: true };
//    },
//});
