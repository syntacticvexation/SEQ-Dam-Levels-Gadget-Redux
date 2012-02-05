SEQWater.widget = SEQWater.BROWSER_MODE ? getFakeWidget() : getRealWidget();
SEQWater.dataManager = SEQWater.BROWSER_MODE ? getFakeDataManager() : getXmlDataManager();

function getDamInfo() {
	// If the program has previously run then the data will be already persisted. Use
	// that data so that it may be displayed instantly on the screen as there may
	// be no internet connection at the moment.
	var doc = SEQWater.dataManager.load();

	// Extract the info from the xml and create javascript Dam objects.
	if (doc != null)
	{
		return ExtractDamObjectsFromDataSource(doc);
	}
}

// Program entry point
function Init()
{
	SEQWater.widget.setBackground();
	$("#WaitDiv").css('display',"inline");
	
	
	var dams = getDamInfo();
	if (dams) {
		// Display the dam info to the browser
		RenderDams(dams);
		$("#WaitDiv").hide();
	}

	var initialTab = SEQWater.widget.getInitialTab();
	ShowTab(initialTab);
	
	// Start the periodic ajax calling
	PerformAjaxCall(SEQWater.dataManager); 
}

SEQWater.widget.init();

function setTabImage(tabId, image) {
	var element = $("#" + tabId + "Img");
	element.attr('src', image);
}

function hideTabs() {
	var tabs = ['Graph', 'Rain', 'Delta', 'Remaining', 'Info'];
	for (var i in tabs) {
		var t = tabs[i];
		var tab = $("#" + t + "Div");
		$("#" + t + "Div").hide();
		setTabImage(t, 'Images/' + t + 'Back.png');
	}	
}

// Called when a tab changes
function ShowTab(tab)
{	
	hideTabs();

	$('#' + tab + "Div").css('display',"inline");
	setTabImage(tab, "images/" + tab + ".png");

	SEQWater.widget.writeTab(tab);

	// Only show the remaining litres count down 
	if (tab == "Remaining")
		SEQWater.timer = setTimeout("UpdateRemaining();", 100);
	else
		clearTimeout(SEQWater.timer);
}

// Update water remaining in real time - but only when that tab is displayed.
function UpdateRemaining()
{
	if (SEQWater.total != null)
	{
		var currentTime = new Date().getTime();

		var totalRemaining = (SEQWater.total.stored * 1000000) - (((currentTime - SEQWater.lastUpdated) / (1000 * 60 * 60 * 24)) * SEQWater.rateOfConsumption);

		$("#Remaining").text(AddSeps(totalRemaining.toFixed(0)));
	}
	SEQWater.timer = setTimeout("UpdateRemaining();", 100);
}


// Add commas to a large number
function AddSeps(x) 
{
	//make x a new variable
	var x=x;

	//make x a string
	x+="";

	//or x=String(x);
	//iLen is the number of digits before any decimal poin
	// for 45.123, iLen is 2
	//iLen is the length of the number, if no decimals
	iLen=x.length;
	pos=x.indexOf(".");

	if (pos>-1) //there are decimals
	{
		iLen=pos;
	}

	//add the decimal point
	temp="";

	//add the decimal part to begin
	// with 45.123, we add the .123
	temp=x.substring(iLen,x.length);

	//iLen-1 is the rightmost non-decimal digit (5 in 98745.123)
	for (var i=iLen-1;i>=0;i--)
		//we add a separator when the expression (iLen-i-1)%3==0 is true...
		//except when i is (iLen-1), or the first digit
		//eg (98745.12). i is iLen-1, and the digit pos is next the decimal, 
		//it is 5. From here, we decrement i...iLen-2, iLen-3, iLen-4 ... when i is a multiple of
		//3, (i=iLen-iLen+4-1). This point is just before the number 7
		if ((iLen-i-1)%3==0&&i!=iLen-1)
			temp=x.charAt(i)+","+temp;
		else

			temp=x.charAt(i)+temp;
	return temp;

}
