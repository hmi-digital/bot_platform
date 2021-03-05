// JavaScript Document
$('#error').hide();
$(document).ready(function () {
    //config:
    /*------------ Local variable ------------------*/
    var debug = true;
    var browserSupportsSpeech = false;
    var wants_speech = false;

    var systemUtteranceContent;
    var userUtteranceContent;

    /*-------------------------- On Submit Function Click and Enter Start --------------------------*/
    $(document).on('click', ".btn-send", function () {
        /*-----------Card check start --------------*/
        if ($('.card-1').is(":visible")) {
            //if ($('.card-1').is(":visible") && $('.card-1 .form-control').val() != '') {
            if ($("#userUtterance").val() == '') {
                getInteractiveCardValueNSend();

            } else {
                //alert('utterance is not null');
                submit($("#userUtterance").val(), $("#userUtterance").val(), false);
            }

        } else if (!$('.card-1').is(":visible") && $("#userUtterance").val() !== '') {
            submit($("#userUtterance").val(), $("#userUtterance").val(), false);
        }
    });
    //enter
    $(document).on('keydown', '#userUtterance', function (e) {
        if (e.keyCode == 13) {
            //alert('inside enter key');
            if (!$('#ui-id-1').is(":visible")) {

                submit($("#userUtterance").val(), $("#userUtterance").val(), false);
            }
        }
    });

    /*------------------------------ card form field on enter key call function started ------------*/
    /// card form field on enter key call function
    $(document).on('keydown', '.card-1 .form-control', function (e) {
        if (e.keyCode == 13) {
            // alert('enter key pressed');
            if ($('.card-1').is(":visible")) {
                //if ($('.card-1').is(":visible") && $('.card-1 .form-control').val() != '') {
                if ($("#userUtterance").val() == '') {
                    getInteractiveCardValueNSend();

                } else {
                    submit($("#userUtterance").val(), $("#userUtterance").val(), false);
                }

            }
        }

    });
    /*------------------------------ card form field on enter key call function End ------------*/

    /*-------------------------- On Submit Function Click and Enter End --------------------------*/

    /*-------------------------- On Submit Function Call Start  --------------------------*/

    var udateAvatar;
    updateAvatar = 'img/avatar1.png';
    var userUtteranceVal;
    var trimUserUtterance = '';
    var previousPollingValue = null;
    //alert(userUtteranceVal);
   
    function submit(userUtteranceFormVal, userUtteranceTextareaVal, IsPolling) {
        loginDone = true;
        $('#loading-small').show();
        userUtteranceVal = userUtteranceFormVal;
        userUtteranceValNew = userUtteranceTextareaVal;
        trimUserUtterance = $.trim(userUtteranceVal);
        /*----------- Exit app if bye utterance start---------------*/
        if (trimUserUtterance == "bye" || trimUserUtterance == "bye bye" || trimUserUtterance == "exit" || trimUserUtterance == "thank you bye bye") {
            $('#confirm').modal({
                backdrop: 'static',
                keyboard: false,
                focus: this
            });
            $('#confirm').on('shown.bs.modal', function () {
                //alert('before exit btn..');
                $('#exitApp').focus();
            })
            $(document.body).on('click', '#NoExitApp', function () {
                $("#loading-small").hide();
                $("#userUtterance").val('');
            });
            $(document.body).on('click', '#exitApp', function () {
                $.post(locationInt + '/terminate',
                    function (data) {
                        console.log(data + '...Exit app...');
                    }
                );
                $(".chat-wrapper, #home-wrapper, #welcome-wrapper").fadeOut("fast");
                $("#login-wrapper").fadeIn();
                $("#username, #password, #userUtterance").val('');
                $("#loading-small").hide();
                location.reload();
            });
        }
        /*----------- Exit app if bye utterance END---------------*/

        /*----------------- Submit Post Call Start--------------------*/
        function submitPostCall() {
            if(isWebSocketBase) {
                    const msgTosend = {
                        "sessionId": sessionID,
                        "userUtterance": userUtteranceVal
                    }
                    ws.send(JSON.stringify(msgTosend));
                    // auto polling off
                    const IsPolling = false;
                    ws.onmessage = function (e) {
                        const data =JSON.parse(e.data);
                        $('#loading-small').hide();
                        submitPostCallInner(data, IsPolling);
                    }

            } else {
            $.post(locationInt, {
                    userUtterance: userUtteranceVal
                }, function (data) {
                    $('#loading-small').hide();
                    submitPostCallInner(data, IsPolling);
                })
                .fail(
                    function (xhRequest, status,
                        thrownError) {
                        console.log(status);
                        console.log(thrownError);
                    });

                }
        }
        /*----------------- Submit Post Call End--------------------*/


        /*------------------------- spell correct if condiotion start ---------------*/
        if ($("#btnText").hasClass("active") && $("#text-auto-mode").is(':checked')) {
            wants_speech = false;
            submitPostCall();

        } else {
            submitPostCall();
        }

        pollingOnlyOnceInIdle = true;
        /*------------------------- spell correct if condiotion End ---------------*/
    }

    function submitPostCallInner(data, IsPolling) {
        systemUtteranceVal = data.result.reply;
        /*-----System Utterance response---------------*/
        if((data.result.reply).includes('systemNotitification:')) {
            const dataMsg = (data.result.reply).replace('systemNotitification:', '');
            systemUtteranceContentResponse = '<li class="mar-btm systemUtterance notification"><div class="media-body pad-hor"> <div class="speech"> <p id="">' + dataMsg + '</p><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>' + currentTime() + '</p> </div></div></li>';
        } else {
            systemUtteranceContentResponse = '<li class="mar-btm systemUtterance"><div class="media-body pad-hor"> <div class="speech"> <p id="">' + systemUtteranceVal + '</p><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>' + currentTime() + '</p> </div></div></li>';
        }
        /*-----User Utterance response---------------*/
        userUtteranceContent = '<li class="mar-btm userUtterance"><div class="media-body pad-hor speech-right"><div class="speech"><p id="userUtteranceValue">' + userUtteranceValNew + '</p><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>' + currentTime() + '</p></div></div></li>';

        /*---------- info Section Start ----------------*/
        if (!data.message == 0) {
            if (!data.message.data.error == 0) {
                $('#info-wrapper .info-content').html(errorSystemResponseText).fadeIn(600);
            }

            // ---------------- Info for I card Start----------------- //
            if (!data.message.data.info == 0) {

                if (!data.message.data.info.video == 0) {
                    if(!data.message.data.info.video.endsWith(".mp4")) {
                        var videoSlide = '<li ><div class="video-container"><iframe width="100%" height="180" src="' + data.message.data.info.video + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></li>';
                    } else {
                        var videoSlide = '<li ><div class="video-container local-video"><video width="100%" controls><source src="' + data.message.data.info.video + '" type="video/mp4"></video></div></li>';
                    }
                } else {
                    var videoSlide = '<li><img src="img/video-placeholder3.jpg" class="placeholder" alt="video placeholder"></li>';
                }
                if (!data.message.data.info.image == 0) {
                    //PND Made changes.
                    var imageSlide = '<li><a href="../img/ticket.jpg" ><img class="m-auto" src="' + data.message.data.info.image + '"></a></li>'
                } else {
                    var imageSlide = '<li><img src="img/image-placeholder2.jpg" class="placeholder" alt="Image placeholder"></li>';
                }

                if (!data.message.data.info.text == 0) {
                    var textSlide = "<li><div class='pa-15'>" + data.message.data.info.text + "</div></li>";
                } else {
                    var textSlide = '<li><img src="img/text-placeholder3.jpg" class="placeholder" alt="Text placeholder"></li>';
                }

                var infoSliderData = '<li class="card-info"><ul class="bxslider">' + textSlide + '' + imageSlide + '' + videoSlide + '</ul></li>';

            }
            /*---------------- Info for I card End-----------------*/

        }
        /*---------- info Section End ----------------*/

        if (!$.trim($("#userUtterance").val()) && !(data.result.query)) {
            console.log('textaarea is empty');
        } else {
            /*-----Append system and user utterance response---------------*/
            //===notification Code started===//
            if (data.notifications > 0) {
                var notificationContent = '';
                $.post(locationInt + "/getNotification", function (data1) {
                    $.each(data1.notifications, function (index, value) {
                        if((value.message).startsWith("@")) {
                            //$("textarea#userUtterance").val(value.message);
                            submit(value.message, value.message, true);
                        } else {
                            notificationContent += '<li class="mar-btm systemUtterance notification"> <div class="media-body pad-hor"> <div class="speech"> <p id="systemUtterance">' + value.message + '</p><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>' + currentTime() + '</p> </div></div></li>';
                        }
                    });
                    if (userUtteranceVal !== 'polling-query') {
                        $("#utterance").append(userUtteranceContent).fadeIn(600);
                    }
                    $("#utterance").append(systemUtteranceContentResponse).fadeIn(600);
                    $("#utterance").append(infoSliderData).fadeIn(600);
                    if (!data.iForm == 0) {
                        if(!(data.result.reply).includes('systemNotitification:')) {
                            fn_icard(data);
                        }
                    }
                    $("#utterance").append(notificationContent).fadeIn(600);
                    cardRemoveNScrollTop();
                });
            } else {
                if (IsPolling) { // check is Polling flag true
                    if (userUtteranceVal !== 'polling-query') {
                        $("#utterance").append(userUtteranceContent).fadeIn(600);
                    }
                    if (previousPollingValue !== systemUtteranceVal) { //if previous polling value is not same as current system utterance value
                        $("#utterance").append(systemUtteranceContentResponse).fadeIn(600);
                    }
                } else { // check is Polling flag false
                    if(!(data.result.query).includes('systemNotification')) {
                        $("#utterance").append(userUtteranceContent).fadeIn(600);
                    }
                    $("#utterance").append(systemUtteranceContentResponse).fadeIn(600);
                }
                //if (!data.iCard == 0) {
                $("#utterance").append(infoSliderData).fadeIn(600);
                if (!data.iForm == 0) {
                    fn_icard(data);
                }
                cardRemoveNScrollTop();
            }
            //===Notification Code ende===//


            function cardRemoveNScrollTop() {
                $('#utterance').find('.card-1:not(:last)').remove();
                $('.userUtterance').prev('.card-info').remove();

                $("#scroll-wrap").mCustomScrollbar("scrollTo", "bottom", {
                    scrollEasing: "easeOut"
                });
            }

            // Date picker function call
            $(function () {
                $(".datepicker").datepicker({
                    showOn: "button",
                    buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
                    minDate: 0
                    //buttonImageOnly: true
                });
            });

            $('.timepicker').wickedpicker();

            // call bx slider for card info
            $('.bxslider').bxSlider({
                video: true,
                useCSS: false
            });

            // image popup
            $('.image-popup-fit-width').magnificPopup({
                type: 'image',
                closeOnContentClick: true,
                image: {
                    verticalFit: false
                }
            });
            // Add focus after appending to active field
            $(".form-control.active").focus();
            // Remove inisibile true itom from DOM
            $('.card-row.inVisible').remove();
            // init transliterate
            onLoad();
            //});
            //  debugger;
        }
        //is user has used ASR before, automatically start TTS
        var systemUtteranceValNew = data.result.speech;
        if (wants_speech) {
            tts_msg.lang = selectLanguage_new.value;
            if (selectLanguage_new.value == "hi") {
                responsiveVoice.speak("" + systemUtteranceValNew + "", "Hindi Female");
                speechSynthesis.speak(tts_msg);
            } else if (selectLanguage_new.value == "de-DE") {
                responsiveVoice.speak("" + systemUtteranceValNew + "", "Deutsch Female");
                speechSynthesis.speak(tts_msg);
            } else if (selectLanguage_new.value == "it-IT") {
                responsiveVoice.speak("" + systemUtteranceValNew + "", "Italian Female");
                speechSynthesis.speak(tts_msg);
            } else if (selectLanguage_new.value == "fr-FR") {
                responsiveVoice.speak("" + systemUtteranceValNew + "", " French Female");
                speechSynthesis.speak(tts_msg);
            } else if (selectLanguage_new.value == "pt-PT") {
                responsiveVoice.speak("" + systemUtteranceValNew + "", " Portuguese Female");
                speechSynthesis.speak(tts_msg);
            } else { // Is polling implemented only for english now
                    responsiveVoice.speak("" + systemUtteranceValNew + "", "UK English Female");
                    speechSynthesis.speak(tts_msg);
                    idleTime = 0;
               }
            }
         // Set Currennt System Utterance value to previous polling value aftter append 
         if (IsPolling) {
            previousPollingValue = systemUtteranceVal;
        }
        $("#userUtterance").val('');
        idleTime = 0;
    }
    /*----------------- Submit function End here ----------*/


    /*--------------- Get Interactive card value function ----------*/
    function getInteractiveCardValueNSend() {

        var myThisVal = '';
        var myTextAreaVal = '';
        $(".card-1 .form-control").each(function () {
            if ($('.card-1 .form-control').val() !== '') {

                /*-------- Check entity type and send value accordingly Start-------------*/
                var thisValue = $(this).val();

                if ($(this).val() !== '' && $(this).attr("data-entity-type") === "sys.location.city") {
                    var thisValue = "city:" + $(this).val() + ";";
                } else if ($(this).val() !== '' && $(this).attr("data-entity-type") === "sys.person") {
                    var thisValue = "person:" + $(this).val() + ";";
                } else if ($(this).val() !== '' && $(this).attr("data-entity-type") === "sys.person.firstname") {
                    var thisValue = "firstName:" + $(this).val() + ";";
                } else if ($(this).val() !== '' && $(this).attr("data-entity-type") === "sys.person.lastname") {
                    var thisValue = "lastName:" + $(this).val() + ";";
                } else if ($(this).val() !== '' && $(this).attr("data-entity-type") === "sys.organization") {
                    var thisValue = "organization:" + $(this).val() + ";";
                } else if ($(this).val() !== '' && $(this).attr("data-entity-type") === "sys.password") {
                    var thisValue = $(this).val() + " ;";
                } else {
                    //alert('esle..')
                    if ($(this).val() !== '') {
                        var thisValue = $(this).val() + ";";
                    }
                }
                /*-------- Check entity type and send value accordingly End-------------*/
                if ($(this).val() !== '' && $(this).parent().parent().prev().find('.form-control').val() == '') {

                    $('<div class="alert alert-info"><strong>IMPORTANT:</strong> Please fill out prev. empty field. </div>').prependTo(".card-1").delay(2500).queue(function () {
                        $(this).remove();
                    });

                    myThisVal = '';
                    $(this).parent().parent().prev().find('.form-control').focus();
                    return false;
                } else {

                    if ($(this).is(':radio')) {
                        if ($(this).is(':checked')) {
                            myThisVal += thisValue + ' ';
                            myTextAreaVal += $(this).val() + ' ';
                        }
                    } else if ($(this).attr("data-entity-type") === "customButtons") {
                        if ($(this).hasClass('selected')) {
                            myThisVal += thisValue + ' ';
                            myTextAreaVal += $(this).val() + ' ';
                        }
                    } else if ($(this).is(':checkbox')) {

                        if ($(this).is(':checked')) {

                            myThisVal += thisValue + ' ';
                            myTextAreaVal += $(this).val() + ' ';
                        }
                    } else if ($(this).attr("data-entity-type") === "sys.password") {
                        myThisVal += thisValue + ' ';
                        myTextAreaVal += '*********' + ' ';
                    } else {
                        myThisVal += thisValue + ' ';
                        myTextAreaVal += $(this).val() + ' ';
                    }
                }
            } else {
                $('<div class="alert alert-info"><strong>IMPORTANT:</strong>  Please ensure the essential fields are filled in.</div>').prependTo(".card-1").delay(3000).queue(function () {
                    $(this).remove();
                });
                return false;
            }

        });
        if (myThisVal != '') {
            $("textarea#userUtterance").val(myTextAreaVal);
            submit(myThisVal, myTextAreaVal, false);
        }
    }
    $(document).on('keypress', '.inputError', function () {
        $(this).removeClass('inputError');
    });

    /*----------- Get Interactive card value function End----------*/

    $(document).on('click', '.btn-group-wrap button', function () {
        $('.btn-group-wrap button').removeClass('selected');
        $(this).addClass('selected');
    });

    /*------------- Interactive Cards task button click start --------------*/
    $(document).on('click', '.btnCardTask', function () {
        var thisValue;
        if ($(this).hasClass('menulist')) {
            thisValue = "" + $(this).attr("name");
        } else {
             thisValue = "#" + $(this).attr("name");
        }
        var utteranceValue = $(this).val();
        $("textarea#userUtterance").val(utteranceValue);

        submit(thisValue, utteranceValue, false);
    });
    /*-------- Card Cancel Task click function start --------------*/

    /* ----------------- After Specific Interval call Submit Function again ---------------------- */
    var idleInterval = setInterval(timerIncrement, 1000); // 1 sec
    document.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onmousedown = resetTimer; // touchscreen presses
    document.ontouchstart = resetTimer;
    document.onclick = resetTimer;     // touchpad clicks
    document.onkeypress = resetTimer;
    document.addEventListener('scroll', resetTimer, true); // improved; see comments

    function resetTimer() {
        idleTime = 0;
        //pollingOnlyOnceInIdle = true;
    }

    function timerIncrement() {
        if(!responsiveVoice.isPlaying()) {
            idleTime = idleTime + 1;
        }
        if (idleTime > idlleIntervalTime ) { // 10 sec
            if (loginDone === true) {
                $("textarea#userUtterance").val('polling-query');
                submit("polling-query", "polling-query", true);
                pollingOnlyOnceInIdle = false;
            }
            idleTime = 0;
        }
    }
    /* ----------------- After Specific Interval call Submit Function call End ---------------------- */
    $(document).on('click', '#cancelTaks1', function () {
        var thisValue = $(this).attr("name");;
        $("textarea#userUtterance").val(thisValue);

        submit($("#userUtterance").val(), $("#userUtterance").val(), false);
    });
    /*-------- Card Cancel Task click function End --------------*/
    /*------------- Interactive Cards task button click End --------------*/

    /*-------------------------- On Submit Function Call End  --------------------------*/

    /*-------------------------- Show Error Function Start  --------------------------*/
    function showError(error, fatal) {
        if (error != null || error != undefined || error != 'not-allowed') {
            $('#error').show(0).delay(3500).hide(0);
            $("#error").html(error);
        } else if (fatal) {
            $('#loader').removeClass("loading");
            $('#container').delay(3500).animate({
                opacity: .2
            }, 2500);

        } else {
            $("#error:hidden:first").fadeIn(1000).delay(2000).fadeOut(1000);
        }
    }
    /*-------------------------- Show Error Function End  --------------------------*/

    /*-------------------------------- Google Web Speech API Start ---------------------*/

    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        showError(
            "Your Browser doesn't support speech recognition. Try Chrome.",
            false);
        $('#recobtn').prop('disabled', true);

    } else {

        browserSupportsSpeech = true;
        var auto_submit = true;
        //TTS
        var tts_msg = new SpeechSynthesisUtterance();
        //tts_msg.lang = 'en-GB';
        //alert(select_language.value);
        tts_msg.lang = selectLanguage_new.value;

        tts_msg.onend = function (e) {
            start_stop_recognition();
            //recognition.stop();
        };
        //ASR
        var recognizing = false;
        var final_transcript = '';
        var ignore_onend = false;
        var start_timestamp;
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        var recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        /*------------ speech recognition OnError Event Start------------------*/
        recognition.onerror = function (event) {
            ignore_onend = true;
            //updateGui(false);
            wants_speech = false;
            if ($("#btnVoice").hasClass("active")) {

                if (event.error == 'no-speech') {
                    start_img.src = 'img/mic.png';
                    showInfo('info_no_speech');
                }
                if (event.error == 'audio-capture') {
                    start_img.src = 'img/mic.png';
                    showInfo('info_no_microphone');
                }
                if (event.error == 'not-allowed') {
                    if (event.timeStamp - start_timestamp < 100) {
                        showInfo('info_blocked');
                    } else {
                        showInfo('info_denied');
                    }
                }
            } else {
                start_img.src = 'img/mic-disabled.png';
            }

        };
        /*------------ speech recognition OnError Event End------------------*/

        /*------------ speech recognition OnStart Event Start------------------*/

        recognition.onstart = function () {
            recognizing = true;
            start_img.src = 'img/mic-animate.gif';
            showInfo('info_speak_now');
            //console.log('Speech recognition service has started');
            idleTime = 0;
        };
        /*------------ speech recognition OnStart Event End------------------*/

        /*------------ speech recognition OnEnd Event Start------------------*/
        recognition.onend = function () {
            recognizing = false;
            if (ignore_onend) {
                return;
            }
            if (!recognition.continuous) {
                recognition.stop();
            }
            start_img.src = 'img/mic.png';
            if (!final_transcript) {

                showInfo('info_start');
                return;
            }
            showInfo('');
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
                var range = document.createRange();
                range.selectNode(document.getElementById('final_span'));
                window.getSelection().addRange(range);
            }
            idleTime = 0;
        };
        /*------------ speech recognition OnEnd Event End------------------*/

        /*------------ speech recognition OnResult Event Start------------------*/
        recognition.onresult = function (event) {
            var interim_transcript = '';
            if (typeof (event.results) == 'undefined') {
                recognition.onend = null;
                recognition.stop();
                showError("Result undefined", false);
                return;
            }

            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            $("#userUtterance").val(final_transcript);
            if (!recognition.continuous) {
                recognition.stop();
            }
            if (auto_submit)
                submit($("#userUtterance").val(), $("#userUtterance").val(), false);
                idleTime = 0;
        };
        /*------------ speech recognition OnResult Event End------------------*/
        /*------------ Function  start stop recognition start------------------*/
        window.start_stop_recognition = function () {
            if ($("#btnVoice").hasClass("active")) {
                if (recognizing) {
                    recognition.stop();
                    wants_speech = false;
                    start_img.src = 'img/mic.png';
                    ignore_onend = true;
                    idleTime = 0;
                    return;
                }
                wants_speech = true;
                final_transcript = '';
                recognition.lang = selectLanguage_new.value;
                if ($('#voice-auto-mode').is(':checked')) {
                    recognition.start();
                }
                if ($('#voice-manual-mode').is(':checked')) {
                    recognition.stop();
                }
                ignore_onend = false;
                start_img.src = 'img/mic.png';
            } else {
                start_img.src = 'img/mic-disabled.png';
            }
            idleTime = 0;
        }
        /*------------ Function  start stop recognition End------------------*/
        /*------------ Show Info Function start------------------*/
        function showInfo(s) {
            if (s) {
                for (var child = info.firstChild; child; child = child.nextSibling) {
                    if (child.style) {
                        child.style.display = child.id == s ? 'inline' : 'none';
                    }
                }
                $("#info").show().delay(3500).fadeOut(1000);

            } else {
                $("#info").hide();
            }
        }
        /*------------ Show Info Function end------------------*/

        //}
        /*------------ Record button start------------------*/
        $("#recobtn").click(function (event) {

            if ($("#btnVoice").hasClass("active")) {
                start_stop_recognition();
            }
            start_img.src = 'img/mic-slash.png';
            if (recognizing) {
                console.log('inside recognizing...');
                recognition.stop();
                return;
            }
            if (!$('#voice-auto-mode').is(':checked')) {
                recognition.start();
            }
        });
        /*------------ Record button End------------------*/
    }
    /*-------------------------------- Google Web Speech API End ---------------------*/

    /*----------------- Get Date function Start--------------------*/
    function getDate() {
        var d = new Date();
        var year = d.getFullYear();
        var date = d.getDate();
        if ($("#selectLanguage_new").val() == 'mr' || $("#selectLanguage_new").val() == 'hi') {
            var days = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरूवार', 'Friday', 'शनिवार'];
        } else {
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        }
        if ($("#selectLanguage_new").val() == 'hi' || $("#selectLanguage_new").val() == 'mr') {
            var months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        } else if ($("#selectLanguage_new").val() == 'mr') {
            var months = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
        } else {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        var day = days[d.getDay()];
        var month = months[d.getMonth()];
        return day + ', ' + month + ' ' + date + ', ' + year;
    }
    
    setTimeout(function(){  $('.date').text(getDate()) }, 500);
   
    /*----------------- Get Date function End--------------------*/


    /*------------- Set Column Height Start -----------------*/
    function setHeight() {
        windowHeight = $(window).innerHeight();
        $('#task-details').css('height', windowHeight - 64);
        $("#scroll-wrap").css('height', windowHeight - 480);
    };
    setHeight();
    $(window).resize(function () {
        setHeight();
    });
    /*------------- Set Column Height End -----------------*/

    /*------------ Exit chat start--------------------*/
    $('#exit, .icon-exit').click(function () {
        $.post(locationInt + '/terminate',
            function (data) {
                console.log(data + '...inside exit data...')
            }
        );

        $("#login-wrapper").fadeIn("fast");
        $(".chat-wrapper, #home-wrapper, #welcome-wrapper").fadeOut("fast");
        $('#utterance').empty();
        $("#username, #password, #userUtterance").val('');
        $("#loading-small").hide();
        location.reload();
    });
    /*-------------- Exit chat end-----------------*/

    /*----------------- Clear Chat Start ------------------*/
    $('#clearChat').click(function () {
        $('#utterance').empty();
    });
    /*----------------- Clear chat end -------------------*/
    $(document).on("click", ".popover .close", function () {
        $(this).parents(".popover").popover('hide');
    });

    /*------------ Logout Click start --------------*/
    $(document).on("click", "#logout", function () {
        $.post(locationInt + '/terminate',
            function (data) {
                console.log(data + '...inside logout...')
            }
        );
        //$(".chat-wrapper").hide(); 
        $(".chat-wrapper, #home-wrapper, #welcome-wrapper").fadeOut("fast");
        $("#login-wrapper").fadeIn();
        $("#username, #password, #userUtterance").val('');
        $("#loading-small").hide();
        location.reload();
    });
    /*------------ Logout Click End --------------*/

    /*---------------- Voice and Text toggle start----------------*/
    $('#radioBtn a').on('click', function () {
        var sel = $(this).data('title');
        var tog = $(this).data('toggle');
        $('#' + tog).prop('value', sel);

        $('a[data-toggle="' + tog + '"]').not('[data-title="' + sel + '"]').removeClass('active').addClass('notActive');
        $('a[data-toggle="' + tog + '"][data-title="' + sel + '"]').removeClass('notActive').addClass('active');
    })

    $("#radio-text-wrapper, #radio-voice-wrapper").hide();

    $("#radio-text-wrapper").show();
    $("#select_language").hide();
    $(document).on("click", "#btnVoice", function () {
        $("#userUtterance").attr('disabled', true);
        $("#btnSubmit").attr('disabled', true);
        $("#recobtn").attr('disabled', false);
        $('#selectLanguage').val('en').trigger('change');
        $("#radio-voice-wrapper").show();
        $("#radio-text-wrapper").hide();

        $("#selectLanguage").hide();

        $("#select_language").show();

        start_img.src = 'img/mic.png';
    });
    $(document).on("click", "#btnText", function () {
        disableVoice();
        $("#select_language").hide();
        $("#selectLanguage").show();
        $("#selectLanguage").val($("#selectLanguage option:first").val());
    });
    if ($("#btnText").hasClass('active')) {
        disableVoice();
    }
    /*------------ Function Disabled Voice start------------------*/
    function disableVoice() {
        wants_speech = false;
        $("#userUtterance").attr('disabled', false);
        $("#btnSubmit").attr('disabled', false);
        $("#recobtn").attr('disabled', true);

        $("#radio-voice-wrapper").hide();
        $("#radio-text-wrapper").show();

        start_img.src = 'img/mic-disabled.png';
    }
    /*------------ Function Disabled Voice End------------------*/

    /*--------------Voice/Text Switch Toggle Start -----------------*/
    $(".switch-toggle label").on('click', function () {
        $('.switch-toggle label').removeClass('active');
        $(this).addClass('active');
    });
    /*--------------Voice/Text Switch Toggle End -----------------*/

    /*---------------- Voice and Text toggle End----------------*/

    /*------------------------ Help/Scubscribe popup start --------------------*/
    $("a[class*='popup-gallery-']").magnificPopup({
        //$('.open-help-popup').magnificPopup({
        type: 'inline',
        midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
    });
    /*------------------------ Help/Subscribe popup End --------------------*/

    /*----------- Translate dropdown (keyboard) lanngauge selection Start ------------*/

    $('#selectLanguage_new').on('change', function () {
        currentTime();
        //getDate();
        $('.date').text(getDate());
        if (this.value == "en") {
            transliterationControl.disableTransliteration();
        } else {
            languageChangeHandler()
        }
    });
    /*----------- Translate dropdown (keyboard) lanngauge selection End ------------*/
});

