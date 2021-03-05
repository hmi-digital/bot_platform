/*---------------- Auto Complete Code Start Here -------------------------*/

function split(val) {
    return val.split(/ \s*/);
}

function extractLast(term) {
    return split(term).pop();
}

$("#userUtterance")
    // don't navigate away from the field on tab when selecting an item
    .on("keydown", function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13' && $('#ui-id-1').is(":visible")) {
            //alert('You pressed a "enter" key in somewhere'); 
            return false;
        }
        if (event.keyCode === $.ui.keyCode.TAB &&
            $(this).autocomplete("instance").menu.active && event.keyCode == 13) {
            event.preventDefault();
            //return true;
        }
        if ($("#btnText").hasClass("active") && $("#text-manual-mode").is(':checked') || $("#selectLanguage_new").val() == 'hi' ||  $("#selectLanguage_new").val() == 'mar') {
            $('#userUtterance').autocomplete('disable');
        } else {
            $('#userUtterance').autocomplete('enable');
        }
    })
    .autocomplete({
        minLength: 0,
        source: function (request, response) {
            // delegate back to autocomplete, but extract the last term
            var locationAutoComplete1 = location1 + "/autocomplete";
            // console.log(locationAutoComplete1);
            //console.log(location1);
            var utteranceAutoCompleteVal = $('#userUtterance').val();
            $.ajax({
                url: locationAutoComplete1,
                type: 'POST',
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: {
                    userUtterance: utteranceAutoCompleteVal //,  term: extractLast( request.term )
                },
                success: function (data) {
                    //console.log('inside success');
                    response($.ui.autocomplete.filter(
                        data.list, extractLast(request.term)));
                }
            });
            //}
        },
        focus: function () {
            // prevent value inserted on focus
            return false;
        },
        select: function (event, ui) {
            var terms = split(this.value);
            // remove the current input
            terms.pop();
            // add the selected item
            terms.push(ui.item.value);
            // add placeholder to get the comma-and-space at the end
            // terms.push("");
            this.value = terms.join(" ");
            return false;
        }
    });

/*---------------- Auto Complete Code Start End -------------------------*/