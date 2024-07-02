let GameID = null;
let GameChoice = "heads";

if (window.location.protocol == "https:") {
	var ws_scheme = "wss://";
} else {
	var ws_scheme = "ws://"
};

var games_socket = io.connect(ws_scheme + location.host + "/games");

games_socket.on('game_created', function(data) {
    console.log(data)
    var gameItem = $('<div id="' + data.gid + '" class="game_holder_item"></div>');

    var activeSide = data.heads.username !== null ? data.heads : data.tails;

    var heads = $('<img id="' + data.gid + '_heads_image" class="user_profile" src="' + (data.heads.thumbnail === null ? '../static/img/headsbig.png' : data.heads.thumbnail) + '">');
    var tails = $('<img id="' + data.gid + '_tails_image" class="user_profile" style="margin-right: 50px;" src="' + (data.tails.thumbnail === null ? '../static/img/tailsbig.png' : data.tails.thumbnail) + '">');


    if (data.winner === "heads") {
        console.log(data.winner);
        heads.addClass("user_profile active");
    } else if (data.winner === "tails") {
        console.log(data.winner);
        tails.addClass("user_profile active");
    }

    gameItem.append(heads);
    gameItem.append(tails);

    var gameItemsDiv = $('<div class="game_items"></div>');
    for (var i = 0; i < Math.min(activeSide.pets.length, 4); i++) {
        gameItemsDiv.append('<img class="game_pet user_profile" src="' + activeSide.pets[i].thumbnail + '">');
    }

    var remainingItems = activeSide.pets.length - 4;
    if (remainingItems > 0) {
        gameItemsDiv.append('<h1 class="text_glow mid remaining_items">+' + remainingItems + '</h1>');
    }

    gameItem.append(gameItemsDiv);

    var gameButtonsDiv = $('<div class="game_buttons"></div>');
    var value = FormatNumber(data.value);
    var minValue = FormatNumber(data.value * 0.9);
    var maxValue = FormatNumber(data.value * 1.1);

    var winnerClass = data.winner ? "animate-" + data.winner : "";

    var view = `
                    <div id="${data.gid}_modal" class="modal game">
                        <div class="modal game inside">
                        <img style="position: absolute; width: 250px; top: 40px;" src="../static/img/sidebarlogo.png">
                            <div>
                                <img id="${data.gid}_heads_image_modal" class="user_profile ${data.winner === 'heads' ? 'active' : ''}" src="${(data.heads.thumbnail === null ? '../static/img/waiting.png' : data.heads.thumbnail)}">
                                <img style="position: absolute; width: 50px; margin-left: -140px; margin-top: 90px;" src="../static/img/headsbig.png">
                                <p class="usernamecf" style="max-width: 130px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(data.heads.thumbnail === null ? 'Waiting..' : data.heads.username)}</p>
                            </div>
                            <div style="display: ${data.winner ? 'block' : 'none'};" id="${data.gid}_coin" class='coin ${winnerClass}'>
                                <div id="heads" class="heads"></div>
                                <div id="tails" class="tails"></div>
                            </div>
                            <p id="${data.gid}_status" style="font-weight: bold; font-size: 75px; display: ${data.winner ? 'none' : 'block'};">VS</p>
                            <div>
                                <img id="${data.gid}_tails_image_modal" class="user_profile ${data.winner === 'tails' ? 'active' : ''}" src="${(data.tails.thumbnail === null ? '../static/img/waiting.png' : data.tails.thumbnail)}">
                                <img style="position: absolute; width: 50px; margin-left: -140px; margin-top: 90px;" src="../static/img/tailsbig.png">
                                <p class="usernamecf" style="max-width: 130px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(data.tails.thumbnail === null ? 'Waiting..' : data.tails.username)}</p>
                            </div>
                            <div onclick="HidePopup('${data.gid}_modal')" id="login_modal_1_close" class="modal_close">
                                <svg style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="var(--color-text1st)" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                `;

    $("#modals").append(view)

    gameButtonsDiv.append('<div style="width: 700px; margin-top: -15px; margin-right: 10px;">' +
        '<h1 style="color: var(--color-text1st); margin: 0;">$' + value + '</h1>' +
        '<h3 style="color: var(--color-text2nd); margin: 0;">$' + minValue + ' - $' + maxValue + '</h3>' +
        '</div>');

    if (data.active == true) {
        var joinButton = $('<button style="margin-right: 10px; width: 250px;" class="button button_glow game">Join</button>');
        joinButton.click(function() {
            WalletClick("join_click");
            GameID = data.gid;
        });
    } else {
        var joinButton = $('<button style="margin-right: 10px; width: 250px;" class="button button_glow game disabled">Join</button>');
        joinButton.click(function() {
            Notification("The game has already ended!", "Error", 3000);
        });
    }

    gameButtonsDiv.append(joinButton);

    const viewButton = $('<button style="width: 250px;" class="button button_glow game2">View</button>');
    gameButtonsDiv.append(viewButton);

    viewButton.click(function() {
        ShowPopup(data.gid + "_modal");
    });

    gameItem.append(gameButtonsDiv);

    $('#game_holder').append(gameItem);

    $('#total_games').text(data.stats.total_games)
    $('#total_value').text(FormatNumber(data.stats.total_value))
    $('#total_joinable').text(data.stats.total_joinable)
});

