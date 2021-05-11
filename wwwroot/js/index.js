"use strict";


$().ready(function () {
    //Establishing Hub Connection
    var connection = new signalR.HubConnectionBuilder().withUrl("/hub").build();

    connection.start().then(function () {
        console.log("Connection established!!");
    }).catch(function (err) {
        return console.error(err.toString());
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
</div>`;
    var chatsDiv = `<div id='main-chats-div'><h3>hey</h3></div>`;

    var messageTextArea = `<div contenteditable="true" id="sendMessageArea" class="form-control" placeholder="send a text.."></div>`;

    $("#chat-pane").append(stickyHeader);
    $("#chat-pane").append(chatsDiv);
    $("#chat-pane").append(messageTextArea);

    window.onscroll = function () { myFunction() };

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