function fn_icard(data) {
    var iCardDataResponse = '';
    //var entitiesFormData;    
    /*---------------- Card Task list Code Start --------------------*/
    if (data.iForm.type === "taskList") {
        //alert('inside taks list');
        var icardTask = data.iForm.tasks;
        var taskButtons = '';
        $.each(icardTask, function (i, objVal) {
            //alert(JSON.stringify(objVal));
            taskButtons += '<input type="button" class="btn btn-primary btnCardTask" value="' + objVal.label + '" name="' + objVal.name + '"/>'
        })
        iCardDataResponse = '<div class="card-1"><div class="col-xs-12">' + taskButtons + '</div></div>';
    }
    /*---------------- Card Task list Code End --------------------*/

    /*---------------- Card menuList Code Start --------------------*/
    if (data.iForm.type === "menuList") {
        //alert('inside taks list');
        var entitiesMenuList = data.iForm.entities[0].elements;
        console.log(entitiesMenuList.split(','));
        var entityArr = entitiesMenuList.split(',');
        var menuListBtn = '';
        $.each(entityArr, function (i, objVal) {
            //alert(JSON.stringify(objVal));
            menuListBtn += '<input type="button" class="btn btn-primary btnCardTask menulist radius30" value="' + objVal + '" name="' + objVal + '"/>'
        })
        iCardDataResponse = '<div class="card-1"><div class="col-xs-12">' + menuListBtn + '</div></div>';
    }
    /*---------------- Card menuList Code End --------------------*/


    /*---------------- Card Entity list Code start --------------------*/
    if (data.iForm.type === "entityList") {
        var icardEntities = data.iForm.entities;
        //var entitiesFormData = '';
        var entitiesFormFields = '';
        var checkObjTypeSlider = '';
        /*-------------- Entities for each loop start -------------*/
        $.each(icardEntities, function (i, objVal) {
            //alert(JSON.stringify(objVal));
            var formTypeElement = '';
            var isActive = "";
            /*------------- Check if field is active or not Start ---------------*/
            if (objVal.isActive === "true") {
                var isActive = 'active';
            } else {
                var isActive = '';
            }
            /*------------- Check if field is active or not End ----------------*/
            /*------------- Check if field type is text Start----------------*/
            if (objVal.type === "text") {
                if (objVal.entityType == "sys.opentext") {
                    formTypeElement = '<textarea  class="form-control ' + isActive + ' hindiFont" id="' + objVal.name + '" ' + isActive + ' value="' + objVal.value + '" data-entity-type="' + objVal.entityType + '">' + objVal.value + '</textarea>'
                } else if (objVal.entityType == "sys.password") {
                    formTypeElement = '<input type="password" class="form-control ' + isActive + '" id="' + objVal.name + '" ' + isActive + ' value="' + objVal.value + '" data-entity-type="' + objVal.entityType + '">'
                } else {
                    // alert('else');
                    formTypeElement = '<input type="text" class="form-control ' + isActive + ' hindiFont" id="' + objVal.name + '" value="' + objVal.value + '" data-entity-type="' + objVal.entityType + '">'
                }
            }
            /*------------- Check if field type is text End----------------*/
            /*------------- Check if field type is Number Start----------------*/
            else if (objVal.type === "number") {
                formTypeElement = '<input type="number" class="form-control ' + isActive + '" id="' + objVal.name + '" ' + isActive + ' value="' + objVal.value + '" data-entity-type="' + objVal.entityType + '">'
            }
            /*------------- Check if field type is Number End----------------*/

            /*------------- Check if field type is List Start----------------*/
            else if (objVal.type === "list") {
                //var listValue = objVal.value;
                var selectedValue = objVal.value;
                var listValue = objVal.elements;
                var selectedChk = "";
                var arrayListVal = listValue.split(',');
                var createListOption = '';
                $.each(arrayListVal, function (i, arrListVal) {
                    if (objVal.value != "") {
                        if (arrListVal.toUpperCase() === selectedValue.toUpperCase()) {
                            selectedChk = 'selected="selected"';
                        } else {
                            selectedChk = '';
                        }
                    }
                    createListOption += '<option value="' + arrListVal + '" ' + selectedChk + '>' + arrListVal + '</option>'
                });
                formTypeElement = '<select id="' + objVal.name + '" class="form-control ' + isActive + '" data-entity-type="' + objVal.entityType + '" >' + createListOption + '</select>'
            }
            /*------------- Check if field type is List End----------------*/

            /*------------- Check if field type is Slider Start----------------*/
            else if (objVal.type === "slider") {
                var sliderVal = objVal.elements;
                var selectedChk = "";
                var arraySliderVal = sliderVal.split(',');
                var minValue = ''
                var maxValue = '';
                var maxValue = '';
                var stepVal = '';
                var defaultVal = '';
                var sliderFilledVal = objVal.value;
                $.each(arraySliderVal, function (i, arrListVal) {
                    if (i == 0) {
                        minValue = arrListVal;
                    } else if (i == 1) {
                        maxValue = arrListVal;
                    } else if (i == 2) {
                        stepVal = arrListVal;
                    } else if (i == 3) {
                        if (!sliderFilledVal == 0) {
                            defaultVal = sliderFilledVal;
                        } else {
                            defaultVal = arrListVal;
                        }
                    }
                    //console.log(i + '...' + arrListVal);
                });
                formTypeElement = ' <input type="range" min="' + minValue + '" max="' + maxValue + '" step="' + stepVal + '" value="' + defaultVal + '" data-rangeslider> <output class="form-control"></output>'

                checkObjTypeSlider = true;
            }
            /*------------- Check if field type is slider End----------------*/

            /*------------- Check if field type is Date Start----------------*/
            else if (objVal.type === "date") {

                formTypeElement = '<input type="text" class="form-control datepicker ' + isActive + '" id="' + objVal.name + '" ' + isActive + ' value="' + objVal.value + '" data-entity-type="' + objVal.entityType + '">'
            }
            /*------------- Check if field type is Date End----------------*/

            /*------------- Check if field type is Time Start----------------*/
            else if (objVal.type === "time") {
                formTypeElement = '<input type="text" class="form-control timepicker ' + isActive + '" id="' + objVal.name + '"  value="' + objVal.value + '" data-entity-type="' + objVal.entityType + '">'
                // $('.timepicker').wickedpicker();
                $('.timepicker').wickedpicker('time', 0);

            }
            /*------------- Check if field type is Time End----------------*/
            /*------------- Check if field type is Radio Start----------------*/
            else if (objVal.type === "radio") {
                //var radioValue = objVal.value;
                var radioValue = objVal.elements;
                var arrayRadioVal = radioValue.split(',');
                var createRadioOption = '';
                var selectedRadioChk = '';
                $.each(arrayRadioVal, function (i, arrRadioVal) {
                    //i++
                    if (i === 0 && objVal.isActive === "true") {
                        isRadioActive = "active"
                    } else {
                        isRadioActive = ""
                    }

                    if (objVal.value != '') {

                        var getRadioChk = objVal.value;
                        var getRadioChkLwrCase = getRadioChk.toLowerCase()
                        if (arrRadioVal == getRadioChkLwrCase) {
                            selectedRadioChk = 'checked="checked"';
                        } else {
                            selectedRadioChk = '';
                        }
                    }

                    createRadioOption += '<div class="radio radio-info radio-inline"><input type="radio" id="my-' + i + '" value="' + arrRadioVal + '" name="' + objVal.name + '" class="form-control ' + isRadioActive + '" data-entity-type="' + objVal.entityType + '" ' + selectedRadioChk + '><label for="my-' + i + '"> ' + arrRadioVal + ' </label></div>'
                });

                formTypeElement = '<div class="mode-radio-wrap" id="">' + createRadioOption + '</div>'

            }
            /*------------- Check if field type is Radio End----------------*/
            /*------------- Check if field type is Checkbox Start----------------*/
            else if (objVal.type === "multiSelectionList") {
                //var checkboxValue = objVal.value;
                var checkboxValue = objVal.elements;
                var arrayCheckVal = checkboxValue.split(',');
                var createCheckOption = '';
                var selectCheckboxChk = '';
                $.each(arrayCheckVal, function (i, arrCheckVal) {
                    // alert(arrCheckVal);
                    //console.log(arrCheckVal);
                    if (objVal.value != "") {
                        // console.log('inside value is present');
                        var getObjChkboxVal = objVal.value;
                        //if(arrCheckVal == objVal.value) {
                        if (getObjChkboxVal.indexOf(arrCheckVal) >= 0) {
                            //  alert('checked');
                            selectCheckboxChk = 'checked="checked"';
                        } else {
                            selectCheckboxChk = '';
                        }
                    }
                    createCheckOption += '<div class="checkbox"><label><input type="checkbox" value="' + arrCheckVal + '" name="' + objVal.name + '" class=" form-control' + isActive + '" data-entity-type="' + objVal.entityType + '" ' + selectCheckboxChk + '>' + arrCheckVal + '</label></div>'
                });

                formTypeElement = '<div class="checkbox-wrapper">' + createCheckOption + '</div>'
            }
            /*------------- Check if field type is Checkbox End----------------*/

            /*------------- Check if field type is button Start----------------*/
            else if (objVal.type === "button") {


                var btnValue = objVal.elements;
                var arrayBtnValue = btnValue.split(',');
                var createBtnOption = '';
                var selectedRadioChk = '';
                $.each(arrayBtnValue, function (i, arrBtnVal) {
                    //i++
                    if (i === 0 && objVal.isActive === "true") {
                        isRadioActive = "active"
                    } else {
                        isRadioActive = ""
                    }

                    if (objVal.value != '') {

                        var getRadioChk = objVal.value;
                        var getRadioChkLwrCase = getRadioChk.toLowerCase()
                        if (arrBtnVal == getRadioChkLwrCase) {
                            selectedRadioChk = 'selected';
                        } else {
                            selectedRadioChk = '';
                        }
                    }

                    //createBtnOption += '<div class="radio radio-info radio-inline"><input type="radio" id="my-' + i + '" value="' + arrBtnVal + '" name="' + objVal.name + '" class="form-control ' + isRadioActive + '" data-entity-type="' + objVal.entityType + '" ' + selectedRadioChk + '><label for="my-' + i + '"> ' + arrRadioVal + ' </label></div>'
                    createBtnOption += '<button type="button" class="btn btn-primary form-control ' + isActive + selectedRadioChk + '" id="' + objVal.name + i + '" ' + isActive + ' value="' + arrBtnVal + '" data-entity-type="' + objVal.entityType + '"> ' + arrBtnVal + ' </button>';
                });

                formTypeElement = '<div class="checkbox-wrapper"><div class="btn-group-wrap">' + createBtnOption + '</div></div>'
            }
            /*------------- Check if field type is button End----------------*/

            /*------ check if card is visible or not Start-------------*/
            if (objVal.isVisible !== "true") {
                var isVisible = ' inVisible';
            } else {
                var isVisible = '';
            }
            /*------ check if card is visible or not  End-------------*/

            entitiesFormFields += '<div id="' + objVal.id + '" class="card-row' + isVisible + '"><div class="col-xs-5 clearLeft"><label >' + objVal.label + '</label></div><div class="col-xs-7">' + formTypeElement + '</div></div>'

        });
        /*-------------- Entities for each loop End -------------*/
        var entitiesFormData = '<li class="card-1">' + entitiesFormFields + '<span class="clearfix"></span><div class="card-row card-btn-holder"><div class="col-sm-5 col-xs-4"></div><div class="col-sm-7 col-xs-8"><input type="button" class="btn btn-primary btn-send" value="Submit" name=""/><input type="button" class="btn btn-primary btnCardTask" value="Cancel" name="cancelTask"></div></div></li>'

    }
    /*---------------- Card Entity list Code End --------------------*/
    /*---------------- Like dislike Code Start --------------------*/
    var likeDislikeFeedback = '';
    if (!data.iForm.feedback == 0) {

        if (data.iForm.feedback.isVisible == "true") {
            likeDislikeFeedback = '<li class="mar-btm likeDislike"><div id="likeDislike" class="panel panel-default"><div class="panel-footer"><span class="pull-right"> <i id="like1" class="glyphicon glyphicon-thumbs-up"></i> <div id="like1-bs3">' + data.iForm.feedback.likes + '</div> <i id="dislike1" class="glyphicon glyphicon-thumbs-down"></i> <div id="dislike1-bs3">' + data.iForm.feedback.dislikes + '</div></span> </div> </div></li>'
        } else {
            //alert('feedback not visible..');
            $("#likeDislike").remove();
        }
    } else {
        //alert('no feedback..')
        $("#likeDislike").remove();
    }

    //Append Like Dislike..
    $("#utterance").append(likeDislikeFeedback).fadeIn(600);


    // like click function  
    $('i.glyphicon-thumbs-up').click(function () {
        var locationLike = locationInt + '/like';
        $('li.likeDislike').fadeOut(600);
        $.post(locationLike, function (data, status) {
            console.log(data);

        });
    });
    //  dislike click function 
    $('i.glyphicon-thumbs-down').click(function () {
        var locationDisLike = locationInt + '/dislike';
        $('li.likeDislike').fadeOut(600);
        $.post(locationDisLike, function (data, status) {
            console.log(data);
        });
    });

    /*---------------- Like dislike Code End --------------------*/
    //Taks list form data append;
    $("#utterance").append(iCardDataResponse).fadeIn(600);

    //Entities form data append;
    $("#utterance").append(entitiesFormData).fadeIn(600);
    //console.log(iCardDataResponse);

    //check if slider is flag is true    
    if (checkObjTypeSlider == true) {
        fnSlider();
    }

}