games_socket.on('game_ended', function(data) {
    console.log(data)
    $("#" + data.gid + "_status").hide();
    $("#" + data.gid + "_coin").show();
    $("#" + data.gid + "_heads_image_modal").attr('src', data.heads.thumbnail);
    $("#" + data.gid + "_tails_image_modal").attr('src', data.tails.thumbnail);

    setTimeout(() => {
        $("#" + data.gid + "_coin").addClass("animate-" + data.winner);
    }, 3000);
    setTimeout(() => {
        $("#" + data.gid + "_" + data.winner + "_image_modal").addClass("active");
    }, 5500);

    $("#" + data.gid).remove();
    let wonValue = 0;
    var gameItem = $('<div id="' + data.gid + '" class="gameitem"></div>');
    var activeSide = data.heads.username !== null ? data.heads : data.tails;

    data.heads.pets.forEach(function(pet) {
        wonValue = wonValue + pet.value
    })

    data.tails.pets.forEach(function(pet) {
        wonValue = wonValue + pet.value
    })

    var gameItem = $('<div id="' + data.gid + '" class="game_holder_item"></div>');

    var activeSide = data.heads.username !== null ? data.heads : data.tails;

    var heads = $('<img id="' + data.gid + '_heads_image" class="user_profile" src="' + (data.heads.thumbnail === null ? '../static/img/headsbig.png' : data.heads.thumbnail) + '">');
    var tails = $('<img id="' + data.gid + '_tails_image" class="user_profile" style="margin-right: 50px;" src="' + (data.tails.thumbnail === null ? '../static/img/tailsbig.png' : data.tails.thumbnail) + '">');

    if (data.winner === "heads") {
        console.log(data.winner);
        heads.addClass("user_profile active");
    } else if (data.winner === "tails") {
        console.log(data.winner);
        tails.addClass("user_profile active");
    }

    gameItem.append(heads);
    gameItem.append(tails);

    var gameItemsDiv = $('<div class="game_items"></div>');
    for (var i = 0; i < Math.min(activeSide.pets.length, 4); i++) {
        gameItemsDiv.append('<img class="game_pet user_profile" src="' + activeSide.pets[i].thumbnail + '">');
    }

    var remainingItems = activeSide.pets.length - 4;
    if (remainingItems > 0) {
        gameItemsDiv.append('<h1 class="text_glow mid remaining_items">+' + remainingItems + '</h1>');
    }

    gameItem.append(gameItemsDiv);

    var gameButtonsDiv = $('<div class="game_buttons"></div>');
    var value = FormatNumber(data.value);
    var minValue = FormatNumber(data.value * 0.9);
    var maxValue = FormatNumber(data.value * 1.1);

    gameButtonsDiv.append('<div style="width: 700px; margin-top: -15px; margin-right: 10px;">' +
        '<h1 style="color: var(--color-text1st); margin: 0;">$' + value + '</h1>' +
        '<h3 style="color: var(--color-text2nd); margin: 0;">$' + minValue + ' - $' + maxValue + '</h3>' +
        '</div>');

    if (data.active == true) {
        var joinButton = $('<button style="margin-right: 10px; width: 250px;" class="button button_glow game">Join</button>');
        joinButton.click(function() {
            WalletClick("join_click");
            GameID = data.gid;
        });
    } else {
        var joinButton = $('<button style="margin-right: 10px; width: 250px;" class="button button_glow game disabled">Join</button>');
        joinButton.click(function() {
            Notification("The game has already ended!", "Error", 3000);
        });
    }

    gameButtonsDiv.append(joinButton);

    const viewButton = $('<button style="width: 250px;" class="button button_glow game2">View</button>');
    gameButtonsDiv.append(viewButton);

    viewButton.click(function() {
        ShowPopup(data.gid + "_modal");
    });

    gameItem.append(gameButtonsDiv);

    $('#game_holder').append(gameItem);

    $('#total_games').text(data.stats.total_games)
    $('#total_value').text(FormatNumber(data.stats.total_value))
    $('#total_joinable').text(data.stats.total_joinable)
})

