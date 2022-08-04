function sso() {
    const config = {
        auth: {
            clientId: '91be1c6c-891e-4bd6-b876-b67f5606020d',
            authority: 'https://login.microsoftonline.com/869c0d1d-42e3-4230-a045-be018a9ea361',
            redirectUri: 'https://localhost:44392'
        },
        cache: {
            cacheLocation: "sessionStorage",
            storeAuthStateInCookie: false
        }
    }

    const myMSALObj = new Msal.UserAgentApplication(config);

    const loginRequest = {
        scopes: ["openid", "profile", "user.read"]
    }

    myMSALObj.loginPopup(loginRequest).then((loginResponse) => {

        console.log("Response => ", JSON.stringify(loginResponse));
        const accessTokenRequest = {
            //scopes: ["api://7af858ea-81ec-486e-b7b1-a34ba4db4730/.default"]
            scopes: ["api://210c9336-7d09-45d2-99f2-d6a55755831b/.default"]
        };

        myMSALObj.acquireTokenSilent(accessTokenRequest).then((accessTokenResponse) => {

            let accessToken = accessTokenResponse.accessToken;
            let bearer = "Bearer " + accessToken;
            var decoded = jwt_decode(accessToken);
            //console.log(decoded);
            //let userEmail = decoded.upn;
            let userEmail = decoded.preferred_username;
            //for testing
            //userEmail = "bbeltran@cbps.canon.com";

            //let apiEndPoint = "https://localhost:44326/hello";
            let apiEndPoint = "https://localhost:44326/api/users/" + userEmail;

            $.ajax({
                url: apiEndPoint,
                type: "GET",
                //data: { "email": userEmail },
                //dataType: "json",
                beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', bearer) }
            }).done((result) => {
                console.log('user: ' + result);
                if (result != undefined || result != null) {
                    $(".div-signin-loading img").addClass("hidden").hide();
                    $("#btnLogin").disabled = false;
                    $("footer").hide();
                    $("#divError").hide();
                    sessionStorage.setItem("accessToken", accessToken);
                    sessionStorage.setItem("email", userEmail);
                    let user = result;
                    sessionStorage.setItem("userName", user.Name);
                    sessionStorage.setItem("accountType", user.AccountType);
                    window.location.href = 'https://localhost:44392/index3.html';
                }
                else {
                    $("#btnLogin").removeClass("disabled");
                    $("footer").hide();
                    $("#btnLogin").disabled = false;
                    $("#hModalTitle").text("ERROR");
                    $("#divErrorText").text("User is not registered/authorized to use the application.");
                    $("#btnLogin").removeClass("hidden").show();
                    $(".div-signin-loading img").addClass("hidden").hide();
                    $("#myModal").modal("show");
                }
                //sessionStorage.setItem("data", JSON.stringify(data));
                //sessionStorage.setItem("accessToken", data.access_token);
                //sessionStorage.setItem("accountType", data.accountType);
                //sessionStorage.setItem("accountType", "A");
                //window.location.href = data.clientId == 0 ? "reset.html" : home;

            }).fail((err) => {
                console.log("ERROR => ", err);
                $("#btnLogin").removeClass("disabled");
                $("footer").hide();
                $("#btnLogin").disabled = false;
                if (err.status == 500) {
                    $("#hModalTitle").text("ERROR");
                    $("#divErrorText").text("Oops! Something went wrong! Please contact your BI administrator.");
                }
                else {
                    //$("#hModalTitle").text(err.responseJSON.error);
                    //$("#divErrorText").text(err.responseJSON.error_description);
                }
                $("#btnLogin").removeClass("hidden").show();
                $(".div-signin-loading img").addClass("hidden").hide();
                $("#myModal").modal("show");
            })

        });
    });
}
