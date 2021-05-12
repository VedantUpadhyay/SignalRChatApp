"use strict";

var connection;

$().ready(function () {
    //Establishing Hub Connection
    connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();

    connection.start().then(function () {
        console.log("Connection established!!");
    }).catch(function (err) {
        return console.error(err.toString());
    });


    connection.on("ReceiveMessage", function (senderEmail, message) {
        var currentChatUser = $("#currentUserEmail").val();
        var recvMessageDiv = document.createElement("div");
        recvMessageDiv.style.borderTopRightRadius = "10px";
        recvMessageDiv.style.width = "50%";
        recvMessageDiv.style.width = "100px";
        recvMessageDiv.style.fontSize = "larger";
        recvMessageDiv.style.textAlign = "left";
        recvMessageDiv.style.marginBottom = "2px";
        recvMessageDiv.classList.add("bg-primary");
        recvMessageDiv.textContent = message;

        if (currentChatUser !== undefined) {
            if (currentChatUser === senderEmail) {
                $("#chat-pane").append(recvMessageDiv);
            }
        }

        

        

    });



   // $("#user-search-list").hide();

    $("#userSearch").keyup(function (event) {
        var searchContent = $("#userSearch").val();

        if (searchContent !== null || searchContent !== "") {
            $("#user-search-list").show();
            $.ajax({
                type: "GET",
                url: "/Customer/Home/GetMatchingUsers",
                data: {
                    userName: searchContent
                },
                success: function (response) {
                    fillDataList(response.users);
                    console.log(response);
                },
                error: function (err) {
                    console.log(err);
                }

            })
        }
    });

    $('body').click(function (e) {
        if ($(e.target).closest('#user-search-list').length === 0) {
            $("#userSearch").val("");
            $("#user-search-list").empty();
            $("#user-search-list").hide();
        }
    });
});

function fillDataList(usersList) {

    $("#user-search-list").empty();
    $.each(usersList, function (key, value) {
        //console.log(value);
        var liElem = $("<li>");
        liElem.addClass("list-group-item");
        liElem.text(value.chatName);
        $("#user-search-list").append(liElem);

        //Adding friends
        $(liElem).click(function () {
            var addIt = confirm(`Are you Sure, You want to add ${value.chatName} as a Friend?`);

            //wants to add as a friend
            if (addIt) {
                $.ajax({
                    type: "POST",
                    url: "Customer/Home/AddFriend",
                    data: {
                        friendEmail: value.email
                    },
                    success: function (response) {
                        if (response.success) {
                            console.log(`Added ${value.chatName}..`);
                        }
                        else {
                            if (response.alreadyFriend) {
                                console.log(`${value.chatName} is already your friend`);
                            }
                            else {
                                console.log("Somehting's wrong");
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            }

        });


        $(liElem).hover(function () {
            this.style.cursor = "pointer";
            this.classList.toggle("active");
        });
    });
    
}



//All ::Chatsettings here
function openChat(chatName, chatEmail) {
    
    $("#chat-pane").empty();
    var stickyHeader = ` <div class="header" id="myHeader">
  <h2>${chatName}</h2>
    <input id="currentUserEmail" type='hidden' value="${chatEmail}"/>
</div>`;
    var chatsDiv = `<div id='main-chats-div'></div>`;

    var messageTextArea = `<div id="sendMessageArea"><textarea contenteditable="true" id="messageBox"  class="form-control" placeholder="send a text.."></textarea><span><i onclick="sendMessage()" id="sendBtn" class="fas fa-paper-plane"></i ></span></div>`;

    $("#chat-pane").append(stickyHeader);
    $("#chat-pane").append(chatsDiv);
    $("#chat-pane").append(messageTextArea);
    $("#messageBox").focus();

    $("#sendMessageArea").keyup(function (event) {
        if (event.keyCode == 13) {
            console.log("Enter pressed.");
            sendMessage();
            $("#messageBox").val("");
        }
    });

    $("#chat-pane").scroll = function () { myFunction() };

    // Get the header
    var header = document.getElementById("myHeader");

    // Get the offset position of the navbar
    var sticky = header.offsetTop;

    // Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
    function myFunction() {
        if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    }
}

//Sending message
function sendMessage() {
    console.log("Sending..");
    var messageToSend = $("#messageBox").val();
    var currentChatUser = $("#currentUserEmail").val();

    if (messageToSend == "") {
        return;
    }

    $("#messageBox").val("");
    $("#messageBox").focus();
    connection.invoke("SendMessage", currentChatUser, messageToSend).then(function (response) {

        if (response !== undefined) {
            var recvMessageDiv = document.createElement("div");
            recvMessageDiv.style.borderTopRightRadius = "10px";
            recvMessageDiv.style.width = "35%";
            recvMessageDiv.style.height = "fit-content()";
            recvMessageDiv.style.marginLeft = "auto";
            recvMessageDiv.style.marginRight = "0";
            recvMessageDiv.style.fontSize = "larger";
            recvMessageDiv.style.padding = "1%";
            recvMessageDiv.style.textAlign = "left";
            recvMessageDiv.style.marginBottom = "2px";
            recvMessageDiv.classList.add("bg-success");
            recvMessageDiv.textContent = messageToSend;

            $("#chat-pane").append(recvMessageDiv);
        }

        console.log(response);
    });
}

