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
        console.log("Received..");
        let currentChatUser = $("#currentChatUser").val();

        let recvDiv = document.createElement("div");
        recvDiv.textContent = message;
        recvDiv.classList.add("bg-primary");
        recvDiv.classList.add("recv-msg");
        recvDiv.classList.add("rounded");

        if (currentChatUser !== undefined) {
            if (currentChatUser === senderEmail) {
                $("#chat-pane").append(recvDiv);
            }
        }

    });


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

$(window).keydown(function (e) {
    if (e.keyCode == 27) {
        $("#userSearch").val("");
        $("#user-search-list").empty();
        $("#user-search-list").hide();
    }
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
            $("#userSearch").val("");
            $("#user-search-list").empty();
            $("#user-search-list").hide();
        });


        $(liElem).hover(function () {
            this.style.cursor = "pointer";
            this.classList.toggle("active");
        });
    });
    
}



//All ::Chatsettings here
function openChat(chatName, chatEmail) {
    let chatPane = $("#chat-pane");
    //emptying the chat-pane
    chatPane.empty();

    let chatHeader = document.createElement("div");
    chatHeader.classList.add("chat-header");
    chatHeader.textContent = `${chatName}`;
    let hiddenCurrentChat = document.createElement("input");
    hiddenCurrentChat.type = "hidden";
    hiddenCurrentChat.setAttribute("value", chatEmail);
    hiddenCurrentChat.setAttribute("id", "currentChatUser");
    chatHeader.append(hiddenCurrentChat);

    chatPane.append(chatHeader);

    let sendAreaDiv = document.createElement("div");
    sendAreaDiv.classList.add("sendAreaDiv");

    let messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.placeholder = "send a text..";
    messageInput.classList.add("rounded-pill");
    messageInput.classList.add("messageInput");

    let sendButton = document.createElement("span");
    sendButton.classList.add("rounded");
    let sendFA = document.createElement("i");
    sendFA.classList.add("fas");
    sendFA.classList.add("fa-paper-plane");
    sendButton.appendChild(sendFA);
    sendButton.classList.add("sendButton");

    sendButton.onclick = function (e) {
        sendMessage(chatEmail);
    }

    sendAreaDiv.appendChild(messageInput);
    sendAreaDiv.appendChild(sendButton);

   
    chatPane.append(sendAreaDiv);
    messageInput.focus();
    messageInput.onkeypress = function (e) {
        if (e.keyCode == 13) {
            sendMessage(chatEmail);
        }
    }

}

function sendMessage(chatEmail) {

    var messageToSend = $(".messageInput").val();
    
    connection.invoke("SendMessage", chatEmail, messageToSend).then(function (response) {
        let chatPane = $("#chat-pane");

        let sentMessageDiv = document.createElement("div");
        sentMessageDiv.textContent = messageToSend;
        sentMessageDiv.classList.add("sent-msg");
        sentMessageDiv.classList.add("bg-success");
        sentMessageDiv.classList.add("rounded-sm");

        chatPane.append(sentMessageDiv);

        $(".messageInput").val("");
    });
}