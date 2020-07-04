

var _arr = []; // global array to store the clipboard contents 
var _olderClip = -1; // id of older clip static 
var _nextId = -1; // id of next clip static
const CLIPBOARDSIZE = 5; // number of clips you want to save.
var _auth = null;
var _maxId = 0;
var _public = 0;
var _private = 0;
var _tabval = 1;
/*////////////////////////////////////////////////////////////////
Autoexpand Div
Applied globally on all textareas with the "autoExpand" class
////////////////////////////////////////////////////////////////*/
$(document)
    .one('focus.autoExpand', 'textarea.autoExpand', function () {
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.autoExpand', 'textarea.autoExpand', function () {
        var minRows = this.getAttribute('data-min-rows') | 0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 16);
        this.rows = minRows + rows;
    });


if (typeof (Clipboard) === "undefined") {
    Clipboard = {};
}
/**
 * Clipboard.Style used to handled html style manipulation and adding extra elements.
 * 
 */
Clipboard.Style = function () {
    /**
     * shows boot-strap alert and disappears after 1 second
     * @param {string} classname = boot-strap alert class name ex: alert-danger,alert-warning
     * @param {string} message  = alert message
     */
    var showGenricAlert = function (classname, message) {
        $(".alert").html(message);
        $(".alert").removeClass("alert-peek").addClass(classname);
        setTimeout(function () { $(".alert").addClass("alert-peek").removeClass(classname); }, 1000);
    };
    /**
     * 
     * @param {dom element} el = resizes the textarea based on the content in it
     */
    var resizeTextarea = function (el) {
        jQuery(el).css('height', 'auto').css('height', el.scrollHeight + offset);
    };
    /**
     * adds a new clipboard content element
     * @param {string} clipboard
     * @param {string} title 
     * @param {timestamp} time 
     * @param {string/int} id 
     * @param {string} htmlid 
     */
    var addClipboard = function (clipboard, title, time, id, user, cardtype, htmlid) {
        var rows = clipboard.split(/\r\n|\r|\n/).length;
        var type = user == 'ALL' ? 'public-card' : 'private-card';
        var ts = new Date(time);
        var fileName = clipboard.split("/").pop().split("?")[0];
        var delText = cardtype == 2 ? fileName : null;
        var visibility = user == 'ALL' ? `<i class="fas fa-lock-open"></i>` : `<i class="fas fa-lock"></i>`;
        var color = user == 'ALL' ? "unlocked" : "locked"
        var temp = clipboard.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var hide = cardtype == 2 ? "hide" : "";
        temp = cardtype == 1 ? temp : `<a href='` + temp + `' target="_blank"><img src="` + temp + `" alt="Smiley face" width="250" height="auto"></a>`;
        var clip = `<div class="card-body ` + type + ` " id="card-` + id + `">
        <div class='`+ color + ` float-right'><small>` + visibility + `</small></div>
        <div class="time">`+ title + `</div>
        <textarea id="clipboard-`+ id + `" class="autoExpand card-text clip-content disabledtxtarea" rows='20' data-min-rows='2' readonly>` + clipboard + `</textarea>
        <div id="div-`+ id + `" class="autoExpand card-text clip-content div-clip">` + temp + `</div>
        <div class="clip-options" id="options-`+ id + `" >
          <span class="options"><button class="btn clip-op trash" data-toggle="tooltip" data-placement="top" title="Delete" onclick=" Clipboard.Events.Delete(`+ id + `,'` + delText + `')"><i class="far fa-trash-alt"></i></button></span>
          <span class="options"><button class="btn clip-op copy `+ hide + `" data-toggle="tooltip" data-placement="top" title="Copy" onclick=" Clipboard.Events.Copy(` + id + `)"><i class="far fa-copy"></i></button></span>
          <span class="options"><button class="btn clip-op edit `+ hide + `" data-toggle="tooltip" data-placement="top" title="Edit" onclick=" Clipboard.Events.Edit(` + id + `)"><i class="far fa-edit"></i></button></span>
          <span class="options"><button class="btn clip-op update hide" data-toggle="tooltip" data-placement="top" title="Save" onclick=" Clipboard.Events.Update(`+ id + `)"><i class="far fa-save"></i></button></span>
          </div>
          <div class="time">`+ ts.toLocaleString() + `</div> <br/>
      </div>
      <hr/>`;
        $(htmlid).prepend(clip);
    };
    /**
     * Clears all the clips (Used if not logged in)
     */
    var removeAllClips = function () {
        fillBar();
        $("#clipboard").empty();
    };
    /**
     * copies the content of the clip to computers clipboard based on the id of the html clip
     * @param {string} id 
     */
    var copyText = function (id) {
        $(id).removeClass("disabledtxtarea");
        $(id).attr('readonly', false);
        $(id).focus();
        $(id).select();
        document.execCommand('copy');
        $(id).attr('readonly', true);
        $(id).addClass("disabledtxtarea");
        $("#replicator").select();
    };
    /** 
     * used to fill the progress bar to show how many more clips can exists, after which the oldest clip is replaced. (Default 5)
    */
    var fillBar = function () {
        var progress = "#progress";
        var percent = (_public / CLIPBOARDSIZE) * 100;
        var percentage = percent + "%";
        var text = _public + " of " + CLIPBOARDSIZE;
        $(progress).text(text);
        if (percent < 25) {
            removeBarclasses();
            $(progress).addClass("bg-success").css("width", percentage).attr("aria-valuenow", percent);
        }
        else if (percent >= 25 && percent < 50) {
            removeBarclasses();
            $(progress).addClass("bg-primary").css("width", percentage).attr("aria-valuenow", percent);
        }
        else if (percent >= 50 && percent < 75) {
            removeBarclasses();
            $(progress).addClass("bg-warning").css("width", percentage).attr("aria-valuenow", percent);
        }
        else if (percent >= 75) {
            removeBarclasses();
            $(progress).addClass("bg-danger").css("width", percentage).attr("aria-valuenow", percent);
        }
        progress = "#progress1";
        percent = (_private / CLIPBOARDSIZE) * 100;
        percentage = percent + "%";
        text = _private + " of " + CLIPBOARDSIZE;
        $(progress).text(text);
        if (percent < 25) {
            removeBarclasses();
            $(progress).addClass("bg-success").css("width", percentage).attr("aria-valuenow", percent);
        }
        else if (percent >= 25 && percent < 50) {
            removeBarclasses();
            $(progress).addClass("bg-primary").css("width", percentage).attr("aria-valuenow", percent);
        }
        else if (percent >= 50 && percent < 75) {
            removeBarclasses();
            $(progress).addClass("bg-warning").css("width", percentage).attr("aria-valuenow", percent);
        }
        else if (percent >= 75) {
            removeBarclasses();
            $(progress).addClass("bg-danger").css("width", percentage).attr("aria-valuenow", percent);
        }
    };
    /**
     * style function to remove all the bootstrap classes of progress bar to refresh the progress bar 
     */
    var removeBarclasses = function () {
        $("#progress").removeClass("bg-info").removeClass("bg-success").removeClass("bg-danger").removeClass("bg-primary").removeClass("bg-warning");
    };
    /**
     * Opens the login modal
     */
    var openLoginModal = function () {
        $('#logout').hide();
        if (!$('#loginModal').hasClass('in')) {
            $('#loginModal').modal({ backdrop: 'static', keyboard: false });
        }

    };
    /**
     * Closes the login modal
     */
    var closeLoginModal = function () {
        $('#loginModal').modal('hide');
    };

    var showPublic = function () {
        $('.private-card').addClass('hide');
        $('.public-card').removeClass('hide');
        $('#progress-bar1').addClass('hide');
        $('#progress-bar').removeClass('hide');
    };
    var showPrivate = function () {
        $('.private-card').removeClass('hide');
        $('.public-card').addClass('hide');
        $('#progress-bar1').removeClass('hide');
        $('#progress-bar').addClass('hide');
    };
    var showAll = function () {
        $('.private-card').removeClass('hide');
        $('.public-card').removeClass('hide');
        $('#progress-bar').removeClass('hide');
        $('#progress-bar1').removeClass('hide');
    };
    return {
        showGenricAlert: showGenricAlert,
        addClipboard: addClipboard,
        copyText: copyText,
        fillBar: fillBar,
        removeAllClips: removeAllClips,
        openLoginModal: openLoginModal,
        closeLoginModal: closeLoginModal,
        showPublic: showPublic,
        showPrivate: showPrivate,
        showAll: showAll
    };
}();
/**
 * Clipboard Events contains group of functions which are specific for this apps specific events
 * like copy,add,delete,edit clips and other functions help the main events to happen
 */