function GetGames() {
    superagent.get("/api/coinflip/get")
        .end((Error, Result) => {
            if (Error) {
                console.log(Error);
            }

            if (Result.body.error) {
                Notification(Result.body.message, "Error", 3000);
                return;
            }

            Result.body.games.forEach(function(data) {
                var gameItem = $('<div id="' + data.gid + '" class="game_holder_item"></div>');

                var activeSide = data.heads.username !== null ? data.heads : data.tails;

                var heads = $('<img id="' + data.gid + '_heads_image" class="user_profile" src="' + (data.heads.thumbnail === null ? '../static/img/headsbig.png' : data.heads.thumbnail) + '">');
                var tails = $('<img id="' + data.gid + '_tails_image" class="user_profile" style="margin-right: 50px;" src="' + (data.tails.thumbnail === null ? '../static/img/tailsbig.png' : data.tails.thumbnail) + '">');

                if (data.winner === "heads") {
                    console.log(data.winner);
                    heads.addClass("user_profile active");
                } else if (data.winner === "tails") {
                    console.log(data.winner);
                    tails.addClass("user_profile active");
                }

                gameItem.append(heads);
                gameItem.append(tails);

                var gameItemsDiv = $('<div class="game_items"></div>');
                for (var i = 0; i < Math.min(activeSide.pets.length, 4); i++) {
                    gameItemsDiv.append('<img class="game_pet user_profile" src="' + activeSide.pets[i].thumbnail + '">');
                }

                var remainingItems = activeSide.pets.length - 4;
                if (remainingItems > 0) {
                    gameItemsDiv.append('<h1 class="text_glow mid remaining_items">+' + remainingItems + '</h1>');
                }

                gameItem.append(gameItemsDiv);

                var gameButtonsDiv = $('<div class="game_buttons"></div>');
                var value = FormatNumber(data.value);
                var minValue = FormatNumber(data.value * 0.9);
                var maxValue = FormatNumber(data.value * 1.1);

                var winnerClass = data.winner ? "animate-" + data.winner : "";

                var view = `
                    <div id="${data.gid}_modal" class="modal game">
                        <div class="modal game inside">
                        <img style="position: absolute; width: 250px; top: 40px;" src="../static/img/sidebarlogo.png">
                            <div>
                                <img id="${data.gid}_heads_image_modal" class="user_profile ${data.winner === 'heads' ? 'active' : ''}" src="${(data.heads.thumbnail === null ? '../static/img/waiting.png' : data.heads.thumbnail)}">
                                <img style="position: absolute; width: 50px; margin-left: -140px; margin-top: 90px;" src="../static/img/headsbig.png">
                                <p class="usernamecf" style="max-width: 130px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(data.heads.thumbnail === null ? 'Waiting..' : data.heads.username)}</p>
                            </div>
                            <div style="display: ${data.winner ? 'block' : 'none'};" id="${data.gid}_coin" class='coin ${winnerClass}'>
                                <div id="heads" class="heads"></div>
                                <div id="tails" class="tails"></div>
                            </div>
                            <p id="${data.gid}_status" style="font-weight: bold; font-size: 75px; display: ${data.winner ? 'none' : 'block'};">VS</p>
                            <div>
                                <img id="${data.gid}_tails_image_modal" class="user_profile ${data.winner === 'tails' ? 'active' : ''}" src="${(data.tails.thumbnail === null ? '../static/img/waiting.png' : data.tails.thumbnail)}">
                                <img style="position: absolute; width: 50px; margin-left: -140px; margin-top: 90px;" src="../static/img/tailsbig.png">
                                <p class="usernamecf" style="max-width: 130px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(data.tails.thumbnail === null ? 'Waiting..' : data.tails.username)}</p>
                            </div>
                            <div onclick="HidePopup('${data.gid}_modal')" id="login_modal_1_close" class="modal_close">
                                <svg style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="var(--color-text1st)" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                    <path d="M18 6 6 18"></path>
                                    <path d="m6 6 12 12"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                `;

                $("#modals").append(view)

                gameButtonsDiv.append('<div style="width: 700px; margin-top: -15px; margin-right: 10px;">' +
                    '<h1 style="color: var(--color-text1st); margin: 0;">$' + value + '</h1>' +
                    '<h3 style="color: var(--color-text2nd); margin: 0;">$' + minValue + ' - $' + maxValue + '</h3>' +
                    '</div>');

                if (data.active == true) {
                    var joinButton = $('<button style="margin-right: 10px; width: 250px;" class="button button_glow game">Join</button>');
                    joinButton.click(function() {
                        WalletClick("join_click");
                        GameID = data.gid;
                    });
                } else {
                    var joinButton = $('<button style="margin-right: 10px; width: 250px;" class="button button_glow game disabled">Join</button>');
                    joinButton.click(function() {
                        Notification("The game has already ended!", "Error", 3000);
                    });
                }

                gameButtonsDiv.append(joinButton);

                const viewButton = $('<button style="width: 250px;" class="button button_glow game2">View</button>');
                gameButtonsDiv.append(viewButton);

                viewButton.click(function() {
                    ShowPopup(data.gid + "_modal");
                });

                gameItem.append(gameButtonsDiv);

                $('#game_holder').append(gameItem);
            })

            $('#total_games').text(Result.body.stats.total_games)
            $('#total_value').text(FormatNumber(Result.body.stats.total_value))
            $('#total_joinable').text(Result.body.stats.total_joinable)
        })
}

