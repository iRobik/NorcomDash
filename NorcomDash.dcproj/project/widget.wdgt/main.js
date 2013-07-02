// globals
var updateTimer;
var xmlHttp = null;
var updateInterval = 60*1000;
var preferenceKey = "norcomAccountNumber";

// set true to enable debug output
var debug = true;

//-------------------------------------------------//
function log(message)
{
    if (debug)
    {
        alert(message);
    }
}

//-------------------------------------------------//
function setAlias(AliasName)
{
    document.getElementById("AliasCaption").innerText = AliasName;
}

function setAccountBalance(AccountBalance)
{
    document.getElementById("AccountBalanceValue").innerText = AccountBalance;
}

function setTimeLastUpdate(TimeLastUpdate)
{
    document.getElementById("TimeLastUpdateValue").innerText = TimeLastUpdate;
}

//-------------------------------------------------//
function getPhoneIdent()
{
    return document.getElementById("PhoneIdentInput").checked;
}

function setPhoneIdent(check)
{
    document.getElementById("PhoneIdentInput").checked = check;
}

//-------------------------------------------------//
function AliasName()
{
    return document.getElementById("AliasEdit").value;
}

function setAliasName(AliasName)
{
    document.getElementById("AliasEdit").value = AliasName;
}

//-------------------------------------------------//
function AccountNumber()
{
    return document.getElementById("AccountNumberEdit").value;
}

function setAccountNumberEdit(number)
{
    document.getElementById("AccountNumberEdit").value = number;
}

//-------------------------------------------------//
function loadPrefs()
{
    var value_account = widget.preferenceForKey(widget.identifier + "-" + preferenceKey + "-account");
    var value_alias = widget.preferenceForKey(widget.identifier + "-" + preferenceKey + "-alias");
    var value_phone = widget.preferenceForKey(widget.identifier + "-" + preferenceKey + "-phone");
    if (value_account != null)
        setAccountNumberEdit(value_account);
    if (value_alias != null)    
        setAliasName(value_alias);
    if (value_phone != null)    
        setPhoneIdent(value_phone);
}

function savePrefs()
{
    widget.setPreferenceForKey(AccountNumber(), widget.identifier + "-" + preferenceKey + "-account");
    widget.setPreferenceForKey(AliasName(), widget.identifier + "-" + preferenceKey + "-alias");
    widget.setPreferenceForKey(getPhoneIdent(), widget.identifier + "-" + preferenceKey + "-phone");
}

//-------------------------------------------------//
function resetStats()
{
    setAlias("Введите номер счета");
    setAccountBalance("нет данных");
    setTimeLastUpdate("...нет данных");
}

function execStatsRequest()
{
    if (AccountNumber().length > 0)
    {
        var Url = "http://www.norcom.ru?act=block_request&block=balance&account=" + AccountNumber();
        
        
        
        if (document.getElementById("PhoneIdentInput").checked)
        { 
            Url += "&phone=1";
        }
        
        log(Url);

        xmlHttp = new XMLHttpRequest(); 
        xmlHttp.onreadystatechange = processStatsRequest;
        xmlHttp.open("GET", Url, true);
        xmlHttp.send();
    }
    else
    {
        resetStats();
    }
}


function processStatsRequest() 
{
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
    {

        var text = xmlHttp.responseText;
        
        text = text.replace('<script type="text/javascript">','').replace("$('#balance_info').hide();",'').replace("$('#balance_buttons').show();",'').replace('</script>','').replace('alert("','').replace('");','').replace(/\n/g,'').replace(/\s\s+/g,'');
        
        var arrayValues = text.split("\\n");
        
        if (arrayValues.length>1)
        {
            var valueBalance = arrayValues[1];
            var valueTimeLastUpdate = arrayValues[2];
        
            log(valueBalance);
            log(valueTimeLastUpdate);        
        
            if (AliasName() != "") setAlias(AliasName());
            else setAlias(AccountNumber());
            setAccountBalance(valueBalance.substring(8));
            setTimeLastUpdate(valueTimeLastUpdate.substring(13)); 
        } 
        else 
        {
            resetStats();
            setAlias(arrayValues[0]);
        }
    }
}




//-------------------------------------------------//
function startTimer(msec)
{
    updateTimer = setTimeout("updateStats()", msec);
}

function stopTimer()
{
    clearTimeout(updateTimer);
}

function updateStats()
{
    var online = window.navigator.onLine;
    if (online)
    {
        execStatsRequest();
    }
    startTimer(updateInterval);
}

function load()
{
    dashcode.setupParts();
    resetStats();
    loadPrefs();
}


function remove()
{
    stopTimer();
    savePrefs();
}

function hide()
{
    stopTimer();
    savePrefs();
}

function show()
{
    loadPrefs();
    startTimer(50);
}

//-------------------------------------------------//

function sync()
{
    loadPrefs();
}

function showBack(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

function showFront(event)
{
    execStatsRequest();
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}