Clipboard.Events = function () {

    var Login = function () {
        var emailId = $("#emailid").val();
        var password = $("#password").val();
        Clipboard.FireBase.authenticate(emailId, password);
        $("#emailid").val('');
        $("#password").val('');
    };
    var Register = function () {
        var emailId = $("#emailid").val();
        var password = $("#password").val();
        var resEmail = ValidateEmail();
        var resPass = ValidatePassword();
        if (resEmail && resPass)
            Clipboard.FireBase.registeruser(emailId, password);
    };
    var ValidateEmail = function () {
        var emailId = $("#emailid").val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!regex.test(emailId)) {
            $('.email-match').removeClass('hide');
            return false;
        }
        else {
            $('.email-match').addClass('hide');
            return true;
        }
    };
    var ValidatePassword = function () {
        var password = $("#password").val();
        var repassword = $("#repassword").val();

        if (password !== repassword) {
            $('.pass-match').removeClass('hide');
            return false;
        }
        else {
            $('.pass-match').addClass('hide');
            if (password.length < 6) {
                $('.pass-len').removeClass('hide');
                return false;
            }
            $('.pass-len').addClass('hide');
            return true;
        }
    };
    var RegisterClick = function () {
        $('.registerPane').removeClass('hide');
        $('.loginPane').addClass('hide');
        $('#modalLabel').text("Register Page");
        $('.email-match').addClass('hide');
        $('.pass-match').addClass('hide');
        $('.pass-len').addClass('hide');
    };
    var RegisterBack = function () {
        $('.registerPane').addClass('hide');
        $('.loginPane').removeClass('hide');
        $('#modalLabel').text("Login Page");
        $('.email-match').addClass('hide');
        $('.pass-match').addClass('hide');
        $('.pass-len').addClass('hide');
    };
    /**
     * removes the clip from firebase based on the id of the element
     * @param {string} id 
     */
    var Delete = function (id, url) {
        Clipboard.FireBase.deleteFromFireBase(id);
        if (url === 'null')
            Clipboard.Style.showGenricAlert("alert-danger", "Deleted Succesfully.");
        else
            Clipboard.FireBase.deleteFile(url);
    };
    /**
     * makes the div content editable, making the clip content editable.
     * @param {string} id 
     */
    var Edit = function (id) {
        var edit = "#options-" + id + " .edit";
        var copy = "#options-" + id + " .copy";
        var del = "#options-" + id + " .trash";
        var update = "#options-" + id + " .update";
        var textarea = "#clipboard-" + id;
        var div = "#div-" + id;
        $(div).attr("contenteditable", "true");
        $(div).focus();
        $(edit).addClass("hide");
        $(copy).addClass("hide");
        $(del).addClass("hide");
        $(update).removeClass("hide");
    };
    /**
     * copies the clip content of the selected div 
     * @param {string} id 
     */
    var Copy = function (id) {
        var textarea = "#clipboard-" + id;
        Clipboard.Style.copyText(textarea);
        Clipboard.Style.showGenricAlert("alert-success", "Text Copied to Clipboard.");
    };
    /**
     * as edit makes the content editable, once edited update is called to update the content in firebase
     * @param {string} id 
     */
    var Update = function (id) {
        var edit = "#options-" + id + " .edit";
        var copy = "#options-" + id + " .copy";
        var del = "#options-" + id + " .trash";
        var update = "#options-" + id + " .update";
        var textarea = "#clipboard-" + id;
        var div = "#div-" + id;
        $(div).addClass("div-clip");
        var text = String($(div).html())
        text = text.replace("<div>", "\n").replace(/<div>/g, "").replace(/<\/div>/g, "\n").replace(/<br>/g, "\n");
        $(div).attr("contenteditable", "false");
        $(edit).removeClass("hide");
        $(copy).removeClass("hide");
        $(del).removeClass("hide");
        $(update).addClass("hide");
        Clipboard.FireBase.updateFireBase(id, text, null);
        Clipboard.Style.showGenricAlert("alert-primary", "Text Updated.");
    };
    /**
     * adds the cards to the page once received from firebase 
     * @param {firebase array} array 
     */
    var AddCard = function (array) {
        array = SortByTime(array);
        if (array.length != 0) {
            array.forEach(element => {
                Clipboard.Style.addClipboard(element.clipboard, element.title, element.time, element.key, element.user, element.type, "#clipboard");
            });
            if ($('#displayoptions').val() == 1) {
                Clipboard.Style.showAll();
            }
            else if ($('#displayoptions').val() == 2) {
                Clipboard.Style.showPrivate();
            }
            else if ($('#displayoptions').val() == 3) {
                Clipboard.Style.showPublic();
            }
        }
    };
    /** 
     * adds the new clip content to firebase and also does a few animation to show the required filed.
    */
    var Add = function () {
        var title = $("#Title").val();
        var clip = $("#Add").val();
        if (title == "") {
            $("#Title").effect("shake");
        }
        if (clip == "") {
            $("#Add").effect("shake");
        }
        if (title != "" && clip != "") {
            NextClipId($("#visibility").text() == 'Private' ? true : false);
            Clipboard.FireBase.writeToFireBase(_nextId, $("#Add").val(), $("#Title").val(), 1, $("#visibility").text() == 'Private' ? true : false);
            $("#Add").val("");
            $("#Title").val("");
            Clipboard.Style.showGenricAlert("alert-info", "Added To Clipboard.");
        }

    };

    var Upload = function () {
        var title = $("#titleFile").val();
        var fileName = $("#fileName").val();
        if (title == "") {
            $("#titleFile").effect("shake");
        }
        if (fileName == "") {
            $("#fileName").effect("shake");
        }
        if (title != "" && fileName != "") {
            Clipboard.FireBase.uploadFile(title);
        }
    };
    /**
     * get the oldest clips id
     */
    var OldestClip = function () {
        _olderClip = _arr[0];
        _arr.forEach(element => {
            if (_olderClip.time > element.time) {
                _olderClip = element;
            }
        });
    };
    /** sorts the cipboards based on the id desc*/
    var SordById = function () {
        var orderedarr = _arr.slice();
        orderedarr = orderedarr.sort(function (a, b) {
            return a.key > b.key;
        });
        return orderedarr;
    };
    /** sorts the cipboards based on timestamp desc */
    var SortByTime = function (array) {
        orderedarr = array.sort(function (a, b) {
            return a.time > b.time;
        });
        return orderedarr;
    };
    /** calculates the nextclip, check if the clipboard is full and if takes the oldest id, else gets the next id or missing id*/
    var NextClipId = function (private) {
        if (private) {
            if (_private >= CLIPBOARDSIZE) {
                OldestClip();
                _nextId = _olderClip.key;
                return;
            }
            _nextId = _maxId + 1;
        }
        else {
            if (_public >= CLIPBOARDSIZE) {
                OldestClip();
                _nextId = _olderClip.key;
                return;
            }
            _nextId = _maxId + 1;
        }
    };
    /**
     * 
     * @param {string} sParam 
     */
    var GetQueryStringParams = function (sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }

    };
    /**
     * finds if the id is present using clipboard firebase snapshot
     * @param {string} id 
     */
    var findId = function (id) {
        var res = null;
        id = parseInt(id);
        Clipboard.FireBase.getSnapshot();
        _arr.forEach(element => {
            if (element.key == id) {
                res = element;

            }
        });
        return res;
    };
    return {
        Login: Login,
        Delete: Delete,
        Edit: Edit,
        Copy: Copy,
        Update: Update,
        AddCard: AddCard,
        Add: Add,
        OldestClip: OldestClip,
        SordById: SordById,
        NextClipId: NextClipId,
        GetQueryStringParams: GetQueryStringParams,
        findId: findId,
        RegisterClick: RegisterClick,
        RegisterBack: RegisterBack,
        Register: Register,
        ValidateEmail: ValidateEmail,
        ValidatePassword: ValidatePassword,
        Upload: Upload
    };
}();
/**
 * Clipboard.FireBase consists of all the firebased direct functionalities. Ex: conect,add,delete,update and get
 */
