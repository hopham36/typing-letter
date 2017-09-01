$(document).ready(function () {
    var _href = location.href,
        room = _href.substr(_href.lastIndexOf('/') + 1);

    function player(user) {
        this.id = "";
        this.name = user.name;
        this.isBot = false;
        this.email = user.email;
        this.avatar = "https://www.gravatar.com/avatar/" + $.md5(user.email);
        this.score = 0;
        this.color = "#d94f5c";
        this.colorList = ["#d94f5c", "#63f8d3", "#5b9ce3", "#4ece77", "#6a1b9a", "#d94f5c", "#212121", "#455a64", "#d50000", "#009688"];
        this.init = function (_c) {
            var self = this;
            self.color = self.colorList[_c - 1];
        };
        this.render = function () {
            var self = this;
            $("[data-players]").append(self.itemTemplate());
        };
        this.generateAvatar = function () {
            var self = this;
            var html = "<div class='_55lq1'><div size='25' class='_55lt' style='width: 25px; height: 25px;'><img src='" + self.avatar + "' width='25' height='25'></div></div>";

            return html;
        };
        this.itemTemplate = function () {
            var self = this;
            var html = "<li><div class='_55lp'>" + self.generateAvatar() +
                "<div class=\"_5bon _5bon1\"><div class=\"_568z\"><span data-ol></span><span style='background: " + self.color + "' class='label label-default' id='" + self.id + "'>" + self.score + "</span></div></div>" +
                "<div class=\"_55lr\" style='" + (self.isBot ? "color:red" : "") + "' title='" + self.name + "'>" + self.name + "</div></div></li>";

            return html;
        };

        return this;
    }


    function typingWord() {
        this.isInitChat = false;
        this.isInitPlayer = false;
        this.isFocus = true;
        this.isHost = false;
        this.isPlayed = false;
        this.isInit = false;
        this.inGameChat = false;
        this.items = [];
        this.lastItems = "";
        this.currentIndex = 0;
        this.ranges = 25;
        this.ListRanges = [25, 50, 75];
        this.hasWinner = false;
        this.selectedMode = 1;
        this.mode = {
            normal: 1,
            hard: 2
        };
        this.ListModes = [1, 2];
        this.numberOfPlayers = 0;

        this.mainPlayer = null;
        this.players = [];

        this.generateWinner = function () {
            var self = this;
            self.hasWinner = true;
            var maxNumber = 0
            self.players.map(function (obj) {
                if (obj.score > maxNumber) maxNumber = obj.score;
            });
            var winPlayers = $.grep(self.players, function (obj) {
                return obj.score == maxNumber;
            });

            var html = "";
            html = "<div style='margin-top:10px;font-size: 25px;'>Congratulation to ";
            $.each(winPlayers, function (i, p) {
                if (i > 0) {
                    html += "+ ";
                }
                html += "<span style='color: " + p.color + "' >" + p.name + " </span>";
            })
            html += "!!!</div>";

            $("body").append($("<div id='divMess' class='well well-lg' style='text-align:center; top:25%; width:50%; position: fixed;left:25% '>").html(html));
            if (self.isHost) {
                $("#divMess").append("<div style='text-align:center;margin-top: 50px;'></div>");
                $("#divMess>div:last").append(
                    $("<input type='button' value='Play again' class='btn btn-danger' />").click(function () {
                        var genId = Math.floor(Math.random() * 26) + Date.now();
                        genId++;
                        setTimeout(function () {
                            socket.on(room).emit('changeRoom', {
                                roomName: genId,
                                frm: Global.user.name
                            });
                            window.location.href = "/tw/game/" + genId;
                        }, 1000);
                    })
                );
            }
        };
        this.completeWord = function (data) {
            var self = this, tmpScore = 0;

            if (self.hasWinner)
                return;
            self.currentIndex = data.currentIndex;

            $.grep(self.players, function (i, a) { if (i.id == data.id) { i.score++; tmpScore = i.score; } })
            $("#" + data.id).text(tmpScore);
            if (self.currentIndex == self.items.length) {
                self.generateWinner();
            } else {
                $("[data-current-text]").find(".match").text('');
                $("[data-current-text]").find(".unmatch").text(self.items[self.currentIndex]);
            }
        };
        this.sendChat = function () {
            var self = this;
            var data = {
                content: $("[data-chat-input]").val().trim(),
                player: self.mainPlayer,
            };
            socket.on(room).emit('chat', data);
            self.buildChat(data);
            $("[data-chat-input]").val("");
        };
        this.initChat = function () {
            var self = this;
            self.isInitChat = true;
            $("[data-chat-input]").on("keypress", function (e) {
                if (e.which == 13 && $("[data-chat-input]").val().trim() != "") {
                    self.sendChat();
                }
            })

            $("[data-chat-submit]").on("click", function () {
                if ($("[data-chat-input]").val().trim() != "") {
                    self.sendChat();
                }
            })
        };
        this.buildChat = function (data) {
            var self = this,
                player = data.player;
            var generateAvatar = function (player) {
                var html = "<div class='_55lq1'><div size='25' class='_55lt' style='width: 25px; height: 25px;'><img src='" + player.avatar + "' width='25' height='25'></div></div>";

                return html;
            };
            var itemTemplate = function (player, content) {
                if (self.inGameChat) {
                    var html = "<div class='inGameChat'><span class='inGame_title'>" + player.name + "</span>: <span class='ctn'></span></div>";
                    return html;
                }
                else {
                    var html = "<li><div class='_55lp'>" + generateAvatar(player) +
                        "<div class=\"_5bon _5bon1\"><div class=\"_568z\"></div></div>" +
                        "<div class=\"_55lr _55lr2\"><span style='color: " + player.color + "'>" + player.name + "</span>: <span class='ctn'></span></div></div></li>";

                    return html;
                }
            };
            var $returnHtml = $(itemTemplate(player, data.content));
            $returnHtml.find(".ctn").text(data.content);
            if (self.inGameChat) {
                $returnHtml.appendTo("body").animate({
                    bottom: "toggle"
                }, 2500, function () {
                    $(this).css("bottom", "250px"); $(this).remove();
                });
            } else {
                $("[data-chat-content]").append($returnHtml);
                $("[data-chat-content]").animate({ scrollTop: $("[data-chat-content]")[0].scrollHeight }, "slow");
            }

        };
        this.bindTypingWord = function () {
            var self = this;
            $("[data-chat-input]").focus(function () {
                self.isFocus = false;
            }).focusout(function () {
                self.isFocus = true;
            })
            $(document).keypress(function (event) {
                if (!self.isFocus)
                    return;
                var currentElPress = $("[data-current-text]"),
                    matchSpan = currentElPress.find(".match"),
                    unmatchSpan = currentElPress.find(".unmatch"),
                    unmatchText = unmatchSpan.text(),
                    inputChar;

                // if ($.browser.msie || $.browser.opera) {
                //     inputChar = String.fromCharCode(event.which);
                // } else {
                //     inputChar = String.fromCharCode(event.charCode);
                // }
                inputChar = String.fromCharCode(event.charCode);

                if (inputChar == unmatchText.charAt(0)) {
                    unmatchSpan.text(unmatchText.replace(inputChar, ""));
                    matchSpan.append(inputChar);
                    if (unmatchText.length == 1) {
                        self.currentIndex++;
                        if (self.currentIndex == self.items.length) {
                            self.generateWinner();
                        } else {
                            $("[data-current-text]").find(".match").text('');
                            $("[data-current-text]").find(".unmatch").text(self.items[self.currentIndex]);
                        }
                        var _id = self.mainPlayer.id, tmpScore = 0;
                        $.grep(self.players, function (i, a) { if (i.id == _id) { i.score++; tmpScore = i.score; } })
                        $("#" + _id).text(tmpScore);
                        socket.on(room).emit('selectNumber', {
                            currentIndex: self.currentIndex,
                            id: _id
                        });
                    }
                }
            });
        }
        this.suffle = function (a) {
            for (let i = a.length; i; i--) {
                let j = Math.floor(Math.random() * i);
                [a[i - 1], a[j]] = [a[j], a[i - 1]];
            }

            return a;
        };
        this.deactiveRoom = function () {
            var postData = {};
            postData.roomName = room;
            postData.creator = Global.user.name;
            $.ajax({
                type: 'POST',
                data: JSON.stringify(postData),
                contentType: 'application/json',
                url: '/tw/game/deactiveRoom',
                success: function (data) { }
            });
        };
        this.startGame = function () {
            var self = this;
            self.isPlayed = true;
            self.ranges = parseInt($("[name=optradio]:checked").eq(0).val());

            if (isNaN(self.ranges) || self.ListRanges.indexOf(self.ranges) == -1) {
                self.ranges = 50;
            }

            var mode = parseInt($("[name=optMode]:checked").eq(0).val());
            if (isNaN(mode) || self.ListModes.indexOf(mode) == -1) {
                self.selectedMode == self.mode.normal;
            } else {
                self.selectedMode = mode;
            }
            var twCode = self.selectedMode == self.mode.normal ? "easy" : "hard";
            $.getJSON('/twItems/' + twCode + '.json', function (jsData) {
                self.items = self.suffle(jsData).slice(0, self.ranges);

                socket.on(room).emit('startGame');
                var t = 6;
                self.init("host");
                self.deactiveRoom();

                var a = setInterval(function () {
                    t--;
                    var html = "<div>game start in <span style='color:red'>" + t.toString() + "</span> second..</div>";
                    $("[data-chat-content]").append(html);
                    $("[data-chat-content]").animate({ scrollTop: $("[data-chat-content]")[0].scrollHeight }, "slow");
                    if (t == 0) {
                        clearInterval(a);
                        if (self.isBot) {
                            self.startAI();
                        }
                    }
                }, 1000)
                setTimeout(function () {
                    $("#divOption").hide();
                    $("#frContainer").hide();
                    $("[data-conatainer]").show();
                    self.inGameChat = true;
                    $("[data-chat-input]").appendTo("#inGameContent");
                    socket.on(room).emit('initGameToOther', {
                        data: self
                    });
                }, 5000);
            });
        };
        this.init = function (type) {
            this.isInit = true;
            var self = this, html = "";

            if (type == "host" && !self.isPlayed) {
                self.isHost = true;
                $("#divOption").show();
                $("[data-start]").click(function () {
                    self.startGame();
                })
            }
            if (!self.isInitPlayer) {
                self.numberOfPlayers++;
                self.mainPlayer = new player(Global.user);
                self.mainPlayer.id = Global.user.id;
                self.mainPlayer.init(self.numberOfPlayers);
                self.players.push(self.mainPlayer);
                self.isInitPlayer = true;
                self.mainPlayer.render();
            }
            if (self.isPlayed) {
                $("[data-conatainer]").find(".unmatch").text(self.items[self.currentIndex]);

                self.bindTypingWord();
            } else {
                if (!self.isInitChat) {
                    self.initChat();
                    if (type == "mem") {
                        $("#divOption").show();
                        $("[data-host]").remove();
                    }
                }
            }
        };

        return this;
    }

    function resetPlayers(players) {
        var generateAvatar = function (email) {
            var ava = "https://www.gravatar.com/avatar/" + $.md5(email);
            var html = "<div class='_55lq1'><div size='25' class='_55lt' style='width: 25px; height: 25px;'><img src='" + ava + "' width='25' height='25'></div></div>";

            return html;
        };
        var itemTemplate = function (user) {
            var self = this;
            var html = "<li><div class='_55lp'>" + generateAvatar(user.email) +
                "<div class=\"_5bon _5bon1\"><div class=\"_568z\"><span data-ol></span><span style='background: " + user.color + "' class='label label-default' id='" + user.id + "'>" + user.score + "</span></div></div>" +
                "<div class=\"_55lr\" style='" + (user.isBot ? "color:red" : "") + "' title='" + user.name + "'>" + user.name + "</div></div></li>";

            return html;
        };
        $("[data-players]").html("");
        $.each(players, function (i, p) {
            $("[data-players]").append(itemTemplate(p));
        })
    }

    var socket = io.connect('/game');
    var friend = new friend_section();
    friend.room = room;
    friend.init(common.friend_type.gaming);
    var tw = new typingWord();

    socket.on('connect', function () {
        socket.emit('joinRoom', {
            room: room,
            userId: Global.user.Id,
            userName: Global.user.name
        });
    });

    socket.on('userDisconnect', function (data) {
        if (data.isHost && !tw.isPlayed) {
            var mess = "Host has just left the room, please go back to home page";
            common.modal.openModal(mess, function () {
                window.location.href = "/";
            });
        } else {
            tw.numberOfPlayers--;
            tw.players = $.grep(tw.players, function (i, a) { return i.name != data.userName });
            resetPlayers(tw.players);
        }
    });

    socket.on('init', function (data) {
        tw.socketId = tw.socketId == 0 ? data.socketId : tw.socketId;
        if (data.roomLength == 1) // only himseft on this game
        {
            //init game and play alone
            tw.isHost = true;
            tw.init("host");
            var postData = {};
            postData.roomName = room;
            postData.creator = Global.user.name;
            postData.t = common.game_type.tw;
            //create room on DB
            $.ajax({
                type: 'POST',
                data: JSON.stringify(postData),
                contentType: 'application/json',
                url: '/tw/game/createRoom',
                success: function (data) { }
            });
        } else {
            //get init game from other players
            socket.on(room).emit('initGameFromOther');
        }
    });

    socket.on('initGameFromOther', function () {
        if (tw.isInit) {
            if (tw.numberOfPlayers < 10) {
                socket.on(room).emit('initGameToOther', {
                    data: tw
                });
            }
        }
    });


    socket.on('sendGame', function (data) {
        var _data = data.data;
        if (!tw.isInit) {
            if ($.grep(_data.players, function (a, b) { return a.id == Global.user.id }).length > 0)
                return;
            tw.numberOfPlayers = _data.numberOfPlayers;
            tw.players = _data.players;

            tw.isPlayed = _data.isPlayed;
            if (_data.isPlayed) {
                tw.items = _data.items;
                tw.currentIndex = _data.currentIndex;
            }

            tw.init("mem");
            if (_data.isPlayed) {
                tw.initChat();
                tw.inGameChat = true;
                $("#divOption").hide();
                $("#frContainer").hide();
                $("[data-conatainer]").show();
                $("[data-chat-input]").appendTo("#inGameContent");
            }
            socket.on(room).emit('sendNumberOfPlayer',
                {
                    numberOfPlayers: tw.numberOfPlayers,
                    players: tw.players,
                    isPlayed: _data.isPlayed,
                    player: self.mainPlayer
                });
            resetPlayers(tw.players);
        } else if (tw.isInit && _data.isPlayed && !tw.isPlayed) {
            tw.items = _data.items;
            tw.currentIndex = _data.currentIndex;
            tw.isPlayed = _data.isPlayed;
            tw.inGameChat = true;
            tw.init("mem");
            $("#divOption").hide();
            $("#frContainer").hide();
            $("[data-conatainer]").show();
            $("[data-chat-input]").appendTo("#inGameContent");
            resetPlayers(tw.players);
            socket.on(room).emit('sendNumberOfPlayer',
                {
                    numberOfPlayers: tw.numberOfPlayers,
                    players: tw.players,
                    isPlayed: tw.isPlayed,
                    player: null
                });
        }
    });

    socket.on('getNumberOfPlayer', function (data) {
        if (tw.isInit) {
            tw.numberOfPlayers = data.numberOfPlayers;
            tw.players = data.players;

            resetPlayers(tw.players);
        }
    });

    socket.on('getNumber', function (data) {
        if (tw.isInit) {
            tw.completeWord(data);
        }
    });

    socket.on('getChat', function (data) {
        tw.buildChat(data);
    });

    socket.on('sendStartGame', function () {
        var t = 6;
        var a = setInterval(function () {
            t--;
            var html = "<div>game start in <span style='color:red'>" + t.toString() + "</span> second..</div>";
            $("[data-chat-content]").append(html);
            $("[data-chat-content]").animate({ scrollTop: $("[data-chat-content]")[0].scrollHeight }, "slow");
            if (t == 0) {
                clearInterval(a);
            }
        }, 1000)
    })

    socket.on('sendChangeRoom', function (data) {
        var mess = data.frm + " invite you to play in their room";
        common.modal.openModal(mess, function () {
            window.location.href = "/tw/game/" + data.roomName;
        });
    });

    document.onkeydown = function (e) {
        e = e || window.event;//Get event
        if (e.ctrlKey) {
            var c = e.which || e.keyCode;//Get key code
            switch (c) {
                case 70://Block Ctrl+F --Not work in Chrome
                    e.preventDefault();
                    e.stopPropagation();
                    break;
            }
        }
    };
})