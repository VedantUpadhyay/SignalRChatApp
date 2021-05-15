"use strict";


var connection;

$().ready(function () {
    var typingIndex = 0;
    var typingText = "....";
    var typingSpeed = "9";
    //AJAX LOADER
    //let body = $("body");

    //$(document).on({
    //    ajaxStart: function () {
    //        $(".modal").show();
    //        body.addClass("loading");
    //    },
    //    ajaxStop: function () {
    //        $(".modal").hide();
    //        body.removeClass("loading");
    //    }
    //});

    //Establishing Hub Connection
    connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();

    connection.start().then(function () {
        console.log("Connection established!!");
       // getOnlineUsers();
    }).catch(function (err) {
        return console.error(err.toString());
    });

    connection.on("SetTypingAnimation", function (typingUserEmail) {
        let friendItalk = $("#currentChatUser").val();

        

        //i am talking to to him/her..
        if (friendItalk != undefined && friendItalk == typingUserEmail) {
            console.log("Type animate..");
            
            console.log($(".sendAreaDiv:first-child").text());
        }
    });


    connection.on("ChangeActiveStatus", function (userEmail, status) {
        userEmail = userEmail.replace("@", "_");
        //console.log(userEmail, " " ,typeof userEmail);

        if (status == "online") {
            document.getElementById(userEmail).classList.add("status-online");
        }
        else if(status == "offline") {
            document.getElementById(userEmail).classList.remove("status-online");
        }
    });



    connection.on("ReceiveMessage", function (senderEmail, message) {
        console.log("Received..");
        let currentChatUser = $("#currentChatUser").val();
        document.getElementById("notifySound").play();

        //I ain't chatting with him/her..
        if (currentChatUser === undefined || currentChatUser != senderEmail) {
            
            var finderId = senderEmail.replace("@", "_") + "-pm";
            var pMCount = document.getElementById(finderId).innerText;

            //console.log("undef ", finderId, " ", typeof pMCount);

            if (pMCount != "") {
                document.getElementById(finderId).innerText = parseInt(pMCount) + 1;
            }
            else {
                document.getElementById(finderId).style.padding = "0.33rem";
                document.getElementById(finderId).innerText = 1;
            }
        }
        else if (currentChatUser == senderEmail) {
            //Updating Pending Messages..
            connection.invoke("UpdatePendingMessages", senderEmail).then(function (response) {
                console.log("Updated!");
            });
            setRecvMessageDiv(senderEmail, message);
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
                                console.log(`${value.chatName} ${value.email} is already your friend`);
                                openChat(value.chatName, value.email);
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

    //changing Winow title
    document.title = `${chatName.toUpperCase()} - Chat`;

    //chaning document title IMG
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = `/Images/${chatEmail}.jpg`;
    

    //Updating Pending Messages..
    connection.invoke("UpdatePendingMessages", chatEmail).then(function (response) {
        console.log("Updated!");
    });


    document.getElementById(chatEmail.replace("@", "_") + "-pm").innerText = "";
    document.getElementById(chatEmail.replace("@", "_") + "-pm").style.padding = "0";


    //Get Messages from DB
    //TO-DO : Load messages only once and store on LocalStorage
    $.ajax({
        type:"GET",
        url: "Customer/Home/GetMyMessages",
        data: {
            senderEmail: chatEmail
        },
        success: function (response) {
            if (response.success) {
                console.log(response.messages);

                fillChatArea(response.messages);

            }
            else {
                console.log("No new Messagess..");
            }
        },
        error: function (err) {
            console.log(err);
        }
    });

    let chatPane = $("#chat-pane");
    //emptying the chat-pane
    chatPane.empty();

    let upperDiv = document.createElement("div");
    //let bottomDiv = document.createElement("div");
    upperDiv.classList.add("upper-chat-div");

    
    let chatHeader = document.createElement("div");
    chatHeader.classList.add("chat-header");
    chatHeader.textContent = `${chatName}`;
    let hiddenCurrentChat = document.createElement("input");
    hiddenCurrentChat.type = "hidden";
    hiddenCurrentChat.setAttribute("value", chatEmail);
    hiddenCurrentChat.setAttribute("id", "currentChatUser");

    chatHeader.append(hiddenCurrentChat);
    upperDiv.appendChild(chatHeader);

    

    chatPane.append(upperDiv);

    let sendAreaDiv = document.createElement("div");
    sendAreaDiv.classList.add("sendAreaDiv");

    let messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.placeholder = "send a text..";
    messageInput.classList.add("rounded-pill");
    messageInput.classList.add("messageInput");

    //Typing animation
    messageInput.addEventListener("keydown", function (ev) {

        let userInput = ev.keyCode;
        let currentFriend = $("#currentChatUser").val();

        if (userInput != 13) {
            connection.invoke("TypingAnimate", currentFriend).then(function (response) {

            });
        }
    });

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

    let tpanDiv = document.createElement("div");
    tpanDiv.setAttribute("id", `${chatEmail.replace("@", "_")}-tp`);
    tpanDiv.classList.add("displayNone");
    tpanDiv.classList.add("typing-animate");
    tpanDiv.textContent = `${chatName} is typing..`;

    sendAreaDiv.appendChild(tpanDiv);

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

async function fillChatArea(myMessages) {
    let currentChatEmail = $("#currentChatUser").val();

    myMessages.forEach(function (item, index) {

        if (item.senderEmail === currentChatEmail) {
            setRecvMessageDiv(item.senderEmail, item.messageContent, item.sentTime);
        }
        else {
            setSentMessageDiv(item.messageContent, item.sentTime);
        }

    });
    $("#chat-pane .upper-chat-div").scrollTop($("#chat-pane .upper-chat-div").prop("scrollHeight"));
}


function sendMessage(chatEmail) {

    var messageToSend = $(".messageInput").val();

    if (messageToSend === "") {
        return;
    }

    connection.invoke("SendMessage", chatEmail, messageToSend).then(function (response) {
        setSentMessageDiv(messageToSend);

        $(".messageInput").val("");
    });
} 

async function getOnlineUsers() {
    var source = new EventSource('/Customer/Home/GetOnlineUsers');

    source.onmessage = function (event) {
        console.log('onmessage: ' + event.data);
    };

    source.onopen = function (event) {
        console.log('onopen');
    };

    source.onerror = function (event) {
        console.log('onerror');
        console.log(event);
        source.close();
    }
}

async function setSentMessageDiv(messageToSend,sentTimeString) {
    let chatPane = $("#chat-pane .upper-chat-div");

    let mainChatDiv = document.createElement("div");
    mainChatDiv.classList.add("msg-dateTime");
    mainChatDiv.classList.add("rounded");
    let timeToPrint = sentTimeString !== undefined ? sentTimeString : new Date().toLocaleString()
    mainChatDiv.textContent = `${timeToPrint}`;

    chatPane.append(mainChatDiv);

    let sentMessageDiv = document.createElement("div");
    sentMessageDiv.textContent = messageToSend;
    sentMessageDiv.classList.add("sent-msg");
    sentMessageDiv.classList.add("bg-success");
    sentMessageDiv.classList.add("rounded");

    chatPane.append(sentMessageDiv);
    chatPane.scrollTop(chatPane.prop("scrollHeight"));
}

async function setRecvMessageDiv(senderEmail, message, sentTimeString) {
    let currentChatUser = $("#currentChatUser").val();

    let timeToPrint = sentTimeString !== undefined ? sentTimeString : new Date().toLocaleString();

    let mainChatDiv = document.createElement("div");
    mainChatDiv.classList.add("msg-dateTime-recv");
    mainChatDiv.classList.add("rounded");
    mainChatDiv.textContent = `${timeToPrint}`;


    let recvDiv = document.createElement("div");
    recvDiv.textContent = message;
    recvDiv.classList.add("bg-primary");
    recvDiv.classList.add("recv-msg");
    recvDiv.classList.add("rounded");

    if (currentChatUser !== undefined) {
        if (currentChatUser === senderEmail) {
            $("#chat-pane .upper-chat-div").append(mainChatDiv);
            $("#chat-pane .upper-chat-div").append(recvDiv);
        }
    }
    $("#chat-pane .upper-chat-div").scrollTop($("#chat-pane .upper-chat-div").prop("scrollHeight"));
}