Clipboard.FireBase = function () {
    /** initializes the firebase  */
    var initialize = function () {
        var config = {
            apiKey: "AIzaSyAyPo6J5KAweSH4cewqAcXZM2VD0Q4jKpM",
            authDomain: "clipboard-18cfa.firebaseapp.com",
            databaseURL: "https://clipboard-18cfa.firebaseio.com",
            projectId: "clipboard-18cfa",
            storageBucket: "clipboard-18cfa.appspot.com",
            messagingSenderId: "163705736522"
        };
        firebase.initializeApp(config);
    };
    /**
    * Authenticate the user
    * @param {string} username 
    * @param {string} password 
    */
    var authenticate = function (username, password) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function () {
            firebase.auth().signInWithEmailAndPassword(username, password).then(function (authData) {
                _auth = authData;
                Clipboard.Style.closeLoginModal();
                $('#logout').show();
                Clipboard.Style.showGenricAlert("alert-success", "Login successful.");
            }).catch(function (error) {
                if (username != "**" && password != "**") {
                    Clipboard.Style.openLoginModal();
                    _auth = null;
                    _arr = [];
                    Clipboard.Style.removeAllClips();
                    $('#logout').hide();
                    Clipboard.Style.showGenricAlert("alert-danger", "Login failed.");
                }
            });
            firebase.auth().onAuthStateChanged(function (user) {
                AuthStateChanged(user);
            });
        });
    };
    var registeruser = function (username, password) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function () {
            firebase.auth().createUserWithEmailAndPassword(username, password).then(function (authData) {
                _auth = authData;
                Clipboard.Style.closeLoginModal();
                $('#logout').show();
                Clipboard.Style.showGenricAlert("alert-success", "Login successful.");
            }).catch(function (error) {
                console.log(error);
                if (username != "**" && password != "**") {
                    Clipboard.Style.openLoginModal();
                    _auth = null;
                    _arr = [];
                    Clipboard.Style.removeAllClips();
                    $('#logout').hide();
                    Clipboard.Style.showGenricAlert("alert-danger", "Login failed.");
                }
            });
            firebase.auth().onAuthStateChanged(function (user) {
                AuthStateChanged(user);
            });
        });
    };
    /**
     * adds the clipboard content to firebase
     * @param {string/int} id 
     * @param {string} clipboard 
     * @param {string} title 
     * @param {int} type 
     */
    var writeToFireBase = function (id, clipboard, title, type, private) {
        var user = 'ALL';
        if (private && _auth != null) {
            user = _auth.uid;
        }
        if (_auth != null) {
            firebase.database().ref('clipboard/' + id).set({
                clipboard: clipboard,
                type: type,
                title: title,
                time: $.now(),
                user: user
            }, function (error) {
                if (error) {
                    console.log(error);
                } else {
                    // Data saved successfully!
                }
            });
        }
        else {
            Clipboard.Style.openLoginModal();
        }
    };
    var AuthStateChanged = function (user) {
        if (user) {
            _auth = user;
            Clipboard.Style.closeLoginModal();
            readFromFireBase();
        }
        else {
            _arr = [];
            Clipboard.Style.removeAllClips();
            Clipboard.Style.openLoginModal();
            _auth = null;
        }
    };
    var logout = function () {
        $('#logout').hide();
        firebase.auth().signOut();
        Clipboard.Style.openLoginModal();
        _auth = null;
        _arr = [];
        Clipboard.Style.removeAllClips();
    };
    /**
     * gets all the clips from firebase and subscribes to the data, and thus stays in sync without refresh
     */
    var readFromFireBase = function () {
        if (_auth != null) {
            var clipInfo = firebase.database().ref('clipboard/');
            clipInfo.on('value', function (snapshot) {
                $("#clipboard").empty();
                _arr = snapshotToArray(snapshot);
                Clipboard.Events.OldestClip();
                Clipboard.Style.fillBar();
                Clipboard.Events.AddCard(snapshotToArray(snapshot));
            });
        }
        else {
            Clipboard.Style.openLoginModal();
        }
    };
    /**
     * deletes the clip from firebase with id
     * @param {string} id 
     */
    var deleteFromFireBase = function (id) {
        if (_auth != null) {
            var clipInfo = firebase.database().ref('clipboard/' + id);
            clipInfo.remove();
        }
        else {
            Clipboard.Style.openLoginModal();
        }
    };
    /**
     * updates the clip in firebase
     * @param {string} id 
     * @param {string} clipboard 
     * @param {int} type 
     */
    var updateFireBase = function (id, clipboard, type) {
        if (_auth != null) {
            var clip = {};
            if (clipboard !== null)
                clip.clipboard = clipboard;
            if (type !== null)
                clip.type = type;
            clip.time = $.now();
            var clipInfo = firebase.database().ref('clipboard/' + id).update(
                clip
            )
        }
        else {
            Clipboard.Style.openLoginModal();
        }
    };
    var uploadFile = function (title) {
        const ref = firebase.storage().ref();
        const file = document.querySelector('#fileUpload').files[0];
        const name = (+new Date()) + '-' + file.name.replace(/\?/g, '');
        const metadata = {
            contentType: file.type
        };
        const task = ref.child(name).put(file, metadata);
        task
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then((url) => {
                Clipboard.Events.NextClipId($("#visibility").text() == 'Private' ? true : false);
                Clipboard.FireBase.writeToFireBase(_nextId, url, title, 2, $("#visibility").text() == 'Private' ? true : false);
                $("#titleFile").val("");
                $("#fileName").val("");
                Clipboard.Style.showGenricAlert("alert-info", "Added To Clipboard.");
            })
            .catch(console.error);
    };
    var deleteFile = function (filename) {
        const ref = firebase.storage().ref();
        var delRef = ref.child(filename);
        delRef.delete().then(function () {
            Clipboard.Style.showGenricAlert("alert-danger", "Deleted Succesfully.");
        }).catch(function (error) {
            console.log(error);
        });
    };
    /** get the snapshot and does not subscribe to the data*/
    var getSnapshot = function () {
        if (_auth != null) {
            var clipInfo = firebase.database().ref('clipboard/');
            clipInfo.once('value').then(function (snapshot) {
                _arr = snapshotToArray(snapshot);
                var res = Clipboard.Events.findId(Clipboard.Events.GetQueryStringParams("id"));
            });
        }
        else {
            Clipboard.Style.openLoginModal();
        }
    };
    /**
     * converts snapshot to array
     * @param {string} snapshot 
     */
    var snapshotToArray = function (snapshot) {
        var returnArr = [];
        _maxId = 0;
        _public = 0;
        _private = 0;
        snapshot.forEach(function (childSnapshot) {
            var item = childSnapshot.val();
            item.key = childSnapshot.key;

            if (_maxId < item.key)
                _maxId = parseInt(item.key);
            if (item.user == 'ALL') {
                _public++;
                returnArr.push(item);
            }
            else if (item.user == _auth.uid) {
                _private++;
                returnArr.push(item);
            }
        });
        return returnArr;
    };
    return {
        writeToFireBase: writeToFireBase,
        initialize: initialize,
        logout: logout,
        authenticate: authenticate,
        readFromFireBase: readFromFireBase,
        deleteFromFireBase: deleteFromFireBase,
        updateFireBase: updateFireBase,
        getSnapshot: getSnapshot,
        registeruser: registeruser,
        uploadFile: uploadFile,
        deleteFile: deleteFile
    };
}();
/** tooltip settings */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
/** Onload initialises the firebase and gets all the  clips from firebases and prints it on to the pages (subsribes) */
$(document).ready(function () {
    Clipboard.FireBase.initialize();
    Clipboard.FireBase.authenticate("**", "**");
    $("#btn1").click(function () {
        if (_tabval == 1)
            Clipboard.Events.Add();
        else if (_tabval == 2)
            Clipboard.Events.Upload();
    });
    $("#loginForm").click(function () {
        Clipboard.Events.Login();
    });
    $("#logout").click(function () {
        Clipboard.FireBase.logout();
    });
    $("#registerForm").click(function () {
        Clipboard.Events.RegisterClick();
    });
    $("#registerCancel").click(function () {
        Clipboard.Events.RegisterBack();
    });

    $("#registerSubmit").click(function () {
        Clipboard.Events.Register();
    });
    $('#loginModal').keypress(function (event) {
        if (event.keyCode == 13) {
            if ($('.registerPane').hasClass('hide')) {
                Clipboard.Events.Login();
            }
            else {
                Clipboard.Events.Register();
            }
        }
    });
    $("#private").click(function () {
        $("#visibility").text('Private');
    });
    $("#public").click(function () {
        $("#visibility").text('Public');
    });
    $('#displayoptions').on('change', function () {
        if (this.value == 1) {
            Clipboard.Style.showAll();
        }
        else if (this.value == 2) {
            Clipboard.Style.showPrivate();
        }
        else if (this.value == 3) {
            Clipboard.Style.showPublic();
        }
    });
    $('#fileFake').on("click", function () {
        $('#fileUpload').trigger('click');
    });
    $('#fileUpload').on("change", function () {
        var file = this.files[0];
        var fileType = file["type"];
        var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
        if ($.inArray(fileType, ValidImageTypes) < 0) {
            Clipboard.Style.showGenricAlert("alert-danger", "Only Images are Allowed.");
        }
        else
        $("#fileName").val($("#fileUpload").val());
    });
    $('.nav a.nav-link').on('click', function () {
        if ($(this).attr('href') == "#profile") {
            _tabval = 2;
        }
        else if ($(this).attr('href') == "#home") {
            _tabval = 1;
            $("#fileName").val("");
        }
    });
});