function JoinGame() {
    setTimeout(() => {
        HidePopup("wallet_modal");
    }, 1000);

    superagent.post("/api/coinflip/join")
        .send({
            "items": SelectedItems,
            "gid": GameID
        })
        .end((Error, Result) => {
            if (Error) {
                console.log(Error);
            }

            if (Result.body.error === true) {
                Notification(Result.body.message, "Error", 3000);
                return;
            }

            Notification(Result.body.message, "Success", 3000);
            ShowPopup(GameID + "_modal")
        });
}

function CreateGame() {
    setTimeout(() => {
        HidePopup("wallet_modal");
    }, 1000);

    superagent.post("/api/coinflip/create")
        .send({
            "items": SelectedItems,
            "choice": GameChoice
        })
        .end((Error, Result) => {
            if (Error) {
                console.log(Error);
            }

            if (Result.body.error === true) {
                Notification(Result.body.message, "Error", 3000);
                return;
            }
            
            Notification(Result.body.message, "Success", 3000);
        });
}

function SelectCoin(choice = "heads") {
    if (choice === "heads") {
        $('#heads_select, #tails_select').removeClass('dark');
        $("#tails_select").addClass('dark');
        GameChoice = "heads"
    } else {
        $('#heads_select, #tails_select').removeClass('dark');
        $("#heads_select").addClass('dark');
        GameChoice = "tails"
    }
}

$(document).ready(function() {
    // Load Data

    GetGames();

    // Site Functions

    $("#create_game").on("click", function() {
        WalletClick("create_menu");
    })

    $("#join_click").on("click", function() {
        JoinGame();
    })

    $("#create_game_btn").on("click", function() {
        CreateGame();
    })

    $("#heads_select").on("click", function() {
        SelectCoin("heads");
    })

    $("#tails_select").on("click", function() {
        SelectCoin("tails");
    })

    $("#wallet_modal_close").on("click", function() {
        HidePopup("wallet_modal");
    })

    // Finish Loading

    $("#loading_screen").hide();
});